"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/**
 * TrendChart — cumulative amount over time.
 *
 * Colour comes from the ChartConfig `color` field (a var() reference), not a
 * literal, because ChartStyle emits a `.dark` rule from the same config — a
 * hardcoded hex would look identical in both themes and disappear in one.
 *
 * The container needs a definite height: ChartContainer defaults to
 * `aspect-video`, and overriding it with an auto-height class collapses the
 * chart to 0px (the same trap CampaignCard documents for its image).
 *
 * Callers must not render this with an empty `data` array — recharts draws bare
 * axes and no line, which reads as a broken chart rather than "no data yet".
 */

const chartConfig = {
  amount: {
    label: "Total",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TrendChart({
  data,
  className,
}: {
  data: { key: string; label: string; amount: number }[];
  className?: string;
}) {
  return (
    <ChartContainer
      config={chartConfig}
      role="img"
      aria-label="Amount raised over time"
      className={className ?? "h-[240px] w-full"}
    >
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={56}
          tickFormatter={(value) => formatMoney(Number(value))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatMoney(Number(value))}
            />
          }
        />
        <Area
          dataKey="amount"
          type="monotone"
          stroke="var(--color-amount)"
          strokeWidth={2}
          fill="url(#trend-fill)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
