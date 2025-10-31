import jsPDF from "jspdf";
import { AppDispatch, RootState } from "@/store";
import { loadLatestMarketSizing } from "@/store/slices/marketSizingSlice";
import { loadLatestPricingLab } from "@/store/slices/pricingLabSlice";
import { loadLatestUnitEconomics } from "@/store/slices/unitEconomicsSlice";
import { loadLatestModel } from "@/store/slices/financialModelerSlice";
import { fetchGTMPlan } from "@/store/slices/gtmPlannerSlice";
import { fetchPlanBuilder } from "@/store/slices/planBuilderSlice";
import { fetchSocialCanvas } from "@/store/slices/socialCanvasSlice";
import { fetchProblemTree } from "@/store/slices/problemTreeSlice";
import { fetchStakeholders } from "@/store/slices/stakeholdersSlice";
import { allPlanSections } from "@/components/modules/enhanced/PlanBuilderSectionsComplete";
import { createPDFInstance, addFooterToAllPages } from "./pdfUtils";
import {
  addPlanBuilderContent,
  addSocialCanvasContent,
  addMarketSizingContent,
  addPricingLabContent,
  addUnitEconomicsContent,
  addFinancialModelerContent,
  addProblemTreeContent,
  addEcosystemMappingContent,
  addGTMPlannerContent,
} from "./modulePDFExports";

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
    dispatch(fetchProblemTree({ projectId, force: true })).unwrap().catch(e => { console.error("Problem Tree fetch failed:", e); return null; }),
    dispatch(fetchStakeholders({ projectId })).unwrap().catch(e => { console.error("Ecosystem Mapping fetch failed:", e); return null; }),
    dispatch(loadLatestMarketSizing(projectId)).unwrap().catch(e => { console.error("Market Sizing fetch failed:", e); return null; }),
    dispatch(loadLatestPricingLab(projectId)).unwrap().catch(e => { console.error("Pricing Lab fetch failed:", e); return null; }),
    dispatch(loadLatestUnitEconomics(projectId)).unwrap().catch(e => { console.error("Unit Economics fetch failed:", e); return null; }),
    dispatch(loadLatestModel(projectId)).unwrap().catch(e => { console.error("Financial Model fetch failed:", e); return null; }),
    dispatch(fetchGTMPlan(projectId)).unwrap().catch(e => { console.error("GTM Plan fetch failed:", e); return null; }),
  ]);
  
  console.log("Fetch results status:", fetchResults.map((r, i) => ({
    module: ['PlanBuilder', 'SocialCanvas', 'ProblemTree', 'EcosystemMapping', 'MarketSizing', 'PricingLab', 'UnitEconomics', 'FinancialModel', 'GTM'][i],
    status: r.status,
    data: r.status === 'fulfilled' ? (r as any).value : (r as any).reason
  })));

  // Get state after fetching
  const state = getState();
  console.log("State after fetching:", {
    planBuilder: state.planBuilder.businessPlanId,
    socialCanvas: state.socialCanvas.canvasId,
    problemTree: state.problemTree.treeId,
    ecosystemMap: state.ecosystemMap.stakeholders?.length,
    marketSizing: state.marketSizing.sizingId,
    pricingLab: state.pricingLab.pricingId,
    unitEconomics: state.unitEconomics.economicsId,
    financialModeler: state.financialModeler.modelId,
    gtmPlanner: state.gtmPlanner.gtmId
  });

  // Create main comprehensive document
  const doc = createPDFInstance();

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
    addPlanBuilderContent(doc, allPlanSections, planData, false);
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
    addSocialCanvasContent(doc, canvasData, false);
  }

  // ========================================
  // 3. PROBLEM TREE
  // ========================================
  const problemTreeData = state.problemTree.treeData;
  const hasProblemTreeData = state.problemTree.treeId && problemTreeData && Object.keys(problemTreeData).length > 0;
  
  console.log("Problem Tree check:", {
    treeId: state.problemTree.treeId,
    hasTreeData: hasProblemTreeData
  });
  
  if (hasProblemTreeData) {
    addModuleSeparator(doc, "Problem Tree Analysis", pageWidth, [139, 92, 246]);
    addProblemTreeContent(doc, problemTreeData, false);
  }

  // ========================================
  // 4. ECOSYSTEM MAPPING  
  // ========================================
  const stakeholders = state.ecosystemMap.stakeholders || [];
  const hasEcosystemData = stakeholders.length > 0;
  
  console.log("Ecosystem Mapping check:", {
    stakeholdersCount: stakeholders.length,
    hasEcosystemData
  });
  
  if (hasEcosystemData) {
    addModuleSeparator(doc, "Ecosystem Mapping", pageWidth, [34, 197, 94]);
    addEcosystemMappingContent(doc, stakeholders, false);
  }

  // ========================================
  // 5. MARKET SIZING
  // ========================================
  const hasMarketData = state.marketSizing.sizingId && 
    state.marketSizing.results && 
    (state.marketSizing.results.tam > 0 || 
     state.marketSizing.results.sam > 0 || 
     state.marketSizing.results.som > 0);
  
  console.log("=== MARKET SIZING DEBUG ===");
  console.log("Market Sizing check:", {
    sizingId: state.marketSizing.sizingId,
    hasResults: !!state.marketSizing.results,
    results: state.marketSizing.results,
    marketData: state.marketSizing.marketData,
    valueUnit: state.marketSizing.valueUnit,
    hasNonZeroResults: (state.marketSizing.results?.tam > 0 || state.marketSizing.results?.sam > 0 || state.marketSizing.results?.som > 0)
  });
  console.log("============================");
  
  // Check if we need to recalculate Market Sizing results
  let marketSizingResults = state.marketSizing.results;
  const hasMarketInput = state.marketSizing.marketData.totalMarket && 
                         state.marketSizing.marketData.targetSegment;
  
  if (hasMarketInput && (!hasMarketData || marketSizingResults.tam === 0)) {
    // Recalculate results from input data
    const totalMarket = parseFloat(state.marketSizing.marketData.totalMarket) || 0;
    const targetSegment = parseFloat(state.marketSizing.marketData.targetSegment) || 0;
    const penetrationRate = parseFloat(state.marketSizing.marketData.penetrationRate) || 5;
    const avgRevenue = parseFloat(state.marketSizing.marketData.avgRevenue) || 0;
    
    const multiplier = state.marketSizing.valueUnit === "billions" ? 1000000000 : 1000000;
    const tam = totalMarket * multiplier;
    const sam = (tam * targetSegment) / 100;
    const som = (sam * penetrationRate) / 100;
    const revenueOpportunity = (som / avgRevenue) * avgRevenue;
    
    marketSizingResults = { tam, sam, som, revenueOpportunity };
    console.log("Recalculated Market Sizing:", marketSizingResults);
  }
  
  const hasValidMarketData = marketSizingResults.tam > 0 || marketSizingResults.sam > 0 || marketSizingResults.som > 0;
  
  if (hasValidMarketData) {
    addModuleSeparator(doc, "Market Sizing Analysis", pageWidth, [34, 197, 94]);
    // Convert string penetrationRate to decimal number (e.g., "5" -> 0.05)
    const penetrationRateStr = state.marketSizing.marketData.penetrationRate || "5";
    const penetrationRateNum = parseFloat(penetrationRateStr) / 100 || 0.05;
    const marketData = { penetrationRate: penetrationRateNum };
    addMarketSizingContent(doc, marketSizingResults, marketData, state.marketSizing.valueUnit, false);
  }

  // ========================================
  // 6. PRICING STRATEGY
  // ========================================
  const hasPricingData = state.pricingLab.pricingId && 
    state.pricingLab.results && 
    (state.pricingLab.results.recommendedPrice > 0 ||
     state.pricingLab.results.costPlusPrice > 0 ||
     state.pricingLab.results.valueBasedPrice > 0);
  
  console.log("=== PRICING LAB DEBUG ===");
  console.log("Pricing Lab check:", {
    pricingId: state.pricingLab.pricingId,
    hasResults: !!state.pricingLab.results,
    recommendedPrice: state.pricingLab.results?.recommendedPrice,
    results: state.pricingLab.results,
    pricingData: state.pricingLab.pricingData,
    strategy: state.pricingLab.strategy,
    hasNonZeroResults: (state.pricingLab.results?.recommendedPrice > 0 || state.pricingLab.results?.costPlusPrice > 0)
  });
  console.log("=========================");
  
  // Check if we need to recalculate Pricing Lab results
  let pricingLabResults = state.pricingLab.results;
  const hasPricingInput = state.pricingLab.pricingData.costBasis && 
                          state.pricingLab.pricingData.targetMargin;
  
  if (hasPricingInput && (!hasPricingData || pricingLabResults.recommendedPrice === 0)) {
    // Recalculate pricing results from input data
    const costBasis = parseFloat(state.pricingLab.pricingData.costBasis) || 0;
    const targetMargin = parseFloat(state.pricingLab.pricingData.targetMargin) || 0;
    const competitorPrice = parseFloat(state.pricingLab.pricingData.competitorPrice) || 0;
    const valueDelivered = parseFloat(state.pricingLab.pricingData.valueDelivered) || 0;
    
    const costPlusPrice = costBasis * (1 + targetMargin / 100);
    const competitivePrice = competitorPrice * 0.95; // 5% below competitor
    const valueBasedPrice = valueDelivered * 0.7; // 70% of value delivered
    
    // Recommended price is average of the three
    const recommendedPrice = (costPlusPrice + competitivePrice + valueBasedPrice) / 3;
    
    // Simple demand forecast based on price elasticity
    const elasticity = state.pricingLab.pricingData.priceElasticity?.[0] || 50;
    const demandForecast = 1000 * (100 - elasticity) / 100;
    
    pricingLabResults = {
      costPlusPrice,
      competitivePrice,
      valueBasedPrice,
      recommendedPrice,
      demandForecast
    };
    console.log("Recalculated Pricing Lab:", pricingLabResults);
  }
  
  const hasValidPricingData = pricingLabResults.recommendedPrice > 0 || 
                               pricingLabResults.costPlusPrice > 0 || 
                               pricingLabResults.valueBasedPrice > 0;
  
  if (hasValidPricingData) {
    addModuleSeparator(doc, "Pricing Strategy", pageWidth, [139, 92, 246]);
    const strategy = state.pricingLab.strategy || "value-based";
    addPricingLabContent(doc, pricingLabResults, state.pricingLab.pricingData as any, strategy, false);
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
    addUnitEconomicsContent(doc, state.unitEconomics.results, false);
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
    addFinancialModelerContent(doc, state.financialModeler.results as any, false);
  }

  // ========================================
  // 9. GO-TO-MARKET STRATEGY
  // ========================================
  const gtmPlannerData = state.gtmPlanner;
  const hasGTMData = gtmPlannerData.gtmId && gtmPlannerData.productRoadmap?.businessName;
  
  console.log("GTM Planner check:", {
    gtmId: gtmPlannerData.gtmId,
    hasBusinessName: !!gtmPlannerData.productRoadmap?.businessName,
    hasGTMData
  });
  
  if (hasGTMData) {
    addModuleSeparator(doc, "Go-To-Market Strategy", pageWidth, [13, 148, 136]);
    addGTMPlannerContent(doc, gtmPlannerData, false);
  }

  // ========================================
  // SUMMARY: Log what was included
  // ========================================
  const includedModules = {
    planBuilder: hasPlanData,
    socialCanvas: hasCanvasData,
    problemTree: hasProblemTreeData,
    ecosystemMapping: hasEcosystemData,
    marketSizing: hasValidMarketData,
    pricingLab: hasValidPricingData,
    unitEconomics: hasUnitEconData,
    financialModeler: hasFinancialData,
    gtmPlanner: hasGTMData
  };
  
  console.log("=== PDF EXPORT SUMMARY ===");
  console.log("Modules included in PDF:", includedModules);
  console.log("Total pages:", doc.getNumberOfPages());
  console.log("========================");

  // Add footer to all pages using shared function
  addFooterToAllPages(doc, "Comprehensive Report");

  return doc;
};
