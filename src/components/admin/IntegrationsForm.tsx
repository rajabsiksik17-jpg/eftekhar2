"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function IntegrationsForm() {
  const [data, setData] = useState<{ ga4: Record<string, unknown>; searchConsole: Record<string, unknown> } | null>(null);
  const [ga4, setGa4] = useState<Record<string, unknown>>({});
  const [sc, setSc] = useState<Record<string, unknown>>({});
  const [scKey, setScKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/integrations").then((r) => r.json()).then((j) => {
      setData(j.data);
      setGa4(j.data?.ga4 ?? {});
      setSc(j.data?.searchConsole ?? {});
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ga4,
          searchConsole: { ...sc, private_key: scKey || undefined },
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم الحفظ");
      setScKey("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-4 font-bold text-brand-950">Google Analytics 4</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Measurement ID</label>
            <input className="input" dir="ltr" value={String(ga4.measurement_id ?? "")} onChange={(e) => setGa4({ ...ga4, measurement_id: e.target.value })} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 rounded-xl border border-brand-950/15 px-4 py-2.5">
              <input type="checkbox" checked={Boolean(ga4.enabled)} onChange={(e) => setGa4({ ...ga4, enabled: e.target.checked })} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
              <span className="text-sm font-medium text-ink-secondary">مفعّل</span>
            </label>
          </div>
        </div>
        <p className="mt-3 text-xs text-brand-400">ضع أيضًا نفس المعرّف في متغير البيئة NEXT_PUBLIC_GOOGLE_ANALYTICS_ID لتفعيل التتبع على الموقع.</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-brand-950">Google Search Console</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Site URL</label>
            <input className="input" dir="ltr" value={String(sc.site_url ?? "")} onChange={(e) => setSc({ ...sc, site_url: e.target.value })} />
          </div>
          <div>
            <label className="label">Service Account Email</label>
            <input className="input" dir="ltr" value={String(sc.client_email ?? "")} onChange={(e) => setSc({ ...sc, client_email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Service Account Private Key</label>
            <textarea className="input min-h-[100px] font-mono text-xs" dir="ltr" value={scKey} onChange={(e) => setScKey(e.target.value)} placeholder="-----BEGIN PRIVATE KEY-----" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 rounded-xl border border-brand-950/15 px-4 py-2.5">
              <input type="checkbox" checked={Boolean(sc.enabled)} onChange={(e) => setSc({ ...sc, enabled: e.target.checked })} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
              <span className="text-sm font-medium text-ink-secondary">مفعّل</span>
            </label>
          </div>
        </div>
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
