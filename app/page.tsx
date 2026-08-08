import type { Metadata } from "next";
import { FeedList } from "@/components/feed-list";
import { FeedTabs } from "@/components/feed-tabs";
import { getAllItems, getPresentTypes } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const items = getAllItems();
  const types = getPresentTypes();

  return (
    <>
      <h1 className="sr-only">{site.name}</h1>
      <p className="mb-10 max-w-[60ch]">
        I&rsquo;m Tim. I build robots, write software, and occasionally write
        prose about both. This site is one feed of everything — essays,
        projects, and half-finished thoughts. (Placeholder intro: replace me.)
      </p>
      <FeedTabs types={types}>
        <FeedList items={items} />
      </FeedTabs>
    </>
  );
}
