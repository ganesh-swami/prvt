import React from "react";
import { useAppContext } from "@/contexts/AppContext";
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
import SocialBusinessCanvas from "./modules/SocialBusinessCanvasImproved";
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

const TEMP_PROJECT_ID = "790b4b71-f138-47bc-bec1-8be804d7d8c4";

export const MainContent: React.FC = () => {
  const { currentModule } = useAppContext();

  const renderModule = () => {
    switch (currentModule) {
      case "dashboard":
        return <Dashboard />;
      case "plan-builder":
        return <PlanBuilderEnhanced />;
      case "social-canvas":
        return <SocialBusinessCanvas />;
      case "problem-tree":
        return <ProblemTree />;
      case "ecosystem-mapping":
        return <EcosystemMappingEnhanced />;
      case "market-sizing":
        return <MarketSizingEnhanced />;
      case "pricing":
        return <PricingLabEnhanced />;
      case "unit-economics":
        return <UnitEconomicsEnhanced />;
      case "financial":
        return <FinancialModelerEnhanced projectId={TEMP_PROJECT_ID} />;
      case "competitor-analysis":
        return <CompetitorAnalysis projectId={TEMP_PROJECT_ID} />;
      case "investor-room":
        return <InvestorRoom />;
      case "risk-center":
        return <RiskCenter />;
      case "esg-compliance":
        return <ESGComplianceTracking />;
      case "drafts-and-plans":
        return <DraftsAndPlans />;
      case "team-collaboration":
        return <TeamCollaboration />;
      case "gtm":
        return <GTMPlanner />;
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
