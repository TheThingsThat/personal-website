import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/components";
import { formatDate, getAllItems, getItem } from "@/lib/content";
import { mdxOptions } from "@/lib/mdx";
import { TYPE_LABELS } from "@/lib/types";

/* Every published item is prerendered; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllItems().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary || undefined,
    alternates: { canonical: `/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.summary || undefined,
      type: "article",
      publishedTime: item.date,
      images: item.cover ? [item.cover] : undefined,
    },
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  return (
    <article>
      <header>
        <h1 className="text-3xl">{item.title}</h1>
        <p className="mt-2 text-base text-muted">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          {" · "}
          {TYPE_LABELS[item.type]}
          {item.tags.length > 0 && <> · {item.tags.join(", ")}</>}
          {item.url && (
            <>
              {" · "}
              <a href={item.url} className="hover:text-fg">
                {new URL(item.url).hostname}
              </a>
            </>
          )}
        </p>
        {item.cover && (
          <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden">
            <Image
              src={item.cover}
              alt=""
              fill
              priority
              sizes="(min-width: 720px) 630px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </header>
      <div className="prose mt-10">
        <MDXRemote
          source={item.body}
          components={mdxComponents}
          options={{ mdxOptions }}
        />
      </div>
      <p className="mt-14">
        <Link prefetch={false} href="/" className="text-muted no-underline hover:text-fg hover:underline">
          ← Index
        </Link>
      </p>
    </article>
  );
}
