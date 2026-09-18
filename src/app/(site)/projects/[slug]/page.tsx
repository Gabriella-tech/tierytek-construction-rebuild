import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DraftBanner } from "@/components/site/DraftBanner";
import { GalleryBoard } from "@/components/site/GalleryBoard";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { CtaBand, MetaList, Section } from "@/components/site/primitives";
import { getSession } from "@/lib/auth";
import { getGalleryForProject, getImage, getMediaByIds, getProjectBySlug, getProjectServices, pickImages } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, project] = await Promise.all([getSiteSettings(), getProjectBySlug(slug, true)]);
  if (!project) return { title: "Project not found" };
  const image = await getImage(project.coverImageId);
  return buildMetadata(s, {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.excerpt || project.overview,
    path: `/projects/${project.slug}`,
    image: image?.large,
    noIndex: !project.published,
  });
}

function videoEmbed(url: string): string | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const project = await getProjectBySlug(slug, !!session);
  if (!project) notFound();
  const [services, galleryItems, mediaMap] = await Promise.all([
    getProjectServices(project.id),
    getGalleryForProject(project.id),
    getMediaByIds([project.coverImageId, ...project.imageIds]),
  ]);
  const cover = project.coverImageId ? pickImages([project.coverImageId], mediaMap, project.title)[0] : null;
  const images = pickImages(project.imageIds, mediaMap, project.title);
  const embed = project.videoUrl ? videoEmbed(project.videoUrl) : null;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }, { name: project.title, path: `/projects/${project.slug}` }];
  const sections = [
    { title: "Scope of work", body: project.scope },
    { title: "The challenge", body: project.challenge },
    { title: "Our solution", body: project.solution },
    { title: "Results", body: project.results },
  ].filter((s) => s.body.trim());

  return (
    <>
      {!project.published && <DraftBanner editHref={`/admin/projects/${project.id}`} />}
      <section className="relative bg-ink text-white">
        {cover && (
          <div className="absolute inset-0">
            <Picture image={cover} priority sizes="100vw" className="h-full" imgClassName="opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          </div>
        )}
        <div className="container-x relative flex min-h-[60vh] flex-col justify-end py-16 sm:py-20">
          <Breadcrumbs items={crumbs} dark />
          <Reveal className="mt-8 max-w-4xl">
            {project.category && <p className="eyebrow">{project.category}</p>}
            <h1 className="display-1 mt-4">{project.title}</h1>
            {project.excerpt && <p className="mt-6 max-w-2xl text-lg text-white/75 sm:text-xl">{project.excerpt}</p>}
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <MetaList dark items={[
              { label: "Client", value: project.client },
              { label: "Location", value: project.location },
              { label: "Completed", value: project.year },
              { label: "Services", value: services.length ? services.map((s) => s.title).join(", ") : null },
            ]} />
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {project.overview && <Reveal><RichText content={project.overview} className="text-lg" /></Reveal>}
            {sections.map((sec) => (
              <Reveal key={sec.title} className="mt-12 border-t border-ink/10 pt-8">
                <h2 className="display-3">{sec.title}</h2>
                <RichText content={sec.body} className="mt-4" />
              </Reveal>
            ))}
            {embed && (
              <Reveal className="mt-12">
                <div className="aspect-video bg-ink"><iframe src={embed} title={`${project.title} video`} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
              </Reveal>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-8">
              {services.length > 0 && (
                <div className="border-t-2 border-ink pt-5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">Services on this project</h2>
                  <ul className="mt-3 divide-y divide-ink/10">
                    {services.map((s) => (<li key={s.id}><Link href={`/services/${s.slug}`} className="flex items-center justify-between py-2.5 font-medium hover:text-brand">{s.title}<span aria-hidden>→</span></Link></li>))}
                  </ul>
                </div>
              )}
              {galleryItems.length > 0 && (
                <Link href={`/gallery?project=${project.slug}`} className="block border border-ink/15 p-5 hover:border-brand">
                  <p className="font-display font-bold">View project gallery</p>
                  <p className="mt-1 text-sm text-ink/60">{galleryItems.length} gallery {galleryItems.length === 1 ? "entry" : "entries"} linked to this project.</p>
                </Link>
              )}
              <div className="bg-ink p-6 text-white">
                <p className="font-display text-lg font-bold">Planning something similar?</p>
                <Link href="/request-a-quote" className="btn-primary mt-4 w-full">Request a Quote</Link>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {images.length > 0 && (
        <Section tone="surface">
          <h2 className="display-3">Project images</h2>
          <div className="mt-8">
            <GalleryBoard items={[{ id: project.id, title: project.title, category: project.category, client: project.client, projectName: "", location: project.location, year: project.year, caption: "", description: "", projectSlug: null, images }]} expand />
          </div>
        </Section>
      )}
      <CtaBand heading="Discuss your project with Tierytek" body="Residential, commercial and industrial construction across Nigeria." />
    </>
  );
}
