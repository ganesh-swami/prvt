  // Create comprehensive HTML report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enhanced Financial Model - ${companyData.companyName || 'Your Company'}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 40px; border-left: 4px solid #007acc; padding-left: 15px; }
            h3 { color: #666; margin-top: 25px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; text-align: center; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric-card { padding: 20px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #007acc; }
            .metric-value { font-size: 1.8em; font-weight: bold; color: #007acc; margin-bottom: 5px; }
            .metric-label { color: #666; font-size: 0.9em; }
            .status-excellent { color: #28a745; font-weight: bold; }
            .status-good { color: #17a2b8; font-weight: bold; }
            .status-needs-improvement { color: #dc3545; font-weight: bold; }
            .summary-section { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .chart-placeholder { height: 300px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); margin: 20px 0; display: flex; align-items: center; justify-content: center; color: #666; border-radius: 8px; }
        </style>
    </head>
    <body>
        <h1>Enhanced Financial Model Report</h1>
        <div class="summary-section">
            <p><strong>Company:</strong> ${companyData.companyName || 'Your Company'}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Model Period:</strong> ${financialData.modelInputs.timeHorizon} months</p>
            <p><strong>Export Type:</strong> Comprehensive Enhanced Financial Model</p>
        </div>
        
        <h2>Model Inputs</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">$${financialData.modelInputs.initialRevenue.toLocaleString()}</div>
                <div class="metric-label">Initial Monthly Revenue</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.modelInputs.growthRate}%</div>
                <div class="metric-label">Monthly Growth Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.modelInputs.cogs}%</div>
                <div class="metric-label">COGS (% of Revenue)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.modelInputs.staffCosts.toLocaleString()}</div>
                <div class="metric-label">Monthly Staff Costs</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.modelInputs.investments.toLocaleString()}</div>
                <div class="metric-label">Total Investments</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.modelInputs.taxRate}%</div>
                <div class="metric-label">Tax Rate</div>
            </div>
        </div>
        
        <h2>Results & Analysis</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">$${financialData.results.totalRevenue.toLocaleString()}</div>
                <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.results.grossProfit.toLocaleString()}</div>
                <div class="metric-label">Gross Profit</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.results.grossMargin.toFixed(1)}%</div>
                <div class="metric-label">Gross Margin</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.results.netProfit.toLocaleString()}</div>
                <div class="metric-label">Net Profit</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.results.netMargin.toFixed(1)}%</div>
                <div class="metric-label">Net Margin</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.results.breakEvenMonth > 0 ? 'Month ' + financialData.results.breakEvenMonth : 'Not Reached'}</div>
                <div class="metric-label">Break-Even Point</div>
            </div>
        </div>
        
        <h2>Financial Metrics</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${financialData.metrics.roi.toFixed(1)}%</div>
                <div class="metric-label">Return on Investment</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.metrics.operatingMargin.toFixed(1)}%</div>
                <div class="metric-label">Operating Margin</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.metrics.assetTurnover.toFixed(2)}x</div>
                <div class="metric-label">Asset Turnover</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.metrics.burnRate.toLocaleString()}</div>
                <div class="metric-label">Monthly Burn Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${financialData.metrics.annualizedGrowth.toFixed(1)}%</div>
                <div class="metric-label">Annualized Growth</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${financialData.metrics.revenueRunRate.toLocaleString()}</div>
                <div class="metric-label">Revenue Run Rate</div>
            </div>
        </div>
        
        <h2>Monthly Projections (First 12 Months)</h2>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>COGS</th>
                    <th>Gross Profit</th>
                    <th>OpEx</th>
                    <th>EBITDA</th>
                    <th>Net Profit</th>
                    <th>Cumulative</th>
                </tr>
            </thead>
            <tbody>
                ${financialData.monthlyProjections.slice(0, 12).map(m => `
                    <tr>
                        <td>${m.month}</td>
                        <td>$${m.revenue.toLocaleString()}</td>
                        <td>$${m.cogs.toLocaleString()}</td>
                        <td>$${m.grossProfit.toLocaleString()}</td>
                        <td>$${m.operatingExpenses.toLocaleString()}</td>
                        <td>$${m.ebitda.toLocaleString()}</td>
                        <td style="color: ${m.netProfit >= 0 ? '#28a745' : '#dc3545'}">$${m.netProfit.toLocaleString()}</td>
                        <td style="color: ${m.cumulativeProfit >= 0 ? '#28a745' : '#dc3545'}">$${m.cumulativeProfit.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="chart-placeholder">
            Revenue Growth & Profitability Chart - Export to Excel for detailed charting and analysis
        </div>
        
        <h2>Module Integration Summary</h2>
        <table>
            <thead>
                <tr>
                    <th>Module</th>
                    <th>Status</th>
                    <th>Key Metrics</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
                ${summaries.map(summary => `
                    <tr>
                        <td style="text-align: left;">${summary.module}</td>
                        <td>${summary.status}</td>
                        <td style="text-align: left;">${summary.keyMetrics}</td>
                        <td>${summary.lastUpdated}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="summary-section">
            <h3>Export Summary</h3>
            <p>This enhanced financial model export includes comprehensive data from all enhanced financial modeler components:</p>
            <ul>
                <li><strong>Model Inputs:</strong> All user-defined parameters and assumptions</li>
                <li><strong>Results & Analysis:</strong> Calculated financial outcomes and performance metrics</li>
                <li><strong>Financial Metrics:</strong> Advanced ratios and KPIs for business analysis</li>
                <li><strong>Monthly Projections:</strong> Detailed month-by-month financial forecasts</li>
                <li><strong>Module Integration:</strong> Data from all connected business modules</li>
            </ul>
            <p><em>Generated on ${new Date().toLocaleString()} using Enhanced Financial Modeler v2.0</em></p>
        </div>
    </body>
    </html>
  `;

  // Open HTML report in new window
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
  }
};

// Legacy export function for backward compatibility
export const exportFinancialModel = exportEnhancedFinancialModel;