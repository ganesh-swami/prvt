import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, TrendingDown, Activity } from "lucide-react";
import { AnalystResults, AnalystProjections } from "../types";

interface WorkingCapitalPanelProps {
  results: AnalystResults;
  projections: AnalystProjections;
}

const WorkingCapitalPanel: React.FC<WorkingCapitalPanelProps> = ({ results, projections }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(timer);
  }, []);

  // Working capital trend data
  const wcData = results.months.map(m => ({
    month: `M${m.month}`,
    "Accounts Receivable": m.arLevel,
    "Inventory": m.invLevel,
    "Accounts Payable": -m.apLevel // Negative for visual clarity
  }));

  // Working capital change data
  const wcChangeData = results.months.map(m => ({
    month: `M${m.month}`,
    "ΔWC": m.deltaWC
  }));

  const formatCurrency = (value: any) => [`$${Number(value).toLocaleString()}`, ""];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-600" />
              Cash Conversion Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.avgCCC.toFixed(0)} days</div>
            <div className="text-sm text-muted-foreground mt-1">
              DSO: {projections.dso}d + DIO: {projections.dio}d - DPO: {projections.dpo}d
            </div>
            <div className="mt-2">
              {results.avgCCC <= 30 ? (
                <div className="text-green-600 text-sm font-medium">✓ Efficient</div>
              ) : results.avgCCC <= 60 ? (
                <div className="text-yellow-600 text-sm font-medium">⚠ Moderate</div>
              ) : (
                <div className="text-red-600 text-sm font-medium">✗ Slow</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Cash Runway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Number.isFinite(results.cashRunwayMonths) ? 
                `${results.cashRunwayMonths.toFixed(0)}M` : 
                "∞"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Months of cash remaining
            </div>
            <div className="mt-2">
              {!Number.isFinite(results.cashRunwayMonths) || results.cashRunwayMonths > 24 ? (
                <div className="text-green-600 text-sm font-medium">✓ Strong</div>
              ) : results.cashRunwayMonths > 12 ? (
                <div className="text-yellow-600 text-sm font-medium">⚠ Moderate</div>
              ) : (
                <div className="text-red-600 text-sm font-medium">✗ Critical</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-purple-600" />
              Working Capital Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.totalRevenue > 0 ? 
                `${((results.months[results.months.length - 1]?.arLevel + results.months[results.months.length - 1]?.invLevel - results.months[results.months.length - 1]?.apLevel) / results.totalRevenue * 100).toFixed(1)}%` : 
                "—"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              WC as % of revenue
            </div>
            <div className="mt-2">
              {results.totalRevenue > 0 && 
               ((results.months[results.months.length - 1]?.arLevel + results.months[results.months.length - 1]?.invLevel - results.months[results.months.length - 1]?.apLevel) / results.totalRevenue * 100) < 15 ? (
                <div className="text-green-600 text-sm font-medium">✓ Lean</div>
              ) : (
                <div className="text-yellow-600 text-sm font-medium">⚠ Heavy</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Working Capital Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wcData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Line type="monotone" dataKey="Accounts Receivable" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Inventory" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Accounts Payable" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Working Capital Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wcChangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="ΔWC" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Working Capital Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Working Capital Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Days Sales Outstanding (DSO)</span>
              <span className="font-bold">{projections.dso} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Days Inventory Outstanding (DIO)</span>
              <span className="font-bold">{projections.dio} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Days Payable Outstanding (DPO)</span>
              <span className="font-bold">{projections.dpo} days</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center font-semibold">
              <span>Cash Conversion Cycle</span>
              <span>{results.avgCCC.toFixed(0)} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Working Capital</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.months.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span>Accounts Receivable</span>
                  <span className="font-bold">
                    ${results.months[results.months.length - 1].arLevel.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inventory</span>
                  <span className="font-bold">
                    ${results.months[results.months.length - 1].invLevel.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Accounts Payable</span>
                  <span className="font-bold">
                    ${results.months[results.months.length - 1].apLevel.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>Net Working Capital</span>
                  <span>
                    ${(results.months[results.months.length - 1].arLevel + 
                       results.months[results.months.length - 1].invLevel - 
                       results.months[results.months.length - 1].apLevel).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkingCapitalPanel;