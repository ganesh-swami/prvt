import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calculator, Target } from "lucide-react";
import { AnalystResults, AnalystProjections } from "../types";

interface ValuationPanelProps {
  results: AnalystResults;
  projections: AnalystProjections;
}

const ValuationPanel: React.FC<ValuationPanelProps> = ({ results, projections }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(timer);
  }, []);

  // NPV sensitivity data
  const waccSensitivity = Array.from({ length: 11 }, (_, i) => {
    const wacc = projections.discountRateAnnualPct + (i - 5) * 2; // ±10% around base
    // Simplified NPV calc for sensitivity
    const totalFCF = results.months.reduce((sum, m) => sum + m.freeCF, 0);
    const avgFCF = totalFCF / results.months.length;
    const terminalValue = avgFCF * 12 / (wacc / 100); // Simplified terminal value
    const npvApprox = totalFCF + terminalValue / Math.pow(1 + wacc / 100, projections.months / 12);
    
    return {
      wacc: wacc.toFixed(1),
      npv: npvApprox
    };
  });

  // Simple payback calculation
  let cumulativeCF = -projections.investments;
  let paybackMonths = 0;
  for (const month of results.months) {
    cumulativeCF += month.freeCF;
    paybackMonths++;
    if (cumulativeCF >= 0) break;
  }
  const paybackYears = cumulativeCF >= 0 ? paybackMonths / 12 : NaN;

  return (
    <div className="space-y-6">
      {/* Valuation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-blue-600" />
              Net Present Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Number.isFinite(results.npv) ? 
                `$${(results.npv / 1000).toFixed(0)}K` : 
                "—"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              @ {projections.discountRateAnnualPct}% discount rate
            </div>
            <div className="mt-2">
              {Number.isFinite(results.npv) && results.npv > 0 ? (
                <div className="text-green-600 text-sm font-medium">✓ Positive NPV</div>
              ) : Number.isFinite(results.npv) ? (
                <div className="text-red-600 text-sm font-medium">✗ Negative NPV</div>
              ) : (
                <div className="text-gray-600 text-sm font-medium">— Not calculable</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Internal Rate of Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Number.isFinite(results.irr) ? 
                `${results.irr.toFixed(1)}%` : 
                "—"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Annual return rate
            </div>
            <div className="mt-2">
              {Number.isFinite(results.irr) && results.irr > projections.discountRateAnnualPct ? (
                <div className="text-green-600 text-sm font-medium">✓ Above hurdle rate</div>
              ) : Number.isFinite(results.irr) ? (
                <div className="text-red-600 text-sm font-medium">✗ Below hurdle rate</div>
              ) : (
                <div className="text-gray-600 text-sm font-medium">— Not solvable</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-purple-600" />
              Profitability Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Number.isFinite(results.profitabilityIndex) ? 
                results.profitabilityIndex.toFixed(2) : 
                "—"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Value per $ invested
            </div>
            <div className="mt-2">
              {Number.isFinite(results.profitabilityIndex) && results.profitabilityIndex > 1 ? (
                <div className="text-green-600 text-sm font-medium">✓ Value creating</div>
              ) : Number.isFinite(results.profitabilityIndex) ? (
                <div className="text-red-600 text-sm font-medium">✗ Value destroying</div>
              ) : (
                <div className="text-gray-600 text-sm font-medium">— Not calculable</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NPV Sensitivity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            NPV Sensitivity to Discount Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waccSensitivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wacc" label={{ value: 'Discount Rate (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'NPV ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'NPV']} />
              <Line type="monotone" dataKey="npv" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Valuation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payback Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Simple Payback Period</span>
              <span className="font-bold">
                {Number.isFinite(paybackYears) ? 
                  `${paybackYears.toFixed(1)} years` : 
                  "Never"
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Initial Investment</span>
              <span className="font-bold">${projections.investments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Free Cash Flow</span>
              <span className="font-bold">
                ${results.months.reduce((sum, m) => sum + m.freeCF, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valuation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Enterprise Value</span>
              <span className="font-bold">
                {Number.isFinite(results.npv) ? 
                  `$${((results.npv + projections.investments) / 1000).toFixed(0)}K` : 
                  "—"
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Revenue Multiple</span>
              <span className="font-bold">
                {Number.isFinite(results.npv) && results.totalRevenue > 0 ? 
                  `${((results.npv + projections.investments) / results.totalRevenue).toFixed(1)}x` : 
                  "—"
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Investment Efficiency</span>
              <span className="font-bold">
                {results.totalRevenue > 0 ? 
                  `${(results.totalRevenue / projections.investments).toFixed(1)}x` : 
                  "—"
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValuationPanel;