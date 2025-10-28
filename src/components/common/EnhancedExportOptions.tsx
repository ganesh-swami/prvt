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
  exportToJSON,
  exportToExcel,
  exportToPDF,
  exportToWord,
  exportToPNG,
  exportAllFormats,
  type CanvasExportData,
} from "@/utils/canvasExportUtils";

interface EnhancedExportOptionsProps {
  data: Record<string, any>;
  projectName?: string;
  canvasName: string;
  completionPercentage?: number;
  visualElementId?: string;
  metadata?: Record<string, any>;
}

export const EnhancedExportOptions: React.FC<EnhancedExportOptionsProps> = ({
  data,
  projectName = "My Project",
  canvasName,
  completionPercentage = 0,
  visualElementId,
  metadata,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Transform canvas data to export format
  const prepareExportData = (): CanvasExportData => {
    // Extract sections from data
    const sections = Object.entries(data).map(([key, value]) => ({
      id: key,
      title: formatFieldName(key),
      fields: [
        {
          id: key,
          label: formatFieldName(key),
          value: typeof value === "string" ? value : JSON.stringify(value),
        },
      ],
    }));

    return {
      projectName,
      canvasName,
      exportDate: new Date().toLocaleDateString(),
      completionPercentage,
      sections,
      metadata: {
        lastUpdated: new Date().toLocaleDateString(),
        ...metadata,
      },
    };
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const exportData = prepareExportData();

      switch (format) {
        case "json":
          exportToJSON(exportData);
          toast.success("JSON exported successfully");
          break;
        case "excel":
          exportToExcel(exportData);
          toast.success("Excel file exported successfully");
          break;
        case "pdf":
          exportToPDF(exportData);
          toast.success("PDF exported successfully");
          break;
        case "word":
          exportToWord(exportData);
          toast.success("Word document exported successfully");
          break;
        case "png":
          if (visualElementId) {
            await exportToPNG(visualElementId, `${projectName}-${canvasName}`);
            toast.success("PNG image exported successfully");
          } else {
            toast.error("Visual element not available for export");
          }
          break;
        case "all":
          await exportAllFormats(exportData, visualElementId);
          toast.success("All formats exported successfully");
          break;
        default:
          toast.error("Unknown export format");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${format.toUpperCase()}`);
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
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          <span>Export as PDF</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isExporting}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          <span>Export as Excel</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("word")}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          <span>Export as Word</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
        >
          <FileJson className="h-4 w-4 mr-2 text-purple-600" />
          <span>Export as JSON</span>
        </DropdownMenuItem>

        {visualElementId && (
          <DropdownMenuItem
            onClick={() => handleExport("png")}
            disabled={isExporting}
          >
            <Image className="h-4 w-4 mr-2 text-orange-600" />
            <span>Export as PNG</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport("all")}
          disabled={isExporting}
          className="font-semibold"
        >
          <Package className="h-4 w-4 mr-2 text-indigo-600" />
          <span>Export All Formats</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Utility to format field names
const formatFieldName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
