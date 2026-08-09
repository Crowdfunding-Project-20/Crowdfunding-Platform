"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Heart } from "@phosphor-icons/react";

/**
 * Shared split-screen shell for /login and /signup.
 *
 * Layout:
 * - Desktop: image panel on the left, form panel on the right.
 * - Mobile: image panel is hidden; form panel fills the viewport.
 *
 * Styling follows the project's warm, community-driven direction:
 * - Photographic left panel with a dark scrim for contrast.
 * - Right panel uses the theme background so light/dark mode switches cleanly.
 */

interface AuthSplitShellProps {
  children: ReactNode;
}

export function AuthSplitShell({ children }: AuthSplitShellProps) {
  return (
    <main className="flex min-h-screen w-full bg-background">
      {/* Left image panel — hidden below md */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden md:flex lg:w-[45%]">
        <Image
          src="/login.jpg"
          alt="A warm, community-driven scene"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 45vw"
        />
        {/* Dark scrim for readability */}
        <div
          className="absolute inset-0 bg-black/30 dark:bg-black/50"
          aria-hidden="true"
        />

        {/* Top-left wordmark */}
        <div className="relative z-10 p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-white backdrop-blur-md">
            <Heart weight="fill" className="size-5 text-primary" />
            <span className="text-sm font-medium">Nkoso</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 p-8">
          <blockquote className="max-w-xs text-white">
            <p className="text-2xl font-medium leading-snug">
              Crowdfunding built for your community
            </p>
            <p className="mt-2 text-sm text-white/80">
              Join neighbors helping neighbors bring ideas to life.
            </p>
          </blockquote>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex w-full flex-col items-center justify-center p-4 sm:p-8 md:w-1/2 md:px-12 lg:w-[55%] lg:px-16">
        {children}
      </section>
    </main>
  );
}
