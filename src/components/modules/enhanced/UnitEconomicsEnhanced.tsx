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
import jsPDF from "jspdf";

interface UnitEconomicsEnhancedProps {
  projectId: string;
}

const UnitEconomicsEnhanced: React.FC<UnitEconomicsEnhancedProps> = ({ projectId }) => {
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

      dispatch(setResults({
        ltv,
        ltvCacRatio,
        paybackPeriod,
        arr,
        grossProfit: totalRevenue * (margin / 100),
        totalRevenue,
        retentionRate: retention,
        grossMarginPerLifespan,
        unitProfitability,
      }));
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

    dispatch(setResults({
      ltv,
      ltvCacRatio,
      paybackPeriod,
      arr,
      grossProfit: totalRevenue * (margin / 100),
      totalRevenue,
      retentionRate: retention,
      grossMarginPerLifespan,
      unitProfitability,
    }));
    
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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Title Page
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 70, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Unit Economics Analysis", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Financial Performance Analysis • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Helper functions for health indicators
      const getLTVCACHealth = () => {
        const ratio = results.ltvCacRatio;
        if (ratio >= 3) return { level: "Excellent", color: [34, 197, 94] };
        if (ratio >= 1) return { level: "Good", color: [234, 179, 8] };
        return { level: "Poor", color: [239, 68, 68] };
      };

      const getRetentionScore = () => {
        const retention = results.retentionRate;
        if (retention >= 80) return { level: "Excellent", color: [34, 197, 94] };
        if (retention >= 60) return { level: "Good", color: [234, 179, 8] };
        return { level: "Needs Improvement", color: [239, 68, 68] };
      };

      const getPaybackEfficiency = () => {
        const payback = results.paybackPeriod;
        if (payback <= 12) return { level: "Excellent", color: [34, 197, 94] };
        if (payback <= 24) return { level: "Good", color: [234, 179, 8] };
        return { level: "High", color: [239, 68, 68] };
      };

      // Three key metrics in one row
      const metricWidth = (contentWidth - 8) / 3;
      const metricHeight = 35;

      const health = getLTVCACHealth();
      const retention = getRetentionScore();
      const payback = getPaybackEfficiency();

      const keyMetrics = [
        {
          icon: "✓",
          label: "LTV:CAC Health",
          value: `${results.ltvCacRatio.toFixed(1)}:1`,
          status: health.level,
          color: health.color,
          bgColor: [240, 253, 244]
        },
        {
          icon: "↻",
          label: "Retention Score",
          value: `${results.retentionRate.toFixed(1)}%`,
          status: retention.level,
          color: retention.color,
          bgColor: [255, 247, 237]
        },
        {
          icon: "⏱",
          label: "Payback Efficiency",
          value: `${results.paybackPeriod.toFixed(1)}m`,
          status: payback.level,
          color: payback.color,
          bgColor: [239, 246, 255]
        }
      ];

      keyMetrics.forEach((metric, index) => {
        const xPos = margin + (metricWidth + 4) * index;

        // Card background
        doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
        doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
        doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

        // Icon
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.circle(xPos + metricWidth / 2, yPos + 7, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(metric.icon, xPos + metricWidth / 2, yPos + 9, { align: "center" });

        // Label
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(metric.label, xPos + metricWidth / 2, yPos + 16, { align: "center" });

        // Value
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(metric.value, xPos + metricWidth / 2, yPos + 24, { align: "center" });

        // Status
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.text(metric.status, xPos + metricWidth / 2, yPos + 30, { align: "center" });
      });

      yPos += metricHeight + 10;

      // Revenue Metrics Section
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Revenue Metrics", margin + 3, yPos + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);

      const revenueMetrics = [
        ["Annual Recurring Revenue", `$${results.arr.toLocaleString()}`],
        ["Total Revenue", `$${results.totalRevenue.toLocaleString()}`],
        ["Gross Profit", `$${results.grossProfit.toLocaleString()}`]
      ];

      revenueMetrics.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xOffset = col * (contentWidth / 2);
        const yOffset = row * 10;

        doc.setTextColor(75, 85, 99);
        doc.text(label, margin + 3 + xOffset, yPos + 16 + yOffset);
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "bold");
        doc.text(value, margin + contentWidth / 2 - 3 + xOffset, yPos + 16 + yOffset, { align: "right" });
        doc.setFont("helvetica", "normal");
      });

      yPos += 40;

      // Profitability Analysis Section
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Profitability Analysis", margin + 3, yPos + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      const profitMetrics = [
        ["Unit Profitability", `$${results.unitProfitability.toFixed(2)}`],
        ["Gross Margin per Lifespan", `$${results.grossMarginPerLifespan.toFixed(2)}`],
        ["Customer LTV", `$${results.ltv.toFixed(2)}`]
      ];

      profitMetrics.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xOffset = col * (contentWidth / 2);
        const yOffset = row * 10;

        doc.setTextColor(75, 85, 99);
        doc.text(label, margin + 3 + xOffset, yPos + 16 + yOffset);
        doc.setTextColor(34, 197, 94);
        doc.setFont("helvetica", "bold");
        doc.text(value, margin + contentWidth / 2 - 3 + xOffset, yPos + 16 + yOffset, { align: "right" });
        doc.setFont("helvetica", "normal");
      });

      yPos += 40;

      // Financial Visualizations - New Page
      doc.addPage();
      yPos = 20;

      doc.setTextColor(22, 163, 74);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Visualizations Summary", margin + 3, yPos + 7);

      yPos += 10;

      // Revenue Breakdown Bar Chart
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Revenue Breakdown", margin, yPos);
      
      yPos += 8;

      const revenueChartData = [
        { label: "Total Revenue", value: results.totalRevenue, color: [59, 130, 246] },
        { label: "Gross Profit", value: results.grossProfit, color: [139, 92, 246] },
        { label: "ARR", value: results.arr, color: [34, 197, 94] },
        { label: "LTV", value: results.ltv, color: [251, 146, 60] }
      ];

      const chartWidth = contentWidth - 20;
      const chartHeight = 60;
      const chartX = margin + 10;
      const chartY = yPos;
      const barWidth = 30;
      const barSpacing = (chartWidth - (barWidth * 4)) / 3;

      // Find max value for scaling
      const maxValue = Math.max(...revenueChartData.map(d => d.value));

      // Draw bars
      revenueChartData.forEach((item, index) => {
        const xPos = chartX + (index * (barWidth + barSpacing));
        const barHeight = (item.value / maxValue) * chartHeight;
        const yStart = chartY + chartHeight - barHeight;

        // Bar
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(xPos, yStart, barWidth, barHeight, "F");

        // Value on top
        doc.setFontSize(7);
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "bold");
        const formattedValue = item.value > 1000 ? `$${(item.value / 1000).toFixed(0)}K` : `$${item.value.toFixed(0)}`;
        doc.text(formattedValue, xPos + barWidth / 2, yStart - 2, { align: "center" });

        // Label below
        doc.setFontSize(7);
        doc.setTextColor(75, 85, 99);
        doc.setFont("helvetica", "normal");
        const words = item.label.split(" ");
        words.forEach((word, wIndex) => {
          doc.text(word, xPos + barWidth / 2, chartY + chartHeight + 5 + (wIndex * 3), { align: "center" });
        });
      });

      yPos += chartHeight + 20;

      // Revenue vs Costs Pie Chart
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Revenue vs Costs", margin, yPos);

      yPos += 8;

      const costs = results.totalRevenue - results.grossProfit;
      const totalAmount = results.totalRevenue + costs;
      const revenuePercentage = (results.totalRevenue / totalAmount) * 100;
      const costsPercentage = (costs / totalAmount) * 100;

      // Pie chart center and radius
      const pieX = margin + contentWidth / 2;
      const pieY = yPos + 30;
      const pieRadius = 25;

      // Draw revenue slice (green)
      const revenueAngle = (revenuePercentage / 100) * 360;
      doc.setFillColor(16, 185, 129);
      doc.circle(pieX, pieY, pieRadius, "F");

      // Draw costs slice (red) - approximation using a wedge
      doc.setFillColor(239, 68, 68);
      const startAngle = 0;
      const endAngle = (costsPercentage / 100) * 360;
      
      // Create wedge for costs
      doc.setDrawColor(239, 68, 68);
      doc.setFillColor(239, 68, 68);
      
      // Draw sector for costs
      const steps = 50;
      const angleStep = (endAngle - startAngle) / steps;
      for (let i = 0; i < steps; i++) {
        const angle1 = (startAngle + i * angleStep) * Math.PI / 180;
        const angle2 = (startAngle + (i + 1) * angleStep) * Math.PI / 180;
        
        doc.triangle(
          pieX,
          pieY,
          pieX + pieRadius * Math.cos(angle1),
          pieY + pieRadius * Math.sin(angle1),
          pieX + pieRadius * Math.cos(angle2),
          pieY + pieRadius * Math.sin(angle2),
          "F"
        );
      }

      // Legend
      yPos += 65;

      // Revenue legend
      doc.setFillColor(16, 185, 129);
      doc.rect(margin + 10, yPos, 5, 5, "F");
      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`Revenue: $${results.totalRevenue.toLocaleString()} (${revenuePercentage.toFixed(1)}%)`, margin + 18, yPos + 4);

      yPos += 8;

      // Costs legend
      doc.setFillColor(239, 68, 68);
      doc.rect(margin + 10, yPos, 5, 5, "F");
      doc.text(`Costs: $${costs.toLocaleString()} (${costsPercentage.toFixed(1)}%)`, margin + 18, yPos + 4);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("Strategize+", pageWidth / 2, pageHeight - 8, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(
          new Date().toLocaleDateString(),
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`unit-economics-analysis-${timestamp}.pdf`);
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
                      dispatch(setMetrics({ averageOrderValue: e.target.value }))
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
                      dispatch(setMetrics({ numberOfCustomers: e.target.value }))
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
                      dispatch(setMetrics({ operatingExpenses: e.target.value }))
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

              {showAnalysis && (results.ltv > 0 || results.ltvCacRatio > 0) && <UnitEconomicsAnalysis results={results} />}
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
