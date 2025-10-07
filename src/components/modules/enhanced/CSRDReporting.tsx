import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle, AlertTriangle, Calendar, Target } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';

interface ReportTemplate {
  id: string;
  name: string;
  standard: string;
  description: string;
  completionRate: number;
  lastUpdated: string;
  status: 'Draft' | 'In Review' | 'Complete' | 'Submitted';
  dueDate: string;
}

const CSRDReporting: React.FC = () => {
  const [templates] = useState<ReportTemplate[]>([
    {
      id: 'sustainability-statement',
      name: 'Sustainability Statement',
      standard: 'CSRD Article 19a',
      description: 'Main sustainability reporting document required under CSRD',
      completionRate: 65,
      lastUpdated: '2024-01-15',
      status: 'In Review',
      dueDate: '2024-12-31'
    },
    {
      id: 'double-materiality',
      name: 'Double Materiality Assessment',
      standard: 'ESRS 1',
      description: 'Assessment of impact and financial materiality',
      completionRate: 80,
      lastUpdated: '2024-01-12',
      status: 'Complete',
      dueDate: '2024-06-30'
    },
    {
      id: 'esrs-e1-climate',
      name: 'Climate Change Report (ESRS E1)',
      standard: 'ESRS E1',
      description: 'Climate-related disclosures and transition plan',
      completionRate: 45,
      lastUpdated: '2024-01-10',
      status: 'Draft',
      dueDate: '2024-09-30'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'default';
      case 'Submitted': return 'default';
      case 'In Review': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="checklist">CSRD Checklist</TabsTrigger>
          <TabsTrigger value="materiality">Materiality</TabsTrigger>
          <TabsTrigger value="generator">Report Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={getStatusColor(template.status) as any}>
                      {template.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.standard}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Progress:</span>
                      <span className="font-medium">{template.completionRate}%</span>
                    </div>
                    <Progress value={template.completionRate} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {template.dueDate}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>CSRD Compliance Checklist</CardTitle>
                <CustomTooltip content="Comprehensive checklist covering all CSRD requirements including ESRS standards, double materiality, and reporting obligations." />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { item: 'Double Materiality Assessment completed', status: 'complete', category: 'Foundation' },
                { item: 'ESRS 1 & 2 General Requirements implemented', status: 'complete', category: 'General' },
                { item: 'Environmental disclosures (ESRS E1-E5)', status: 'progress', category: 'Environmental' },
                { item: 'Social disclosures (ESRS S1-S4)', status: 'progress', category: 'Social' },
                { item: 'Governance disclosures (ESRS G1)', status: 'complete', category: 'Governance' },
                { item: 'Digital tagging (XBRL) preparation', status: 'pending', category: 'Technical' },
                { item: 'Third-party assurance arranged', status: 'pending', category: 'Assurance' },
                { item: 'Management report integration', status: 'progress', category: 'Integration' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.status === 'complete' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                  </div>
                  <Badge variant={item.status === 'complete' ? 'default' : 
                                item.status === 'progress' ? 'secondary' : 'outline'}>
                    {item.status === 'complete' ? 'Complete' : 
                     item.status === 'progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact Materiality</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sustainability matters with significant actual or potential impacts
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { topic: 'Climate Change', impact: 'High', affected: 'Global community' },
                  { topic: 'Water Resources', impact: 'Medium', affected: 'Local communities' },
                  { topic: 'Biodiversity', impact: 'Medium', affected: 'Ecosystems' },
                  { topic: 'Worker Rights', impact: 'High', affected: 'Employees' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-xs text-muted-foreground">{item.affected}</p>
                    </div>
                    <Badge variant={item.impact === 'High' ? 'destructive' : 'secondary'}>
                      {item.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Materiality</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sustainability matters affecting financial performance
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { topic: 'Climate Risks', financial: 'High', timeframe: 'Short-term' },
                  { topic: 'Resource Scarcity', financial: 'Medium', timeframe: 'Medium-term' },
                  { topic: 'Regulatory Changes', financial: 'High', timeframe: 'Short-term' },
                  { topic: 'Reputation Risk', financial: 'Medium', timeframe: 'Long-term' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-xs text-muted-foreground">{item.timeframe}</p>
                    </div>
                    <Badge variant={item.financial === 'High' ? 'destructive' : 'secondary'}>
                      {item.financial}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Statement Generator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate CSRD-compliant sustainability statements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Report Sections</h4>
                  {[
                    'General Information (ESRS 2)',
                    'Strategy & Business Model',
                    'Governance & Organization',
                    'Impact, Risk & Opportunity Management',
                    'Metrics & Targets',
                    'Environmental Disclosures',
                    'Social Disclosures',
                    'Governance Disclosures'
                  ].map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{section}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Export Options</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate PDF Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export XBRL Tags
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Assurance Package
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSRDReporting;