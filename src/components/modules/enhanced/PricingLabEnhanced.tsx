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
import { createPDFInstance, addTitlePage, addFooterToAllPages, downloadPDF } from '@/utils/pdfUtils';
import { addPricingLabContent } from '@/utils/modulePDFExports';
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
      // Create PDF using shared utilities - chain functions together
      let doc = createPDFInstance();

      // Add title page
      doc = addTitlePage(doc, "Pricing Analysis Report", "Pricing Strategy Analysis", [34, 197, 94]);

      // Add pricing content
      doc = addPricingLabContent(doc, results, pricingData, strategy, false);

      // Add footer to all pages
      doc = addFooterToAllPages(doc, "Pricing Analysis Report");

      // Download PDF
      downloadPDF(doc, "pricing-analysis-report");
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