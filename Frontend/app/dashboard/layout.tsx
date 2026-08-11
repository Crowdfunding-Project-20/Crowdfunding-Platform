import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

/**
 * Shell shared by the three dashboards — page frame plus the tab bar.
 *
 * A server component: it holds no state, so the auth-dependent parts (the tab
 * bar, each page's data fetching) stay the client boundaries.
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6">
        <DashboardTabs />
        {children}
      </div>
    </main>
  );
}
