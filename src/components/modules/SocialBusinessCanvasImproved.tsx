import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { VisualCanvasExportImproved } from "./VisualCanvasExportImproved";
import SocialCanvasVisualization from "./SocialCanvasVisualization";
import SocialCanvasSummary from "./SocialCanvasSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  Globe,
  DollarSign,
  Loader2,
  Save,
  Circle,
  Briefcase,
  Heart,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSocialCanvas,
  saveSocialCanvas,
  setProjectId,
  updateField,
  selectCanvasData,
  selectIsLoading,
  selectIsSaving,
  selectError,
  selectIsDirty,
  selectCompletionPercentage,
  type SocialCanvasData,
} from "@/store/slices/socialCanvasSlice";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Field groups configuration
const FIELD_GROUPS = [
  {
    id: "core",
    title: "Core Purpose & Value",
    icon: Heart,
    color: "text-rose-800",
    bgColor: "bg-rose-50/50",
    borderColor: "border-rose-200",
    description: "Define your mission, value proposition, and relationships",
    fields: [
      {
        id: "socialMission",
        label: "Social Mission",
        icon: Target,
        iconColor: "text-green-600",
        placeholder:
          "e.g., Empower rural women through sustainable microfinance solutions",
        tooltip:
          "Your social mission statement. Use eight words or less: a verb, clear target group, and action. How will you know you have succeeded?",
        rows: 3,
      },
      {
        id: "socialValueProposition",
        label: "Social Value Proposition",
        icon: Lightbulb,
        iconColor: "text-yellow-600",
        placeholder:
          "e.g., Accessible financial services that enable economic empowerment and poverty reduction in underserved communities",
        tooltip:
          "What social value do you deliver to your beneficiaries and customers? Describe the bundle of products and services that create social value for a specific beneficiary segment.",
        rows: 4,
      },
      {
        id: "relationships",
        label: "Relationships",
        icon: Users,
        iconColor: "text-pink-600",
        placeholder:
          "e.g., Personal mentorship, peer support groups, digital self-service platform, community networks",
        tooltip:
          "What type of relationship does each beneficiary segment expect you to establish and maintain? Consider personal assistance, self-service, automated services, communities, co-creation.",
        rows: 4,
      },
    ],
  },
  {
    id: "operations",
    title: "Operations & Resources",
    icon: Briefcase,
    color: "text-blue-800",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-200",
    description: "Define your key partners, activities, and resources",
    fields: [
      {
        id: "keyDeliveryPartners",
        label: "Key Delivery Partners",
        icon: Users,
        iconColor: "text-blue-600",
        placeholder:
          "e.g., Local NGOs, community leaders, microfinance institutions, technology partners",
        tooltip:
          "Who are your key partners that help you deliver? Think about strategic alliances, joint ventures, supplier relationships, and key partnerships that enable your social business model.",
        rows: 4,
      },
      {
        id: "keyActivities",
        label: "Key Activities",
        icon: TrendingUp,
        iconColor: "text-purple-600",
        placeholder:
          "e.g., Training programs, loan processing, impact monitoring, community outreach",
        tooltip:
          "What key activities does your social value proposition require? Think about production, problem-solving, platform/network activities that are essential to deliver your social impact.",
        rows: 4,
      },
      {
        id: "keyResources",
        label: "Key Resources",
        icon: TrendingUp,
        iconColor: "text-emerald-600",
        placeholder:
          "e.g., Trained staff, technology platform, funding capital, community trust, regulatory licenses, impact measurement tools",
        tooltip:
          "What key resources does your social value proposition require? Think about physical, intellectual, human, and financial resources that are essential to your social business model.",
        rows: 4,
      },
    ],
  },
  {
    id: "market",
    title: "Market & Impact",
    icon: BarChart3,
    color: "text-purple-800",
    bgColor: "bg-purple-50/50",
    borderColor: "border-purple-200",
    description: "Define your market, stakeholders, and impact measurement",
    fields: [
      {
        id: "impactGapAnalysis",
        label: "Impact Gap Analysis",
        icon: Target,
        iconColor: "text-red-600",
        placeholder:
          "e.g., 60% of rural women lack access to financial services, limiting economic opportunities and perpetuating poverty cycles",
        tooltip:
          "Pre-work analysis identifying the gap between current state and desired social impact. What problems exist that your social business aims to solve?",
        rows: 4,
      },
      {
        id: "socialImpactMeasurement",
        label: "Social Impact Measurement",
        icon: Shield,
        iconColor: "text-green-600",
        placeholder:
          "e.g., Number of women trained, income increase %, loan repayment rates, community satisfaction scores",
        tooltip:
          "How do you measure your social impact? Define your measurement indicators, beneficiaries, and funding stakeholders. Include both quantitative metrics and qualitative assessments.",
        rows: 4,
      },
      {
        id: "keyStakeholders",
        label: "Key Stakeholders",
        icon: Users,
        iconColor: "text-indigo-600",
        placeholder:
          "e.g., Rural women (beneficiaries), local government, impact investors, community elders, regulatory bodies",
        tooltip:
          "Who are the people that you need to partner with? Who are the people who can help or hinder your operations? Include beneficiaries, funders, partners, regulators, and community leaders.",
        rows: 4,
      },
      {
        id: "channels",
        label: "Channels",
        icon: Globe,
        iconColor: "text-cyan-600",
        placeholder:
          "e.g., Community centers, mobile apps, local agents, social media, word-of-mouth, partner networks",
        tooltip:
          "Through which channels do you want to reach your beneficiaries and customers? How do you raise awareness, help customers evaluate, allow purchase, deliver, and provide post-purchase support?",
        rows: 4,
      },
      {
        id: "competitorsCompetition",
        label: "Competitors & Competition",
        icon: Shield,
        iconColor: "text-orange-600",
        placeholder:
          "e.g., Traditional banks, other microfinance institutions, government welfare programs, informal lending networks",
        tooltip:
          "Who are your main competitors in the social impact space? Include other social businesses, traditional businesses, NGOs, and government programs addressing similar issues.",
        rows: 4,
      },
    ],
  },
  {
    id: "pestel",
    title: "Macro-Environmental Analysis",
    icon: Globe,
    color: "text-purple-800",
    bgColor: "bg-purple-50/50",
    borderColor: "border-purple-200",
    description:
      "Analyze external factors that may impact your social business",
    fields: [
      {
        id: "pestelAnalysis",
        label: "Macro-Environmental PESTEL Analysis",
        icon: Globe,
        iconColor: "text-purple-600",
        placeholder:
          "e.g., Political: Government support for financial inclusion; Economic: Rural income volatility; Social: Cultural attitudes toward women's financial independence; Technological: Mobile penetration rates; Environmental: Climate change impact on agriculture; Legal: Microfinance regulations",
        tooltip:
          "Analyze Political, Economic, Social, Technological, Environmental, and Legal factors that may impact your social business. Consider external factors that could affect your operations and impact.",
        rows: 5,
      },
    ],
  },
  {
    id: "financial",
    title: "Financial Model",
    icon: DollarSign,
    color: "text-green-800",
    bgColor: "bg-green-50/50",
    borderColor: "border-green-200",
    description: "Define your financial model and revenue streams",
    fields: [
      {
        id: "costs",
        label: "Costs",
        icon: DollarSign,
        iconColor: "text-red-600",
        placeholder:
          "e.g., Staff salaries, training programs, technology platform, loan capital, marketing, compliance, impact measurement",
        tooltip:
          "What are the most important costs inherent in your social business model? Include program costs, product/service costs, fundraising costs, and operational expenses.",
        rows: 4,
      },
      {
        id: "surplus",
        label: "Surplus",
        icon: TrendingUp,
        iconColor: "text-green-600",
        placeholder:
          "e.g., 70% reinvested in program expansion, 20% for operational reserves, 10% donated to partner NGOs",
        tooltip:
          "How do you handle surplus/profit? Consider reinvestment in programs, donations to related causes, reserves for sustainability, or expansion funding.",
        rows: 4,
      },
      {
        id: "revenue",
        label: "Revenue",
        icon: DollarSign,
        iconColor: "text-blue-600",
        placeholder:
          "e.g., Interest from microloans, training fees, impact investor funding, government grants, corporate sponsorships",
        tooltip:
          "What are your revenue streams? Include funding sources (grants, donations, awards), tradable income from services/products, and any other income sources that sustain your social business.",
        rows: 4,
      },
    ],
  },
];

interface SocialBusinessCanvasProps {
  projectId?: string | null;
}

const SocialBusinessCanvasImproved: React.FC<SocialBusinessCanvasProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const canvasData = useAppSelector(selectCanvasData);
  const isLoading = useAppSelector(selectIsLoading);
  const isSaving = useAppSelector(selectIsSaving);
  const error = useAppSelector(selectError);
  const isDirty = useAppSelector(selectIsDirty);
  const completionPercentage = useAppSelector(selectCompletionPercentage);

  // Local state for accordion (all open by default)
  const [openSections, setOpenSections] = useState<string[]>(["core"]);

  // Initialize and fetch data
  useEffect(() => {
    if (projectId) {
      dispatch(setProjectId(projectId));
      dispatch(fetchSocialCanvas({ projectId }));
    }
  }, [dispatch, projectId]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Auto-save functionality (disabled by default, uncomment to enable)
  // useEffect(() => {
  //   if (!isDirty) return;
  //   const autoSaveTimer = setTimeout(() => {
  //     dispatch(saveSocialCanvas());
  //     toast.success("Auto-saved");
  //   }, 30000);
  //   return () => clearTimeout(autoSaveTimer);
  // }, [isDirty, dispatch]);

  const handleInputChange = (field: keyof SocialCanvasData, value: string) => {
    dispatch(updateField({ field, value }));
  };

  const handleManualSave = async () => {
    try {
      await dispatch(saveSocialCanvas()).unwrap();
      toast.success("Social canvas saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save social canvas";
      toast.error(errorMessage);
    }
  };

  // Calculate completion per group
  const getGroupCompletion = (fields: (typeof FIELD_GROUPS)[0]["fields"]) => {
    const filled = fields.filter(
      (field) => canvasData[field.id as keyof SocialCanvasData]?.trim() !== ""
    ).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Show loading state
  if (isLoading && !canvasData.socialMission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="mt-2 text-gray-600">Loading social canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Social Business Model Canvas
            </h1>
            <p className="text-gray-600">
              Design and visualize your social impact business model •{" "}
              <span className="font-semibold text-green-600">
                {completionPercentage}% Complete
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isDirty && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <Circle className="h-2 w-2 fill-amber-600" />
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
            variant="outline"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <VisualCanvasExportImproved
            projectName={projectId || "My Project"}
            canvasData={canvasData}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="builder"
        className="w-full"
        id="social-canvas-container"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Canvas Builder
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visual Canvas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Canvas Builder with Grouped Sections */}
        <TabsContent
          value="builder"
          className="mt-6"
          id="social-canvas-builder"
        >
          <div className="space-y-4">
            <Accordion
              type="multiple"
              value={openSections}
              onValueChange={setOpenSections}
              className="space-y-4"
            >
              {FIELD_GROUPS.map((group) => {
                const completion = getGroupCompletion(group.fields);
                const Icon = group.icon;

                return (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    className={`border-2 ${group.borderColor} rounded-lg overflow-hidden`}
                  >
                    <AccordionTrigger
                      className={`${group.bgColor} px-6 py-4 hover:no-underline`}
                    >
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${group.color}`} />
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {group.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              completion === 100 ? "default" : "secondary"
                            }
                            className="ml-4"
                          >
                            {completion === 100 ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : null}
                            {completion}% Complete
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={`px-6 py-4 ${group.bgColor}`}>
                      <div className="space-y-6">
                        {group.fields.map((field) => {
                          const FieldIcon = field.icon;
                          return (
                            <Card key={field.id} className="shadow-sm">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center space-x-2">
                                  <FieldIcon
                                    className={`w-5 h-5 ${field.iconColor}`}
                                  />
                                  <span className="text-base">
                                    {field.label}
                                  </span>
                                  <CustomTooltip
                                    title={field.tooltip}
                                    description={field.tooltip}
                                  />
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Textarea
                                  placeholder={field.placeholder}
                                  value={
                                    canvasData[
                                      field.id as keyof SocialCanvasData
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      field.id as keyof SocialCanvasData,
                                      e.target.value
                                    )
                                  }
                                  rows={field.rows}
                                  className="resize-none"
                                />
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>

        {/* Tab 2: Visual Canvas */}
        <TabsContent value="visual" className="mt-6" id="visual-canvas-export">
          <Card>
            <CardContent className="pt-6">
              <SocialCanvasVisualization canvasData={canvasData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Analytics Dashboard */}
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <SocialCanvasSummary canvasData={canvasData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialBusinessCanvasImproved;
