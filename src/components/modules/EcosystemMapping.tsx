import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ExportOptions } from '@/components/common/ExportOptions';
import SaveButtons from '@/components/common/SaveButtons';
import EcosystemMappingVisualizations from './EcosystemMappingVisualizations';
import { Users, Building2, Target, Handshake, DollarSign, Zap, Plus, Info } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  relationship: 'Supportive' | 'Neutral' | 'Opposing';
  description: string;
}

const EcosystemMapping: React.FC = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    {
      id: '1',
      name: 'Local Government',
      type: 'Key Actor',
      influence: 'High',
      interest: 'Medium',
      relationship: 'Supportive',
      description: 'Municipal authorities responsible for policy and regulation'
    },
    {
      id: '2',
      name: 'Target Beneficiaries',
      type: 'Customer',
      influence: 'Medium',
      interest: 'High',
      relationship: 'Supportive',
      description: 'Primary users of our social impact solution'
    }
  ]);

  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    type: 'Key Actor',
    influence: 'Medium' as const,
    interest: 'Medium' as const,
    relationship: 'Neutral' as const,
    description: ''
  });

  const stakeholderTypes = [
    { 
      type: 'Key Actor', 
      icon: Users, 
      color: 'bg-blue-100 text-blue-800',
      tooltip: 'Key Actors are influential stakeholders who can significantly impact your venture\'s success. Understanding their motivations helps build strategic alliances and navigate power dynamics effectively.'
    },
    { 
      type: 'Customer', 
      icon: Target, 
      color: 'bg-green-100 text-green-800',
      tooltip: 'Customers are your primary beneficiaries and revenue sources. Deep customer understanding drives product-market fit, sustainable business models, and measurable social impact.'
    },
    { 
      type: 'Partner', 
      icon: Handshake, 
      color: 'bg-purple-100 text-purple-800',
      tooltip: 'Partners provide complementary resources, capabilities, and market access. Strategic partnerships amplify impact, reduce costs, and accelerate growth through shared value creation.'
    },
    { 
      type: 'Funder', 
      icon: DollarSign, 
      color: 'bg-yellow-100 text-yellow-800',
      tooltip: 'Funders provide capital and often strategic guidance. Understanding funder priorities ensures alignment with investment criteria and unlocks resources for scaling social impact.'
    },
    { 
      type: 'Competitor', 
      icon: Zap, 
      color: 'bg-red-100 text-red-800',
      tooltip: 'Competitors shape market dynamics and innovation pace. Competitive analysis reveals market gaps, differentiation opportunities, and potential collaboration areas.'
    },
    { 
      type: 'Sector', 
      icon: Building2, 
      color: 'bg-gray-100 text-gray-800',
      tooltip: 'Sector stakeholders include industry bodies, regulators, and ecosystem players. They influence standards, policies, and market conditions that affect your venture\'s operating environment.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ecosystem Mapping</h1>
          <p className="text-muted-foreground mt-2">
            Map and analyze key stakeholders in your social venture ecosystem
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons 
            moduleKey="ecosystem-mapping" 
            moduleData={{ stakeholders }}
          />
          <ExportOptions 
            data={{ stakeholders }} 
            filename="ecosystem-mapping"
            moduleName="Ecosystem Mapping"
          />
        </div>
      </div>

      <Tabs defaultValue="mapping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mapping">Stakeholder Mapping</TabsTrigger>
          <TabsTrigger value="visualizations">Network View</TabsTrigger>
          <TabsTrigger value="analysis">Influence Analysis</TabsTrigger>
          <TabsTrigger value="strategy">Engagement Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stakeholderTypes.map((category) => {
              const Icon = category.icon;
              const categoryStakeholders = stakeholders.filter(s => s.type === category.type);
              
              return (
                <Card key={category.type} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{category.type}s</CardTitle>
                      <CustomTooltip content={category.tooltip}>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </CustomTooltip>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryStakeholders.map((stakeholder) => (
                      <div key={stakeholder.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{stakeholder.name}</h4>
                          <Badge className={category.color}>{stakeholder.relationship}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{stakeholder.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Influence: {stakeholder.influence}</Badge>
                          <Badge variant="outline">Interest: {stakeholder.interest}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <EcosystemMappingVisualizations stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Influence-Interest Matrix</CardTitle>
              <CardDescription>
                Visualize stakeholder positioning to prioritize engagement strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 h-96">
                {['High', 'Medium', 'Low'].map((interest) => (
                  <div key={interest} className="space-y-2">
                    <h4 className="font-medium text-center">{interest} Interest</h4>
                    {['High', 'Medium', 'Low'].map((influence) => (
                      <div key={`${interest}-${influence}`} className="border rounded p-2 h-24 text-sm">
                        <div className="font-medium mb-1">{influence} Influence</div>
                        {stakeholders
                          .filter(s => s.interest === interest && s.influence === influence)
                          .map(s => (
                            <Badge key={s.id} variant="secondary" className="text-xs mr-1 mb-1">
                              {s.name}
                            </Badge>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Stakeholder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Stakeholder name"
                  value={newStakeholder.name}
                  onChange={(e) => setNewStakeholder({...newStakeholder, name: e.target.value})}
                />
                <select
                  className="px-3 py-2 border rounded-md"
                  value={newStakeholder.type}
                  onChange={(e) => setNewStakeholder({...newStakeholder, type: e.target.value})}
                >
                  {stakeholderTypes.map(type => (
                    <option key={type.type} value={type.type}>{type.type}</option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Description and role"
                value={newStakeholder.description}
                onChange={(e) => setNewStakeholder({...newStakeholder, description: e.target.value})}
              />
              <Button 
                onClick={() => {
                  if (newStakeholder.name && newStakeholder.description) {
                    setStakeholders([...stakeholders, {
                      ...newStakeholder,
                      id: Date.now().toString()
                    }]);
                    setNewStakeholder({
                      name: '', type: 'Key Actor', influence: 'Medium',
                      interest: 'Medium', relationship: 'Neutral', description: ''
                    });
                  }
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stakeholder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcosystemMapping;