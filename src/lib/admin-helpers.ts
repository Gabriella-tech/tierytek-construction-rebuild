/**
 * Helpers shared by admin server actions.
 */
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authorize } from "@/lib/auth";
import { getMediaByIds, imageSource } from "@/lib/queries";
import type { ActionState, MediaLite } from "@/lib/types";
import type { UserRole } from "@/db/schema";

export type OrderableTable = "services" | "projects" | "gallery_items";
export type SluggedTable = "services" | "projects" | "insights";

export async function requireActionUser(role?: UserRole): Promise<{ ok: true } | { ok: false; state: ActionState }> {
  const session = await authorize(role);
  if (!session) return { ok: false, state: { error: role === "admin" ? "You need administrator rights for this action." : "Your session has expired. Please sign in again." } };
  return { ok: true };
}

/** Public pages are rendered dynamically, but revalidate anyway for any cached segments. */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}

/** Normalise sort orders to 0,10,20… and move one row up or down. */
export async function moveItem(table: OrderableTable, id: number, dir: -1 | 1): Promise<void> {
  const result = await db.execute<{ id: number }>(
    sql`select id from ${sql.identifier(table)} order by sort_order asc, created_at desc`,
  );
  const ids = result.rows.map((r) => Number(r.id));
  const index = ids.indexOf(id);
  if (index === -1) return;
  const target = index + dir;
  if (target < 0 || target >= ids.length) return;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  for (let i = 0; i < ids.length; i++) {
    await db.execute(sql`update ${sql.identifier(table)} set sort_order = ${i * 10} where id = ${ids[i]}`);
  }
}

export async function nextSortOrder(table: OrderableTable): Promise<number> {
  const result = await db.execute<{ max: number | null }>(sql`select max(sort_order) as max from ${sql.identifier(table)}`);
  const max = result.rows[0]?.max;
  return (max == null ? -10 : Number(max)) + 10;
}

/** Ensure a slug is unique within a table (appends -2, -3 … when needed). */
export async function uniqueSlug(table: SluggedTable, base: string, excludeId?: number | null): Promise<string> {
  const root = base || "item";
  let candidate = root;
  for (let i = 2; i < 100; i++) {
    const result = await db.execute<{ id: number }>(
      sql`select id from ${sql.identifier(table)} where slug = ${candidate} ${excludeId ? sql`and id <> ${excludeId}` : sql``} limit 1`,
    );
    if (!result.rows.length) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

/** Parse a JSON array of IDs (from MediaPicker) or a single ID string. */
export function parseIdList(value: FormDataEntryValue | null): number[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    /* fall through */
  }
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? [n] : [];
}

/** Resolve media IDs (in order) into the light shape used by MediaPicker. */
export async function mediaLite(ids: Array<number | null | undefined>): Promise<MediaLite[]> {
  const map = await getMediaByIds(ids);
  return ids
    .filter((id): id is number => typeof id === "number")
    .map((id) => map.get(id))
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map((m) => {
      const s = imageSource(m);
      return { id: m.id, src: s.src, thumb: s.thumb, alt: m.alt, filename: m.filename, width: m.width ?? 0, height: m.height ?? 0 };
    });
}
