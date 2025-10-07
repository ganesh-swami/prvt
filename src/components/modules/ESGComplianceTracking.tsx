import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Leaf, CheckCircle, XCircle, AlertTriangle, BarChart3, Plus, Target } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import SaveButtons from '@/components/common/SaveButtons';
import ESGMeasurement from '@/components/modules/enhanced/ESGMeasurement';
import ESGVisualizations from '@/components/modules/enhanced/ESGVisualizations';
import CSRDReporting from '@/components/modules/enhanced/CSRDReporting';
interface ESGIndicator {
  id: string;
  category: 'Environmental' | 'Social' | 'Governance';
  standard: string;
  indicator: string;
  description: string;
  status: 'Compliant' | 'Non-Compliant' | 'In Progress' | 'Not Started';
  completionRate: number;
  lastUpdated: string;
  evidence: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  targetDate: string;
}
const ESGComplianceTracking: React.FC = () => {
  const [indicators, setIndicators] = useState<ESGIndicator[]>([
    {
      id: 'E1-1',
      category: 'Environmental',
      standard: 'ESRS E1',
      indicator: 'Climate Change - GHG Emissions',
      description: 'Scope 1, 2, and 3 greenhouse gas emissions reporting',
      status: 'In Progress',
      completionRate: 75,
      lastUpdated: '2024-01-15',
      evidence: 'Carbon footprint assessment completed, verification pending',
      riskLevel: 'Medium',
      targetDate: '2024-03-31'
    },
    {
      id: 'S1-1',
      category: 'Social',
      standard: 'ESRS S1',
      indicator: 'Own Workforce - Working Conditions',
      description: 'Health and safety metrics, working time arrangements',
      status: 'Compliant',
      completionRate: 100,
      lastUpdated: '2024-01-10',
      evidence: 'Annual safety report filed, zero incidents recorded',
      riskLevel: 'Low',
      targetDate: '2024-02-28'
    },
    {
      id: 'G1-1',
      category: 'Governance',
      standard: 'ESRS G1',
      indicator: 'Business Conduct - Corporate Culture',
      description: 'Anti-corruption policies and whistleblower mechanisms',
      status: 'Compliant',
      completionRate: 90,
      lastUpdated: '2024-01-12',
      evidence: 'Ethics training completed, policies updated',
      riskLevel: 'Low',
      targetDate: '2024-04-15'
    },
    {
      id: 'E2-1',
      category: 'Environmental',
      standard: 'ESRS E2',
      indicator: 'Pollution - Air Quality',
      description: 'Air pollutant emissions and reduction strategies',
      status: 'Not Started',
      completionRate: 25,
      lastUpdated: '2024-01-05',
      evidence: 'Initial assessment planned for Q2',
      riskLevel: 'High',
      targetDate: '2024-06-30'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Non-Compliant': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'In Progress': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'default';
      case 'Non-Compliant': return 'destructive';
      case 'In Progress': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">ESG Compliance Tracking</h1>
            <p className="text-muted-foreground">CSRD/ESRS compliance monitoring and reporting</p>
          </div>
        </div>
        <SaveButtons 
          moduleKey="esg-compliance" 
          moduleData={{ indicators }}
          onSave={() => console.log('ESG data saved')}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visualizations">Analytics</TabsTrigger>
          <TabsTrigger value="measurement">Measurement</TabsTrigger>
          <TabsTrigger value="reporting">CSRD Reports</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Compliance Status</CardTitle>
                  <CustomTooltip content="Overall ESG compliance status based on CSRD/ESRS requirements. Tracks progress across all mandatory indicators and disclosure requirements." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Indicators:</span>
                    <Badge variant="outline">{indicators.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliant:</span>
                    <Badge variant="default">{indicators.filter(i => i.status === 'Compliant').length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <Badge variant="secondary">{indicators.filter(i => i.status === 'In Progress').length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Non-Compliant:</span>
                    <Badge variant="destructive">{indicators.filter(i => i.status === 'Non-Compliant').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Category Breakdown</CardTitle>
                  <CustomTooltip content="Distribution of ESG indicators across Environmental, Social, and Governance categories as defined by ESRS standards." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Environmental', 'Social', 'Governance'].map((category) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <Badge variant="outline">{indicators.filter(i => i.category === category).length}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Overall Progress</CardTitle>
                  <CustomTooltip content="Average completion rate across all ESG indicators, showing overall readiness for CSRD compliance reporting." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(indicators.reduce((sum, i) => sum + i.completionRate, 0) / indicators.length)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average Completion</p>
                  </div>
                  <Progress 
                    value={indicators.reduce((sum, i) => sum + i.completionRate, 0) / indicators.length} 
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>All ESG Indicators</CardTitle>
                <CustomTooltip content="Comprehensive list of all ESRS indicators being tracked for CSRD compliance, including status, completion rate, and evidence documentation." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{indicator.id}</Badge>
                          <Badge variant={indicator.category === 'Environmental' ? 'default' : 
                                        indicator.category === 'Social' ? 'secondary' : 'outline'}>
                            {indicator.category}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{indicator.indicator}</h4>
                        <p className="text-sm text-muted-foreground">{indicator.standard}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm">{indicator.description}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(indicator.status)}
                          <Badge variant={getStatusColor(indicator.status) as any}>{indicator.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Progress:</span>
                          <span className="font-medium">{indicator.completionRate}%</span>
                        </div>
                        <Progress value={indicator.completionRate} className="w-full" />
                        <p className="text-xs text-muted-foreground">Updated: {indicator.lastUpdated}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Evidence:</strong></p>
                        <p className="text-xs text-muted-foreground">{indicator.evidence}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizations">
          <ESGVisualizations indicators={indicators} />
        </TabsContent>

        <TabsContent value="measurement">
          <ESGMeasurement />
        </TabsContent>

        <TabsContent value="reporting">
          <CSRDReporting />
        </TabsContent>

        <TabsContent value="environmental">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Environmental Standards (ESRS E1-E5)</CardTitle>
                <CustomTooltip content="Environmental disclosure requirements covering climate change, pollution, water resources, biodiversity, and circular economy as mandated by ESRS E1-E5 standards." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.filter(i => i.category === 'Environmental').map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{indicator.indicator}</h4>
                        <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(indicator.status)}
                        <Badge variant={getStatusColor(indicator.status) as any}>{indicator.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Social Standards (ESRS S1-S4)</CardTitle>
                <CustomTooltip content="Social disclosure requirements covering own workforce, workers in value chain, affected communities, and consumers/end-users as mandated by ESRS S1-S4 standards." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.filter(i => i.category === 'Social').map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{indicator.indicator}</h4>
                        <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(indicator.status)}
                        <Badge variant={getStatusColor(indicator.status) as any}>{indicator.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Governance Standards (ESRS G1)</CardTitle>
                <CustomTooltip content="Governance disclosure requirements covering business conduct, management bodies, and control systems as mandated by ESRS G1 standard." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.filter(i => i.category === 'Governance').map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{indicator.indicator}</h4>
                        <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(indicator.status)}
                        <Badge variant={getStatusColor(indicator.status) as any}>{indicator.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESGComplianceTracking;