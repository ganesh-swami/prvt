import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { Dashboard } from "./modules/Dashboard";
import { PlanBuilder } from "./modules/PlanBuilder";
// import { MarketSizing } from "./modules/MarketSizing";
import MarketSizingEnhanced from "./modules/enhanced/MarketSizingEnhanced";
import PricingLab from "./modules/PricingLab";
import PricingLabEnhanced from "./modules/enhanced/PricingLabEnhanced";
import UnitEconomics from "./modules/UnitEconomics";
import FinancialModeler from "./modules/FinancialModeler";
import { default as FinancialModelerEnhanced } from "./modules/enhanced/FinancialModelerEnhanced";
import PlanBuilderEnhanced from "./modules/enhanced/PlanBuilderEnhanced";
import UnitEconomicsEnhanced from "./modules/enhanced/UnitEconomicsEnhanced";
import SocialBusinessCanvasImproved from "./modules/SocialBusinessCanvasImproved";
import ProblemTree from "./modules/ProblemTree";
import EcosystemMapping from "./modules/EcosystemMapping";
import EcosystemMappingEnhanced from "./modules/enhanced/EcosystemMappingEnhanced";
import RiskCenter from "./modules/RiskCenter";
import ESGComplianceTracking from "./modules/ESGComplianceTracking";
import { CompetitorAnalysis } from "./modules/CompetitorAnalysis";
import { InvestorRoom } from "./modules/InvestorRoom";
import DraftsAndPlans from "./modules/DraftsAndPlans";
import TeamCollaboration from "./modules/TeamCollaboration";
import { GTMPlanner } from "./modules/GTMPlanner";
import { TemplateMarketplace } from "./templates/TemplateMarketplace";
import { CreatorPortal } from "./templates/CreatorPortal";
import AnalyticsDashboard from "./admin/AnalyticsDashboard";
import OrgAnalyticsDashboard from "./admin/OrgAnalyticsDashboard";
import { PricingModule } from "./modules/PricingModule";
import Projects from "./Projects";

export const MainContent: React.FC = () => {
  const { currentModule } = useAppContext();
  const { currentProjectId } = useCurrentProject();

  const renderModule = () => {
    // If no project is selected, show project selection message for modules that need it
    if (!currentProjectId && ["market-sizing", "pricing", "unit-economics", "financial", "competitor-analysis", "risk-center", "gtm", "team-collaboration"].includes(currentModule)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">No Project Selected</h2>
            <p className="text-muted-foreground mb-6">
              Please create or select a project from the Projects page to use this module.
            </p>
          </div>
        </div>
      );
    }

    switch (currentModule) {
      case "dashboard":
        return <Dashboard />;
      case "plan-builder":
        return <PlanBuilderEnhanced projectId={currentProjectId} />;
      case "social-canvas":
        return <SocialBusinessCanvasImproved projectId={currentProjectId} />;
      case "problem-tree":
        return <ProblemTree projectId={currentProjectId} />;
      case "ecosystem-mapping":
        return <EcosystemMappingEnhanced projectId={currentProjectId} />;
      case "market-sizing":
        return <MarketSizingEnhanced projectId={currentProjectId!} />;
      case "pricing":
        return <PricingLabEnhanced projectId={currentProjectId!} />;
      case "unit-economics":
        return <UnitEconomicsEnhanced projectId={currentProjectId!} />;
      case "financial":
        return <FinancialModelerEnhanced projectId={currentProjectId!} />;
      case "competitor-analysis":
        return <CompetitorAnalysis projectId={currentProjectId!} />;
      case "investor-room":
        return <InvestorRoom projectId={currentProjectId} />;
      case "risk-center":
        return <RiskCenter projectId={currentProjectId!} />;
      case "esg-compliance":
        return <ESGComplianceTracking />;
      case "drafts-and-plans":
        return <DraftsAndPlans />;
      case "projects":
        return <Projects />;
      case "team-collaboration":
        return <TeamCollaboration projectId={currentProjectId!} />;
      case "gtm":
        return <GTMPlanner projectId={currentProjectId!} />;
      case "templates":
        return <TemplateMarketplace />;
      case "creator-portal":
        return <CreatorPortal />;
      case "admin-analytics":
        return <AnalyticsDashboard />;
      case "org-analytics":
        return <OrgAnalyticsDashboard />;
      case "pricing-module":
        return <PricingModule />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">{renderModule()}</div>
    </main>
  );
};
