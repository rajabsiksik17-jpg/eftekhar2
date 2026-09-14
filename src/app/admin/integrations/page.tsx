import { requireAdminPage } from "@/lib/admin/guard";
import { IntegrationsForm } from "@/components/admin/IntegrationsForm";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  await requireAdminPage("settings.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">التكاملات</h1>
        <p className="text-sm text-brand-500">Google Analytics و Search Console</p>
      </div>
      <IntegrationsForm />
    </div>
  );
}
