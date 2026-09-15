import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/client";
import { CONTENT_TAG } from "@/lib/settings";
import type { Form, FormField } from "@/lib/types";

export const getFormByKey = unstable_cache(
  async (key: string): Promise<Form | null> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("forms")
      .select("*")
      .eq("key", key)
      .eq("is_active", true)
      .maybeSingle();
    return (data as Form | null) ?? null;
  },
  ["form-by-key"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);

export const getFormFields = unstable_cache(
  async (formId: string): Promise<FormField[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .eq("is_active", true)
      .order("display_order");
    return (data as FormField[] | null) ?? [];
  },
  ["form-fields"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);
