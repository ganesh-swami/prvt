import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { ExportOptions } from "@/components/common/ExportOptions";
import SocialBusinessCanvasPart2 from "./SocialBusinessCanvasPart2";
import SocialCanvasVisualization from "./SocialCanvasVisualization";
import SocialCanvasSummary from "./SocialCanvasSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const SocialBusinessCanvas: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const canvasData = useAppSelector(selectCanvasData);
  const isLoading = useAppSelector(selectIsLoading);
  const isSaving = useAppSelector(selectIsSaving);
  const error = useAppSelector(selectError);
  const isDirty = useAppSelector(selectIsDirty);
  const completionPercentage = useAppSelector(selectCompletionPercentage);

  // TODO: Replace with actual project selection logic
  const TEMP_PROJECT_ID = "666c94d4-4f2e-4b78-94d3-bfef5754eaeb";

  // Initialize and fetch data
  useEffect(() => {
    if (TEMP_PROJECT_ID) {
      dispatch(setProjectId(TEMP_PROJECT_ID));
      dispatch(fetchSocialCanvas({ projectId: TEMP_PROJECT_ID }));
    }
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Auto-save functionality (optional - save every 30 seconds if dirty)
  useEffect(() => {
    if (!isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      dispatch(saveSocialCanvas());
      toast.success("Auto-saved");
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [isDirty, dispatch]);

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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-pink-600" />
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
          <ExportOptions
            data={canvasData}
            filename="social-business-canvas"
            moduleName="Social Business Canvas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Social Mission */}
        <Card className="lg:col-span-3 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Social Mission</span>
              <CustomTooltip content="Your social mission statement. Use eight words or less: a verb, clear target group, and action. How will you know you have succeeded?" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Empower rural women through sustainable microfinance solutions"
              value={canvasData.socialMission}
              onChange={(e) =>
                handleInputChange("socialMission", e.target.value)
              }
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* Key Delivery Partners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Key Delivery Partners</span>
              <CustomTooltip content="Who are your key partners that help you deliver? Think about strategic alliances, joint ventures, supplier relationships, and key partnerships that enable your social business model." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Local NGOs, community leaders, microfinance institutions, technology partners"
              value={canvasData.keyDeliveryPartners}
              onChange={(e) =>
                handleInputChange("keyDeliveryPartners", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Key Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Key Activities</span>
              <CustomTooltip content="What key activities does your social value proposition require? Think about production, problem-solving, platform/network activities that are essential to deliver your social impact." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Training programs, loan processing, impact monitoring, community outreach"
              value={canvasData.keyActivities}
              onChange={(e) =>
                handleInputChange("keyActivities", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Social Impact Measurement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Social Impact Measurement</span>
              <CustomTooltip content="How do you measure your social impact? Define your measurement indicators, beneficiaries, and funding stakeholders. Include both quantitative metrics and qualitative assessments." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Number of women trained, income increase %, loan repayment rates, community satisfaction scores"
              value={canvasData.socialImpactMeasurement}
              onChange={(e) =>
                handleInputChange("socialImpactMeasurement", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Value Proposition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Social Value Proposition</span>
              <CustomTooltip content="What social value do you deliver to your beneficiaries and customers? Describe the bundle of products and services that create social value for a specific beneficiary segment." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Accessible financial services that enable economic empowerment and poverty reduction in underserved communities"
              value={canvasData.socialValueProposition}
              onChange={(e) =>
                handleInputChange("socialValueProposition", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-pink-600" />
              <span>Relationships</span>
              <CustomTooltip content="What type of relationship does each beneficiary segment expect you to establish and maintain? Consider personal assistance, self-service, automated services, communities, co-creation." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Personal mentorship, peer support groups, digital self-service platform, community networks"
              value={canvasData.relationships}
              onChange={(e) =>
                handleInputChange("relationships", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      {/* Include Part 2 Components */}
      <SocialBusinessCanvasPart2
        canvasData={canvasData}
        handleInputChange={handleInputChange}
      />

      {/* Financial Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PESTEL Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Macro-Environmental PESTEL Analysis</span>
              <CustomTooltip content="Analyze Political, Economic, Social, Technological, Environmental, and Legal factors that may impact your social business. Consider external factors that could affect your operations and impact." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Political: Government support for financial inclusion; Economic: Rural income volatility; Social: Cultural attitudes toward women's financial independence; Technological: Mobile penetration rates; Environmental: Climate change impact on agriculture; Legal: Microfinance regulations"
              value={canvasData.pestelAnalysis}
              onChange={(e) =>
                handleInputChange("pestelAnalysis", e.target.value)
              }
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Costs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <span>Costs</span>
              <CustomTooltip content="What are the most important costs inherent in your social business model? Include program costs, product/service costs, fundraising costs, and operational expenses." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Staff salaries, training programs, technology platform, loan capital, marketing, compliance, impact measurement"
              value={canvasData.costs}
              onChange={(e) => handleInputChange("costs", e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Surplus */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Surplus</span>
              <CustomTooltip content="How do you handle surplus/profit? Consider reinvestment in programs, donations to related causes, reserves for sustainability, or expansion funding." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., 70% reinvested in program expansion, 20% for operational reserves, 10% donated to partner NGOs"
              value={canvasData.surplus}
              onChange={(e) => handleInputChange("surplus", e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Revenue</span>
              <CustomTooltip content="What are your revenue streams? Include funding sources (grants, donations, awards), tradable income from services/products, and any other income sources that sustain your social business." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Interest from microloans, training fees, impact investor funding, government grants, corporate sponsorships"
              value={canvasData.revenue}
              onChange={(e) => handleInputChange("revenue", e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      {/* Visualization and Summary Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visualization">Canvas Visualization</TabsTrigger>
          <TabsTrigger value="summary">Progress Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <SocialCanvasVisualization canvasData={canvasData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary" className="mt-4">
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

export default SocialBusinessCanvas;
