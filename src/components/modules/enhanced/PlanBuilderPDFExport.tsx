import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlanSection } from "./PlanBuilderSectionsComplete";
import {
  createPDFInstance,
  addTitlePage,
  addFooterToAllPages,
  downloadPDF,
} from "@/utils/pdfUtils";
import { addPlanBuilderContent } from "@/utils/modulePDFExports";

interface PlanBuilderPDFExportProps {
  sections: PlanSection[];
  planData: Record<string, Record<string, string | boolean>>;
  projectName?: string;
}

export const PlanBuilderPDFExport: React.FC<PlanBuilderPDFExportProps> = ({
  sections,
  planData,
  projectName = "Business Plan",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      // Create PDF using shared utilities - chain functions together
      let doc = createPDFInstance();

      // Add title page
      doc = addTitlePage(doc, "Business Plan", projectName, [59, 130, 246]);

      // Add plan content
      doc = addPlanBuilderContent(doc, sections, planData, false);

      // Add footer to all pages
      doc = addFooterToAllPages(doc, "Business Plan");

      // Download PDF
      downloadPDF(doc, `business-plan-${projectName}`);

      toast.success("Business Plan exported as PDF successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isExporting}
      onClick={exportToPDF}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Export PDF
        </>
      )}
    </Button>
  );
};
