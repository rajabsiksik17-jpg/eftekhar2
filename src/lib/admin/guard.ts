import { redirect } from "next/navigation";
import { requireAdmin, type AdminContext } from "@/lib/auth";

export async function requireAdminPage(permission?: string): Promise<AdminContext> {
  try {
    return await requireAdmin(permission);
  } catch {
    redirect("/admin/login");
  }
}
