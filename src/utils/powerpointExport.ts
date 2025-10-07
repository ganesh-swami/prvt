// PowerPoint export functionality using PptxGenJS-like structure
import { ModuleSummary } from '../hooks/useModuleSummaries';

interface SlideData {
  title: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'metrics';
  content: any;
}

// Generate PowerPoint-compatible JSON structure
export const generatePowerPointData = (data: any, moduleSummaries: ModuleSummary[], title: string) => {
  const slides: SlideData[] = [
    // Title slide
    {
      title: 'Title Slide',
      type: 'title',
      content: {
        title: title,
        subtitle: `Investor Update - ${new Date().toLocaleDateString()}`,
        company: 'Synergize+',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzIi8+PC9zdmc+'
      }
    },
    // Executive Summary
    {
      title: 'Executive Summary',
      type: 'metrics',
      content: {
        metrics: [
          {
            label: 'Monthly Revenue',
            value: `$${(data.metrics?.revenue || 45000).toLocaleString()}`,
            change: '+15%',
            color: '#10b981'
          },
          {
            label: 'Active Users',
            value: (data.metrics?.users || 2340).toLocaleString(),
            change: '+23%',
            color: '#3b82f6'
          },
          {
            label: 'Monthly Burn',
            value: `$${(data.metrics?.burnRate || 12000).toLocaleString()}`,
            change: '-5%',
            color: '#ef4444'
          },
          {
            label: 'Runway',
            value: `${Math.round((data.metrics?.revenue || 45000) / (data.metrics?.burnRate || 12000))} months`,
            change: '+2 months',
            color: '#8b5cf6'
          }
        ]
      }
    }
  ];

  // Revenue Growth Chart
  if (data.metrics?.revenue) {
    slides.push({
      title: 'Revenue Growth',
      type: 'chart',
      content: {
        chartType: 'column',
        title: 'Quarterly Revenue Growth',
        data: [
          { name: 'Q1 2024', value: data.metrics.revenue * 0.8 },
          { name: 'Q2 2024', value: data.metrics.revenue * 0.9 },
          { name: 'Q3 2024', value: data.metrics.revenue },
          { name: 'Q4 2024 (Proj)', value: data.metrics.revenue * 1.2 }
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      }
    });
  }

  // Module Summaries
  if (moduleSummaries.length > 0) {
    slides.push({
      title: 'Business Analysis Overview',
      type: 'table',
      content: {
        headers: ['Module', 'Status', 'Key Insight', 'Last Updated'],
        rows: moduleSummaries.map(summary => [
          summary.name,
          summary.status.toUpperCase(),
          getKeyInsight(summary),
          summary.lastUpdated
        ]),
        styling: {
          headerColor: '#3b82f6',
          alternateRowColor: '#f8f9fa'
        }
      }
    });

    // Individual module slides for key modules
    const keyModules = moduleSummaries.filter(s => 
      ['financial-modeler', 'market-sizing', 'unit-economics'].includes(s.id)
    );

    keyModules.forEach(module => {
      slides.push({
        title: module.name,
        type: 'content',
        content: {
          bullets: generateModuleBullets(module),
          chart: generateModuleChart(module)
        }
      });
    });
  }

  // Cap Table
  if (data.capTable && data.capTable.length > 0) {
    slides.push({
      title: 'Capitalization Table',
      type: 'chart',
      content: {
        chartType: 'pie',
        title: 'Ownership Distribution',
        data: data.capTable.map((entry: any) => ({
          name: entry.shareholder,
          value: entry.percentage
        })),
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
    });
  }

  // Milestones
  if (data.milestones && data.milestones.length > 0) {
    slides.push({
      title: 'Key Milestones',
      type: 'content',
      content: {
        milestones: data.milestones.map((milestone: any) => ({
          title: milestone.title,
          status: milestone.status,
          progress: milestone.progress,
          targetDate: milestone.targetDate,
          description: `${milestone.progress}% complete - Target: ${milestone.targetDate}`
        }))
      }
    });
  }

  return slides;
};

// Export to PowerPoint format (JSON structure that can be converted)
export const exportToPowerPoint = (data: any, moduleSummaries: ModuleSummary[], title: string = 'Investor Presentation') => {
  const slides = generatePowerPointData(data, moduleSummaries, title);
  
  const presentation = {
    title: title,
    author: 'Synergize+',
    subject: 'Investor Update',
    created: new Date().toISOString(),
    slides: slides,
    template: {
      masterSlide: {
        background: '#ffffff',
        fontFamily: 'Calibri',
        fontSize: 18,
        titleFontSize: 32,
        headerColor: '#3b82f6',
        footerText: 'Synergize+ | Confidential'
      }
    },
    instructions: [
      '1. This JSON contains structured presentation data',
      '2. Import into PowerPoint using a compatible tool or template',
      '3. Each slide object contains type and content for easy conversion',
      '4. Charts include data arrays ready for PowerPoint chart creation',
      '5. Use the template settings for consistent formatting'
    ]
  };
  
  // Create downloadable file
  const dataStr = JSON.stringify(presentation, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${title.replace(/\s+/g, '_')}_presentation.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  // Also create a simple HTML preview
  generateHTMLPreview(slides, title);
};

const getKeyInsight = (summary: ModuleSummary): string => {
  switch (summary.id) {
    case 'financial-modeler':
      return `${summary.keyMetrics.growth}% growth projected`;
    case 'market-sizing':
      return `$${(summary.keyMetrics.som / 1000000).toFixed(0)}M addressable market`;
    case 'unit-economics':
      return `${summary.keyMetrics.ltvCacRatio}:1 LTV:CAC ratio`;
    case 'competitor-analysis':
      return `${summary.keyMetrics.competitorsAnalyzed} competitors analyzed`;
    case 'risk-center':
      return `${summary.keyMetrics.mitigatedRisks}/${summary.keyMetrics.totalRisks} risks mitigated`;
    default:
      return 'Analysis complete';
  }
};

const generateModuleBullets = (module: ModuleSummary): string[] => {
  const bullets: string[] = [];
  
  Object.entries(module.keyMetrics).forEach(([key, value]) => {
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
    bullets.push(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${formattedValue}`);
  });
  
  return bullets.slice(0, 5); // Limit to 5 bullets per slide
};

const generateModuleChart = (module: ModuleSummary): any => {
  if (module.id === 'financial-modeler' && module.data?.projections) {
    return {
      type: 'line',
      title: 'Financial Projections',
      data: module.data.projections.map((p: any) => ({
        name: p.period,
        revenue: p.revenue,
        expenses: p.expenses
      }))
    };
  }
  
  return null;
};

const generateHTMLPreview = (slides: SlideData[], title: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Preview</title>
        <style>
          body { font-family: Calibri, sans-serif; margin: 0; background: #f0f0f0; }
          .slide { width: 800px; height: 600px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .slide h1 { color: #3b82f6; font-size: 32px; margin-bottom: 20px; }
          .slide h2 { color: #333; font-size: 24px; margin-bottom: 15px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .metric-box { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 36px; font-weight: bold; color: #3b82f6; }
          .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #3b82f6; color: white; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        ${slides.map((slide, index) => `
          <div class="slide">
            <h1>${slide.title}</h1>
            ${generateSlideHTML(slide)}
            <div class="footer">Slide ${index + 1} of ${slides.length} | Synergize+ | Confidential</div>
          </div>
        `).join('')}
      </body>
    </html>
  `;
  
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
  }
};

const generateSlideHTML = (slide: SlideData): string => {
  switch (slide.type) {
    case 'title':
      return `
        <div style="text-align: center; margin-top: 150px;">
          <h1 style="font-size: 48px;">${slide.content.title}</h1>
          <p style="font-size: 24px; color: #666;">${slide.content.subtitle}</p>
          <p style="font-size: 18px; color: #3b82f6;">${slide.content.company}</p>
        </div>
      `;
    case 'metrics':
      return `
        <div class="metrics-grid">
          ${slide.content.metrics.map((metric: any) => `
            <div class="metric-box">
              <div class="metric-value" style="color: ${metric.color}">${metric.value}</div>
              <div class="metric-label">${metric.label}</div>
              <div style="color: ${metric.color}; font-size: 14px; margin-top: 5px;">${metric.change}</div>
            </div>
          `).join('')}
        </div>
      `;
    case 'table':
      return `
        <table>
          <thead>
            <tr>${slide.content.headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${slide.content.rows.map((row: string[]) => `
              <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      `;
    default:
      return '<p>Content preview not available for this slide type</p>';
  }
};