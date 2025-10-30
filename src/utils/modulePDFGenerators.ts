/**
 * Shared PDF Generation Functions for All Modules
 * 
 * This file contains reusable PDF generation functions that are used by:
 * 1. Individual module PDF exports
 * 2. Comprehensive combined PDF export
 * 
 * CRITICAL: Never duplicate PDF generation code. All modules must use these functions.
 * If you change design here, it automatically updates everywhere.
 */

import jsPDF from "jspdf";
import { PlanSection } from "@/components/modules/enhanced/PlanBuilderSectionsComplete";
import type { MarketResults } from "@/store/slices/marketSizingSlice";
import type { PricingResults } from "@/store/slices/pricingLabSlice";
import type { UnitEconomicsResults } from "@/store/slices/unitEconomicsSlice";
import type { GTMPlannerState } from "@/store/slices/gtmPlannerSlice";

// Define types inline if not exported
interface FinancialResults {
  totalRevenue: number;
  operatingExpenses: number;
  grossProfit: number;
  grossMargin: number;
  ebitda: number;
  netProfit: number;
  netMargin: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  breakEvenMonth: number;
  revenueGrowthRate: number;
  profitabilityRatio: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Add a module title page with colored header
 */
export const addModuleTitlePage = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  color: [number, number, number]
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Title Page
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, pageWidth, 70, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(margin, 60, pageWidth - margin, 60);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${subtitle} • ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );
};

/**
 * Add footer to all pages in document
 */
export const addFooterToAllPages = (
  doc: jsPDF,
  footerText: string = "Business Report"
) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Page " + i + " of " + pageCount, margin, pageHeight - 8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 8, { align: "right" });
  }
};

// ============================================================================
// MODULE SPECIFIC PDF GENERATORS
// ============================================================================

/**
 * Generate Plan Builder PDF content
 * Used by: PlanBuilderPDFExport.tsx and comprehensiveModulePDFExport.ts
 */
export const generatePlanBuilderPDF = (
  doc: jsPDF,
  sections: PlanSection[],
  planData: Record<string, Record<string, string | boolean>>,
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  if (addTitlePage) {
    addModuleTitlePage(doc, "Business Plan", "Comprehensive Business Plan", [59, 130, 246]);
    doc.addPage();
    yPos = 20;
  }

  sections.forEach((section) => {
    const sectionData = planData[section.id] || {};
    const sectionHasContent = section.fields.some((field) => {
      const value = sectionData[field.id];
      return typeof value === "string" && value.trim().length > 0;
    });

    if (sectionHasContent) {
      // Check if need new page
      if (yPos > pageHeight - 90) {
        doc.addPage();
        yPos = 20;
      }

      // Section header
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 5, yPos + 7, 2.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin + 10, yPos + 9.5);
      yPos += 20;

      // Fields
      section.fields.forEach((field) => {
        const value = sectionData[field.id];
        if (typeof value === "string" && value.trim()) {
          // Check if need new page
          if (yPos > pageHeight - 55) {
            doc.addPage();
            yPos = 20;
          }

          // Field label
          doc.setFillColor(100, 116, 139);
          doc.circle(margin + 2, yPos + 2, 1.2, "F");
          doc.setTextColor(51, 65, 85);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(field.label, margin + 5, yPos + 3);
          yPos += 7;

          // Content
          doc.setTextColor(55, 65, 81);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(value, contentWidth - 10);
          const lineHeight = 5;
          const calculatedHeight = lines.length * lineHeight + 8;
          const boxHeight = Math.min(Math.max(calculatedHeight, 12), 60);

          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "F");
          doc.setFillColor(59, 130, 246);
          doc.rect(margin + 2, yPos, 2, boxHeight, "F");
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "S");
          const displayLines = lines.slice(0, 12);
          doc.text(displayLines, margin + 7, yPos + 6);
          yPos += boxHeight + 6;
        }
      });
    }
  });

  return doc;
};

/**
 * Generate Social Business Canvas PDF content
 * Used by: SocialBusinessCanvasImproved.tsx and comprehensiveModulePDFExport.ts
 */
export const generateSocialCanvasPDF = (
  doc: jsPDF,
  canvasData: Record<string, string>,
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  if (addTitlePage) {
    addModuleTitlePage(doc, "Social Business Model Canvas", "Social Business Model Canvas", [59, 130, 246]);
    doc.addPage();
    yPos = 20;
  }

  const fieldGroups = [
    {
      title: "Core Purpose & Value",
      color: [244, 63, 94],
      fields: [
        { key: "socialMission", label: "Social Mission" },
        { key: "socialValueProposition", label: "Social Value Proposition" },
        { key: "relationships", label: "Relationships" },
      ],
    },
    {
      title: "Operations & Resources",
      color: [59, 130, 246],
      fields: [
        { key: "keyDeliveryPartners", label: "Key Delivery Partners" },
        { key: "keyActivities", label: "Key Activities" },
        { key: "keyResources", label: "Key Resources" },
      ],
    },
    {
      title: "Financial Model",
      color: [34, 197, 94],
      fields: [
        { key: "costStructure", label: "Cost Structure" },
        { key: "revenueStreams", label: "Revenue Streams" },
      ],
    },
    {
      title: "Stakeholders & Impact",
      color: [168, 85, 247],
      fields: [
        { key: "targetSegment", label: "Target Segment" },
        { key: "socialImpact", label: "Social Impact" },
        { key: "impactMeasurement", label: "Impact Measurement" },
        { key: "channels", label: "Channels" },
      ],
    },
  ];

  fieldGroups.forEach((group) => {
    // Group header
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(group.color[0], group.color[1], group.color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(group.title, margin + contentWidth / 2, yPos + 8, { align: "center" });
    yPos += 16;

    // Fields
    group.fields.forEach((field) => {
      const value = canvasData[field.key];
      if (value && value.trim()) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(field.label, margin, yPos);
        yPos += 6;

        doc.setTextColor(75, 85, 99);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(value, contentWidth - 4);
        const lineHeight = 5;
        const calculatedHeight = lines.length * lineHeight + 8;
        const boxHeight = Math.min(Math.max(calculatedHeight, 12), 60);

        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "S");
        const displayLines = lines.slice(0, 12);
        doc.text(displayLines, margin + 7, yPos + 6);
        yPos += boxHeight + 6;
      }
    });
  });

  return doc;
};

/**
 * Generate Market Sizing PDF content  
 * Used by: MarketSizingEnhanced.tsx and comprehensiveModulePDFExport.ts
 */
export const generateMarketSizingPDF = (
  doc: jsPDF,
  results: MarketResults,
  valueUnit: "millions" | "billions",
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  const formatValue = (value: number) => {
    const unit = valueUnit === "billions" ? "B" : "M";
    return "$" + value.toFixed(2) + unit;
  };

  if (addTitlePage) {
    addModuleTitlePage(doc, "Market Analysis Report", "Market Sizing Analysis", [34, 197, 94]);
    yPos = 85;
  }

  // Three metric cards in one row
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 40;
  
  const metrics = [
    {
      label: "TAM",
      value: formatValue(results.tam),
      description: "Total Addressable Market",
      color: [59, 130, 246],
      bgColor: [239, 246, 255]
    },
    {
      label: "SAM",
      value: formatValue(results.sam),
      description: "Serviceable Addressable Market",
      color: [168, 85, 247],
      bgColor: [250, 245, 255]
    },
    {
      label: "SOM",
      value: formatValue(results.som),
      description: "Serviceable Obtainable Market",
      color: [34, 197, 94],
      bgColor: [240, 253, 244]
    }
  ];

  metrics.forEach((metric, index) => {
    const xPos = margin + (cardWidth + 4) * index;

    doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "S");

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + cardWidth / 2, yPos + 8, 3.5, "F");
    
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(metric.label, xPos + cardWidth / 2, yPos + 17, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + cardWidth / 2, yPos + 26, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    const descLines = doc.splitTextToSize(metric.description, cardWidth - 4);
    doc.text(descLines, xPos + cardWidth / 2, yPos + 32, { align: "center" });
  });

  yPos += cardHeight + 10;

  // Analysis summary
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const analysisText = "Total Addressable Market (TAM): " + formatValue(results.tam) + "\nServiceable Addressable Market (SAM): " + formatValue(results.sam) + "\nServiceable Obtainable Market (SOM): " + formatValue(results.som) + "\nRevenue Opportunity: " + formatValue(results.revenueOpportunity);
  doc.text(analysisText, margin, yPos);

  return doc;
};

/**
 * Generate Pricing Lab PDF content
 * Used by: PricingLabEnhanced.tsx and comprehensiveModulePDFExport.ts
 */
export const generatePricingLabPDF = (
  doc: jsPDF,
  results: PricingResults,
  pricingData: Record<string, string>,
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  if (addTitlePage) {
    addModuleTitlePage(doc, "Pricing Analysis Report", "Pricing Strategy Analysis", [34, 197, 94]);
    yPos = 85;
  }

  // Four pricing cards in a 2x2 grid
  const cardWidth = (contentWidth - 4) / 2;
  const cardHeight = 35;
  
  const pricingCards = [
    {
      number: "1",
      title: "Cost-Plus Price",
      price: results.costPlusPrice,
      description: "Based on cost + margin",
      color: [59, 130, 246],
      bgColor: [239, 246, 255]
    },
    {
      number: "2",
      title: "Competitive Price",
      price: results.competitivePrice,
      description: "5% below competitor",
      color: [168, 85, 247],
      bgColor: [250, 245, 255]
    },
    {
      number: "3",
      title: "Value-Based Price",
      price: results.valueBasedPrice,
      description: "30% of value delivered",
      color: [34, 197, 94],
      bgColor: [240, 253, 244]
    },
    {
      number: "★",
      title: "Recommended Price",
      price: results.recommendedPrice,
      description: Math.round(results.demandForecast) + " units",
      color: [249, 115, 22],
      bgColor: [255, 247, 237]
    }
  ];

  // Draw pricing cards
  pricingCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const xPos = margin + (cardWidth + 4) * col;
    const cardYPos = yPos + (cardHeight + 4) * row;

    doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
    doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "S");

    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.circle(xPos + 8, cardYPos + 8, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.number, xPos + 8, cardYPos + 10, { align: "center" });

    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.title, xPos + 14, cardYPos + 9);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("$" + card.price.toFixed(2), xPos + cardWidth / 2, cardYPos + 22, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(card.description, xPos + cardWidth / 2, cardYPos + 29, { align: "center" });
  });

  yPos += cardHeight * 2 + 12;

  // Analysis metrics
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  const cost = parseFloat(pricingData.costBasis) || 0;
  const profitMargin = ((results.recommendedPrice - cost) / cost) * 100;

  const prices = [results.costPlusPrice, results.competitivePrice, results.valueBasedPrice];
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  let positioning = "Competitive";
  if (results.recommendedPrice > avgPrice * 1.2) positioning = "Premium";
  if (results.recommendedPrice < avgPrice * 0.8) positioning = "Budget";

  const metricCardWidth = (contentWidth - 8) / 3;
  const metricCardHeight = 30;

  const metrics = [
    {
      icon: "$",
      label: "Recommended Price",
      value: "$" + results.recommendedPrice.toFixed(2),
      badge: positioning + " Positioning",
      color: [34, 197, 94]
    },
    {
      icon: "%",
      label: "Profit Margin",
      value: profitMargin.toFixed(1) + "%",
      badge: profitMargin > 30 ? "Healthy" : "Monitor",
      color: [59, 130, 246]
    },
    {
      icon: "#",
      label: "Demand Forecast",
      value: Math.round(results.demandForecast).toString(),
      badge: "Units/Month",
      color: [168, 85, 247]
    }
  ];

  metrics.forEach((metric, index) => {
    const xPos = margin + (metricCardWidth + 4) * index;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "F");
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "S");

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + metricCardWidth / 2, yPos + 7, 2.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(metric.icon, xPos + metricCardWidth / 2, yPos + 8.5, { align: "center" });

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, xPos + metricCardWidth / 2, yPos + 14, { align: "center" });

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + metricCardWidth / 2, yPos + 21, { align: "center" });

    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.text(metric.badge, xPos + metricCardWidth / 2, yPos + 26, { align: "center" });
  });

  return doc;
};

/**
 * Generate Unit Economics PDF content
 * Used by: UnitEconomicsEnhanced.tsx and comprehensiveModulePDFExport.ts
 */
export const generateUnitEconomicsPDF = (
  doc: jsPDF,
  results: UnitEconomicsResults,
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  if (addTitlePage) {
    addModuleTitlePage(doc, "Unit Economics Analysis", "Financial Performance Analysis", [59, 130, 246]);
    yPos = 85;
  }

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

  const metricWidth = (contentWidth - 8) / 3;
  const metricHeight = 35;
  const health = getLTVCACHealth();
  const retention = getRetentionScore();
  const payback = getPaybackEfficiency();

  const keyMetrics = [
    {
      icon: "✓",
      label: "LTV:CAC Health",
      value: results.ltvCacRatio.toFixed(1) + ":1",
      status: health.level,
      color: health.color,
      bgColor: [240, 253, 244]
    },
    {
      icon: "↻",
      label: "Retention Score",
      value: results.retentionRate.toFixed(1) + "%",
      status: retention.level,
      color: retention.color,
      bgColor: [255, 247, 237]
    },
    {
      icon: "⏱",
      label: "Payback Efficiency",
      value: results.paybackPeriod.toFixed(1) + "m",
      status: payback.level,
      color: payback.color,
      bgColor: [239, 246, 255]
    }
  ];

  keyMetrics.forEach((metric, index) => {
    const xPos = margin + (metricWidth + 4) * index;

    doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + metricWidth / 2, yPos + 7, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(metric.icon, xPos + metricWidth / 2, yPos + 9, { align: "center" });

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, xPos + metricWidth / 2, yPos + 16, { align: "center" });

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + metricWidth / 2, yPos + 24, { align: "center" });

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

  const revenueMetrics: [string, string][] = [
    ["Annual Recurring Revenue", "$" + results.arr.toLocaleString()],
    ["Total Revenue", "$" + results.totalRevenue.toLocaleString()],
    ["Gross Profit", "$" + results.grossProfit.toLocaleString()]
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

  const profitMetrics: [string, string][] = [
    ["Unit Profitability", "$" + results.unitProfitability.toFixed(2)],
    ["Gross Margin per Lifespan", "$" + results.grossMarginPerLifespan.toFixed(2)],
    ["Customer LTV", "$" + results.ltv.toFixed(2)]
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

  return doc;
};

/**
 * Generate Financial Modeler PDF content
 * Used by: FinancialModelerEnhanced.tsx and comprehensiveModulePDFExport.ts
 */
export const generateFinancialModelerPDF = (
  doc: jsPDF,
  results: FinancialResults,
  addTitlePage: boolean = true
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = addTitlePage ? 20 : 40;

  if (addTitlePage) {
    addModuleTitlePage(doc, "Financial Model Analysis", "Financial Performance Report", [59, 130, 246]);
    yPos = 85;
  }

  const getHealthStatus = (value: number, thresholds: { good: number; excellent: number }) => {
    if (value >= thresholds.excellent) return { status: 'Excellent', color: [34, 197, 94] };
    if (value >= thresholds.good) return { status: 'Good', color: [59, 130, 246] };
    return { status: 'Needs Improvement', color: [239, 68, 68] };
  };

  const cashFlowPct = results.totalRevenue > 0 ? (results.operatingCashFlow / results.totalRevenue) * 100 : 0;
  const grossMarginHealth = getHealthStatus(results.grossMargin, { good: 40, excellent: 60 });
  const netMarginHealth = getHealthStatus(results.netMargin, { good: 10, excellent: 20 });
  const cashFlowHealth = getHealthStatus(cashFlowPct, { good: 15, excellent: 25 });

  const metricWidth = (contentWidth - 8) / 3;
  const metricHeight = 35;

  const healthMetrics = [
    {
      title: "Gross Margin Health",
      value: results.grossMargin.toFixed(1) + "%",
      status: grossMarginHealth.status,
      color: grossMarginHealth.color,
    },
    {
      title: "Net Margin Health",
      value: results.netMargin.toFixed(1) + "%",
      status: netMarginHealth.status,
      color: netMarginHealth.color,
    },
    {
      title: "Cash Flow Health",
      value: cashFlowPct.toFixed(1) + "%",
      status: cashFlowHealth.status,
      color: cashFlowHealth.color,
    },
  ];

  healthMetrics.forEach((metric, index) => {
    const xPos = margin + (metricWidth + 4) * index;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(metric.title, xPos + metricWidth / 2, yPos + 7, { align: "center" });

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    const badgeWidth = 25;
    doc.roundedRect(xPos + (metricWidth - badgeWidth) / 2, yPos + 11, badgeWidth, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(metric.status, xPos + metricWidth / 2, yPos + 14.5, { align: "center" });

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

  const profitMetrics: [string, string][] = [
    ["Gross Profit:", "$" + results.grossProfit.toLocaleString()],
    ["EBITDA:", "$" + results.ebitda.toLocaleString()],
    ["Net Profit:", "$" + results.netProfit.toLocaleString()],
    ["Profitability Ratio:", results.profitabilityRatio.toFixed(2) + "x"],
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

  const cashFlowMetrics: [string, string][] = [
    ["Operating Cash Flow:", "$" + results.operatingCashFlow.toLocaleString()],
    ["Free Cash Flow:", "$" + results.freeCashFlow.toLocaleString()],
    ["Break-Even Month:", results.breakEvenMonth > 0 ? "Month " + results.breakEvenMonth : "Not reached"],
    ["Revenue Growth:", results.revenueGrowthRate.toFixed(1) + "%"],
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

  return doc;
};

// All PDF generators complete! GTM Planner uses its own existing function.
// This shared utilities file ensures DRY principle is maintained.
