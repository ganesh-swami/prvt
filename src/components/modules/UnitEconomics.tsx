import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Users, Target, Calculator, BarChart3, Clock, Zap } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ExportOptions } from '@/components/common/ExportOptions';
import SaveButtons from '@/components/common/SaveButtons';
const UnitEconomics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    customerAcquisitionCost: '',
    averageRevenuePerUser: '',
    averageOrderValue: '',
    numberOfCustomers: '',
    retentionRate: '',
    transactionSize: '',
    discountRate: '',
    grossMargin: '',
    churnRate: '',
    operatingExpenses: ''
  });

  const [results, setResults] = useState({
    ltv: 0,
    ltvCacRatio: 0,
    paybackPeriod: 0,
    arr: 0,
    grossProfit: 0,
    totalRevenue: 0,
    retentionRate: 0,
    grossMarginPerLifespan: 0,
    unitProfitability: 0
  });

  // Sample data for export
  const cohortAnalysis = [
    { month: 1, retention: 100, revenue: parseFloat(metrics.averageRevenuePerUser) || 0 },
    { month: 3, retention: 85, revenue: (parseFloat(metrics.averageRevenuePerUser) || 0) * 0.85 },
    { month: 6, retention: 70, revenue: (parseFloat(metrics.averageRevenuePerUser) || 0) * 0.70 },
    { month: 12, retention: 60, revenue: (parseFloat(metrics.averageRevenuePerUser) || 0) * 0.60 }
  ];

  const scenarios = [
    { scenario: 'Conservative', ltv: results.ltv * 0.8, cac: parseFloat(metrics.customerAcquisitionCost) || 0 },
    { scenario: 'Base Case', ltv: results.ltv, cac: parseFloat(metrics.customerAcquisitionCost) || 0 },
    { scenario: 'Optimistic', ltv: results.ltv * 1.2, cac: parseFloat(metrics.customerAcquisitionCost) || 0 }
  ];
  const calculateUnitEconomics = () => {
    const cac = parseFloat(metrics.customerAcquisitionCost) || 0;
    const arpu = parseFloat(metrics.averageRevenuePerUser) || 0;
    const aov = parseFloat(metrics.averageOrderValue) || 0;
    const customers = parseFloat(metrics.numberOfCustomers) || 0;
    const retention = parseFloat(metrics.retentionRate) || 0;
    const margin = parseFloat(metrics.grossMargin) || 0;
    const churn = parseFloat(metrics.churnRate) || 0;

    // Advanced calculations
    const customerLifespan = churn > 0 ? 1 / (churn / 100) : 0;
    const grossProfit = arpu * (margin / 100);
    const ltv = grossProfit * customerLifespan;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const paybackPeriod = grossProfit > 0 ? cac / grossProfit : 0;
    const arr = arpu * 12 * customers;
    const totalRevenue = customers * aov;

    setResults({
      ltv,
      ltvCacRatio,
      paybackPeriod,
      arr,
      grossProfit: totalRevenue * (margin / 100),
      totalRevenue,
      retentionRate: retention,
      grossMarginPerLifespan: grossProfit * customerLifespan,
      unitProfitability: ltv - cac
    });
  };

  const getRatioColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600';
    if (ratio >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Unit Economics</h1>
            <p className="text-muted-foreground">Analyze customer lifetime value and profitability metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons 
            moduleKey="unit-economics" 
            moduleData={{ metrics, results }}
            onSave={() => console.log('Unit economics data saved')}
          />
          <ExportOptions 
            data={{ metrics, cohortAnalysis, scenarios }}
            filename="unit-economics"
            moduleName="Unit Economics Analysis"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cac">Customer Acquisition Cost ($)</Label>
                <Input
                  id="cac"
                  type="number"
                  value={metrics.customerAcquisitionCost}
                  onChange={(e) => setMetrics({...metrics, customerAcquisitionCost: e.target.value})}
                  placeholder="Cost to acquire one customer"
                />
              </div>
              <div>
                <Label htmlFor="arpu">Average Revenue Per User ($/month)</Label>
                <Input
                  id="arpu"
                  type="number"
                  value={metrics.averageRevenuePerUser}
                  onChange={(e) => setMetrics({...metrics, averageRevenuePerUser: e.target.value})}
                  placeholder="Monthly revenue per customer"
                />
              </div>
              <div>
                <Label htmlFor="aov">Average Order Value ($)</Label>
                <Input
                  id="aov"
                  type="number"
                  value={metrics.averageOrderValue}
                  onChange={(e) => setMetrics({...metrics, averageOrderValue: e.target.value})}
                  placeholder="Average transaction value"
                />
              </div>
              <div>
                <Label htmlFor="customers">Number of Customers</Label>
                <Input
                  id="customers"
                  type="number"
                  value={metrics.numberOfCustomers}
                  onChange={(e) => setMetrics({...metrics, numberOfCustomers: e.target.value})}
                  placeholder="Total active customers"
                />
              </div>
              <div>
                <Label htmlFor="retention">Retention Rate (%)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={metrics.retentionRate}
                  onChange={(e) => setMetrics({...metrics, retentionRate: e.target.value})}
                  placeholder="Customer retention percentage"
                />
              </div>
              <div>
                <Label htmlFor="margin">Gross Margin (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={metrics.grossMargin}
                  onChange={(e) => setMetrics({...metrics, grossMargin: e.target.value})}
                  placeholder="Gross profit margin"
                />
              </div>
              <div>
                <Label htmlFor="churn">Monthly Churn Rate (%)</Label>
                <Input
                  id="churn"
                  type="number"
                  value={metrics.churnRate}
                  onChange={(e) => setMetrics({...metrics, churnRate: e.target.value})}
                  placeholder="Customer churn rate"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Rate (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={metrics.discountRate}
                  onChange={(e) => setMetrics({...metrics, discountRate: e.target.value})}
                  placeholder="Average discount given"
                />
              </div>
            </div>
            <Button onClick={calculateUnitEconomics} className="w-full">
              Calculate Unit Economics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Economics Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Customer LTV</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${results.ltv.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">LTV:CAC Ratio</div>
                  <div className={`text-2xl font-bold ${getRatioColor(results.ltvCacRatio)}`}>
                    {results.ltvCacRatio.toFixed(1)}:1
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={Math.min(results.ltvCacRatio * 20, 100)} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: 3:1 or higher</div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Annual Recurring Revenue</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${results.arr.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ${results.totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default UnitEconomics;