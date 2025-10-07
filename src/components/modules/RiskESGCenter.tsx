import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, CheckCircle, XCircle, Plus, TrendingUp, BarChart3 } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import MitigationStrategies from './risk/MitigationStrategies';
import RiskBenefits from './risk/RiskBenefits';


interface Risk {
  id: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  owner: string;
  mitigationStrategy: string;
  status: 'Active' | 'Resolved' | 'Mitigated' | 'Monitoring';
}

const RiskESGCenter: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([
    {
      id: 'R001',
      description: 'Market demand uncertainty for social impact products',
      category: 'Market',
      likelihood: 7,
      impact: 8,
      owner: 'Marketing Director',
      mitigationStrategy: 'Conduct extensive market research and pilot programs',
      status: 'Active'
    },
    {
      id: 'R002', 
      description: 'Regulatory changes affecting ESG compliance',
      category: 'Regulatory',
      likelihood: 6,
      impact: 9,
      owner: 'Compliance Officer',
      mitigationStrategy: 'Regular monitoring of regulatory updates and legal consultation',
      status: 'Monitoring'
    }
  ]);

  const [newRisk, setNewRisk] = useState<Partial<Risk>>({});

  const addRisk = () => {
    if (newRisk.description && newRisk.category) {
      const risk: Risk = {
        id: `R${String(risks.length + 1).padStart(3, '0')}`,
        description: newRisk.description || '',
        category: newRisk.category || '',
        likelihood: newRisk.likelihood || 5,
        impact: newRisk.impact || 5,
        owner: newRisk.owner || '',
        mitigationStrategy: newRisk.mitigationStrategy || '',
        status: 'Active'
      };
      setRisks([...risks, risk]);
      setNewRisk({});
    }
  };

  const getRiskScore = (likelihood: number, impact: number) => likelihood * impact;
  const getRiskLevel = (score: number) => {
    if (score >= 50) return { level: 'High', color: 'destructive' };
    if (score >= 25) return { level: 'Medium', color: 'default' };
    return { level: 'Low', color: 'secondary' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Risk & ESG Center</h1>
          <p className="text-muted-foreground">Comprehensive risk management and ESG compliance tracking</p>
        </div>
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="register">Risk Register</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation Strategies</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Risk Register</CardTitle>
                <CustomTooltip content="Comprehensive tracking system for identifying, assessing, and managing organizational risks. Each risk is assigned a unique ID, categorized, and tracked through its lifecycle." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {risks.map((risk) => {
                const riskScore = getRiskScore(risk.likelihood, risk.impact);
                const riskLevel = getRiskLevel(riskScore);
                
                return (
                  <Card key={risk.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{risk.id}</Badge>
                            <Badge variant={riskLevel.color as any}>{riskLevel.level}</Badge>
                          </div>
                          <h4 className="font-semibold">{risk.description}</h4>
                          <p className="text-sm text-muted-foreground">Category: {risk.category}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Likelihood:</span>
                            <span className="font-medium">{risk.likelihood}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Impact:</span>
                            <span className="font-medium">{risk.impact}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Risk Score:</span>
                            <span className="font-bold">{riskScore}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Owner:</strong> {risk.owner}</p>
                          <p className="text-sm"><strong>Status:</strong> 
                            <Badge variant="outline" className="ml-2">{risk.status}</Badge>
                          </p>
                          <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigationStrategy}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigation">
          <MitigationStrategies />
        </TabsContent>

        <TabsContent value="benefits">
          <RiskBenefits />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Risk Overview</CardTitle>
                  <CustomTooltip content="High-level summary of organizational risk profile including total risks, distribution by severity level, and overall risk exposure metrics." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Risks:</span>
                    <Badge variant="outline">{risks.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>High Risk:</span>
                    <Badge variant="destructive">{risks.filter(r => getRiskScore(r.likelihood, r.impact) >= 50).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Risk:</span>
                    <Badge variant="default">{risks.filter(r => {
                      const score = getRiskScore(r.likelihood, r.impact);
                      return score >= 25 && score < 50;
                    }).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Risk:</span>
                    <Badge variant="secondary">{risks.filter(r => getRiskScore(r.likelihood, r.impact) < 25).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Status Tracking</CardTitle>
                  <CustomTooltip content="Current status distribution showing progress in risk management activities. Active risks need immediate attention, while resolved risks demonstrate successful mitigation." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Active', 'Monitoring', 'Mitigated', 'Resolved'].map((status) => (
                    <div key={status} className="flex justify-between">
                      <span>{status}:</span>
                      <Badge variant={status === 'Active' ? 'destructive' : status === 'Resolved' ? 'default' : 'secondary'}>
                        {risks.filter(r => r.status === status).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Category Analysis</CardTitle>
                  <CustomTooltip content="Risk distribution by category helps identify areas of concentration and potential systemic vulnerabilities requiring focused attention and resources." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(risks.map(r => r.category))).map((category) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <Badge variant="outline">{risks.filter(r => r.category === category).length}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskESGCenter;