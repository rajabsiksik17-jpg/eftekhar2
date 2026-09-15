"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface Settings {
  site: Record<string, unknown>;
  contact: Record<string, unknown> | null;
  footer: Record<string, unknown> | null;
}

export function SiteSettingsForm() {
  const [data, setData] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => setData(j.data));
  }, []);

  if (!data) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  const setSite = (key: string, value: unknown) =>
    setData((d) => d && { ...d, site: { ...d.site, [key]: value } });
  const setContact = (key: string, value: unknown) =>
    setData((d) => d && { ...d, contact: { ...(d.contact ?? {}), [key]: value } });
  const setFooter = (key: string, value: unknown) =>
    setData((d) => d && { ...d, footer: { ...(d.footer ?? {}), [key]: value } });

  const header = (data.site.header ?? {}) as Record<string, unknown>;
  const setHeader = (key: string, value: unknown) => setSite("header", { ...header, [key]: value });
  const floating = (data.site.floating ?? {}) as Record<string, unknown>;
  const setFloating = (key: string, value: unknown) => setSite("floating", { ...floating, [key]: value });
  const appointment = (data.site.appointment ?? {}) as Record<string, unknown>;
  const setAppt = (key: string, value: unknown) => setSite("appointment", { ...appointment, [key]: value });
  const appearance = (data.site.appearance ?? {}) as Record<string, unknown>;
  const setAppearance = (key: string, value: unknown) => setSite("appearance", { ...appearance, [key]: value });
  const analytics = (data.site.analytics ?? {}) as Record<string, unknown>;
  const setAnalytics = (key: string, value: unknown) => setSite("analytics", { ...analytics, [key]: value });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم حفظ الإعدادات");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const s = (v: unknown) => String(v ?? "");

  return (
    <div className="space-y-6">
      <Section title="معلومات الموقع">
        <Grid>
          <Field label="اسم الموقع (عربي)"><input className="input" value={s(data.site.site_name_ar)} onChange={(e) => setSite("site_name_ar", e.target.value)} /></Field>
          <Field label="اسم الموقع (إنجليزي)"><input className="input" dir="ltr" value={s(data.site.site_name_en)} onChange={(e) => setSite("site_name_en", e.target.value)} /></Field>
          <Field label="الشعار (URL)"><input className="input" dir="ltr" value={s(data.site.logo_url)} onChange={(e) => setSite("logo_url", e.target.value)} /></Field>
          <Field label="العنوان الرئيسي (عربي)"><input className="input" value={s(data.site.tagline_ar)} onChange={(e) => setSite("tagline_ar", e.target.value)} /></Field>
          <Field label="العنوان الرئيسي (إنجليزي)"><input className="input" dir="ltr" value={s(data.site.tagline_en)} onChange={(e) => setSite("tagline_en", e.target.value)} /></Field>
        </Grid>
      </Section>

      <Section title="الهيدر">
        <Grid>
          <Field label="نص الزر (عربي)"><input className="input" value={s(header.cta_text_ar)} onChange={(e) => setHeader("cta_text_ar", e.target.value)} /></Field>
          <Field label="نص الزر (إنجليزي)"><input className="input" dir="ltr" value={s(header.cta_text_en)} onChange={(e) => setHeader("cta_text_en", e.target.value)} /></Field>
          <Field label="رابط الزر"><input className="input" dir="ltr" value={s(header.cta_url)} onChange={(e) => setHeader("cta_url", e.target.value)} /></Field>
          <Toggle label="تثبيت الهيدر" checked={Boolean(header.sticky)} onChange={(v) => setHeader("sticky", v)} />
          <Toggle label="عرض الهاتف" checked={Boolean(header.show_phone)} onChange={(v) => setHeader("show_phone", v)} />
          <Toggle label="قائمة الخدمات تلقائيًا" checked={Boolean(header.auto_services_dropdown)} onChange={(v) => setHeader("auto_services_dropdown", v)} />
        </Grid>
      </Section>

      <Section title="الأزرار العائمة">
        <Grid>
          <Field label="نص زر الموعد (عربي)"><input className="input" value={s(floating.appointment_text_ar)} onChange={(e) => setFloating("appointment_text_ar", e.target.value)} /></Field>
          <Field label="نص زر الموعد (إنجليزي)"><input className="input" dir="ltr" value={s(floating.appointment_text_en)} onChange={(e) => setFloating("appointment_text_en", e.target.value)} /></Field>
          <Toggle label="قائمة التواصل الاجتماعي" checked={Boolean(floating.social_enabled)} onChange={(v) => setFloating("social_enabled", v)} />
          <Toggle label="زر حجز الموعد" checked={Boolean(floating.appointment_enabled)} onChange={(v) => setFloating("appointment_enabled", v)} />
          <Toggle label="زر العودة للأعلى" checked={Boolean(floating.back_to_top_enabled)} onChange={(v) => setFloating("back_to_top_enabled", v)} />
        </Grid>
      </Section>

      <Section title="حجز الموعد">
        <Grid>
          <Field label="البلد الافتراضي"><input className="input" dir="ltr" value={s(appointment.default_country)} onChange={(e) => setAppt("default_country", e.target.value)} /></Field>
          <Toggle label="تفعيل الموافقة" checked={Boolean(appointment.enable_consent)} onChange={(v) => setAppt("enable_consent", v)} />
          <Field label="نص الموافقة (عربي)"><input className="input" value={s(appointment.consent_text_ar)} onChange={(e) => setAppt("consent_text_ar", e.target.value)} /></Field>
          <Field label="نص الموافقة (إنجليزي)"><input className="input" dir="ltr" value={s(appointment.consent_text_en)} onChange={(e) => setAppt("consent_text_en", e.target.value)} /></Field>
          <Field label="رسالة النجاح (عربي)"><input className="input" value={s(appointment.success_message_ar)} onChange={(e) => setAppt("success_message_ar", e.target.value)} /></Field>
          <Field label="رسالة النجاح (إنجليزي)"><input className="input" dir="ltr" value={s(appointment.success_message_en)} onChange={(e) => setAppt("success_message_en", e.target.value)} /></Field>
        </Grid>
      </Section>

      <Section title="المظهر / الهوية البصرية">
        <Grid>
          <ColorField label="اللون الأساسي" value={s(appearance.primary)} onChange={(v) => setAppearance("primary", v)} />
          <ColorField label="اللون الثانوي" value={s(appearance.secondary)} onChange={(v) => setAppearance("secondary", v)} />
          <ColorField label="لون التمييز (Accent)" value={s(appearance.accent)} onChange={(v) => setAppearance("accent", v)} />
          <Field label="الأيقونة (Favicon URL)"><input className="input" dir="ltr" value={s(appearance.favicon)} onChange={(e) => setAppearance("favicon", e.target.value)} /></Field>
        </Grid>
      </Section>

      <Section title="Google Analytics">
        <Grid>
          <Toggle label="تفعيل Google Analytics" checked={Boolean(analytics.ga4_enabled)} onChange={(v) => setAnalytics("ga4_enabled", v)} />
          <Field label="Measurement ID"><input className="input" dir="ltr" value={s(analytics.ga4_id)} onChange={(e) => setAnalytics("ga4_id", e.target.value)} placeholder="G-XXXXXXXXXX" /></Field>
        </Grid>
      </Section>

      <Section title="معلومات التواصل">
        <Grid>
          <Field label="الهاتف"><input className="input" dir="ltr" value={s(data.contact?.phone)} onChange={(e) => setContact("phone", e.target.value)} /></Field>
          <Field label="واتساب"><input className="input" dir="ltr" value={s(data.contact?.whatsapp)} onChange={(e) => setContact("whatsapp", e.target.value)} /></Field>
          <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={s(data.contact?.email)} onChange={(e) => setContact("email", e.target.value)} /></Field>
          <Field label="العنوان (عربي)"><input className="input" value={s(data.contact?.address_ar)} onChange={(e) => setContact("address_ar", e.target.value)} /></Field>
          <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={s(data.contact?.address_en)} onChange={(e) => setContact("address_en", e.target.value)} /></Field>
          <Field label="رابط Google Maps"><input className="input" dir="ltr" value={s(data.contact?.google_maps_url)} onChange={(e) => setContact("google_maps_url", e.target.value)} /></Field>
          <Field label="هاتف الطوارئ"><input className="input" dir="ltr" value={s(data.contact?.emergency_phone)} onChange={(e) => setContact("emergency_phone", e.target.value)} /></Field>
          <Field label="هاتف ثانوي"><input className="input" dir="ltr" value={s(data.contact?.secondary_phone)} onChange={(e) => setContact("secondary_phone", e.target.value)} /></Field>
        </Grid>
      </Section>

      <Section title="الفوتر">
        <Grid>
          <Field label="نبذة (عربي)"><textarea className="input min-h-[70px]" value={s(data.footer?.about_ar)} onChange={(e) => setFooter("about_ar", e.target.value)} /></Field>
          <Field label="نبذة (إنجليزي)"><textarea className="input min-h-[70px]" dir="ltr" value={s(data.footer?.about_en)} onChange={(e) => setFooter("about_en", e.target.value)} /></Field>
          <Field label="حقوق النشر (عربي)"><input className="input" value={s(data.footer?.copyright_ar)} onChange={(e) => setFooter("copyright_ar", e.target.value)} /></Field>
          <Field label="حقوق النشر (إنجليزي)"><input className="input" dir="ltr" value={s(data.footer?.copyright_en)} onChange={(e) => setFooter("copyright_en", e.target.value)} /></Field>
        </Grid>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary btn-lg">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          حفظ جميع الإعدادات
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 font-bold text-brand-950">{title}</h2>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-end pb-2">
      <label className="flex items-center gap-3 rounded-xl border border-brand-950/15 px-4 py-2.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
        <span className="text-sm font-medium text-ink-secondary">{label}</span>
      </label>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-brand-950/15 bg-white p-1"
        />
        <input className="input" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
