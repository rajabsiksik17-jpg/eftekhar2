import { requireAdminPage } from "@/lib/admin/guard";
import { FormsManager } from "@/components/admin/FormsManager";

export const dynamic = "force-dynamic";

export default async function FormsAdminPage() {
  await requireAdminPage("settings.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">النماذج (Form Builder)</h1>
        <p className="text-sm text-brand-500">إدارة نماذج التواصل وحجز الموعد وحقولها</p>
      </div>
      <FormsManager />
    </div>
  );
}
