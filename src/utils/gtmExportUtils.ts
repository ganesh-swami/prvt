import { exportToPDFWithCharts } from './enhancedExportUtils';

export interface GTMPlanData {
  projectName: string;
  productRoadmap?: any;
  customerPainPoints?: any;
  competitorAnalysis?: any;
  swotAnalysis?: any;
  productConcept?: any;
  keyAudiencePitches?: any;
  launchGoalsKPIs?: any;
  statusLog?: any;
  customerJourneyMap?: any;
  promotionsChecklist?: any;
  outreachChannels?: any;
  exportDate: string;
}

export const exportGTMPlan = (
  data: GTMPlanData,
  format: string,
  filename: string = 'gtm-plan'
) => {
  switch (format) {
    case 'pdf':
      exportGTMToPDF(data, filename);
      break;
    case 'xlsx':
      exportGTMToExcel(data, filename);
      break;
    case 'docx':
      exportGTMToWord(data, filename);
      break;
    case 'json':
      exportGTMToJSON(data, filename);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};

const exportGTMToPDF = (data: GTMPlanData, filename: string) => {
  try {
    exportToPDFWithCharts(data, [], 'GTM Plan');
  } catch (error) {
    console.error('PDF export failed:', error);
    // Fallback to simple PDF export
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>GTM Plan - ${data.projectName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #333; border-bottom: 2px solid #007bff; }
              h2 { color: #555; margin-top: 30px; }
              .section { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Go-to-Market Plan: ${data.projectName}</h1>
            <p><strong>Generated:</strong> ${data.exportDate}</p>
            ${formatGTMDataForHTML(data)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
};

const exportGTMToExcel = (data: GTMPlanData, filename: string) => {
  const csvContent = generateGTMCSVContent(data);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

const exportGTMToWord = (data: GTMPlanData, filename: string) => {
  const htmlContent = `
    <html>
      <head>
        <title>GTM Plan - ${data.projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <h1>Go-to-Market Plan: ${data.projectName}</h1>
        <p><strong>Generated:</strong> ${data.exportDate}</p>
        ${formatGTMDataForHTML(data)}
      </body>
    </html>
  `;
  downloadFile(htmlContent, `${filename}.html`, 'text/html');
};

const exportGTMToJSON = (data: GTMPlanData, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

const formatGTMDataForHTML = (data: GTMPlanData): string => {
  const sections = [
    { key: 'productRoadmap', title: 'Product Roadmap' },
    { key: 'customerPainPoints', title: 'Customer Pain Points' },
    { key: 'competitorAnalysis', title: 'Competitor Analysis' },
    { key: 'swotAnalysis', title: 'SWOT Analysis' },
    { key: 'productConcept', title: 'Product Concept' },
    { key: 'keyAudiencePitches', title: 'Key Audience Pitches' },
    { key: 'launchGoalsKPIs', title: 'Launch Goals & KPIs' },
    { key: 'statusLog', title: 'Status Log' },
    { key: 'customerJourneyMap', title: 'Customer Journey Map' },
    { key: 'promotionsChecklist', title: 'Promotions Checklist' },
    { key: 'outreachChannels', title: 'Outreach Channels' }
  ];

  return sections
    .filter(section => data[section.key as keyof GTMPlanData])
    .map(section => {
      const value = data[section.key as keyof GTMPlanData];
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div>${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</div>
        </div>
      `;
    })
    .join('');
};

const generateGTMCSVContent = (data: GTMPlanData): string => {
  let csv = 'Section,Field,Value\n';
  
  Object.entries(data).forEach(([section, sectionData]) => {
    if (typeof sectionData === 'object' && sectionData !== null) {
      Object.entries(sectionData).forEach(([field, value]) => {
        const cleanValue = typeof value === 'string' 
          ? value.replace(/"/g, '""')
          : String(value);
        csv += `"${section}","${field}","${cleanValue}"\n`;
      });
    } else {
      csv += `"${section}","","${sectionData}"\n`;
    }
  });
  
  return csv;
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};