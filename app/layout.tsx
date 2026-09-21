import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import "./globals.css";

/* Runs before first paint so the stored theme applies with no flash.
   Light is the default — prefers-color-scheme is deliberately ignored. */
const themeInit = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}document.documentElement.dataset.theme=t==="dark"?"dark":"light"})()`;

/* The wordmark in the top-left is the domain itself, derived from site.url
   so changing domains updates it automatically. */
const wordmark = new URL(site.url).hostname.replace(/^www\./, "");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    url: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {/* Plain <link> instead of metadata alternates.types: per-page
            alternates (canonical) would shallowly replace it. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={site.name}
          href="/rss.xml"
        />
      </head>
      <body className="bg-bg text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:bg-bg focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <div className="mx-auto flex w-full max-w-[70ch] flex-col px-5 lg:max-w-[calc(70ch+14rem)] lg:flex-row lg:items-start lg:gap-14">
          {/* Top bar on small screens; sticky left sidebar from lg up,
              wordmark in the top-left, nav stacked beneath it. */}
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-8 pb-12 lg:sticky lg:top-0 lg:w-40 lg:shrink-0 lg:flex-col lg:items-start lg:gap-7 lg:pt-10 lg:pb-0">
            <Link
              prefetch={false}
              href="/"
              className="text-xl font-bold no-underline hover:underline lg:text-2xl"
            >
              {wordmark}
            </Link>
            <nav className="flex items-baseline gap-5 lg:flex-col lg:items-start lg:gap-2">
              <Link
                prefetch={false}
                href="/about"
                className="text-muted no-underline hover:text-fg hover:underline"
              >
                about
              </Link>
              <a
                href="/rss.xml"
                className="text-muted no-underline hover:text-fg hover:underline"
              >
                rss
              </a>
              <ThemeToggle />
            </nav>
          </header>
          <main id="main" className="w-full min-w-0 pb-16 lg:max-w-[70ch] lg:pt-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
