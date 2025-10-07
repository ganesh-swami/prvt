import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Target, Zap, Info } from 'lucide-react';

interface AdvancedForecastingProps {
  projections: any;
  results: any;
  onUpdateProjections: (newProjections: any) => void;
}

const AdvancedForecasting: React.FC<AdvancedForecastingProps> = ({ 
  projections, 
  results, 
  onUpdateProjections 
}) => {
  const [forecastModel, setForecastModel] = useState('compound');
  const [seasonality, setSeasonality] = useState({
    enabled: false,
    peakMonths: '6,11,12',
    peakMultiplier: '1.3',
    lowMonths: '1,2,7,8',
    lowMultiplier: '0.8'
  });

  const [marketFactors, setMarketFactors] = useState({
    marketSize: '',
    marketGrowth: '',
    competitionFactor: '1.0',
    adoptionRate: ''
  });

  const forecastModels = {
    compound: {
      name: 'Compound Growth',
      description: 'Consistent percentage growth each period',
      formula: 'Revenue(t) = Initial × (1 + rate)^t',
      bestFor: 'Stable, growing businesses'
    },
    linear: {
      name: 'Linear Growth',
      description: 'Fixed amount increase each period',
      formula: 'Revenue(t) = Initial + (rate × t)',
      bestFor: 'Predictable, steady growth'
    },
    exponential: {
      name: 'Exponential Growth',
      description: 'Accelerating growth rate',
      formula: 'Revenue(t) = Initial × e^(rate × t)',
      bestFor: 'High-growth startups'
    },
    logistic: {
      name: 'S-Curve (Logistic)',
      description: 'Growth that levels off over time',
      formula: 'Revenue(t) = Max / (1 + e^(-rate × (t-midpoint)))',
      bestFor: 'Market saturation scenarios'
    }
  };

  const calculateAdvancedForecast = () => {
    const initial = parseFloat(projections.initialRevenue) || 0;
    const growth = parseFloat(projections.growthRate) || 0;
    const months = parseInt(projections.timeHorizon) || 12;
    
    let forecastData = [];
    
    for (let month = 1; month <= months; month++) {
      let baseRevenue = 0;
      
      // Apply selected forecasting model
      switch (forecastModel) {
        case 'compound':
          baseRevenue = initial * Math.pow(1 + growth / 100, month - 1);
          break;
        case 'linear':
          baseRevenue = initial + (initial * growth / 100 * (month - 1));
          break;
        case 'exponential':
          baseRevenue = initial * Math.exp((growth / 100) * (month - 1));
          break;
        case 'logistic':
          const maxRevenue = initial * 10; // Assume 10x initial as market cap
          const midpoint = months / 2;
          baseRevenue = maxRevenue / (1 + Math.exp(-(growth / 100) * (month - midpoint)));
          break;
      }
      
      // Apply seasonality if enabled
      let seasonalRevenue = baseRevenue;
      if (seasonality.enabled) {
        const peakMonths = seasonality.peakMonths.split(',').map(m => parseInt(m.trim()));
        const lowMonths = seasonality.lowMonths.split(',').map(m => parseInt(m.trim()));
        
        if (peakMonths.includes(month)) {
          seasonalRevenue *= parseFloat(seasonality.peakMultiplier);
        } else if (lowMonths.includes(month)) {
          seasonalRevenue *= parseFloat(seasonality.lowMultiplier);
        }
      }
      
      // Apply market factors
      const competitionImpact = parseFloat(marketFactors.competitionFactor) || 1.0;
      const finalRevenue = seasonalRevenue * competitionImpact;
      
      forecastData.push({
        month,
        baseRevenue,
        seasonalRevenue,
        finalRevenue,
        confidence: calculateConfidence(month, months)
      });
    }
    
    return forecastData;
  };

  const calculateConfidence = (month: number, totalMonths: number) => {
    // Confidence decreases over time
    const baseConfidence = 95;
    const decayRate = 2; // 2% decrease per month
    return Math.max(baseConfidence - (month * decayRate), 50);
  };

  const applyAdvancedForecast = () => {
    const forecast = calculateAdvancedForecast();
    const newInitialRevenue = forecast[0]?.finalRevenue || projections.initialRevenue;
    
    // Calculate implied growth rate from forecast
    const firstMonth = forecast[0]?.finalRevenue || 0;
    const secondMonth = forecast[1]?.finalRevenue || 0;
    const impliedGrowth = secondMonth > 0 ? ((secondMonth - firstMonth) / firstMonth * 100) : 0;
    
    onUpdateProjections({
      ...projections,
      initialRevenue: newInitialRevenue.toString(),
      growthRate: impliedGrowth.toFixed(2)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-semibold">Advanced Forecasting Models</h3>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">Forecast Models</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
          <TabsTrigger value="market">Market Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Select Forecasting Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(forecastModels).map(([key, model]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer border-2 ${
                      forecastModel === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setForecastModel(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{model.name}</h4>
                          <p className="text-sm text-gray-600">{model.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {model.bestFor}
                          </Badge>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{model.formula}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonality">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={seasonality.enabled}
                  onChange={(e) => setSeasonality({...seasonality, enabled: e.target.checked})}
                />
                <Label>Enable Seasonal Adjustments</Label>
              </div>
              
              {seasonality.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Peak Months (comma-separated)</Label>
                    <Input
                      value={seasonality.peakMonths}
                      onChange={(e) => setSeasonality({...seasonality, peakMonths: e.target.value})}
                      placeholder="6,11,12"
                    />
                  </div>
                  <div>
                    <Label>Peak Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={seasonality.peakMultiplier}
                      onChange={(e) => setSeasonality({...seasonality, peakMultiplier: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Low Months (comma-separated)</Label>
                    <Input
                      value={seasonality.lowMonths}
                      onChange={(e) => setSeasonality({...seasonality, lowMonths: e.target.value})}
                      placeholder="1,2,7,8"
                    />
                  </div>
                  <div>
                    <Label>Low Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={seasonality.lowMultiplier}
                      onChange={(e) => setSeasonality({...seasonality, lowMultiplier: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market & Competition Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Total Market Size ($)</Label>
                  <Input
                    type="number"
                    value={marketFactors.marketSize}
                    onChange={(e) => setMarketFactors({...marketFactors, marketSize: e.target.value})}
                    placeholder="Total addressable market"
                  />
                </div>
                <div>
                  <Label>Market Growth Rate (%)</Label>
                  <Input
                    type="number"
                    value={marketFactors.marketGrowth}
                    onChange={(e) => setMarketFactors({...marketFactors, marketGrowth: e.target.value})}
                    placeholder="Annual market growth"
                  />
                </div>
                <div>
                  <Label>Competition Factor</Label>
                  <Select 
                    value={marketFactors.competitionFactor} 
                    onValueChange={(value) => setMarketFactors({...marketFactors, competitionFactor: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">Low Competition (+20%)</SelectItem>
                      <SelectItem value="1.0">Moderate Competition (0%)</SelectItem>
                      <SelectItem value="0.8">High Competition (-20%)</SelectItem>
                      <SelectItem value="0.6">Intense Competition (-40%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adoption Rate (%)</Label>
                  <Input
                    type="number"
                    value={marketFactors.adoptionRate}
                    onChange={(e) => setMarketFactors({...marketFactors, adoptionRate: e.target.value})}
                    placeholder="Customer adoption rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={applyAdvancedForecast} className="flex-1">
          <Target className="h-4 w-4 mr-2" />
          Apply Advanced Forecast
        </Button>
      </div>
    </div>
  );
};

export default AdvancedForecasting;