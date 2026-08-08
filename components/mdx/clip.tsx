interface ClipProps {
  /** A file in /public/media (`/media/foo.mp4`) or a full URL (Vercel Blob). */
  src: string;
  /** Poster frame — required so the element has content before any download. */
  poster: string;
  /** Intrinsic pixel size; reserves the aspect ratio so nothing shifts. */
  width?: number;
  height?: number;
  caption?: string;
  /** Autoplaying clips behave like animated figures: looped, muted, no
   *  controls. Off by default; leave it off for anything long. */
  autoPlay?: boolean;
}

/** Short, silent, self-hosted footage that behaves like a figure.
 *  Zero client JS — a native <video> element with conservative defaults:
 *  preload="metadata" so visitors who never press play download almost
 *  nothing, muted+playsInline so autoplay is allowed where enabled.
 */
export function Clip({
  src,
  poster,
  width = 1280,
  height = 720,
  caption,
  autoPlay = false,
}: ClipProps) {
  return (
    <figure>
      <video
        src={src}
        poster={poster}
        width={width}
        height={height}
        preload="metadata"
        playsInline
        muted
        loop
        autoPlay={autoPlay}
        controls={!autoPlay}
        className="h-auto w-full bg-code-bg"
      />
      {caption && (
        <figcaption className="mt-2 text-base text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}
