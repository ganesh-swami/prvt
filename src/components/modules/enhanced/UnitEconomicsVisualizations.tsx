import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface VisualizationsProps {
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
  metrics: {
    cac: string;
    arpu: string;
    averageOrderValue: string;
    numberOfCustomers: string;
    retentionRate: string;
    grossMargin: string;
    churnRate: string;
  };
}

const UnitEconomicsVisualizations: React.FC<VisualizationsProps> = ({ results, metrics }) => {
  const revenueData = [
    { name: 'Total Revenue', value: results.totalRevenue },
    { name: 'Gross Profit', value: results.grossProfit },
    { name: 'ARR', value: results.arr },
    { name: 'LTV', value: results.ltv }
  ];

  const profitabilityData = [
    { name: 'Revenue', value: results.totalRevenue, color: '#10B981' },
    { name: 'Costs', value: results.totalRevenue - results.grossProfit, color: '#EF4444' }
  ];

  const metricsComparison = [
    { metric: 'LTV:CAC', value: results.ltvCacRatio, target: 3, status: results.ltvCacRatio >= 3 ? 'good' : 'poor' },
    { metric: 'Retention', value: results.retentionRate, target: 80, status: results.retentionRate >= 80 ? 'good' : 'poor' },
    { metric: 'Payback (months)', value: results.paybackPeriod, target: 12, status: results.paybackPeriod <= 12 ? 'good' : 'poor' }
  ];

  console.log("metricsComparison", metricsComparison);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Financial Visualizations</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                  width={60}
                />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <PieChartIcon className="h-4 w-4" />
              Revenue vs Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={profitabilityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                >
                  {profitabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Key Metrics Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metricsComparison}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="metric"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, 1) * 1.1)]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'value') return [value.toFixed(2), 'Current Value'];
                  if (name === 'target') return [value.toFixed(2), 'Target'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Metric: ${label}`}
              />
              <Bar dataKey="value" fill="#3B82F6" name="Current Value" />
              <Bar dataKey="target" fill="#10B981" opacity={0.3} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitEconomicsVisualizations;