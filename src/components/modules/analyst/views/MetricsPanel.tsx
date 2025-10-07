import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, CheckCircle, Activity, DollarSign } from "lucide-react";
import { AnalystResults, AnalystProjections } from "../types";

interface MetricsPanelProps {
  results: AnalystResults;
  projections: AnalystProjections;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ results, projections }) => {
  const getHealthBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
    if (value >= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
  };

  // Calculated metrics
  const avgMonthlyRevenue = results.totalRevenue / projections.months;
  const annualizedGrowth = projections.growthRateMonthlyPct * 12;
  const operatingMargin = results.avgEbitdaMargin;
  const assetTurnover = results.totalRevenue / projections.investments;
  const expenseRatio = (projections.staffCosts + projections.marketingCosts + projections.adminCosts) / avgMonthlyRevenue * 100;
  const avgBurnRate = results.months.reduce((sum, m) => sum + Math.abs(Math.min(0, m.freeCF)), 0) / projections.months;
  const runRate = avgMonthlyRevenue * 12;
  const breakEvenRevenue = (projections.staffCosts + projections.marketingCosts + projections.adminCosts) / (1 - projections.cogsPct / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ROI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-blue-600" />
              Return on Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number.isFinite(results.profitabilityIndex) ? (results.profitabilityIndex * 100).toFixed(1) + "%" : "—"}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getHealthBadge(results.profitabilityIndex * 100, { good: 120, warning: 100 })}
            </div>
          </CardContent>
        </Card>

        {/* Operating Margin */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-green-600" />
              Operating Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operatingMargin.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getHealthBadge(operatingMargin, { good: 20, warning: 10 })}
            </div>
          </CardContent>
        </Card>

        {/* Asset Turnover */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Asset Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetTurnover.toFixed(2)}x</div>
            <div className="flex items-center gap-2 mt-2">
              {getHealthBadge(assetTurnover, { good: 1.5, warning: 1.0 })}
            </div>
          </CardContent>
        </Card>

        {/* Expense Ratio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Expense Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseRatio.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getHealthBadge(100 - expenseRatio, { good: 50, warning: 30 })}
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-red-600" />
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(avgBurnRate / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-2 mt-2">
              {avgBurnRate > 0 ? 
                <Badge className="bg-red-100 text-red-800">Burning</Badge> : 
                <Badge className="bg-green-100 text-green-800">Profitable</Badge>
              }
            </div>
          </CardContent>
        </Card>

        {/* Annualized Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Annualized Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{annualizedGrowth.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getHealthBadge(annualizedGrowth, { good: 50, warning: 20 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Rule of 40</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{results.ruleOf40.toFixed(1)}%</span>
                {results.ruleOf40 >= 40 ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                }
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Burn Multiple</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{results.burnMultiple.toFixed(1)}x</span>
                {results.burnMultiple <= 2 ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <AlertCircle className="h-4 w-4 text-red-600" />
                }
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>DSCR (Avg)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{results.avgDSCR.toFixed(2)}</span>
                {results.avgDSCR >= 1.25 ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <AlertCircle className="h-4 w-4 text-red-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Annual Run-rate</span>
              <span className="font-bold">${(runRate / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Break-even Revenue</span>
              <span className="font-bold">${(breakEvenRevenue / 1000).toFixed(0)}K/mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cash Runway</span>
              <span className="font-bold">
                {Number.isFinite(results.cashRunwayMonths) ? 
                  `${results.cashRunwayMonths.toFixed(0)} months` : 
                  "Infinite"
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsPanel;