"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Copy, ChevronUp, ChevronDown, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  page_id: string;
  section_type: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  content: unknown;
  display_order: number;
  is_active: boolean;
}

const TYPES = [
  { value: "hero", label: "Hero / الواجهة" },
  { value: "statistics", label: "الإحصائيات" },
  { value: "introduction", label: "مقدمة" },
  { value: "video_content", label: "فيديو + محتوى" },
  { value: "service_categories", label: "تصنيفات الخدمات" },
  { value: "featured_services", label: "خدمات مميزة" },
  { value: "promotional_slider", label: "شريط ترويجي" },
  { value: "doctors", label: "الأطباء" },
  { value: "testimonials", label: "التقييمات" },
  { value: "before_after", label: "قبل / بعد" },
  { value: "gallery", label: "معرض الصور" },
  { value: "way_to_clinic", label: "الطريق إلينا" },
  { value: "final_cta", label: "دعوة أخيرة" },
];

export function HomepageBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ section_type: "introduction", title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const pagesRes = await fetch("/api/admin/pages?pageSize=100&search=home").then((r) => r.json());
    const homePage = (pagesRes.data?.items ?? []).find((p: { slug: string }) => p.slug === "home");
    if (!homePage) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/page-sections?pageSize=500").then((r) => r.json());
    const all = (res.data?.items ?? []) as Section[];
    setSections(all.filter((s) => s.page_id === homePage.id).sort((a, b) => a.display_order - b.display_order));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const homePageId = sections[0]?.page_id;

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
    toast.success("تم إعادة الترتيب");
  };

  const toggleActive = async (s: Section) => {
    await call("PATCH", `/api/admin/page-sections/${s.id}`, { is_active: !s.is_active });
    load();
  };

  const remove = async (s: Section) => {
    if (!confirm("حذف هذا القسم؟")) return;
    await call("DELETE", `/api/admin/page-sections/${s.id}`);
    toast.success("تم الحذف");
    load();
  };

  const duplicate = async (s: Section) => {
    await call("POST", "/api/admin/page-sections", {
      page_id: s.page_id,
      section_type: s.section_type,
      title_ar: s.title_ar,
      title_en: s.title_en,
      subtitle_ar: s.subtitle_ar,
      subtitle_en: s.subtitle_en,
      content: s.content,
      display_order: s.display_order + 1,
    });
    toast.success("تم النسخ");
    load();
  };

  const create = async () => {
    setSaving(true);
    try {
      await call("POST", "/api/admin/page-sections", { ...form, page_id: homePageId, content: {}, display_order: sections.length + 1 });
      toast.success("تمت إضافة القسم");
      setCreating(false);
      setForm({ section_type: "introduction", title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await call("PATCH", `/api/admin/page-sections/${editing.id}`, {
        title_ar: editing.title_ar,
        title_en: editing.title_en,
        subtitle_ar: editing.subtitle_ar,
        subtitle_en: editing.subtitle_en,
        content: editing.content,
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

  const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-500">رتب الأقسام بالسحب أو الأسهم، وعدّل محتواها دون لمس الكود.</p>
        <button onClick={() => setCreating(true)} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة قسم</button>
      </div>

      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className={cn("card flex items-center gap-3 p-4", !s.is_active && "opacity-60")}>
            <div className="flex flex-col gap-1">
              <button onClick={() => reorder(i, -1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
              <button onClick={() => reorder(i, 1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">{i + 1}</span>
            <div className="flex-1">
              <div className="font-semibold text-brand-950">
                {typeLabel(s.section_type)}
                {s.title_ar && <span className="ms-2 text-sm font-normal text-brand-500">{s.title_ar}</span>}
              </div>
              <div className="text-xs text-brand-400">النوع: {s.section_type}</div>
            </div>
            <button onClick={() => toggleActive(s)} className="rounded p-1.5 text-brand-500 hover:bg-brand-100" title="تفعيل/تعطيل">
              {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button onClick={() => setEditing(s)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => duplicate(s)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Copy className="h-4 w-4" /></button>
            <button onClick={() => remove(s)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {creating && (
        <Modal title="إضافة قسم" onClose={() => setCreating(false)}>
          <div className="space-y-4">
            <div><label className="label">نوع القسم</label>
              <select className="input" value={form.section_type} onChange={(e) => setForm({ ...form, section_type: e.target.value })}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label className="label">العنوان (عربي)</label><input className="input" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} /></div>
            <div><label className="label">العنوان (إنجليزي)</label><input className="input" dir="ltr" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
            <button onClick={create} disabled={saving} className="btn-primary btn-md w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}</button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title="تعديل القسم" onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div><label className="label">العنوان (عربي)</label><input className="input" value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></div>
            <div><label className="label">العنوان (إنجليزي)</label><input className="input" dir="ltr" value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></div>
            <div><label className="label">العنوان الفرعي (عربي)</label><input className="input" value={editing.subtitle_ar ?? ""} onChange={(e) => setEditing({ ...editing, subtitle_ar: e.target.value })} /></div>
            <div><label className="label">العنوان الفرعي (إنجليزي)</label><input className="input" dir="ltr" value={editing.subtitle_en ?? ""} onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })} /></div>
            <div>
              <label className="label">المحتوى (JSON)</label>
              <textarea className="input min-h-[160px] font-mono text-xs" dir="ltr" value={JSON.stringify(editing.content, null, 2)} onChange={(e) => { try { setEditing({ ...editing, content: JSON.parse(e.target.value) }); } catch { /* ignore while typing */ } }} />
            </div>
            <button onClick={saveEdit} disabled={saving} className="btn-primary btn-md w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6" dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-950">{title}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-brand-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
