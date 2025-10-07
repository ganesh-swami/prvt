import React, { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";
import { AnalystProjections } from "./types";
import { useAnalystModel } from "./useAnalystModel";

// Lazy load views
const ResultsPanel = lazy(() => import("./views/ResultsPanel"));
const MetricsPanel = lazy(() => import("./views/MetricsPanel"));
const ValuationPanel = lazy(() => import("./views/ValuationPanel"));
const WorkingCapitalPanel = lazy(() => import("./views/WorkingCapitalPanel"));
const RiskPanel = lazy(() => import("./views/RiskPanel"));
const ProjectionsTable = lazy(() => import("./views/ProjectionsTable"));
const MethodsPanel = lazy(() => import("./views/MethodsPanel"));

const AnalystModeler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("inputs");
  
  const [projections, setProjections] = useState<AnalystProjections>({
    initialRevenue: 50000,
    growthRateMonthlyPct: 5,
    cogsPct: 35,
    staffCosts: 25000,
    marketingCosts: 8000,
    adminCosts: 5000,
    investments: 200000,
    taxRatePct: 25,
    months: 24,
    discountRateAnnualPct: 12,
    assetLifeYears: 5,
    depreciationMethod: "straight-line",
    dso: 30,
    dio: 45,
    dpo: 30,
    openingCash: 100000,
    debtPrincipal: 150000,
    debtRateAnnualPct: 8,
    debtTermMonths: 60,
    interestOnly: false,
    unitPrice: 100,
    unitVarCost: 35,
    cac: 50,
    arpuMonthly: 85,
    churnMonthlyPct: 2
  });

  const results = useAnalystModel(projections);

  const updateProjection = (key: keyof AnalystProjections, value: any) => {
    setProjections(prev => ({ ...prev, [key]: value }));
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analyst Financial Model (Beta)
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 text-xs">
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Business */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Core Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Initial Revenue ($)</Label>
                  <Input
                    type="number"
                    value={projections.initialRevenue}
                    onChange={(e) => updateProjection("initialRevenue", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Growth Rate (% monthly)</Label>
                  <Input
                    type="number"
                    value={projections.growthRateMonthlyPct}
                    onChange={(e) => updateProjection("growthRateMonthlyPct", clamp(Number(e.target.value), -50, 100))}
                  />
                </div>
                <div>
                  <Label>COGS (%)</Label>
                  <Input
                    type="number"
                    value={projections.cogsPct}
                    onChange={(e) => updateProjection("cogsPct", clamp(Number(e.target.value), 0, 100))}
                  />
                </div>
                <div>
                  <Label>Projection Months</Label>
                  <Input
                    type="number"
                    value={projections.months}
                    onChange={(e) => updateProjection("months", Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operating Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Operating Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Staff Costs ($/month)</Label>
                  <Input
                    type="number"
                    value={projections.staffCosts}
                    onChange={(e) => updateProjection("staffCosts", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Marketing ($/month)</Label>
                  <Input
                    type="number"
                    value={projections.marketingCosts}
                    onChange={(e) => updateProjection("marketingCosts", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Admin ($/month)</Label>
                  <Input
                    type="number"
                    value={projections.adminCosts}
                    onChange={(e) => updateProjection("adminCosts", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={projections.taxRatePct}
                    onChange={(e) => updateProjection("taxRatePct", clamp(Number(e.target.value), 0, 50))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assets & Financing */}
            <Card>
              <CardHeader>
                <CardTitle>Assets & Financing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Initial Investment ($)</Label>
                  <Input
                    type="number"
                    value={projections.investments}
                    onChange={(e) => updateProjection("investments", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Asset Life (years)</Label>
                  <Input
                    type="number"
                    value={projections.assetLifeYears}
                    onChange={(e) => updateProjection("assetLifeYears", Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <Label>Discount Rate (% annual)</Label>
                  <Input
                    type="number"
                    value={projections.discountRateAnnualPct}
                    onChange={(e) => updateProjection("discountRateAnnualPct", clamp(Number(e.target.value), 1, 30))}
                  />
                </div>
                <div>
                  <Label>Opening Cash ($)</Label>
                  <Input
                    type="number"
                    value={projections.openingCash}
                    onChange={(e) => updateProjection("openingCash", Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Results */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(results.totalRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.avgEbitdaMargin.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">EBITDA Margin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Number.isFinite(results.npv) ? `$${(results.npv / 1000).toFixed(0)}K` : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">NPV</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Number.isFinite(results.irr) ? `${results.irr.toFixed(1)}%` : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">IRR</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {activeTab === "results" && (
            <Suspense fallback={<div className="p-8 text-center">Loading results...</div>}>
              <ResultsPanel results={results} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          {activeTab === "metrics" && (
            <Suspense fallback={<div className="p-8 text-center">Loading metrics...</div>}>
              <MetricsPanel results={results} projections={projections} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="valuation">
          {activeTab === "valuation" && (
            <Suspense fallback={<div className="p-8 text-center">Loading valuation...</div>}>
              <ValuationPanel results={results} projections={projections} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="working-capital">
          {activeTab === "working-capital" && (
            <Suspense fallback={<div className="p-8 text-center">Loading working capital...</div>}>
              <WorkingCapitalPanel results={results} projections={projections} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="risk">
          {activeTab === "risk" && (
            <Suspense fallback={<div className="p-8 text-center">Loading risk analysis...</div>}>
              <RiskPanel results={results} projections={projections} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="projections">
          {activeTab === "projections" && (
            <Suspense fallback={<div className="p-8 text-center">Loading projections...</div>}>
              <ProjectionsTable results={results} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="methods">
          {activeTab === "methods" && (
            <Suspense fallback={<div className="p-8 text-center">Loading methods...</div>}>
              <MethodsPanel />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalystModeler;