import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface ScenarioProps {
  baseMetrics: any;
  onScenarioChange: (scenario: any) => void;
}

const FinancialScenarios: React.FC<ScenarioProps> = ({ baseMetrics, onScenarioChange }) => {
  const [scenarios, setScenarios] = useState({
    optimistic: { growth: 20, retention: 10, margin: 5 },
    pessimistic: { growth: -15, retention: -10, margin: -5 },
    realistic: { growth: 5, retention: 2, margin: 1 }
  });

  const [forecastPeriod, setForecastPeriod] = useState('12');
  const [sensitivityMetric, setSensitivityMetric] = useState('cac');
  const [sensitivityRange, setSensitivityRange] = useState({ min: -50, max: 50 });

  const generateForecast = (scenario: string) => {
    const months = parseInt(forecastPeriod);
    const data = [];
    const scenarioData = scenarios[scenario as keyof typeof scenarios];
    
    for (let i = 1; i <= months; i++) {
      const growthFactor = 1 + (scenarioData.growth / 100) * (i / 12);
      const retentionFactor = 1 + (scenarioData.retention / 100);
      const marginFactor = 1 + (scenarioData.margin / 100);
      
      const revenue = parseFloat(baseMetrics.arpu || '0') * parseFloat(baseMetrics.numberOfCustomers || '0') * growthFactor;
      const ltv = revenue * retentionFactor * marginFactor * 0.1;
      
      data.push({
        month: `M${i}`,
        revenue: revenue,
        ltv: ltv,
        customers: parseFloat(baseMetrics.numberOfCustomers || '0') * growthFactor
      });
    }
    return data;
  };

  const generateSensitivityAnalysis = () => {
    const data = [];
    const baseValue = parseFloat(baseMetrics[sensitivityMetric] || '0');
    
    for (let i = sensitivityRange.min; i <= sensitivityRange.max; i += 10) {
      const adjustedValue = baseValue * (1 + i / 100);
      const impact = calculateImpact(sensitivityMetric, adjustedValue, baseValue);
      
      data.push({
        change: i,
        value: adjustedValue,
        impact: impact
      });
    }
    return data;
  };

  const calculateImpact = (metric: string, newValue: number, baseValue: number) => {
    const change = ((newValue - baseValue) / baseValue) * 100;
    return change * (metric === 'cac' ? -1 : 1); // CAC increase is negative impact
  };

  const optimisticData = generateForecast('optimistic');
  const realisticData = generateForecast('realistic');
  const pessimisticData = generateForecast('pessimistic');
  const sensitivityData = generateSensitivityAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Financial Scenarios & Modeling</h3>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
          <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize flex items-center gap-2">
                    {key === 'optimistic' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {key === 'pessimistic' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {key === 'realistic' && <Calculator className="h-4 w-4 text-blue-600" />}
                    {key} Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Growth Rate (%)</Label>
                    <Input
                      type="number"
                      value={scenario.growth}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        [key]: { ...scenario, growth: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Retention Change (%)</Label>
                    <Input
                      type="number"
                      value={scenario.retention}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        [key]: { ...scenario, retention: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Margin Change (%)</Label>
                    <Input
                      type="number"
                      value={scenario.margin}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        [key]: { ...scenario, margin: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue Forecast by Scenario</CardTitle>
              <div className="flex gap-4">
                <div>
                  <Label>Forecast Period (months)</Label>
                  <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line data={optimisticData} dataKey="revenue" stroke="#10B981" name="Optimistic" />
                  <Line data={realisticData} dataKey="revenue" stroke="#3B82F6" name="Realistic" />
                  <Line data={pessimisticData} dataKey="revenue" stroke="#EF4444" name="Pessimistic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sensitivity Analysis</CardTitle>
              <div className="flex gap-4">
                <div>
                  <Label>Metric to Analyze</Label>
                  <Select value={sensitivityMetric} onValueChange={setSensitivityMetric}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cac">Customer Acquisition Cost</SelectItem>
                      <SelectItem value="arpu">Average Revenue Per User</SelectItem>
                      <SelectItem value="retentionRate">Retention Rate</SelectItem>
                      <SelectItem value="grossMargin">Gross Margin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="change" label={{ value: '% Change', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Impact on LTV', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Impact']} />
                  <Line dataKey="impact" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialScenarios;