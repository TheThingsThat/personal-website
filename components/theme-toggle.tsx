"use client";

import { useState } from "react";

function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Text-button theme switch. The inline script in the root layout has already
 *  set data-theme before hydration, so the initial state is read from the DOM;
 *  suppressHydrationWarning covers the server-rendered default label. */
export function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const target = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = target;
    try {
      localStorage.setItem("theme", target);
    } catch {
      /* private mode etc. — theme still applies for this page view */
    }
    setTheme(target);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${target} theme`}
      className="cursor-pointer text-muted hover:text-fg hover:underline"
      suppressHydrationWarning
    >
      {target}
    </button>
  );
}
