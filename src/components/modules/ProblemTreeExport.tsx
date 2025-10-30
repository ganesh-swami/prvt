import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPDFInstance,
  addTitlePage,
  addFooterToAllPages,
  downloadPDF,
} from "@/utils/pdfUtils";
import { addProblemTreeContent } from "@/utils/modulePDFExports";

interface ProblemTreeData {
  problemImpactSociety?: string;
  harmsDirectBeneficiaries?: string;
  effectsInvolvedParties?: string;
  mainProblem?: string;
  problemPosition?: string;
  mainCauses?: string;
  keyInsights?: string;
  strategicImplications?: string;
}

interface ProblemTreeExportProps {
  projectName?: string;
  treeData: ProblemTreeData;
}

export const ProblemTreeExport: React.FC<ProblemTreeExportProps> = ({
  projectName = "My Project",
  treeData,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const exportToPDFFromData = async () => {
    setIsExporting(true);
    setExportingFormat("PDF");

    try {
      // Create PDF using shared utilities
      let doc = createPDFInstance();
      doc = addTitlePage(
        doc,
        "Problem Tree Analysis",
        "Visual Analysis Export",
        [139, 92, 246]
      );
      doc = addProblemTreeContent(doc, treeData, false);
      doc = addFooterToAllPages(doc, "Problem Tree Analysis");
      downloadPDF(doc, "problem-tree-analysis");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting {exportingFormat}...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={exportToPDFFromData}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-3 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PDF</span>
            <span className="text-xs text-gray-500">
              Professional document (recommended)
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
