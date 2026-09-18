/**
 * Tierytek Construction — database schema (PostgreSQL via Drizzle ORM)
 *
 * Every piece of content the business owner manages lives here.
 * Nothing on the public site that the owner should control is hardcoded.
 */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Shared JSON shapes                                                  */
/* ------------------------------------------------------------------ */

export type MediaVariant = { key: string; width: number; height: number };
export type MediaVariants = {
  original: MediaVariant;
  large?: MediaVariant;
  medium?: MediaVariant;
  thumb?: MediaVariant;
};

export type UserRole = "admin" | "editor";
export type EnquiryStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "quoted"
  | "won"
  | "closed";
export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "quoted",
  "won",
  "closed",
];

/* ------------------------------------------------------------------ */
/* Users & authentication                                              */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).$type<UserRole>().notNull().default("editor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  /** Folder/key prefix in storage, e.g. "media/2f1c..." */
  key: varchar("key", { length: 300 }).notNull().unique(),
  filename: varchar("filename", { length: 300 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: varchar("alt", { length: 300 }).notNull().default(""),
  caption: text("caption").notNull().default(""),
  variants: jsonb("variants").$type<MediaVariants>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Settings (branding, business, social, seo) as JSON documents        */
/* ------------------------------------------------------------------ */

export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Editable page content                                               */
/* ------------------------------------------------------------------ */

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  content: jsonb("content").$type<Record<string, string>>().notNull().default({}),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  published: boolean("published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
  category: varchar("category", { length: 100 }).notNull().default(""),
  imageId: integer("image_id").references(() => media.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Projects (detailed case studies)                                    */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  client: varchar("client", { length: 200 }).notNull().default(""),
  location: varchar("location", { length: 200 }).notNull().default(""),
  category: varchar("category", { length: 100 }).notNull().default(""),
  year: varchar("year", { length: 40 }).notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  overview: text("overview").notNull().default(""),
  scope: text("scope").notNull().default(""),
  challenge: text("challenge").notNull().default(""),
  solution: text("solution").notNull().default(""),
  results: text("results").notNull().default(""),
  coverImageId: integer("cover_image_id").references(() => media.id, { onDelete: "set null" }),
  imageIds: jsonb("image_ids").$type<number[]>().notNull().default([]),
  videoUrl: varchar("video_url", { length: 500 }).notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectServices = pgTable(
  "project_services",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.serviceId] })],
);

/* ------------------------------------------------------------------ */
/* Gallery (visual board of completed work — independent of Projects)  */
/* ------------------------------------------------------------------ */

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  client: varchar("client", { length: 200 }).notNull().default(""),
  projectName: varchar("project_name", { length: 200 }).notNull().default(""),
  location: varchar("location", { length: 200 }).notNull().default(""),
  category: varchar("category", { length: 100 }).notNull().default(""),
  description: text("description").notNull().default(""),
  caption: text("caption").notNull().default(""),
  year: varchar("year", { length: 40 }).notNull().default(""),
  imageIds: jsonb("image_ids").$type<number[]>().notNull().default([]),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Insights / News                                                     */
/* ------------------------------------------------------------------ */

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  imageId: integer("image_id").references(() => media.id, { onDelete: "set null" }),
  category: varchar("category", { length: 100 }).notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  author: varchar("author", { length: 120 }).notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Enquiries (contact + request-a-quote submissions)                   */
/* ------------------------------------------------------------------ */

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).$type<"quote" | "contact">().notNull().default("quote"),
  name: varchar("name", { length: 160 }).notNull(),
  company: varchar("company", { length: 200 }).notNull().default(""),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull().default(""),
  projectType: varchar("project_type", { length: 120 }).notNull().default(""),
  location: varchar("location", { length: 200 }).notNull().default(""),
  budget: varchar("budget", { length: 120 }).notNull().default(""),
  preferredContact: varchar("preferred_contact", { length: 40 }).notNull().default(""),
  message: text("message").notNull(),
  attachmentKey: varchar("attachment_key", { length: 300 }),
  attachmentName: varchar("attachment_name", { length: 300 }),
  status: varchar("status", { length: 30 }).$type<EnquiryStatus>().notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
