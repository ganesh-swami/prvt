"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FinancialModelAnalysisProps {
  results: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    grossMargin: number;
    totalOperatingExpenses: number;
    ebitda: number;
    netProfit: number;
    netMargin: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    breakEvenMonth: number;
    profitabilityRatio: number;
    revenueGrowthRate: number;
  };
}

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const num = (v: any, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

const getHealthStatus = (value: number, thresholds: { good: number; excellent: number }) => {
  if (value >= thresholds.excellent) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (value >= thresholds.good) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  return { status: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
};

const FinancialModelAnalysis: React.FC<FinancialModelAnalysisProps> = ({ results }) => {
  const totalRevenue = num(results.totalRevenue);
  const grossMargin = num(results.grossMargin);
  const netMargin = num(results.netMargin);
  const operatingCashFlow = num(results.operatingCashFlow);
  const freeCashFlow = num(results.freeCashFlow);
  const grossProfit = num(results.grossProfit);
  const ebitda = num(results.ebitda);
  const totalOperatingExpenses = num(results.totalOperatingExpenses);
  const totalCogs = num(results.totalCogs);
  const netProfit = num(results.netProfit);
  const profitabilityRatio = num(results.profitabilityRatio);
  const breakEvenMonth = num(results.breakEvenMonth);
  const revenueGrowthRate = num(results.revenueGrowthRate);

  const cashFlowPct = pct(operatingCashFlow, totalRevenue);
  const grossMarginHealth = getHealthStatus(grossMargin, { good: 40, excellent: 60 });
  const netMarginHealth = getHealthStatus(netMargin, { good: 10, excellent: 20 });
  const cashFlowHealth = getHealthStatus(cashFlowPct, { good: 15, excellent: 25 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${grossMarginHealth.bgColor} ${grossMarginHealth.color}`}>
              {grossMarginHealth.status}
            </div>
            <div className="mt-2">
              <Progress value={clamp(grossMargin)} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">{grossMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Margin Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${netMarginHealth.bgColor} ${netMarginHealth.color}`}>
              {netMarginHealth.status}
            </div>
            <div className="mt-2">
              <Progress value={clamp(netMargin)} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">{netMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cashFlowHealth.bgColor} ${cashFlowHealth.color}`}>
              {cashFlowHealth.status}
            </div>
            <div className="mt-2">
              <Progress value={clamp(cashFlowPct)} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">{cashFlowPct.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Profitability Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gross Profit:</span>
              <span className="font-medium">${grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">EBITDA:</span>
              <span className="font-medium">${ebitda.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Profit:</span>
              <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Profitability Ratio:</span>
              <span className="font-medium">{profitabilityRatio.toFixed(2)}x</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Operating Cash Flow:</span>
              <span className={`font-medium ${operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${operatingCashFlow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Free Cash Flow:</span>
              <span className={`font-medium ${freeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${freeCashFlow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Break-Even Month:</span>
              <span className="font-medium">
                {breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'Not Reached'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue Growth:</span>
              <span className="font-medium">{num(revenueGrowthRate).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialModelAnalysis;
