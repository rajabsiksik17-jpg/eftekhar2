"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, Copy, ChevronUp, ChevronDown, X, Save, Eye, EyeOff } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { IconPicker } from "@/components/admin/IconPicker";
import { VideoInput } from "@/components/admin/VideoInput";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";

interface Page {
  id: string;
  slug: string;
  title_ar: string | null;
  title_en: string | null;
  type: string;
}

interface Section {
  id: string;
  page_id: string;
  section_type: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  content: any;
  settings: any;
  display_order: number;
  is_active: boolean;
}

const TYPES = [
  { value: "hero", label: "Hero / الواجهة" },
  { value: "statistics", label: "الإحصائيات" },
  { value: "introduction", label: "مقدمة + صورة" },
  { value: "video_content", label: "فيديو + محتوى" },
  { value: "service_categories", label: "تصنيفات الخدمات" },
  { value: "promotional_slider", label: "شريط ترويجي" },
  { value: "doctors", label: "الأطباء" },
  { value: "testimonials", label: "التقييمات" },
  { value: "before_after", label: "قبل / بعد" },
  { value: "gallery", label: "معرض الصور" },
  { value: "gallery_videos", label: "معرض صور + فيديوهات" },
  { value: "way_to_clinic", label: "الطريق إلينا" },
  { value: "image_text", label: "صورة + نص" },
  { value: "final_cta", label: "دعوة أخيرة" },
];

const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;

export function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPages = useCallback(async () => {
    const res = await fetch("/api/admin/pages?pageSize=100").then((r) => r.json());
    const list = (res.data?.items ?? []) as Page[];
    setPages(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
  }, [selectedId]);

  const loadSections = useCallback(async (pageId: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/page-sections?pageSize=500").then((r) => r.json());
    const all = (res.data?.items ?? []) as Section[];
    setSections(all.filter((s) => s.page_id === pageId).sort((a, b) => a.display_order - b.display_order));
    setLoading(false);
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);
  useEffect(() => { if (selectedId) loadSections(selectedId); }, [selectedId, loadSections]);

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json;
  };

  const reorder = async (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= sections.length) return;
    const next = [...sections];
    const [m] = next.splice(i, 1);
    next.splice(t, 0, m);
    setSections(next);
    await call("POST", "/api/admin/page-sections", { ids: next.map((s) => s.id) });
  };

  const toggle = async (s: Section) => {
    await call("PATCH", `/api/admin/page-sections/${s.id}`, { is_active: !s.is_active });
    loadSections(selectedId!);
  };

  const remove = async (s: Section) => {
    if (!confirm("حذف هذا القسم؟")) return;
    await call("DELETE", `/api/admin/page-sections/${s.id}`);
    loadSections(selectedId!);
  };

  const duplicate = async (s: Section) => {
    await call("POST", "/api/admin/page-sections", {
      page_id: s.page_id, section_type: s.section_type, title_ar: s.title_ar, title_en: s.title_en,
      subtitle_ar: s.subtitle_ar, subtitle_en: s.subtitle_en, content: s.content, settings: s.settings,
      display_order: s.display_order + 1,
    });
    loadSections(selectedId!);
  };

  const create = async (type: string) => {
    setSaving(true);
    try {
      await call("POST", "/api/admin/page-sections", { page_id: selectedId, section_type: type, title_ar: typeLabel(type), content: {}, settings: {}, display_order: sections.length + 1 });
      setCreating(false);
      loadSections(selectedId!);
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
        title_ar: editing.title_ar, title_en: editing.title_en,
        subtitle_ar: editing.subtitle_ar, subtitle_en: editing.subtitle_en,
        content: editing.content, settings: editing.settings,
      });
      toast.success("تم الحفظ");
      setEditing(null);
      loadSections(selectedId!);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="card h-fit p-3">
        {pages.map((p) => (
          <button key={p.id} onClick={() => setSelectedId(p.id)}
            className={cn("mb-1 block w-full rounded-xl px-3 py-2 text-start text-sm font-medium transition",
              selectedId === p.id ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-50")}>
            {p.title_ar ?? p.slug}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">أقسام الصفحة — رتّبها وعدّل محتواها بالكامل</p>
          <button onClick={() => setCreating(true)} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة قسم</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : sections.length === 0 ? (
          <div className="card p-10 text-center text-ink-muted">لا توجد أقسام</div>
        ) : (
          <div className="space-y-3">
            {sections.map((s, i) => (
              <div key={s.id} className={cn("card flex items-center gap-3 p-4", !s.is_active && "opacity-60")}>
                <div className="flex flex-col">
                  <button onClick={() => reorder(i, -1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => reorder(i, 1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-semibold text-ink">{typeLabel(s.section_type)}{s.title_ar ? ` · ${s.title_ar}` : ""}</div>
                  <div className="text-xs text-ink-muted">{s.section_type}</div>
                </div>
                <button onClick={() => toggle(s)} className="rounded p-1.5 text-brand-500 hover:bg-brand-100">{s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <button onClick={() => setEditing(s)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => duplicate(s)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Copy className="h-4 w-4" /></button>
                <button onClick={() => remove(s)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">إضافة قسم</h2>
              <button onClick={() => setCreating(false)}><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <div className="grid gap-2">
              {TYPES.map((t) => (
                <button key={t.value} onClick={() => create(t.value)} className="rounded-xl border border-brand-950/10 px-4 py-2.5 text-start text-sm hover:border-brand-500 hover:bg-brand-50">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <SectionEditor section={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={save} saving={saving} />
      )}
    </div>
  );
}

function SectionEditor({ section, onChange, onClose, onSave, saving }: {
  section: Section; onChange: (s: Section) => void; onClose: () => void; onSave: () => void; saving: boolean;
}) {
  const c = section.content ?? {};
  const setContent = (patch: Record<string, unknown>) => onChange({ ...section, content: { ...c, ...patch } });

  if (section.section_type === "hero") {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
        <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6" dir="rtl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">شرائح الواجهة</h2>
            <button onClick={onClose}><X className="h-5 w-5 text-brand-500" /></button>
          </div>
          <HeroSlidesEditor />
        </div>
      </div>
    );
  }

  const withText = ["introduction", "video_content", "way_to_clinic", "image_text"].includes(section.section_type);
  const withImage = ["introduction", "image_text"].includes(section.section_type);
  const withVideo = ["video_content", "way_to_clinic"].includes(section.section_type);
  const withFeatures = ["introduction", "video_content"].includes(section.section_type);
  const withButtons = section.section_type === "image_text";
  const withCta = section.section_type === "final_cta";
  const withIntroVideo = section.section_type === "introduction";
  const withMobileToggle = ["introduction", "image_text"].includes(section.section_type);
  const settings = section.settings ?? {};
  const setSettings = (patch: Record<string, unknown>) => onChange({ ...section, settings: { ...settings, ...patch } });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6" dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-ink">تعديل القسم — {typeLabel(section.section_type)}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-brand-500" /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="العنوان (عربي)"><input className="input" value={section.title_ar ?? ""} onChange={(e) => onChange({ ...section, title_ar: e.target.value })} /></Field>
          <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={section.title_en ?? ""} onChange={(e) => onChange({ ...section, title_en: e.target.value })} /></Field>
          <Field label="العنوان الفرعي (عربي)"><input className="input" value={section.subtitle_ar ?? ""} onChange={(e) => onChange({ ...section, subtitle_ar: e.target.value })} /></Field>
          <Field label="العنوان الفرعي (إنجليزي)"><input className="input" dir="ltr" value={section.subtitle_en ?? ""} onChange={(e) => onChange({ ...section, subtitle_en: e.target.value })} /></Field>

          {withText && (
            <>
              <div className="sm:col-span-2"><Field label="النص (عربي)"><textarea className="input min-h-[80px]" value={c.ar?.text ?? ""} onChange={(e) => setContent({ ar: { ...(c.ar ?? {}), text: e.target.value } })} /></Field></div>
              <div className="sm:col-span-2"><Field label="النص (إنجليزي)"><textarea className="input min-h-[80px]" dir="ltr" value={c.en?.text ?? ""} onChange={(e) => setContent({ en: { ...(c.en ?? {}), text: e.target.value } })} /></Field></div>
            </>
          )}

          {withImage && (
            <div className="sm:col-span-2"><Field label="الصورة"><MediaPicker value={c.image ?? ""} onChange={(v) => setContent({ image: v })} /></Field></div>
          )}

          {withVideo && (
            <div className="sm:col-span-2"><Field label="الفيديو"><VideoInput value={c.video?.youtube_url ?? ""} onChange={(v) => setContent({ video: { ...(c.video ?? {}), youtube_url: v } })} /></Field></div>
          )}

          {withIntroVideo && (
            <>
              <div className="sm:col-span-2"><Field label="الفيديو (YouTube أو ملف)"><VideoInput value={c.video?.url ?? ""} onChange={(v) => setContent({ video: { ...(c.video ?? {}), url: v } })} /></Field></div>
              <Toggle label="تشغيل تلقائي" checked={Boolean(c.video?.autoplay)} onChange={(v) => setContent({ video: { ...(c.video ?? {}), autoplay: v } })} />
              <Toggle label="صامت" checked={Boolean(c.video?.muted)} onChange={(v) => setContent({ video: { ...(c.video ?? {}), muted: v } })} />
              <Toggle label="تكرار" checked={Boolean(c.video?.loop)} onChange={(v) => setContent({ video: { ...(c.video ?? {}), loop: v } })} />
              <Toggle label="إظهار أزرار التحكم" checked={c.video?.controls !== false} onChange={(v) => setContent({ video: { ...(c.video ?? {}), controls: v } })} />
            </>
          )}

          {withMobileToggle && (
            <Toggle label="على الجوال: الصورة أسفل العنوان" checked={settings.image_below_mobile !== false} onChange={(v) => setSettings({ image_below_mobile: v })} />
          )}

          {withCta && (
            <>
              <Field label="نص الزر (عربي)"><input className="input" value={c.cta?.label_ar ?? ""} onChange={(e) => setContent({ cta: { ...(c.cta ?? {}), label_ar: e.target.value } })} /></Field>
              <Field label="رابط الزر"><input className="input" dir="ltr" value={c.cta?.url ?? ""} onChange={(e) => setContent({ cta: { ...(c.cta ?? {}), url: e.target.value } })} /></Field>
            </>
          )}
        </div>

        {withFeatures && (
          <FeaturesEditor
            features={Array.isArray(c.features) ? c.features : []}
            onChange={(features) => setContent({ features })}
          />
        )}

        {withButtons && (
          <ButtonsEditor buttons={Array.isArray(c.buttons) ? c.buttons : []} onChange={(buttons) => setContent({ buttons })} />
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-brand-950/10 pt-4">
          <button onClick={onClose} className="btn-ghost btn-md">إلغاء</button>
          <button onClick={onSave} disabled={saving} className="btn-primary btn-md">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ</button>
        </div>
      </div>
    </div>
  );
}

function FeaturesEditor({ features, onChange }: { features: { icon?: string; ar?: string; en?: string; title?: string; text?: string }[]; onChange: (f: any[]) => void }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-ink">المميزات</h3>
        <button type="button" onClick={() => onChange([...features, { icon: "Check", ar: "", en: "" }])} className="btn-outline btn-sm"><Plus className="h-4 w-4" /> ميزة</button>
      </div>
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={i} className="rounded-xl border border-brand-950/10 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="الأيقونة"><IconPicker value={f.icon ?? ""} onChange={(v) => onChange(features.map((x, xi) => (xi === i ? { ...x, icon: v } : x)))} /></Field>
              <Field label="العنوان (عربي)"><input className="input" value={f.ar ?? f.title ?? ""} onChange={(e) => onChange(features.map((x, xi) => (xi === i ? { ...x, ar: e.target.value } : x)))} /></Field>
              <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={f.en ?? ""} onChange={(e) => onChange(features.map((x, xi) => (xi === i ? { ...x, en: e.target.value } : x)))} /></Field>
            </div>
            <button type="button" onClick={() => onChange(features.filter((_, xi) => xi !== i))} className="btn-ghost btn-sm mt-2 text-red-600"><Trash2 className="h-4 w-4" /> حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ButtonsEditor({ buttons, onChange }: { buttons: { label_ar?: string; label_en?: string; url?: string; type?: string }[]; onChange: (b: any[]) => void }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-ink">الأزرار</h3>
        <button type="button" onClick={() => onChange([...buttons, { label_ar: "", label_en: "", url: "/contact", type: "primary" }])} className="btn-outline btn-sm"><Plus className="h-4 w-4" /> زر</button>
      </div>
      <div className="space-y-3">
        {buttons.map((b, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-brand-950/10 p-3 sm:grid-cols-3">
            <Field label="النص (عربي)"><input className="input" value={b.label_ar ?? ""} onChange={(e) => onChange(buttons.map((x, xi) => (xi === i ? { ...x, label_ar: e.target.value } : x)))} /></Field>
            <Field label="النص (إنجليزي)"><input className="input" dir="ltr" value={b.label_en ?? ""} onChange={(e) => onChange(buttons.map((x, xi) => (xi === i ? { ...x, label_en: e.target.value } : x)))} /></Field>
            <Field label="الرابط"><input className="input" dir="ltr" value={b.url ?? ""} onChange={(e) => onChange(buttons.map((x, xi) => (xi === i ? { ...x, url: e.target.value } : x)))} /></Field>
            <button type="button" onClick={() => onChange(buttons.filter((_, xi) => xi !== i))} className="btn-ghost btn-sm text-red-600"><Trash2 className="h-4 w-4" /> حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-end pb-2">
      <label className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
        {label}
      </label>
    </div>
  );
}
