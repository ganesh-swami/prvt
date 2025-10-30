import jsPDF from "jspdf";
import { AppDispatch, RootState } from "@/store";
import { loadLatestMarketSizing } from "@/store/slices/marketSizingSlice";
import { loadLatestPricingLab } from "@/store/slices/pricingLabSlice";
import { loadLatestUnitEconomics } from "@/store/slices/unitEconomicsSlice";
import { loadLatestModel } from "@/store/slices/financialModelerSlice";
import { fetchGTMPlan } from "@/store/slices/gtmPlannerSlice";
import { fetchPlanBuilder } from "@/store/slices/planBuilderSlice";
import { fetchSocialCanvas } from "@/store/slices/socialCanvasSlice";
// GTM export removed from comprehensive - use individual GTM export
import { allPlanSections } from "@/components/modules/enhanced/PlanBuilderSectionsComplete";
import { 
  addModuleTitlePage,
  addFooterToAllPages,
  generatePlanBuilderPDF,
  generateSocialCanvasPDF,
  generateMarketSizingPDF,
  generatePricingLabPDF,
  generateUnitEconomicsPDF,
  generateFinancialModelerPDF
} from "./modulePDFGenerators";

interface ComprehensiveExportOptions {
  projectId: string;
  projectName?: string;
}

// Helper to add module separator page
const addModuleSeparator = (
  doc: jsPDF,
  moduleName: string,
  pageWidth: number,
  color: number[] = [59, 130, 246]
): void => {
  doc.addPage();
  
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Full page colored header
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, pageWidth, 80, "F");
  
  // Decorative line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.line(15, 70, pageWidth - 15, 70);
  
  // Module name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(moduleName, pageWidth / 2, 40, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Module Report", pageWidth / 2, 60, { align: "center" });
};

// Note: PDF merging is complex - for now we'll generate content inline rather than merging separate PDFs

export const generateComprehensiveModulePDF = async (
  dispatch: AppDispatch,
  getState: () => RootState,
  options: ComprehensiveExportOptions
): Promise<jsPDF> => {
  const { projectId, projectName = "Comprehensive Business Report" } = options;

  // Fetch all module data - WAIT for all to complete
  console.log("=== STARTING DATA FETCH ===");
  console.log("Project ID:", projectId);
  
  const fetchResults = await Promise.allSettled([
    dispatch(fetchPlanBuilder({ projectId, force: true })).unwrap().catch(e => { console.error("Plan Builder fetch failed:", e); return null; }),
    dispatch(fetchSocialCanvas({ projectId, force: true })).unwrap().catch(e => { console.error("Social Canvas fetch failed:", e); return null; }),
    dispatch(loadLatestMarketSizing(projectId)).unwrap().catch(e => { console.error("Market Sizing fetch failed:", e); return null; }),
    dispatch(loadLatestPricingLab(projectId)).unwrap().catch(e => { console.error("Pricing Lab fetch failed:", e); return null; }),
    dispatch(loadLatestUnitEconomics(projectId)).unwrap().catch(e => { console.error("Unit Economics fetch failed:", e); return null; }),
    dispatch(loadLatestModel(projectId)).unwrap().catch(e => { console.error("Financial Model fetch failed:", e); return null; }),
    dispatch(fetchGTMPlan(projectId)).unwrap().catch(e => { console.error("GTM Plan fetch failed:", e); return null; }),
  ]);
  
  console.log("Fetch results status:", fetchResults.map((r, i) => ({
    module: ['PlanBuilder', 'SocialCanvas', 'MarketSizing', 'PricingLab', 'UnitEconomics', 'FinancialModel', 'GTM'][i],
    status: r.status
  })));

  // Get state after fetching
  const state = getState();
  console.log("State after fetching:", {
    planBuilder: state.planBuilder.businessPlanId,
    socialCanvas: state.socialCanvas.canvasId,
    marketSizing: state.marketSizing.sizingId,
    pricingLab: state.pricingLab.pricingId,
    unitEconomics: state.unitEconomics.economicsId,
    financialModeler: state.financialModeler.modelId,
    gtmPlanner: state.gtmPlanner.gtmId
  });

  // Create main comprehensive document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ========================================
  // TITLE PAGE
  // ========================================
  doc.setFillColor(37, 99, 235); // Darker blue
  doc.rect(0, 0, pageWidth, 100, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(margin, 85, pageWidth - margin, 85);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(34);
  doc.setFont("helvetica", "bold");
  doc.text("Comprehensive", pageWidth / 2, 35, { align: "center" });
  doc.text("Business Report", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(projectName, pageWidth / 2, 70, { align: "center" });

  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 92, { align: "center" });

  // Table of Contents
  doc.addPage();
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", pageWidth / 2, 25, { align: "center" });
  
  let tocY = 60;
  const modules = [
    "Business Plan",
    "Social Business Model Canvas",
    "Problem Tree Analysis",
    "Ecosystem Mapping",
    "Market Sizing Analysis",
    "Pricing Strategy",
    "Unit Economics",
    "Financial Projections",
    "Go-To-Market Strategy"
  ];
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  modules.forEach((module, index) => {
    doc.setFillColor(100, 116, 139);
    doc.circle(margin + 3, tocY + 2, 1.5, "F");
    doc.text(`${index + 1}. ${module}`, margin + 8, tocY + 4);
    tocY += 10;
  });

  // ========================================
  // 1. BUSINESS PLAN (Plan Builder)
  // ========================================
  const planData = state.planBuilder.planData;
  const hasPlanData = Object.keys(planData).length > 0;
  
  console.log("Plan Builder check:", {
    businessPlanId: state.planBuilder.businessPlanId,
    planDataKeys: Object.keys(planData),
    hasPlanData
  });
  
  if (hasPlanData) {
    addModuleSeparator(doc, "Business Plan", pageWidth, [59, 130, 246]);
    // Use shared function - same code as individual module export
    generatePlanBuilderPDF(doc, allPlanSections, planData, false);
  }

  // ========================================
  // 2. SOCIAL BUSINESS CANVAS
  // ========================================
  const canvasData = state.socialCanvas.canvasData;
  const hasCanvasData = canvasData && Object.keys(canvasData).length > 0;
  
  console.log("Social Canvas check:", {
    canvasId: state.socialCanvas.canvasId,
    canvasDataKeys: Object.keys(canvasData || {}),
    hasCanvasData
  });
  
  if (hasCanvasData) {
    addModuleSeparator(doc, "Social Business Model Canvas", pageWidth, [244, 63, 94]);
    // Use shared function - same code as individual module export
    generateSocialCanvasPDF(doc, canvasData, false);
  }

  // ========================================
  // 3. PROBLEM TREE
  // ========================================
  // TODO: Add Problem Tree export if it has export functionality

  // ========================================
  // 4. ECOSYSTEM MAPPING  
  // ========================================
  // TODO: Add Ecosystem export

  // ========================================
  // 5. MARKET SIZING
  // ========================================
  const hasMarketData = state.marketSizing.sizingId && state.marketSizing.results;
  
  console.log("Market Sizing check:", {
    sizingId: state.marketSizing.sizingId,
    hasResults: !!state.marketSizing.results,
    results: state.marketSizing.results
  });
  
  if (hasMarketData) {
    addModuleSeparator(doc, "Market Sizing Analysis", pageWidth, [34, 197, 94]);
    // Use shared function - same code as individual module export
    generateMarketSizingPDF(doc, state.marketSizing.results, state.marketSizing.valueUnit, false);
  }

  // ========================================
  // 6. PRICING STRATEGY
  // ========================================
  const hasPricingData = state.pricingLab.pricingId && state.pricingLab.results && state.pricingLab.results.recommendedPrice >= 0;
  
  console.log("Pricing Lab check:", {
    pricingId: state.pricingLab.pricingId,
    hasResults: !!state.pricingLab.results,
    recommendedPrice: state.pricingLab.results?.recommendedPrice
  });
  
  if (hasPricingData) {
    addModuleSeparator(doc, "Pricing Strategy", pageWidth, [139, 92, 246]);
    // Use shared function - same code as individual module export
    generatePricingLabPDF(doc, state.pricingLab.results, state.pricingLab.pricingData as any, false);
  }

  // ========================================
  // 7. UNIT ECONOMICS
  // ========================================
  const hasUnitEconData = state.unitEconomics.economicsId && state.unitEconomics.results && state.unitEconomics.results.ltv > 0;
  
  console.log("Unit Economics check:", {
    economicsId: state.unitEconomics.economicsId,
    hasResults: !!state.unitEconomics.results,
    ltv: state.unitEconomics.results?.ltv
  });
  
  if (hasUnitEconData) {
    addModuleSeparator(doc, "Unit Economics Analysis", pageWidth, [59, 130, 246]);
    // Use shared function - same code as individual module export
    generateUnitEconomicsPDF(doc, state.unitEconomics.results, false);
  }

  // ========================================
  // 8. FINANCIAL PROJECTIONS
  // ========================================
  const hasFinancialData = state.financialModeler.modelId && state.financialModeler.results && state.financialModeler.results.totalRevenue > 0;
  
  console.log("Financial Modeler check:", {
    modelId: state.financialModeler.modelId,
    hasResults: !!state.financialModeler.results,
    totalRevenue: state.financialModeler.results?.totalRevenue
  });
  
  if (hasFinancialData) {
    addModuleSeparator(doc, "Financial Projections", pageWidth, [16, 185, 129]);
    // Use shared function - same code as individual module export
    generateFinancialModelerPDF(doc, state.financialModeler.results as any, false);
  }

  // ========================================
  // 9. GO-TO-MARKET STRATEGY
  // ========================================
  // GTM excluded for now - use individual GTM export for full strategy
  console.log("GTM Planner - Excluded from comprehensive export (use individual GTM export)");

  // ========================================
  // SUMMARY: Log what was included
  // ========================================
  const includedModules = {
    planBuilder: hasPlanData,
    socialCanvas: hasCanvasData,
    marketSizing: hasMarketData,
    pricingLab: hasPricingData,
    unitEconomics: hasUnitEconData,
    financialModeler: hasFinancialData,
    gtmPlanner: false // Excluded from comprehensive export
  };
  
  console.log("=== PDF EXPORT SUMMARY ===");
  console.log("Modules included in PDF:", includedModules);
  console.log("Total pages:", doc.getNumberOfPages());
  console.log("========================");

  // Add footer to all pages using shared function
  addFooterToAllPages(doc, "Comprehensive Report");

  return doc;
};
