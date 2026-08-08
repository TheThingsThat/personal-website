import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import "./globals.css";

/* Runs before first paint so the stored theme applies with no flash.
   Light is the default — prefers-color-scheme is deliberately ignored. */
const themeInit = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}document.documentElement.dataset.theme=t==="dark"?"dark":"light"})()`;

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
        <div className="mx-auto flex min-h-dvh w-full max-w-[70ch] flex-col px-5">
          <header className="flex items-baseline justify-between gap-4 pt-8 pb-14">
            <Link prefetch={false} href="/" className="no-underline hover:underline">
              {site.name}
            </Link>
            <nav className="flex items-baseline gap-5">
              <Link prefetch={false}
                href="/about"
                className="text-muted no-underline hover:text-fg hover:underline"
              >
                about
              </Link>
              <ThemeToggle />
            </nav>
          </header>
          <main id="main" className="flex-1">
            {children}
          </main>
          <footer className="pt-20 pb-8 text-base text-muted">
            <a
              href="/rss.xml"
              className="no-underline hover:text-fg hover:underline"
            >
              rss
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
