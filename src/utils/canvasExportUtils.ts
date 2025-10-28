import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

export interface CanvasSection {
  id: string;
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

export interface CanvasExportData {
  projectName: string;
  canvasName: string;
  exportDate: string;
  completionPercentage: number;
  sections: CanvasSection[];
  metadata?: {
    lastUpdated?: string;
    version?: string;
    [key: string]: any;
  };
}

/**
 * Generate structured JSON export with proper formatting
 */
export const exportToJSON = (data: CanvasExportData): void => {
  const exportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      canvasName: data.canvasName,
      projectName: data.projectName,
      completionPercentage: data.completionPercentage,
      version: "1.0",
      ...data.metadata,
    },
    sections: data.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      fields: section.fields.reduce((acc, field) => {
        acc[field.id] = {
          label: field.label,
          value: field.value || "",
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
  link.download = `${sanitizeFilename(data.projectName)}-${sanitizeFilename(data.canvasName)}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate Excel export with multiple sheets and formatting
 */
export const exportToExcel = (data: CanvasExportData): void => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Canvas Export Summary"],
    [],
    ["Project Name", data.projectName],
    ["Canvas Type", data.canvasName],
    ["Export Date", data.exportDate],
    ["Completion", `${data.completionPercentage}%`],
    ["Last Updated", data.metadata?.lastUpdated || "N/A"],
    [],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Create a sheet for each section
  data.sections.forEach((section) => {
    const sectionData = [
      [section.title],
      [section.description || ""],
      [],
      ["Field", "Value"],
      ...section.fields.map((field) => [field.label, field.value || ""]),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(sectionData);

    // Set column widths
    sheet["!cols"] = [{ wch: 30 }, { wch: 60 }];

    const sheetName = sanitizeSheetName(section.title);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  });

  // All Data Sheet (consolidated)
  const allData = [
    ["Section", "Field", "Value"],
    ...data.sections.flatMap((section) =>
      section.fields.map((field) => [
        section.title,
        field.label,
        field.value || "",
      ])
    ),
  ];

  const allDataSheet = XLSX.utils.aoa_to_sheet(allData);
  allDataSheet["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, allDataSheet, "All Data");

  // Write file
  XLSX.writeFile(
    workbook,
    `${sanitizeFilename(data.projectName)}-${sanitizeFilename(data.canvasName)}-${Date.now()}.xlsx`
  );
};

/**
 * Generate beautiful PDF with proper formatting and sections
 */
export const exportToPDF = (data: CanvasExportData): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Title Page
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(data.canvasName, pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(data.projectName, pageWidth / 2, 35, { align: "center" });

  // Info Box
  yPosition = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Export Date: ${data.exportDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(
    `Completion: ${data.completionPercentage}%`,
    margin,
    yPosition
  );
  yPosition += 6;
  if (data.metadata?.lastUpdated) {
    doc.text(`Last Updated: ${data.metadata.lastUpdated}`, margin, yPosition);
    yPosition += 6;
  }

  // Progress Bar
  yPosition += 5;
  const barWidth = 100;
  const barHeight = 6;
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPosition, barWidth, barHeight);
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(
    margin,
    yPosition,
    (barWidth * data.completionPercentage) / 100,
    barHeight,
    "F"
  );

  yPosition += 15;

  // Sections
  data.sections.forEach((section, sectionIndex) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section Header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 12, "F");
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin + 3, yPosition + 3);
    yPosition += 12;

    if (section.description) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(107, 114, 128);
      const descLines = doc.splitTextToSize(section.description, contentWidth - 6);
      doc.text(descLines, margin + 3, yPosition);
      yPosition += descLines.length * 4 + 3;
    }

    // Fields Table
    const tableData = section.fields.map((field) => [
      field.label,
      field.value || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: contentWidth - 50 },
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  const finalY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated by Strategize+ on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    finalY,
    { align: "center" }
  );

  // Save
  doc.save(
    `${sanitizeFilename(data.projectName)}-${sanitizeFilename(data.canvasName)}-${Date.now()}.pdf`
  );
};

/**
 * Export visual canvas as PNG image
 */
export const exportToPNG = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${sanitizeFilename(filename)}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error("Error generating PNG:", error);
    throw error;
  }
};

/**
 * Export as Word document (DOCX format using HTML conversion)
 */
export const exportToWord = (data: CanvasExportData): void => {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #1f2937; background-color: #f3f4f6; padding: 10px; margin-top: 20px; }
        .meta { background-color: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin-bottom: 20px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #374151; }
        .field-value { margin-top: 5px; padding: 10px; background-color: #f9fafb; border-left: 3px solid #d1d5db; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${data.canvasName}</h1>
      
      <div class="meta">
        <p><strong>Project:</strong> ${data.projectName}</p>
        <p><strong>Export Date:</strong> ${data.exportDate}</p>
        <p><strong>Completion:</strong> ${data.completionPercentage}%</p>
        ${data.metadata?.lastUpdated ? `<p><strong>Last Updated:</strong> ${data.metadata.lastUpdated}</p>` : ""}
      </div>
  `;

  data.sections.forEach((section) => {
    htmlContent += `
      <div class="section">
        <h2>${section.title}</h2>
        ${section.description ? `<p><em>${section.description}</em></p>` : ""}
    `;

    section.fields.forEach((field) => {
      htmlContent += `
        <div class="field">
          <div class="field-label">${field.label}</div>
          <div class="field-value">${field.value || "-"}</div>
        </div>
      `;
    });

    htmlContent += `</div>`;
  });

  htmlContent += `
      <div class="footer">
        Generated by Strategize+ on ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], {
    type: "application/vnd.ms-word",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(data.projectName)}-${sanitizeFilename(data.canvasName)}-${Date.now()}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Utility: Sanitize filename
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

/**
 * Utility: Sanitize Excel sheet name
 */
const sanitizeSheetName = (name: string): string => {
  return name
    .replace(/[:\\/?*\[\]]/g, "")
    .substring(0, 31);
};

/**
 * Export all formats as a ZIP file
 */
export const exportAllFormats = async (
  data: CanvasExportData,
  visualElementId?: string
): Promise<void> => {
  // This would require a ZIP library like JSZip
  // For now, we'll export each format individually
  exportToJSON(data);
  exportToExcel(data);
  exportToPDF(data);
  exportToWord(data);

  if (visualElementId) {
    await exportToPNG(visualElementId, `${data.projectName}-${data.canvasName}-visual`);
  }
};
