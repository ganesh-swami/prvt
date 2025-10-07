import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import StakeholderForm from './StakeholderForm';
import NetworkVisualization from './NetworkVisualization';
import StakeholderComparison from './StakeholderComparison';
import RelationshipTimeline from './RelationshipTimeline';
import EcosystemExport from './EcosystemExport';
import CollaborationTools from './CollaborationTools';
import EngagementReminders from './EngagementReminders';
import { Calendar, TrendingUp, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface EnhancedStakeholder {
  id: string;
  name: string;
  type: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  relationship: 'Supportive' | 'Neutral' | 'Opposing';
  relationshipStrength: number;
  engagementLevel: 'Active' | 'Moderate' | 'Minimal' | 'None';
  lastContact: string;
  nextAction: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  contactInfo?: string;
}

const EcosystemMappingEnhanced: React.FC = () => {
  const [stakeholders, setStakeholders] = useState<EnhancedStakeholder[]>([
    {
      id: '1',
      name: 'Local Government',
      type: 'Key Actor',
      influence: 'High',
      interest: 'Medium',
      relationship: 'Supportive',
      relationshipStrength: 7,
      engagementLevel: 'Moderate',
      lastContact: '2024-01-15',
      nextAction: 'Schedule policy discussion meeting',
      riskLevel: 'Low',
      description: 'Municipal authorities responsible for policy and regulation'
    },
    {
      id: '2',
      name: 'Target Beneficiaries',
      type: 'Customer',
      influence: 'Medium',
      interest: 'High',
      relationship: 'Supportive',
      relationshipStrength: 9,
      engagementLevel: 'Active',
      lastContact: '2024-01-20',
      nextAction: 'Conduct user feedback session',
      riskLevel: 'Low',
      description: 'Primary users of our social impact solution'
    }
  ]);

  const addStakeholder = (stakeholderData: any) => {
    const newStakeholder: EnhancedStakeholder = {
      ...stakeholderData,
      id: Date.now().toString()
    };
    setStakeholders([...stakeholders, newStakeholder]);
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Minimal': return 'bg-orange-100 text-orange-800';
      case 'None': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Ecosystem Mapping</h1>
        <p className="text-muted-foreground mt-2">
          Advanced stakeholder tracking with engagement analytics and relationship management
        </p>
      </div>

      <StakeholderForm onAddStakeholder={addStakeholder} />

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="tracking">Engagement</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="relationships">Strength</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="collaboration">Collaborate</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stakeholders.map((stakeholder) => (
              <Card key={stakeholder.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                      <Badge className={getEngagementColor(stakeholder.engagementLevel)}>
                        {stakeholder.engagementLevel}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {stakeholder.relationshipStrength}/10
                    </Badge>
                  </div>
                  <CardDescription>{stakeholder.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Relationship Strength</span>
                      <span>{stakeholder.relationshipStrength}/10</span>
                    </div>
                    <Progress value={stakeholder.relationshipStrength * 10} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Contact:</span>
                      <p className="font-medium">{stakeholder.lastContact}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Level:</span>
                      <Badge variant={stakeholder.riskLevel === 'High' ? 'destructive' : 'secondary'}>
                        {stakeholder.riskLevel}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Next Action:</span>
                    <p className="font-medium">{stakeholder.nextAction}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <NetworkVisualization stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <CardTitle>Relationship Strength Analysis</CardTitle>
                <CustomTooltip content="Track relationship quality over time to identify strengthening or weakening connections. Strong relationships (8-10) are strategic assets, while weak relationships (1-4) need attention to prevent risks." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{stakeholder.name}</h4>
                        <Badge variant="outline">{stakeholder.type}</Badge>
                      </div>
                      <Progress value={stakeholder.relationshipStrength * 10} className="w-full" />
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold">{stakeholder.relationshipStrength}/10</div>
                      <div className="text-sm text-muted-foreground">
                        {stakeholder.relationshipStrength >= 8 ? 'Strong' : 
                         stakeholder.relationshipStrength >= 6 ? 'Moderate' : 'Weak'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <CardTitle>Engagement Overview</CardTitle>
                  <CustomTooltip content="Monitor overall stakeholder engagement levels to identify areas needing attention. Active engagement drives better outcomes and reduces project risks." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Active', 'Moderate', 'Minimal', 'None'].map((level) => {
                    const count = stakeholders.filter(s => s.engagementLevel === level).length;
                    const percentage = stakeholders.length > 0 ? (count / stakeholders.length) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm">{level}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-16" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <CardTitle>Risk Assessment</CardTitle>
                  <CustomTooltip content="Identify stakeholders with high risk levels that could impact project success. Proactive risk management prevents issues from escalating." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['High', 'Medium', 'Low'].map((risk) => {
                    const count = stakeholders.filter(s => s.riskLevel === risk).length;
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <span className="text-sm">{risk} Risk</span>
                        <Badge variant={risk === 'High' ? 'destructive' : 'secondary'}>
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <CardTitle>Relationship Health</CardTitle>
                  <CustomTooltip content="Overall relationship portfolio health. Strong relationships (8+) provide stability, while weak relationships (4-) need immediate attention." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Strength</span>
                    <span className="text-lg font-bold">
                      {stakeholders.length > 0 ? (stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) / stakeholders.length).toFixed(1) : '0'}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Strong Relationships</span>
                    <Badge variant="secondary">
                      {stakeholders.filter(s => s.relationshipStrength >= 8).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Need Attention</span>
                    <Badge variant="destructive">
                      {stakeholders.filter(s => s.relationshipStrength <= 4).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <CardTitle>Action Planning Dashboard</CardTitle>
                <CustomTooltip content="Systematic approach to stakeholder engagement planning. Prioritized actions ensure strategic relationship building and risk mitigation." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{stakeholder.name}</h4>
                        <p className="text-sm text-muted-foreground">{stakeholder.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{stakeholder.lastContact}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">Next Action:</p>
                      <p className="text-sm">{stakeholder.nextAction}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getEngagementColor(stakeholder.engagementLevel)}>
                        {stakeholder.engagementLevel}
                      </Badge>
                      <Badge variant={stakeholder.riskLevel === 'High' ? 'destructive' : 'secondary'}>
                        {stakeholder.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <StakeholderComparison stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <RelationshipTimeline stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationTools stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <EngagementReminders stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <EcosystemExport stakeholders={stakeholders} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcosystemMappingEnhanced;