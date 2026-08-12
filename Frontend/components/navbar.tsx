"use client";

import Link from "next/link";
import { Heart, List, SignOut, UserCircle } from "@phosphor-icons/react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
 * - Left: on `md` and up a row of nav links (Donate / Raise funds / Analytics);
 *   below `md` those collapse into a hamburger that opens a slide-over sheet,
 *   so a phone row never tries to fit three 44px pills + the brand + auth.
 * - Center: brand — "Nkoso Crowdfund" (absolutely centered so it stays put
 *   regardless of how wide the left/right content gets)
 * - Right: "Sign up" when logged out, a welcome dropdown when logged in (the
 *   welcome text hides on mobile so a long username can't crowd the row).
 *
 * The link list is shared by the desktop row and the mobile sheet so the two
 * can never drift apart. Analytics points at /dashboard, which redirects to
 * the right tab for the user's role.
 */

const NAV_LINKS = [
  { href: "/campaigns", label: "Donate" },
  { href: "/campaigns/new", label: "Raise funds" },
  { href: "/dashboard", label: "Analytics" },
] as const;

const NAV_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left — desktop links row, or a mobile menu button below md */}
        <div className="flex min-w-0 flex-1 items-center">
          {/* Desktop row */}
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={NAV_LINK_CLASS}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 rounded-full md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <List weight="bold" className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="sr-only">Main menu</SheetTitle>
              <nav
                aria-label="Main"
                className="flex flex-col gap-1 p-4"
              >
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<Link href={link.href} className={NAV_LINK_CLASS} />}
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
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

        {/* Right — theme + auth */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <ThemeToggle />
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
                <span className="hidden max-w-40 truncate sm:inline">
                  {user.username ? `Welcome, ${user.username}` : `Welcome, ${user.email}`}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col py-0.5">
                      <span className="font-medium">
                        Signed in as {user.username || user.email}
                      </span>
                      {user.username && (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/profile/campaigns" />}>
                    My campaigns
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
