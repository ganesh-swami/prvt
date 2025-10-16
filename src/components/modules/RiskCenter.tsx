import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchRisks,
  addRisk as addRiskAction,
  deleteRisk as deleteRiskAction,
  updateRisk as updateRiskAction,
  setProjectId,
  setNewRisk,
  resetNewRisk,
  setShowAddForm,
  selectRisks,
  selectNewRisk,
  selectShowAddForm,
  selectLoading,
  selectSaving,
  selectError,
  selectLastSaved,
} from '@/store/slices/riskSlice';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, Plus, Trash2 } from 'lucide-react';
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

interface RiskCenterProps {
  projectId: string;
}

const RiskCenter: React.FC<RiskCenterProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const risks = useAppSelector(selectRisks);
  const newRisk = useAppSelector(selectNewRisk);
  const showAddForm = useAppSelector(selectShowAddForm);
  const loading = useAppSelector(selectLoading);
  const saving = useAppSelector(selectSaving);
  const error = useAppSelector(selectError);
  const lastSaved = useAppSelector(selectLastSaved);

  // Load risks on mount
  useEffect(() => {
    if (projectId) {
      dispatch(setProjectId(projectId));
      dispatch(fetchRisks(projectId));
    }
  }, [projectId, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const addRiskHandler = async () => {
    if (!newRisk.description || !newRisk.category) {
      toast.error('Please fill in description and category');
      return;
    }
    
    try {
      await dispatch(addRiskAction({ projectId, risk: newRisk })).unwrap();
      toast.success('Risk added successfully!');
    } catch (err) {
      toast.error('Failed to add risk');
      console.error('Error adding risk:', err);
    }
  };

  const deleteRiskHandler = async (id: string) => {
    try {
      await dispatch(deleteRiskAction(id)).unwrap();
      toast.success('Risk deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete risk');
      console.error('Error deleting risk:', err);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <div className="flex items-center gap-2">
              <CustomTooltip content="Comprehensive risk management system for identifying, assessing, and mitigating organizational risks">
                <h1 className="text-2xl sm:text-3xl font-bold cursor-help">Risk Center</h1>
              </CustomTooltip>
              {loading && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Loading...
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">Comprehensive risk management and mitigation tracking</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {risks.length} Risks
          </Badge>
          {lastSaved && (
            <div className="text-xs text-muted-foreground">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </div>
          )}
        </div>
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
                <Button onClick={() => dispatch(setShowAddForm(!showAddForm))} className="flex items-center gap-2" disabled={loading}>
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
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="description" className="text-left block">Risk Description</Label>
                          <CustomTooltip content="Clear, concise explanation of the potential risk event or condition. Include what could happen, when it might occur, and initial context. Be specific about the risk scenario to enable proper assessment and mitigation planning." />
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Describe the potential risk scenario, triggers, and context..."
                          value={newRisk.description || ''}
                          onChange={(e) => dispatch(setNewRisk({ description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="category" className="text-left block">Risk Category</Label>
                          <CustomTooltip content="Classification system for organizing risks by type. Technical: technology and system risks; Financial: budget, funding, and economic risks; Operational: process and resource risks; Market: demand and competition risks; Regulatory: compliance and legal risks; Strategic: business model and direction risks." />
                        </div>
                        <Select value={newRisk.category || ''} onValueChange={(value) => dispatch(setNewRisk({ category: value }))}>
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
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="likelihood" className="text-left block">Likelihood (1-10)</Label>
                          <CustomTooltip content="Probability assessment of risk occurrence. Scale: 1-2 Very Low (rare), 3-4 Low (unlikely), 5-6 Medium (possible), 7-8 High (likely), 9-10 Very High (almost certain). Consider historical data, current conditions, and expert judgment when rating." />
                        </div>
                        <Input
                          id="likelihood"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Rate 1-10"
                          value={newRisk.likelihood || 5}
                          onChange={(e) => dispatch(setNewRisk({ likelihood: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="impact" className="text-left block">Impact (1-10)</Label>
                          <CustomTooltip content="Severity assessment of consequences if risk occurs. Scale: 1-2 Minimal (negligible effect), 3-4 Minor (limited impact), 5-6 Moderate (significant but manageable), 7-8 Major (serious consequences), 9-10 Catastrophic (severe organizational impact). Consider financial, operational, and strategic effects." />
                        </div>
                        <Input
                          id="impact"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Rate 1-10"
                          value={newRisk.impact || 5}
                          onChange={(e) => dispatch(setNewRisk({ impact: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="owner" className="text-left block">Risk Owner</Label>
                          <CustomTooltip content="Individual accountable for monitoring, managing, and reporting on this specific risk. Should have authority and resources to implement mitigation strategies. Typically a senior role with relevant expertise and organizational influence." />
                        </div>
                        <Input
                          id="owner"
                          placeholder="Name, title, or role responsible"
                          value={newRisk.owner || ''}
                          onChange={(e) => dispatch(setNewRisk({ owner: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Label htmlFor="mitigation" className="text-left block">Mitigation Strategy</Label>
                          <CustomTooltip content="Specific actions planned to manage this risk. Choose from: Avoidance (eliminate risk), Reduction (decrease likelihood/impact), Transfer (shift to third party), or Acceptance (acknowledge and monitor). Include concrete steps, timelines, and success metrics." />
                        </div>
                        <Textarea
                          id="mitigation"
                          placeholder="Describe specific mitigation actions, timelines, and success metrics..."
                          value={newRisk.mitigationStrategy || ''}
                          onChange={(e) => dispatch(setNewRisk({ mitigationStrategy: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addRiskHandler} disabled={saving}>
                        {saving ? 'Adding...' : 'Add Risk'}
                      </Button>
                      <Button variant="outline" onClick={() => dispatch(setShowAddForm(false))} disabled={saving}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {risks.length === 0 && !showAddForm ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Risks Registered</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      Start building your risk register by identifying and documenting potential risks to your organization.
                    </p>
                    <Button
                      onClick={() => dispatch(setShowAddForm(true))}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Risk
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {risks.map((risk) => {
                const riskScore = getRiskScore(risk.likelihood, risk.impact);
                const riskLevel = getRiskLevel(riskScore);
                
                // Border color based on risk level
                const getBorderColor = (level: string) => {
                  switch (level) {
                    case 'High':
                      return 'border-l-red-500';
                    case 'Medium':
                      return 'border-l-yellow-500';
                    case 'Low':
                      return 'border-l-green-500';
                    default:
                      return 'border-l-blue-500';
                  }
                };
                
                // Status badge color mapping
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Active':
                      return 'destructive';
                    case 'Monitoring':
                      return 'default';
                    case 'Mitigated':
                      return 'secondary';
                    case 'Resolved':
                      return 'outline';
                    default:
                      return 'outline';
                  }
                };
                
                return (
                  <Card key={risk.id} className={`border-l-4 ${getBorderColor(riskLevel.level)} relative`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRiskHandler(risk.id)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 hover:bg-red-50"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    
                    <CardContent className="pt-6 pr-16">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{risk.id?.substring(0, 8)}</Badge>
                          <Badge variant={riskLevel.color as any}>{riskLevel.level}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Description:</span>
                            <h4 className="font-semibold text-base">{risk.description}</h4>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground w-24">Category:</span>
                            <span className="font-medium text-sm">{risk.category}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground w-24">Likelihood:</span>
                              <span className="font-medium">{risk.likelihood}/10</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground w-24">Impact:</span>
                              <span className="font-medium">{risk.impact}/10</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground w-24">Risk Score:</span>
                              <span className="font-bold text-base">{riskScore}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground w-24">Owner:</span>
                              <span className="font-medium text-sm">{risk.owner || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground w-24">Status:</span>
                              <Badge variant={getStatusColor(risk.status) as any}>{risk.status}</Badge>
                            </div>
                            <div className="flex items-start">
                              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Mitigation:</span>
                              <span className="font-medium text-sm" title={risk.mitigationStrategy}>
                                {risk.mitigationStrategy || 'Not defined'}
                              </span>
                            </div>
                          </div>
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