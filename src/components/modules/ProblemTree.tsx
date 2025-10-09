import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { ExportOptions } from "@/components/common/ExportOptions";
import SaveButtons from "@/components/common/SaveButtons";
import { TreePine, ArrowUp, ArrowDown, BarChart3, Eye } from "lucide-react";
import ProblemTreeVisualizations from "./ProblemTreeVisualizations";
import ProblemTreeAnalytics from "./ProblemTreeAnalytics";
const ProblemTree: React.FC = () => {
  const [effects, setEffects] = useState<string[]>([]);
  const [coreProblem, setCoreProblem] = useState<string>("");
  const [causes, setCauses] = useState<string[]>([]);
  const [problemTreeData, setProblemTreeData] = useState({
    problemImpactSociety: "",
    harmsDirectBeneficiaries: "",
    effectsInvolvedParties: "",
    mainProblem: "",
    problemPosition: "",
    mainCauses: "",
    keyInsights: "",
    strategicImplications: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setProblemTreeData((prev) => ({ ...prev, [field]: value }));
    if (field === "mainProblem") {
      setCoreProblem(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Problem Tree Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Analyze root causes and effects of problems to develop targeted
            solutions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons moduleKey="problem-tree" moduleData={problemTreeData} />
        </div>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger
            value="visualizations"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Visualizations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          {/* Effects/Consequences Section */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">
                  Effects & Consequences
                </CardTitle>
              </div>
              <CardDescription>
                The negative impacts and consequences that result from the main
                problem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="problemImpactSociety">
                    Problem Impact on Society
                  </Label>
                  <CustomTooltip content="Broader societal effects and systemic impacts. Example: 'Increased inequality, reduced economic productivity, social unrest, environmental degradation'" />
                </div>
                <Textarea
                  id="problemImpactSociety"
                  value={problemTreeData.problemImpactSociety}
                  onChange={(e) =>
                    handleInputChange("problemImpactSociety", e.target.value)
                  }
                  placeholder="e.g., Increased inequality, reduced economic productivity, environmental degradation..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="harmsDirectBeneficiaries">
                    Harms on Direct Beneficiaries
                  </Label>
                  <CustomTooltip content="Direct negative impacts on the people you aim to help. Example: 'Poor health outcomes, limited opportunities, financial stress, social exclusion'" />
                </div>
                <Textarea
                  id="harmsDirectBeneficiaries"
                  value={problemTreeData.harmsDirectBeneficiaries}
                  onChange={(e) =>
                    handleInputChange(
                      "harmsDirectBeneficiaries",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Poor health outcomes, limited opportunities, financial stress..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="effectsInvolvedParties">
                    Effects on Involved Parties
                  </Label>
                  <CustomTooltip content="How the problem affects stakeholders, partners, and other involved parties. Example: 'Increased costs for healthcare systems, reduced investor confidence, strained community resources'" />
                </div>
                <Textarea
                  id="effectsInvolvedParties"
                  value={problemTreeData.effectsInvolvedParties}
                  onChange={(e) =>
                    handleInputChange("effectsInvolvedParties", e.target.value)
                  }
                  placeholder="e.g., Increased costs for systems, reduced confidence, strained resources..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Problem Section */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-800">Core Problem</CardTitle>
              </div>
              <CardDescription>
                The central issue that your social business aims to address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="mainProblem">Main Problem Statement</Label>
                  <CustomTooltip content="Clear, specific statement of the core problem. Should be neutral, focused on the issue not the solution. Example: 'Lack of access to clean water in rural communities leads to preventable diseases'" />
                </div>
                <Textarea
                  id="mainProblem"
                  value={problemTreeData.mainProblem}
                  onChange={(e) =>
                    handleInputChange("mainProblem", e.target.value)
                  }
                  placeholder="e.g., Lack of access to clean water in rural communities leads to preventable diseases"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Root Causes Section */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800">Root Causes</CardTitle>
              </div>
              <CardDescription>
                The underlying factors and systemic issues that create and
                perpetuate the problem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="problemPosition">
                    Problem Position & Context
                  </Label>
                  <CustomTooltip content="Where and how the problem manifests, including geographic, demographic, and situational context. Example: 'Remote rural areas with limited infrastructure, affecting low-income families, particularly women and children'" />
                </div>
                <Textarea
                  id="problemPosition"
                  value={problemTreeData.problemPosition}
                  onChange={(e) =>
                    handleInputChange("problemPosition", e.target.value)
                  }
                  placeholder="e.g., Remote rural areas with limited infrastructure, affecting low-income families..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="mainCauses">Main Underlying Causes</Label>
                  <CustomTooltip content="The fundamental reasons why the problem exists. Include structural, economic, social, and political factors. Example: 'Inadequate government investment, geographic isolation, poverty, lack of technical expertise, climate change impacts'" />
                </div>
                <Textarea
                  id="mainCauses"
                  value={problemTreeData.mainCauses}
                  onChange={(e) =>
                    handleInputChange("mainCauses", e.target.value)
                  }
                  placeholder="e.g., Inadequate investment, geographic isolation, poverty, lack of expertise..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Tree Analysis Summary</CardTitle>
              <CardDescription>
                Key insights and strategic implications from your problem
                analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="keyInsights">Key Insights</Label>
                  <CustomTooltip content="Main learnings from the analysis that will inform your solution design" />
                  <Textarea
                    id="keyInsights"
                    value={problemTreeData.keyInsights}
                    onChange={(e) =>
                      handleInputChange("keyInsights", e.target.value)
                    }
                    placeholder="What are the most important insights from this analysis?"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="strategicImplications">
                    Strategic Implications
                  </Label>
                  <CustomTooltip content="How these insights should influence your business model and intervention strategy" />
                  <Textarea
                    id="strategicImplications"
                    value={problemTreeData.strategicImplications}
                    onChange={(e) =>
                      handleInputChange("strategicImplications", e.target.value)
                    }
                    placeholder="How will these insights shape your approach?"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizations" className="mt-6">
          <ProblemTreeVisualizations
            effects={
              effects.length > 0
                ? effects
                : ["Societal Impact", "Direct Harm", "Stakeholder Effects"]
            }
            coreProblem={coreProblem || "Core Problem Statement"}
            causes={
              causes.length > 0
                ? causes
                : ["Root Cause 1", "Root Cause 2", "Root Cause 3"]
            }
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProblemTreeAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemTree;
