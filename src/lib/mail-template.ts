import { createServiceClient } from "@/lib/supabase/client";

interface SocialLink {
  platform: string;
  url: string | null;
}

function socialIcon(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return "f";
  if (p.includes("instagram")) return "◉";
  if (p.includes("tiktok")) return "♪";
  if (p.includes("youtube")) return "▶";
  if (p.includes("whatsapp")) return "✆";
  if (p.includes("linkedin")) return "in";
  if (p.includes("telegram")) return "✈";
  if (p.includes("snapchat")) return "👻";
  if (p === "x" || p.includes("twitter")) return "𝕏";
  return "•";
}

async function getBranding() {
  const service = createServiceClient();
  const [{ data: settings }, { data: social }, { data: contact }] = await Promise.all([
    service.from("site_settings").select("key, value").in("key", ["site_name_ar", "site_name_en", "logo_url"]),
    service.from("social_links").select("platform, url").eq("is_active", true).order("display_order"),
    service.from("contact_settings").select("phone, email, address_ar").eq("id", 1).single(),
  ]);

  const map: Record<string, string> = {};
  for (const row of settings ?? []) {
    const v = row.value as { text?: string };
    map[row.key] = typeof v?.text === "string" ? v.text : "";
  }
  return {
    siteName: map["site_name_ar"] ?? "عيادات افتخار للخدمات العلاجية",
    siteNameEn: map["site_name_en"] ?? "Eftekar Medical & Therapeutic Clinics",
    logo: map["logo_url"] ?? "",
    social: (social ?? []).filter((s: SocialLink) => s.url) as SocialLink[],
    contact: contact ?? null,
  };
}

export async function wrapEmail(title: string, bodyHtml: string): Promise<string> {
  const b = await getBranding();
  const logoBlock = b.logo
    ? `<img src="${b.logo}" alt="${b.siteName}" style="height:48px;max-width:200px;object-fit:contain;" />`
    : `<span style="font-size:20px;font-weight:700;color:#2563eb;">${b.siteName}</span>`;

  const socialBlock = b.social.length
    ? b.social
        .map(
          (s) =>
            `<a href="${s.url}" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;margin:0 4px;">${socialIcon(s.platform)}</a>`,
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI','Cairo',Tahoma,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:24px 32px;text-align:center;">
            <div style="background:#ffffff;border-radius:12px;padding:10px 16px;display:inline-block;">${logoBlock}</div>
            <div style="color:#ffffff;font-size:13px;margin-top:10px;opacity:0.9;">${b.siteNameEn}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:#1f2937;font-size:15px;line-height:1.8;">
            <h2 style="margin:0 0 16px;color:#1e3a8a;font-size:20px;">${title}</h2>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;text-align:center;color:#64748b;font-size:12px;">
            ${socialBlock ? `<div style="margin-bottom:12px;">${socialBlock}</div>` : ""}
            <div>${b.siteName} — ${b.contact?.phone ?? ""}</div>
            ${b.contact?.email ? `<div dir="ltr">${b.contact.email}</div>` : ""}
            ${b.contact?.address_ar ? `<div>${b.contact.address_ar}</div>` : ""}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
