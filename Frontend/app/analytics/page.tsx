"use client";

import {
  CurrencyCircleDollar,
  Gift,
  Users,
  Megaphone,
  TrendUp,
  Trophy,
} from "@phosphor-icons/react";

const stats = [
  {
    title: "Total Funds Raised",
    value: "GH₵ 12,450",
    icon: CurrencyCircleDollar,
    description: "Across your campaigns",
  },
  {
    title: "Total Donations",
    value: "48",
    icon: Gift,
    description: "Donations received",
  },
  {
    title: "Total Donors",
    value: "37",
    icon: Users,
    description: "People supported you",
  },
  {
    title: "Active Campaigns",
    value: "3",
    icon: Megaphone,
    description: "Currently running",
  },
];

const campaigns = [
  {
    name: "Help Build a School",
    raised: 7500,
    goal: 10000,
  },
  {
    name: "Medical Support Fund",
    raised: 2600,
    goal: 5000,
  },
  {
    name: "Community Project",
    raised: 8200,
    goal: 9000,
  },
];

const donations = [
  {
    donor: "Anonymous",
    amount: "GH₵ 250",
    date: "August 8, 2026",
  },
  {
    donor: "John Doe",
    amount: "GH₵ 100",
    date: "August 6, 2026",
  },
  {
    donor: "Mary Mensah",
    amount: "GH₵ 150",
    date: "August 3, 2026",
  },
];

export default function AnalyticsPage() {
  const averageDonation = 12450 / 48;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Your Analytics
          </h1>

          <p className="mt-2 text-muted-foreground">
            Track the performance of your campaigns and donations.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    className="size-5 text-primary"
                    weight="fill"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Campaign Performance */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <TrendUp
                className="size-5 text-primary"
                weight="bold"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Campaign Performance
              </h2>

              <p className="text-sm text-muted-foreground">
                See how your campaigns are progressing toward their goals.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const progress = Math.min(
                (campaign.raised / campaign.goal) * 100,
                100
              );

              return (
                <div key={campaign.name}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-foreground">
                      {campaign.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>
                      GH₵ {campaign.raised.toLocaleString()} raised
                    </span>

                    <span>
                      Goal: GH₵ {campaign.goal.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Donations */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Donations
              </h2>

              <p className="text-sm text-muted-foreground">
                Latest donations received by your campaigns.
              </p>
            </div>

            <div className="divide-y divide-border">
              {donations.map((donation, index) => (
                <div
                  key={`${donation.donor}-${index}`}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {donation.donor}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {donation.date}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    {donation.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Campaign */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Trophy
                  className="size-5 text-primary"
                  weight="fill"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Top Performing Campaign
                </h2>

                <p className="text-sm text-muted-foreground">
                  Your campaign with the strongest performance.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-5">
              <p className="text-base font-semibold text-foreground">
                Community Project
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                GH₵ 8,200 raised of GH₵ 9,000
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "91%" }}
                />
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Campaign progress
                </span>

                <span className="font-semibold text-foreground">
                  91%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Donation */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Average Donation
          </p>

          <p className="mt-1 text-2xl font-semibold text-foreground">
            GH₵ {averageDonation.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Average amount received per donation
          </p>
        </div>
      </section>
    </main>
  );
}

