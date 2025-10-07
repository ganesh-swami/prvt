import { ModuleSummary } from '../hooks/useModuleSummaries';

interface EnhancedFinancialModelData {
  // Model Inputs
  modelInputs: {
    initialRevenue: number;
    growthRate: number;
    cogs: number;
    staffCosts: number;
    marketingCosts: number;
    adminCosts: number;
    investments: number;
    taxRate: number;
    timeHorizon: number;
  };
  
  // Results & Analysis
  results: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    grossMargin: number;
    totalOperatingExpenses: number;
    ebitda: number;
    netProfit: number;
    netMargin: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    breakEvenMonth: number;
    profitabilityRatio: number;
    revenueGrowthRate: number;
  };
  
  // Financial Metrics
  metrics: {
    roi: number;
    operatingMargin: number;
    assetTurnover: number;
    expenseRatio: number;
    burnRate: number;
    annualizedGrowth: number;
    revenueRunRate: number;
    breakEvenRevenue: number;
  };
  
  // Monthly Projections
  monthlyProjections: Array<{
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    taxes: number;
    netProfit: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    cumulativeProfit: number;
  }>;
}

export const exportEnhancedFinancialModel = (summaries: ModuleSummary[], companyData: any, enhancedData?: any) => {
  // Extract enhanced financial data from the actual Financial Modeler component
  const financialModel = summaries.find(s => s.module === 'Financial Modeler');
  
  // Use enhanced data from the Financial Modeler component if available
  const modelInputs = enhancedData?.projections || {
    initialRevenue: enhancedData?.initialRevenue || 10000,
    growthRate: enhancedData?.growthRate || 5,
    cogs: enhancedData?.cogs || 35,
    staffCosts: enhancedData?.staffCosts || 20000,
    marketingCosts: enhancedData?.marketingCosts || 5000,
    adminCosts: enhancedData?.adminCosts || 4000,
    investments: enhancedData?.investments || 100000,
    taxRate: enhancedData?.taxRate || 25,
    timeHorizon: enhancedData?.timeHorizon || 12
  };

  // Use actual results from enhanced financial modeler if available
  const existingResults = enhancedData?.results;

  // Calculate comprehensive financial model using same logic as FinancialModelerEnhanced
  const calculateEnhancedModel = (inputs: any): EnhancedFinancialModelData => {
    const f = (v: string | number, fb = 0) => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : fb;
    };

    const initial = f(inputs.initialRevenue, 0);
    const growthPct = f(inputs.growthRate, 0); // monthly %
    const cogsPct = f(inputs.cogs, 0) / 100;   // fraction
    const staff = f(inputs.staffCosts, 0);
    const marketing = f(inputs.marketingCosts, 0);
    const admin = f(inputs.adminCosts, 0);
    const investments = f(inputs.investments, 0);
    const taxRate = f(inputs.taxRate, 25) / 100;
    const months = Math.max(parseInt(String(inputs.timeHorizon)) || 12, 1);

    const monthlyProjections = [];
    let totalRev = 0, totalCogsAmount = 0, totalOpEx = 0, totalTaxes = 0, cumulativeProfit = 0;
    let breakEven = 0;

    const capexPerMonth = months > 0 ? investments / months : 0;

    // Generate monthly projections using enhanced logic
    for (let m = 1; m <= months; m++) {
      const revenue = initial * Math.pow(1 + growthPct / 100, m - 1);
      const cogsAmount = revenue * cogsPct;
      const grossProfit = revenue - cogsAmount;
      const opEx = staff + marketing + admin;
      const ebitda = grossProfit - opEx;
      const taxes = ebitda > 0 ? ebitda * taxRate : 0;
      const netProfit = ebitda - taxes;
      const operatingCashFlow = netProfit;
      const freeCashFlow = operatingCashFlow - capexPerMonth;

      totalRev += revenue;
      totalCogsAmount += cogsAmount;
      totalOpEx += opEx;
      totalTaxes += taxes;
      cumulativeProfit += netProfit;

      if (netProfit > 0 && breakEven === 0) breakEven = m;

      monthlyProjections.push({
        month: m,
        revenue,
        cogs: cogsAmount,
        grossProfit,
        operatingExpenses: opEx,
        ebitda,
        taxes,
        netProfit,
        operatingCashFlow,
        freeCashFlow,
        cumulativeProfit
      });
    }

    const totalGrossProfit = totalRev - totalCogsAmount;
    const totalEbitda = totalGrossProfit - totalOpEx;
    const totalNetProfit = totalEbitda - totalTaxes;

    // Calculate advanced financial metrics
    const roi = investments > 0 ? (totalNetProfit / investments) * 100 : 0;
    const operatingMargin = totalRev > 0 ? (totalEbitda / totalRev) * 100 : 0;
    const assetTurnover = investments > 0 ? totalRev / investments : 0;
    const expenseRatio = totalRev > 0 ? (totalOpEx / totalRev) * 100 : 0;
    const monthlyNet = totalNetProfit / months;
    const burnRate = monthlyNet < 0 ? -monthlyNet : 0;
    const annualizedGrowth = (Math.pow(1 + growthPct / 100, 12) - 1) * 100;
    const lastRevenue = monthlyProjections[monthlyProjections.length - 1]?.revenue || 0;
    const revenueRunRate = lastRevenue * 12;
    const cmRatio = 1 - cogsPct;
    const fixedCosts = staff + marketing + admin;
    const breakEvenRevenue = cmRatio > 0 ? fixedCosts / cmRatio : 0;

    return {
      modelInputs: {
        initialRevenue: initial,
        growthRate: f(inputs.growthRate, 0),
        cogs: f(inputs.cogs, 0),
        staffCosts: staff,
        marketingCosts: marketing,
        adminCosts: admin,
        investments,
        taxRate: f(inputs.taxRate, 25),
        timeHorizon: months
      },
      results: {
        totalRevenue: totalRev,
        totalCogs: totalCogsAmount,
        grossProfit: totalGrossProfit,
        grossMargin: totalRev > 0 ? (totalGrossProfit / totalRev) * 100 : 0,
        totalOperatingExpenses: totalOpEx,
        ebitda: totalEbitda,
        netProfit: totalNetProfit,
        netMargin: totalRev > 0 ? (totalNetProfit / totalRev) * 100 : 0,
        operatingCashFlow: totalNetProfit,
        freeCashFlow: totalNetProfit - investments,
        breakEvenMonth: breakEven,
        profitabilityRatio: totalOpEx > 0 ? totalGrossProfit / totalOpEx : 0,
        revenueGrowthRate: f(inputs.growthRate, 0)
      },
      metrics: {
        roi,
        operatingMargin,
        assetTurnover,
        expenseRatio,
        burnRate,
        annualizedGrowth,
        revenueRunRate,
        breakEvenRevenue
      },
      monthlyProjections
    };
  };

  // Use existing results if available, otherwise calculate
  const financialData = existingResults ? {
    modelInputs: {
      initialRevenue: f(modelInputs.initialRevenue, 0),
      growthRate: f(modelInputs.growthRate, 0),
      cogs: f(modelInputs.cogs, 0),
      staffCosts: f(modelInputs.staffCosts, 0),
      marketingCosts: f(modelInputs.marketingCosts, 0),
      adminCosts: f(modelInputs.adminCosts, 0),
      investments: f(modelInputs.investments, 0),
      taxRate: f(modelInputs.taxRate, 25),
      timeHorizon: parseInt(String(modelInputs.timeHorizon)) || 12
    },
    results: existingResults,
    metrics: {
      roi: existingResults.totalOperatingExpenses > 0 ? (existingResults.netProfit / f(modelInputs.investments, 1)) * 100 : 0,
      operatingMargin: existingResults.totalRevenue > 0 ? (existingResults.ebitda / existingResults.totalRevenue) * 100 : 0,
      assetTurnover: f(modelInputs.investments, 0) > 0 ? existingResults.totalRevenue / f(modelInputs.investments, 1) : 0,
      expenseRatio: existingResults.totalRevenue > 0 ? (existingResults.totalOperatingExpenses / existingResults.totalRevenue) * 100 : 0,
      burnRate: existingResults.netProfit < 0 ? -existingResults.netProfit / (parseInt(String(modelInputs.timeHorizon)) || 12) : 0,
      annualizedGrowth: (Math.pow(1 + f(modelInputs.growthRate, 0) / 100, 12) - 1) * 100,
      revenueRunRate: existingResults.monthlyProjections?.length > 0 ? 
        existingResults.monthlyProjections[existingResults.monthlyProjections.length - 1].revenue * 12 : 0,
      breakEvenRevenue: existingResults.totalOperatingExpenses / (1 - f(modelInputs.cogs, 0) / 100)
    },
    monthlyProjections: existingResults.monthlyProjections || []
  } : calculateEnhancedModel(modelInputs);

  // Helper function for safe number conversion
  function f(v: string | number, fb = 0) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : fb;
  }

  // Create comprehensive CSV export
  const csvContent = [
    ['Enhanced Financial Model Export', '', '', '', ''],
    ['Company:', companyData.companyName || 'Your Company', '', '', ''],
    ['Export Date:', new Date().toLocaleDateString(), '', '', ''],
    ['', '', '', '', ''],
    
    // Model Inputs Section
    ['MODEL INPUTS', '', '', '', ''],
    ['Initial Monthly Revenue ($)', financialData.modelInputs.initialRevenue.toLocaleString(), '', '', ''],
    ['Monthly Growth Rate (%)', financialData.modelInputs.growthRate, '', '', ''],
    ['COGS (% of Revenue)', financialData.modelInputs.cogs, '', '', ''],
    ['Monthly Staff Costs ($)', financialData.modelInputs.staffCosts.toLocaleString(), '', '', ''],
    ['Monthly Marketing Costs ($)', financialData.modelInputs.marketingCosts.toLocaleString(), '', '', ''],
    ['Monthly Admin Costs ($)', financialData.modelInputs.adminCosts.toLocaleString(), '', '', ''],
    ['Total Investments ($)', financialData.modelInputs.investments.toLocaleString(), '', '', ''],
    ['Tax Rate (%)', financialData.modelInputs.taxRate, '', '', ''],
    ['Time Horizon (months)', financialData.modelInputs.timeHorizon, '', '', ''],
    ['', '', '', '', ''],
    
    // Results & Analysis Section
    ['RESULTS & ANALYSIS', '', '', '', ''],
    ['Total Revenue', `$${financialData.results.totalRevenue.toLocaleString()}`, '', '', ''],
    ['Total COGS', `$${financialData.results.totalCogs.toLocaleString()}`, '', '', ''],
    ['Gross Profit', `$${financialData.results.grossProfit.toLocaleString()}`, '', '', ''],
    ['Gross Margin (%)', financialData.results.grossMargin.toFixed(1), '', '', ''],
    ['Total Operating Expenses', `$${financialData.results.totalOperatingExpenses.toLocaleString()}`, '', '', ''],
    ['EBITDA', `$${financialData.results.ebitda.toLocaleString()}`, '', '', ''],
    ['Net Profit', `$${financialData.results.netProfit.toLocaleString()}`, '', '', ''],
    ['Net Margin (%)', financialData.results.netMargin.toFixed(1), '', '', ''],
    ['Operating Cash Flow', `$${financialData.results.operatingCashFlow.toLocaleString()}`, '', '', ''],
    ['Free Cash Flow', `$${financialData.results.freeCashFlow.toLocaleString()}`, '', '', ''],
    ['Break-Even Month', financialData.results.breakEvenMonth > 0 ? `Month ${financialData.results.breakEvenMonth}` : 'Not Reached', '', '', ''],
    ['Profitability Ratio', financialData.results.profitabilityRatio.toFixed(2) + 'x', '', '', ''],
    ['', '', '', '', ''],
    
    // Financial Metrics Section
    ['FINANCIAL METRICS', '', '', '', ''],
    ['Return on Investment (ROI) (%)', financialData.metrics.roi.toFixed(1), '', '', ''],
    ['Operating Margin (%)', financialData.metrics.operatingMargin.toFixed(1), '', '', ''],
    ['Asset Turnover', financialData.metrics.assetTurnover.toFixed(2) + 'x', '', '', ''],
    ['Expense Ratio (%)', financialData.metrics.expenseRatio.toFixed(1), '', '', ''],
    ['Monthly Burn Rate ($)', financialData.metrics.burnRate.toLocaleString(), '', '', ''],
    ['Annualized Growth (%)', financialData.metrics.annualizedGrowth.toFixed(1), '', '', ''],
    ['Revenue Run Rate ($)', financialData.metrics.revenueRunRate.toLocaleString(), '', '', ''],
    ['Break-Even Revenue (Monthly) ($)', financialData.metrics.breakEvenRevenue.toLocaleString(), '', '', ''],
    ['', '', '', '', ''],
    
    // Monthly Projections Section
    ['MONTHLY PROJECTIONS', '', '', '', ''],
    ['Month', 'Revenue', 'COGS', 'Gross Profit', 'OpEx', 'EBITDA', 'Taxes', 'Net Profit', 'OCF', 'FCF', 'Cumulative'],
    ...financialData.monthlyProjections.map(m => [
      m.month,
      `$${m.revenue.toLocaleString()}`,
      `$${m.cogs.toLocaleString()}`,
      `$${m.grossProfit.toLocaleString()}`,
      `$${m.operatingExpenses.toLocaleString()}`,
      `$${m.ebitda.toLocaleString()}`,
      `$${m.taxes.toLocaleString()}`,
      `$${m.netProfit.toLocaleString()}`,
      `$${m.operatingCashFlow.toLocaleString()}`,
      `$${m.freeCashFlow.toLocaleString()}`,
      `$${m.cumulativeProfit.toLocaleString()}`
    ]),
    ['', '', '', '', ''],
    
    // Module Integration Section
    ['MODULE INTEGRATION', '', '', '', ''],
    ['Module', 'Status', 'Key Metrics', 'Last Updated'],
    ...summaries.map(summary => [
      summary.module,
      summary.status,
      summary.keyMetrics,
      summary.lastUpdated
    ])
  ];

  // Convert to CSV and download
  const csvString = csvContent.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Enhanced_Financial_Model_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();

  // Create comprehensive HTML report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enhanced Financial Model - ${companyData.companyName || 'Your Company'}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 3px solid #007acc; }
            h2 { color: #555; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .metric-card { display: inline-block; margin: 10px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 1.5em; font-weight: bold; color: #007acc; }
        </style>
    </head>
    <body>
        <h1>Enhanced Financial Model Report</h1>
        <p><strong>Company:</strong> ${companyData.companyName || 'Your Company'}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Model Inputs</h2>
        <div class="metric-card">
            <div class="metric-value">$${financialData.modelInputs.initialRevenue.toLocaleString()}</div>
            <div>Initial Revenue</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${financialData.modelInputs.growthRate}%</div>
            <div>Growth Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${financialData.modelInputs.cogs}%</div>
            <div>COGS</div>
        </div>
        
        <h2>Financial Metrics</h2>
        <div class="metric-card">
            <div class="metric-value">${financialData.metrics.roi.toFixed(1)}%</div>
            <div>ROI</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${financialData.results.netProfit.toLocaleString()}</div>
            <div>Net Profit</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${financialData.results.grossMargin.toFixed(1)}%</div>
            <div>Gross Margin</div>
        </div>
        
        <h2>Monthly Projections</h2>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                    <th>Cumulative</th>
                </tr>
            </thead>
            <tbody>
                ${financialData.monthlyProjections.slice(0, 12).map(m => `
                    <tr>
                        <td>${m.month}</td>
                        <td>$${m.revenue.toLocaleString()}</td>
                        <td>$${m.operatingExpenses.toLocaleString()}</td>
                        <td>$${m.netProfit.toLocaleString()}</td>
                        <td>$${m.cumulativeProfit.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>
  `;

  // Open HTML report
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
  }
};

// Legacy export for compatibility
export const exportFinancialModel = exportEnhancedFinancialModel;