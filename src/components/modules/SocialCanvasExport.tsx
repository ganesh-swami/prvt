import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Image,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  transformSocialCanvasData,
  socialCanvasSectionConfigs,
} from "@/utils/socialCanvasExportAdapter";

interface SocialCanvasExportProps {
  canvasData: Record<string, string>;
  projectName?: string;
  completionPercentage: number;
}

export const SocialCanvasExport: React.FC<SocialCanvasExportProps> = ({
  canvasData,
  projectName = "My Project",
  completionPercentage,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const exportData = transformSocialCanvasData(
        canvasData,
        projectName,
        completionPercentage,
        socialCanvasSectionConfigs
      );

      // Dynamic imports to avoid loading heavy libraries until needed
      switch (format) {
        case "json": {
          const { exportToJSON } = await import("@/utils/canvasExportUtils");
          exportToJSON(exportData);
          toast.success("JSON exported successfully");
          break;
        }
        case "excel": {
          const { exportToExcel } = await import("@/utils/canvasExportUtils");
          exportToExcel(exportData);
          toast.success("Excel file exported successfully");
          break;
        }
        case "pdf": {
          const { exportToPDF } = await import("@/utils/canvasExportUtils");
          exportToPDF(exportData);
          toast.success("PDF exported successfully");
          break;
        }
        case "word": {
          const { exportToWord } = await import("@/utils/canvasExportUtils");
          exportToWord(exportData);
          toast.success("Word document exported successfully");
          break;
        }
        case "png": {
          const { exportToPNG } = await import("@/utils/canvasExportUtils");
          const elementId = "social-canvas-builder";
          await exportToPNG(elementId, `${projectName}-social-canvas`);
          toast.success("PNG image exported successfully");
          break;
        }
        case "all": {
          const { exportAllFormats } = await import("@/utils/canvasExportUtils");
          await exportAllFormats(exportData, "social-canvas-builder");
          toast.success("All formats exported successfully");
          break;
        }
        default:
          toast.error("Unknown export format");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        `Failed to export ${format.toUpperCase()}. Please ensure all required packages are installed.`
      );
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
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-sm font-semibold">
          Export Social Canvas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-3 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PDF</span>
            <span className="text-xs text-gray-500">Beautiful formatted document</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as Excel</span>
            <span className="text-xs text-gray-500">Multi-sheet workbook</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("word")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-3 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as Word</span>
            <span className="text-xs text-gray-500">Editable document</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileJson className="h-4 w-4 mr-3 text-purple-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as JSON</span>
            <span className="text-xs text-gray-500">Structured data format</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("png")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-3 text-orange-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PNG</span>
            <span className="text-xs text-gray-500">Visual canvas image</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport("all")}
          disabled={isExporting}
          className="cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
        >
          <Package className="h-4 w-4 mr-3 text-indigo-600" />
          <div className="flex flex-col">
            <span className="font-semibold">Export All Formats</span>
            <span className="text-xs text-gray-500">Download everything</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
