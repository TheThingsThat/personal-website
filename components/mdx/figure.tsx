import Image from "next/image";

interface FigureProps {
  src: string;
  /** Required — the build fails (during prerender) if omitted. */
  alt: string;
  caption?: string;
  /** Intrinsic pixel size. Pass the real dimensions to avoid layout shift;
   *  the rendered size is always the content column width. */
  width?: number;
  height?: number;
}

/** An image inside content. Never wider than the content column; height
 *  follows the intrinsic aspect ratio. */
export function Figure({
  src,
  alt,
  caption,
  width = 1600,
  height = 1000,
}: FigureProps) {
  if (typeof alt !== "string") {
    throw new Error(`<Figure src="${src}"> requires an alt text (alt="…")`);
  }
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 720px) 630px, 100vw"
        className="h-auto w-full"
      />
      {caption && (
        <figcaption className="mt-2 text-base text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}
