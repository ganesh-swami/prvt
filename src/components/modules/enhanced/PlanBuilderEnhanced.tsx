import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import SaveDraftButton from "@/components/common/SaveDraftButton";
import { allPlanSections } from "./PlanBuilderSectionsComplete";
import { supabase } from "@/lib/supabase";

const PlanBuilderEnhanced: React.FC = () => {
  const [activeSection, setActiveSection] = useState("executive");
  const [businessPlanID, setBusinessPlanID] = useState<string | null>(null);
  const [planData, setPlanData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [sections, setSections] = useState(allPlanSections);

  const completedCount = sections.filter((s) => s.completed).length;
  const progressPercentage = (completedCount / sections.length) * 100;

  const updateFieldValue = (
    sectionId: string,
    fieldId: string,
    value: string
  ) => {
    console.log("sectionId", sectionId);
    console.log("fieldId", fieldId);
    console.log("value", value);
    setPlanData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value,
      },
    }));
  };

  const markSectionComplete = async (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, completed: true } : section
    );

    console.log("updatedSections", updatedSections);

    console.log("supabase", supabase);

    // // @ts-expect-error
    // window.supabase = supabase;

    console.log("before query", { url: import.meta.env.VITE_SUPABASE_URL });
    const startedAt = performance.now();
    try {
      const { data, error } = await supabase.from("Temp").select("*");
      console.log("after query (ms)", performance.now() - startedAt, {
        data,
        error,
      });
    } catch (e) {
      console.error("query threw", e);
    }

    try {
      if (!businessPlanID) {
        // Create new business_plan
        console.log("Creating new business plan");
        const { data, error } = await supabase
          .from("business_plans")
          .insert([{ plan_builder: updatedSections }])
          .select()
          .single();

        console.error("Error creating business plan:", error);
        if (error) throw error;

        if (data) {
          setBusinessPlanID(data.id);
          // Update local state with the new ID
          setSections(updatedSections);
        }
      } else {
        // Update existing business_plan
        const { error } = await supabase
          .from("business_plans")
          .update({
            plan_builder: updatedSections,
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessPlanID);

        if (error) throw error;

        // Update local state
        setSections(updatedSections);
      }
    } catch (error) {
      console.error("Error saving business plan:", error);
      // Optionally show error to user
    }
  };

  useEffect(() => {
    const temp = async () => {
      console.log("=== Starting test ===");
      try {
        console.log("user checking");

        const { data: Temp, error } = await supabase.from("Temp").select("*");

        // const { data, error } = await supabase.auth.getSession();
        console.log("data;;;;;;", Temp, error);
      } catch (e) {
        console.error("user check failed:", e);
      }

      console.log("=== Test complete ===");
    };

    temp();
  }, []);

  const activeData = sections.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Plan Builder
          </h1>
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
                  onClick={() => setActiveSection(section.id)}
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
                      value={planData[activeSection]?.[field.id] || ""}
                      onChange={(e) =>
                        updateFieldValue(
                          activeSection,
                          field.id,
                          e.target.value
                        )
                      }
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={planData[activeSection]?.[field.id] || ""}
                      onChange={(e) =>
                        updateFieldValue(
                          activeSection,
                          field.id,
                          e.target.value
                        )
                      }
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-between pt-4">
                <SaveDraftButton
                  moduleKey="planBuilder"
                  moduleData={planData[activeSection] || {}}
                />
                <Button
                  onClick={() => markSectionComplete(activeSection)}
                  className="bg-green-600 hover:bg-green-700"
                >
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
