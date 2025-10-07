import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Table } from "lucide-react";
import { AnalystResults } from "../types";

interface ProjectionsTableProps {
  results: AnalystResults;
}

const ProjectionsTable: React.FC<ProjectionsTableProps> = ({ results }) => {
  const exportToCSV = () => {
    const headers = [
      "Month", "Revenue", "COGS", "Gross Profit", "OpEx", "EBITDA", 
      "Depreciation", "EBIT", "Interest", "EBT", "Taxes", "Net Income",
      "Operating CF", "Capex", "Debt Service", "Free CF", "Ending Cash"
    ];
    
    const rows = results.months.map(m => [
      m.month,
      m.revenue.toFixed(2),
      m.cogs.toFixed(2),
      m.grossProfit.toFixed(2),
      m.opEx.toFixed(2),
      m.ebitda.toFixed(2),
      m.depreciation.toFixed(2),
      m.ebit.toFixed(2),
      m.interest.toFixed(2),
      m.ebt.toFixed(2),
      m.taxes.toFixed(2),
      m.netIncome.toFixed(2),
      m.operatingCF.toFixed(2),
      m.capex.toFixed(2),
      m.debtService.toFixed(2),
      m.freeCF.toFixed(2),
      m.endingCash.toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analyst-projections-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-blue-600" />
              Monthly Financial Projections
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left sticky left-0 bg-muted">Month</th>
                  <th className="p-2 text-right">Revenue</th>
                  <th className="p-2 text-right">COGS</th>
                  <th className="p-2 text-right">Gross Profit</th>
                  <th className="p-2 text-right">OpEx</th>
                  <th className="p-2 text-right">EBITDA</th>
                  <th className="p-2 text-right">Depreciation</th>
                  <th className="p-2 text-right">EBIT</th>
                  <th className="p-2 text-right">Interest</th>
                  <th className="p-2 text-right">EBT</th>
                  <th className="p-2 text-right">Taxes</th>
                  <th className="p-2 text-right">Net Income</th>
                  <th className="p-2 text-right">Operating CF</th>
                  <th className="p-2 text-right">Capex</th>
                  <th className="p-2 text-right">Debt Service</th>
                  <th className="p-2 text-right">Free CF</th>
                  <th className="p-2 text-right">Ending Cash</th>
                </tr>
              </thead>
              <tbody>
                {results.months.map((m) => (
                  <tr key={m.month} className="border-t hover:bg-muted/50">
                    <td className="p-2 sticky left-0 bg-background font-medium">M{m.month}</td>
                    <td className="p-2 text-right">${formatNumber(m.revenue)}</td>
                    <td className="p-2 text-right">${formatNumber(m.cogs)}</td>
                    <td className="p-2 text-right">${formatNumber(m.grossProfit)}</td>
                    <td className="p-2 text-right">${formatNumber(m.opEx)}</td>
                    <td className="p-2 text-right font-medium">${formatNumber(m.ebitda)}</td>
                    <td className="p-2 text-right">${formatNumber(m.depreciation)}</td>
                    <td className="p-2 text-right">${formatNumber(m.ebit)}</td>
                    <td className="p-2 text-right">${formatNumber(m.interest)}</td>
                    <td className="p-2 text-right">${formatNumber(m.ebt)}</td>
                    <td className="p-2 text-right">${formatNumber(m.taxes)}</td>
                    <td className="p-2 text-right font-medium">${formatNumber(m.netIncome)}</td>
                    <td className="p-2 text-right">${formatNumber(m.operatingCF)}</td>
                    <td className="p-2 text-right">${formatNumber(m.capex)}</td>
                    <td className="p-2 text-right">${formatNumber(m.debtService)}</td>
                    <td className="p-2 text-right font-medium">${formatNumber(m.freeCF)}</td>
                    <td className="p-2 text-right font-bold">${formatNumber(m.endingCash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${formatNumber(results.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${formatNumber(results.months.reduce((sum, m) => sum + m.grossProfit, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Gross Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${formatNumber(results.months.reduce((sum, m) => sum + m.netIncome, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Net Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${formatNumber(results.months.reduce((sum, m) => sum + m.freeCF, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Free Cash Flow</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectionsTable;