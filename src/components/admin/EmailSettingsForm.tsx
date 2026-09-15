"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, TestTube, Send, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface EmailSettings {
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_encryption?: string;
  smtp_from?: string;
  smtp_enabled?: boolean;
  smtp_status?: string | null;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_encryption?: string;
  imap_enabled?: boolean;
  imap_status?: string | null;
}

export function EmailSettingsForm() {
  const [data, setData] = useState<EmailSettings | null>(null);
  const [smtpPass, setSmtpPass] = useState("");
  const [imapPass, setImapPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<"smtp" | "imap" | "send" | null>(null);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    fetch("/api/admin/email").then((r) => r.json()).then((j) => setData(j.data ?? {}));
  }, []);

  if (!data) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const set = (k: keyof EmailSettings, v: unknown) => setData((d) => (d ? { ...d, [k]: v } : d));

  const otpReady = Boolean(data.smtp_host && data.smtp_username && data.smtp_enabled && data.smtp_status === "ok");

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, smtp_password: smtpPass || undefined, imap_password: imapPass || undefined }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم الحفظ");
      setSmtpPass("");
      setImapPass("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const test = async (kind: "smtp" | "imap") => {
    setTesting(kind);
    try {
      const body =
        kind === "smtp"
          ? { host: data.smtp_host, port: data.smtp_port, username: data.smtp_username, password: smtpPass, encryption: data.smtp_encryption, from: data.smtp_from }
          : { host: data.imap_host, port: data.imap_port, username: data.imap_username, password: imapPass, encryption: data.imap_encryption };
      const res = await fetch(`/api/admin/email?action=test-${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) toast.success("تم الاتصال بنجاح");
      else toast.error(json.message ?? "فشل الاتصال");
      const fresh = await fetch("/api/admin/email").then((r) => r.json());
      setData(fresh.data ?? {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الاتصال");
    } finally {
      setTesting(null);
    }
  };

  const sendTest = async () => {
    setTesting("send");
    try {
      const res = await fetch("/api/admin/email?action=send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail || data.smtp_username }),
      });
      const json = await res.json();
      if (json.ok) toast.success("تم إرسال البريد التجريبي");
      else toast.error(json.message ?? "فشل الإرسال");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setTesting(null);
    }
  };

  const StatusBadge = ({ status }: { status?: string | null }) =>
    status === "ok" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> متصل</span>
    ) : status === "failed" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3.5 w-3.5" /> فشل الاتصال</span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> غير مُختبر</span>
    );

  return (
    <div className="space-y-6">
      <div className="card flex items-center justify-between gap-4 border border-brand-950/10 p-5">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${otpReady ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {otpReady ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </span>
          <div>
            <h2 className="font-bold text-brand-950">حالة OTP عبر البريد</h2>
            <p className="text-sm text-brand-600">
              {otpReady
                ? "النظام جاهز لإرسال رموز التحقق (OTP Ready)."
                : "OTP غير جاهز — سيتم السماح بتسجيل الدخول دون رمز تحقق حتى اكتمال إعداد SMTP واختباره."}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-950">إعدادات SMTP (الإرسال)</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={data.smtp_status} />
            <label className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
              <input type="checkbox" checked={Boolean(data.smtp_enabled)} onChange={(e) => set("smtp_enabled", e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
              مفعّل
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المضيف (Host)"><input className="input" dir="ltr" value={data.smtp_host ?? ""} onChange={(e) => set("smtp_host", e.target.value)} /></Field>
          <Field label="المنفذ (Port)"><input className="input" dir="ltr" type="number" value={data.smtp_port ?? 587} onChange={(e) => set("smtp_port", Number(e.target.value))} /></Field>
          <Field label="اسم المستخدم"><input className="input" dir="ltr" value={data.smtp_username ?? ""} onChange={(e) => set("smtp_username", e.target.value)} /></Field>
          <Field label="كلمة المرور"><input className="input" dir="ltr" type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="••••••••" /></Field>
          <Field label="التشفير">
            <select className="input" value={data.smtp_encryption ?? "TLS"} onChange={(e) => set("smtp_encryption", e.target.value)}>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="NONE">بدون</option>
            </select>
          </Field>
          <Field label="البريد المُرسِل (From)"><input className="input" dir="ltr" value={data.smtp_from ?? ""} onChange={(e) => set("smtp_from", e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => test("smtp")} disabled={testing === "smtp"} className="btn-outline btn-md">
            {testing === "smtp" ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
            اختبار اتصال SMTP
          </button>
          <div className="flex items-center gap-2">
            <input className="input w-56" dir="ltr" type="email" placeholder="بريد للاختبار" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
            <button onClick={sendTest} disabled={testing === "send"} className="btn-primary btn-md">
              {testing === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              إرسال بريد تجريبي
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-950">إعدادات IMAP (الاستقبال)</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={data.imap_status} />
            <label className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
              <input type="checkbox" checked={Boolean(data.imap_enabled)} onChange={(e) => set("imap_enabled", e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
              مفعّل
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المضيف (Host)"><input className="input" dir="ltr" value={data.imap_host ?? ""} onChange={(e) => set("imap_host", e.target.value)} /></Field>
          <Field label="المنفذ (Port)"><input className="input" dir="ltr" type="number" value={data.imap_port ?? 993} onChange={(e) => set("imap_port", Number(e.target.value))} /></Field>
          <Field label="اسم المستخدم"><input className="input" dir="ltr" value={data.imap_username ?? ""} onChange={(e) => set("imap_username", e.target.value)} /></Field>
          <Field label="كلمة المرور"><input className="input" dir="ltr" type="password" value={imapPass} onChange={(e) => setImapPass(e.target.value)} placeholder="••••••••" /></Field>
          <Field label="التشفير">
            <select className="input" value={data.imap_encryption ?? "SSL"} onChange={(e) => set("imap_encryption", e.target.value)}>
              <option value="SSL">SSL</option>
              <option value="TLS">TLS</option>
              <option value="NONE">بدون</option>
            </select>
          </Field>
        </div>
        <button onClick={() => test("imap")} disabled={testing === "imap"} className="btn-outline btn-md mt-4">
          {testing === "imap" ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
          اختبار اتصال IMAP
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary btn-lg">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          حفظ
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
