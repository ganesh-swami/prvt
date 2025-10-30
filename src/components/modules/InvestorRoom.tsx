import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { exportEnhancedFinancialModel } from "../../utils/financialModelExport";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ModuleSummaries } from "./ModuleSummaries";
import { useModuleSummaries } from "../../hooks/useModuleSummaries";
import { exportToPDFWithCharts } from "../../utils/enhancedExportUtils";
import { exportToPowerPoint } from "../../utils/powerpointExport";
import { generatePitchDeck } from "../../utils/pitchDeckExport";
import { exportFinancialModel } from "../../utils/financialModelExport";
import { generateComprehensiveModulePDF } from "../../utils/comprehensiveModulePDFExport";
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  PieChart,
  Target,
  Calendar,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectResults as selectFinancialResults,
  selectProjectId as selectFinancialProjectId,
  loadLatestModel,
} from "@/store/slices/financialModelerSlice";
import {
  selectMetrics as selectUnitEconomicsMetrics,
  selectProjectId as selectUnitEconomicsProjectId,
  loadLatestUnitEconomics,
} from "@/store/slices/unitEconomicsSlice";
import {
  selectMilestones,
  selectMilestonesLoading,
  selectMilestonesSaving,
  loadMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/store/slices/investorRoomSlice";
import { Milestone } from "@/types";
import { useEffect } from "react";

interface CapTableEntry {
  id: string;
  shareholder: string;
  shares: number;
  percentage: number;
  type: "common" | "preferred" | "options";
}

interface InvestorRoomProps {
  projectId?: string | null;
}

export const InvestorRoom: React.FC<InvestorRoomProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { summaries } = useModuleSummaries(projectId || undefined);

  // Get real data from Redux
  const financialResults = useAppSelector(selectFinancialResults);
  const financialProjectId = useAppSelector(selectFinancialProjectId);
  const unitEconomicsMetrics = useAppSelector(selectUnitEconomicsMetrics);
  const unitEconomicsProjectId = useAppSelector(selectUnitEconomicsProjectId);
  const milestones = useAppSelector(selectMilestones);
  const milestonesLoading = useAppSelector(selectMilestonesLoading);
  const milestonesSaving = useAppSelector(selectMilestonesSaving);

  // Fetch data if not already loaded (backup in case hook doesn't load)
  useEffect(() => {
    if (projectId) {
      if (!financialProjectId) {
        dispatch(loadLatestModel(projectId));
      }
      if (!unitEconomicsProjectId) {
        dispatch(loadLatestUnitEconomics(projectId));
      }
      // Load milestones
      dispatch(loadMilestones(projectId));
    }
  }, [projectId, financialProjectId, unitEconomicsProjectId, dispatch]);

  // Calculate key metrics from real data
  const monthlyRevenue = financialResults.totalRevenue
    ? Math.round(
        financialResults.totalRevenue /
          (financialResults.monthlyProjections?.length || 12)
      )
    : 0;
  const activeUsers = parseFloat(unitEconomicsMetrics.numberOfCustomers) || 0;
  const burnRate = financialResults.totalOperatingExpenses
    ? Math.round(
        financialResults.totalOperatingExpenses /
          (financialResults.monthlyProjections?.length || 12)
      )
    : 0;

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});

  const [capTable, setCapTable] = useState<CapTableEntry[]>([
    {
      id: "1",
      shareholder: "Founders",
      shares: 7000000,
      percentage: 70,
      type: "common",
    },
    {
      id: "2",
      shareholder: "Seed Investors",
      shares: 2000000,
      percentage: 20,
      type: "preferred",
    },
    {
      id: "3",
      shareholder: "Employee Pool",
      shares: 1000000,
      percentage: 10,
      type: "options",
    },
  ]);

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    target_date: "",
    status: "pending" as const,
    progress: 0,
  });

  const addMilestone = async () => {
    if (!projectId || !newMilestone.title || !newMilestone.target_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and target date",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        createMilestone({
          project_id: projectId,
          title: newMilestone.title,
          description: newMilestone.description || undefined,
          target_date: new Date(newMilestone.target_date).toISOString(),
          status: newMilestone.status,
          progress: newMilestone.progress,
        })
      ).unwrap();

      setNewMilestone({
        title: "",
        description: "",
        target_date: "",
        status: "pending",
        progress: 0,
      });
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create milestone",
        variant: "destructive",
      });
    }
  };

  const startEdit = (milestone: Milestone) => {
    setEditingId(milestone.id);
    setEditForm(milestone);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.title || !editForm.target_date) return;

    try {
      await dispatch(
        updateMilestone({
          id: editingId,
          updates: editForm,
        })
      ).unwrap();

      setEditingId(null);
      setEditForm({});
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    try {
      await dispatch(deleteMilestone(id)).unwrap();
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    }
  };

  const handleExportToPDF = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import store to get state
      const { store } = await import("@/store");
      
      const doc = await generateComprehensiveModulePDF(
        dispatch,
        store.getState,
        {
          projectId,
          projectName: "Comprehensive Business Report",
        }
      );

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`comprehensive-report-${timestamp}.pdf`);

      toast({
        title: "Success",
        description: "Comprehensive PDF exported successfully!",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportToPowerPoint = () => {
    const exportData = {
      metrics: {
        revenue: monthlyRevenue,
        users: activeUsers,
        burnRate: burnRate,
      },
      capTable,
      milestones,
      moduleSummaries: summaries,
    };
    exportToPowerPoint(exportData, summaries, "Investor Presentation");
  };

  const handleGeneratePitchDeck = () => {
    const companyData = {
      companyName: "Your Company",
      tagline: "Revolutionizing the industry",
      revenue: monthlyRevenue,
      users: activeUsers,
      growth: financialResults.netMargin || 0,
      fundingAmount: 500000,
    };
    generatePitchDeck(summaries, companyData);
  };

  const handleFinancialModelExport = () => {
    const companyData = {
      companyName: "Your Company",
      revenue: monthlyRevenue,
      burnRate: burnRate,
    };
    exportEnhancedFinancialModel(summaries, companyData);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Investor Room</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportToPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportToPowerPoint}>
            <Download className="w-4 h-4 mr-2" />
            Export PPT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          {/* <TabsTrigger value="cap-table">Cap Table</TabsTrigger> */}
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Investor Update
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold">
                          {monthlyRevenue > 0
                            ? `$${monthlyRevenue.toLocaleString()}`
                            : "No data"}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold">
                          {activeUsers > 0
                            ? activeUsers.toLocaleString()
                            : "No data"}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Burn Rate</p>
                        <p className="text-2xl font-bold">
                          {burnRate > 0
                            ? `$${burnRate.toLocaleString()}`
                            : "No data"}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Textarea
                placeholder="Add key highlights, challenges, and next steps..."
                className="min-h-[100px]"
              />
              <Button>Generate Update Report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          <ModuleSummaries />
        </TabsContent>

        {/* <TabsContent value="cap-table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Capitalization Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capTable.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{entry.shareholder}</p>
                      <p className="text-sm text-gray-600">
                        {entry.shares.toLocaleString()} shares
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.type === "preferred" ? "default" : "secondary"
                        }
                      >
                        {entry.type}
                      </Badge>
                      <span className="font-bold">{entry.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Milestone Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestonesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : milestones.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No milestones yet. Add your first milestone below.
                </p>
              ) : (
                milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    {editingId === milestone.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor="edit-title"
                            className="text-left block mb-1.5"
                          >
                            Title
                          </Label>
                          <Input
                            id="edit-title"
                            value={editForm.title || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="edit-description"
                            className="text-left block mb-1.5"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="edit-description"
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label
                              htmlFor="edit-date"
                              className="text-left block mb-1.5"
                            >
                              Target Date
                            </Label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={
                                editForm.target_date
                                  ? new Date(editForm.target_date)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  target_date: new Date(
                                    e.target.value
                                  ).toISOString(),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="edit-status"
                              className="text-left block mb-1.5"
                            >
                              Status
                            </Label>
                            <Select
                              value={editForm.status}
                              onValueChange={(
                                value: "pending" | "in-progress" | "completed"
                              ) => setEditForm({ ...editForm, status: value })}
                            >
                              <SelectTrigger id="edit-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor="edit-progress"
                              className="text-left block mb-1.5"
                            >
                              Progress (%)
                            </Label>
                            <Input
                              id="edit-progress"
                              type="number"
                              min="0"
                              max="100"
                              value={editForm.progress || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  progress: Math.min(
                                    100,
                                    Math.max(0, parseInt(e.target.value) || 0)
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={saveEdit}
                            disabled={milestonesSaving}
                            size="sm"
                          >
                            {milestonesSaving ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                            disabled={milestonesSaving}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-lg">
                                {milestone.title}
                              </h3>
                              <Badge
                                variant={
                                  milestone.status === "completed"
                                    ? "default"
                                    : milestone.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  milestone.target_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEdit(milestone)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(milestone.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {milestone.progress}%
                            </span>
                          </div>
                          <Progress
                            value={milestone.progress}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Add New Milestone</h4>
                <div>
                  <Label htmlFor="new-title" className="text-left block mb-1.5">
                    Title*
                  </Label>
                  <Input
                    id="new-title"
                    placeholder="e.g., Launch Beta Version"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="new-description"
                    className="text-left block mb-1.5"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="new-description"
                    placeholder="Add details about this milestone..."
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="new-date" className="text-left block mb-1.5">
                    Target Date*
                  </Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newMilestone.target_date}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        target_date: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={addMilestone}
                  disabled={milestonesSaving}
                  className="w-full sm:w-auto"
                >
                  {milestonesSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Add Milestone
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pitch-deck" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pitch Deck Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Generate investor-ready pitch decks with real-time data
                integration.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGeneratePitchDeck}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Pitch Deck
                </Button>
                <Button variant="outline" onClick={handleFinancialModelExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Financial Model Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
