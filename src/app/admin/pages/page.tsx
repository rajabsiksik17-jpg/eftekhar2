import { requireAdminPage } from "@/lib/admin/guard";
import { PagesManager } from "@/components/admin/PagesManager";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  await requireAdminPage("pages.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">الصفحات</h1>
        <p className="text-sm text-ink-muted">إدارة صفحات الموقع وأقسامها (الرئيسية، من نحن، تواصل معنا...)</p>
      </div>
      <PagesManager />
    </div>
  );
}
