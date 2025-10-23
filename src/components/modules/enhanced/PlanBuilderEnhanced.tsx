import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  ChevronRight,
  FileText,
  Lightbulb,
  Loader2,
  Save,
} from "lucide-react";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { allPlanSections } from "./PlanBuilderSectionsComplete";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPlanBuilder,
  savePlanBuilder,
  markSectionComplete as markSectionCompleteAction,
  setActiveSection,
  setProjectId,
  setSections,
  updateFieldValue as updateFieldValueAction,
  selectPlanBuilder,
  selectActiveSectionData,
  selectProgressPercentage,
  selectIsLoading,
  selectIsSaving,
  selectError,
  selectIsDirty,
} from "@/store/slices/planBuilderSlice";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const PlanBuilderEnhanced: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentOrganization } = useAuth();

  // Redux selectors
  const planBuilder = useAppSelector(selectPlanBuilder);
  const activeData = useAppSelector(selectActiveSectionData);
  const progressPercentage = useAppSelector(selectProgressPercentage);
  const isLoading = useAppSelector(selectIsLoading);
  const isSaving = useAppSelector(selectIsSaving);
  const error = useAppSelector(selectError);
  const isDirty = useAppSelector(selectIsDirty);

  const { activeSection, planData, sections, businessPlanId, projectId } =
    planBuilder;

  // TODO: Replace with actual project selection logic
  // For now, using a hardcoded project ID
  const TEMP_PROJECT_ID = "666c94d4-4f2e-4b78-94d3-bfef5754eaeb";

  // Initialize sections on mount
  useEffect(() => {
    dispatch(setSections(allPlanSections));
  }, [dispatch]);

  // Fetch plan builder data when project ID is set
  useEffect(() => {
    if (TEMP_PROJECT_ID && !projectId) {
      dispatch(setProjectId(TEMP_PROJECT_ID));
      dispatch(fetchPlanBuilder({ projectId: TEMP_PROJECT_ID }));
    }
  }, [dispatch, projectId]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Auto-save functionality (optional - save every 30 seconds if dirty)
  // useEffect(() => {
  //   if (!isDirty) return;

  //   const autoSaveTimer = setTimeout(() => {
  //     dispatch(savePlanBuilder());
  //     toast.success("Auto-saved");
  //   }, 30000); // 30 seconds

  //   return () => clearTimeout(autoSaveTimer);
  // }, [isDirty, dispatch, planData]);

  const handleSectionChange = (sectionId: string) => {
    dispatch(setActiveSection(sectionId));
  };

  const handleFieldUpdate = (fieldId: string, value: string) => {
    dispatch(
      updateFieldValueAction({
        sectionId: activeSection,
        fieldId,
        value,
      })
    );
  };

  const handleMarkComplete = async () => {
    try {
      await dispatch(markSectionCompleteAction(activeSection)).unwrap();
      toast.success("Section marked as complete and saved!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark section complete";
      toast.error(errorMessage);
    }
  };

  const handleManualSave = async () => {
    try {
      await dispatch(savePlanBuilder()).unwrap();
      toast.success("Plan saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save plan";
      toast.error(errorMessage);
    }
  };

  // Show loading state
  if (isLoading && !businessPlanId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading plan builder...</p>
        </div>
      </div>
    );
  }

  const completedCount = sections.filter((s) => s.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Plan Builder
          </h1>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 h-[70vh] overflow-y-auto scrollbar-hide">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {section.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span
                      className={`font-medium text-sm ${
                        activeSection === section.id
                          ? "text-blue-900"
                          : "text-gray-700"
                      }`}
                    >
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Progress
              </div>
              <Progress value={progressPercentage} className="mb-2" />
              <div className="text-xs text-gray-600">
                {completedCount} of {sections.length} sections complete
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{activeData?.title}</CardTitle>
                <Button size="sm" variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  AI Assist
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeData?.fields.map((field) => (
                <div key={field.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <CustomTooltip {...field.tooltip} />
                  </div>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={
                        typeof planData[activeSection]?.[field.id] === "string"
                          ? (planData[activeSection][field.id] as string)
                          : ""
                      }
                      onChange={(e) =>
                        handleFieldUpdate(field.id, e.target.value)
                      }
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={
                        typeof planData[activeSection]?.[field.id] === "string"
                          ? (planData[activeSection][field.id] as string)
                          : ""
                      }
                      onChange={(e) =>
                        handleFieldUpdate(field.id, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving || !isDirty}
                  variant="outline"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleMarkComplete}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanBuilderEnhanced;
