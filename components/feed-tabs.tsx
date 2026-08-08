"use client";

import { useSyncExternalStore } from "react";
import { TYPE_LABELS, type ContentType } from "@/lib/types";

/** URL param = lowercased tab label (?tab=essays), per the tab bar the user
 *  sees; the internal value stays the type key ("essay") for CSS matching. */
const PARAM_TO_TYPE = new Map<string, ContentType>(
  (Object.entries(TYPE_LABELS) as [ContentType, string][]).map(
    ([type, label]) => [label.toLowerCase(), type],
  ),
);

function tabParam(type: ContentType): string {
  return TYPE_LABELS[type].toLowerCase();
}

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readTabFromUrl(): string {
  const param = new URLSearchParams(window.location.search).get("tab");
  return (param && PARAM_TO_TYPE.get(param)) || "all";
}

/** The filter around the server-rendered feed. The item list arrives as
 *  `children` and is never re-rendered or refetched — this component only
 *  renders the tab buttons and stamps the active tab on a wrapper, and CSS
 *  (generated next to the list from the same type map) does the hiding.
 *
 *  The active tab lives in the URL (?tab=essays): read via
 *  useSyncExternalStore so back/forward just works, written via pushState so
 *  switching tabs never hits the server. Server snapshot is "all", which is
 *  also exactly what no-JS visitors get: the full feed.
 */
export function FeedTabs({
  types,
  children,
}: {
  types: ContentType[];
  children: React.ReactNode;
}) {
  const active = useSyncExternalStore(subscribe, readTabFromUrl, () => "all");

  function select(tab: string) {
    const url = new URL(window.location.href);
    if (tab === "all") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tabParam(tab as ContentType));
    window.history.pushState(null, "", url);
    // pushState doesn't emit popstate; nudge the store by hand.
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const tabs: [string, string][] = [
    ["all", "All"],
    ...types.map((t): [string, string] => [t, TYPE_LABELS[t]]),
  ];

  return (
    <div data-active-tab={active}>
      <nav aria-label="Filter by type" className="flex flex-wrap gap-x-5 gap-y-1">
        {tabs.map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            aria-pressed={active === tab}
            onClick={() => select(tab)}
            className={
              active === tab
                ? "cursor-pointer underline underline-offset-4"
                : "cursor-pointer text-muted hover:text-fg hover:underline hover:underline-offset-4"
            }
          >
            {label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}
