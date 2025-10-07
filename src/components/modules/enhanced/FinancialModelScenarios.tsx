import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FinancialModelScenariosProps {
  baseProjections: any;
  onScenarioCalculate: (scenario: any) => void;
}

const FinancialModelScenarios: React.FC<FinancialModelScenariosProps> = ({ 
  baseProjections, 
  onScenarioCalculate 
}) => {
  const [selectedScenario, setSelectedScenario] = useState('optimistic');
  const [customScenario, setCustomScenario] = useState({
    revenueMultiplier: '1.0',
    cogsMultiplier: '1.0',
    expenseMultiplier: '1.0',
    growthAdjustment: '0'
  });

  const [scenarioResults, setScenarioResults] = useState<any[]>([]);

  const predefinedScenarios = {
    optimistic: {
      name: 'Optimistic',
      revenueMultiplier: 1.3,
      cogsMultiplier: 0.9,
      expenseMultiplier: 0.95,
      growthAdjustment: 5,
      description: '30% higher revenue, 10% lower COGS, 5% lower expenses'
    },
    realistic: {
      name: 'Realistic',
      revenueMultiplier: 1.0,
      cogsMultiplier: 1.0,
      expenseMultiplier: 1.0,
      growthAdjustment: 0,
      description: 'Base case scenario'
    },
    pessimistic: {
      name: 'Pessimistic',
      revenueMultiplier: 0.7,
      cogsMultiplier: 1.1,
      expenseMultiplier: 1.15,
      growthAdjustment: -3,
      description: '30% lower revenue, 10% higher COGS, 15% higher expenses'
    }
  };

  const calculateScenario = (scenarioParams: any) => {
    const scenario = predefinedScenarios[selectedScenario as keyof typeof predefinedScenarios] || {
      name: 'Custom',
      revenueMultiplier: parseFloat(customScenario.revenueMultiplier),
      cogsMultiplier: parseFloat(customScenario.cogsMultiplier),
      expenseMultiplier: parseFloat(customScenario.expenseMultiplier),
      growthAdjustment: parseFloat(customScenario.growthAdjustment),
      description: 'Custom scenario parameters'
    };

    const adjustedProjections = {
      ...baseProjections,
      initialRevenue: (parseFloat(baseProjections.initialRevenue) || 0) * scenario.revenueMultiplier,
      cogs: (parseFloat(baseProjections.cogs) || 0) * scenario.cogsMultiplier,
      staffCosts: (parseFloat(baseProjections.staffCosts) || 0) * scenario.expenseMultiplier,
      marketingCosts: (parseFloat(baseProjections.marketingCosts) || 0) * scenario.expenseMultiplier,
      adminCosts: (parseFloat(baseProjections.adminCosts) || 0) * scenario.expenseMultiplier,
      growthRate: (parseFloat(baseProjections.growthRate) || 0) + scenario.growthAdjustment
    };

    onScenarioCalculate(adjustedProjections);
    
    // Store scenario result for comparison
    const newResult = {
      ...scenario,
      projections: adjustedProjections,
      timestamp: new Date().toISOString()
    };
    
    setScenarioResults(prev => [...prev.slice(-2), newResult]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Scenario Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scenario">Select Scenario</Label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => calculateScenario(null)} className="w-full">
                Calculate Scenario
              </Button>
            </div>
          </div>

          {selectedScenario === 'custom' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="revenueMultiplier">Revenue Multiplier</Label>
                <Input
                  id="revenueMultiplier"
                  type="number"
                  step="0.1"
                  value={customScenario.revenueMultiplier}
                  onChange={(e) => setCustomScenario({...customScenario, revenueMultiplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cogsMultiplier">COGS Multiplier</Label>
                <Input
                  id="cogsMultiplier"
                  type="number"
                  step="0.1"
                  value={customScenario.cogsMultiplier}
                  onChange={(e) => setCustomScenario({...customScenario, cogsMultiplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expenseMultiplier">Expense Multiplier</Label>
                <Input
                  id="expenseMultiplier"
                  type="number"
                  step="0.1"
                  value={customScenario.expenseMultiplier}
                  onChange={(e) => setCustomScenario({...customScenario, expenseMultiplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="growthAdjustment">Growth Adjustment (%)</Label>
                <Input
                  id="growthAdjustment"
                  type="number"
                  value={customScenario.growthAdjustment}
                  onChange={(e) => setCustomScenario({...customScenario, growthAdjustment: e.target.value})}
                />
              </div>
            </div>
          )}

          {selectedScenario !== 'custom' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                {predefinedScenarios[selectedScenario as keyof typeof predefinedScenarios]?.name} Scenario
              </h4>
              <p className="text-sm text-blue-700">
                {predefinedScenarios[selectedScenario as keyof typeof predefinedScenarios]?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {scenarioResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarioResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={result.name === 'Optimistic' ? 'default' : result.name === 'Pessimistic' ? 'destructive' : 'secondary'}>
                      {result.name}
                    </Badge>
                    <span className="text-sm text-gray-600">{result.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.name === 'Optimistic' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : result.name === 'Pessimistic' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialModelScenarios;