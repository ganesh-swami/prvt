import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, Plus } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { SaveButtons } from '@/components/common/SaveButtons';
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

const RiskCenter: React.FC = () => {
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
      description: 'Regulatory changes affecting compliance',
      category: 'Regulatory',
      likelihood: 6,
      impact: 9,
      owner: 'Compliance Officer',
      mitigationStrategy: 'Regular monitoring of regulatory updates and legal consultation',
      status: 'Monitoring'
    }
  ]);

  const [newRisk, setNewRisk] = useState<Partial<Risk>>({});
  const [showAddForm, setShowAddForm] = useState(false);

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
      setShowAddForm(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <CustomTooltip content="Comprehensive risk management system for identifying, assessing, and mitigating organizational risks">
              <h1 className="text-3xl font-bold cursor-help">Risk Center</h1>
            </CustomTooltip>
            <p className="text-muted-foreground">Comprehensive risk management and mitigation tracking</p>
          </div>
        </div>
        <SaveButtons 
          moduleKey="risk-center" 
          moduleData={{ risks, newRisk }}
          className="ml-4"
        />
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="register">Risk Register</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation Strategies</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="analytics">Risk Analytics</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Risk Register</CardTitle>
                  <CustomTooltip content="Comprehensive tracking system for identifying, assessing, and managing organizational risks. Each risk is assigned a unique ID, categorized, and tracked through its lifecycle." />
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Risk
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddForm && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Risk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="description">Risk Description</Label>
                          <CustomTooltip content="Clear, concise explanation of the potential risk event or condition. Include what could happen, when it might occur, and initial context. Be specific about the risk scenario to enable proper assessment and mitigation planning." />
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Describe the potential risk scenario, triggers, and context..."
                          value={newRisk.description || ''}
                          onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="category">Risk Category</Label>
                          <CustomTooltip content="Classification system for organizing risks by type. Technical: technology and system risks; Financial: budget, funding, and economic risks; Operational: process and resource risks; Market: demand and competition risks; Regulatory: compliance and legal risks; Strategic: business model and direction risks." />
                        </div>
                        <Select onValueChange={(value) => setNewRisk({...newRisk, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Financial">Financial</SelectItem>
                            <SelectItem value="Operational">Operational</SelectItem>
                            <SelectItem value="Market">Market</SelectItem>
                            <SelectItem value="Regulatory">Regulatory</SelectItem>
                            <SelectItem value="Strategic">Strategic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="likelihood">Likelihood (1-10)</Label>
                          <CustomTooltip content="Probability assessment of risk occurrence. Scale: 1-2 Very Low (rare), 3-4 Low (unlikely), 5-6 Medium (possible), 7-8 High (likely), 9-10 Very High (almost certain). Consider historical data, current conditions, and expert judgment when rating." />
                        </div>
                        <Input
                          id="likelihood"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Rate 1-10"
                          value={newRisk.likelihood || 5}
                          onChange={(e) => setNewRisk({...newRisk, likelihood: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="impact">Impact (1-10)</Label>
                          <CustomTooltip content="Severity assessment of consequences if risk occurs. Scale: 1-2 Minimal (negligible effect), 3-4 Minor (limited impact), 5-6 Moderate (significant but manageable), 7-8 Major (serious consequences), 9-10 Catastrophic (severe organizational impact). Consider financial, operational, and strategic effects." />
                        </div>
                        <Input
                          id="impact"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Rate 1-10"
                          value={newRisk.impact || 5}
                          onChange={(e) => setNewRisk({...newRisk, impact: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="owner">Risk Owner</Label>
                          <CustomTooltip content="Individual accountable for monitoring, managing, and reporting on this specific risk. Should have authority and resources to implement mitigation strategies. Typically a senior role with relevant expertise and organizational influence." />
                        </div>
                        <Input
                          id="owner"
                          placeholder="Name, title, or role responsible"
                          value={newRisk.owner || ''}
                          onChange={(e) => setNewRisk({...newRisk, owner: e.target.value})}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="mitigation">Mitigation Strategy</Label>
                          <CustomTooltip content="Specific actions planned to manage this risk. Choose from: Avoidance (eliminate risk), Reduction (decrease likelihood/impact), Transfer (shift to third party), or Acceptance (acknowledge and monitor). Include concrete steps, timelines, and success metrics." />
                        </div>
                        <Textarea
                          id="mitigation"
                          placeholder="Describe specific mitigation actions, timelines, and success metrics..."
                          value={newRisk.mitigationStrategy || ''}
                          onChange={(e) => setNewRisk({...newRisk, mitigationStrategy: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addRisk}>Add Risk</Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Risk Heat Map</CardTitle>
                  <CustomTooltip content="Visual representation of risks plotted by likelihood vs impact. High-risk items (top-right) require immediate attention, while low-risk items (bottom-left) need monitoring." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1 mb-4">
                  {Array.from({ length: 100 }, (_, i) => {
                    const likelihood = Math.floor(i / 10) + 1;
                    const impact = (i % 10) + 1;
                    const score = likelihood * impact;
                    const hasRisk = risks.some(r => r.likelihood === likelihood && r.impact === impact);
                    const level = getRiskLevel(score);
                    
                    return (
                      <div
                        key={i}
                        className={`h-4 w-4 border border-gray-200 ${
                          hasRisk 
                            ? level.color === 'destructive' ? 'bg-red-500' 
                              : level.color === 'default' ? 'bg-yellow-500' 
                              : 'bg-green-500'
                            : 'bg-gray-100'
                        }`}
                        title={`L:${likelihood} I:${impact} S:${score}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Impact →</span>
                  <span>Likelihood ↑</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Risk Trends</CardTitle>
                  <CustomTooltip content="Analysis of risk patterns and trends over time. Helps identify emerging risk areas and effectiveness of mitigation strategies." />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Average Risk Score by Category</h4>
                  {Array.from(new Set(risks.map(r => r.category))).map((category) => {
                    const categoryRisks = risks.filter(r => r.category === category);
                    const avgScore = categoryRisks.reduce((sum, r) => sum + getRiskScore(r.likelihood, r.impact), 0) / categoryRisks.length;
                    const level = getRiskLevel(avgScore);
                    
                    return (
                      <div key={category} className="flex items-center justify-between mb-2">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={level.color as any}>{avgScore.toFixed(1)}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Risk Velocity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Risks (This Period):</span>
                      <Badge variant="outline">{risks.filter(r => r.status === 'Active').length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Resolved Risks:</span>
                      <Badge variant="secondary">{risks.filter(r => r.status === 'Resolved').length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mitigation Rate:</span>
                      <Badge variant="default">
                        {risks.length > 0 ? Math.round((risks.filter(r => r.status !== 'Active').length / risks.length) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Risk Appetite & Tolerance</CardTitle>
                  <CustomTooltip content="Organizational risk appetite defines acceptable risk levels. Risks exceeding tolerance thresholds require escalation and immediate action." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {risks.filter(r => getRiskScore(r.likelihood, r.impact) < 25).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Within Appetite</div>
                    <div className="text-xs">Low Risk (Score &lt; 25)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {risks.filter(r => {
                        const score = getRiskScore(r.likelihood, r.impact);
                        return score >= 25 && score < 50;
                      }).length}
                    </div>
                    <div className="text-sm text-muted-foreground">At Tolerance</div>
                    <div className="text-xs">Medium Risk (25-49)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {risks.filter(r => getRiskScore(r.likelihood, r.impact) >= 50).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Exceeds Tolerance</div>
                    <div className="text-xs">High Risk (Score ≥ 50)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

export default RiskCenter;