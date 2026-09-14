"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Doctor, Service, ServiceCategory } from "@/lib/types";
import { PhoneInput, type PhoneValue } from "@/components/forms/PhoneInput";
import { validatePhone } from "@/lib/phone";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AppointmentSettings {
  enable_consent: boolean;
  consent_text_ar: string;
  consent_text_en: string;
  success_message_ar: string;
  success_message_en: string;
  default_country: string;
}

interface Props {
  lang: Lang;
  categories: ServiceCategory[];
  services: Service[];
  doctors: Doctor[];
  settings: AppointmentSettings;
  defaultCategorySlug?: string;
  defaultServiceSlug?: string;
}

export function AppointmentForm({
  lang,
  categories,
  services,
  doctors,
  settings,
  defaultCategorySlug,
  defaultServiceSlug,
}: Props) {
  const medicalDoctors = doctors.filter((d) => d.type === "doctor" || d.type === "consultant");

  const initialCategory = categories.find((c) => c.slug === defaultCategorySlug)?.id ?? "";
  const initialService = services.find((s) => s.slug === defaultServiceSlug)?.id ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<PhoneValue | null>(null);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [serviceId, setServiceId] = useState(initialService);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredServices = useMemo(
    () => (categoryId ? services.filter((s) => s.category_id === categoryId) : services),
    [categoryId, services],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم الهاتف" : "Please enter a phone number");
      return;
    }
    const check = validatePhone(phone.country_code, phone.national_number);
    if (!check.valid) {
      toast.error(lang === "ar" ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      return;
    }
    if (settings.enable_consent && !consent) {
      toast.error(lang === "ar" ? "يرجى الموافقة على جمع البيانات" : "Please consent to data collection");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          country: phone.country_code,
          country_code: phone.country_code,
          dial_code: phone.dial_code,
          national_number: phone.national_number,
          international_number: phone.international_number,
          category_id: categoryId || null,
          service_id: serviceId || null,
          doctor_id: doctorId || null,
          preferred_date: date || null,
          preferred_time: time || null,
          message: message || null,
          consent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "error");
      }
      toast.success(
        lang === "ar" ? settings.success_message_ar : settings.success_message_en,
      );
      setName("");
      setEmail("");
      setMessage("");
      setDate("");
      setTime("");
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
          <label className="label" htmlFor="name">
            {t("الاسم الكامل", "Full Name")} *
          </label>
          <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            {t("رقم الهاتف", "Phone Number")} *
          </label>
          <PhoneInput
            lang={lang}
            defaultCountry={settings.default_country}
            value={phone ?? undefined}
            onChange={setPhone}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            {t("البريد الإلكتروني", "Email")}
          </label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="category">
            {t("تصنيف الخدمة", "Service Category")}
          </label>
          <select
            id="category"
            className="input"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setServiceId("");
            }}
          >
            <option value="">{t("اختر التصنيف", "Select category")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ar" ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="service">
            {t("الخدمة", "Service")}
          </label>
          <select id="service" className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">{t("اختر الخدمة", "Select service")}</option>
            {filteredServices.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === "ar" ? s.name_ar : s.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="doctor">
            {t("الطبيب", "Doctor")}
          </label>
          <select id="doctor" className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">{t("اختر الطبيب", "Select doctor")}</option>
            {medicalDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {lang === "ar" ? d.name_ar : d.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">
            {t("التاريخ المفضل", "Preferred Date")}
          </label>
          <input id="date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="time">
            {t("الوقت المفضل", "Preferred Time")}
          </label>
          <input id="time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="message">
          {t("رسالتك", "Your Message")}
        </label>
        <textarea
          id="message"
          className="input min-h-[100px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {settings.enable_consent && (
        <label className="flex items-start gap-3 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600"
          />
          <span>{lang === "ar" ? settings.consent_text_ar : settings.consent_text_en}</span>
        </label>
      )}

      <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {t("إرسال الطلب", "Submit Request")}
      </button>
    </form>
  );
}
