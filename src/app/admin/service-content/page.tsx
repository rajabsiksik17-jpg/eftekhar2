import { requireAdminPage } from "@/lib/admin/guard";
import { ServiceBlocksManager } from "@/components/admin/ServiceBlocksManager";

export const dynamic = "force-dynamic";

export default async function ServiceContentAdminPage() {
  await requireAdminPage("services.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">محتوى الخدمات</h1>
        <p className="text-sm text-ink-muted">الوصف الكامل والصور والفيديوهات لكل خدمة</p>
      </div>
      <ServiceBlocksManager />
    </div>
  );
}
