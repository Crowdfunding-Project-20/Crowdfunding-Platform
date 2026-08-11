import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Whole-dollar money formatting — "$1,250".
 *
 * Shared by campaign cards, dashboard stat tiles and history tables so every
 * amount in the app reads the same way. Cents are dropped deliberately: the
 * numbers here are headline figures, not statements.
 */
export function formatMoney(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return "$0"
  return "$" + Math.round(amount).toLocaleString()
}

/** "14 Mar" — compact date for table rows and chart axes. */
export function formatShortDate(iso: string | null | undefined) {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "d MMM")
  } catch {
    return "—"
  }
}

/** "14 Mar 2026" — where the year matters (e.g. a "last donation" stat). */
export function formatLongDate(iso: string | null | undefined) {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "d MMM yyyy")
  } catch {
    return "—"
  }
}
