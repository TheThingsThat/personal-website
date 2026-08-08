"use client";

import { useState } from "react";

interface YouTubeProps {
  /** The video id — the `v=` parameter, e.g. "jNQXAC9IVRw". */
  id: string;
  /** Used for the accessible play-button label and the iframe title. */
  title: string;
  /** Start offset in seconds. */
  start?: number;
}

/** Facade embed: on load this is only a thumbnail and a play button — the
 *  YouTube iframe (and its ~1MB of scripts) is injected on first click, with
 *  autoplay so the click still means "play". Aspect ratio is fixed at 16:9 so
 *  nothing shifts when the iframe swaps in.
 */
export function YouTube({ id, title, start }: YouTubeProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  const thumb = thumbFailed
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <div className="relative aspect-video w-full bg-code-bg">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1${
            start ? `&start=${start}` : ""
          }`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* Plain <img>: a remote thumbnail with an onError fallback chain
              isn't worth routing through image optimization. */}
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <svg
            viewBox="0 0 72 72"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 w-14 -translate-x-1/2 -translate-y-1/2"
          >
            <circle cx="36" cy="36" r="34" fill="#1a1a18" fillOpacity="0.75" />
            <path d="M29 24l22 12-22 12z" fill="#fdfdfc" />
          </svg>
        </button>
      )}
    </div>
  );
}
