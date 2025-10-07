import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { DollarSign, TrendingUp, Calculator, Lock } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { GatedExportOptions } from '@/components/billing/GatedExportOptions';
import SaveButtons from '@/components/common/SaveButtons';
import { TaskKanban } from '@/components/collaboration/TaskKanban';
import { EnhancedCommentSystem } from '@/components/collaboration/EnhancedCommentSystem';
import { useProjectStore } from '@/stores/useProjectStore';
import { useGate } from '@/hooks/useGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
const FinancialModeler: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { canAccess: canUseScenarios } = useGate('models.scenarios');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [scenariosEnabled, setScenariosEnabled] = useState(false);
  const [financialData, setFinancialData] = useState({
    revenue: '',
    expenses: '',
    growth: '',
    margin: ''
  });

  const [projections, setProjections] = useState([
    { year: 2024, revenue: 0, expenses: 0, profit: 0 },
    { year: 2025, revenue: 0, expenses: 0, profit: 0 },
    { year: 2026, revenue: 0, expenses: 0, profit: 0 }
  ]);

  const calculateProjections = () => {
    const baseRevenue = parseFloat(financialData.revenue) || 0;
    const baseExpenses = parseFloat(financialData.expenses) || 0;
    const growthRate = parseFloat(financialData.growth) || 0;
    
    const newProjections = projections.map((proj, index) => {
      const revenue = baseRevenue * Math.pow(1 + growthRate / 100, index);
      const expenses = baseExpenses * Math.pow(1 + growthRate / 100 * 0.8, index);
      return {
        ...proj,
        revenue,
        expenses,
        profit: revenue - expenses
      };
    });
    
    setProjections(newProjections);
  };

  return (
    <Tabs defaultValue="model" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="model">Financial Model</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="model" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <div>
              <CustomTooltip content="Build comprehensive financial models with projections, scenarios, and key metrics for strategic planning and investor presentations">
                <h1 className="text-3xl font-bold">Financial Modeler</h1>
              </CustomTooltip>
              <p className="text-muted-foreground">Build financial projections and scenarios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SaveButtons 
              moduleKey="financial-model" 
              moduleData={{ financialData, projections }}
            />
            <GatedExportOptions 
              data={{ financialData, projections }}
              filename="financial-model"
              moduleName="Financial Model"
            />
          </div>
        </div>

        {/* Scenario Planning Section */}
        <Card className={!canUseScenarios ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Scenario Planning
                {!canUseScenarios && <Lock className="h-3 w-3 text-amber-500" />}
              </span>
              <Switch
                checked={scenariosEnabled && canUseScenarios}
                onCheckedChange={(checked) => {
                  if (!canUseScenarios) {
                    setShowUpgrade(true);
                    return;
                  }
                  setScenariosEnabled(checked);
                }}
                disabled={!canUseScenarios}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create multiple financial scenarios (optimistic, realistic, pessimistic) to better understand potential outcomes.
            </p>
            {!canUseScenarios && (
              <Button 
                variant="outline" 
                onClick={() => setShowUpgrade(true)}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Unlock Scenario Planning
              </Button>
            )}
          </CardContent>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Inputs
              <CustomTooltip content="Enter your base financial metrics to generate multi-year projections" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revenue">Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                value={financialData.revenue}
                onChange={(e) => setFinancialData({...financialData, revenue: e.target.value})}
                placeholder="Enter current annual revenue"
              />
            </div>
            <div>
              <Label htmlFor="expenses">Annual Expenses ($)</Label>
              <Input
                id="expenses"
                type="number"
                value={financialData.expenses}
                onChange={(e) => setFinancialData({...financialData, expenses: e.target.value})}
                placeholder="Enter current annual expenses"
              />
            </div>
            <div>
              <Label htmlFor="growth">Growth Rate (%)</Label>
              <Input
                id="growth"
                type="number"
                value={financialData.growth}
                onChange={(e) => setFinancialData({...financialData, growth: e.target.value})}
                placeholder="Expected annual growth rate"
              />
            </div>
            <Button onClick={calculateProjections} className="w-full">
              Generate Projections
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projections.map((proj) => (
                <div key={proj.year} className="p-4 border rounded-lg">
                  <div className="font-semibold mb-2">{proj.year}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Revenue: ${proj.revenue.toLocaleString()}</div>
                    <div>Expenses: ${proj.expenses.toLocaleString()}</div>
                    <div className={proj.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Profit: ${proj.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="tasks">
        {currentProject && (
          <TaskKanban projectId={currentProject.id} />
        )}
      </TabsContent>
      
      <TabsContent value="comments">
        {currentProject && (
          <EnhancedCommentSystem 
            projectId={currentProject.id}
            moduleId="financial-model"
          />
        )}
      </TabsContent>

      {showUpgrade && (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature="Advanced Financial Modeling"
          description="Unlock scenario planning and advanced financial modeling features"
          requiredPlan="pro"
        />
      )}
    </Tabs>
  );
};

export default FinancialModeler;
