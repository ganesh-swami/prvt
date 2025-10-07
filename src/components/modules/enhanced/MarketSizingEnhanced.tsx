import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Target,
  TrendingUp,
  Globe,
  Calculator,
  DollarSign,
} from "lucide-react";
import { ExportOptions } from "@/components/common/ExportOptions";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { MarketSizingAnalysis } from "@/components/modules/MarketSizingAnalysis";
import { MarketSizingMethodology } from "@/components/modules/MarketSizingMethodology";
import { exportModuleData } from "@/utils/moduleExportUtils";

const MarketSizingEnhanced: React.FC = () => {
  const [marketData, setMarketData] = useState({
    totalMarket: "",
    targetSegment: "",
    penetrationRate: "",
    avgRevenue: "",
    marketGrowth: "",
    competitorShare: "",
  });

  const [approach, setApproach] = useState("top-down");
  const [valueUnit, setValueUnit] = useState<"millions" | "billions">(
    "billions"
  );
  const [results, setResults] = useState({
    tam: 0,
    sam: 0,
    som: 0,
    revenueOpportunity: 0,
  });
  const [showAnalysis, setShowAnalysis] = useState(false);

  const calculateMarketSize = () => {
    const total = parseFloat(marketData.totalMarket) || 0;
    const segment = parseFloat(marketData.targetSegment) || 0;
    const penetration = parseFloat(marketData.penetrationRate) || 0;
    const avgRev = parseFloat(marketData.avgRevenue) || 0;

    const multiplier = valueUnit === "billions" ? 1000000000 : 1000000;
    const tam = total * multiplier;
    const sam = tam * (segment / 100);
    const som = sam * (penetration / 100);
    const revenueOpportunity = som * avgRev;

    setResults({ tam, sam, som, revenueOpportunity });
    setShowAnalysis(true);
  };

  const formatValue = (value: number) => {
    const divisor = valueUnit === "billions" ? 1000000000 : 1000000;
    const unit = valueUnit === "billions" ? "B" : "M";
    return `$${(value / divisor).toFixed(2)}${unit}`;
  };

 
  const handleExport = (format: string) => {
    exportModuleData(
      { marketData, results },
      format,                  
      "market-sizing",         
      "Market Sizing Report"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Market Sizing Calculator
            </h1>
            <p className="text-gray-600">
              Analyze your total addressable market opportunity
            </p>
          </div>
        </div>
        <ExportOptions
          data={{ marketData, results }}
          filename="market-sizing"
          onExport={handleExport}
        />
      </div>

      <Tabs defaultValue="inputs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <TabsTrigger
            value="inputs"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Market Data
          </TabsTrigger>
          <TabsTrigger
            value="methodology"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Methodology
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            TAM/SAM/SOM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inputs">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className=" bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-4 mb-4">
                <Label className="text-sm font-medium">Value Unit:</Label>
                <Select
                  value={valueUnit}
                  onValueChange={(value: "millions" | "billions") =>
                    setValueUnit(value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="millions">Millions</SelectItem>
                    <SelectItem value="billions">Billions</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Values in {valueUnit}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="totalMarket">
                      Total Market Size (
                      {valueUnit === "billions" ? "$B" : "$M"})
                    </Label>
                    <CustomTooltip
                      title="Total Addressable Market (TAM)"
                      description="The total market demand for your product or service"
                      explanation="Represents the revenue opportunity if you achieved 100% market share"
                      justification="Helps investors understand the scale of the opportunity"
                    />
                  </div>
                  <Input
                    id="totalMarket"
                    type="number"
                    value={marketData.totalMarket}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        totalMarket: e.target.value,
                      })
                    }
                    placeholder="e.g., 50"
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <Label htmlFor="targetSegment">Target Segment (%)</Label>
                    <CustomTooltip
                      title="Serviceable Addressable Market"
                      description="Portion of TAM that matches your target customer profile"
                      explanation="Considers geographic, demographic, and behavioral constraints"
                      justification="More realistic assessment of addressable opportunity"
                    />
                  </div>
                  <Input
                    id="targetSegment"
                    type="number"
                    value={marketData.targetSegment}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        targetSegment: e.target.value,
                      })
                    }
                    placeholder="e.g., 20"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-600" />
                    <Label htmlFor="penetrationRate">
                      Market Penetration (%)
                    </Label>
                    <CustomTooltip
                      title="Serviceable Obtainable Market"
                      description="Realistic market share you can capture in the short-medium term"
                      explanation="Based on competitive landscape, resources, and execution capability"
                      justification="Sets realistic growth targets and resource requirements"
                    />
                  </div>
                  <Input
                    id="penetrationRate"
                    type="number"
                    value={marketData.penetrationRate}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        penetrationRate: e.target.value,
                      })
                    }
                    placeholder="e.g., 5"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <Label htmlFor="avgRevenue">Avg Customer Revenue ($)</Label>
                    <CustomTooltip
                      title="Average Customer Value"
                      description="Expected annual revenue per customer"
                      explanation="Used to convert market size into revenue opportunity"
                      justification="Links market size to business model and pricing strategy"
                    />
                  </div>
                  <Input
                    id="avgRevenue"
                    type="number"
                    value={marketData.avgRevenue}
                    onChange={(e) =>
                      setMarketData({
                        ...marketData,
                        avgRevenue: e.target.value,
                      })
                    }
                    placeholder="e.g., 1000"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              <Button
                onClick={calculateMarketSize}
                className="w-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Market Size
              </Button>

              {showAnalysis && (
                <MarketSizingAnalysis
                  results={results}
                  marketData={marketData}
                  valueUnit={valueUnit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology">
          <MarketSizingMethodology approach={approach} />
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Select Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Choose Your Approach</Label>
                <Select value={approach} onValueChange={setApproach}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-down">Top-Down Analysis</SelectItem>
                    <SelectItem value="bottom-up">
                      Bottom-Up Analysis
                    </SelectItem>
                    <SelectItem value="value-theory">Value Theory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  TAM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatValue(results.tam)}
                </div>
                <p className="text-blue-100 text-sm">
                  Total Addressable Market
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  SAM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatValue(results.sam)}
                </div>
                <p className="text-purple-100 text-sm">
                  Serviceable Addressable Market
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SOM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatValue(results.som)}
                </div>
                <p className="text-green-100 text-sm">
                  Serviceable Obtainable Market
                </p>
              </CardContent>
            </Card>
          </div>

          {showAnalysis && (
            <div className="mt-6">
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    ${results.revenueOpportunity.toLocaleString()}
                  </div>
                  <p className="text-orange-100 text-sm">
                    Potential Annual Revenue
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketSizingEnhanced;
