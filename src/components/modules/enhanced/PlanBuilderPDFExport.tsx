import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { PlanSection } from "./PlanBuilderSectionsComplete";

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

      // Title Page
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 70, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Business Plan", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${projectName} • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Helper function to add section header
      const addSectionHeader = (title: string, color: number[] = [59, 130, 246]) => {
        // Check if need new page
        if (yPos > pageHeight - 90) {
          doc.addPage();
          yPos = 20;
        }

        // Add extra space before section (except first)
        if (yPos > 85) {
          yPos += 8;
        }

        // Section header with colored background
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

        // Add decorative circle
        doc.setFillColor(255, 255, 255);
        doc.circle(margin + 5, yPos + 7, 2.5, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 10, yPos + 9.5);

        yPos += 20;
      };

      // Helper function to add field (subsection)
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
        doc.setFontSize(9);

        const text = content || "";
        if (!text.trim()) {
          return; // Skip empty fields
        }

        const lines = doc.splitTextToSize(text, contentWidth - 10);

        // Calculate box height
        const lineHeight = 5;
        const minBoxHeight = 12;
        const calculatedHeight = lines.length * lineHeight + 8;
        const boxHeight = Math.min(
          Math.max(calculatedHeight, minBoxHeight),
          60
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
        doc.setFillColor(59, 130, 246);
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
        const displayLines = lines.slice(0, 12);
        doc.text(displayLines, margin + 7, yPos + 6);

        yPos += boxHeight + 6;
      };

      // Process all sections
      sections.forEach((section) => {
        const sectionData = planData[section.id] || {};
        const sectionHasContent = section.fields.some(field => {
          const value = sectionData[field.id];
          return typeof value === 'string' && value.trim().length > 0;
        });

        // Skip empty sections
        if (!sectionHasContent) {
          return;
        }

        // Add section header
        addSectionHeader(section.title);

        // Add all fields in the section
        section.fields.forEach((field) => {
          const value = sectionData[field.id];
          if (typeof value === 'string' && value.trim()) {
            addField(field.label, value);
          }
        });
      });

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("Business Plan", pageWidth / 2, pageHeight - 8, {
          align: "center",
        });

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
      doc.save(`business-plan-${timestamp}.pdf`);
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
