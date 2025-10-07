import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { database } from './database';
import { useAuth } from '@/contexts/AuthContext';

export interface ExportOptions {
  format: 'pdf' | 'ppt' | 'docx' | 'html';
  includeCharts?: boolean;
  includeImages?: boolean;
  template?: 'business-plan' | 'financial-report' | 'market-analysis' | 'custom';
  sections?: string[];
}

export interface ExportData {
  title: string;
  content: any;
  metadata: {
    projectId: string;
    userId: string;
    exportDate: string;
    version: string;
  };
}

class ExportService {
  private async trackExport(format: string, projectId: string, userId: string) {
    await database.trackEvent('document_exported', {
      format,
      project_id: projectId,
      user_id: userId,
      timestamp: new Date().toISOString()
    }, userId);

    // Track usage for billing
    await database.trackUsage(projectId, `exports_${format}`, 1);
  }

  async exportToPDF(data: ExportData, options: ExportOptions = { format: 'pdf' }): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date(data.metadata.exportDate).toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;

      // Process content sections
      if (options.sections) {
        for (const sectionKey of options.sections) {
          const section = data.content[sectionKey];
          if (section) {
            yPosition = await this.addSectionToPDF(pdf, section, yPosition, pageWidth, pageHeight);
          }
        }
      } else {
        // Add all content
        for (const [key, section] of Object.entries(data.content)) {
          yPosition = await this.addSectionToPDF(pdf, section as any, yPosition, pageWidth, pageHeight);
        }
      }

      // Save the PDF
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
      pdf.save(fileName);

      // Track export
      await this.trackExport('pdf', data.metadata.projectId, data.metadata.userId);

    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF');
    }
  }

  private async addSectionToPDF(
    pdf: jsPDF, 
    section: any, 
    yPosition: number, 
    pageWidth: number, 
    pageHeight: number
  ): Promise<number> {
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    // Add section title
    if (section.title) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, margin, yPosition);
      yPosition += 10;
    }

    // Add section content
    if (section.content) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (typeof section.content === 'string') {
        const lines = pdf.splitTextToSize(section.content, maxWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 5;
      } else if (Array.isArray(section.content)) {
        for (const item of section.content) {
          const lines = pdf.splitTextToSize(String(item), maxWidth);
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 5 + 3;
        }
      }
    }

    // Add charts/images if enabled
    if (section.chart && options.includeCharts) {
      yPosition = await this.addChartToPDF(pdf, section.chart, yPosition, pageWidth, pageHeight);
    }

    return yPosition + 10;
  }

  private async addChartToPDF(
    pdf: jsPDF, 
    chartElement: HTMLElement | string, 
    yPosition: number, 
    pageWidth: number, 
    pageHeight: number
  ): Promise<number> {
    try {
      let element: HTMLElement;
      
      if (typeof chartElement === 'string') {
        element = document.querySelector(chartElement) as HTMLElement;
      } else {
        element = chartElement;
      }

      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if image fits on current page
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        return yPosition + imgHeight + 10;
      }
    } catch (error) {
      console.error('Failed to add chart to PDF:', error);
    }
    
    return yPosition;
  }

  async exportToPowerPoint(data: ExportData, options: ExportOptions = { format: 'ppt' }): Promise<void> {
    try {
      // For PowerPoint export, we'll create an HTML structure that can be converted
      // This is a simplified implementation - for production, consider using libraries like PptxGenJS
      
      const slides = this.generateSlidesFromData(data, options);
      const pptContent = this.createPowerPointHTML(slides, data.title);
      
      // Create blob and download
      const blob = new Blob([pptContent], { type: 'application/vnd.ms-powerpoint' });
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.ppt`;
      saveAs(blob, fileName);

      // Track export
      await this.trackExport('ppt', data.metadata.projectId, data.metadata.userId);

    } catch (error) {
      console.error('PowerPoint export failed:', error);
      throw new Error('Failed to export PowerPoint');
    }
  }

  private generateSlidesFromData(data: ExportData, options: ExportOptions): any[] {
    const slides = [];
    
    // Title slide
    slides.push({
      type: 'title',
      title: data.title,
      subtitle: `Generated on ${new Date(data.metadata.exportDate).toLocaleDateString()}`,
      layout: 'title'
    });

    // Content slides
    if (options.sections) {
      for (const sectionKey of options.sections) {
        const section = data.content[sectionKey];
        if (section) {
          slides.push({
            type: 'content',
            title: section.title || sectionKey,
            content: section.content,
            layout: 'content'
          });
        }
      }
    } else {
      for (const [key, section] of Object.entries(data.content)) {
        slides.push({
          type: 'content',
          title: (section as any).title || key,
          content: (section as any).content,
          layout: 'content'
        });
      }
    }

    return slides;
  }

  private createPowerPointHTML(slides: any[], title: string): string {
    const slideHTML = slides.map((slide, index) => {
      if (slide.type === 'title') {
        return `
          <div class="slide title-slide">
            <h1>${slide.title}</h1>
            <h2>${slide.subtitle}</h2>
          </div>
        `;
      } else {
        return `
          <div class="slide content-slide">
            <h2>${slide.title}</h2>
            <div class="content">
              ${Array.isArray(slide.content) 
                ? slide.content.map(item => `<p>${item}</p>`).join('') 
                : `<p>${slide.content}</p>`
              }
            </div>
          </div>
        `;
      }
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .slide { 
            width: 100%; 
            height: 100vh; 
            padding: 40px; 
            box-sizing: border-box; 
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .title-slide { text-align: center; background: #f8f9fa; }
          .title-slide h1 { font-size: 48px; margin-bottom: 20px; color: #333; }
          .title-slide h2 { font-size: 24px; color: #666; }
          .content-slide h2 { font-size: 36px; margin-bottom: 30px; color: #333; }
          .content p { font-size: 18px; line-height: 1.6; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        ${slideHTML}
      </body>
      </html>
    `;
  }

  async exportToWord(data: ExportData, options: ExportOptions = { format: 'docx' }): Promise<void> {
    try {
      // Create HTML content for Word export
      const wordContent = this.createWordHTML(data, options);
      
      // Create blob and download
      const blob = new Blob([wordContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.docx`;
      saveAs(blob, fileName);

      // Track export
      await this.trackExport('docx', data.metadata.projectId, data.metadata.userId);

    } catch (error) {
      console.error('Word export failed:', error);
      throw new Error('Failed to export Word document');
    }
  }

  private createWordHTML(data: ExportData, options: ExportOptions): string {
    let content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 1in; }
          h1 { font-size: 24pt; text-align: center; margin-bottom: 20pt; }
          h2 { font-size: 18pt; margin-top: 20pt; margin-bottom: 10pt; }
          p { font-size: 12pt; line-height: 1.5; margin-bottom: 10pt; }
          .metadata { font-size: 10pt; color: #666; margin-bottom: 20pt; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <div class="metadata">Generated on: ${new Date(data.metadata.exportDate).toLocaleDateString()}</div>
    `;

    // Add content sections
    if (options.sections) {
      for (const sectionKey of options.sections) {
        const section = data.content[sectionKey];
        if (section) {
          content += this.formatSectionForWord(section);
        }
      }
    } else {
      for (const [key, section] of Object.entries(data.content)) {
        content += this.formatSectionForWord(section as any);
      }
    }

    content += '</body></html>';
    return content;
  }

  private formatSectionForWord(section: any): string {
    let html = '';
    
    if (section.title) {
      html += `<h2>${section.title}</h2>`;
    }
    
    if (section.content) {
      if (typeof section.content === 'string') {
        html += `<p>${section.content}</p>`;
      } else if (Array.isArray(section.content)) {
        html += section.content.map(item => `<p>${item}</p>`).join('');
      }
    }
    
    return html;
  }

  async exportToHTML(data: ExportData, options: ExportOptions = { format: 'html' }): Promise<void> {
    try {
      const htmlContent = this.createStandaloneHTML(data, options);
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.html`;
      saveAs(blob, fileName);

      // Track export
      await this.trackExport('html', data.metadata.projectId, data.metadata.userId);

    } catch (error) {
      console.error('HTML export failed:', error);
      throw new Error('Failed to export HTML');
    }
  }

  private createStandaloneHTML(data: ExportData, options: ExportOptions): string {
    let content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            text-align: center; 
            color: #2563eb; 
            border-bottom: 3px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h2 { 
            color: #374151; 
            margin-top: 40px; 
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
            padding-left: 15px;
          }
          .metadata { 
            background: #f9fafb; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 30px;
            font-size: 14px;
            color: #6b7280;
          }
          .section { 
            margin-bottom: 30px; 
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          p { margin-bottom: 15px; }
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <div class="metadata">
          <strong>Generated:</strong> ${new Date(data.metadata.exportDate).toLocaleDateString()}<br>
          <strong>Version:</strong> ${data.metadata.version}
        </div>
    `;

    // Add content sections
    if (options.sections) {
      for (const sectionKey of options.sections) {
        const section = data.content[sectionKey];
        if (section) {
          content += this.formatSectionForHTML(section);
        }
      }
    } else {
      for (const [key, section] of Object.entries(data.content)) {
        content += this.formatSectionForHTML(section as any);
      }
    }

    content += '</body></html>';
    return content;
  }

  private formatSectionForHTML(section: any): string {
    let html = '<div class="section">';
    
    if (section.title) {
      html += `<h2>${section.title}</h2>`;
    }
    
    if (section.content) {
      if (typeof section.content === 'string') {
        html += `<p>${section.content}</p>`;
      } else if (Array.isArray(section.content)) {
        html += section.content.map(item => `<p>${item}</p>`).join('');
      } else if (typeof section.content === 'object') {
        html += '<ul>';
        for (const [key, value] of Object.entries(section.content)) {
          html += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        html += '</ul>';
      }
    }
    
    html += '</div>';
    return html;
  }
}

export const exportService = new ExportService();
