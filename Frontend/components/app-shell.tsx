"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Routing-aware site chrome.
 *
 * Rendered from the root layout inside AuthProvider. Hides the navbar and
 * footer on standalone auth pages so those screens get the full split-screen
 * view. `navbar`/`footer` are passed in as slots from the server layout so the
 * footer stays a Server Component. Add any future auth routes (e.g.
 * /forgot-password) to AUTH_PATHS.
 */
const AUTH_PATHS = new Set(["/login", "/signup"]);

export function AppShell({
  children,
  navbar,
  footer,
}: {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = AUTH_PATHS.has(pathname);

  return (
    <>
      {!hideChrome && navbar}
      {children}
      {!hideChrome && footer}
    </>
  );
}