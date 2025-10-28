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
  Image,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface VisualCanvasExportProps {
  projectName?: string;
}

export const VisualCanvasExport: React.FC<VisualCanvasExportProps> = ({
  projectName = "My Project",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const switchToVisualTab = async (): Promise<void> => {
    // Find the Visual Canvas tab trigger button
    const tabTriggers = document.querySelectorAll('[role="tab"]');
    let visualTabTrigger: HTMLElement | null = null;

    tabTriggers.forEach((trigger) => {
      if (trigger.textContent?.includes("Visual Canvas")) {
        visualTabTrigger = trigger as HTMLElement;
      }
    });

    if (visualTabTrigger) {
      // Check if tab is already active
      const isActive = visualTabTrigger.getAttribute("data-state") === "active";
      
      if (!isActive) {
        // Notify user that we're switching tabs
        toast.info("Switching to Visual Canvas tab...");
        
        // Click the tab to activate it
        visualTabTrigger.click();
        
        // Wait for tab content to render
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  };

  const captureVisualCanvas = async (): Promise<HTMLCanvasElement | null> => {
    // Auto-switch to Visual Canvas tab if not already active
    await switchToVisualTab();

    const element = document.getElementById("visual-canvas-export");
    if (!element) {
      toast.error("Unable to load visual canvas. Please try again.");
      return null;
    }

    try {
      // Ensure all images and fonts are loaded
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 3, // Higher quality for detailed canvas
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("visual-canvas-export");
          if (clonedElement) {
            // Ensure all content is visible
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
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${sanitizeFilename(projectName)}-social-canvas-visual-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Visual canvas exported as PNG successfully!");
        }
      }, "image/png", 1.0);
    } catch (error) {
      console.error("PNG export error:", error);
      toast.error("Failed to export PNG. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportingFormat("PDF");

    try {
      const canvas = await captureVisualCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Calculate PDF dimensions to fit the canvas
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;

      // A4 dimensions in mm
      const pdfWidth = 297; // A4 landscape width
      const pdfHeight = 210; // A4 landscape height

      let finalWidth = pdfWidth - 20; // margins
      let finalHeight = finalWidth / ratio;

      // If height is too large, scale by height instead
      if (finalHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20;
        finalWidth = finalHeight * ratio;
      }

      const doc = new jsPDF({
        orientation: ratio > 1 ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235); // Blue
      doc.text("Social Business Model Canvas - Visual Overview", 10, 10);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray
      doc.text(projectName, 10, 17);
      doc.text(`Exported: ${new Date().toLocaleDateString()}`, 10, 22);

      // Add canvas image
      doc.addImage(
        imgData,
        "PNG",
        (doc.internal.pageSize.getWidth() - finalWidth) / 2,
        30,
        finalWidth,
        finalHeight
      );

      // Add footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by Strategize+ | ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 10,
        { align: "center" }
      );

      doc.save(`${sanitizeFilename(projectName)}-social-canvas-visual-${Date.now()}.pdf`);
      toast.success("Visual canvas exported as PDF successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
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
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${sanitizeFilename(projectName)}-social-canvas-visual-${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Visual canvas exported as JPG successfully!");
        }
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("JPG export error:", error);
      toast.error("Failed to export JPG. Please try again.");
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
              Export Visual Canvas
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-sm font-semibold">
          Export Visual Canvas
        </DropdownMenuLabel>
        <p className="px-2 py-1 text-xs text-gray-500">
          Automatically captures the visual canvas view
        </p>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={exportToPNG}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-3 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PNG</span>
            <span className="text-xs text-gray-500">
              High-quality image (recommended)
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={exportToPDF}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-3 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Export as PDF</span>
            <span className="text-xs text-gray-500">
              Printable document with canvas
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
