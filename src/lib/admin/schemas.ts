import { ICON_NAMES } from "@/components/icons";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "video"
  | "date"
  | "url"
  | "json"
  | "icon"
  | "services";

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  dir?: "ltr";
  options?: { value: string; label: string }[];
  rows?: number;
  help?: string;
}

export interface Column {
  key: string;
  label: string;
  type?: "text" | "boolean" | "date" | "badge";
  badgeMap?: Record<string, string>;
}

export interface EntitySchema {
  label: string;
  singular: string;
  columns: Column[];
  fields: Field[];
  titleField: string; // key used as main identifier
  baseFilter?: Record<string, unknown>;
  hiddenDefaults?: Record<string, unknown>;
  listPageSize?: number;
  readOnly?: boolean;
}

const iconField = (label = "الأيقونة"): Field => ({
  name: "icon",
  type: "icon",
  label,
});

const seoFields: Field[] = [
  { name: "seo_title_ar", type: "text", label: "عنوان SEO (عربي)", dir: "ltr" },
  { name: "seo_title_en", type: "text", label: "عنوان SEO (إنجليزي)", dir: "ltr" },
  { name: "seo_description_ar", type: "textarea", label: "وصف SEO (عربي)", rows: 2 },
  { name: "seo_description_en", type: "textarea", label: "وصف SEO (إنجليزي)", rows: 2 },
  { name: "seo_keywords_ar", type: "text", label: "كلمات مفتاحية (عربي)", dir: "ltr" },
  { name: "seo_keywords_en", type: "text", label: "كلمات مفتاحية (إنجليزي)", dir: "ltr" },
  { name: "canonical", type: "url", label: "Canonical URL", dir: "ltr" },
  { name: "og_image", type: "image", label: "صورة OpenGraph" },
];

export const SCHEMAS: Record<string, EntitySchema> = {
  services: {
    label: "الخدمات",
    singular: "خدمة",
    titleField: "name_ar",
    columns: [
      { key: "name_ar", label: "الاسم" },
      { key: "name_en", label: "English" },
      { key: "slug", label: "Slug" },
      { key: "is_featured", label: "مميز", type: "boolean" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "name_ar", type: "text", label: "الاسم (عربي)", required: true },
      { name: "name_en", type: "text", label: "الاسم (إنجليزي)", required: true, dir: "ltr" },
      { name: "slug", type: "text", label: "Slug", required: true, dir: "ltr" },
      { name: "category_id", type: "text", label: "معرّف التصنيف (UUID)", help: "اختر التصنيف من صفحة التصنيفات وانسخ المعرّف هنا." },
      { name: "description_ar", type: "textarea", label: "الوصف القصير (عربي)", rows: 4 },
      { name: "description_en", type: "textarea", label: "الوصف القصير (إنجليزي)", rows: 4 },
      { name: "content_ar", type: "textarea", label: "الوصف الطويل / المحتوى (عربي)", rows: 6 },
      { name: "content_en", type: "textarea", label: "الوصف الطويل / المحتوى (إنجليزي)", rows: 6 },
      { name: "icon", type: "icon", label: "الأيقونة" },
      { name: "image", type: "image", label: "الصورة" },
      { name: "is_featured", type: "boolean", label: "مميز" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
      ...seoFields,
    ],
  },
  "service-categories": {
    label: "التصنيفات",
    singular: "تصنيف",
    titleField: "name_ar",
    columns: [
      { key: "name_ar", label: "الاسم" },
      { key: "name_en", label: "English" },
      { key: "slug", label: "Slug" },
      { key: "is_featured", label: "مميز", type: "boolean" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "name_ar", type: "text", label: "الاسم (عربي)", required: true },
      { name: "name_en", type: "text", label: "الاسم (إنجليزي)", required: true, dir: "ltr" },
      { name: "slug", type: "text", label: "Slug", required: true, dir: "ltr" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 3 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 3 },
      { name: "content_ar", type: "textarea", label: "المحتوى (عربي)", rows: 4 },
      { name: "content_en", type: "textarea", label: "المحتوى (إنجليزي)", rows: 4 },
      iconField(),
      { name: "cover_image", type: "image", label: "صورة الغلاف" },
      { name: "is_featured", type: "boolean", label: "مميز" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
      ...seoFields,
    ],
  },
  doctors: {
    label: "الأطباء",
    singular: "طبيب",
    titleField: "name_ar",
    baseFilter: { type: "doctor" },
    hiddenDefaults: { type: "doctor" },
    columns: [
      { key: "name_ar", label: "الاسم" },
      { key: "specialty_ar", label: "التخصص" },
      { key: "is_featured", label: "مميز", type: "boolean" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "name_ar", type: "text", label: "الاسم (عربي)", required: true },
      { name: "name_en", type: "text", label: "الاسم (إنجليزي)", required: true, dir: "ltr" },
      { name: "slug", type: "text", label: "Slug", dir: "ltr" },
      { name: "specialty_ar", type: "text", label: "التخصص (عربي)" },
      { name: "specialty_en", type: "text", label: "التخصص (إنجليزي)", dir: "ltr" },
      { name: "bio_ar", type: "textarea", label: "نبذة (عربي)", rows: 3 },
      { name: "bio_en", type: "textarea", label: "نبذة (إنجليزي)", rows: 3 },
      { name: "image", type: "image", label: "الصورة" },
      { name: "qualifications", type: "text", label: "المؤهلات", help: "لا تقم بإضافة مؤهلات غير موثقة." },
      { name: "experience_years", type: "number", label: "سنوات الخبرة" },
      { name: "is_featured", type: "boolean", label: "مميز" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
      ...seoFields,
    ],
  },
  staff: {
    label: "الموظفون",
    singular: "موظف",
    titleField: "name_ar",
    baseFilter: { type: "staff" },
    hiddenDefaults: { type: "staff" },
    columns: [
      { key: "name_ar", label: "الاسم" },
      { key: "position", label: "المنصب" },
      { key: "is_active", label: "نشط", type: "boolean" },
    ],
    fields: [
      { name: "name_ar", type: "text", label: "الاسم (عربي)", required: true },
      { name: "name_en", type: "text", label: "الاسم (إنجليزي)", required: true, dir: "ltr" },
      { name: "type", type: "select", label: "النوع", options: [
        { value: "staff", label: "موظف" },
        { value: "management", label: "إدارة" },
        { value: "consultant", label: "استشاري" },
        { value: "other", label: "أخرى" },
      ] },
      { name: "position", type: "text", label: "المنصب" },
      { name: "bio_ar", type: "textarea", label: "نبذة (عربي)", rows: 3 },
      { name: "bio_en", type: "textarea", label: "نبذة (إنجليزي)", rows: 3 },
      { name: "image", type: "image", label: "الصورة" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  appointments: {
    label: "المواعيد",
    singular: "موعد",
    titleField: "name",
    readOnly: true,
    columns: [
      { key: "name", label: "الاسم" },
      { key: "phone", label: "الهاتف" },
      { key: "preferred_date", label: "التاريخ" },
      { key: "preferred_time", label: "الوقت" },
      { key: "status", label: "الحالة", type: "badge", badgeMap: {
        new: "جديد", pending: "قيد الانتظار", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي", no_show: "لم يحضر",
      } },
      { key: "created_at", label: "أُنشئ", type: "date" },
    ],
    fields: [
      { name: "name", type: "text", label: "الاسم" },
      { name: "phone", type: "text", label: "الهاتف", dir: "ltr" },
      { name: "email", type: "text", label: "البريد الإلكتروني", dir: "ltr" },
      { name: "preferred_date", type: "date", label: "التاريخ المفضل" },
      { name: "preferred_time", type: "text", label: "الوقت المفضل", dir: "ltr" },
      { name: "status", type: "select", label: "الحالة", options: [
        { value: "new", label: "جديد" }, { value: "pending", label: "قيد الانتظار" },
        { value: "confirmed", label: "مؤكد" }, { value: "completed", label: "مكتمل" },
        { value: "cancelled", label: "ملغي" }, { value: "no_show", label: "لم يحضر" },
      ] },
      { name: "message", type: "textarea", label: "الرسالة", rows: 3 },
      { name: "notes", type: "textarea", label: "ملاحظات داخلية", rows: 3 },
    ],
  },
  messages: {
    label: "الرسائل",
    singular: "رسالة",
    titleField: "name",
    columns: [
      { key: "name", label: "الاسم" },
      { key: "email", label: "البريد" },
      { key: "subject", label: "الموضوع" },
      { key: "is_read", label: "مقروءة", type: "boolean" },
      { key: "created_at", label: "أُنشئت", type: "date" },
    ],
    fields: [
      { name: "name", type: "text", label: "الاسم" },
      { name: "phone", type: "text", label: "الهاتف", dir: "ltr" },
      { name: "email", type: "text", label: "البريد الإلكتروني", dir: "ltr" },
      { name: "subject", type: "text", label: "الموضوع" },
      { name: "message", type: "textarea", label: "الرسالة", rows: 5 },
      { name: "is_read", type: "boolean", label: "مقروءة" },
      { name: "is_archived", type: "boolean", label: "مؤرشفة" },
    ],
  },
  gallery: {
    label: "معرض الصور",
    singular: "صورة",
    titleField: "title_ar",
    columns: [
      { key: "title_ar", label: "العنوان" },
      { key: "type", label: "النوع" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "type", type: "select", label: "النوع", options: [
        { value: "normal", label: "صورة عادية" }, { value: "before_after", label: "قبل/بعد" },
      ] },
      { name: "title_ar", type: "text", label: "العنوان (عربي)" },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", dir: "ltr" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 2 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 2 },
      { name: "image", type: "image", label: "الصورة (للنوع العادي)" },
      { name: "before_image", type: "image", label: "صورة قبل" },
      { name: "after_image", type: "image", label: "صورة بعد" },
      { name: "service_id", type: "services", label: "الخدمة المرتبطة (اختياري)" },
      { name: "alt_text", type: "text", label: "النص البديل (Alt)" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  videos: {
    label: "الفيديوهات",
    singular: "فيديو",
    titleField: "title_ar",
    columns: [
      { key: "title_ar", label: "العنوان" },
      { key: "title_en", label: "English" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "title_ar", type: "text", label: "العنوان (عربي)", required: true },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", required: true, dir: "ltr" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 2 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 2 },
      { name: "youtube_url", type: "video", label: "الفيديو (رابط YouTube أو رفع ملف)", required: true, dir: "ltr" },
      { name: "thumbnail", type: "image", label: "الصورة المصغّرة" },
      { name: "autoplay", type: "boolean", label: "تشغيل تلقائي" },
      { name: "muted", type: "boolean", label: "كتم الصوت" },
      { name: "controls", type: "boolean", label: "أزرار التحكم" },
      { name: "loop", type: "boolean", label: "تكرار" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  testimonials: {
    label: "التقييمات",
    singular: "تقييم",
    titleField: "name_ar",
    columns: [
      { key: "name_ar", label: "الاسم" },
      { key: "rating", label: "التقييم" },
      { key: "source", label: "المصدر" },
      { key: "is_active", label: "نشط", type: "boolean" },
    ],
    fields: [
      { name: "name_ar", type: "text", label: "الاسم (عربي)" },
      { name: "name_en", type: "text", label: "الاسم (إنجليزي)", dir: "ltr" },
      { name: "rating", type: "number", label: "التقييم (1-5)" },
      { name: "review_ar", type: "textarea", label: "التقييم (عربي)", rows: 3 },
      { name: "review_en", type: "textarea", label: "التقييم (إنجليزي)", rows: 3 },
      { name: "source", type: "select", label: "المصدر", options: [
        { value: "manual", label: "يدوي" }, { value: "google", label: "Google" }, { value: "website", label: "الموقع" },
      ] },
      { name: "google_url", type: "url", label: "رابط Google", dir: "ltr" },
      { name: "is_demo", type: "boolean", label: "تقييم تجريبي", help: "ضع علامة على التقييمات التجريبية فقط — لا تنشر تقييمات وهمية كتقييمات Google حقيقية." },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  "before-after": {
    label: "قبل / بعد",
    singular: "عنصر",
    titleField: "title_ar",
    baseFilter: { type: "before_after" },
    hiddenDefaults: { type: "before_after" },
    columns: [
      { key: "title_ar", label: "العنوان" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "title_ar", type: "text", label: "العنوان (عربي)" },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", dir: "ltr" },
      { name: "before_image", type: "image", label: "صورة قبل", required: true },
      { name: "after_image", type: "image", label: "صورة بعد", required: true },
      { name: "service_id", type: "services", label: "الخدمة المرتبطة (اختياري)" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 2 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 2 },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  media: {
    label: "مكتبة الوسائط",
    singular: "ملف",
    titleField: "filename",
    columns: [
      { key: "filename", label: "الملف" },
      { key: "mime_type", label: "النوع" },
      { key: "size_bytes", label: "الحجم" },
      { key: "created_at", label: "أُنشئ", type: "date" },
    ],
    fields: [
      { name: "filename", type: "text", label: "اسم الملف" },
      { name: "alt_text", type: "text", label: "النص البديل" },
      { name: "category", type: "text", label: "التصنيف" },
    ],
  },
  pages: {
    label: "الصفحات",
    singular: "صفحة",
    titleField: "title_ar",
    columns: [
      { key: "title_ar", label: "العنوان" },
      { key: "slug", label: "Slug" },
      { key: "type", label: "النوع" },
      { key: "is_active", label: "نشط", type: "boolean" },
    ],
    fields: [
      { name: "slug", type: "text", label: "Slug", required: true, dir: "ltr" },
      { name: "type", type: "select", label: "النوع", options: [
        { value: "custom", label: "مخصصة" }, { value: "home", label: "الرئيسية" },
        { value: "about", label: "من نحن" }, { value: "contact", label: "تواصل" }, { value: "legal", label: "قانونية" },
      ] },
      { name: "title_ar", type: "text", label: "العنوان (عربي)" },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", dir: "ltr" },
      { name: "content_ar", type: "textarea", label: "المحتوى (عربي)", rows: 6 },
      { name: "content_en", type: "textarea", label: "المحتوى (إنجليزي)", rows: 6 },
      { name: "is_active", type: "boolean", label: "نشط" },
      ...seoFields,
    ],
  },
  navigation: {
    label: "القائمة",
    singular: "عنصر",
    titleField: "label_ar",
    columns: [
      { key: "label_ar", label: "العنوان" },
      { key: "url", label: "الرابط" },
      { key: "parent_id", label: "فرعي؟", type: "boolean" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "label_ar", type: "text", label: "العنوان (عربي)", required: true },
      { name: "label_en", type: "text", label: "العنوان (إنجليزي)", required: true, dir: "ltr" },
      { name: "url", type: "text", label: "الرابط", required: true, dir: "ltr", help: "مثل /about أو /services أو رابط خارجي كامل." },
      { name: "parent_id", type: "text", label: "معرّف العنصر الأب (للقوائم الفرعية)", dir: "ltr", help: "اتركه فارغًا ليكون عنصرًا رئيسيًا. ضع معرّف العنصر الأب لعرضه داخل قائمة منسدلة." },
      { name: "is_external", type: "boolean", label: "رابط خارجي" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  "social-links": {
    label: "مواقع التواصل",
    singular: "منصة",
    titleField: "platform",
    columns: [
      { key: "platform", label: "المنصة" },
      { key: "url", label: "الرابط" },
      { key: "is_active", label: "مفعّل", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "platform", type: "select", label: "المنصة", options: [
        { value: "Facebook", label: "Facebook" }, { value: "Instagram", label: "Instagram" },
        { value: "TikTok", label: "TikTok" }, { value: "YouTube", label: "YouTube" },
        { value: "WhatsApp", label: "WhatsApp" }, { value: "Snapchat", label: "Snapchat" },
        { value: "LinkedIn", label: "LinkedIn" }, { value: "X", label: "X (Twitter)" },
        { value: "Telegram", label: "Telegram" },
      ] },
      { name: "url", type: "url", label: "الرابط", dir: "ltr" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "مفعّل" },
    ],
  },
  "hero-slides": {
    label: "شرائح الواجهة",
    singular: "شريحة",
    titleField: "title_ar",
    columns: [
      { key: "title_ar", label: "العنوان" },
      { key: "subtitle_ar", label: "العنوان الفرعي" },
      { key: "is_active", label: "نشط", type: "boolean" },
      { key: "display_order", label: "الترتيب" },
    ],
    fields: [
      { name: "title_ar", type: "text", label: "العنوان (عربي)" },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", dir: "ltr" },
      { name: "subtitle_ar", type: "text", label: "العنوان الفرعي (عربي)" },
      { name: "subtitle_en", type: "text", label: "العنوان الفرعي (إنجليزي)", dir: "ltr" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 3 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 3 },
      { name: "bullets", type: "json", label: "النقاط (JSON)", help: 'مثال: [{"icon":"Check","ar":"نص","en":"Text"}]' },
      { name: "primary_button", type: "json", label: "الزر الأساسي (JSON)", help: '{"label_ar":"احجز موعد","label_en":"Book","url":"/appointment"}' },
      { name: "secondary_button", type: "json", label: "الزر الثانوي (JSON)" },
      { name: "image", type: "image", label: "الصورة" },
      { name: "background_image", type: "image", label: "صورة الخلفية" },
      { name: "background_color", type: "text", label: "لون الخلفية", dir: "ltr" },
      { name: "overlay", type: "number", label: "شفافية التغطية (0-1)" },
      { name: "text_align", type: "select", label: "محاذاة النص", options: [
        { value: "right", label: "يمين" }, { value: "center", label: "وسط" }, { value: "left", label: "يسار" },
      ] },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
  "audit-logs": {
    label: "سجل النشاط",
    singular: "سجل",
    titleField: "action",
    columns: [
      { key: "action", label: "الإجراء" },
      { key: "entity", label: "الكيان" },
      { key: "ip", label: "IP" },
      { key: "created_at", label: "الوقت", type: "date" },
    ],
    fields: [],
  },
  seo: {
    label: "إعدادات SEO",
    singular: "إعداد",
    titleField: "route",
    columns: [
      { key: "route", label: "المسار" },
      { key: "title_ar", label: "العنوان (عربي)" },
      { key: "title_en", label: "English" },
    ],
    fields: [
      { name: "route", type: "text", label: "المسار", required: true, dir: "ltr", help: "مثل /services أو /doctors" },
      { name: "title_ar", type: "text", label: "العنوان (عربي)", dir: "ltr" },
      { name: "title_en", type: "text", label: "العنوان (إنجليزي)", dir: "ltr" },
      { name: "description_ar", type: "textarea", label: "الوصف (عربي)", rows: 2 },
      { name: "description_en", type: "textarea", label: "الوصف (إنجليزي)", rows: 2 },
      { name: "keywords_ar", type: "text", label: "كلمات مفتاحية (عربي)", dir: "ltr" },
      { name: "keywords_en", type: "text", label: "كلمات مفتاحية (إنجليزي)", dir: "ltr" },
      { name: "canonical", type: "url", label: "Canonical", dir: "ltr" },
      { name: "og_title", type: "text", label: "OpenGraph Title", dir: "ltr" },
      { name: "og_description", type: "textarea", label: "OpenGraph Description", rows: 2 },
      { name: "og_image", type: "image", label: "OpenGraph Image" },
      { name: "twitter_title", type: "text", label: "Twitter Title", dir: "ltr" },
      { name: "twitter_description", type: "textarea", label: "Twitter Description", rows: 2 },
      { name: "twitter_image", type: "image", label: "Twitter Image" },
      { name: "robots", type: "text", label: "Robots", dir: "ltr" },
      { name: "structured_data", type: "json", label: "Structured Data (JSON)", help: "بيانات Schema.org بتنسيق JSON" },
    ],
  },
  statistics: {
    label: "الإحصائيات",
    singular: "إحصائية",
    titleField: "label_ar",
    columns: [
      { key: "number", label: "الرقم" },
      { key: "label_ar", label: "التسمية" },
      { key: "suffix", label: "اللاحقة" },
      { key: "is_active", label: "نشط", type: "boolean" },
    ],
    fields: [
      { name: "number", type: "number", label: "الرقم", required: true },
      { name: "label_ar", type: "text", label: "التسمية (عربي)", required: true },
      { name: "label_en", type: "text", label: "التسمية (إنجليزي)", required: true, dir: "ltr" },
      iconField(),
      { name: "prefix", type: "text", label: "البادئة", dir: "ltr" },
      { name: "suffix", type: "text", label: "اللاحقة", dir: "ltr" },
      { name: "display_order", type: "number", label: "الترتيب" },
      { name: "is_active", type: "boolean", label: "نشط" },
    ],
  },
};

export function getSchema(entity: string): EntitySchema | null {
  return SCHEMAS[entity] ?? null;
}
