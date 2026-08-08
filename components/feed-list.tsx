import Link from "next/link";
import { formatDate, type Item } from "@/lib/content";
import { CONTENT_TYPES } from "@/lib/types";

/** Hides feed items that don't match the active tab. Generated from the same
 *  type map as everything else, so a new type still only touches lib/types.ts.
 *  Scoped by the data attributes; ~60 bytes per type. */
const filterCss = CONTENT_TYPES.map(
  (t) =>
    `[data-active-tab="${t}"] li[data-type]:not([data-type="${t}"]){display:none}`,
).join("");

/** The feed itself: fully server-rendered, filtered client-side by CSS only —
 *  with JavaScript disabled every item below simply stays visible. */
export function FeedList({ items }: { items: Item[] }) {
  return (
    <>
      {/* href + precedence make React 19 hoist this into <head>. */}
      <style href="feed-filter" precedence="default">
        {filterCss}
      </style>
      <ul className="mt-10">
        {items.map((item) => (
          <li key={item.slug} data-type={item.type} className="mt-8 first:mt-0">
            <time dateTime={item.date} className="text-base text-muted">
              {formatDate(item.date)}
            </time>
            <h2 className="mt-0.5 text-xl">
              <Link prefetch={false} href={`/${item.slug}`} className="no-underline hover:underline">
                {item.title}
              </Link>
            </h2>
            {item.summary && <p className="mt-1">{item.summary}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
