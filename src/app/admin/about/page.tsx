import { requireAdminPage } from "@/lib/admin/guard";
import { AboutSectionsManager } from "@/components/admin/AboutSectionsManager";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  await requireAdminPage("pages.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">صفحة من نحن</h1>
        <p className="text-sm text-ink-muted">أقسام الصورة والنص والأزرار في صفحة "من نحن"</p>
      </div>
      <AboutSectionsManager />
    </div>
  );
}
