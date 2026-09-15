import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getVideos } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { VideoGallery } from "@/components/videos/VideoGallery";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return buildMetadata({ lang, route: "/videos" });
}

export default async function VideosPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const videos = await getVideos();

  return (
    <>
      <PageHero
        title={lang === "ar" ? "معرض الفيديوهات" : "Video Gallery"}
        subtitle={
          lang === "ar" ? "شاهد فيديوهاتنا للتعرف على خدماتنا وعيادتنا." : "Watch our videos to learn about our services and clinic."
        }
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "معرض الفيديوهات" : "Videos" }]} lang={lang} />}
      />
      <section className="py-16">
        <div className="container-px">
          {videos.length === 0 ? (
            <p className="text-center text-ink-muted">{lang === "ar" ? "لا توجد فيديوهات بعد." : "No videos yet."}</p>
          ) : (
            <VideoGallery videos={videos} lang={lang} />
          )}
        </div>
      </section>
    </>
  );
}
