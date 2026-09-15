import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientBound, createServiceClient } from "@/lib/supabase/client";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";
import { loginSchema, otpVerifySchema } from "@/lib/validation";
import { generateOtp, hashToken, randomToken } from "@/lib/encryption";
import { sendMail } from "@/lib/email";
import {
  getVerifiedSessionCookieName,
  getTrustCookieName,
  parseUserAgent,
  getUserPermissions,
  getProfile,
  logAudit,
  isEmailReady,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
const SESSION_COOKIE = getVerifiedSessionCookieName();
const TRUST_COOKIE = getTrustCookieName();
const OTP_TTL_MS = 10 * 60 * 1000;
const TRUST_TTL_DAYS = 30;

async function handle(action: string, req: NextRequest) {
  if (action === "login") return login(req);
  if (action === "verify-otp") return verifyOtp(req);
  if (action === "logout") return logout();
  if (action === "me") return me();
  if (action === "sessions") return sessions(req);
  throw new ApiError(404, "not_found");
}

async function createVerifiedSession(userId: string, req: NextRequest, trustTokenHash?: string) {
  const service = createServiceClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent") ?? null;
  const uaInfo = parseUserAgent(ua);
  const { data: session } = await service
    .from("sessions")
    .insert({
      user_id: userId,
      ip,
      user_agent: ua,
      device: uaInfo.device,
      browser: uaInfo.browser,
      os: uaInfo.os,
      otp_verified: true,
      trust_token: trustTokenHash ?? null,
    })
    .select()
    .single();
  return session;
}

function verifiedResponse(sessionId: string, trustToken?: string) {
  const res = NextResponse.json({ ok: true, data: { verified: true } });
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  if (trustToken) {
    res.cookies.set(TRUST_COOKIE, trustToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * TRUST_TTL_DAYS,
    });
  }
  return res;
}

async function login(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, "validation_error", "Invalid credentials.");

  const rl = rateLimit(`login-${ip}-${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many attempts. Try again later.");

  const supabase = await createServerClientBound();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await logAudit({ action: "login.failed", metadata: { email: parsed.data.email } });
    throw new ApiError(401, "invalid_credentials", "Invalid email or password.");
  }

  const user = data.user;
  const profile = await getProfile(user.id);
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    await logAudit({ userId: user.id, action: "login.denied_inactive" });
    throw new ApiError(403, "inactive", "Account is inactive.");
  }
  const permissions = await getUserPermissions(user.id);
  if (!profile.is_super_admin && permissions.length === 0) {
    await supabase.auth.signOut();
    await logAudit({ userId: user.id, action: "login.denied_no_role" });
    throw new ApiError(403, "forbidden", "No admin role assigned.");
  }

  const service = createServiceClient();

  // Smart OTP: trusted device (valid trust cookie) OR email not ready -> skip OTP.
  const cookieStore = await cookies();
  const trustCookie = cookieStore.get(TRUST_COOKIE)?.value;
  let trusted = false;
  if (trustCookie) {
    const trustHash = hashToken(trustCookie);
    const { data: trustedSession } = await service
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("trust_token", trustHash)
      .eq("otp_verified", true)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();
    trusted = Boolean(trustedSession);
  }

  const emailReady = await isEmailReady();

  if (trusted || !emailReady) {
    const session = await createVerifiedSession(user.id, req, trusted ? hashToken(trustCookie!) : undefined);
    await logAudit({
      userId: user.id,
      action: trusted ? "login.trusted_device" : "login.otp_bypassed_email_not_ready",
      entity: "session",
      entityId: session?.id as string,
    });
    return verifiedResponse(session!.id as string, trusted ? trustCookie! : undefined);
  }

  // Email is ready and device is not trusted -> require OTP.
  await service.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("user_id", user.id).is("consumed_at", null);

  const otp = generateOtp();
  const codeHash = hashToken(otp);
  await service.from("otp_codes").insert({
    user_id: user.id,
    email: user.email,
    code_hash: codeHash,
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    max_attempts: 5,
  });

  const mail = await sendMail({
    to: user.email!,
    subject: "Your login code - Eftekar Admin",
    html: `<div style="font-family:sans-serif;direction:ltr"><h2>Your verification code</h2><p>Use the following code to complete your login:</p><h1 style="letter-spacing:6px">${otp}</h1><p>The code expires in 10 minutes.</p></div>`,
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });

  if (!mail.ok) {
    await logAudit({ userId: user.id, action: "otp.send_failed", metadata: { error: mail.error } });
    throw new ApiError(502, "otp_send_failed", "Could not send verification email. Please check email settings.");
  }

  await logAudit({ userId: user.id, action: "login.credentials_ok" });
  return jsonOk({ needs_otp: true, email: user.email });
}

async function verifyOtp(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, "validation_error", "Invalid OTP.");

  const supabase = await createServerClientBound();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new ApiError(401, "unauthenticated", "Session expired. Please login again.");

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`otp-${ip}-${user.id}`, 10, 10 * 60 * 1000);
  if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many attempts.");

  const service = createServiceClient();
  const { data: code } = await service
    .from("otp_codes")
    .select("*")
    .eq("user_id", user.id)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!code) throw new ApiError(400, "invalid_otp", "Invalid or expired code.");
  if (new Date(code.expires_at).getTime() < Date.now()) {
    await logAudit({ userId: user.id, action: "otp.expired" });
    throw new ApiError(400, "otp_expired", "Code has expired. Please request a new one.");
  }
  if (code.attempts >= code.max_attempts) {
    await logAudit({ userId: user.id, action: "otp.max_attempts" });
    throw new ApiError(429, "too_many_attempts", "Too many attempts. Please login again.");
  }

  const match = hashToken(parsed.data.otp) === code.code_hash;
  if (!match) {
    await service.from("otp_codes").update({ attempts: code.attempts + 1 }).eq("id", code.id);
    await logAudit({ userId: user.id, action: "otp.invalid" });
    throw new ApiError(400, "invalid_otp", "Invalid code.");
  }

  await service.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", code.id);

  // Generate a trusted-device token so this device is remembered.
  const trustToken = randomToken();
  const trustHash = hashToken(trustToken);
  const session = await createVerifiedSession(user.id, req, trustHash);

  await logAudit({ userId: user.id, action: "login.success", entity: "session", entityId: session?.id as string });

  return verifiedResponse(session!.id as string, trustToken);
}

async function logout() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE)?.value;
  const supabase = await createServerClientBound();
  const { data } = await supabase.auth.getUser();

  if (sid) {
    const service = createServiceClient();
    await service.from("sessions").update({ revoked_at: new Date().toISOString() }).eq("id", sid);
  }
  if (data.user) {
    await logAudit({ userId: data.user.id, action: "logout" });
  }
  await supabase.auth.signOut();

  const res = NextResponse.json({ ok: true, data: { logged_out: true } });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

async function me() {
  const supabase = await createServerClientBound();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new ApiError(401, "unauthenticated");

  const profile = await getProfile(user.id);
  if (!profile || !profile.is_active) throw new ApiError(403, "inactive");

  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE)?.value;
  const service = createServiceClient();
  let verified = false;
  if (sid) {
    const { data: sess } = await service
      .from("sessions")
      .select("id")
      .eq("id", sid)
      .eq("user_id", user.id)
      .eq("otp_verified", true)
      .is("revoked_at", null)
      .maybeSingle();
    verified = Boolean(sess);
  }

  const permissions = await getUserPermissions(user.id);
  return jsonOk({
    verified,
    email: user.email,
    user: {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      is_super_admin: profile.is_super_admin,
    },
    permissions,
  });
}

async function sessions(req: NextRequest) {
  const supabase = await createServerClientBound();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new ApiError(401, "unauthenticated");
  const service = createServiceClient();

  const cookieStore = await cookies();
  const currentSid = cookieStore.get(SESSION_COOKIE)?.value;

  if (req.method === "DELETE") {
    const body = await req.json().catch(() => ({}));
    const all = Boolean(body.all);
    if (all) {
      await service.from("sessions").update({ revoked_at: new Date().toISOString() }).eq("user_id", user.id).is("revoked_at", null);
    } else if (body.id) {
      await service.from("sessions").update({ revoked_at: new Date().toISOString() }).eq("id", body.id).eq("user_id", user.id);
    }
    await logAudit({ userId: user.id, action: all ? "sessions.logout_all" : "session.revoke", entityId: body.id });
    return jsonOk({ ok: true });
  }

  const { data: sessions } = await service
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("login_at", { ascending: false });

  return jsonOk(
    (sessions ?? []).map((s) => ({ ...s, is_current: s.id === currentSid })),
  );
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  try {
    return await handle((await ctx.params).action, req);
  } catch (e) {
    return jsonError(e);
  }
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  try {
    return await handle((await ctx.params).action, req);
  } catch (e) {
    return jsonError(e);
  }
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  try {
    return await handle((await ctx.params).action, req);
  } catch (e) {
    return jsonError(e);
  }
}
