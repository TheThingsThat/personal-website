# Personal site

A minimalist, typography-first personal site: one feed of markdown content with
type-based filter tabs. Next.js (App Router) + Tailwind v4 + MDX, fully static,
zero client-side data fetching. The design philosophy is
[bettermotherfuckingwebsite.com](https://bettermotherfuckingwebsite.com/):
readable type does the work, everything else stays out of the way. The
constraints that keep it that way live in [CLAUDE.md](CLAUDE.md).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static production build — also validates all content
```

## Adding a post

Create **one file**: `content/my-post.mdx`. The filename becomes the URL slug
(`/my-post`). Nothing else to touch — the feed, tabs, RSS, and sitemap pick it
up at the next build.

```yaml
---
title: Turret PID control for FTC          # required
date: 2026-03-14                            # required, YYYY-MM-DD
type: code                                  # required: essay | code | build | note | interest
summary: One-line blurb shown in the feed.  # optional; falls back to the first paragraph
tags: [robotics, java]                      # optional
url: https://github.com/you/repo            # optional external link, shown by hostname
cover: /media/turret.jpg                    # optional header image on the item page
draft: false                                # optional; true = excluded from the build entirely
---
```

Below the frontmatter: normal MDX (markdown + the components below, no imports
needed). Frontmatter is validated at build time — a missing required field, a
bad date, an unknown `type`, or a slug that collides with a reserved route
(`about`, `rss.xml`, `sitemap.xml`, `robots.txt`, `media`, …) fails the build
with a message naming the file. Drafts are skipped before validation, so a
half-written file can never break the site.

## Embedding media

Files live in `public/media/` and are referenced as `/media/…`.

**Image**

```mdx
<Figure
  src="/media/turret.jpg"
  alt="Turret assembly on the bench"   {/* required */}
  width={1200} height={800}            {/* real pixel size, avoids layout shift */}
  caption="Optional caption."
/>
```

**Short silent clip** — behaves like an animated figure:

```mdx
<Clip
  src="/media/mechanism.mp4"           {/* or a full https:// Vercel Blob URL */}
  poster="/media/mechanism-poster.jpg" {/* required */}
  width={1280} height={720}
  autoPlay                             {/* optional: loop like a gif, no controls */}
  caption="The latch cycling."
/>
```

**YouTube** — a facade: only a thumbnail + play button load with the page; the
real iframe (and its ~1MB of script) is injected on first click.

```mdx
<YouTube id="jNQXAC9IVRw" title="Me at the zoo" />
```

**Which video component?** Short + silent + illustrative (a mechanism cycling,
a robot moving) → `<Clip>`. Long, narrated, or anything you'd want people to
find later → `<YouTube>`.

`<Clip>` sets `preload="metadata"` on purpose: the browser default (`auto`)
lets it download the entire file for every visitor, including the ones who
never press play. With `metadata`, a visitor costs you a few KB until they hit
play. It also sets `muted` + `playsInline`, which is what allows autoplay to
work at all (browsers block un-muted autoplay).

**The standard encode** for self-hosted clips:

```bash
ffmpeg -i in.mov -vf scale=-2:720 -c:v libx264 -profile:v main -pix_fmt yuv420p \
  -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4
```

`+faststart` moves the MP4 index (moov atom) to the front of the file so
playback can begin while the rest is still downloading; without it the browser
must fetch the whole file before the first frame. 720p is the default because
self-hosted video has **no adaptive bitrate** — every viewer gets the one file
you made, so pick a size that streams acceptably on a mediocre connection.

**Where files go:** under ~10MB, commit to `public/media/`. Bigger than that,
upload to [Vercel Blob](https://vercel.com/docs/vercel-blob) and pass the Blob
URL as `src` — same component. Mind the Hobby-plan budget: **1GB of Blob
storage and 10GB of Blob transfer per month**, and that allowance is shared
with the rest of the project's bandwidth — self-hosting on Blob doesn't dodge
the bandwidth cap, it only keeps big binaries out of git.

The current files in `public/media/` are generated placeholders — replace them
freely (`npm run placeholders` regenerates the PNGs; the sample MP4 was made
once with ffmpeg and isn't regenerated).

## Adding a content type

Edit **one map in one file**: `TYPE_LABELS` in [lib/types.ts](lib/types.ts).

```ts
export const TYPE_LABELS = {
  // …existing…
  talk: "Talks",
} as const;
```

That's it. The validator accepts the new `type`, and the tab appears
automatically once at least one published item uses it (tabs are derived from
the content directory — empty types never render a tab).

## Fonts

Body text is **Georgia** via a system stack — no web fonts are downloaded.
Code uses the system monospace stack. Both are single tokens in
[app/globals.css](app/globals.css).

To self-host a code font later (JetBrains Mono, IBM Plex Mono):

1. `layout.tsx`:
   ```ts
   import localFont from "next/font/local";
   const mono = localFont({ src: "./jetbrains-mono.woff2", variable: "--mono-font" });
   // add {mono.variable} to the <html> className
   ```
2. `globals.css` — change **one line** in `@theme inline`:
   ```css
   --font-mono: var(--mono-font), ui-monospace, SFMono-Regular, monospace;
   ```

## Theming

Light is the default, always — first paint never consults
`prefers-color-scheme`. The toggle stores `theme` in localStorage and an inline
`<head>` script applies it before paint (no flash). All colors are five
semantic tokens (`bg`, `fg`, `muted`, `rule`, `code-bg`) defined once in
`globals.css` and flipped by `data-theme="dark"` — components never hardcode a
color (Tailwind's default palette is disabled, so they can't). Syntax
highlighting is Shiki at build time with both palettes emitted as CSS
variables; the theme toggle recolors code instantly with zero client JS.

## Site identity

Name, URL, and description live in [lib/site.ts](lib/site.ts). **Set `url` to
your real domain before deploying** — RSS, sitemap, canonical URLs, and Open
Graph tags are all derived from it.

## Deploying to Vercel

1. Push this directory to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo → **Deploy**.
   No configuration needed — Next.js is auto-detected and every page builds
   static.
3. Custom domain: project → **Settings → Domains** → add `yourdomain.com`,
   then point DNS where Vercel says (an `A`/`ALIAS` record to Vercel, or move
   the nameservers). Certificates are automatic.
4. Update `lib/site.ts` with the real domain and redeploy.

## Dependencies, justified

Runtime:

- `next`, `react`, `react-dom` — the framework; App Router, static generation, `next/image`.
- `next-mdx-remote` — renders MDX read from `/content` inside server components at build time; `@next/mdx` wants MDX files to *be* routes/imports, which fights a flat content directory.
- `gray-matter` — frontmatter parsing.
- `shiki` + `@shikijs/rehype` — build-time syntax highlighting with dual-theme CSS-variable output; ships zero highlighting JS.

Dev:

- `typescript`, `@types/*` — TypeScript.
- `tailwindcss`, `@tailwindcss/postcss` — Tailwind v4 (CSS-first config in `globals.css`).

Nothing else, by policy: no component library, no state library, no animation
library, no icon pack, no analytics. See [CLAUDE.md](CLAUDE.md) before adding
anything.
