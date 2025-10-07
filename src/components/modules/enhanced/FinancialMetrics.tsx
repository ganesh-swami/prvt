import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Projections = {
  initialRevenue: string;
  growthRate: string;   // monthly %
  cogs: string;         // % of revenue
  staffCosts: string;
  marketingCosts: string;
  adminCosts: string;
  investments: string;  // treated as asset base
  taxRate: string;
  timeHorizon: string;  // months
};

type Results = {
  monthlyProjections: Array<{ month: number; revenue: number }>;
  totalRevenue: number;
  totalOperatingExpenses: number;
  totalCogs: number;
  grossProfit: number;
  ebitda: number;
  netProfit: number;
  revenueGrowthRate: number; // monthly %
};

const num = (v: any, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

const badge = (label: string, color: "green" | "blue" | "red") => {
  const map = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  } as const;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[color]}`}>{label}</span>;
};

const statusForPct = (val: number, good: number, excellent: number) => {
  if (val >= excellent) return badge("Excellent", "green");
  if (val >= good) return badge("Good", "blue");
  return badge("Needs Improvement", "red");
};

const statusForLowIsBetter = (val: number, goodMax: number, excellentMax: number) => {
  if (val <= excellentMax) return badge("Excellent", "green");
  if (val <= goodMax) return badge("Good", "blue");
  return badge("Needs Improvement", "red");
};

const FinancialMetrics: React.FC<{ projections: Projections; results: Results }> = ({ projections, results }) => {
  const months = Math.max(num(projections.timeHorizon, 12), 1);
  const investments = num(projections.investments, 0);
  const growthMonthly = num(projections.growthRate, 0) / 100;
  const cogsFrac = num(projections.cogs, 0) / 100;
  const fixedCosts = num(projections.staffCosts, 0) + num(projections.marketingCosts, 0) + num(projections.adminCosts, 0);

  // 1) ROI = total net profit (horizon) / investments
  const roi = investments > 0 ? (results.netProfit / investments) * 100 : 0;

  // 2) Operating margin ~ EBITDA / Revenue
  const operatingMargin = results.totalRevenue > 0 ? (results.ebitda / results.totalRevenue) * 100 : 0;

  // 3) Asset turnover ≈ Revenue / Asset base (use investments as proxy)
  const assetTurnover = investments > 0 ? results.totalRevenue / investments : 0;

  // 4) Expense ratio = OpEx / Revenue
  const expenseRatio = results.totalRevenue > 0 ? (results.totalOperatingExpenses / results.totalRevenue) * 100 : 0;

  // 5) Burn rate (monthly) — if losing money, average monthly cash burn
  const monthlyNet = results.netProfit / months;
  const burnRate = monthlyNet < 0 ? -monthlyNet : 0; // positive number indicates monthly outflow

  // 6) Annualized growth rate from monthly %
  const annualizedGrowth = (Math.pow(1 + growthMonthly, 12) - 1) * 100;

  // 7) Revenue run rate = last month revenue * 12
  const lastRevenue = results.monthlyProjections.at(-1)?.revenue ?? 0;
  const revenueRunRate = lastRevenue * 12;

  // 8) Break-even revenue (monthly) = FixedCosts / (1 - COGS%)
  const cmRatio = 1 - cogsFrac;
  const breakEvenRevenue = cmRatio > 0 ? fixedCosts / cmRatio : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Return on Investment (ROI)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">ROI</div>
            <div className="text-lg font-semibold">{roi.toFixed(1)}% {statusForPct(roi, 15, 50)}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Measures total net profit over the horizon relative to the invested capital. Higher is better.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Margin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">EBITDA / Revenue</div>
            <div className="text-lg font-semibold">{operatingMargin.toFixed(1)}% {statusForPct(operatingMargin, 10, 20)}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage of revenue left after COGS and operating expenses (before D&A). Indicates operating efficiency.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Turnover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Revenue / Assets</div>
            <div className="text-lg font-semibold">{assetTurnover.toFixed(2)}x {statusForPct(assetTurnover * 100, 100, 200)}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Sales generated per dollar invested (investments treated as asset base). Higher is better.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Ratio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">OpEx / Revenue</div>
            <div className="text-lg font-semibold">{expenseRatio.toFixed(1)}% {statusForLowIsBetter(expenseRatio, 60, 40)}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Share of revenue consumed by operating expenses. Lower is better (with adequate investment).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Burn Rate (Monthly)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Avg. cash outflow per month</div>
            <div className="text-lg font-semibold">
              ${burnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {" "}
              {statusForLowIsBetter(burnRate, 5000, 0)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Positive value only when the business is losing money over the period. Lower is better.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annualized Growth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">From monthly growth rate</div>
            <div className="text-lg font-semibold">{annualizedGrowth.toFixed(1)}% {statusForPct(annualizedGrowth, 15, 30)}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Converts your monthly growth assumption into a yearly rate: (1 + g)^12 − 1.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Run Rate (Annual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Last month × 12</div>
            <div className="text-lg font-semibold">
              ${revenueRunRate.toLocaleString()}
              {" "}
              {statusForPct((revenueRunRate / (results.totalRevenue / months || 1)) * 100, 100, 150)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Annualizes the most recent monthly revenue; helpful for forward-looking pacing.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Break-even Revenue (Monthly)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Fixed costs / (1 − COGS%)</div>
            <div className="text-lg font-semibold">
              ${breakEvenRevenue.toLocaleString()} {statusForLowIsBetter(breakEvenRevenue, 50000, 20000)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue needed per month to cover fixed costs given your gross margin (1 − COGS%).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetrics;
