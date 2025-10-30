import jsPDF from "jspdf";
import { AppDispatch, RootState } from "@/store";
import { loadLatestMarketSizing } from "@/store/slices/marketSizingSlice";
import { loadLatestPricingLab } from "@/store/slices/pricingLabSlice";
import { loadLatestUnitEconomics } from "@/store/slices/unitEconomicsSlice";
import { loadLatestModel } from "@/store/slices/financialModelerSlice";
import { fetchGTMPlan } from "@/store/slices/gtmPlannerSlice";
import { fetchPlanBuilder } from "@/store/slices/planBuilderSlice";

interface ComprehensivePDFOptions {
  projectId: string;
  projectName?: string;
}

// Helper to check if content exists
const hasContent = (value: any): boolean => {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some((item) => hasContent(item));
  if (typeof value === "object") return Object.values(value).some((v) => hasContent(v));
  return true;
};

// Helper to add section header
const addSectionHeader = (
  doc: jsPDF,
  title: string,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number,
  color: number[] = [59, 130, 246]
): number => {
  const pageHeight = doc.internal.pageSize.getHeight();

  // Check if need new page
  if (yPos > pageHeight - 90) {
    doc.addPage();
    yPos = 20;
  }

  // Add extra space before section
  if (yPos > 20) {
    yPos += 10;
  }

  // Section header with colored background
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

  // Add decorative circle
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 5, yPos + 7, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 10, yPos + 9.5);

  return yPos + 20;
};

// Helper to add field/subsection
const addField = (
  doc: jsPDF,
  label: string,
  content: string,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number,
  accentColor: number[] = [59, 130, 246]
): number => {
  const pageHeight = doc.internal.pageSize.getHeight();

  // Check if need new page
  if (yPos > pageHeight - 55) {
    doc.addPage();
    yPos = 20;
  }

  // Field label with bullet
  doc.setFillColor(100, 116, 139);
  doc.circle(margin + 2, yPos + 2, 1.2, "F");

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(label, margin + 5, yPos + 3);

  yPos += 7;

  // Content box
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const text = content || "";
  if (!text.trim()) {
    return yPos; // Skip empty fields
  }

  const lines = doc.splitTextToSize(text, contentWidth - 10);

  // Calculate box height
  const lineHeight = 5;
  const minBoxHeight = 12;
  const calculatedHeight = lines.length * lineHeight + 8;
  const boxHeight = Math.min(Math.max(calculatedHeight, minBoxHeight), 60);

  // Draw content box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "F");

  // Add left accent border
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(margin + 2, yPos, 2, boxHeight, "F");

  // Border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "S");

  // Add text
  const displayLines = lines.slice(0, 12);
  doc.text(displayLines, margin + 7, yPos + 6);

  return yPos + boxHeight + 6;
};

// Generate Market Sizing section
const generateMarketSizingSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data || !hasContent(data.market_data)) return yPos;

  yPos = addSectionHeader(doc, "Market Sizing Analysis", yPos, pageWidth, margin, contentWidth, [34, 197, 94]);

  if (data.market_data) {
    if (hasContent(data.market_data.targetMarket)) {
      yPos = addField(doc, "Target Market", data.market_data.targetMarket, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
    if (hasContent(data.market_data.marketSize)) {
      yPos = addField(doc, "Market Size", data.market_data.marketSize, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
    if (hasContent(data.market_data.growthRate)) {
      yPos = addField(doc, "Growth Rate", data.market_data.growthRate, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
  }

  if (data.results) {
    const results = data.results;
    if (hasContent(results.tam)) {
      yPos = addField(doc, "Total Addressable Market (TAM)", `${results.tam}`, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
    if (hasContent(results.sam)) {
      yPos = addField(doc, "Serviceable Addressable Market (SAM)", `${results.sam}`, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
    if (hasContent(results.som)) {
      yPos = addField(doc, "Serviceable Obtainable Market (SOM)", `${results.som}`, yPos, pageWidth, margin, contentWidth, [34, 197, 94]);
    }
  }

  return yPos;
};

// Generate Pricing Lab section
const generatePricingLabSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data) return yPos;

  yPos = addSectionHeader(doc, "Pricing Strategy", yPos, pageWidth, margin, contentWidth, [139, 92, 246]);

  if (hasContent(data.product_name)) {
    yPos = addField(doc, "Product/Service", data.product_name, yPos, pageWidth, margin, contentWidth, [139, 92, 246]);
  }

  if (data.pricing_tiers && Array.isArray(data.pricing_tiers)) {
    data.pricing_tiers.forEach((tier: any, index: number) => {
      if (hasContent(tier.name)) {
        const tierInfo = `Price: $${tier.price || 0} | Features: ${tier.features || "N/A"}`;
        yPos = addField(doc, `Tier ${index + 1}: ${tier.name}`, tierInfo, yPos, pageWidth, margin, contentWidth, [139, 92, 246]);
      }
    });
  }

  return yPos;
};

// Generate Unit Economics section
const generateUnitEconomicsSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data || !data.inputs) return yPos;

  yPos = addSectionHeader(doc, "Unit Economics", yPos, pageWidth, margin, contentWidth, [59, 130, 246]);

  const inputs = data.inputs;
  if (hasContent(inputs.cac)) {
    yPos = addField(doc, "Customer Acquisition Cost (CAC)", `$${inputs.cac}`, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
  }
  if (hasContent(inputs.arpu)) {
    yPos = addField(doc, "Average Revenue Per User (ARPU)", `$${inputs.arpu}`, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
  }
  if (hasContent(inputs.churnRate)) {
    yPos = addField(doc, "Churn Rate", `${inputs.churnRate}%`, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
  }

  if (data.results) {
    const results = data.results;
    if (hasContent(results.ltv)) {
      yPos = addField(doc, "Customer Lifetime Value (LTV)", `$${results.ltv.toFixed(2)}`, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
    }
    if (hasContent(results.ltvCacRatio)) {
      yPos = addField(doc, "LTV:CAC Ratio", `${results.ltvCacRatio.toFixed(2)}`, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
    }
  }

  return yPos;
};

// Generate Financial Modeler section
const generateFinancialModelerSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data) return yPos;

  yPos = addSectionHeader(doc, "Financial Projections", yPos, pageWidth, margin, contentWidth, [16, 185, 129]);

  if (data.inputs) {
    const inputs = data.inputs;
    if (hasContent(inputs.initialRevenue)) {
      yPos = addField(doc, "Initial Revenue", `$${inputs.initialRevenue}`, yPos, pageWidth, margin, contentWidth, [16, 185, 129]);
    }
    if (hasContent(inputs.growthRate)) {
      yPos = addField(doc, "Growth Rate", `${inputs.growthRate}%`, yPos, pageWidth, margin, contentWidth, [16, 185, 129]);
    }
    if (hasContent(inputs.operatingMargin)) {
      yPos = addField(doc, "Operating Margin", `${inputs.operatingMargin}%`, yPos, pageWidth, margin, contentWidth, [16, 185, 129]);
    }
  }

  return yPos;
};

// Generate GTM Planner section
const generateGTMPlannerSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data) return yPos;

  yPos = addSectionHeader(doc, "Go-To-Market Strategy", yPos, pageWidth, margin, contentWidth, [13, 148, 136]);

  if (data.productRoadmap) {
    const roadmap = data.productRoadmap;
    if (hasContent(roadmap.businessName)) {
      yPos = addField(doc, "Business Name", roadmap.businessName, yPos, pageWidth, margin, contentWidth, [13, 148, 136]);
    }
    if (hasContent(roadmap.year)) {
      yPos = addField(doc, "Target Year", `${roadmap.year}`, yPos, pageWidth, margin, contentWidth, [13, 148, 136]);
    }
  }

  if (data.swotAnalysis) {
    const swot = data.swotAnalysis;
    if (hasContent(swot.strengths?.notes)) {
      yPos = addField(doc, "Strengths", swot.strengths.notes, yPos, pageWidth, margin, contentWidth, [13, 148, 136]);
    }
    if (hasContent(swot.opportunities?.notes)) {
      yPos = addField(doc, "Opportunities", swot.opportunities.notes, yPos, pageWidth, margin, contentWidth, [13, 148, 136]);
    }
  }

  return yPos;
};

// Generate Social Business Canvas section
const generateSocialCanvasSection = (
  doc: jsPDF,
  data: any,
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data) return yPos;

  yPos = addSectionHeader(doc, "Social Business Model", yPos, pageWidth, margin, contentWidth, [244, 63, 94]);

  if (hasContent(data.socialMission)) {
    yPos = addField(doc, "Social Mission", data.socialMission, yPos, pageWidth, margin, contentWidth, [244, 63, 94]);
  }
  if (hasContent(data.socialValueProposition)) {
    yPos = addField(doc, "Value Proposition", data.socialValueProposition, yPos, pageWidth, margin, contentWidth, [244, 63, 94]);
  }
  if (hasContent(data.keyStakeholders)) {
    yPos = addField(doc, "Key Stakeholders", data.keyStakeholders, yPos, pageWidth, margin, contentWidth, [244, 63, 94]);
  }

  return yPos;
};

// Generate Business Plan section
const generateBusinessPlanSection = (
  doc: jsPDF,
  data: any,
  sections: any[],
  yPos: number,
  pageWidth: number,
  margin: number,
  contentWidth: number
): number => {
  if (!data || !sections) return yPos;

  yPos = addSectionHeader(doc, "Business Plan", yPos, pageWidth, margin, contentWidth, [59, 130, 246]);

  sections.forEach((section) => {
    const sectionData = data[section.id] || {};
    const sectionHasContent = section.fields.some((field: any) => {
      const value = sectionData[field.id];
      return typeof value === "string" && value.trim().length > 0;
    });

    if (sectionHasContent) {
      // Add subsection title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      const pageHeight = doc.internal.pageSize.getHeight();
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(section.title, margin, yPos);
      yPos += 8;

      section.fields.forEach((field: any) => {
        const value = sectionData[field.id];
        if (typeof value === "string" && value.trim()) {
          yPos = addField(doc, field.label, value, yPos, pageWidth, margin, contentWidth, [59, 130, 246]);
        }
      });
    }
  });

  return yPos;
};

// Main comprehensive PDF export function
export const generateComprehensivePDF = async (
  dispatch: AppDispatch,
  getState: () => RootState,
  options: ComprehensivePDFOptions
): Promise<jsPDF> => {
  const { projectId, projectName = "Comprehensive Business Report" } = options;

  // Fetch all module data (suppress errors if module doesn't exist)
  try {
    await Promise.all([
      dispatch(loadLatestMarketSizing(projectId)).catch(() => null),
      dispatch(loadLatestPricingLab(projectId)).catch(() => null),
      dispatch(loadLatestUnitEconomics(projectId)).catch(() => null),
      dispatch(loadLatestModel(projectId)).catch(() => null),
      dispatch(fetchGTMPlan(projectId)).catch(() => null),
      dispatch(fetchPlanBuilder({ projectId })).catch(() => null),
    ]);
  } catch (error) {
    console.warn("Some modules failed to load:", error);
  }

  // Get state after fetching
  const state = getState();

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
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(margin, 70, pageWidth - margin, 70);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Comprehensive Business Report", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(projectName, pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 65, { align: "center" });

  doc.addPage();
  yPos = 20;

  // Generate sections for each module (only if data exists)
  // Market Sizing
  if (state.marketSizing.sizingId && state.marketSizing.marketData) {
    const marketData = {
      market_data: state.marketSizing.marketData,
      results: state.marketSizing.results,
    };
    yPos = generateMarketSizingSection(doc, marketData, yPos, pageWidth, margin, contentWidth);
  }

  // Pricing Lab
  if (state.pricingLab.pricingLabId) {
    const pricingData = {
      product_name: state.pricingLab.productName,
      pricing_tiers: state.pricingLab.tiers,
    };
    yPos = generatePricingLabSection(doc, pricingData, yPos, pageWidth, margin, contentWidth);
  }

  // Unit Economics
  if (state.unitEconomics.dataId) {
    const unitEconData = {
      inputs: state.unitEconomics.inputs,
      results: state.unitEconomics.results,
    };
    yPos = generateUnitEconomicsSection(doc, unitEconData, yPos, pageWidth, margin, contentWidth);
  }

  // Financial Modeler
  if (state.financialModeler.modelId) {
    const financialData = {
      inputs: state.financialModeler.inputs,
      results: state.financialModeler.results,
    };
    yPos = generateFinancialModelerSection(doc, financialData, yPos, pageWidth, margin, contentWidth);
  }

  // GTM Planner
  if (state.gtmPlanner.gtmPlanId) {
    const gtmData = {
      productRoadmap: state.gtmPlanner.productRoadmap,
      swotAnalysis: state.gtmPlanner.swotAnalysis,
    };
    yPos = generateGTMPlannerSection(doc, gtmData, yPos, pageWidth, margin, contentWidth);
  }

  // Business Plan
  const planBuilder = state.planBuilder.planData;
  const planSections = state.planBuilder.sections;
  if (planBuilder && Object.keys(planBuilder).length > 0) {
    yPos = generateBusinessPlanSection(doc, planBuilder, planSections, yPos, pageWidth, margin, contentWidth);
  }

  // Footer on all pages
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
    doc.text("Comprehensive Report", pageWidth / 2, pageHeight - 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return doc;
};
