import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setPricingData,
  setStrategy,
  setResults,
  setProjectId,
  savePricingLab,
  loadLatestPricingLab,
  selectPricingData,
  selectStrategy,
  selectPricingResults,
  selectProjectId,
  selectPricingId,
  selectLoading,
  selectSaving,
  selectError,
  selectLastSaved,
} from '@/store/slices/pricingLabSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DollarSign, TrendingUp, Users, Target, FileText, Loader2 } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import PricingAnalysis from './PricingAnalysis';
import PricingStrategy from './PricingStrategy';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
interface PricingLabEnhancedProps {
  projectId: string;
}

const PricingLabEnhanced: React.FC<PricingLabEnhancedProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const { toast: toastHook } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const pricingData = useAppSelector(selectPricingData);
  const strategy = useAppSelector(selectStrategy);
  const results = useAppSelector(selectPricingResults);
  const storedProjectId = useAppSelector(selectProjectId);
  const pricingId = useAppSelector(selectPricingId);
  const loading = useAppSelector(selectLoading);
  const saving = useAppSelector(selectSaving);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Load data on mount
  useEffect(() => {
    if (projectId && projectId !== storedProjectId) {
      dispatch(setProjectId(projectId));
      dispatch(loadLatestPricingLab(projectId));
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
      pricingData.costBasis && 
      pricingData.targetMargin && 
      pricingData.competitorPrice && 
      pricingData.valueDelivered;
    
    // Only auto-calculate if we have data but no results yet
    if (hasData && (!results.recommendedPrice || results.recommendedPrice === 0)) {
      const cost = parseFloat(pricingData.costBasis) || 0;
      const margin = parseFloat(pricingData.targetMargin) || 0;
      const competitor = parseFloat(pricingData.competitorPrice) || 0;
      const value = parseFloat(pricingData.valueDelivered) || 0;

      const costPlusPrice = cost * (1 + margin / 100);
      const competitivePrice = competitor * 0.95;
      const valueBasedPrice = value * 0.3;
      
      let recommendedPrice = 0;
      switch (strategy) {
        case 'cost-plus':
          recommendedPrice = costPlusPrice;
          break;
        case 'competitive':
          recommendedPrice = competitivePrice;
          break;
        case 'value-based':
          recommendedPrice = valueBasedPrice;
          break;
        default:
          recommendedPrice = (costPlusPrice + competitivePrice + valueBasedPrice) / 3;
      }

      const elasticity = pricingData.priceElasticity[0] / 100;
      const demandForecast = 1000 * (1 - elasticity * (recommendedPrice / 100));

      dispatch(setResults({
        costPlusPrice,
        competitivePrice,
        valueBasedPrice,
        recommendedPrice,
        demandForecast: Math.max(0, demandForecast)
      }));
    }
  }, [pricingData, results.recommendedPrice, strategy, dispatch]);

  // Auto-save function
  const handleSave = async () => {
    if (!projectId) return;
    
    try {
      await dispatch(
        savePricingLab({
          projectId,
          pricingId,
          name: "Pricing Analysis",
          pricingData,
          strategy,
          results,
        })
      ).unwrap();
      
      toastHook({
        title: "Saved",
        description: "Pricing lab data saved successfully",
      });
    } catch (err) {
      // Error handled by Redux slice
    }
  };

  const calculatePricing = () => {
    const cost = parseFloat(pricingData.costBasis) || 0;
    const margin = parseFloat(pricingData.targetMargin) || 0;
    const competitor = parseFloat(pricingData.competitorPrice) || 0;
    const value = parseFloat(pricingData.valueDelivered) || 0;

    const costPlusPrice = cost * (1 + margin / 100);
    const competitivePrice = competitor * 0.95; // 5% below competitor
    const valueBasedPrice = value * 0.3; // 30% of value delivered
    
    let recommendedPrice = 0;
    switch (strategy) {
      case 'cost-plus':
        recommendedPrice = costPlusPrice;
        break;
      case 'competitive':
        recommendedPrice = competitivePrice;
        break;
      case 'value-based':
        recommendedPrice = valueBasedPrice;
        break;
      default:
        recommendedPrice = (costPlusPrice + competitivePrice + valueBasedPrice) / 3;
    }

    // Simple demand forecast based on price elasticity
    const elasticity = pricingData.priceElasticity[0] / 100;
    const demandForecast = 1000 * (1 - elasticity * (recommendedPrice / 100));

    dispatch(setResults({
      costPlusPrice,
      competitivePrice,
      valueBasedPrice,
      recommendedPrice,
      demandForecast: Math.max(0, demandForecast)
    }));
    
    // Auto-save after calculation
    setTimeout(() => handleSave(), 500);
  };

  const exportToPDF = async () => {
    // Check if results are calculated
    if (!results.recommendedPrice || results.recommendedPrice === 0) {
      toast.error("Please analyze pricing options before exporting!");
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
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(0, 0, pageWidth, 70, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Pricing Analysis Report", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Pricing Strategy Analysis • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

      // Four pricing cards in a 2x2 grid
      const cardWidth = (contentWidth - 4) / 2;
      const cardHeight = 35;
      
      const pricingCards = [
        {
          number: "1",
          title: "Cost-Plus Price",
          price: results.costPlusPrice,
          description: "Based on cost + margin",
          color: [59, 130, 246], // Blue
          bgColor: [239, 246, 255]
        },
        {
          number: "2",
          title: "Competitive Price",
          price: results.competitivePrice,
          description: "5% below competitor",
          color: [168, 85, 247], // Purple
          bgColor: [250, 245, 255]
        },
        {
          number: "3",
          title: "Value-Based Price",
          price: results.valueBasedPrice,
          description: "30% of value delivered",
          color: [34, 197, 94], // Green
          bgColor: [240, 253, 244]
        },
        {
          number: "★",
          title: "Recommended Price",
          price: results.recommendedPrice,
          description: `${Math.round(results.demandForecast)} units`,
          color: [249, 115, 22], // Orange
          bgColor: [255, 247, 237]
        }
      ];

      // Draw pricing cards
      pricingCards.forEach((card, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const xPos = margin + (cardWidth + 4) * col;
        const cardYPos = yPos + (cardHeight + 4) * row;

        // Card background
        doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
        doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "F");
        doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "S");

        // Number circle
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.circle(xPos + 8, cardYPos + 8, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(card.number, xPos + 8, cardYPos + 10, { align: "center" });

        // Title
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(card.title, xPos + 14, cardYPos + 9);

        // Price
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`$${card.price.toFixed(2)}`, xPos + cardWidth / 2, cardYPos + 22, { align: "center" });

        // Description
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(card.description, xPos + cardWidth / 2, cardYPos + 29, { align: "center" });
      });

      yPos += cardHeight * 2 + 12;

      // Pricing Analysis Report Section
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      // Calculate analysis metrics
      const cost = parseFloat(pricingData.costBasis) || 0;
      const profitMargin = ((results.recommendedPrice - cost) / cost) * 100;
      const revenueProjection = results.recommendedPrice * results.demandForecast;
      
      const prices = [results.costPlusPrice, results.competitivePrice, results.valueBasedPrice];
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      let positioning = "Competitive";
      if (results.recommendedPrice > avgPrice * 1.2) positioning = "Premium";
      if (results.recommendedPrice < avgPrice * 0.8) positioning = "Budget";

      // Analysis metrics - 3 cards in one row
      const metricCardWidth = (contentWidth - 8) / 3;
      const metricCardHeight = 30;

      const metrics = [
        {
          icon: "$",
          label: "Recommended Price",
          value: `$${results.recommendedPrice.toFixed(2)}`,
          badge: `${positioning} Positioning`,
          color: [34, 197, 94]
        },
        {
          icon: "%",
          label: "Profit Margin",
          value: `${profitMargin.toFixed(1)}%`,
          badge: profitMargin > 30 ? "Healthy" : "Monitor",
          color: [59, 130, 246]
        },
        {
          icon: "#",
          label: "Demand Forecast",
          value: `${Math.round(results.demandForecast)}`,
          badge: "Units/Month",
          color: [168, 85, 247]
        }
      ];

      metrics.forEach((metric, index) => {
        const xPos = margin + (metricCardWidth + 4) * index;

        // Card background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "F");
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "S");

        // Icon
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.circle(xPos + metricCardWidth / 2, yPos + 7, 2.5, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(metric.icon, xPos + metricCardWidth / 2, yPos + 8.5, { align: "center" });

        // Label
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(metric.label, xPos + metricCardWidth / 2, yPos + 14, { align: "center" });

        // Value
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(metric.value, xPos + metricCardWidth / 2, yPos + 21, { align: "center" });

        // Badge
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(metric.badge, xPos + metricCardWidth / 2, yPos + 26, { align: "center" });
      });

      yPos += metricCardHeight + 8;

      // Strategy Assessment Section
      if (yPos > pageHeight - 35) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "F");
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Strategy Assessment", margin + 3, yPos + 7);

      // Strategy details
      const elasticity = pricingData.priceElasticity[0];
      let riskLevel = "Low";
      if (elasticity > 70) riskLevel = "High";
      else if (elasticity > 40) riskLevel = "Medium";

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);

      const strategyText = [
        `Selected Strategy: ${strategy.replace('-', ' ').toUpperCase()}`,
        `Price Sensitivity Risk: ${riskLevel}`,
        `Revenue Projection: $${revenueProjection.toLocaleString()}`
      ];

      strategyText.forEach((text, index) => {
        doc.text(text, margin + 3, yPos + 14 + (index * 4));
      });

      yPos += 33;

      // Strategic Recommendations
      if (yPos > pageHeight - 45) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, yPos, contentWidth, 38, 2, 2, "F");
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 38, 2, 2, "S");

      doc.setTextColor(22, 163, 74);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Strategic Recommendations", margin + 3, yPos + 7);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(21, 128, 61);

      const recommendations = [];
      if (profitMargin > 50) recommendations.push("• Consider value-based positioning with premium features");
      if (profitMargin < 20) recommendations.push("• Review cost structure to improve profitability");
      if (elasticity > 60) recommendations.push("• High price sensitivity - consider competitive pricing");
      if (results.recommendedPrice > results.competitivePrice * 1.2) {
        recommendations.push("• Ensure clear value differentiation for premium pricing");
      }
      recommendations.push("• Monitor competitor pricing changes regularly");
      recommendations.push("• Test pricing with small customer segments before full rollout");

      recommendations.forEach((rec, index) => {
        doc.text(rec, margin + 3, yPos + 13 + (index * 4));
      });

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
        doc.setTextColor(34, 197, 94);
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
      doc.save(`pricing-analysis-report-${timestamp}.pdf`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing lab data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg">
            <DollarSign className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Pricing Lab Pro
          </h1>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inputs">Pricing Inputs</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="results">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <Target className="h-5 w-5" />
                </div>
                Pricing Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="costBasis">Cost Basis ($)</Label>
                    <CustomTooltip
                      title="Cost Basis"
                      description="Total cost to deliver your product or service including direct costs, overhead, and operational expenses"
                      explanation="This forms the foundation of your pricing strategy and ensures you maintain profitability"
                      justification="Essential for ensuring profitability and setting minimum price floor to avoid losses"
                    />
                  </div>
                  <Input
                    id="costBasis"
                    type="number"
                    value={pricingData.costBasis}
                    onChange={(e) => dispatch(setPricingData({ costBasis: e.target.value }))}
                    placeholder="e.g., 50"
                    className="border-2 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="targetMargin">Target Margin (%)</Label>
                    <CustomTooltip
                      title="Target Margin"
                      description="Desired profit margin percentage that determines your markup over cost basis"
                      explanation="Higher margins provide more resources for growth, R&D, and market expansion"
                      justification="Ensures business sustainability, growth investment capability, and competitive positioning"
                    />
                  </div>
                  <Input
                    id="targetMargin"
                    type="number"
                    value={pricingData.targetMargin}
                    onChange={(e) => dispatch(setPricingData({ targetMargin: e.target.value }))}
                    placeholder="e.g., 40"
                    className="border-2 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="competitorPrice">Competitor Price ($)</Label>
                    <CustomTooltip
                      title="Competitive Pricing"
                      description="Average price of similar offerings in the market used as benchmark for positioning"
                      explanation="Understanding competitive landscape helps position your offering appropriately"
                      justification="Helps ensure market competitiveness, customer acceptance, and strategic positioning"
                    />
                  </div>
                  <Input
                    id="competitorPrice"
                    type="number"
                    value={pricingData.competitorPrice}
                    onChange={(e) => dispatch(setPricingData({ competitorPrice: e.target.value }))}
                    placeholder="e.g., 100"
                    className="border-2 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="valueDelivered">Value Delivered ($)</Label>
                    <CustomTooltip
                      title="Customer Value"
                      description="Quantified value your solution provides including cost savings, revenue increases, and efficiency gains"
                      explanation="Value-based pricing captures the economic benefit customers receive from your solution"
                      justification="Justifies premium pricing based on value creation and customer ROI"
                    />
                  </div>
                  <Input
                    id="valueDelivered"
                    type="number"
                    value={pricingData.valueDelivered}
                    onChange={(e) => dispatch(setPricingData({ valueDelivered: e.target.value }))}
                    placeholder="e.g., 500"
                    className="border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Label>Price Elasticity</Label>
                  <CustomTooltip
                    title="Price Elasticity"
                    description="How sensitive demand is to price changes - higher values mean customers are more price-sensitive"
                    explanation="Price elasticity helps predict how demand will respond to different pricing levels"
                    justification="Helps predict demand response to pricing decisions and optimize revenue"
                  />
                </div>
                <Slider
                  value={pricingData.priceElasticity}
                  onValueChange={(value) => dispatch(setPricingData({ priceElasticity: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low Sensitivity</span>
                  <span className="font-semibold text-purple-600">{pricingData.priceElasticity[0]}%</span>
                  <span>High Sensitivity</span>
                </div>
              </div>

              <Button 
                onClick={calculatePricing} 
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Analyze Pricing Options
              </Button>
              
              {results.recommendedPrice > 0 && (
                <PricingAnalysis 
                  results={results} 
                  strategy={strategy} 
                  pricingData={pricingData} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="strategy">
          <PricingStrategy strategy={strategy} setStrategy={(value) => dispatch(setStrategy(value))} />
        </TabsContent>

        <TabsContent value="results">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    Cost-Plus Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    ${results.costPlusPrice.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Based on cost + margin</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    Competitive Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-purple-600">
                    ${results.competitivePrice.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">5% below competitor</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    Value-Based Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-green-600">
                    ${results.valueBasedPrice.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">30% of value delivered</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                      ★
                    </div>
                    Recommended Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    ${results.recommendedPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Expected demand:</span>
                    <span className="font-semibold text-orange-600">
                      {Math.round(results.demandForecast)} units
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingLabEnhanced;