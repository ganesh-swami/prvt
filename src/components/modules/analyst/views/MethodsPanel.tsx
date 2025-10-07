import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calculator, TrendingUp, Activity } from "lucide-react";

const MethodsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Financial Model Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            This analyst-grade financial model uses industry-standard methodologies to project
            financial performance and calculate key valuation metrics.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Valuation Formulas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Net Present Value (NPV)</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                NPV = Σ(CFt / (1 + r)^t) - Initial Investment
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Where CFt = cash flow in period t, r = discount rate
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Internal Rate of Return (IRR)</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                0 = Σ(CFt / (1 + IRR)^t)
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Solved iteratively using Newton-Raphson method
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Profitability Index (PI)</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                PI = (NPV + Initial Investment) / Initial Investment
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Values &gt; 1.0 indicate value creation
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Working Capital Formulas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Cash Conversion Cycle (CCC)</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                CCC = DSO + DIO - DPO
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Working Capital Levels</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                AR = (Revenue × DSO) / 30<br />
                Inventory = (COGS × DIO) / 30<br />
                AP = (COGS × DPO) / 30
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Approximated using 30-day months
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Operating Cash Flow</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                OCF = Net Income + Depreciation - ΔWorking Capital
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Adjusted for non-cash items and working capital changes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Cash Flow Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Free Cash Flow</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                FCF = Operating Cash Flow - Capex - Debt Service
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cash available to equity holders after all obligations
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Debt Service</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                Interest = Outstanding Balance × (Annual Rate / 12)<br />
                Principal = Total Principal / Term (if not interest-only)
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Simplified straight-line principal repayment
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Depreciation</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                Monthly Depreciation = Asset Value / (Life in Years × 12)
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Straight-line method over asset life
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Revenue Growth</h4>
              <p className="text-sm text-muted-foreground">
                Compound monthly growth applied to base revenue. Growth compounds each month.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Tax Treatment</h4>
              <p className="text-sm text-muted-foreground">
                Taxes applied only to positive Earnings Before Tax (EBT). No tax benefits for losses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Risk Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Tornado analysis shows NPV sensitivity to ±10–20% changes in key variables.
                Monte Carlo uses normal distributions with 10–20% standard deviations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Valuation Approach</h4>
              <p className="text-sm text-muted-foreground">
                DCF-based valuation using monthly cash flows. Terminal value not included
                in base case — model shows explicit forecast period only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MethodsPanel;
