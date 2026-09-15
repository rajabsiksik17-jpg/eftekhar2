"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, ShieldCheck } from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  login_at: string;
  last_active_at: string;
  is_current: boolean;
}

export function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/auth/sessions");
    const json = await res.json();
    setSessions(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (id: string) => {
    await fetch("/api/admin/auth/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("تم إلغاء الجلسة");
    load();
  };

  const revokeAll = async () => {
    if (!confirm("هل تريد تسجيل الخروج من جميع الأجهزة؟")) return;
    await fetch("/api/admin/auth/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    toast.success("تم تسجيل الخروج من جميع الأجهزة");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="card flex items-center gap-4 border border-green-200 bg-green-50 p-5">
        <ShieldCheck className="h-8 w-8 text-green-600" />
        <div>
          <h2 className="font-bold text-brand-950">حماية مزدوجة مفعّلة</h2>
          <p className="text-sm text-brand-600">كل جلسة تسجيل دخول تتطلب رمز تحقق (OTP) مرسل إلى بريدك الإلكتروني.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={revokeAll} className="btn-outline btn-md text-red-600"><Trash2 className="h-4 w-4" /> تسجيل الخروج من جميع الأجهزة</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-950/10 bg-brand-50/50">
              <th className="px-4 py-3 text-start">الجهاز</th>
              <th className="px-4 py-3 text-start">المتصفح</th>
              <th className="px-4 py-3 text-start">النظام</th>
              <th className="px-4 py-3 text-start">IP</th>
              <th className="px-4 py-3 text-start">آخر نشاط</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-600" /></td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-ink-muted">لا توجد جلسات</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="border-b border-brand-950/5">
                  <td className="px-4 py-3 text-ink-secondary">
                    {s.device} {s.is_current && <span className="ms-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">الحالية</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{s.browser}</td>
                  <td className="px-4 py-3 text-ink-secondary">{s.os}</td>
                  <td className="px-4 py-3 text-brand-600" dir="ltr">{s.ip ?? "—"}</td>
                  <td className="px-4 py-3 text-brand-600">{new Date(s.last_active_at).toLocaleString("ar")}</td>
                  <td className="px-4 py-3 text-end">
                    {!s.is_current && (
                      <button onClick={() => revoke(s.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
