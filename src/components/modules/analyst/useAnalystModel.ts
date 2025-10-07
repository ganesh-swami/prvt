import { useMemo } from 'react';
import { AnalystProjections, AnalystResults, AnalystMonth } from './types';
import { 
  straightLineDepreciationMonthly, 
  workingCapitalLevels, 
  debtServiceForMonth, 
  npv, 
  irr, 
  profitabilityIndex 
} from './finance';

export const computeAnalystModel = (projections: AnalystProjections): AnalystResults => {
  const months: AnalystMonth[] = [];
  let cash = projections.openingCash;
  let prevArLevel = 0, prevInvLevel = 0, prevApLevel = 0;
  
  const monthlyDepreciation = straightLineDepreciationMonthly(projections.investments, projections.assetLifeYears);
  const cashFlows: number[] = [-projections.investments]; // T0 investment
  
  for (let m = 1; m <= projections.months; m++) {
    // Revenue with growth
    const revenue = projections.initialRevenue * Math.pow(1 + projections.growthRateMonthlyPct / 100, m - 1);
    const cogs = revenue * (projections.cogsPct / 100);
    const grossProfit = revenue - cogs;
    
    // Operating expenses
    const opEx = projections.staffCosts + projections.marketingCosts + projections.adminCosts;
    const ebitda = grossProfit - opEx;
    
    // Depreciation & Interest
    const depreciation = monthlyDepreciation;
    const ebit = ebitda - depreciation;
    
    const debtSvc = debtServiceForMonth(
      projections.debtPrincipal, 
      projections.debtRateAnnualPct, 
      projections.debtTermMonths, 
      m,
      projections.interestOnly
    );
    const interest = debtSvc.interest;
    const ebt = ebit - interest;
    
    // Taxes (only on positive EBT)
    const taxes = ebt > 0 ? ebt * (projections.taxRatePct / 100) : 0;
    const netIncome = ebt - taxes;
    
    // Working Capital
    const { arLevel, invLevel, apLevel } = workingCapitalLevels(
      revenue, cogs, projections.dso, projections.dio, projections.dpo
    );
    const deltaWC = (arLevel + invLevel - apLevel) - (prevArLevel + prevInvLevel - prevApLevel);
    
    // Cash Flow
    const operatingCF = netIncome + depreciation - deltaWC;
    const capex = m === 1 ? projections.investments : 0; // Simplified
    const debtService = debtSvc.total;
    const freeCF = operatingCF - capex - debtService;
    
    cash += freeCF;
    cashFlows.push(freeCF);
    
    months.push({
      month: m,
      revenue, cogs, grossProfit, opEx, ebitda, depreciation, ebit,
      interest, ebt, taxes, netIncome,
      arLevel, invLevel, apLevel, deltaWC,
      operatingCF, capex, debtService, freeCF,
      endingCash: cash
    });
    
    prevArLevel = arLevel;
    prevInvLevel = invLevel;
    prevApLevel = apLevel;
  }
  
  // Calculate rollups
  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const avgGrossMargin = totalRevenue > 0 ? (months.reduce((sum, m) => sum + m.grossProfit, 0) / totalRevenue) * 100 : 0;
  const avgEbitdaMargin = totalRevenue > 0 ? (months.reduce((sum, m) => sum + m.ebitda, 0) / totalRevenue) * 100 : 0;
  const avgEbitMargin = totalRevenue > 0 ? (months.reduce((sum, m) => sum + m.ebit, 0) / totalRevenue) * 100 : 0;
  const avgNetMargin = totalRevenue > 0 ? (months.reduce((sum, m) => sum + m.netIncome, 0) / totalRevenue) * 100 : 0;
  
  // Working Capital metrics
  const avgCCC = projections.dso + projections.dio - projections.dpo;
  const finalCash = months[months.length - 1]?.endingCash || 0;
  const avgMonthlyBurn = months.reduce((sum, m) => sum + Math.abs(Math.min(0, m.freeCF)), 0) / months.length;
  const cashRunwayMonths = avgMonthlyBurn > 0 ? finalCash / avgMonthlyBurn : Infinity;
  
  // Valuation
  const npvValue = npv(projections.discountRateAnnualPct, cashFlows.slice(1)); // Exclude T0
  const irrValue = irr(cashFlows);
  const pi = profitabilityIndex(npvValue, projections.investments);
  
  // Additional ratios
  const avgDSCR = months.reduce((sum, m) => sum + (m.debtService > 0 ? m.operatingCF / m.debtService : 0), 0) / months.length;
  const growthRate = projections.growthRateMonthlyPct * 12; // Annualized
  const ruleOf40 = growthRate + avgEbitdaMargin;
  const burnMultiple = avgMonthlyBurn > 0 ? (totalRevenue / months.length) / avgMonthlyBurn : 0;
  
  return {
    months,
    totalRevenue,
    avgGrossMargin,
    avgEbitdaMargin, 
    avgEbitMargin,
    avgNetMargin,
    avgCCC,
    cashRunwayMonths: Math.min(cashRunwayMonths, 999), // Cap for display
    npv: npvValue,
    irr: Number.isFinite(irrValue) ? irrValue : NaN,
    profitabilityIndex: pi,
    avgDSCR,
    ruleOf40,
    burnMultiple
  };
};

export const useAnalystModel = (projections: AnalystProjections): AnalystResults => {
  return useMemo(() => computeAnalystModel(projections), [projections]);
};