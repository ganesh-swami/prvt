// PDF Export utility using jsPDF
export const exportToPDF = (data: any, title: string = 'Investor Report') => {
  // Create a simple HTML content for PDF
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${generatePDFContent(data)}
      </body>
    </html>
  `;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

const generatePDFContent = (data: any): string => {
  let content = '';
  
  if (data.metrics) {
    content += `
      <div class="section">
        <h2>Key Metrics</h2>
        <div class="metric">
          <h3>Monthly Revenue</h3>
          <p>$${data.metrics.revenue?.toLocaleString() || '45,000'}</p>
        </div>
        <div class="metric">
          <h3>Active Users</h3>
          <p>${data.metrics.users?.toLocaleString() || '2,340'}</p>
        </div>
        <div class="metric">
          <h3>Burn Rate</h3>
          <p>$${data.metrics.burnRate?.toLocaleString() || '12,000'}</p>
        </div>
      </div>
    `;
  }

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

  if (data.milestones) {
    content += `
      <div class="section">
        <h2>Milestones</h2>
        <table>
          <thead>
            <tr><th>Title</th><th>Status</th><th>Progress</th><th>Target Date</th></tr>
          </thead>
          <tbody>
            ${data.milestones.map((milestone: any) => `
              <tr>
                <td>${milestone.title}</td>
                <td>${milestone.status}</td>
                <td>${milestone.progress}%</td>
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

// PowerPoint export simulation (creates structured data)
export const exportToPowerPoint = (data: any, title: string = 'Investor Presentation') => {
  const slides = generateSlideData(data, title);
  
  // Create a downloadable JSON file with slide data
  const dataStr = JSON.stringify(slides, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${title.replace(/\s+/g, '_')}_slides.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const generateSlideData = (data: any, title: string) => {
  const slides = [
    {
      title: title,
      type: 'title',
      content: {
        title: title,
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        company: 'Synergize+'
      }
    }
  ];

  if (data.metrics) {
    slides.push({
      title: 'Key Metrics',
      type: 'metrics',
      content: {
        revenue: data.metrics.revenue || 45000,
        users: data.metrics.users || 2340,
        burnRate: data.metrics.burnRate || 12000
      }
    });
  }

  if (data.capTable) {
    slides.push({
      title: 'Capitalization Table',
      type: 'table',
      content: {
        headers: ['Shareholder', 'Shares', 'Percentage', 'Type'],
        rows: data.capTable.map((entry: any) => [
          entry.shareholder,
          entry.shares.toLocaleString(),
          `${entry.percentage}%`,
          entry.type
        ])
      }
    });
  }

  if (data.milestones) {
    slides.push({
      title: 'Milestones & Progress',
      type: 'milestones',
      content: {
        milestones: data.milestones.map((m: any) => ({
          title: m.title,
          status: m.status,
          progress: m.progress,
          targetDate: m.targetDate
        }))
      }
    });
  }

  return slides;
};