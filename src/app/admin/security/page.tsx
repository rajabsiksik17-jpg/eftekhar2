import { requireAdminPage } from "@/lib/admin/guard";
import { SecurityPage } from "@/components/admin/SecurityPage";

export const dynamic = "force-dynamic";

export default async function SecurityAdminPage() {
  await requireAdminPage("security.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">الأمان</h1>
        <p className="text-sm text-brand-500">إدارة الجلسات النشطة</p>
      </div>
      <SecurityPage />
    </div>
  );
}
