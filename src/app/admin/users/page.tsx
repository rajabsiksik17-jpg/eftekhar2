import { requireAdminPage } from "@/lib/admin/guard";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdminPage("users.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">المستخدمون</h1>
        <p className="text-sm text-brand-500">إدارة المستخدمين وأدوارهم</p>
      </div>
      <UsersManager />
    </div>
  );
}
