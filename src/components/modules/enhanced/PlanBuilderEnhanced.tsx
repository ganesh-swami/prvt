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

const PlanBuilderEnhanced: React.FC = () => {
  const [activeSection, setActiveSection] = useState("executive");
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

  const markSectionComplete = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, completed: true } : section
      )
    );
  };

  useEffect(() => {
    console.log("planData", planData);
  }, [planData]);

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
