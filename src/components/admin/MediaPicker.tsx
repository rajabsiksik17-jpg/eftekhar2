"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  alt_text?: string;
}

export function MediaPicker({
  value,
  onChange,
  accept = "image",
}: {
  value: string;
  onChange: (v: string) => void;
  accept?: "image" | "video" | "all";
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media?pageSize=200").then((r) => r.json());
      setItems(res.data?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

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
      load();
      toast.success("تم الرفع");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الرفع");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحذف");
    }
  };

  const isImage = value && /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(value);

  const filtered = items.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.filename.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-16 w-24 rounded-lg object-cover" />
          ) : (
            <span className="flex h-16 w-24 items-center justify-center rounded-lg bg-brand-50 text-brand-300">
              <ImageIcon className="h-6 w-6" />
            </span>
          )
        ) : (
          <span className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-brand-300">
            <ImageIcon className="h-6 w-6" />
          </span>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn-outline btn-sm w-fit">
            {value ? "تغيير من المكتبة" : "اختيار من المكتبة"}
          </button>
          <label className="btn-outline btn-sm w-fit cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            رفع مباشر
            <input type="file" accept={accept === "image" ? "image/*" : accept === "video" ? "video/*" : "*/*"} className="hidden" onChange={upload} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="btn-ghost btn-sm w-fit text-red-600">إزالة</button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-5" dir="rtl">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث..." className="input ps-9" />
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-brand-500 hover:bg-brand-50"><X className="h-5 w-5" /></button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
            ) : (
              <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
                {filtered.map((m) => (
                  <div key={m.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(m.url);
                        setOpen(false);
                      }}
                      className={cn(
                        "block aspect-square w-full overflow-hidden rounded-xl border bg-brand-50",
                        value === m.url ? "border-brand-500 ring-2 ring-brand-500/30" : "border-brand-950/10 hover:border-brand-400",
                      )}
                    >
                      {/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(m.url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.alt_text ?? m.filename} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-brand-300"><ImageIcon className="h-6 w-6" /></span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); remove(m.id); }}
                      className="absolute top-1 end-1 hidden h-6 w-6 items-center justify-center rounded bg-red-500 text-white group-hover:flex"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
