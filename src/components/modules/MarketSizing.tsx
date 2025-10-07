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
import { TrendingUp, Calculator, Globe, Users, DollarSign, BarChart3, PieChart, Target } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ExportOptions } from '@/components/common/ExportOptions';
import SaveButtons from '@/components/common/SaveButtons';
import MarketSizingAnalysis from './MarketSizingAnalysis';
import MarketSizingMethodology from './MarketSizingMethodology';

const MarketSizing: React.FC = () => {
  const [accounts, setAccounts] = useState(10000);
  const [price, setPrice] = useState(5000);
  const [penetration, setPenetration] = useState(5);
  
  const tam = accounts * price;
  const sam = tam * 0.3; // 30% of TAM
  const som = tam * (penetration / 100);
  
  const methodology = "Bottom-up analysis based on addressable accounts and pricing";
  const segments = [
    { name: "Primary Market", size: som, percentage: penetration },
    { name: "Secondary Market", size: sam - som, percentage: 30 - penetration }
  ];
  
  const marketData = {
    accounts,
    price,
    penetration,
    tam,
    sam,
    som,
    methodology,
    segments
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Market Sizing</h1>
            <p className="text-muted-foreground">TAM, SAM, SOM analysis and market opportunity assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons 
            moduleKey="market-sizing" 
            moduleData={marketData}
            onSave={() => console.log('Market sizing data saved')}
          />
          <ExportOptions 
            data={{ tam, sam, som, methodology, segments }}
            filename="market-sizing"
            moduleName="Market Sizing Analysis"
          />
        </div>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8" />
                <span className="text-blue-100 text-sm font-medium">TAM</span>
              </div>
              <div className="text-3xl font-bold mb-2">${(tam / 1000000).toFixed(0)}M</div>
              <div className="text-blue-100 text-sm">Total Addressable Market</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8" />
                <span className="text-purple-100 text-sm font-medium">SAM</span>
              </div>
              <div className="text-3xl font-bold mb-2">${(tam * 0.3 / 1000000).toFixed(0)}M</div>
              <div className="text-purple-100 text-sm">Serviceable Available Market</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Calculator className="w-8 h-8" />
                <span className="text-green-100 text-sm font-medium">SOM</span>
              </div>
              <div className="text-3xl font-bold mb-2">${(som / 1000000).toFixed(1)}M</div>
              <div className="text-green-100 text-sm">Serviceable Obtainable Market</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bottom-Up Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accounts">Total Addressable Accounts</Label>
                  <Input
                    id="accounts"
                    type="number"
                    value={accounts}
                    onChange={(e) => setAccounts(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Average Annual Contract Value ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="penetration">Market Penetration (%)</Label>
                  <Input
                    id="penetration"
                    type="range"
                    min="1"
                    max="20"
                    value={penetration}
                    onChange={(e) => setPenetration(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-1">{penetration}%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Conservative (-20%)</div>
                  <div className="text-xl font-bold">${(som * 0.8 / 1000000).toFixed(1)}M</div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-sm font-medium mb-2">Base Case</div>
                  <div className="text-xl font-bold">${(som / 1000000).toFixed(1)}M</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-700 mb-2">Optimistic (+50%)</div>
                  <div className="text-xl font-bold text-green-900">${(som * 1.5 / 1000000).toFixed(1)}M</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <MarketSizingAnalysis results={{ tam, som }} marketData={marketData} valueUnit="millions" />
        </TabsContent>

        <TabsContent value="methodology">
          <MarketSizingMethodology approach="bottom-up" />
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Market insights and recommendations will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketSizing;