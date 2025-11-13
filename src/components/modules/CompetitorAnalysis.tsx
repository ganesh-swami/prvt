import React, { useState, useEffect, Fragment } from "react";
import { FeatureGuard } from "@/components/common/FeatureGuard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompetitors,
  addCompetitor as addCompetitorAction,
  deleteCompetitor as deleteCompetitorAction,
  setProjectId,
  setNewCompetitor,
  resetNewCompetitor,
  selectCompetitors,
  selectNewCompetitor,
  selectLoading,
  selectSaving,
  selectError,
  selectLastSaved,
} from "@/store/slices/competitorSlice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Eye,
  BarChart3,
  ExternalLink,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { SaveButtons } from "@/components/common/SaveButtons";
import { CustomTooltip } from "@/components/common/CustomTooltip";

interface Competitor {
  id: string;
  name: string;
  website: string;
  pricing: number;
  features: string[];
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  description: string;
}

interface CompetitorAnalysisProps {
  projectId: string;
}

const CompetitorAnalysisContent: React.FC<{ projectId?: string }> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();

  // Redux state
  const competitors = useAppSelector(selectCompetitors);
  const newCompetitor = useAppSelector(selectNewCompetitor);
  const loading = useAppSelector(selectLoading);
  const saving = useAppSelector(selectSaving);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Load competitors on mount
  useEffect(() => {
    if (projectId) {
      dispatch(setProjectId(projectId));
      dispatch(fetchCompetitors(projectId));
    }
  }, [projectId, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const addCompetitor = async () => {
    if (!newCompetitor.name) {
      toast.error("Please enter a competitor name");
      return;
    }

    try {
      await dispatch(
        addCompetitorAction({ projectId, competitor: newCompetitor })
      ).unwrap();
      toast.success("Competitor added successfully!");
      dispatch(resetNewCompetitor());
    } catch (err) {
      toast.error("Failed to add competitor");
      console.error("Error adding competitor:", err);
    }
  };

  const removeCompetitor = async (id: string) => {
    try {
      await dispatch(deleteCompetitorAction(id)).unwrap();
      toast.success("Competitor deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete competitor");
      console.error("Error deleting competitor:", err);
    }
  };

  const pricingData = competitors.map((c) => ({
    name: c.name,
    pricing: c.pricing,
    marketShare: c.marketShare,
  }));

  const featureComparison = competitors.map((c) => ({
    name: c.name,
    features: c.features.length,
    strengths: c.strengths.length,
    weaknesses: c.weaknesses.length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CustomTooltip content="Analyze your competitors to identify market opportunities and differentiation strategies">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 cursor-help">
                Competitor Analysis
              </h1>
            </CustomTooltip>
            {loading && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Loading...
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Analyze competitors to identify differentiation opportunities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <BarChart3 className="w-4 h-4 mr-1" />
            {competitors.length} Competitors
          </Badge>
          {lastSaved && (
            <div className="text-xs text-muted-foreground">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add">Add Competitor</TabsTrigger>
          <TabsTrigger value="charts">Comparative Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {competitors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Competitors Yet
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Start analyzing your competition by adding competitors. Click
                  the "Add Competitor" tab to get started.
                </p>
                {/* <Button
                  onClick={() => {
                    const addTab = document.querySelector('[value="add"]');
                    if (addTab instanceof HTMLElement) {
                      addTab.click();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Competitor
                </Button> */}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {competitor.name}
                        <Badge variant="outline">
                          ${competitor.pricing}/mo
                        </Badge>
                      </CardTitle>
                      {competitor.website && (
                        <a
                          href={
                            competitor.website.startsWith("http")
                              ? competitor.website
                              : `https://${competitor.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          {competitor.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetitor(competitor.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {competitor.description && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-900 mb-1 block">
                          Description
                        </Label>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {competitor.description}
                        </p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Features</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competitor.features.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-green-700">
                          Strengths
                        </Label>
                        <ul className="text-sm text-gray-600 mt-1">
                          {competitor.strengths.map((strength, idx) => (
                            <li key={idx}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-red-700">
                          Weaknesses
                        </Label>
                        <ul className="text-sm text-gray-600 mt-1">
                          {competitor.weaknesses.map((weakness, idx) => (
                            <li key={idx}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Competitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-left block mb-1.5">
                    Company Name
                  </Label>
                  <Input
                    id="name"
                    value={newCompetitor.name || ""}
                    onChange={(e) =>
                      dispatch(setNewCompetitor({ name: e.target.value }))
                    }
                    placeholder="Enter competitor name"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-left block mb-1.5">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={newCompetitor.website || ""}
                    onChange={(e) =>
                      dispatch(setNewCompetitor({ website: e.target.value }))
                    }
                    placeholder="competitor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="pricing" className="text-left block mb-1.5">
                    Monthly Pricing ($)
                  </Label>
                  <Input
                    id="pricing"
                    type="number"
                    value={newCompetitor.pricing || ""}
                    onChange={(e) =>
                      dispatch(
                        setNewCompetitor({ pricing: Number(e.target.value) })
                      )
                    }
                    placeholder="99"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="marketShare"
                    className="text-left block mb-1.5"
                  >
                    Market Share (%)
                  </Label>
                  <Input
                    id="marketShare"
                    type="number"
                    value={newCompetitor.marketShare || ""}
                    onChange={(e) =>
                      dispatch(
                        setNewCompetitor({
                          marketShare: Number(e.target.value),
                        })
                      )
                    }
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-left block mb-1.5">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newCompetitor.description || ""}
                  onChange={(e) =>
                    dispatch(setNewCompetitor({ description: e.target.value }))
                  }
                  placeholder="Brief description of the competitor"
                />
              </div>

              <Button
                onClick={addCompetitor}
                className="w-full"
                disabled={saving}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Adding..." : "Add Competitor"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {competitors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Data to Display
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Add competitors to see comparative charts and analytics.
                </p>
                <Button
                  onClick={() => {
                    const addTab = document.querySelector('[value="add"]');
                    if (addTab instanceof HTMLElement) {
                      addTab.click();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Competitor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pricingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="pricing" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Share</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pricingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="marketShare" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={featureComparison}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Features"
                        dataKey="features"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Strengths"
                        dataKey="strengths"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const CompetitorAnalysis: React.FC<{ projectId?: string }> = (props) => {
  return (
    <FeatureGuard
      featureId="competitor-analysis"
      featureName="Competitor Analysis"
      description="Analyze your competitors' strengths, weaknesses, and market positioning"
    >
      <CompetitorAnalysisContent {...props} />
    </FeatureGuard>
  );
};
