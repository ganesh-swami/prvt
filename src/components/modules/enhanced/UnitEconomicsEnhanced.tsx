import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMetrics,
  setResults,
  setProjectId,
  saveUnitEconomics,
  loadLatestUnitEconomics,
  selectMetrics,
  selectResults,
  selectShowAnalysis,
  selectProjectId,
  selectEconomicsId,
  selectLoading,
  selectSaving,
  selectError,
  selectLastSaved,
} from "@/store/slices/unitEconomicsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, FileText, Loader2 } from "lucide-react";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import UnitEconomicsAnalysis from "./UnitEconomicsAnalysis";
import UnitEconomicsVisualizations from "./UnitEconomicsVisualizations";
import FinancialScenarios from "./FinancialScenarios";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import {
  createPDFInstance,
  addTitlePage,
  addFooterToAllPages,
  downloadPDF,
} from "@/utils/pdfUtils";
import { addUnitEconomicsContent } from "@/utils/modulePDFExports";

interface UnitEconomicsEnhancedProps {
  projectId: string;
}

const UnitEconomicsEnhanced: React.FC<UnitEconomicsEnhancedProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const { toast: toastHook } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const metrics = useAppSelector(selectMetrics);
  const results = useAppSelector(selectResults);
  const showAnalysis = useAppSelector(selectShowAnalysis);
  const storedProjectId = useAppSelector(selectProjectId);
  const economicsId = useAppSelector(selectEconomicsId);
  const loading = useAppSelector(selectLoading);
  const saving = useAppSelector(selectSaving);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Load data on mount
  useEffect(() => {
    if (projectId && projectId !== storedProjectId) {
      dispatch(setProjectId(projectId));
      dispatch(loadLatestUnitEconomics(projectId));
    }
  }, [projectId, storedProjectId, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toastHook({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toastHook]);

  // Auto-calculate when data is loaded
  useEffect(() => {
    const hasData =
      metrics.cac &&
      metrics.arpu &&
      metrics.averageOrderValue &&
      metrics.numberOfCustomers;

    // Only auto-calculate if we have data but no results yet
    if (hasData && (!results.ltv || results.ltv === 0)) {
      const cac = parseFloat(metrics.cac) || 0;
      const arpu = parseFloat(metrics.arpu) || 0;
      const aov = parseFloat(metrics.averageOrderValue) || 0;
      const customers = parseFloat(metrics.numberOfCustomers) || 0;
      const retention = parseFloat(metrics.retentionRate) || 0;
      const margin = parseFloat(metrics.grossMargin) || 0;
      const churn = parseFloat(metrics.churnRate) || 0;
      const discount = parseFloat(metrics.discountRate) || 0;
      const opex = parseFloat(metrics.operatingExpenses) || 0;

      const customerLifespan = churn > 0 ? 1 / (churn / 100) : 0;
      const grossProfit = arpu * (margin / 100);
      const ltv = grossProfit * customerLifespan;
      const ltvCacRatio = cac > 0 ? ltv / cac : 0;
      const paybackPeriod = grossProfit > 0 ? cac / grossProfit : 0;
      const arr = arpu * 12 * customers;
      const totalRevenue = customers * aov * (1 - discount / 100);
      const grossMarginPerLifespan = grossProfit * customerLifespan;
      const unitProfitability = ltv - cac - opex / customers;

      dispatch(
        setResults({
          ltv,
          cac,
          ltvCacRatio,
          paybackPeriod,
          arr,
          grossProfit: totalRevenue * (margin / 100),
          totalRevenue,
          retentionRate: retention,
          grossMarginPerLifespan,
          unitProfitability,
        })
      );
    }
  }, [metrics, results.ltv, dispatch]);

  // Auto-save function
  const handleSave = async () => {
    if (!projectId) return;

    try {
      await dispatch(
        saveUnitEconomics({
          projectId,
          economicsId,
          name: "Unit Economics Analysis",
          metrics,
          results,
        })
      ).unwrap();

      toastHook({
        title: "Saved",
        description: "Unit economics data saved successfully",
      });
    } catch (err) {
      // Error handled by Redux slice
    }
  };

  const calculateUnitEconomics = () => {
    const cac = parseFloat(metrics.cac) || 0;
    const arpu = parseFloat(metrics.arpu) || 0;
    const aov = parseFloat(metrics.averageOrderValue) || 0;
    const customers = parseFloat(metrics.numberOfCustomers) || 0;
    const retention = parseFloat(metrics.retentionRate) || 0;
    const transactionSize = parseFloat(metrics.transactionSize) || 0;
    const discount = parseFloat(metrics.discountRate) || 0;
    const margin = parseFloat(metrics.grossMargin) || 0;
    const churn = parseFloat(metrics.churnRate) || 0;
    const opex = parseFloat(metrics.operatingExpenses) || 0;

    // Calculations
    const customerLifespan = churn > 0 ? 1 / (churn / 100) : 0;
    const grossProfit = arpu * (margin / 100);
    const ltv = grossProfit * customerLifespan;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const paybackPeriod = grossProfit > 0 ? cac / grossProfit : 0;
    const arr = arpu * 12 * customers;
    const totalRevenue = customers * aov * (1 - discount / 100);
    const grossMarginPerLifespan = grossProfit * customerLifespan;
    const unitProfitability = ltv - cac - opex / customers;

    dispatch(
      setResults({
        ltv,
        cac,
        ltvCacRatio,
        paybackPeriod,
        arr,
        grossProfit: totalRevenue * (margin / 100),
        totalRevenue,
        retentionRate: retention,
        grossMarginPerLifespan,
        unitProfitability,
      })
    );

    // Auto-save after calculation
    setTimeout(() => handleSave(), 500);
  };

  const exportToPDF = async () => {
    // Check if results are calculated
    if (!results.ltv || results.ltv === 0) {
      toast.error("Please calculate unit economics before exporting!");
      return;
    }

    setIsExporting(true);
    try {
      // Create PDF using shared utilities
      let doc = createPDFInstance();
      doc = addTitlePage(
        doc,
        "Unit Economics Analysis",
        "Financial Performance Analysis",
        [59, 130, 246]
      );
      doc = addUnitEconomicsContent(doc, results, false);
      doc = addFooterToAllPages(doc, "Unit Economics Analysis");
      downloadPDF(doc, "unit-economics-analysis");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading unit economics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Advanced Unit Economics
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            size="sm"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics Input</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="scenarios">Financial Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Comprehensive Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="cac">Customer Acquisition Cost ($)</Label>
                    <CustomTooltip
                      title="CAC"
                      description="Cost to acquire one customer"
                      explanation="Total marketing and sales costs divided by new customers"
                      justification="Essential for calculating LTV:CAC ratio"
                    />
                  </div>
                  <Input
                    id="cac"
                    type="number"
                    value={metrics.cac}
                    onChange={(e) =>
                      dispatch(setMetrics({ cac: e.target.value }))
                    }
                    placeholder="150"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="arpu">
                      Average Revenue Per User ($/month)
                    </Label>
                    <CustomTooltip
                      title="ARPU"
                      description="Monthly revenue generated per customer"
                      explanation="Total monthly revenue divided by active customers"
                      justification="Key metric for subscription business models"
                    />
                  </div>
                  <Input
                    id="arpu"
                    type="number"
                    value={metrics.arpu}
                    onChange={(e) =>
                      dispatch(setMetrics({ arpu: e.target.value }))
                    }
                    placeholder="50"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="aov">Average Order Value ($)</Label>
                    <CustomTooltip
                      title="AOV"
                      description="Average amount spent per transaction"
                      explanation="Total revenue divided by number of orders"
                      justification="Indicates customer spending behavior and pricing effectiveness"
                    />
                  </div>
                  <Input
                    id="aov"
                    type="number"
                    value={metrics.averageOrderValue}
                    onChange={(e) =>
                      dispatch(
                        setMetrics({ averageOrderValue: e.target.value })
                      )
                    }
                    placeholder="75"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="customers">Number of Customers</Label>
                    <CustomTooltip
                      title="Customer Base"
                      description="Total active customer count"
                      explanation="Current number of paying customers"
                      justification="Foundation for revenue calculations and scaling projections"
                    />
                  </div>
                  <Input
                    id="customers"
                    type="number"
                    value={metrics.numberOfCustomers}
                    onChange={(e) =>
                      dispatch(
                        setMetrics({ numberOfCustomers: e.target.value })
                      )
                    }
                    placeholder="1000"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="retention">Retention Rate (%)</Label>
                    <CustomTooltip
                      title="Retention Rate"
                      description="Percentage of customers retained over time"
                      explanation="Customers remaining active after a specific period"
                      justification="Critical for LTV calculation and business sustainability"
                    />
                  </div>
                  <Input
                    id="retention"
                    type="number"
                    value={metrics.retentionRate}
                    onChange={(e) =>
                      dispatch(setMetrics({ retentionRate: e.target.value }))
                    }
                    placeholder="85"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="margin">Gross Margin (%)</Label>
                    <CustomTooltip
                      title="Gross Margin"
                      description="Profit margin after direct costs"
                      explanation="Revenue minus cost of goods sold, as percentage"
                      justification="Indicates pricing power and operational efficiency"
                    />
                  </div>
                  <Input
                    id="margin"
                    type="number"
                    value={metrics.grossMargin}
                    onChange={(e) =>
                      dispatch(setMetrics({ grossMargin: e.target.value }))
                    }
                    placeholder="70"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="churn">Annual Churn Rate (%)</Label>
                    <CustomTooltip
                      title="Churn Rate"
                      description="Percentage of customers lost annually"
                      explanation="Rate at which customers stop using the service"
                      justification="Inverse of retention, critical for LTV calculations"
                    />
                  </div>
                  <Input
                    id="churn"
                    type="number"
                    value={metrics.churnRate}
                    onChange={(e) =>
                      dispatch(setMetrics({ churnRate: e.target.value }))
                    }
                    placeholder="15"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="transactionSize">
                      Transaction Size ($)
                    </Label>
                    <CustomTooltip content="Average monetary value per customer transaction or purchase. Description: Measures the typical spending amount per transaction. Explanation: Higher transaction sizes increase revenue per customer interaction. Justification: Critical for revenue forecasting and pricing strategy optimization. Impact: Directly affects revenue calculations and customer lifetime value projections." />
                  </div>
                  <Input
                    id="transactionSize"
                    type="number"
                    value={metrics.transactionSize}
                    onChange={(e) =>
                      dispatch(setMetrics({ transactionSize: e.target.value }))
                    }
                    placeholder="120"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="discountRate">Discount Rate (%)</Label>
                    <CustomTooltip content="Rate used to discount future cash flows to present value for financial analysis. Description: Reflects the time value of money and investment risk. Explanation: Higher discount rates reduce present value of future cash flows. Justification: Essential for NPV calculations and investment decision-making. Impact: Affects valuation models and return on investment calculations." />
                  </div>
                  <Input
                    id="discountRate"
                    type="number"
                    value={metrics.discountRate}
                    onChange={(e) =>
                      dispatch(setMetrics({ discountRate: e.target.value }))
                    }
                    placeholder="10"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="opex">Operating Expenses ($)</Label>
                    <CustomTooltip
                      title="Operating Expenses"
                      description="Monthly operational costs"
                      explanation="Fixed and variable costs to run the business"
                      justification="Essential for calculating true unit profitability"
                    />
                  </div>
                  <Input
                    id="opex"
                    type="number"
                    value={metrics.operatingExpenses}
                    onChange={(e) =>
                      dispatch(
                        setMetrics({ operatingExpenses: e.target.value })
                      )
                    }
                    placeholder="5000"
                  />
                </div>
              </div>

              <Button
                onClick={calculateUnitEconomics}
                className="w-full mt-6 bg-gradient-to-br from-purple-500 to-pink-500"
              >
                Calculate Unit Economics
              </Button>

              {showAnalysis && (results.ltv > 0 || results.ltvCacRatio > 0) && (
                <UnitEconomicsAnalysis results={results} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">LTV:CAC Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {results.ltvCacRatio.toFixed(1)}:1
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Annual Recurring Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${results.arr.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${results.totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${results.grossProfit.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visualizations">
          {showAnalysis && (
            <UnitEconomicsVisualizations results={results} metrics={metrics} />
          )}
        </TabsContent>

        <TabsContent value="scenarios">
          {showAnalysis && (
            <FinancialScenarios
              baseMetrics={metrics}
              onScenarioChange={() => {}}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnitEconomicsEnhanced;
