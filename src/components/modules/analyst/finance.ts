// Pure financial calculation utilities

export const monthlyRateFromAnnual = (annualPct: number): number => {
  return Math.pow(1 + annualPct / 100, 1/12) - 1;
};

export const straightLineDepreciationMonthly = (assetValue: number, lifeYears: number): number => {
  return assetValue / (lifeYears * 12);
};

export const workingCapitalLevels = (revenue: number, cogs: number, dso: number, dio: number, dpo: number) => {
  const arLevel = (revenue * dso) / 30; // Approx monthly
  const invLevel = (cogs * dio) / 30;
  const apLevel = (cogs * dpo) / 30;
  return { arLevel, invLevel, apLevel };
};

export const debtServiceForMonth = (
  principal: number, 
  annualRate: number, 
  termMonths: number, 
  month: number,
  interestOnly: boolean
): { interest: number; principalPayment: number; total: number } => {
  if (principal <= 0 || termMonths <= 0) return { interest: 0, principalPayment: 0, total: 0 };
  
  const monthlyRate = annualRate / 100 / 12;
  const remainingBalance = principal; // Simplified - should track balance over time
  const interest = remainingBalance * monthlyRate;
  
  if (interestOnly || month > termMonths) {
    return { interest, principalPayment: 0, total: interest };
  }
  
  const principalPayment = principal / termMonths;
  return { interest, principalPayment, total: interest + principalPayment };
};

export const npv = (annualDiscountPct: number, monthlyCashFlows: number[]): number => {
  const monthlyRate = monthlyRateFromAnnual(annualDiscountPct);
  return monthlyCashFlows.reduce((sum, cf, i) => {
    return sum + cf / Math.pow(1 + monthlyRate, i);
  }, 0);
};

export const irr = (cashFlowsWithT0: number[]): number => {
  // Simple Newton-Raphson method for IRR calculation
  if (cashFlowsWithT0.length < 2) return NaN;
  
  let rate = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  for (let i = 0; i < maxIterations; i++) {
    let npvValue = 0;
    let npvDerivative = 0;
    
    for (let t = 0; t < cashFlowsWithT0.length; t++) {
      const cf = cashFlowsWithT0[t];
      const factor = Math.pow(1 + rate, t);
      npvValue += cf / factor;
      npvDerivative -= (t * cf) / Math.pow(1 + rate, t + 1);
    }
    
    if (Math.abs(npvValue) < tolerance) return rate * 12 * 100; // Convert to annual %
    if (Math.abs(npvDerivative) < tolerance) break;
    
    rate = rate - npvValue / npvDerivative;
  }
  
  return NaN; // No convergence
};

export const profitabilityIndex = (npvValue: number, initialInvestment: number): number => {
  if (initialInvestment <= 0) return NaN;
  return (npvValue + initialInvestment) / initialInvestment;
};

export const tornado = (
  baseValue: number,
  runScenario: (inputName: string, delta: number) => number,
  spec: { [inputName: string]: number }
): { input: string; upside: number; downside: number; swing: number }[] => {
  const results = Object.entries(spec).map(([input, deltaPct]) => {
    const upside = runScenario(input, deltaPct / 100);
    const downside = runScenario(input, -deltaPct / 100);
    const swing = Math.abs(upside - downside);
    return { input, upside, downside, swing };
  });
  
  return results.sort((a, b) => b.swing - a.swing);
};

export const randNormal = (mean: number, stdDev: number): number => {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
};