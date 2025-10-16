import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setProjectId,
  setModelName,
  setProjections,
  setResults,
  saveFinancialModel,
  loadLatestModel,
  selectProjectId,
  selectModelId,
  selectModelName,
  selectProjections,
  selectResults,
  selectSaving,
  selectError,
  selectLastSaved,
  selectLoading,
} from "@/store/slices/financialModelerSlice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, Calculator, DollarSign, HelpCircle } from "lucide-react";
// Vite-friendly lazy imports
const FinancialModelAnalysis = lazy(() => import("./FinancialModelAnalysis"));
const FinancialModelVisualizations = lazy(
  () => import("./FinancialModelVisualizations")
);
const FinancialModelScenarios = lazy(() => import("./FinancialModelScenarios"));
const FinancialMetrics = lazy(() => import("./FinancialMetrics"));
const CalculationMethods = lazy(() => import("./CalculationMethods"));
const AdvancedForecasting = lazy(() => import("./AdvancedForecasting"));

type Projections = {
  initialRevenue: string;
  growthRate: string; // monthly %
  cogs: string; // % of revenue
  staffCosts: string; // monthly fixed
  marketingCosts: string;
  adminCosts: string;
  investments: string; // one-off (used as asset base too)
  taxRate: string; // %
  timeHorizon: string; // months
};

type Results = {
  monthlyProjections: Array<{
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    taxes: number;
    netProfit: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    cumulativeProfit: number;
  }>;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalOperatingExpenses: number;
  ebitda: number;
  totalTaxes: number;
  netProfit: number;
  netMargin: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  breakEvenMonth: number;
  profitabilityRatio: number;
  revenueGrowthRate: number; // monthly %
};

const emptyResults: Results = {
  monthlyProjections: [],
  totalRevenue: 0,
  totalCogs: 0,
  grossProfit: 0,
  grossMargin: 0,
  totalOperatingExpenses: 0,
  ebitda: 0,
  totalTaxes: 0,
  netProfit: 0,
  netMargin: 0,
  operatingCashFlow: 0,
  freeCashFlow: 0,
  breakEvenMonth: 0,
  profitabilityRatio: 0,
  revenueGrowthRate: 0,
};

const tip = (title: string, body: string) => (
  <>
    <div className="font-medium">{title}</div>
    <div className="max-w-xs text-xs opacity-80">{body}</div>
  </>
);

interface FinancialModelerProps {
  projectId: string;
}

const FinancialModelerEnhanced: React.FC<FinancialModelerProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<
    "inputs" | "forecasting" | "results" | "metrics" | "methods" | "projections"
  >("inputs");

  // Redux state
  const storeProjectId = useAppSelector(selectProjectId);
  const modelId = useAppSelector(selectModelId);
  const modelName = useAppSelector(selectModelName);
  const projections = useAppSelector(selectProjections);
  const results = useAppSelector(selectResults);
  const saving = useAppSelector(selectSaving);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Set project ID and load latest model on mount
  useEffect(() => {
    if (projectId && projectId !== storeProjectId) {
      dispatch(setProjectId(projectId));
      // Load the latest saved model for this project
      dispatch(loadLatestModel(projectId));
    }
  }, [projectId, storeProjectId, dispatch]);

  const renderKey = useMemo(
    () => Object.values(projections).join("|"),
    [projections]
  );

  const calculateFinancialModel = (
    custom: Projections = projections
  ): Results => {
    const f = (v: string, fb = 0) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fb;
    };
    const i = (v: string, fb = 0) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : fb;
    };

    const initial = f(custom.initialRevenue, 0);
    const growthPct = f(custom.growthRate, 0); // monthly %
    const cogsPct = f(custom.cogs, 0) / 100; // fraction
    const staff = f(custom.staffCosts, 0);
    const marketing = f(custom.marketingCosts, 0);
    const admin = f(custom.adminCosts, 0);
    const investments = f(custom.investments, 0);
    const taxRate = f(custom.taxRate, 25) / 100;
    const months = Math.max(i(custom.timeHorizon, 12), 0);

    const monthlyData: Results["monthlyProjections"] = [];
    let totalRev = 0,
      totalCogsAmount = 0,
      totalOpEx = 0,
      totalTaxes = 0;
    let breakEven = 0,
      cumulativeProfit = 0;

    const capexPerMonth = months > 0 ? investments / months : 0;

    for (let m = 1; m <= months; m++) {
      const revenue = initial * Math.pow(1 + growthPct / 100, m - 1);
      const cogsAmount = revenue * cogsPct;
      const grossProfit = revenue - cogsAmount;
      const opEx = staff + marketing + admin;
      const ebitda = grossProfit - opEx;
      const taxes = ebitda > 0 ? ebitda * taxRate : 0;
      const netProfit = ebitda - taxes;
      const operatingCashFlow = netProfit;
      const freeCashFlow = operatingCashFlow - capexPerMonth;

      totalRev += revenue;
      totalCogsAmount += cogsAmount;
      totalOpEx += opEx;
      totalTaxes += taxes;

      if (netProfit > 0 && breakEven === 0) breakEven = m;

      cumulativeProfit += netProfit;

      monthlyData.push({
        month: m,
        revenue,
        cogs: cogsAmount,
        grossProfit,
        operatingExpenses: opEx,
        ebitda,
        taxes,
        netProfit,
        operatingCashFlow,
        freeCashFlow,
        cumulativeProfit,
      });
    }

    const totalGrossProfit = totalRev - totalCogsAmount;
    const totalEbitda = totalGrossProfit - totalOpEx;
    const totalNetProfit = totalEbitda - totalTaxes;

    return {
      monthlyProjections: monthlyData,
      totalRevenue: totalRev,
      totalCogs: totalCogsAmount,
      grossProfit: totalGrossProfit,
      grossMargin: totalRev > 0 ? (totalGrossProfit / totalRev) * 100 : 0,
      totalOperatingExpenses: totalOpEx,
      ebitda: totalEbitda,
      totalTaxes,
      netProfit: totalNetProfit,
      netMargin: totalRev > 0 ? (totalNetProfit / totalRev) * 100 : 0,
      operatingCashFlow: totalNetProfit,
      freeCashFlow: totalNetProfit - investments,
      breakEvenMonth: breakEven,
      profitabilityRatio: totalOpEx > 0 ? totalGrossProfit / totalOpEx : 0,
      revenueGrowthRate: f(custom.growthRate, 0),
    };
  };

  // Keep UI live while typing (but not while loading from database)
  useEffect(() => {
    if (!loading) {
      const calculatedResults = calculateFinancialModel(projections);
      dispatch(setResults(calculatedResults));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projections, dispatch, loading]);

  const handleCalculateClick = () => {
    const calculatedResults = calculateFinancialModel(projections);
    dispatch(setResults(calculatedResults));
  };
  const saveModel = async () => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    const fresh = calculateFinancialModel(projections);
    const name =
      modelName || `Financial Model ${new Date().toLocaleDateString()}`;

    try {
      await dispatch(
        saveFinancialModel({
          projectId,
          modelId,
          name,
          projections,
          results: fresh,
        })
      ).unwrap();

      toast.success(
        modelId ? "Model updated successfully!" : "Model saved successfully!"
      );
    } catch (err) {
      toast.error("Failed to save model");
      console.error("Error saving model:", err);
    }
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enhanced Financial Modeler
          </h1>
          {loading && (
            <div className="text-xs sm:text-sm text-muted-foreground animate-pulse">
              Loading...
            </div>
          )}
        </div>
        {lastSaved && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Last saved: {new Date(lastSaved).toLocaleString()}
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="space-y-6"
      >
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList className="inline-flex w-full min-w-max lg:grid lg:grid-cols-6 gap-1">
            <TabsTrigger
              value="inputs"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Model Inputs
            </TabsTrigger>
            <TabsTrigger
              value="forecasting"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Advanced Forecasting
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Results & Analysis
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Financial Metrics
            </TabsTrigger>
            <TabsTrigger
              value="methods"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Calculation Methods
            </TabsTrigger>
            <TabsTrigger
              value="projections"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Projections
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1) Model Inputs */}
        <TabsContent value="inputs">
          <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="initialRevenue">
                        Initial Monthly Revenue ($)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">Initial Revenue</div>
                            <div className="text-xs opacity-80">
                              Starting monthly revenue before growth
                            </div>
                            <div className="text-xs opacity-70">
                              Foundation for all revenue projections and growth
                              calculations
                            </div>
                            <div className="text-xs opacity-60">
                              Critical for accurate financial forecasting and
                              business planning
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="initialRevenue"
                      type="number"
                      value={projections.initialRevenue}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        dispatch(setProjections({ initialRevenue: newValue }));
                      }}
                      placeholder="e.g. 10000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="growthRate">
                        Monthly Growth Rate (%)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">Growth Rate</div>
                            <div className="text-xs opacity-80">
                              Compound monthly growth applied to revenue
                            </div>
                            <div className="text-xs opacity-70">
                              Determines revenue acceleration and scaling
                              trajectory
                            </div>
                            <div className="text-xs opacity-60">
                              Higher rates indicate faster growth but may
                              require validation
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="growthRate"
                      type="number"
                      value={projections.growthRate}
                      onChange={(e) =>
                        dispatch(setProjections({ growthRate: e.target.value }))
                      }
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="timeHorizon">
                        Projection Period (months)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          {tip(
                            "Time horizon",
                            "Number of months to project (e.g., 12, 24, 36)."
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="timeHorizon"
                      type="number"
                      value={projections.timeHorizon}
                      onChange={(e) =>
                        dispatch(
                          setProjections({ timeHorizon: e.target.value })
                        )
                      }
                      placeholder="e.g. 12"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Costs & Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="cogs">COGS (% of Revenue)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">
                              Cost of Goods Sold
                            </div>
                            <div className="text-xs opacity-80">
                              Variable costs directly tied to revenue production
                            </div>
                            <div className="text-xs opacity-70">
                              Includes materials, direct labor, and production
                              costs
                            </div>
                            <div className="text-xs opacity-60">
                              Lower COGS indicates better operational efficiency
                              and pricing power
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="cogs"
                      type="number"
                      value={projections.cogs}
                      onChange={(e) =>
                        dispatch(setProjections({ cogs: e.target.value }))
                      }
                      placeholder="e.g. 35"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="staffCosts">
                        Monthly Staff Costs ($)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">Staff Costs</div>
                            <div className="text-xs opacity-80">
                              Fixed monthly payroll and employee-related
                              expenses
                            </div>
                            <div className="text-xs opacity-70">
                              Includes salaries, benefits, taxes, and contractor
                              payments
                            </div>
                            <div className="text-xs opacity-60">
                              Major fixed cost that scales with team size and
                              compensation levels
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="staffCosts"
                      type="number"
                      value={projections.staffCosts}
                      onChange={(e) =>
                        dispatch(setProjections({ staffCosts: e.target.value }))
                      }
                      placeholder="e.g. 20000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="marketingCosts">
                        Monthly Marketing & Sales ($)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">
                              Marketing & Sales Costs
                            </div>
                            <div className="text-xs opacity-80">
                              Fixed monthly investment in customer acquisition
                              and sales
                            </div>
                            <div className="text-xs opacity-70">
                              Includes advertising, sales team, events, and
                              promotional activities
                            </div>
                            <div className="text-xs opacity-60">
                              Critical for growth but should be balanced with
                              customer acquisition cost efficiency
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="marketingCosts"
                      type="number"
                      value={projections.marketingCosts}
                      onChange={(e) =>
                        dispatch(
                          setProjections({ marketingCosts: e.target.value })
                        )
                      }
                      placeholder="e.g. 5000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="adminCosts">
                        Monthly General & Admin ($)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">
                              General & Administrative Costs
                            </div>
                            <div className="text-xs opacity-80">
                              Fixed monthly overhead expenses not directly tied
                              to production
                            </div>
                            <div className="text-xs opacity-70">
                              Includes rent, utilities, insurance, legal,
                              accounting, and office expenses
                            </div>
                            <div className="text-xs opacity-60">
                              Essential operational costs that should be
                              optimized for efficiency
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="adminCosts"
                      type="number"
                      value={projections.adminCosts}
                      onChange={(e) =>
                        dispatch(setProjections({ adminCosts: e.target.value }))
                      }
                      placeholder="e.g. 4000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="investments">Total Investments ($)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">Total Investments</div>
                            <div className="text-xs opacity-80">
                              One-time capital expenditure for business assets
                              and infrastructure
                            </div>
                            <div className="text-xs opacity-70">
                              Includes equipment, technology, facilities, and
                              initial setup costs
                            </div>
                            <div className="text-xs opacity-60">
                              Used as asset base for ROI calculations and
                              depreciated over time horizon
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="investments"
                      type="number"
                      value={projections.investments}
                      onChange={(e) =>
                        dispatch(
                          setProjections({ investments: e.target.value })
                        )
                      }
                      placeholder="e.g. 100000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="max-w-xs space-y-2">
                            <div className="font-medium">Tax Rate</div>
                            <div className="text-xs opacity-80">
                              Corporate tax rate applied to positive earnings
                            </div>
                            <div className="text-xs opacity-70">
                              Applied only to positive EBITDA in this simplified
                              model
                            </div>
                            <div className="text-xs opacity-60">
                              Varies by jurisdiction and business structure -
                              consult tax advisor
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="taxRate"
                      type="number"
                      value={projections.taxRate}
                      onChange={(e) =>
                        dispatch(setProjections({ taxRate: e.target.value }))
                      }
                      placeholder="e.g. 25"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TooltipProvider>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleCalculateClick} className="w-full sm:w-auto">
              Calculate Financial Model
            </Button>
            <Button
              onClick={saveModel}
              variant="outline"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving..." : modelId ? "Update Model" : "Save Model"}
            </Button>
          </div>

          {/* Immediate results below the button */}
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  Loading results…
                </div>
              }
            >
              <FinancialModelAnalysis
                key={`analysis-inline-${renderKey}`}
                results={results}
              />
            </Suspense>
          </div>
        </TabsContent>

        {/* 2) Advanced Forecasting */}
        <TabsContent value="forecasting">
          {activeTab === "forecasting" && (
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  Loading forecasting…
                </div>
              }
            >
              <AdvancedForecasting
                key={`forecasting-${renderKey}`}
                baseProjections={projections}
                // You can expose callbacks if the forecasting component outputs adjusted projections:
                onApplyForecast={(nextProj: Projections) =>
                  dispatch(setProjections(nextProj))
                }
              />
            </Suspense>
          )}
        </TabsContent>

        {/* 3) Results & Analysis */}
        <TabsContent value="results">
          {activeTab === "results" && (
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  Loading analysis…
                </div>
              }
            >
              <FinancialModelAnalysis
                key={`analysis-${renderKey}`}
                results={results}
              />
              <div className="mt-6">
                <FinancialModelVisualizations
                  key={`viz-${renderKey}`}
                  monthlyProjections={results.monthlyProjections}
                  summaryData={{
                    totalRevenue: results.totalRevenue,
                    totalCogs: results.totalCogs,
                    totalOperatingExpenses: results.totalOperatingExpenses,
                    netProfit: results.netProfit,
                  }}
                />
              </div>
            </Suspense>
          )}
        </TabsContent>

        {/* 4) Financial Metrics */}
        <TabsContent value="metrics">
          {activeTab === "metrics" && (
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  Loading metrics…
                </div>
              }
            >
              <FinancialMetrics
                key={`metrics-${renderKey}`}
                projections={projections}
                results={results}
              />
            </Suspense>
          )}
        </TabsContent>

        {/* 5) Calculation Methods */}
        <TabsContent value="methods">
          {activeTab === "methods" && (
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  Loading methods…
                </div>
              }
            >
              <CalculationMethods />
            </Suspense>
          )}
        </TabsContent>

        {/* 6) Projections table */}
        <TabsContent value="projections">
          {activeTab === "projections" && (
            <div className="overflow-auto rounded border">
              <table className="min-w-[800px] w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-right">Revenue</th>
                    <th className="p-2 text-right">COGS</th>
                    <th className="p-2 text-right">Gross Profit</th>
                    <th className="p-2 text-right">OpEx</th>
                    <th className="p-2 text-right">EBITDA</th>
                    <th className="p-2 text-right">Taxes</th>
                    <th className="p-2 text-right">Net Profit</th>
                    <th className="p-2 text-right">OCF</th>
                    <th className="p-2 text-right">FCF</th>
                    <th className="p-2 text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {results.monthlyProjections.map((m) => (
                    <tr key={m.month} className="border-t">
                      <td className="p-2">{m.month}</td>
                      <td className="p-2 text-right">
                        ${m.revenue.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.cogs.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.grossProfit.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.operatingExpenses.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.ebitda.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.taxes.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.netProfit.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.operatingCashFlow.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.freeCashFlow.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        ${m.cumulativeProfit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialModelerEnhanced;
