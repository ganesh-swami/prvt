import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Target, BarChart3, Calculator, Zap, Settings } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ExportOptions } from '@/components/common/ExportOptions';
import { CommentSidebar } from '@/components/collaboration/CommentSidebar';
import SaveButtons from '@/components/common/SaveButtons';
const PricingLab: React.FC = () => {
  const [pricingData, setPricingData] = useState({
    costBasis: '',
    targetMargin: '',
    competitorPrice: '',
    valueMetric: ''
  });

  const [results, setResults] = useState({
    costPlusPrice: 0,
    competitivePrice: 0,
    valueBasedPrice: 0,
    recommendedPrice: 0
  });

  // Sample data for export
  const pricingTiers = [
    { name: 'Basic', price: results.costPlusPrice, features: ['Core features', 'Email support'] },
    { name: 'Premium', price: results.recommendedPrice, features: ['All features', 'Priority support', 'Analytics'] },
    { name: 'Enterprise', price: results.valueBasedPrice, features: ['Custom features', 'Dedicated support', 'SLA'] }
  ];

  const competitorPricing = [
    { competitor: 'Competitor A', price: parseFloat(pricingData.competitorPrice) || 0 },
    { competitor: 'Our Price', price: results.recommendedPrice }
  ];

  const valueMetrics = {
    costSavings: parseFloat(pricingData.valueMetric) || 0,
    revenueIncrease: results.valueBasedPrice,
    roi: results.valueBasedPrice > 0 ? ((parseFloat(pricingData.valueMetric) || 0) / results.valueBasedPrice * 100) : 0
  };
  const calculatePricing = () => {
    const cost = parseFloat(pricingData.costBasis) || 0;
    const margin = parseFloat(pricingData.targetMargin) || 0;
    const competitor = parseFloat(pricingData.competitorPrice) || 0;
    const value = parseFloat(pricingData.valueMetric) || 0;

    const costPlusPrice = cost * (1 + margin / 100);
    const competitivePrice = competitor * 0.95; // 5% below competitor
    const valueBasedPrice = value * 0.3; // 30% of value delivered
    const recommendedPrice = Math.max(costPlusPrice, Math.min(competitivePrice, valueBasedPrice));

    setResults({
      costPlusPrice,
      competitivePrice,
      valueBasedPrice,
      recommendedPrice
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Pricing Lab</h1>
            <p className="text-muted-foreground">Optimize your pricing strategy with data-driven insights</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CommentSidebar moduleId="pricing-lab" moduleName="Pricing Lab" />
          <SaveButtons 
            moduleKey="pricing-lab" 
            moduleData={{ pricingData, results }}
            onSave={() => console.log('Pricing data saved')}
          />
          <ExportOptions 
            data={{ pricingTiers, competitorPricing, valueMetrics }}
            filename="pricing-strategy"
            moduleName="Pricing Strategy Lab"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pricing Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="costBasis">Cost Basis ($)</Label>
              <Input
                id="costBasis"
                type="number"
                value={pricingData.costBasis}
                onChange={(e) => setPricingData({...pricingData, costBasis: e.target.value})}
                placeholder="Enter your cost per unit"
              />
            </div>
            <div>
              <Label htmlFor="targetMargin">Target Margin (%)</Label>
              <Input
                id="targetMargin"
                type="number"
                value={pricingData.targetMargin}
                onChange={(e) => setPricingData({...pricingData, targetMargin: e.target.value})}
                placeholder="Enter desired margin"
              />
            </div>
            <div>
              <Label htmlFor="competitorPrice">Competitor Price ($)</Label>
              <Input
                id="competitorPrice"
                type="number"
                value={pricingData.competitorPrice}
                onChange={(e) => setPricingData({...pricingData, competitorPrice: e.target.value})}
                placeholder="Enter competitor pricing"
              />
            </div>
            <div>
              <Label htmlFor="valueMetric">Value Delivered ($)</Label>
              <Input
                id="valueMetric"
                type="number"
                value={pricingData.valueMetric}
                onChange={(e) => setPricingData({...pricingData, valueMetric: e.target.value})}
                placeholder="Enter value you provide"
              />
            </div>
            <Button onClick={calculatePricing} className="w-full">
              Calculate Optimal Price
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Cost-Plus Price</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${results.costPlusPrice.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600">Competitive Price</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${results.competitivePrice.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Value-Based Price</div>
                <div className="text-2xl font-bold text-green-600">
                  ${results.valueBasedPrice.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Recommended Price</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${results.recommendedPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingLab;