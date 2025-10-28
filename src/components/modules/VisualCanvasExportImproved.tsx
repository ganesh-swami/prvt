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
import { FileDown, Image, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CanvasData {
  socialMission?: string;
  keyDeliveryPartners?: string;
  keyActivities?: string;
  socialImpactMeasurement?: string;
  socialValueProposition?: string;
  relationships?: string;
  impactGapAnalysis?: string;
  keyStakeholders?: string;
  channels?: string;
  competitorsCompetition?: string;
  keyResources?: string;
  pestelAnalysis?: string;
  costs?: string;
  surplus?: string;
  revenue?: string;
}

interface VisualCanvasExportImprovedProps {
  projectName?: string;
  canvasData: CanvasData;
}

export const VisualCanvasExportImproved: React.FC<
  VisualCanvasExportImprovedProps
> = ({ projectName = "My Project", canvasData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const fieldGroups = [
    {
      title: "Core Purpose & Value",
      color: [244, 63, 94], // Rose
      fields: [
        { key: "socialMission", label: "Social Mission" },
        { key: "socialValueProposition", label: "Social Value Proposition" },
        { key: "relationships", label: "Relationships" },
      ],
    },
    {
      title: "Operations & Resources",
      color: [59, 130, 246], // Blue
      fields: [
        { key: "keyDeliveryPartners", label: "Key Delivery Partners" },
        { key: "keyActivities", label: "Key Activities" },
        { key: "keyResources", label: "Key Resources" },
      ],
    },
    {
      title: "Market & Impact",
      color: [168, 85, 247], // Purple
      fields: [
        { key: "impactGapAnalysis", label: "Impact Gap Analysis" },
        { key: "socialImpactMeasurement", label: "Social Impact Measurement" },
        { key: "keyStakeholders", label: "Key Stakeholders" },
        { key: "channels", label: "Channels" },
        { key: "competitorsCompetition", label: "Competitors & Competition" },
      ],
    },
    {
      title: "Macro-Environmental Analysis",
      color: [168, 85, 247], // Purple
      fields: [
        {
          key: "pestelAnalysis",
          label:
            "PESTEL Analysis (Political, Economic, Social, Technological, Environmental, Legal)",
        },
      ],
    },
    {
      title: "Financial Model",
      color: [34, 197, 94], // Green
      fields: [
        { key: "costs", label: "Cost Structure" },
        { key: "surplus", label: "Surplus/Profit Allocation" },
        { key: "revenue", label: "Revenue Streams" },
      ],
    },
  ];

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

      // Title Page with gradient effect (using multiple rectangles)
      doc.setFillColor(37, 99, 235); // Darker blue
      doc.rect(0, 0, pageWidth, 70, "F");

      // Add decorative line
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Social Business Model Canvas", pageWidth / 2, 25, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Visual Canvas Export • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Helper function to add group header
      const addGroupHeader = (title: string, color: number[]) => {
        // Add extra space before group (except first group)
        if (yPos > 85) {
          yPos += 8;
        }

        // Check if need new page
        if (yPos > pageHeight - 90) {
          doc.addPage();
          yPos = 20;
        }

        // Add subtle shadow effect with offset rectangle
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(margin + 1, yPos + 1, contentWidth, 14, 3, 3, "F");

        // Group header with colored background
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

        // Field label with icon bullet
        doc.setFillColor(100, 116, 139);
        doc.circle(margin + 2, yPos + 2, 1.2, "F");

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 5, yPos + 3);

        yPos += 7;

        // Content box with border
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const text = content || "Not defined yet";
        const lines = doc.splitTextToSize(text, contentWidth - 10);

        // Calculate box height with padding
        const lineHeight = 5;
        const minBoxHeight = 12;
        const calculatedHeight = lines.length * lineHeight + 8;
        const boxHeight = Math.min(
          Math.max(calculatedHeight, minBoxHeight),
          50
        );

        // Draw content box with gradient-like effect
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

        // Add text with proper padding
        const displayLines = lines.slice(0, 9);
        if (text === "Not defined yet") {
          doc.setTextColor(156, 163, 175);
          doc.setFont("helvetica", "italic");
        }
        doc.text(displayLines, margin + 7, yPos + 6);

        yPos += boxHeight + 6;
      };

      // Add all groups and their fields
      fieldGroups.forEach((group, groupIndex) => {
        addGroupHeader(group.title, group.color);

        group.fields.forEach((field) => {
          const content = canvasData[field.key as keyof CanvasData] || "";
          addField(field.label, content);
        });

        // Add separator line between groups (except last group)
        if (groupIndex < fieldGroups.length - 1) {
          yPos += 3;
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
          yPos += 3;
        }
      });

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
        doc.setTextColor(59, 130, 246);
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
      doc.save(`social-business-canvas-${timestamp}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const switchToVisualTab = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const tabTriggers = document.querySelectorAll('[role="tab"]');
      let visualTabTrigger: HTMLElement | null = null;

      tabTriggers.forEach((trigger) => {
        const triggerElement = trigger as HTMLElement;
        if (triggerElement.textContent?.includes("Visual Canvas")) {
          visualTabTrigger = triggerElement;
        }
      });

      if (visualTabTrigger) {
        const isActive =
          visualTabTrigger.getAttribute("data-state") === "active";

        if (!isActive) {
          toast.info("Switching to Visual Canvas tab...");
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

  const captureVisualCanvas = async (): Promise<HTMLCanvasElement | null> => {
    // Try to switch to visual tab
    const switched = await switchToVisualTab();

    if (!switched) {
      toast.warning("Could not switch to Visual Canvas tab automatically.");
    }

    // Wait a bit more for rendering
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = document.getElementById("visual-canvas-export");
    if (!element) {
      toast.error("Visual canvas not found. Creating PDF from data instead...");
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
            "visual-canvas-export"
          );
          if (clonedElement) {
            clonedElement.style.maxHeight = "none";
            clonedElement.style.overflow = "visible";
          }
        },
      });

      return canvas;
    } catch (error) {
      console.error("Error capturing canvas:", error);
      throw error;
    }
  };

  const exportToPNG = async () => {
    setIsExporting(true);
    setExportingFormat("PNG");

    try {
      const canvas = await captureVisualCanvas();
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
            link.download = `social-canvas-visual-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Visual canvas exported as PNG successfully!");
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
      const canvas = await captureVisualCanvas();
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
            link.download = `social-canvas-visual-${timestamp}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Visual canvas exported as JPG successfully!");
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
          canvasType: "Social Business Model Canvas",
          version: "1.0",
        },
        groups: fieldGroups.map((group) => ({
          title: group.title,
          fields: group.fields.reduce((acc, field) => {
            acc[field.key] = {
              label: field.label,
              value: canvasData[field.key as keyof CanvasData] || "",
            };
            return acc;
          }, {} as Record<string, { label: string; value: string }>),
        })),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.download = `social-business-canvas-${timestamp}.json`;
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

  const sanitizeFilename = (name: string): string => {
    return name
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
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
        {/* <DropdownMenuLabel className="text-sm font-semibold">
          Export
        </DropdownMenuLabel> */}

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
