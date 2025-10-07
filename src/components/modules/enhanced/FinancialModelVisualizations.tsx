import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

interface FinancialModelVisualizationsProps {
  monthlyProjections: Array<{
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    operatingCashFlow: number;
    cumulativeProfit: number;
  }>;
  summaryData: {
    totalRevenue: number;
    totalCogs: number;
    totalOperatingExpenses: number;
    netProfit: number;
  };
}

const num = (v: any, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

const FinancialModelVisualizations: React.FC<FinancialModelVisualizationsProps> = ({
  monthlyProjections,
  summaryData,
}) => {
  // 🔧 Nudge Recharts to recalc dimensions after mount
  React.useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
    return () => clearTimeout(id);
  }, []);

  const revenueVsProfitData = React.useMemo(
    () =>
      (monthlyProjections || []).map((item) => ({
        month: `M${num(item.month)}`,
        revenue: num(item.revenue),
        grossProfit: num(item.grossProfit),
        netProfit: num(item.netProfit),
      })),
    [monthlyProjections]
  );

  const cashFlowData = React.useMemo(
    () =>
      (monthlyProjections || []).map((item) => ({
        month: `M${num(item.month)}`,
        operatingCashFlow: num(item.operatingCashFlow),
        cumulativeProfit: num(item.cumulativeProfit),
      })),
    [monthlyProjections]
  );

  const expenseBreakdown = React.useMemo(
    () => [
      { name: "COGS", value: Math.max(num(summaryData.totalCogs), 0), color: "#EF4444" },
      { name: "Operating Expenses", value: Math.max(num(summaryData.totalOperatingExpenses), 0), color: "#F59E0B" },
      { name: "Net Profit", value: Math.max(num(summaryData.netProfit), 0), color: "#10B981" },
    ],
    [summaryData.totalCogs, summaryData.totalOperatingExpenses, summaryData.netProfit]
  );

  const allZero = expenseBreakdown.every((x) => x.value === 0);
  const pieData = allZero ? [{ name: "No Data", value: 1, color: "#E5E7EB" }] : expenseBreakdown;

  const tooltipCurrency = (value: any) => [`$${num(value).toLocaleString()}`, ""];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Revenue vs Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueVsProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={tooltipCurrency} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" dot={false} />
                <Line type="monotone" dataKey="grossProfit" stroke="#10B981" strokeWidth={2} name="Gross Profit" dot={false} />
                <Line type="monotone" dataKey="netProfit" stroke="#8B5CF6" strokeWidth={2} name="Net Profit" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${Number.isFinite(percent) ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipCurrency} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueVsProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={tooltipCurrency} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="netProfit" fill="#10B981" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={tooltipCurrency} />
                <Line type="monotone" dataKey="operatingCashFlow" stroke="#6366F1" strokeWidth={2} name="Operating Cash Flow" dot={false} />
                <Line type="monotone" dataKey="cumulativeProfit" stroke="#EC4899" strokeWidth={2} name="Cumulative Profit" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialModelVisualizations;
