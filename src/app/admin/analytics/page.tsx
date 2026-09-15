import { requireAdminPage } from "@/lib/admin/guard";
import { createServiceClient } from "@/lib/supabase/client";
import { BarChart3, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdminPage("analytics.view");
  const service = createServiceClient();
  const { data } = await service.from("analytics_integrations").select("*").order("created_at").limit(1);
  const ga4 = data?.[0];
  const envId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  const connected = Boolean(ga4?.enabled && (ga4?.measurement_id || envId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">Google Analytics</h1>
        <p className="text-sm text-ink-muted">حالة تكامل Google Analytics 4</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-brand-600" />
            <div>
              <h2 className="font-bold text-brand-950">حالة التتبع</h2>
              <p className="text-sm text-brand-600">
                {connected ? (
                  <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> مفعّل</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> غير مفعّل</span>
                )}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Measurement ID</dt><dd className="font-mono text-ink-secondary" dir="ltr">{ga4?.measurement_id || envId || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">معرّف البيئة</dt><dd className="font-mono text-ink-secondary" dir="ltr">{envId || "—"}</dd></div>
          </dl>
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-600">
            فعّل التتبع من صفحة التكاملات واضبط NEXT_PUBLIC_GOOGLE_ANALYTICS_ID في متغيرات البيئة. التقارير التفصيلية (المستخدمون، الجلسات، الصفحات) تظهر هنا عند ربط حساب الخدمة في Google Analytics Data API.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-brand-950">نظرة عامة</h2>
          <p className="mt-2 text-sm text-brand-600">
            يتم تتبع زيارات الموقع والتحويلات (حجز موعد، تواصل) تلقائيًا عبر أحداث GA4 القياسية عند تفعيل التتبع.
          </p>
        </div>
      </div>
    </div>
  );
}
