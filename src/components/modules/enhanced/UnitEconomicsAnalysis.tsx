import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisProps {
  results: {
    ltv: number;
    ltvCacRatio: number;
    paybackPeriod: number;
    arr: number;
    grossProfit: number;
    totalRevenue: number;
    retentionRate: number;
    grossMarginPerLifespan: number;
    unitProfitability: number;
  };
}

const UnitEconomicsAnalysis: React.FC<AnalysisProps> = ({ results }) => {
  const getHealthIndicator = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return { icon: CheckCircle, color: 'text-green-600', status: 'Excellent' };
    if (value >= thresholds.fair) return { icon: TrendingUp, color: 'text-yellow-600', status: 'Good' };
    return { icon: AlertTriangle, color: 'text-red-600', status: 'Needs Improvement' };
  };

  const ltvCacHealth = getHealthIndicator(results.ltvCacRatio, { good: 3, fair: 2 });
  const retentionHealth = getHealthIndicator(results.retentionRate, { good: 80, fair: 60 });
  const paybackHealth = getHealthIndicator(12 - results.paybackPeriod, { good: 6, fair: 3 });

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Unit Economics Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ltvCacHealth.icon className={`h-4 w-4 ${ltvCacHealth.color}`} />
              LTV:CAC Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ltvCacHealth.color}`}>
              {results.ltvCacRatio.toFixed(1)}:1
            </div>
            <p className="text-xs text-gray-600">{ltvCacHealth.status}</p>
            <Progress value={Math.min(results.ltvCacRatio * 20, 100)} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <retentionHealth.icon className={`h-4 w-4 ${retentionHealth.color}`} />
              Retention Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${retentionHealth.color}`}>
              {results.retentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">{retentionHealth.status}</p>
            <Progress value={results.retentionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <paybackHealth.icon className={`h-4 w-4 ${paybackHealth.color}`} />
              Payback Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${paybackHealth.color}`}>
              {results.paybackPeriod.toFixed(1)}m
            </div>
            <p className="text-xs text-gray-600">{paybackHealth.status}</p>
            <Progress value={Math.max(0, 100 - (results.paybackPeriod * 8))} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Annual Recurring Revenue</span>
              <span className="font-semibold">${results.arr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-semibold">${results.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gross Profit</span>
              <span className="font-semibold">${results.grossProfit.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Unit Profitability</span>
              <span className={`font-semibold ${results.unitProfitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${results.unitProfitability.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gross Margin per Lifespan</span>
              <span className="font-semibold">${results.grossMarginPerLifespan.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer LTV</span>
              <span className="font-semibold">${results.ltv.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnitEconomicsAnalysis;