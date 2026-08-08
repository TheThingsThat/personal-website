import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_TYPES, type ContentType } from "./types";

export interface Item {
  slug: string;
  title: string;
  /** Normalized to YYYY-MM-DD. */
  date: string;
  type: ContentType;
  /** From frontmatter, or the first plain paragraph of the body. May be "". */
  summary: string;
  tags: string[];
  url?: string;
  cover?: string;
  /** Raw MDX body (frontmatter stripped). */
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Slugs that would shadow real routes or static assets. */
const RESERVED_SLUGS = new Set([
  "about",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "media",
  "favicon.ico",
  "icon.svg",
]);

function fail(file: string, problem: string): never {
  throw new Error(`Invalid content in content/${file} — ${problem}`);
}

/** YAML parses unquoted dates as Date objects; accept both and normalize. */
function normalizeDate(file: string, value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      fail(file, `date "${value}" must be YYYY-MM-DD`);
    }
    if (Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
      fail(file, `date "${value}" is not a real calendar date`);
    }
    return value;
  }
  fail(file, "missing required field: date (YYYY-MM-DD)");
}

/** Fallback summary: first body block that reads as plain prose, with inline
 *  markdown stripped. Skips headings, code fences, JSX, imports, quotes, lists. */
function firstParagraph(body: string): string {
  for (const block of body.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text) continue;
    if (/^(#|```|<|>|[-*]\s|\d+\.\s|import\s|export\s|!\[)/.test(text)) continue;
    return text
      .replace(/\s+/g, " ")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
  }
  return "";
}

function parseItem(file: string): Item | null {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  const { data, content } = matter(raw);

  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    fail(file, `draft must be true or false, got "${data.draft}"`);
  }
  // Drafts are excluded from the build entirely and not validated further,
  // so an in-progress file can't break the site.
  if (data.draft === true) return null;

  if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
    fail(file, "filename (the slug) may only use letters, digits, - and _");
  }
  if (RESERVED_SLUGS.has(slug)) {
    fail(file, `slug "${slug}" collides with a reserved route`);
  }
  if (typeof data.title !== "string" || data.title.trim() === "") {
    fail(file, "missing required field: title");
  }
  if (data.date === undefined) {
    fail(file, "missing required field: date (YYYY-MM-DD)");
  }
  const date = normalizeDate(file, data.date);
  if (typeof data.type !== "string") {
    fail(file, `missing required field: type (one of: ${CONTENT_TYPES.join(", ")})`);
  }
  if (!CONTENT_TYPES.includes(data.type as ContentType)) {
    fail(
      file,
      `unrecognized type "${data.type}" (expected one of: ${CONTENT_TYPES.join(", ")})`,
    );
  }
  if (data.summary !== undefined && typeof data.summary !== "string") {
    fail(file, "summary must be a string");
  }
  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== "string"))
  ) {
    fail(file, "tags must be a list of strings");
  }
  if (data.url !== undefined && typeof data.url !== "string") {
    fail(file, "url must be a string");
  }
  if (data.cover !== undefined && typeof data.cover !== "string") {
    fail(file, "cover must be a string path");
  }

  return {
    slug,
    title: data.title.trim(),
    date,
    type: data.type as ContentType,
    summary: (data.summary ?? firstParagraph(content)).trim(),
    tags: (data.tags as string[] | undefined) ?? [],
    url: data.url,
    cover: data.cover,
    body: content,
  };
}

/** All published items, newest first. Reads and validates every file on each
 *  call — content is small and this keeps dev always-fresh with zero caching. */
export function getAllItems(): Item[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
  const items: Item[] = [];
  for (const file of files) {
    const item = parseItem(file);
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

export function getItem(slug: string): Item | undefined {
  return getAllItems().find((item) => item.slug === slug);
}

/** Types that actually occur in published content, in TYPE_LABELS order. */
export function getPresentTypes(): ContentType[] {
  const present = new Set(getAllItems().map((item) => item.type));
  return CONTENT_TYPES.filter((t) => present.has(t));
}

/** "2026-03-14" → "March 14, 2026". UTC-pinned so it never shifts a day. */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
