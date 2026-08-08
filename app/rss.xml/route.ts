import { getAllItems } from "@/lib/content";
import { site } from "@/lib/site";

/* Prerendered at build like every other page. */
export const dynamic = "force-static";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = getAllItems()
    .map(
      (item) => `    <item>
      <title>${esc(item.title)}</title>
      <link>${site.url}/${item.slug}</link>
      <guid>${site.url}/${item.slug}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>${
        item.summary
          ? `\n      <description>${esc(item.summary)}</description>`
          : ""
      }${item.tags
        .map((tag) => `\n      <category>${esc(tag)}</category>`)
        .join("")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(site.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
