import { cookies, headers } from "next/headers";
import { createServerClientBound, createServiceClient } from "@/lib/supabase/client";
import { ApiError } from "@/lib/api";
import type { Profile } from "@/lib/types";

const VERIFIED_SESSION_COOKIE = "eftekar_sid";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days max, refreshed on activity

export async function getCurrentAuthUser() {
  const supabase = await createServerClientBound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const service = createServiceClient();
  const { data } = await service
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const service = createServiceClient();
  const { data: roleRows } = await service
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);
  const roleIds = (roleRows ?? []).map((r) => r.role_id as string);
  if (roleIds.length === 0) return [];
  const { data: permRows } = await service
    .from("role_permissions")
    .select("permission_id")
    .in("role_id", roleIds);
  const permIds = (permRows ?? []).map((r) => r.permission_id as string);
  if (permIds.length === 0) return [];
  const { data: perms } = await service
    .from("permissions")
    .select("slug")
    .in("id", permIds);
  return (perms ?? []).map((p) => p.slug as string);
}

async function hasVerifiedSession(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const sid = cookieStore.get(VERIFIED_SESSION_COOKIE)?.value;
  if (!sid) return false;
  const service = createServiceClient();
  const { data } = await service
    .from("sessions")
    .select("*")
    .eq("id", sid)
    .eq("user_id", userId)
    .eq("otp_verified", true)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data) return false;
  const lastActive = new Date(data.last_active_at).getTime();
  if (Date.now() - lastActive > SESSION_TTL_MS) return false;
  // refresh activity
  await service
    .from("sessions")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", sid);
  return true;
}

export interface AdminContext {
  user: { id: string; email: string };
  profile: Profile;
  permissions: string[];
  isSuperAdmin: boolean;
}

/**
 * Full server-side authorization check. Throws ApiError when not allowed.
 */
export async function requireAdmin(permission?: string): Promise<AdminContext> {
  const user = await getCurrentAuthUser();
  if (!user || !user.email) {
    throw new ApiError(401, "unauthenticated", "Authentication required.");
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    throw new ApiError(403, "no_profile", "Admin profile not found.");
  }
  if (!profile.is_active) {
    throw new ApiError(403, "inactive", "Account is inactive.");
  }

  const verified = await hasVerifiedSession(user.id);
  if (!verified) {
    throw new ApiError(401, "otp_required", "OTP verification required.");
  }

  const permissions = await getUserPermissions(user.id);
  const isSuperAdmin = profile.is_super_admin;

  if (permission && !isSuperAdmin && !permissions.includes(permission)) {
    throw new ApiError(403, "forbidden", "You do not have permission to perform this action.");
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
    permissions,
    isSuperAdmin,
  };
}

export async function logAudit(input: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const service = createServiceClient();
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") ?? null;
    await service.from("audit_logs").insert({
      user_id: input.userId ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
      ip,
      user_agent: userAgent,
    });
  } catch {
    // never throw from audit logging
  }
}

export function getVerifiedSessionCookieName() {
  return VERIFIED_SESSION_COOKIE;
}

export function parseUserAgent(ua: string | null | undefined) {
  const value = ua ?? "";
  const browser = /Edg\//.test(value)
    ? "Edge"
    : /Chrome\//.test(value)
      ? "Chrome"
      : /Safari\//.test(value) && !/Chrome/.test(value)
        ? "Safari"
        : /Firefox\//.test(value)
          ? "Firefox"
          : "Other";
  const os = /Windows/.test(value)
    ? "Windows"
    : /Mac OS/.test(value)
      ? "macOS"
      : /Android/.test(value)
        ? "Android"
        : /iPhone|iPad|iOS/.test(value)
          ? "iOS"
          : /Linux/.test(value)
            ? "Linux"
            : "Other";
  const device = /Mobi|Android|iPhone/.test(value) ? "Mobile" : "Desktop";
  return { browser, os, device };
}
