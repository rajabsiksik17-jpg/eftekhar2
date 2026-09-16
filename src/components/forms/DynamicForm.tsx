"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Form, FormField } from "@/lib/types";
import type { Service, ServiceCategory, Doctor } from "@/lib/types";
import { PhoneInput, type PhoneValue } from "@/components/forms/PhoneInput";
import { validatePhone } from "@/lib/phone";
import { COUNTRIES } from "@/lib/phone";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

interface Context {
  categories: ServiceCategory[];
  services: Service[];
  doctors: Doctor[];
  defaultCountry?: string;
  consentText?: string;
  consentTextEn?: string;
}

export function DynamicForm({
  form,
  fields,
  lang,
  context,
  defaults,
}: {
  form: Form;
  fields: FormField[];
  lang: Lang;
  context: Context;
  defaults?: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      init[f.name] = defaults?.[f.name] ?? f.default_value ?? (f.field_type === "checkbox" || f.field_type === "consent" ? false : "");
    }
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categoryId = String(values["category"] ?? "");
  const serviceId = String(values["service"] ?? "");
  const filteredServices = useMemo(
    () => (categoryId ? context.services.filter((s) => s.category_id === categoryId) : context.services),
    [categoryId, context.services],
  );

  const set = (name: string, v: unknown) => setValues((p) => ({ ...p, [name]: v }));

  const t = (ar?: string | null, en?: string | null) => (lang === "ar" ? ar ?? "" : en ?? "");

  const label = (f: FormField) => t(f.label_ar, f.label_en);
  const placeholder = (f: FormField) => (t(f.placeholder_ar, f.placeholder_en) || undefined);
  const help = (f: FormField) => t(f.help_text_ar, f.help_text_en);

  const validate = (f: FormField, value: unknown): string | null => {
    if (f.required) {
      if (value === "" || value === null || value === undefined || value === false) {
        return lang === "ar" ? "هذا الحقل مطلوب" : "This field is required";
      }
    }
    if (f.field_type === "phone") {
      const pv = value as PhoneValue | null;
      if (pv && pv.national_number) {
        const check = validatePhone(pv.country_code, pv.national_number);
        if (!check.valid) return lang === "ar" ? "رقم الهاتف غير صحيح" : "Invalid phone number";
      }
    }
    if (f.validation) {
      const rule = f.validation;
      if (rule === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return lang === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email";
      }
      const min = rule.match(/^min:(\d+)$/);
      if (min && String(value).length < Number(min[1])) {
        return lang === "ar" ? `الحد الأدنى ${min[1]} حرف` : `Minimum ${min[1]} characters`;
      }
      const max = rule.match(/^max:(\d+)$/);
      if (max && String(value).length > Number(max[1])) {
        return lang === "ar" ? `الحد الأقصى ${max[1]} حرف` : `Maximum ${max[1]} characters`;
      }
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      const err = validate(f, values[f.name]);
      if (err) {
        toast.error(`${label(f)}: ${err}`);
        return;
      }
    }
    setLoading(true);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(values)) {
        if (v instanceof File) fd.append(k, v);
        else if (v && typeof v === "object") fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v ?? ""));
      }
      const res = await fetch(`/api/forms/${form.key}/submit`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message ?? "error");
      setSubmitted(true);
      toast.success(t(form.success_message_ar, form.success_message_en));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t(form.error_message_ar, form.error_message_en));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-8 w-8" />
        </span>
        <h3 className="text-xl font-bold text-ink">{lang === "ar" ? "شكرًا لك!" : "Thank you!"}</h3>
        <p className="max-w-md text-ink-secondary">{t(form.success_message_ar, form.success_message_en)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const full = ["textarea", "multiselect", "radio", "consent", "file"].includes(f.field_type);
          const val = values[f.name];
          const options = (Array.isArray(f.options) ? f.options : []) as { value: string; label?: string; label_ar?: string; label_en?: string }[];
          const common = {
            id: f.name,
            className: "input",
            placeholder: placeholder(f),
            required: f.required,
            value: String(val ?? ""),
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(f.name, e.target.value),
          };

          return (
            <div key={f.id} className={full ? "sm:col-span-2" : ""}>
              <label className="label" htmlFor={f.name}>
                {label(f)} {f.required && <span className="text-red-500">*</span>}
              </label>

              {f.field_type === "text" && <input type="text" {...common} />}
              {f.field_type === "url" && <input type="url" dir="ltr" {...common} />}
              {f.field_type === "email" && <input type="email" dir="ltr" {...common} />}
              {f.field_type === "number" && <input type="number" {...common} />}
              {f.field_type === "date" && <input type="date" {...common} />}
              {f.field_type === "time" && <input type="time" {...common} />}
              {f.field_type === "datetime" && <input type="datetime-local" {...common} />}
              {f.field_type === "textarea" && <textarea rows={4} {...common} />}
              {f.field_type === "hidden" && <input type="hidden" {...common} />}

              {f.field_type === "phone" && (
                <PhoneInput
                  lang={lang}
                  defaultCountry={context.defaultCountry ?? "JO"}
                  value={val as PhoneValue | undefined}
                  onChange={(v) => set(f.name, v)}
                  required={f.required}
                />
              )}

              {f.field_type === "country" && (
                <select {...common} dir="ltr">
                  <option value="">{lang === "ar" ? "اختر الدولة" : "Select country"}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {lang === "ar" ? c.name_ar : c.name}
                    </option>
                  ))}
                </select>
              )}

              {f.field_type === "select" && (
                <select {...common}>
                  <option value="">{lang === "ar" ? "اختر" : "Select"}</option>
                  {options.map((o: { value: string; label?: string; label_ar?: string; label_en?: string }) => (
                    <option key={o.value} value={o.value}>
                      {o.label ?? (lang === "ar" ? o.label_ar : o.label_en) ?? o.value}
                    </option>
                  ))}
                </select>
              )}

              {f.field_type === "categories" && (
                <select className="input" value={categoryId} onChange={(e) => { set("category", e.target.value); set("service", ""); }}>
                  <option value="">{lang === "ar" ? "اختر التصنيف" : "Select category"}</option>
                  {context.categories.map((c) => (
                    <option key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</option>
                  ))}
                </select>
              )}

              {f.field_type === "services" && (
                <select className="input" value={serviceId} onChange={(e) => set("service", e.target.value)}>
                  <option value="">{lang === "ar" ? "اختر الخدمة" : "Select service"}</option>
                  {filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>{lang === "ar" ? s.name_ar : s.name_en}</option>
                  ))}
                </select>
              )}

              {f.field_type === "doctors" && (
                <select className="input" value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                  <option value="">{lang === "ar" ? "اختر الطبيب" : "Select doctor"}</option>
                  {context.doctors.filter((d) => d.type === "doctor" || d.type === "consultant").map((d) => (
                    <option key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</option>
                  ))}
                </select>
              )}

              {f.field_type === "checkbox" && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
                  <span className="text-sm text-ink-secondary">{label(f)}</span>
                </label>
              )}

              {f.field_type === "consent" && (
                <label className="flex items-start gap-3 text-sm text-ink-secondary">
                  <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.name, e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600" />
                  <span>{lang === "ar" ? context.consentText ?? label(f) : context.consentTextEn ?? label(f)}</span>
                </label>
              )}

              {f.field_type === "radio" && (
                <div className="space-y-2">
                  {options.map((o: { value: string; label?: string; label_ar?: string; label_en?: string }) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm text-ink-secondary">
                      <input type="radio" name={f.name} value={o.value} checked={String(val) === o.value} onChange={() => set(f.name, o.value)} className="h-4 w-4 text-brand-600" />
                      {o.label ?? (lang === "ar" ? o.label_ar : o.label_en) ?? o.value}
                    </label>
                  ))}
                </div>
              )}

              {f.field_type === "multiselect" && (
                <div className="space-y-2">
                  {options.map((o: { value: string; label?: string; label_ar?: string; label_en?: string }) => {
                    const arr = Array.isArray(val) ? val : [];
                    return (
                      <label key={o.value} className="flex items-center gap-2 text-sm text-ink-secondary">
                        <input
                          type="checkbox"
                          checked={arr.includes(o.value)}
                          onChange={(e) => {
                            const next = e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value);
                            set(f.name, next);
                          }}
                          className="h-4 w-4 rounded border-brand-300 text-brand-600"
                        />
                        {o.label ?? (lang === "ar" ? o.label_ar : o.label_en) ?? o.value}
                      </label>
                    );
                  })}
                </div>
              )}

              {f.field_type === "file" && (
                <input
                  type="file"
                  onChange={(e) => set(f.name, e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-ink-secondary file:me-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                />
              )}

              {help(f) && <p className="mt-1 text-xs text-ink-muted">{help(f)}</p>}
            </div>
          );
        })}
      </div>

      <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {t(form.submit_button_ar, form.submit_button_en)}
      </button>
    </form>
  );
}
