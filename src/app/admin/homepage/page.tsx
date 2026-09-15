import { requireAdminPage } from "@/lib/admin/guard";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  await requireAdminPage("pages.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">الرئيسية (منشئ الصفحات)</h1>
        <p className="text-sm text-ink-muted">أضف واحذف ورتّب أقسام الصفحة الرئيسية</p>
      </div>
      <HomepageBuilder />
    </div>
  );
}
