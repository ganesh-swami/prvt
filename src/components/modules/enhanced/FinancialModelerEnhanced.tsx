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
import { BarChart3, Calculator, DollarSign, HelpCircle, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
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
  const [isExporting, setIsExporting] = useState(false);

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

  // PDF Export Function
  const exportToPDF = async () => {
    if (!results.totalRevenue || results.totalRevenue === 0) {
      toast.error("Please calculate the financial model before exporting!");
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
      doc.text("Financial Model Analysis", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Financial Performance Report \u2022 ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Helper function for health status
      const getHealthStatus = (value: number, thresholds: { good: number; excellent: number }) => {
        if (value >= thresholds.excellent) return { status: 'Excellent', color: [34, 197, 94] };
        if (value >= thresholds.good) return { status: 'Good', color: [59, 130, 246] };
        return { status: 'Needs Improvement', color: [239, 68, 68] };
      };

      const cashFlowPct = results.totalRevenue > 0 ? (results.operatingCashFlow / results.totalRevenue) * 100 : 0;
      const grossMarginHealth = getHealthStatus(results.grossMargin, { good: 40, excellent: 60 });
      const netMarginHealth = getHealthStatus(results.netMargin, { good: 10, excellent: 20 });
      const cashFlowHealth = getHealthStatus(cashFlowPct, { good: 15, excellent: 25 });

      // Three Health Metrics in one row
      const metricWidth = (contentWidth - 8) / 3;
      const metricHeight = 35;

      const healthMetrics = [
        {
          title: "Gross Margin Health",
          value: `${results.grossMargin.toFixed(1)}%`,
          status: grossMarginHealth.status,
          color: grossMarginHealth.color,
        },
        {
          title: "Net Margin Health",
          value: `${results.netMargin.toFixed(1)}%`,
          status: netMarginHealth.status,
          color: netMarginHealth.color,
        },
        {
          title: "Cash Flow Health",
          value: `${cashFlowPct.toFixed(1)}%`,
          status: cashFlowHealth.status,
          color: cashFlowHealth.color,
        },
      ];

      healthMetrics.forEach((metric, index) => {
        const xPos = margin + (metricWidth + 4) * index;

        // Card background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
        doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

        // Title
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(metric.title, xPos + metricWidth / 2, yPos + 7, { align: "center" });

        // Status badge
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        const badgeWidth = 25;
        doc.roundedRect(xPos + (metricWidth - badgeWidth) / 2, yPos + 11, badgeWidth, 5, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text(metric.status, xPos + metricWidth / 2, yPos + 14.5, { align: "center" });

        // Value
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(metric.value, xPos + metricWidth / 2, yPos + 26, { align: "center" });
      });

      yPos += metricHeight + 10;

      // Profitability Analysis Section
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth / 2 - 2, 45, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth / 2 - 2, 45, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Profitability Analysis", margin + 3, yPos + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);

      const profitMetrics = [
        ["Gross Profit:", `$${results.grossProfit.toLocaleString()}`],
        ["EBITDA:", `$${results.ebitda.toLocaleString()}`],
        ["Net Profit:", `$${results.netProfit.toLocaleString()}`],
        ["Profitability Ratio:", `${results.profitabilityRatio.toFixed(2)}x`],
      ];

      profitMetrics.forEach(([label, value], index) => {
        const yOffset = yPos + 15 + (index * 7);
        doc.setTextColor(75, 85, 99);
        doc.text(label, margin + 3, yOffset);
        doc.setTextColor(34, 197, 94);
        doc.setFont("helvetica", "bold");
        doc.text(value, margin + contentWidth / 2 - 5, yOffset, { align: "right" });
        doc.setFont("helvetica", "normal");
      });

      // Cash Flow Analysis Section
      const cashFlowX = margin + contentWidth / 2 + 2;
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(cashFlowX, yPos, contentWidth / 2 - 2, 45, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(cashFlowX, yPos, contentWidth / 2 - 2, 45, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Cash Flow Analysis", cashFlowX + 3, yPos + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      const cashFlowMetrics = [
        ["Operating Cash Flow:", `$${results.operatingCashFlow.toLocaleString()}`],
        ["Free Cash Flow:", `$${results.freeCashFlow.toLocaleString()}`],
        ["Break-Even Month:", results.breakEvenMonth > 0 ? `Month ${results.breakEvenMonth}` : "Not reached"],
        ["Revenue Growth:", `${results.revenueGrowthRate.toFixed(1)}%`],
      ];

      cashFlowMetrics.forEach(([label, value], index) => {
        const yOffset = yPos + 15 + (index * 7);
        doc.setTextColor(75, 85, 99);
        doc.text(label, cashFlowX + 3, yOffset);
        doc.setTextColor(34, 197, 94);
        doc.setFont("helvetica", "bold");
        doc.text(value, pageWidth - margin - 3, yOffset, { align: "right" });
        doc.setFont("helvetica", "normal");
      });

      yPos += 50;

      // Financial Visualizations - New Page
      doc.addPage();
      yPos = 20;

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Visualizations", margin, yPos);

      yPos += 10;

      // Revenue vs Profit Trend Line Chart
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Revenue vs Profit Trend", margin, yPos);

      yPos += 8;

      const chartHeight = 60;
      const chartWidth = contentWidth - 10;
      const chartX = margin + 5;
      const chartY = yPos;

      // Draw axes
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X-axis
      doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y-axis

      // Get data for chart (max 12 months for visibility)
      const chartData = results.monthlyProjections.slice(0, 12);
      const maxValue = Math.max(...chartData.map(m => Math.max(m.revenue, m.grossProfit, m.netProfit)));

      if (chartData.length > 0 && maxValue > 0) {
        const stepX = chartWidth / (chartData.length - 1 || 1);

        // Draw lines
        const drawLine = (dataKey: 'revenue' | 'grossProfit' | 'netProfit', color: number[]) => {
          doc.setDrawColor(color[0], color[1], color[2]);
          doc.setLineWidth(1);
          for (let i = 0; i < chartData.length - 1; i++) {
            const x1 = chartX + (i * stepX);
            const y1 = chartY + chartHeight - (chartData[i][dataKey] / maxValue * chartHeight);
            const x2 = chartX + ((i + 1) * stepX);
            const y2 = chartY + chartHeight - (chartData[i + 1][dataKey] / maxValue * chartHeight);
            doc.line(x1, y1, x2, y2);
          }
        };

        drawLine('revenue', [59, 130, 246]); // Blue
        drawLine('grossProfit', [16, 185, 129]); // Green
        drawLine('netProfit', [139, 92, 246]); // Purple

        // Legend
        yPos += chartHeight + 5;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.line(chartX, yPos, chartX + 5, yPos);
        doc.setTextColor(59, 130, 246);
        doc.text("Revenue", chartX + 7, yPos + 1);

        doc.setDrawColor(16, 185, 129);
        doc.line(chartX + 25, yPos, chartX + 30, yPos);
        doc.setTextColor(16, 185, 129);
        doc.text("Gross Profit", chartX + 32, yPos + 1);

        doc.setDrawColor(139, 92, 246);
        doc.line(chartX + 55, yPos, chartX + 60, yPos);
        doc.setTextColor(139, 92, 246);
        doc.text("Net Profit", chartX + 62, yPos + 1);

        yPos += 10;
      }

      // Revenue Breakdown Pie Chart
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Revenue Breakdown", margin, yPos);

      yPos += 8;

      const pieX = margin + contentWidth / 2;
      const pieY = yPos + 30;
      const pieRadius = 25;

      const cogs = results.totalCogs;
      const opex = results.totalOperatingExpenses;
      const profit = results.netProfit;
      const total = cogs + opex + profit;

      if (total > 0) {
        const cogsAngle = (cogs / total) * 360;
        const opexAngle = (opex / total) * 360;
        const profitAngle = (profit / total) * 360;

        // Draw COGS slice (red)
        doc.setFillColor(239, 68, 68);
        let currentAngle = 0;
        const drawPieSlice = (angle: number) => {
          const steps = 50;
          const angleStep = angle / steps;
          for (let i = 0; i < steps; i++) {
            const angle1 = (currentAngle + i * angleStep - 90) * Math.PI / 180;
            const angle2 = (currentAngle + (i + 1) * angleStep - 90) * Math.PI / 180;
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
          currentAngle += angle;
        };

        drawPieSlice(cogsAngle);

        // Draw OpEx slice (orange)
        doc.setFillColor(251, 146, 60);
        drawPieSlice(opexAngle);

        // Draw Profit slice (green)
        doc.setFillColor(16, 185, 129);
        drawPieSlice(profitAngle);

        // Legend
        yPos += 65;

        doc.setFillColor(239, 68, 68);
        doc.rect(margin + 10, yPos, 5, 5, "F");
        doc.setFontSize(8);
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`COGS: ${((cogs / total) * 100).toFixed(0)}%`, margin + 18, yPos + 4);

        yPos += 8;

        doc.setFillColor(251, 146, 60);
        doc.rect(margin + 10, yPos, 5, 5, "F");
        doc.text(`Operating Expenses: ${((opex / total) * 100).toFixed(0)}%`, margin + 18, yPos + 4);

        yPos += 8;

        doc.setFillColor(16, 185, 129);
        doc.rect(margin + 10, yPos, 5, 5, "F");
        doc.text(`Net Profit: ${((profit / total) * 100).toFixed(0)}%`, margin + 18, yPos + 4);

        yPos += 12;
      }

      // Monthly Projections Table (first 12 months)
      if (yPos > pageHeight - 60 || results.monthlyProjections.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setTextColor(31, 41, 55);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Monthly Financial Projections", margin, yPos);

        yPos += 10;

        // Table header
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPos, contentWidth, 8, "F");
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.rect(margin, yPos, contentWidth, 8, "S");

        doc.setTextColor(75, 85, 99);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        
        const colWidth = contentWidth / 6;
        doc.text("Month", margin + 2, yPos + 5);
        doc.text("Revenue", margin + colWidth + 2, yPos + 5);
        doc.text("Gross Profit", margin + colWidth * 2 + 2, yPos + 5);
        doc.text("OpEx", margin + colWidth * 3 + 2, yPos + 5);
        doc.text("Net Profit", margin + colWidth * 4 + 2, yPos + 5);
        doc.text("Cumulative", margin + colWidth * 5 + 2, yPos + 5);

        yPos += 8;

        // Table rows (max 12 months)
        const tableData = results.monthlyProjections.slice(0, 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        tableData.forEach((row, index) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }

          const rowColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
          doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
          doc.rect(margin, yPos, contentWidth, 6, "F");

          doc.setTextColor(31, 41, 55);
          doc.text(`M${row.month}`, margin + 2, yPos + 4);
          doc.text(`$${(row.revenue / 1000).toFixed(0)}K`, margin + colWidth + 2, yPos + 4);
          doc.text(`$${(row.grossProfit / 1000).toFixed(0)}K`, margin + colWidth * 2 + 2, yPos + 4);
          doc.text(`$${(row.operatingExpenses / 1000).toFixed(0)}K`, margin + colWidth * 3 + 2, yPos + 4);
          doc.text(`$${(row.netProfit / 1000).toFixed(0)}K`, margin + colWidth * 4 + 2, yPos + 4);
          doc.text(`$${(row.cumulativeProfit / 1000).toFixed(0)}K`, margin + colWidth * 5 + 2, yPos + 4);

          yPos += 6;
        });
      }

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
      doc.save(`financial-model-analysis-${timestamp}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </div>
          )}
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
