"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Save } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
}
interface Block {
  id: string;
  service_id: string;
  block_type: string;
  title_ar: string | null;
  title_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  media: any;
  display_order: number;
}

export function ServiceBlocksManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [saving, setSaving] = useState(false);

  const loadServices = useCallback(async () => {
    const res = await fetch("/api/admin/services?pageSize=500").then((r) => r.json());
    const list = (res.data?.items ?? []) as Service[];
    setServices(list);
    if (!serviceId && list.length) setServiceId(list[0].id);
  }, [serviceId]);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/service-content-blocks?pageSize=1000").then((r) => r.json());
    const all = (res.data?.items ?? []) as Block[];
    setBlocks(all.filter((b) => b.service_id === serviceId).sort((a, b) => a.display_order - b.display_order));
    setLoading(false);
  }, [serviceId]);

  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { if (serviceId) loadBlocks(); }, [serviceId, loadBlocks]);

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json;
  };

  const reorder = async (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= blocks.length) return;
    const next = [...blocks];
    const [m] = next.splice(i, 1);
    next.splice(t, 0, m);
    setBlocks(next);
    await call("POST", "/api/admin/service-content-blocks", { ids: next.map((b) => b.id) });
  };

  const remove = async (b: Block) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    await call("DELETE", `/api/admin/service-content-blocks/${b.id}`);
    loadBlocks();
  };

  const add = async () => {
    setSaving(true);
    try {
      await call("POST", "/api/admin/service-content-blocks", { service_id: serviceId, block_type: "text", title_ar: "عنوان جديد", display_order: blocks.length + 1 });
      loadBlocks();
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
      await call("PATCH", `/api/admin/service-content-blocks/${editing.id}`, editing);
      toast.success("تم الحفظ");
      setEditing(null);
      loadBlocks();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">الخدمة</label>
        <select className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">محتوى الخدمة (نصوص، صور، فيديوهات)</p>
        <button onClick={add} disabled={saving} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة عنصر</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
      ) : blocks.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">لا يوجد محتوى لهذه الخدمة</div>
      ) : (
        <div className="space-y-2">
          {blocks.map((b, i) => (
            <div key={b.id} className="card flex items-center gap-3 p-3">
              <div className="flex flex-col">
                <button onClick={() => reorder(i, -1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => reorder(i, 1)} className="rounded p-0.5 text-brand-500 hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{b.title_ar ?? b.block_type}</div>
                <div className="text-xs text-ink-muted">{b.block_type === "text" ? "نص" : b.block_type === "image" ? "صورة" : "فيديو"}</div>
              </div>
              <button onClick={() => setEditing(b)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(b)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">تعديل العنصر</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="النوع">
                <select className="input" value={editing.block_type} onChange={(e) => setEditing({ ...editing, block_type: e.target.value })}>
                  <option value="text">نص</option>
                  <option value="image">صورة</option>
                  <option value="video">فيديو</option>
                </select>
              </Field>
              <Field label="العنوان (عربي)"><input className="input" value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></Field>
              <Field label="العنوان (إنجليزي)"><input className="input" dir="ltr" value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></Field>
              {editing.block_type === "text" && (
                <>
                  <div className="sm:col-span-2"><Field label="النص (عربي)"><textarea className="input min-h-[90px]" value={editing.content_ar ?? ""} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></Field></div>
                  <div className="sm:col-span-2"><Field label="النص (إنجليزي)"><textarea className="input min-h-[90px]" dir="ltr" value={editing.content_en ?? ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} /></Field></div>
                </>
              )}
              {editing.block_type === "image" && (
                <div className="sm:col-span-2"><Field label="الصورة"><MediaPicker value={editing.media?.image ?? ""} onChange={(v) => setEditing({ ...editing, media: { ...(editing.media ?? {}), image: v } })} /></Field></div>
              )}
              {editing.block_type === "video" && (
                <div className="sm:col-span-2"><Field label="رابط الفيديو (YouTube)"><input className="input" dir="ltr" value={editing.media?.youtube_url ?? ""} onChange={(e) => setEditing({ ...editing, media: { ...(editing.media ?? {}), youtube_url: e.target.value } })} placeholder="https://youtube.com/watch?v=..." /></Field></div>
              )}
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
