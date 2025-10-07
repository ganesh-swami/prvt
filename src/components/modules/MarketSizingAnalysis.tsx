import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, CheckCircle, Target, BarChart3, DollarSign } from 'lucide-react';

interface AnalysisProps {
  results: {
    tam: number;
    sam: number;
    som: number;
    revenueOpportunity: number;
  };
  marketData: {
    totalMarket: string;
    targetSegment: string;
    penetrationRate: string;
    avgRevenue: string;
  };
  valueUnit: 'millions' | 'billions';
}

export const MarketSizingAnalysis: React.FC<AnalysisProps> = ({ results, marketData, valueUnit }) => {
  const formatValue = (value: number) => {
    const divisor = valueUnit === 'billions' ? 1000000000 : 1000000;
    const unit = valueUnit === 'billions' ? 'B' : 'M';
    return `$${(value / divisor).toFixed(2)}${unit}`;
  };

  const getMarketAttractiveness = () => {
    const tamValue = results.tam / (valueUnit === 'billions' ? 1000000000 : 1000000);
    if (tamValue > 10) return { level: 'High', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (tamValue > 1) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    return { level: 'Low', color: 'bg-red-100 text-red-800', icon: AlertCircle };
  };

  const getCompetitivePosition = () => {
    const penetration = parseFloat(marketData.penetrationRate) || 0;
    if (penetration > 10) return { level: 'Aggressive', color: 'bg-red-100 text-red-800' };
    if (penetration > 5) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Conservative', color: 'bg-green-100 text-green-800' };
  };

  const attractiveness = getMarketAttractiveness();
  const competitive = getCompetitivePosition();
  const IconComponent = attractiveness.icon;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Market Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{formatValue(results.tam)}</div>
              <div className="text-sm text-gray-600">Total Addressable Market</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{formatValue(results.sam)}</div>
              <div className="text-sm text-gray-600">Serviceable Available Market</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{formatValue(results.som)}</div>
              <div className="text-sm text-gray-600">Serviceable Obtainable Market</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Market Attractiveness</span>
                <Badge className={attractiveness.color}>
                  <IconComponent className="h-3 w-3 mr-1" />
                  {attractiveness.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Based on TAM size of {formatValue(results.tam)}, this market shows {attractiveness.level.toLowerCase()} potential for investment and growth.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Competitive Strategy</span>
                <Badge className={competitive.color}>
                  {competitive.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                With {marketData.penetrationRate}% market penetration target, this represents a {competitive.level.toLowerCase()} market entry approach.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};