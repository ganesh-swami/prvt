import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Image, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Title Page with gradient effect
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(0, 0, pageWidth, 70, "F");

      // Add decorative line
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Problem Tree Analysis", pageWidth / 2, 25, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Visual Analysis Export • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Helper function to add section header
      const addSectionHeader = (title: string, color: number[], icon: string) => {
        // Add extra space before section
        if (yPos > 85) {
          yPos += 8;
        }

        // Check if need new page
        if (yPos > pageHeight - 90) {
          doc.addPage();
          yPos = 20;
        }

        // Add shadow effect
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(margin + 1, yPos + 1, contentWidth, 14, 3, 3, "F");

        // Section header with colored background
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

        // Add icon-like circle on left
        doc.setFillColor(255, 255, 255);
        doc.circle(margin + 5, yPos + 7, 2.5, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 10, yPos + 9.5);

        yPos += 20;
      };

      // Helper function to add field
      const addField = (label: string, content: string) => {
        // Check if need new page
        if (yPos > pageHeight - 55) {
          doc.addPage();
          yPos = 20;
        }

        // Field label with bullet
        doc.setFillColor(100, 116, 139);
        doc.circle(margin + 2, yPos + 2, 1.2, "F");

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 5, yPos + 3);

        yPos += 7;

        // Content box
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const text = content || "Not defined yet";
        const lines = doc.splitTextToSize(text, contentWidth - 10);

        // Calculate box height
        const lineHeight = 5;
        const minBoxHeight = 12;
        const calculatedHeight = lines.length * lineHeight + 8;
        const boxHeight = Math.min(
          Math.max(calculatedHeight, minBoxHeight),
          50
        );

        // Draw content box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(
          margin + 2,
          yPos,
          contentWidth - 4,
          boxHeight,
          2,
          2,
          "F"
        );

        // Add left accent border
        doc.setFillColor(203, 213, 225);
        doc.rect(margin + 2, yPos, 2, boxHeight, "F");

        // Border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(
          margin + 2,
          yPos,
          contentWidth - 4,
          boxHeight,
          2,
          2,
          "S"
        );

        // Add text
        const displayLines = lines.slice(0, 9);
        if (text === "Not defined yet") {
          doc.setTextColor(156, 163, 175);
          doc.setFont("helvetica", "italic");
        }
        doc.text(displayLines, margin + 7, yPos + 6);

        yPos += boxHeight + 6;
      };

      // Effects & Consequences Section
      addSectionHeader("Effects & Consequences", [239, 68, 68], "↑");
      addField("Problem Impact on Society", treeData.problemImpactSociety || "");
      addField("Harms on Direct Beneficiaries", treeData.harmsDirectBeneficiaries || "");
      addField("Effects on Involved Parties", treeData.effectsInvolvedParties || "");

      // Add separator
      yPos += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
      yPos += 3;

      // Core Problem Section
      addSectionHeader("Core Problem", [245, 158, 11], "●");
      addField("Main Problem Statement", treeData.mainProblem || "");

      // Add separator
      yPos += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
      yPos += 3;

      // Root Causes Section
      addSectionHeader("Root Causes", [59, 130, 246], "↓");
      addField("Problem Position & Context", treeData.problemPosition || "");
      addField("Main Underlying Causes", treeData.mainCauses || "");

      // Add separator
      yPos += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
      yPos += 3;

      // Analysis Summary Section
      addSectionHeader("Analysis Summary", [34, 197, 94], "✓");
      addField("Key Insights", treeData.keyInsights || "");
      addField("Strategic Implications", treeData.strategicImplications || "");

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Page number (left)
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);

        // Branding (center)
        doc.setFont("helvetica", "bold");
        doc.setTextColor(139, 92, 246);
        doc.text("Strategize+", pageWidth / 2, pageHeight - 8, {
          align: "center",
        });

        // Date (right)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(
          new Date().toLocaleDateString(),
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`problem-tree-analysis-${timestamp}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const switchToVisualizationTab = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const tabTriggers = document.querySelectorAll('[role="tab"]');
      let visualTabTrigger: HTMLElement | null = null;

      tabTriggers.forEach((trigger) => {
        const triggerElement = trigger as HTMLElement;
        if (triggerElement.textContent?.includes("Visualizations")) {
          visualTabTrigger = triggerElement;
        }
      });

      if (visualTabTrigger) {
        const isActive =
          visualTabTrigger.getAttribute("data-state") === "active";

        if (!isActive) {
          toast.info("Switching to Visualizations tab...");
          visualTabTrigger.click();

          // Wait for tab content to render
          setTimeout(() => {
            resolve(true);
          }, 1000);
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    });
  };

  const captureVisualization = async (): Promise<HTMLCanvasElement | null> => {
    // Try to switch to visualization tab
    const switched = await switchToVisualizationTab();

    if (!switched) {
      toast.warning("Could not switch to Visualizations tab automatically.");
    }

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to find the visualization container
    const element = document.getElementById("problem-tree-visualization-export");
    
    if (!element) {
      toast.error("Unable to load visualizations. Please try again.");
      return null;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(
            "problem-tree-visualization-export"
          );
          if (clonedElement) {
            clonedElement.style.maxHeight = "none";
            clonedElement.style.overflow = "visible";
          }
        },
      });

      return canvas;
    } catch (error) {
      console.error("Error capturing visualization:", error);
      throw error;
    }
  };

  const exportToPNG = async () => {
    setIsExporting(true);
    setExportingFormat("PNG");

    try {
      const canvas = await captureVisualization();
      if (!canvas) {
        setIsExporting(false);
        setExportingFormat(null);
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const timestamp = new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            link.download = `problem-tree-visual-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Visualization exported as PNG successfully!");
          }
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("PNG export error:", error);
      toast.error("Failed to export PNG. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportToJPG = async () => {
    setIsExporting(true);
    setExportingFormat("JPG");

    try {
      const canvas = await captureVisualization();
      if (!canvas) {
        setIsExporting(false);
        setExportingFormat(null);
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const timestamp = new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            link.download = `problem-tree-visual-${timestamp}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Visualization exported as JPG successfully!");
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("JPG export error:", error);
      toast.error("Failed to export JPG. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    setExportingFormat("JSON");

    try {
      const exportData = {
        meta: {
          projectName,
          exportedAt: new Date().toISOString(),
          exportDate: new Date().toLocaleDateString(),
          analysisType: "Problem Tree Analysis",
          version: "1.0",
        },
        sections: {
          effects: {
            problemImpactSociety: treeData.problemImpactSociety || "",
            harmsDirectBeneficiaries: treeData.harmsDirectBeneficiaries || "",
            effectsInvolvedParties: treeData.effectsInvolvedParties || "",
          },
          coreProblem: {
            mainProblem: treeData.mainProblem || "",
          },
          rootCauses: {
            problemPosition: treeData.problemPosition || "",
            mainCauses: treeData.mainCauses || "",
          },
          analysisSummary: {
            keyInsights: treeData.keyInsights || "",
            strategicImplications: treeData.strategicImplications || "",
          },
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.download = `problem-tree-analysis-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("JSON exported successfully!");
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error("Failed to export JSON. Please try again.");
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

        <DropdownMenuItem
          onClick={exportToPNG}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-3 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PNG</span>
            <span className="text-xs text-gray-500">
              High-quality visual screenshot
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={exportToJPG}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-3 text-orange-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as JPG</span>
            <span className="text-xs text-gray-500">
              Compressed image format
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={exportToJSON}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-3 text-purple-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as JSON</span>
            <span className="text-xs text-gray-500">
              Structured data with field IDs
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
