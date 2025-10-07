import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, Users } from 'lucide-react';

interface PricingAnalysisProps {
  results: {
    costPlusPrice: number;
    competitivePrice: number;
    valueBasedPrice: number;
    recommendedPrice: number;
    demandForecast: number;
  };
  strategy: string;
  pricingData: {
    costBasis: string;
    targetMargin: string;
    competitorPrice: string;
    valueDelivered: string;
    priceElasticity: number[];
  };
}

const PricingAnalysis: React.FC<PricingAnalysisProps> = ({ results, strategy, pricingData }) => {
  const cost = parseFloat(pricingData.costBasis) || 0;
  const margin = ((results.recommendedPrice - cost) / cost) * 100;
  const revenueProjection = results.recommendedPrice * results.demandForecast;
  
  const getPricePositioning = () => {
    const prices = [results.costPlusPrice, results.competitivePrice, results.valueBasedPrice];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    if (results.recommendedPrice > avgPrice * 1.2) return { level: 'Premium', color: 'bg-purple-100 text-purple-800' };
    if (results.recommendedPrice < avgPrice * 0.8) return { level: 'Budget', color: 'bg-blue-100 text-blue-800' };
    return { level: 'Competitive', color: 'bg-green-100 text-green-800' };
  };

  const positioning = getPricePositioning();

  const getRiskLevel = () => {
    const elasticity = pricingData.priceElasticity[0];
    if (elasticity > 70) return { level: 'High', color: 'text-red-600', icon: AlertTriangle };
    if (elasticity > 40) return { level: 'Medium', color: 'text-yellow-600', icon: AlertTriangle };
    return { level: 'Low', color: 'text-green-600', icon: CheckCircle };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <TrendingUp className="h-5 w-5" />
            Pricing Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Recommended Price</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${results.recommendedPrice.toFixed(2)}
              </div>
              <Badge className={positioning.color}>{positioning.level} Positioning</Badge>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Profit Margin</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {margin.toFixed(1)}%
              </div>
              <Badge variant={margin > 30 ? "default" : "secondary"}>
                {margin > 30 ? "Healthy" : "Monitor"}
              </Badge>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Demand Forecast</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(results.demandForecast)}
              </div>
              <Badge variant="outline">Units/Month</Badge>
            </div>
          </div>

          {/* Strategy Analysis */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Strategy Assessment</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selected Strategy:</span>
                <Badge variant="default">{strategy.replace('-', ' ').toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price Sensitivity Risk:</span>
                <div className="flex items-center gap-2">
                  <risk.icon className={`h-4 w-4 ${risk.color}`} />
                  <span className={`text-sm font-medium ${risk.color}`}>{risk.level}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Projection:</span>
                <span className="font-semibold text-green-600">
                  ${revenueProjection.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Strategic Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              {margin > 50 && (
                <li>• Consider value-based positioning with premium features</li>
              )}
              {margin < 20 && (
                <li>• Review cost structure to improve profitability</li>
              )}
              {pricingData.priceElasticity[0] > 60 && (
                <li>• High price sensitivity - consider competitive pricing</li>
              )}
              {results.recommendedPrice > results.competitivePrice * 1.2 && (
                <li>• Ensure clear value differentiation for premium pricing</li>
              )}
              <li>• Monitor competitor pricing changes regularly</li>
              <li>• Test pricing with small customer segments before full rollout</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingAnalysis;