"use client";

import Link from "next/link";
import { Heart, SignOut, UserCircle } from "@phosphor-icons/react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Site-wide navbar.
 *
 * Three-zone layout:
 * - Left: nav links (Donate, Raise funds, Analytics)
 * - Center: brand — "Nkoso Crowdfund" (absolutely centered so it stays put
 *   regardless of how wide the left/right content gets)
 * - Right: "Sign up" when logged out, a welcome dropdown when logged in
 *
 * Analytics points admins at /dashboard/admin and everyone else at
 * /dashboard/creator.
 */

export function Navbar() {
  const { user, loading, logout } = useAuth();

  const analyticsHref =
    user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/creator";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left — nav links */}
        <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <Link
            href="/campaigns"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Donate
          </Link>
          <Link
            href="/campaigns/new"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Raise funds
          </Link>
          <Link
            href={analyticsHref}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Analytics
          </Link>
        </div>

        {/* Center — brand */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
        >
          <Heart weight="fill" className="size-5 text-primary" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            <span className="sm:hidden">Nkoso</span>
            <span className="hidden sm:inline">Nkoso Crowdfund</span>
          </span>
        </Link>

        {/* Right — auth */}
        <div className="flex min-w-0 items-center justify-end">
          {loading ? (
            // Reserve space while the session hydrates so the row doesn't jump
            <div className="h-9 w-24" aria-hidden="true" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "gap-2 rounded-full",
                )}
              >
                <UserCircle className="size-5" />
                <span className="max-w-40 truncate">Welcome, {user.email}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Signed in as {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    <SignOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signup"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Sign up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
