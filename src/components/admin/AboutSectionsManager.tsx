"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Save, Upload, Eye, EyeOff, ImageIcon } from "lucide-react";

interface Section {
  id: string;
  page_id: string;
  section_type: string;
  title_ar: string | null;
  title_en: string | null;
  content: {
    image?: string;
    ar?: { text?: string };
    en?: { text?: string };
    buttons?: Button[];
  };
  settings: { layout?: string };
  display_order: number;
  is_active: boolean;
}

interface Button {
  label_ar?: string;
  label_en?: string;
  url?: string;
  type?: string;
}

const INTERNAL_ROUTES = [
  { value: "/", label: "الرئيسية" },
  { value: "/about", label: "من نحن" },
  { value: "/doctors", label: "الأطباء" },
  { value: "/services", label: "الخدمات" },
  { value: "/videos", label: "معرض الفيديوهات" },
  { value: "/gallery", label: "معرض الصور" },
  { value: "/contact", label: "تواصل معنا" },
  { value: "/appointment", label: "حجز موعد" },
  { value: "/privacy-policy", label: "سياسة الخصوصية" },
  { value: "/terms", label: "الشروط والأحكام" },
];

export function AboutSectionsManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const pagesRes = await fetch("/api/admin/pages?pageSize=100&search=about").then((r) => r.json());
    const about = (pagesRes.data?.items ?? []).find((p: { slug: string }) => p.slug === "about");
    if (!about) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/page-sections?pageSize=500").then((r) => r.json());
    const all = (res.data?.items ?? []) as Section[];
    setSections(all.filter((s) => s.page_id === about.id && s.section_type === "image_text").sort((a, b) => a.display_order - b.display_order));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json;
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [m] = next.splice(index, 1);
    next.splice(target, 0, m);
    setSections(next);
    await call("POST", "/api/admin/page-sections", { ids: next.map((s) => s.id) });
  };

  const toggle = async (s: Section) => {
    await call("PATCH", `/api/admin/page-sections/${s.id}`, { is_active: !s.is_active });
    load();
  };

  const remove = async (s: Section) => {
    if (!confirm("حذف هذا القسم؟")) return;
    await call("DELETE", `/api/admin/page-sections/${s.id}`);
    toast.success("تم الحذف");
    load();
  };

  const add = async () => {
    setSaving(true);
    try {
      await call("POST", "/api/admin/page-sections", {
        page_id: sections[0]?.page_id,
        section_type: "image_text",
        title_ar: "قسم جديد",
        title_en: "New Section",
        content: { image: "", ar: { text: "" }, en: { text: "" }, buttons: [] },
        settings: { layout: "image_left" },
        display_order: sections.length + 1,
      });
      toast.success("تمت الإضافة");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await call("PATCH", `/api/admin/page-sections/${editing.id}`, {
        title_ar: editing.title_ar,
        title_en: editing.title_en,
        content: editing.content,
        settings: editing.settings,
      });
      toast.success("تم الحفظ");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">أقسام "من نحن" (صورة + نص + أزرار)</p>
        <button onClick={add} disabled={saving} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة قسم</button>
      </div>

      {sections.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">لا توجد أقسام بعد</div>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={s.id} className={cn("card flex items-center gap-3 p-4", !s.is_active && "opacity-60")}>
              <div className="flex flex-col">
                <button onClick={() => reorder(i, -1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => reorder(i, 1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
              </div>
              {s.content.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.content.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-300"><ImageIcon className="h-6 w-6" /></span>
              )}
              <div className="flex-1">
                <div className="font-semibold text-ink">{s.title_ar ?? "—"}</div>
                <div className="text-xs text-ink-muted">
                  {s.settings.layout === "image_right" ? "الصورة يمين" : "الصورة يسار"} · {s.content.buttons?.length ?? 0} زر
                </div>
              </div>
              <button onClick={() => toggle(s)} className="rounded p-1.5 text-brand-500 hover:bg-brand-100" title="تفعيل/تعطيل">
                {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => setEditing(s)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(s)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <SectionEditor
          section={editing}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
          onChange={setEditing}
        />
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onClose,
  onSave,
  saving,
  onChange,
}: {
  section: Section;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  onChange: (s: Section) => void;
}) {
  const setContent = (patch: Partial<Section["content"]>) =>
    onChange({ ...section, content: { ...section.content, ...patch } });
  const setText = (lang: "ar" | "en", v: string) => {
    const c = { ...section.content };
    c[lang] = { ...(c[lang] ?? {}), text: v };
    onChange({ ...section, content: c });
  };
  const setButtons = (buttons: Button[]) => setContent({ buttons });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6" dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-ink">تعديل القسم</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-brand-500" /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="العنوان (عربي)"><input className="input" value={section.title_ar ?? ""} onChange={(e) => onChange({ ...section, title_ar: e.target.value })} /></Field>
          <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={section.title_en ?? ""} onChange={(e) => onChange({ ...section, title_en: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="النص (عربي)"><textarea className="input min-h-[80px]" value={section.content.ar?.text ?? ""} onChange={(e) => setText("ar", e.target.value)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="النص (إنجليزي)"><textarea className="input min-h-[80px]" dir="ltr" value={section.content.en?.text ?? ""} onChange={(e) => setText("en", e.target.value)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <ImageField
              value={section.content.image ?? ""}
              onChange={(v) => setContent({ image: v })}
            />
          </div>
          <Field label="مكان الصورة">
            <select className="input" value={section.settings.layout ?? "image_left"} onChange={(e) => onChange({ ...section, settings: { ...section.settings, layout: e.target.value } })}>
              <option value="image_left">الصورة يسار</option>
              <option value="image_right">الصورة يمين</option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-ink">الأزرار</h3>
            <button type="button" onClick={() => setButtons([...(section.content.buttons ?? []), { label_ar: "", label_en: "", url: "/contact", type: "primary" }])} className="btn-outline btn-sm"><Plus className="h-4 w-4" /> زر</button>
          </div>
          <div className="space-y-3">
            {(section.content.buttons ?? []).map((b, i) => (
              <ButtonRow
                key={i}
                button={b}
                onChange={(nb) => setButtons((section.content.buttons ?? []).map((x, xi) => (xi === i ? nb : x)))}
                onRemove={() => setButtons((section.content.buttons ?? []).filter((_, xi) => xi !== i))}
                onMove={(dir) => {
                  const arr = [...(section.content.buttons ?? [])];
                  const target = i + dir;
                  if (target < 0 || target >= arr.length) return;
                  const [m] = arr.splice(i, 1);
                  arr.splice(target, 0, m);
                  setButtons(arr);
                }}
              />
            ))}
            {(section.content.buttons ?? []).length === 0 && <p className="text-sm text-ink-muted">لا توجد أزرار</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-brand-950/10 pt-4">
          <button onClick={onClose} className="btn-ghost btn-md">إلغاء</button>
          <button onClick={onSave} disabled={saving} className="btn-primary btn-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

function ButtonRow({
  button,
  onChange,
  onRemove,
  onMove,
}: {
  button: Button;
  onChange: (b: Button) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const isInternal = INTERNAL_ROUTES.some((r) => r.value === button.url);
  return (
    <div className="rounded-xl border border-brand-950/10 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="نص الزر (عربي)"><input className="input" value={button.label_ar ?? ""} onChange={(e) => onChange({ ...button, label_ar: e.target.value })} /></Field>
        <Field label="نص الزر (إنجليزي)"><input className="input" dir="ltr" value={button.label_en ?? ""} onChange={(e) => onChange({ ...button, label_en: e.target.value })} /></Field>
        <Field label="النوع">
          <select className="input" value={button.type ?? "primary"} onChange={(e) => onChange({ ...button, type: e.target.value })}>
            <option value="primary">أساسي</option>
            <option value="outline">محدد</option>
          </select>
        </Field>
        <Field label="الرابط">
          <select
            className="input"
            value={isInternal ? button.url : "__custom"}
            onChange={(e) => {
              if (e.target.value === "__custom") onChange({ ...button, url: "" });
              else onChange({ ...button, url: e.target.value });
            }}
          >
            <option value="__custom">رابط مخصص...</option>
            {INTERNAL_ROUTES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
        {!isInternal && (
          <div className="sm:col-span-2">
            <Field label="الرابط المخصص"><input className="input" dir="ltr" value={button.url ?? ""} onChange={(e) => onChange({ ...button, url: e.target.value })} /></Field>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <button onClick={() => onMove(-1)} className="rounded p-1 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
        <button onClick={() => onMove(1)} className="rounded p-1 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
        <button onClick={onRemove} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onChange(json.data.url);
      toast.success("تم رفع الصورة");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الرفع");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="label">الصورة</label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-16 w-24 rounded-lg object-cover" />
        ) : (
          <span className="flex h-16 w-24 items-center justify-center rounded-lg bg-brand-50 text-brand-300"><ImageIcon className="h-6 w-6" /></span>
        )}
        <div className="flex-1 space-y-2">
          <input className="input" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
          <div className="flex gap-2">
            <label className="btn-outline btn-sm cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              رفع صورة
              <input type="file" accept="image/*" className="hidden" onChange={upload} />
            </label>
            {value && <button type="button" onClick={() => onChange("")} className="btn-ghost btn-sm text-red-600">إزالة</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
