import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Eye, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { SaveButtons } from '@/components/common/SaveButtons';
import { CustomTooltip } from '@/components/common/CustomTooltip';

interface Competitor {
  id: string;
  name: string;
  website: string;
  pricing: number;
  features: string[];
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  description: string;
}

export const CompetitorAnalysis: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: '1',
      name: 'CompetitorA',
      website: 'competitora.com',
      pricing: 99,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      marketShare: 25,
      strengths: ['Strong brand', 'Good pricing'],
      weaknesses: ['Limited features'],
      description: 'Market leader with strong brand recognition'
    }
  ]);

  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    name: '',
    website: '',
    pricing: 0,
    features: [],
    marketShare: 0,
    strengths: [],
    weaknesses: [],
    description: ''
  });

  const addCompetitor = () => {
    if (!newCompetitor.name) return;
    
    const competitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitor.name || '',
      website: newCompetitor.website || '',
      pricing: newCompetitor.pricing || 0,
      features: newCompetitor.features || [],
      marketShare: newCompetitor.marketShare || 0,
      strengths: newCompetitor.strengths || [],
      weaknesses: newCompetitor.weaknesses || [],
      description: newCompetitor.description || ''
    };

    setCompetitors([...competitors, competitor]);
    setNewCompetitor({
      name: '',
      website: '',
      pricing: 0,
      features: [],
      marketShare: 0,
      strengths: [],
      weaknesses: [],
      description: ''
    });
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const pricingData = competitors.map(c => ({
    name: c.name,
    pricing: c.pricing,
    marketShare: c.marketShare
  }));

  const featureComparison = competitors.map(c => ({
    name: c.name,
    features: c.features.length,
    strengths: c.strengths.length,
    weaknesses: c.weaknesses.length
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CustomTooltip content="Analyze your competitors to identify market opportunities and differentiation strategies">
            <h1 className="text-3xl font-bold text-gray-900 cursor-help">Competitor Analysis</h1>
          </CustomTooltip>
          <p className="text-gray-600 mt-2">Analyze competitors to identify differentiation opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <BarChart3 className="w-4 h-4 mr-1" />
            {competitors.length} Competitors
          </Badge>
          <SaveButtons 
            moduleKey="competitor-analysis" 
            moduleData={{ competitors, newCompetitor }}
            className="ml-4"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add">Add Competitor</TabsTrigger>
          <TabsTrigger value="charts">Comparative Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {competitor.name}
                      <Badge variant="outline">${competitor.pricing}/mo</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{competitor.website}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompetitor(competitor.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{competitor.description}</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-green-700">Strengths</Label>
                      <ul className="text-sm text-gray-600 mt-1">
                        {competitor.strengths.map((strength, idx) => (
                          <li key={idx}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-red-700">Weaknesses</Label>
                      <ul className="text-sm text-gray-600 mt-1">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <li key={idx}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Competitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={newCompetitor.name || ''}
                    onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                    placeholder="Enter competitor name"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newCompetitor.website || ''}
                    onChange={(e) => setNewCompetitor({...newCompetitor, website: e.target.value})}
                    placeholder="competitor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="pricing">Monthly Pricing ($)</Label>
                  <Input
                    id="pricing"
                    type="number"
                    value={newCompetitor.pricing || ''}
                    onChange={(e) => setNewCompetitor({...newCompetitor, pricing: Number(e.target.value)})}
                    placeholder="99"
                  />
                </div>
                <div>
                  <Label htmlFor="marketShare">Market Share (%)</Label>
                  <Input
                    id="marketShare"
                    type="number"
                    value={newCompetitor.marketShare || ''}
                    onChange={(e) => setNewCompetitor({...newCompetitor, marketShare: Number(e.target.value)})}
                    placeholder="25"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCompetitor.description || ''}
                  onChange={(e) => setNewCompetitor({...newCompetitor, description: e.target.value})}
                  placeholder="Brief description of the competitor"
                />
              </div>

              <Button onClick={addCompetitor} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pricingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pricing" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pricingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="marketShare" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={featureComparison}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar name="Features" dataKey="features" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Strengths" dataKey="strengths" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};