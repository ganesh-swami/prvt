import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMarketData,
  setApproach,
  setValueUnit,
  setResults,
  setProjectId,
  saveMarketSizing,
  loadLatestMarketSizing,
  selectMarketData,
  selectApproach,
  selectValueUnit,
  selectResults,
  selectShowAnalysis,
  selectProjectId,
  selectSizingId,
  selectLoading,
  selectSaving,
  selectError,
  selectLastSaved,
} from "@/store/slices/marketSizingSlice";
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
  FileText,
  Loader2,
} from "lucide-react";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { MarketSizingAnalysis } from "@/components/modules/MarketSizingAnalysis";
import { MarketSizingMethodology } from "@/components/modules/MarketSizingMethodology";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface MarketSizingEnhancedProps {
  projectId: string;
}

const MarketSizingEnhanced: React.FC<MarketSizingEnhancedProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const { toast: toastHook } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const marketData = useAppSelector(selectMarketData);
  const approach = useAppSelector(selectApproach);
  const valueUnit = useAppSelector(selectValueUnit);
  const results = useAppSelector(selectResults);
  const showAnalysis = useAppSelector(selectShowAnalysis);
  const storedProjectId = useAppSelector(selectProjectId);
  const sizingId = useAppSelector(selectSizingId);
  const loading = useAppSelector(selectLoading);
  const saving = useAppSelector(selectSaving);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Load data on mount
  useEffect(() => {
    if (projectId && projectId !== storedProjectId) {
      dispatch(setProjectId(projectId));
      dispatch(loadLatestMarketSizing(projectId));
    }
  }, [projectId, storedProjectId, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toastHook({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toastHook]);

  // Auto-calculate when data is loaded
  useEffect(() => {
    const hasData = 
      marketData.totalMarket && 
      marketData.targetSegment && 
      marketData.penetrationRate && 
      marketData.avgRevenue;
    
    // Only auto-calculate if we have data but no results yet
    if (hasData && (!results.tam || results.tam === 0)) {
      const total = parseFloat(marketData.totalMarket) || 0;
      const segment = parseFloat(marketData.targetSegment) || 0;
      const penetration = parseFloat(marketData.penetrationRate) || 0;
      const avgRev = parseFloat(marketData.avgRevenue) || 0;

      const multiplier = valueUnit === "billions" ? 1000000000 : 1000000;
      const tam = total * multiplier;
      const sam = tam * (segment / 100);
      const som = sam * (penetration / 100);
      const revenueOpportunity = som * avgRev;

      dispatch(setResults({ tam, sam, som, revenueOpportunity }));
    }
  }, [marketData, results.tam, valueUnit, dispatch]);

  // Auto-save function
  const handleSave = async () => {
    if (!projectId) return;
    
    try {
      await dispatch(
        saveMarketSizing({
          projectId,
          sizingId,
          name: "Market Sizing Analysis",
          marketData,
          approach,
          valueUnit,
          results,
        })
      ).unwrap();
      
      toastHook({
        title: "Saved",
        description: "Market sizing data saved successfully",
      });
    } catch (err) {
      // Error handled by Redux slice
    }
  };

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

    dispatch(setResults({ tam, sam, som, revenueOpportunity }));
    
    // Auto-save after calculation
    setTimeout(() => handleSave(), 500);
  };

  const formatValue = (value: number) => {
    const divisor = valueUnit === "billions" ? 1000000000 : 1000000;
    const unit = valueUnit === "billions" ? "B" : "M";
    return `$${(value / divisor).toFixed(2)}${unit}`;
  };

  const getMarketAttractiveness = () => {
    const tamValue = results.tam / (valueUnit === "billions" ? 1000000000 : 1000000);
    if (tamValue > 10) return { level: "High", description: "high potential for investment and growth" };
    if (tamValue > 1) return { level: "Medium", description: "moderate potential for investment" };
    return { level: "Low", description: "limited market potential" };
  };

  const getCompetitivePosition = () => {
    const penetration = parseFloat(marketData.penetrationRate) || 0;
    if (penetration > 10) return { level: "Aggressive", description: "aggressive market entry approach" };
    if (penetration > 5) return { level: "Moderate", description: "moderate market entry approach" };
    return { level: "Conservative", description: "conservative market entry approach" };
  };

  const exportToPDF = async () => {
    // Check if results are calculated
    if (!results.tam || results.tam === 0) {
      toast.error("Please calculate market size before exporting!");
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Title Page
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 70, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Market Analysis Report", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Market Sizing Analysis • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Three metric cards in one row
      const cardWidth = (contentWidth - 8) / 3; // 3 cards with 4mm gap each
      const cardHeight = 40;
      
      const metrics = [
        {
          label: "TAM",
          value: formatValue(results.tam),
          description: "Total Addressable Market",
          color: [59, 130, 246], // Blue
          bgColor: [239, 246, 255] // Light blue
        },
        {
          label: "SAM",
          value: formatValue(results.sam),
          description: "Serviceable Addressable Market",
          color: [168, 85, 247], // Purple
          bgColor: [250, 245, 255] // Light purple
        },
        {
          label: "SOM",
          value: formatValue(results.som),
          description: "Serviceable Obtainable Market",
          color: [34, 197, 94], // Green
          bgColor: [240, 253, 244] // Light green
        }
      ];

      metrics.forEach((metric, index) => {
        const xPos = margin + (cardWidth + 4) * index;

        // Card background
        doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
        doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "F");
        doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "S");

        // Icon circle at top
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.circle(xPos + cardWidth / 2, yPos + 8, 3.5, "F");
        
        // Label
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(metric.label, xPos + cardWidth / 2, yPos + 17, { align: "center" });

        // Value
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(metric.value, xPos + cardWidth / 2, yPos + 26, { align: "center" });

        // Description
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        const descLines = doc.splitTextToSize(metric.description, cardWidth - 4);
        doc.text(descLines, xPos + cardWidth / 2, yPos + 32, { align: "center" });
      });

      yPos += cardHeight + 10;

      // Analysis sections
      const attractiveness = getMarketAttractiveness();
      const competitive = getCompetitivePosition();

      // Market Attractiveness Section
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Market Attractiveness", margin + 3, yPos + 6);

      // Badge
      const attractColor = attractiveness.level === "High" ? [34, 197, 94] : 
                          attractiveness.level === "Medium" ? [234, 179, 8] : [239, 68, 68];
      doc.setFillColor(attractColor[0], attractColor[1], attractColor[2]);
      doc.roundedRect(pageWidth - margin - 25, yPos + 2, 23, 6, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(attractiveness.level, pageWidth - margin - 13.5, yPos + 5.5, { align: "center" });

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const attractText = doc.splitTextToSize(
        `Based on TAM size of ${formatValue(results.tam)}, this market shows ${attractiveness.description}.`,
        contentWidth - 6
      );
      doc.text(attractText, margin + 3, yPos + 13);

      yPos += 30;

      // Competitive Strategy Section
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Competitive Strategy", margin + 3, yPos + 6);

      // Badge
      const compColor = competitive.level === "Conservative" ? [34, 197, 94] : 
                       competitive.level === "Moderate" ? [234, 179, 8] : [239, 68, 68];
      doc.setFillColor(compColor[0], compColor[1], compColor[2]);
      doc.roundedRect(pageWidth - margin - 32, yPos + 2, 30, 6, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(competitive.level, pageWidth - margin - 17, yPos + 5.5, { align: "center" });

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const compText = doc.splitTextToSize(
        `With ${marketData.penetrationRate}% market penetration target, this represents a ${competitive.description}.`,
        contentWidth - 6
      );
      doc.text(compText, margin + 3, yPos + 13);

      yPos += 30;

      // Revenue Opportunity Section
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      const revCardHeight = 45;
      
      // Card background with border
      doc.setFillColor(255, 247, 237); // Light orange
      doc.roundedRect(margin, yPos, contentWidth, revCardHeight, 3, 3, "F");
      doc.setDrawColor(249, 115, 22); // Orange border
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, yPos, contentWidth, revCardHeight, 3, 3, "S");

      // Icon circle
      doc.setFillColor(249, 115, 22); // Orange
      doc.circle(margin + 8, yPos + 12, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("$", margin + 8, yPos + 14, { align: "center" });

      // Title
      doc.setTextColor(249, 115, 22);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Revenue Opportunity", margin + 18, yPos + 13);

      // Value
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text(
        `$${results.revenueOpportunity.toLocaleString()}`,
        pageWidth / 2,
        yPos + 28,
        { align: "center" }
      );

      // Description
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Potential Annual Revenue", pageWidth / 2, yPos + 37, { align: "center" });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("Strategize+", pageWidth / 2, pageHeight - 8, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(
          new Date().toLocaleDateString(),
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`market-analysis-report-${timestamp}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market sizing data...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            size="sm"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                Export PDF
              </>
            )}
          </Button>
        </div>
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
                    dispatch(setValueUnit(value))
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
                      dispatch(
                        setMarketData({ totalMarket: e.target.value })
                      )
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
                      dispatch(
                        setMarketData({ targetSegment: e.target.value })
                      )
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
                      dispatch(
                        setMarketData({ penetrationRate: e.target.value })
                      )
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
                      dispatch(
                        setMarketData({ avgRevenue: e.target.value })
                      )
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
                <Select
                  value={approach}
                  onValueChange={(value) => dispatch(setApproach(value))}
                >
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
