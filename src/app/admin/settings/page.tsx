import { requireAdminPage } from "@/lib/admin/guard";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminPage("settings.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">معلومات الموقع</h1>
        <p className="text-sm text-ink-muted">إعدادات الموقع والتواصل والفوتر</p>
      </div>
      <SiteSettingsForm />
    </div>
  );
}
