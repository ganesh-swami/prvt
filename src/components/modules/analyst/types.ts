export type DepreciationMethod = "straight-line";

export interface AnalystProjections {
  // Core inputs
  initialRevenue: number;
  growthRateMonthlyPct: number;
  cogsPct: number;
  staffCosts: number;
  marketingCosts: number;
  adminCosts: number;
  investments: number;
  taxRatePct: number;
  months: number;
  discountRateAnnualPct: number;
  
  // Asset & Depreciation
  assetLifeYears: number;
  depreciationMethod: DepreciationMethod;
  
  // Working Capital
  dso: number; // Days Sales Outstanding
  dio: number; // Days Inventory Outstanding  
  dpo: number; // Days Payable Outstanding
  
  // Cash & Debt
  openingCash: number;
  debtPrincipal: number;
  debtRateAnnualPct: number;
  debtTermMonths: number;
  interestOnly: boolean;
  
  // Optional Unit Economics
  unitPrice?: number;
  unitVarCost?: number;
  cac?: number;
  arpuMonthly?: number;
  churnMonthlyPct?: number;
}

export interface AnalystMonth {
  month: number;
  
  // P&L
  revenue: number;
  cogs: number;
  grossProfit: number;
  opEx: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  ebt: number;
  taxes: number;
  netIncome: number;
  
  // Working Capital
  arLevel: number;
  invLevel: number;
  apLevel: number;
  deltaWC: number;
  
  // Cash Flow
  operatingCF: number;
  capex: number;
  debtService: number;
  freeCF: number;
  endingCash: number;
}

export interface AnalystResults {
  months: AnalystMonth[];
  
  // Rollups
  totalRevenue: number;
  avgGrossMargin: number;
  avgEbitdaMargin: number;
  avgEbitMargin: number;
  avgNetMargin: number;
  
  // Working Capital
  avgCCC: number; // Cash Conversion Cycle
  cashRunwayMonths: number;
  
  // Valuation
  npv: number;
  irr: number;
  profitabilityIndex: number;
  
  // Ratios
  avgDSCR: number; // Debt Service Coverage Ratio
  ruleOf40: number;
  burnMultiple: number;
  
  // Unit Economics (optional)
  avgCMPct?: number;
  breakEvenRevenue?: number;
  breakEvenUnits?: number;
}