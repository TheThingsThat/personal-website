import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am and what this site is.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="prose">
      <h1 className="text-3xl">About</h1>
      <p>
        Placeholder. I&rsquo;m Tim — a student who spends most of his free time
        on robots, software, and the occasional essay. This site collects all
        of it in one place, without a template&rsquo;s worth of chrome around
        it.
      </p>
      <p>
        The site itself is intentionally plain: server-rendered text, system
        fonts, no tracking, no spinners. If something here looks broken, it is
        more likely a decision than an accident — but feel free to tell me
        anyway.
      </p>
    </article>
  );
}
