// Enhanced export utilities with charts and better PowerPoint functionality
import { ModuleSummary } from '../hooks/useModuleSummaries';

// Generate chart data as SVG for PDF inclusion
const generateChartSVG = (data: any[], type: 'bar' | 'line' | 'pie', title: string): string => {
  const width = 400;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  
  if (type === 'bar' && data.length > 0) {
    const maxValue = Math.max(...data.map(d => d.value || 0));
    const barWidth = (width - margin.left - margin.right) / data.length;
    
    let bars = '';
    data.forEach((d, i) => {
      const barHeight = ((d.value || 0) / maxValue) * (height - margin.top - margin.bottom);
      const x = margin.left + i * barWidth;
      const y = height - margin.bottom - barHeight;
      
      bars += `<rect x="${x}" y="${y}" width="${barWidth - 5}" height="${barHeight}" fill="#3b82f6" />`;
      bars += `<text x="${x + barWidth/2}" y="${height - 10}" text-anchor="middle" font-size="10">${d.label}</text>`;
    });
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width/2}" y="15" text-anchor="middle" font-weight="bold">${title}</text>
        ${bars}
        <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#000" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#000" />
      </svg>
    `;
  }
  
  return `<div style="width: ${width}px; height: ${height}px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">Chart: ${title}</div>`;
};

// Enhanced PDF export with charts
export const exportToPDFWithCharts = (data: any, moduleSummaries: ModuleSummary[], title: string = 'Investor Report') => {
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .metric-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
          .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          .chart-container { margin: 20px 0; text-align: center; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status-active { background: #10b981; color: white; }
          .status-draft { background: #f59e0b; color: white; }
          .status-completed { background: #6366f1; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()} | Synergize+</p>
        </div>
        ${generateEnhancedPDFContent(data, moduleSummaries)}
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

const generateEnhancedPDFContent = (data: any, moduleSummaries: ModuleSummary[]): string => {
  let content = '';
  
  // Executive Summary
  content += `
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">$${data.metrics?.revenue?.toLocaleString() || '45,000'}</div>
          <div class="metric-label">Monthly Revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics?.users?.toLocaleString() || '2,340'}</div>
          <div class="metric-label">Active Users</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">$${data.metrics?.burnRate?.toLocaleString() || '12,000'}</div>
          <div class="metric-label">Monthly Burn Rate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Math.round((data.metrics?.revenue || 45000) / (data.metrics?.burnRate || 12000) * 10) / 10}</div>
          <div class="metric-label">Runway (Months)</div>
        </div>
      </div>
    </div>
  `;

  // Revenue Chart
  if (data.metrics?.revenue) {
    const revenueData = [
      { label: 'Q1', value: data.metrics.revenue * 0.8 },
      { label: 'Q2', value: data.metrics.revenue * 0.9 },
      { label: 'Q3', value: data.metrics.revenue },
      { label: 'Q4', value: data.metrics.revenue * 1.2 }
    ];
    content += `
      <div class="section">
        <h2>Revenue Growth</h2>
        <div class="chart-container">
          ${generateChartSVG(revenueData, 'bar', 'Quarterly Revenue Growth')}
        </div>
      </div>
    `;
  }

  // Module Summaries
  if (moduleSummaries.length > 0) {
    content += `
      <div class="section">
        <h2>Module Analysis Summary</h2>
        <table>
          <thead>
            <tr><th>Module</th><th>Status</th><th>Last Updated</th><th>Key Metrics</th></tr>
          </thead>
          <tbody>
            ${moduleSummaries.map(summary => `
              <tr>
                <td><strong>${summary.name}</strong></td>
                <td><span class="status-badge status-${summary.status}">${summary.status.toUpperCase()}</span></td>
                <td>${summary.lastUpdated}</td>
                <td>${Object.entries(summary.keyMetrics).slice(0, 2).map(([key, value]) => 
                  `${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`
                ).join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Cap Table
  if (data.capTable) {
    content += `
      <div class="section">
        <h2>Capitalization Table</h2>
        <table>
          <thead>
            <tr><th>Shareholder</th><th>Shares</th><th>Percentage</th><th>Type</th></tr>
          </thead>
          <tbody>
            ${data.capTable.map((entry: any) => `
              <tr>
                <td>${entry.shareholder}</td>
                <td>${entry.shares.toLocaleString()}</td>
                <td>${entry.percentage}%</td>
                <td>${entry.type}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Milestones
  if (data.milestones) {
    content += `
      <div class="section">
        <h2>Milestones & Progress</h2>
        <table>
          <thead>
            <tr><th>Milestone</th><th>Status</th><th>Progress</th><th>Target Date</th></tr>
          </thead>
          <tbody>
            ${data.milestones.map((milestone: any) => `
              <tr>
                <td>${milestone.title}</td>
                <td><span class="status-badge status-${milestone.status.toLowerCase()}">${milestone.status}</span></td>
                <td>
                  <div style="background: #e5e7eb; border-radius: 4px; height: 8px; position: relative;">
                    <div style="background: #3b82f6; height: 100%; width: ${milestone.progress}%; border-radius: 4px;"></div>
                  </div>
                  ${milestone.progress}%
                </td>
                <td>${milestone.targetDate}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return content;
};