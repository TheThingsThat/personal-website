# CLAUDE.md — design constraints (read before changing anything)

This site follows bettermotherfuckingwebsite.com: stripped-down, typographic,
restrained. The look is the product. These rules are load-bearing; do not
drift from them.

## Typography (hard constraints)

- Body copy: Georgia stack (`--font-serif`), ~18px, `line-height` ≥ 1.6.
  Never render body text below 16px. Headings ~1.2.
- Text column maxes at **70ch** (`max-w-[70ch]` in the layout) with horizontal
  padding — text never touches the viewport edge.
- Code (inline and blocks) uses `--font-mono` and must visibly read as code:
  tinted `code-bg` background, blocks scroll horizontally instead of wrapping.
- **No web fonts for body text.** A self-hosted mono may be added later by
  changing only `--font-mono` (see README).

## Color

- Five semantic tokens only: `bg`, `fg`, `muted`, `rule`, `code-bg` — defined
  once in `app/globals.css`, flipped by `[data-theme="dark"]`.
- **No pure black, no pure white, ever.** Both sides stay softened.
- Components use token utilities (`bg-bg`, `text-muted`, `border-rule`).
  Never hex values, never `dark:` variants — Tailwind's default palette is
  deliberately wiped (`--color-*: initial`), so `text-gray-500` fails to
  compile. Keep it that way. Sole sanctioned exception: the YouTube facade's
  play-button overlay uses fixed colors because it sits on a video thumbnail,
  which does not change with the theme.
- Light is the default theme. First paint never consults
  `prefers-color-scheme`. The no-flash inline script in `app/layout.tsx` must
  stay a blocking script in `<head>`.

## Restraint (the point of the whole site)

- No shadows, no gradients, no cards, no borders-for-decoration, no rounded
  boxes beyond the small radius on code, no hover effects beyond a
  color/underline change. Whitespace and type hierarchy do the work.
- Hairline rules (`--rule`) are allowed only where they mark structure
  (blockquote edge, `<hr>`), not decoration.
- Dependency policy: add what the job needs, nothing speculative. **Never**
  add a component library (shadcn/Radix/MUI), state manager, animation
  library, icon pack, or analytics without the owner asking for it. Every
  dependency gets a one-sentence justification in README.md.
- Prefer zero client JS. Current client components — theme toggle, tab
  filter, YouTube facade — are the intended ceiling. The feed list itself is
  server HTML filtered by CSS; do not convert it to client rendering.

## Content model

- One item = one file in `content/*.mdx`; filename = slug. Frontmatter schema
  is documented in README.md and enforced by `lib/content.ts`, which must keep
  failing the build with a message naming the offending file.
- Types/tabs come from the single `TYPE_LABELS` map in `lib/types.ts`. Adding
  a type = one line there; nothing else may need editing.
- Drafts (`draft: true`) are excluded from feed, routes, RSS, and sitemap
  before validation.
- Tabs: server-rendered list, CSS-only filtering, URL sync via pushState
  (`?tab=essays`), real `<button>`s with `aria-pressed`. With JS disabled the
  full feed must remain readable.

## Media

- Images: `<Figure>` (next/image, required alt). Short silent self-hosted
  clips: `<Clip>` (native `<video>`, zero JS, `preload="metadata"`, poster,
  muted, loop). Long/narrated video: `<YouTube>` facade — never ship the
  YouTube iframe on page load.
- Keep `<Clip>` a server component; keep the facade under ~3KB; both respect
  the 70ch column and hold aspect ratio.

## Accessibility / performance floors

- Skip link, visible `:focus-visible` outlines, `prefers-reduced-motion`
  respected. Heading order stays sequential (feed titles are h2 under an
  sr-only h1).
- Everything statically generated; no client-side data fetching. Shiki runs at
  build time with dual-theme CSS variables — never re-highlight on the client.
- Lighthouse 100s across the board is the bar; don't add anything that risks
  layout shift (explicit dimensions/aspect ratios on all media).
