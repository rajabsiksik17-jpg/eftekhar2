"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ContactForm({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "error");
      toast.success(lang === "ar" ? "تم إرسال رسالتك بنجاح." : "Your message has been sent.");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : lang === "ar" ? "حدث خطأ ما" : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">{t("الاسم الكامل", "Full Name")} *</label>
          <input id="c-name" required className="input" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">{t("رقم الهاتف", "Phone")}</label>
          <input id="c-phone" type="tel" className="input" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="c-email">{t("البريد الإلكتروني", "Email")}</label>
          <input id="c-email" type="email" className="input" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="label" htmlFor="c-subject">{t("الموضوع", "Subject")}</label>
          <input id="c-subject" className="input" value={form.subject} onChange={set("subject")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-message">{t("رسالتك", "Message")} *</label>
        <textarea id="c-message" required className="input min-h-[120px] resize-y" value={form.message} onChange={set("message")} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {t("إرسال", "Send")}
      </button>
    </form>
  );
}
