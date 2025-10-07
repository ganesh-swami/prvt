import { exportToPDFWithCharts } from './enhancedExportUtils';

export interface ModuleExportData {
  [key: string]: any;
}

export const exportModuleData = (
  data: ModuleExportData,
  format: string,
  filename: string,
  moduleName: string
) => {
  switch (format) {
    case 'pdf':
      exportToPDF(data, moduleName, filename);
      break;
    case 'xlsx':
      exportToExcel(data, filename);
      break;
    case 'docx':
      exportToWord(data, moduleName, filename);
      break;
    case 'png':
      exportToPNG(data, moduleName, filename);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};

const exportToPDF = (data: ModuleExportData, moduleName: string, filename: string) => {
  try {
    exportToPDFWithCharts(data, [], moduleName);
  } catch (error) {
    console.error('PDF export failed:', error);
    // Fallback to simple PDF export
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${moduleName}</title></head>
          <body>
            <h1>${moduleName}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
};

const exportToExcel = (data: ModuleExportData, filename: string) => {
  const csvContent = generateCSVContent(data);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

const exportToWord = (data: ModuleExportData, moduleName: string, filename: string) => {
  const htmlContent = `
    <html>
      <head>
        <title>${moduleName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #333; }
          .value { margin-left: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${moduleName}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        ${formatDataForHTML(data)}
      </body>
    </html>
  `;
  downloadFile(htmlContent, `${filename}.html`, 'text/html');
};

const exportToPNG = (data: ModuleExportData, moduleName: string, filename: string) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    canvas.width = 1200;
    canvas.height = 800;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(moduleName, 40, 60);
    
    // Date
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 40, 100);
    
    // Data summary
    let yPos = 150;
    ctx.font = '18px Arial';
    ctx.fillStyle = '#333';
    
    Object.entries(data).forEach(([key, value]) => {
      if (yPos > canvas.height - 50) return;
      
      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      ctx.fillText(`${displayKey}:`, 40, yPos);
      
      const displayValue = typeof value === 'object' 
        ? JSON.stringify(value).substring(0, 100) + '...'
        : String(value).substring(0, 100);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText(displayValue, 250, yPos);
      
      ctx.font = '18px Arial';
      ctx.fillStyle = '#333';
      yPos += 40;
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
};

const exportToJSON = (data: ModuleExportData, filename: string) => {
  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    data: data
  }, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

const generateCSVContent = (data: ModuleExportData): string => {
  let csv = 'Field,Value\n';
  
  const flattenObject = (obj: any, prefix = ''): void => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, fullKey);
      } else {
        const cleanValue = typeof value === 'string' 
          ? value.replace(/"/g, '""')
          : String(value);
        csv += `"${fullKey}","${cleanValue}"\n`;
      }
    });
  };
  
  flattenObject(data);
  return csv;
};

const formatDataForHTML = (data: ModuleExportData): string => {
  let html = '';
  
  Object.entries(data).forEach(([key, value]) => {
    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    html += `<div class="field">`;
    html += `<span class="label">${displayKey}:</span>`;
    
    if (typeof value === 'object' && value !== null) {
      html += `<div class="value">${JSON.stringify(value, null, 2)}</div>`;
    } else {
      html += `<span class="value">${value}</span>`;
    }
    
    html += `</div>`;
  });
  
  return html;
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