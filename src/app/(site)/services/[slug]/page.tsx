import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DraftBanner } from "@/components/site/DraftBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { Picture } from "@/components/site/Picture";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { CtaBand, Section } from "@/components/site/primitives";
import { getSession } from "@/lib/auth";
import { getImage, getMediaByIds, getPublishedServices, getServiceBySlug, getServiceProjects, pickImages } from "@/lib/queries";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, service] = await Promise.all([getSiteSettings(), getServiceBySlug(slug, true)]);
  if (!service) return { title: "Service not found" };
  const image = await getImage(service.imageId);
  return buildMetadata(s, {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.excerpt,
    path: `/services/${service.slug}`,
    image: image?.large,
    noIndex: !service.published,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const service = await getServiceBySlug(slug, !!session);
  if (!service) notFound();
  const [s, image, projects, all] = await Promise.all([getSiteSettings(), getImage(service.imageId, service.title), getServiceProjects(service.id), getPublishedServices()]);
  const mediaMap = await getMediaByIds(projects.map((p) => p.coverImageId));
  const others = all.filter((x) => x.id !== service.id);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path: `/services/${service.slug}` }];

  return (
    <>
      {!service.published && <DraftBanner editHref={`/admin/services/${service.id}`} />}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="grid-texture absolute inset-0" aria-hidden />
        <div className="container-x relative py-16 sm:py-20 lg:py-24">
          <Breadcrumbs items={crumbs} dark />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-8">
              {service.category && <p className="eyebrow">{service.category}</p>}
              <h1 className="display-1 mt-4">{service.title}</h1>
              {service.excerpt && <p className="mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">{service.excerpt}</p>}
            </Reveal>
            <Reveal delay={120} className="lg:col-span-4 lg:text-right">
              <Link href="/request-a-quote" className="btn-primary">Request a Quote</Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {image && <Reveal className="mb-12"><Picture image={image} priority sizes="(min-width: 1024px) 66vw, 100vw" aspect="aspect-[16/9]" /></Reveal>}
            <Reveal><RichText content={service.content} /></Reveal>
            {projects.length > 0 && (
              <div className="mt-16">
                <h2 className="display-3">Related projects</h2>
                <ul className="mt-6 grid gap-8 sm:grid-cols-2">
                  {projects.map((p) => {
                    const img = p.coverImageId ? pickImages([p.coverImageId], mediaMap, p.title)[0] : null;
                    return (
                      <li key={p.id}>
                        <Link href={`/projects/${p.slug}`} className="group block">
                          {img && <div className="img-zoom"><Picture image={img} sizes="(min-width: 640px) 33vw, 100vw" aspect="aspect-[4/3]" /></div>}
                          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{[p.category, p.location].filter(Boolean).join(" · ")}</p>
                          <h3 className="mt-1 font-display text-lg font-bold group-hover:text-brand">{p.title}</h3>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <aside className="space-y-10 lg:col-span-4">
            {service.capabilities.length > 0 && (
              <div className="border-t-2 border-ink pt-5">
                <h2 className="font-display text-lg font-bold">What this covers</h2>
                <ul className="mt-4 space-y-2.5">
                  {service.capabilities.map((cap) => (<li key={cap} className="flex items-start gap-3 text-[15px] text-ink/80"><span className="mt-2.5 h-[2px] w-3 shrink-0 bg-brand" aria-hidden />{cap}</li>))}
                </ul>
              </div>
            )}
            <div className="bg-ink p-6 text-white">
              <p className="font-display text-lg font-bold">Discuss this service</p>
              <p className="mt-2 text-sm text-white/65">Send us your requirements and we will respond with next steps.</p>
              <Link href="/request-a-quote" className="btn-primary mt-5 w-full">Request a Quote</Link>
              <Link href="/contact" className="btn-outline-light mt-2 w-full">Contact us</Link>
            </div>
            {others.length > 0 && (
              <div className="border-t border-ink/10 pt-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">Other services</h2>
                <ul className="mt-3 divide-y divide-ink/10">
                  {others.map((o) => (<li key={o.id}><Link href={`/services/${o.slug}`} className="flex items-center justify-between py-2.5 text-[15px] font-medium hover:text-brand">{o.title}<span aria-hidden>→</span></Link></li>))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>
      <CtaBand heading={`Planning a ${service.title.toLowerCase()} project?`} body="Tell us about the site, scope and timeline." />
      <JsonLd data={serviceJsonLd(service, s, image?.large)} />
    </>
  );
}
