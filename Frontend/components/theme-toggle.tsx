"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export const THEME_KEY = "nkoso_theme";

/**
 * Light/dark toggle.
 *
 * The palette for both modes already lives in globals.css behind the `.dark`
 * variant — this is what actually puts the class on <html>.
 *
 * Hand-rolled rather than pulling in next-themes: it's ~30 lines and one less
 * dependency. The matching no-flash script lives in app/layout.tsx and must
 * read the same key, so THEME_KEY is exported rather than inlined twice.
 */
export function ThemeToggle() {
  // `null` until mounted — the server can't know the stored theme, so we render
  // a same-sized placeholder to keep the navbar row from jumping.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* Private mode / storage disabled — the toggle still works for this page. */
    }
    setIsDark(next);
  }

  if (isDark === null) {
    return <div className="size-11" aria-hidden="true" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="size-11 rounded-full"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </Button>
  );
}
