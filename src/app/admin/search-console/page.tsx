import { requireAdminPage } from "@/lib/admin/guard";
import { createServiceClient } from "@/lib/supabase/client";
import { Globe, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchConsolePage() {
  await requireAdminPage("analytics.view");
  const service = createServiceClient();
  const { data } = await service.from("search_console_integrations").select("*").order("created_at").limit(1);
  const gsc = data?.[0];

  const connected = Boolean(gsc?.enabled && gsc?.client_email && gsc?.site_url);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">Google Search Console</h1>
        <p className="text-sm text-ink-muted">حالة تكامل Search Console</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-brand-600" />
            <div>
              <h2 className="font-bold text-brand-950">حالة الربط</h2>
              <p className="text-sm">
                {connected ? (
                  <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> متصل</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> غير متصل</span>
                )}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Site URL</dt><dd className="font-mono text-ink-secondary" dir="ltr">{gsc?.site_url || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Service Account</dt><dd className="font-mono text-ink-secondary" dir="ltr">{gsc?.client_email || "—"}</dd></div>
          </dl>
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-600">
            اربط حساب خدمة Google مع صلاحية الوصول إلى Search Console من صفحة التكاملات لعرض النقرات والانطباعات ومتوسط الترتيب.
          </p>
        </div>
      </div>
    </div>
  );
}
