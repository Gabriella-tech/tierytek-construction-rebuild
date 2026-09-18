/**
 * Editable page content. Each public page has a set of named fields that the
 * owner edits in /admin/pages without touching code.
 *
 * Field types:
 *   text      – single line
 *   textarea  – multi-line (paragraphs separated by blank lines)
 *   list      – one item per line; "Title|Description" pairs are supported
 *   image     – a media library image ID
 */
export type PageFieldType = "text" | "textarea" | "list" | "image";
export type PageField = { key: string; label: string; type: PageFieldType; hint?: string };
export type PageDefinition = { slug: string; title: string; path: string; fields: PageField[]; defaults: Record<string, string> };

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    slug: "home",
    title: "Home",
    path: "/",
    fields: [
      { key: "heroEyebrow", label: "Hero eyebrow", type: "text" },
      { key: "heroHeadline", label: "Hero headline (H1)", type: "text" },
      { key: "heroBody", label: "Hero supporting text", type: "textarea" },
      { key: "heroPoints", label: "Hero key points", type: "list", hint: "Short statements, one per line (max 3 shown)." },
      { key: "heroPrimaryLabel", label: "Primary button label", type: "text" },
      { key: "heroPrimaryHref", label: "Primary button link", type: "text" },
      { key: "heroSecondaryLabel", label: "Secondary button label", type: "text" },
      { key: "heroSecondaryHref", label: "Secondary button link", type: "text" },
      { key: "heroImageId", label: "Hero image", type: "image", hint: "Use a real Tierytek site or project photo. A structural graphic is shown until one is added." },
      { key: "introEyebrow", label: "Introduction eyebrow", type: "text" },
      { key: "introHeading", label: "Introduction heading", type: "text" },
      { key: "introBody", label: "Introduction body", type: "textarea" },
      { key: "introPoints", label: "Introduction points", type: "list" },
      { key: "introImageId", label: "Introduction image", type: "image" },
      { key: "capabilitiesHeading", label: "Capabilities heading", type: "text" },
      { key: "capabilitiesBody", label: "Capabilities intro", type: "textarea" },
      { key: "stats", label: "Company figures", type: "list", hint: "Only add VERIFIED figures as 'Label|Value' (e.g. 'Years in operation|12'). Leave empty to hide the section — no numbers are invented." },
      { key: "focusEyebrow", label: "Sectors eyebrow", type: "text" },
      { key: "focusHeading", label: "Sectors heading", type: "text" },
      { key: "focusBody", label: "Sectors intro", type: "textarea" },
      { key: "focusAreas", label: "Sectors", type: "list", hint: "'Sector|Description' per line." },
      { key: "ctaHeading", label: "Call-to-action heading", type: "text" },
      { key: "ctaBody", label: "Call-to-action text", type: "textarea" },
    ],
    defaults: {
      heroEyebrow: "Steel construction · Roofing · Renovation",
      heroHeadline: "Steel frameworks, roofing and renovation — engineered and delivered with precision.",
      heroBody:
        "Tierytek Construction specialises in steel frameworks, pre-engineered buildings, roofing and renovation projects across Nigeria. From industrial-grade structures to residential transformations, we bring precision, safety and reliability to every site.",
      heroPoints: "Industrial-grade steel frameworks\nWeather-resistant roofing systems\nQuality, safety and on-time delivery",
      heroPrimaryLabel: "Request a Quote",
      heroPrimaryHref: "/request-a-quote",
      heroSecondaryLabel: "Explore Our Work",
      heroSecondaryHref: "/projects",
      heroImageId: "",
      introEyebrow: "About Tierytek",
      introHeading: "Experts in the construction field",
      introBody:
        "At Tierytek Construction, we specialise in steel frameworks, roofing and renovation projects across Nigeria. Our team delivers durable, modern and efficient solutions tailored to each client's needs.\n\nFrom industrial-grade structures to residential transformations, we bring precision, safety and innovation to every site we touch.",
      introPoints: "Experienced engineers and architects\nModern equipment and techniques\nCommitment to safety and quality\nOn-time project delivery",
      introImageId: "",
      capabilitiesHeading: "Core capabilities",
      capabilitiesBody:
        "From structural steel and pre-engineered buildings to roofing, renovation and design, our services cover the full construction cycle.",
      stats: "",
      focusEyebrow: "Sectors",
      focusHeading: "Residential, commercial and industrial construction",
      focusBody: "From residential projects to large-scale commercial developments, we bring integrity and professionalism to every site.",
      focusAreas:
        "Residential|Renovations, roofing and steel-framed structures for homes.\nCommercial|Commercial buildings managed efficiently and delivered on time and within budget.\nIndustrial|Industrial-grade steel frameworks and pre-engineered buildings.",
      ctaHeading: "Have a project in mind?",
      ctaBody: "Tell us about your site, scope and timeline. Our team will review your requirements and respond with next steps.",
    },
  },
  {
    slug: "about",
    title: "About",
    path: "/about",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
      { key: "imageId", label: "Feature image", type: "image" },
      { key: "missionHeading", label: "Mission heading", type: "text" },
      { key: "missionBody", label: "Mission", type: "textarea" },
      { key: "visionHeading", label: "Vision heading", type: "text" },
      { key: "visionBody", label: "Vision", type: "textarea", hint: "Not on the previous website — add the official vision statement. Hidden while empty." },
      { key: "valuesHeading", label: "Values heading", type: "text" },
      { key: "values", label: "Values", type: "list", hint: "'Value|Description' per line." },
      { key: "approachHeading", label: "Approach heading", type: "text" },
      { key: "approach", label: "Approach steps", type: "list", hint: "'Step|Description' per line, in order." },
      { key: "capabilitiesHeading", label: "Capabilities heading", type: "text" },
      { key: "capabilitiesBody", label: "Capabilities", type: "textarea" },
      { key: "safetyHeading", label: "Safety & quality heading", type: "text" },
      { key: "safetyBody", label: "Safety & quality", type: "textarea" },
      { key: "points", label: "Company points", type: "list" },
    ],
    defaults: {
      eyebrow: "About Tierytek",
      heading: "Building structures that stand the test of time.",
      intro:
        "At Tierytek Construction, we are passionate about building structures that stand the test of time. With expertise in steel construction, roofing and renovation, we deliver projects that combine durability, safety and modern design.",
      imageId: "",
      missionHeading: "Our mission",
      missionBody:
        "To transform ideas into reality through precision engineering, innovative solutions and a commitment to excellence. From residential projects to large-scale commercial developments, we bring integrity and professionalism to every site.",
      visionHeading: "Our vision",
      visionBody: "",
      valuesHeading: "What we stand for",
      values:
        "Precision|Engineering-led planning and execution on every structure.\nSafety and quality|A commitment to safe sites and quality workmanship.\nIntegrity|Professional, transparent dealings with every client.\nOn-time delivery|Programmes planned realistically and delivered as agreed.",
      approachHeading: "How we work",
      approach:
        "Consultation and pre-construction|We review your brief, site and budget before any work begins.\nDesign and engineering|Architectural and structural design aligned with your requirements.\nFabrication and construction|Steel framework, roofing, renovation and finishing works by our team.\nHandover|Inspection, snagging and handover of the completed works.",
      capabilitiesHeading: "Capabilities",
      capabilitiesBody:
        "Steel frameworks and pre-engineered buildings (PEB), roofing systems, renovation, structural engineering, architectural design, plumbing, and logistics and supply of construction materials.",
      safetyHeading: "Safety and quality",
      safetyBody:
        "We build with precision and deliver on time. Safety on site and the quality of the finished structure are treated as non-negotiable on every project, whatever its size.",
      points: "Experienced engineers and architects\nModern equipment and techniques\nCommitment to safety and quality\nOn-time project delivery",
    },
  },
  {
    slug: "services",
    title: "Services",
    path: "/services",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Services",
      heading: "Construction services for residential, commercial and industrial clients.",
      intro:
        "Steel construction, roofing, renovation, structural engineering and architectural design — delivered across Lagos and Nigeria.",
    },
  },
  {
    slug: "projects",
    title: "Projects",
    path: "/projects",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Projects",
      heading: "Selected projects and case studies.",
      intro: "Detailed accounts of Tierytek projects — scope, challenges and how they were delivered.",
    },
  },
  {
    slug: "gallery",
    title: "Gallery",
    path: "/gallery",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Gallery",
      heading: "Our work in view.",
      intro: "A visual record of completed work for Tierytek clients — steel structures, roofing, renovation and more.",
    },
  },
  {
    slug: "insights",
    title: "Insights",
    path: "/insights",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Insights & news",
      heading: "News and insights from Tierytek.",
      intro: "Project updates, construction insights and company news.",
    },
  },
  {
    slug: "contact",
    title: "Contact",
    path: "/contact",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
      { key: "formNote", label: "Note above the form", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Contact",
      heading: "Contact us",
      intro: "We'd love to hear from you. Fill out the form or reach us directly.",
      formNote: "",
    },
  },
  {
    slug: "quote",
    title: "Request a Quote",
    path: "/request-a-quote",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Page heading (H1)", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
      { key: "projectTypes", label: "Project type options", type: "list" },
      { key: "budgets", label: "Budget options", type: "list" },
      { key: "formNote", label: "Note above the form", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Quotation",
      heading: "Request a quote",
      intro: "Tell us about your project — scope, location and timeline — and our team will respond with next steps.",
      projectTypes:
        "Steel construction / framework\nPre-engineered building (PEB)\nRoofing\nRenovation\nStructural engineering\nArchitectural design\nPlumbing\nLogistics & supply\nOther",
      budgets: "Not sure yet\nUnder ₦5 million\n₦5m – ₦20m\n₦20m – ₦50m\n₦50m – ₦100m\nOver ₦100m",
      formNote: "",
    },
  },
];

export function getPageDefinition(slug: string): PageDefinition | undefined {
  return PAGE_DEFINITIONS.find((p) => p.slug === slug);
}

/** Parse "Title|Description" list lines. */
export function parsePairs(value: string | undefined): Array<{ title: string; body: string }> {
  return (value ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), body: rest.join("|").trim() };
    });
}
