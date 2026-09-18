/**
 * Idempotent seed.
 *  - Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if no users exist.
 *  - Inserts default page copy (from the previous website) if a page is missing.
 *  - Inserts the existing service catalogue if the services table is empty.
 *  - Migrates the three legacy news items as UNPUBLISHED drafts for verification.
 *
 * Run manually with `npm run db:seed`, or it runs automatically once per server start.
 */
import "dotenv/config";
import { db } from "@/db";
import { insights, pages, services, users } from "@/db/schema";
import { PAGE_DEFINITIONS } from "@/lib/page-fields";
import bcrypt from "bcryptjs";

const DEFAULT_SERVICES = [
  {
    title: "Steel Construction",
    slug: "steel-construction",
    category: "Structural",
    excerpt: "Precision-built steel frames, beams and industrial-grade frameworks engineered for strength and longevity.",
    capabilities: [
      "Structural steel frameworks",
      "Pre-engineered buildings (PEB)",
      "Steel framework fabrication and erection",
      "Industrial structures — warehouses and workshops",
      "Commercial steel buildings",
    ],
    content:
      "## Structural steel construction in Nigeria\n\nTierytek Construction builds structural steel frameworks and pre-engineered buildings (PEB) for industrial, commercial and residential clients. Our steel structures are engineered for strength, durability and safe, efficient erection on site.\n\n## What the service covers\n\n- Structural steel frames, columns and beams\n- Pre-engineered steel buildings for warehouses, workshops and commercial use\n- Steel framework fabrication, delivery and erection\n- Coordination with roofing and cladding works\n\n## How we approach a steel project\n\nEvery steel project begins with the structural requirements: loads, spans, site conditions and programme. From there the framework is engineered, fabricated and erected with precision, with safety and quality controls applied at each stage.",
    seoTitle: "Steel Construction Company in Lagos, Nigeria",
    seoDescription:
      "Structural steel construction, steel frameworks and pre-engineered buildings (PEB) in Lagos and across Nigeria by Tierytek Construction.",
  },
  {
    title: "Roofing Solutions",
    slug: "roofing-solutions",
    category: "Building",
    excerpt: "Weather-resistant roofing systems installed with safety, speed and durability.",
    capabilities: ["Steel roofing systems", "Roof structures and trusses", "Re-roofing and roof renovation", "Roofing for residential, commercial and industrial buildings"],
    content:
      "## Roofing contractors in Lagos\n\nWe design and install weather-resistant roofing systems for homes, commercial buildings and industrial structures. Our roofing work is planned around Nigeria's climate — heavy rain, heat and wind — and installed with precision and care.\n\n## What the service covers\n\n- New roof structures and steel roof trusses\n- Steel roofing sheets and roofing systems\n- Re-roofing, roof repairs and roof renovation\n- Roofing as part of steel framework and renovation projects",
    seoTitle: "Roofing Contractors in Lagos — Steel Roofing Solutions",
    seoDescription:
      "Weather-resistant roofing solutions and steel roofing in Lagos, Nigeria. Roof structures, re-roofing and roofing systems by Tierytek Construction.",
  },
  {
    title: "Renovation",
    slug: "renovation",
    category: "Building",
    excerpt: "Revamping homes and commercial spaces with modern finishes and thoughtful functionality.",
    capabilities: ["House renovation", "Commercial space renovation", "Structural alterations", "Modern finishes and fit-out"],
    content:
      "## Building renovation in Lagos\n\nTierytek Construction transforms old and under-used spaces into modern, functional environments. From house renovation to commercial space refurbishment, we combine structural know-how with quality finishing.\n\n## What the service covers\n\n- House renovation and remodelling\n- Commercial and office space renovation\n- Structural alterations and reinforcement\n- Finishes, fittings and functional layouts",
    seoTitle: "Building & House Renovation in Lagos",
    seoDescription:
      "House and commercial building renovation in Lagos, Nigeria. Structural alterations, modern finishes and functional layouts by Tierytek Construction.",
  },
  {
    title: "Structural Engineering",
    slug: "structural-engineering",
    category: "Design & Engineering",
    excerpt: "Structural design and engineering support for steel and building projects.",
    capabilities: ["Structural design for steel frameworks", "Structural assessment of existing buildings", "Engineering support during construction"],
    content:
      "## Structural engineering in Lagos, Nigeria\n\nOur structural engineering work underpins every steel framework and building we deliver — from analysing loads and spans to detailing connections and supervising construction.\n\n## What the service covers\n\n- Structural design for steel frameworks and buildings\n- Assessment of existing structures ahead of renovation or extension\n- Engineering support and supervision during construction",
    seoTitle: "Structural Engineering Services in Lagos, Nigeria",
    seoDescription: "Structural engineering for steel frameworks, buildings and renovation projects in Lagos and across Nigeria.",
  },
  {
    title: "Architectural Design",
    slug: "architectural-design",
    category: "Design & Engineering",
    excerpt: "Creative, buildable designs that bring your vision to life.",
    capabilities: ["Concept and detailed architectural design", "Design for steel and pre-engineered buildings", "Renovation and remodelling design"],
    content:
      "## Architectural design\n\nWe provide architectural design that is creative and, above all, buildable — coordinated with our structural and construction teams so that what is drawn can be delivered.\n\n## What the service covers\n\n- Concept and detailed design for residential and commercial buildings\n- Design for steel structures and pre-engineered buildings\n- Renovation and remodelling design",
    seoTitle: "Architectural Design Services",
    seoDescription: "Architectural design for residential, commercial and steel building projects by Tierytek Construction, Lagos.",
  },
  {
    title: "Pre-Construction",
    slug: "pre-construction",
    category: "Support",
    excerpt: "Planning, site assessment and budgeting before work begins.",
    capabilities: ["Site assessment", "Scope and budget planning", "Programme planning"],
    content:
      "## Pre-construction services\n\nGood projects start before the first delivery arrives on site. Our pre-construction service reviews your brief, site conditions, budget and programme so that the construction phase runs smoothly.\n\n## What the service covers\n\n- Site visits and assessment\n- Scope definition and budgeting\n- Programme and logistics planning",
    seoTitle: "Pre-Construction Planning Services",
    seoDescription: "Pre-construction planning, site assessment and budgeting for building and steel projects in Lagos, Nigeria.",
  },
  {
    title: "General Construction",
    slug: "general-construction",
    category: "Building",
    excerpt: "Commercial and residential building projects managed efficiently and delivered on time and within budget.",
    capabilities: ["Commercial building construction", "Residential construction", "Project management and delivery"],
    content:
      "## General construction\n\nFrom residential projects to commercial developments, Tierytek Construction manages building projects from start to finish — coordinating trades, materials and programme to deliver on time and within budget.\n\n## What the service covers\n\n- Commercial building construction\n- Residential building construction\n- Coordination of steel, roofing, plumbing and finishing works",
    seoTitle: "Commercial & Residential Construction Company in Lagos",
    seoDescription: "General construction services for commercial and residential buildings in Lagos, Nigeria, by Tierytek Construction.",
  },
  {
    title: "Plumbing",
    slug: "plumbing",
    category: "Building",
    excerpt: "Plumbing installations delivered as part of construction and renovation works.",
    capabilities: ["Plumbing installations for new builds", "Plumbing upgrades during renovation"],
    content:
      "## Plumbing\n\nPlumbing installations and upgrades delivered as part of our construction and renovation projects, coordinated with the wider works so that services are correctly routed and finished.",
    seoTitle: "Plumbing Services — Construction & Renovation",
    seoDescription: "Plumbing installations and upgrades as part of construction and renovation projects by Tierytek Construction, Lagos.",
  },
  {
    title: "Logistics & Supply",
    slug: "logistics-supply",
    category: "Support",
    excerpt: "Reliable delivery of construction materials for a seamless construction flow.",
    capabilities: ["Supply of steel and construction materials", "Site delivery and logistics coordination"],
    content:
      "## Logistics and supply\n\nReliable supply and delivery of construction materials keeps a project moving. We coordinate procurement and site logistics so that steel, roofing and building materials arrive when they are needed.",
    seoTitle: "Construction Logistics & Material Supply",
    seoDescription: "Construction materials supply and site logistics coordination in Lagos, Nigeria, by Tierytek Construction.",
  },
];

const LEGACY_NEWS = [
  {
    title: "Tierytek Expands Steel Construction Projects",
    slug: "tierytek-expands-steel-construction-projects",
    excerpt: "Our team recently completed a landmark steel framework project, setting new standards in durability.",
    date: "2025-12-10",
  },
  {
    title: "Innovative Roofing Solutions for Urban Homes",
    slug: "innovative-roofing-solutions-for-urban-homes",
    excerpt: "We introduced advanced roofing materials designed to withstand Nigeria's toughest weather conditions.",
    date: "2025-11-28",
  },
  {
    title: "Renovation Project Transforms Old Spaces",
    slug: "renovation-project-transforms-old-spaces",
    excerpt: "Tierytek recently renovated a commercial space, blending modern design with functional layouts.",
    date: "2025-11-15",
  },
];

export async function ensureSeeded(): Promise<void> {
  // 1. First administrator (only when there are no users at all).
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  if (!existingUsers.length && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await db.insert(users).values({
      name: "Administrator",
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: "admin",
    });
  }

  // 2. Pages (insert any missing page with its default copy).
  const existingPages = await db.select({ slug: pages.slug }).from(pages);
  const have = new Set(existingPages.map((p) => p.slug));
  for (const def of PAGE_DEFINITIONS) {
    if (!have.has(def.slug)) {
      await db.insert(pages).values({ slug: def.slug, title: def.title, content: def.defaults, published: true });
    }
  }

  // 3. Services (only when the table is empty).
  const existingServices = await db.select({ id: services.id }).from(services).limit(1);
  if (!existingServices.length) {
    await db.insert(services).values(
      DEFAULT_SERVICES.map((s, i) => ({ ...s, sortOrder: (i + 1) * 10, published: true })),
    );
  }

  // 4. Legacy news → drafts (only when the table is empty).
  const existingInsights = await db.select({ id: insights.id }).from(insights).limit(1);
  if (!existingInsights.length) {
    await db.insert(insights).values(
      LEGACY_NEWS.map((n) => ({
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        content: `_Draft migrated from the previous website. Please verify the details, add the full article and a real photo before publishing._\n\n${n.excerpt}`,
        category: "News",
        tags: [],
        published: false,
        publishedAt: new Date(n.date),
      })),
    );
  }
}

const globalForSeed = globalThis as typeof globalThis & { __ttSeedPromise?: Promise<void> };

/** Runs the seed at most once per server process; errors are logged, not thrown. */
export function ensureSeededOnce(): Promise<void> {
  globalForSeed.__ttSeedPromise ??= ensureSeeded().catch((err) => {
    console.error("[seed] failed:", err);
    globalForSeed.__ttSeedPromise = undefined;
  });
  return globalForSeed.__ttSeedPromise;
}

// CLI entry: `npm run db:seed`
if (process.argv[1] && /seed\.(ts|js)$/.test(process.argv[1])) {
  ensureSeeded()
    .then(() => {
      console.log("Seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
