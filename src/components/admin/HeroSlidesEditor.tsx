"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Save } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { VideoInput } from "@/components/admin/VideoInput";

interface Slide {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  image: string | null;
  mobile_image: string | null;
  background_image: string | null;
  video_url: string | null;
  background_color: string | null;
  overlay: number;
  text_align: string;
  primary_button: { label_ar?: string; label_en?: string; url?: string } | null;
  secondary_button: { label_ar?: string; label_en?: string; url?: string } | null;
  display_order: number;
  is_active: boolean;
}

export function HeroSlidesEditor() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/hero-slides?pageSize=100").then((r) => r.json());
    setSlides((res.data?.items ?? []).sort((a: Slide, b: Slide) => a.display_order - b.display_order));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json;
  };

  const reorder = async (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= slides.length) return;
    const next = [...slides];
    const [m] = next.splice(i, 1);
    next.splice(t, 0, m);
    setSlides(next);
    await call("POST", "/api/admin/hero-slides", { ids: next.map((s) => s.id) });
  };

  const toggle = async (s: Slide) => {
    await call("PATCH", `/api/admin/hero-slides/${s.id}`, { is_active: !s.is_active });
    load();
  };

  const remove = async (s: Slide) => {
    if (!confirm("حذف هذه الشريحة؟")) return;
    await call("DELETE", `/api/admin/hero-slides/${s.id}`);
    load();
  };

  const add = async () => {
    setSaving(true);
    try {
      await call("POST", "/api/admin/hero-slides", { title_ar: "شريحة جديدة", title_en: "New Slide", display_order: slides.length + 1 });
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
      await call("PATCH", `/api/admin/hero-slides/${editing.id}`, editing);
      toast.success("تم الحفظ");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink">شرائح الواجهة (Hero)</h3>
        <button onClick={add} disabled={saving} className="btn-outline btn-sm"><Plus className="h-4 w-4" /> شريحة</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
      ) : slides.length === 0 ? (
        <p className="text-sm text-ink-muted">لا توجد شرائح</p>
      ) : (
        slides.map((s, i) => (
          <div key={s.id} className={cn("card flex items-center gap-3 p-3", !s.is_active && "opacity-60")}>
            {s.background_image || s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.background_image ?? s.image ?? ""} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="h-14 w-24 shrink-0 rounded-lg bg-brand-50" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{s.title_ar ?? "—"}</div>
              <div className="text-xs text-ink-muted">{s.video_url ? "فيديو" : "صورة"}</div>
            </div>
            <button onClick={() => reorder(i, -1)} className="rounded p-1 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
            <button onClick={() => reorder(i, 1)} className="rounded p-1 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
            <button onClick={() => toggle(s)} className="rounded p-1 text-brand-500 hover:bg-brand-100">{s.is_active ? "إخفاء" : "إظهار"}</button>
            <button onClick={() => setEditing(s)} className="rounded p-1 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(s)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">تعديل الشريحة</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="العنوان (عربي)"><input className="input" value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></Field>
              <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></Field>
              <Field label="العنوان الفرعي (عربي)"><input className="input" value={editing.subtitle_ar ?? ""} onChange={(e) => setEditing({ ...editing, subtitle_ar: e.target.value })} /></Field>
              <Field label="العنوان الفرعي (إنجليزي)"><input className="input" dir="ltr" value={editing.subtitle_en ?? ""} onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="الوصف (عربي)"><textarea className="input min-h-[70px]" value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="الوصف (إنجليزي)"><textarea className="input min-h-[70px]" dir="ltr" value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></Field></div>
              <Field label="صورة الخلفية"><MediaPicker value={editing.background_image ?? ""} onChange={(v) => setEditing({ ...editing, background_image: v })} /></Field>
              <Field label="الصورة"><MediaPicker value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} /></Field>
              <Field label="الفيديو"><VideoInput value={editing.video_url ?? ""} onChange={(v) => setEditing({ ...editing, video_url: v })} /></Field>
              <Field label="الشفافية (0-1)"><input className="input" dir="ltr" type="number" step="0.1" value={editing.overlay} onChange={(e) => setEditing({ ...editing, overlay: Number(e.target.value) })} /></Field>
              <Field label="زر أساسي (عربي)"><input className="input" value={editing.primary_button?.label_ar ?? ""} onChange={(e) => setEditing({ ...editing, primary_button: { ...(editing.primary_button ?? {}), label_ar: e.target.value } })} /></Field>
              <Field label="رابط الزر الأساسي"><input className="input" dir="ltr" value={editing.primary_button?.url ?? ""} onChange={(e) => setEditing({ ...editing, primary_button: { ...(editing.primary_button ?? {}), url: e.target.value } })} /></Field>
              <Field label="زر ثانوي (عربي)"><input className="input" value={editing.secondary_button?.label_ar ?? ""} onChange={(e) => setEditing({ ...editing, secondary_button: { ...(editing.secondary_button ?? {}), label_ar: e.target.value } })} /></Field>
              <Field label="رابط الزر الثانوي"><input className="input" dir="ltr" value={editing.secondary_button?.url ?? ""} onChange={(e) => setEditing({ ...editing, secondary_button: { ...(editing.secondary_button ?? {}), url: e.target.value } })} /></Field>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-brand-950/10 pt-4">
              <button onClick={() => setEditing(null)} className="btn-ghost btn-md">إلغاء</button>
              <button onClick={save} disabled={saving} className="btn-primary btn-md">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
