import { ModuleSummary } from '../hooks/useModuleSummaries';

interface PitchDeckData {
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  marketSize: string;
  businessModel: string;
  traction: string;
  financials: string;
  team: string;
  funding: string;
}

export const generatePitchDeck = (summaries: ModuleSummary[], companyData: any) => {
  // Extract data from module summaries
  const marketSizing = summaries.find(s => s.module === 'Market Sizing');
  const financialModel = summaries.find(s => s.module === 'Financial Modeler');
  const unitEconomics = summaries.find(s => s.module === 'Unit Economics');
  const competitorAnalysis = summaries.find(s => s.module === 'Competitor Analysis');
  const riskCenter = summaries.find(s => s.module === 'Risk Center');

  const pitchDeckData: PitchDeckData = {
    companyName: companyData.companyName || 'Your Company',
    tagline: companyData.tagline || 'Revolutionizing the industry',
    problem: 'Market inefficiencies and unmet customer needs',
    solution: 'Innovative technology platform addressing core problems',
    marketSize: marketSizing?.keyMetrics || 'Large addressable market opportunity',
    businessModel: unitEconomics?.keyMetrics || 'Scalable revenue model',
    traction: `Revenue: $${companyData.revenue || 45000}/month, Users: ${companyData.users || 2340}`,
    financials: financialModel?.keyMetrics || 'Strong unit economics and growth trajectory',
    team: 'Experienced founding team with domain expertise',
    funding: `Raising $${companyData.fundingAmount || 500000} for growth acceleration`
  };

  // Generate HTML content for pitch deck
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${pitchDeckData.companyName} - Pitch Deck</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .slide { page-break-after: always; padding: 40px; min-height: 80vh; }
            .slide h1 { font-size: 2.5em; color: #333; text-align: center; }
            .slide h2 { font-size: 2em; color: #555; border-bottom: 2px solid #007acc; }
            .slide p { font-size: 1.2em; line-height: 1.6; }
            .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
            .metric { text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .metric h3 { margin: 0; font-size: 2em; color: #007acc; }
            .metric p { margin: 5px 0 0 0; color: #666; }
        </style>
    </head>
    <body>
        <div class="slide">
            <h1>${pitchDeckData.companyName}</h1>
            <p style="text-align: center; font-size: 1.5em; color: #666;">${pitchDeckData.tagline}</p>
        </div>
        
        <div class="slide">
            <h2>Problem</h2>
            <p>${pitchDeckData.problem}</p>
            ${riskCenter ? `<p><strong>Key Challenges:</strong> ${riskCenter.keyMetrics}</p>` : ''}
        </div>
        
        <div class="slide">
            <h2>Solution</h2>
            <p>${pitchDeckData.solution}</p>
        </div>
        
        <div class="slide">
            <h2>Market Opportunity</h2>
            <p>${pitchDeckData.marketSize}</p>
            ${competitorAnalysis ? `<p><strong>Competitive Advantage:</strong> ${competitorAnalysis.keyMetrics}</p>` : ''}
        </div>
        
        <div class="slide">
            <h2>Business Model</h2>
            <p>${pitchDeckData.businessModel}</p>
        </div>
        
        <div class="slide">
            <h2>Traction</h2>
            <div class="metrics">
                <div class="metric">
                    <h3>$${companyData.revenue || 45000}</h3>
                    <p>Monthly Revenue</p>
                </div>
                <div class="metric">
                    <h3>${companyData.users || 2340}</h3>
                    <p>Active Users</p>
                </div>
                <div class="metric">
                    <h3>${companyData.growth || 25}%</h3>
                    <p>Monthly Growth</p>
                </div>
            </div>
        </div>
        
        <div class="slide">
            <h2>Financials</h2>
            <p>${pitchDeckData.financials}</p>
        </div>
        
        <div class="slide">
            <h2>Funding</h2>
            <p>${pitchDeckData.funding}</p>
            <p>Use of funds: Product development, team expansion, and market penetration.</p>
        </div>
    </body>
    </html>
  `;

  // Open in new window for printing/saving
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
  }
};