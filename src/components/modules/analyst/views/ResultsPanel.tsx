import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import { AnalystResults } from "../types";

interface ResultsPanelProps {
  results: AnalystResults;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  // Nudge charts to recalc on mount
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(timer);
  }, []);

  const lineData = results.months.map(m => ({
    month: `M${m.month}`,
    Revenue: m.revenue,
    EBITDA: m.ebitda,
    "Net Income": m.netIncome
  }));

  const barData = results.months.map(m => ({
    month: `M${m.month}`,
    FCF: m.freeCF
  }));

  const formatCurrency = (value: any) => [`$${Number(value).toLocaleString()}`, ""];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium">Total Revenue</div>
            </div>
            <div className="text-2xl font-bold">${(results.totalRevenue / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium">EBITDA Margin</div>
            </div>
            <div className="text-2xl font-bold">{results.avgEbitdaMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-medium">Net Margin</div>
            </div>
            <div className="text-2xl font-bold">{results.avgNetMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div className="text-sm font-medium">Cash Runway</div>
            </div>
            <div className="text-2xl font-bold">
              {Number.isFinite(results.cashRunwayMonths) ? `${results.cashRunwayMonths.toFixed(0)}M` : "∞"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue, EBITDA & Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Line type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="EBITDA" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Net Income" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Free Cash Flow (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="FCF" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPanel;