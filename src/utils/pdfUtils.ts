import jsPDF from "jspdf";

/**
 * Common PDF Utilities
 * Provides shared functions for PDF creation and download
 */

/**
 * Create a new PDF instance with standard settings
 * @returns New jsPDF instance
 */
export const createPDFInstance = (): jsPDF => {
  return new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
};

/**
 * Download PDF instance as a file
 * @param doc - jsPDF instance to download
 * @param filename - Name of the file (without .pdf extension)
 */
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  const sanitizedFilename = filename
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  
  doc.save(`${sanitizedFilename}-${Date.now()}.pdf`);
};

/**
 * Add a module separator page to the PDF
 * Used in comprehensive exports to separate different modules
 * @param doc - Existing jsPDF instance
 * @param moduleName - Name of the module
 * @param color - RGB color array [r, g, b]
 * @returns Updated jsPDF instance
 */
export const addModuleSeparatorPage = (
  doc: jsPDF,
  moduleName: string,
  color: number[] = [59, 130, 246]
): jsPDF => {
  doc.addPage();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Full page colored header
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, pageWidth, 80, "F");
  
  // Decorative line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.line(15, 70, pageWidth - 15, 70);
  
  // Module name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(moduleName, pageWidth / 2, 40, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Module Report", pageWidth / 2, 60, { align: "center" });
  
  return doc;
};

/**
 * Add a title page to the PDF
 * Used in individual module exports
 * @param doc - Existing jsPDF instance
 * @param title - Main title
 * @param subtitle - Subtitle text
 * @param color - RGB color array [r, g, b]
 * @returns Updated jsPDF instance
 */
export const addTitlePage = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  color: number[] = [59, 130, 246]
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title page colored header
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, pageWidth, 70, "F");
  
  // Decorative line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 60, pageWidth - 15, 60);
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 25, { align: "center" });
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${subtitle} • ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );
  
  return doc;
};

/**
 * Add footer to all pages in the PDF
 * @param doc - Existing jsPDF instance
 * @param footerText - Text to display in footer
 * @returns Updated jsPDF instance
 */
export const addFooterToAllPages = (doc: jsPDF, footerText: string): jsPDF => {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    
    // Page number (left)
    doc.text(`Page ${i} of ${totalPages}`, 15, pageHeight - 10);
    
    // Footer text (center)
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    // Date (right)
    doc.text(new Date().toLocaleDateString(), pageWidth - 15, pageHeight - 10, { align: "right" });
  }
  
  return doc;
};
