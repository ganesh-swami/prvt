import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, BarChart3, Target } from "lucide-react";
import { AnalystResults, AnalystProjections } from "../types";
import { tornado, randNormal } from "../finance";
import { computeAnalystModel } from "../useAnalystModel";

interface RiskPanelProps {
  results: AnalystResults;
  projections: AnalystProjections;
}

const RiskPanel: React.FC<RiskPanelProps> = ({ results, projections }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(timer);
  }, []);

  // Tornado analysis
  const tornadoData = useMemo(() => {
    const baseNPV = results.npv;
    
    const runScenario = (inputName: string, delta: number) => {
      const adjustedProjections = { ...projections };
      
      switch (inputName) {
        case "Revenue Growth":
          adjustedProjections.growthRateMonthlyPct *= (1 + delta);
          break;
        case "COGS":
          adjustedProjections.cogsPct *= (1 + delta);
          break;
        case "Staff Costs":
          adjustedProjections.staffCosts *= (1 + delta);
          break;
        case "Discount Rate":
          adjustedProjections.discountRateAnnualPct *= (1 + delta);
          break;
        case "Initial Revenue":
          adjustedProjections.initialRevenue *= (1 + delta);
          break;
        default:
          return baseNPV;
      }
      
      const scenarioResults = computeAnalystModel(adjustedProjections);
      return scenarioResults.npv;
    };

    const spec = {
      "Revenue Growth": 20,
      "Initial Revenue": 15,
      "COGS": 15,
      "Staff Costs": 10,
      "Discount Rate": 10
    };

    return tornado(baseNPV, runScenario, spec).map(item => ({
      input: item.input,
      upside: (item.upside - baseNPV) / 1000,
      downside: (item.downside - baseNPV) / 1000,
      swing: item.swing / 1000
    }));
  }, [results.npv, projections]);

  // Monte Carlo simulation
  const monteCarloData = useMemo(() => {
    const simulations = 1000;
    const npvResults: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      const adjustedProjections = { ...projections };
      
      // Add randomness to key variables
      adjustedProjections.initialRevenue *= (1 + randNormal(0, 0.1));
      adjustedProjections.growthRateMonthlyPct *= (1 + randNormal(0, 0.2));
      adjustedProjections.cogsPct *= (1 + randNormal(0, 0.05));
      adjustedProjections.staffCosts *= (1 + randNormal(0, 0.1));
      
      const scenarioResults = computeAnalystModel(adjustedProjections);
      npvResults.push(scenarioResults.npv);
    }
    
    // Create histogram data
    const sorted = npvResults.sort((a, b) => a - b);
    const p5 = sorted[Math.floor(simulations * 0.05)];
    const p50 = sorted[Math.floor(simulations * 0.50)];
    const p95 = sorted[Math.floor(simulations * 0.95)];
    
    // Create bins for histogram
    const min = Math.min(...npvResults);
    const max = Math.max(...npvResults);
    const binCount = 20;
    const binSize = (max - min) / binCount;
    
    const histogram = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = npvResults.filter(v => v >= binStart && v < binEnd).length;
      
      return {
        bin: `${(binStart / 1000).toFixed(0)}K`,
        count,
        binCenter: binStart + binSize / 2
      };
    });
    
    return { histogram, p5, p50, p95 };
  }, [projections]);

  return (
    <div className="space-y-6">
      {/* Monte Carlo Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-red-600" />
              NPV P5 (Worst Case)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(monteCarloData.p5 / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              5th percentile outcome
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-blue-600" />
              NPV P50 (Expected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(monteCarloData.p50 / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              50th percentile outcome
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-green-600" />
              NPV P95 (Best Case)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(monteCarloData.p95 / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              95th percentile outcome
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Tornado Analysis (NPV Impact)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tornadoData} layout="horizontal" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'NPV Impact ($K)', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="input" width={80} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(0)}K`, 'Impact']} />
                <Bar dataKey="upside" fill="#10B981" />
                <Bar dataKey="downside" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Monte Carlo NPV Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monteCarloData.histogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: 'NPV ($K)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Risk Factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tornadoData.slice(0, 3).map((item, index) => (
              <div key={item.input} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                  {item.input}
                </span>
                <span className="font-bold">±${item.swing.toFixed(0)}K</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Probability of Positive NPV</span>
              <span className="font-bold">
                {((monteCarloData.histogram.filter(bin => bin.binCenter > 0).reduce((sum, bin) => sum + bin.count, 0) / 1000) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Value at Risk (P5)</span>
              <span className="font-bold">${(monteCarloData.p5 / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Expected Value (P50)</span>
              <span className="font-bold">${(monteCarloData.p50 / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Upside Potential (P95)</span>
              <span className="font-bold">${(monteCarloData.p95 / 1000).toFixed(0)}K</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskPanel;