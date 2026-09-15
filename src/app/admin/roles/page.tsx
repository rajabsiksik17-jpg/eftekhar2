import { requireAdminPage } from "@/lib/admin/guard";
import { RolesManager } from "@/components/admin/RolesManager";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await requireAdminPage("users.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">الأدوار والصلاحيات</h1>
        <p className="text-sm text-ink-muted">إدارة الأدوار وصلاحياتها</p>
      </div>
      <RolesManager />
    </div>
  );
}
