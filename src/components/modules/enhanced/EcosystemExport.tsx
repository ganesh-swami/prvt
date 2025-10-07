import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Download, FileText, Image, BarChart3, Share2 } from 'lucide-react';

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

interface EcosystemExportProps {
  stakeholders: EnhancedStakeholder[];
}

const EcosystemExport: React.FC<EcosystemExportProps> = ({ stakeholders }) => {
  const exportToCSV = () => {
    const headers = [
      'Name', 'Type', 'Influence', 'Interest', 'Relationship', 'Strength', 
      'Engagement', 'Last Contact', 'Next Action', 'Risk Level', 'Description'
    ];
    
    const csvContent = [
      headers.join(','),
      ...stakeholders.map(s => [
        s.name, s.type, s.influence, s.interest, s.relationship,
        s.relationshipStrength, s.engagementLevel, s.lastContact,
        s.nextAction, s.riskLevel, `"${s.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecosystem-mapping.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stakeholders: stakeholders,
      summary: {
        totalStakeholders: stakeholders.length,
        averageRelationshipStrength: stakeholders.length > 0 
          ? (stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) / stakeholders.length).toFixed(1)
          : '0',
        engagementBreakdown: {
          active: stakeholders.filter(s => s.engagementLevel === 'Active').length,
          moderate: stakeholders.filter(s => s.engagementLevel === 'Moderate').length,
          minimal: stakeholders.filter(s => s.engagementLevel === 'Minimal').length,
          none: stakeholders.filter(s => s.engagementLevel === 'None').length
        },
        riskBreakdown: {
          high: stakeholders.filter(s => s.riskLevel === 'High').length,
          medium: stakeholders.filter(s => s.riskLevel === 'Medium').length,
          low: stakeholders.filter(s => s.riskLevel === 'Low').length
        }
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecosystem-mapping.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const report = `
ECOSYSTEM MAPPING REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
Total Stakeholders: ${stakeholders.length}
Average Relationship Strength: ${stakeholders.length > 0 
  ? (stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) / stakeholders.length).toFixed(1)
  : '0'}/10

ENGAGEMENT OVERVIEW
Active: ${stakeholders.filter(s => s.engagementLevel === 'Active').length}
Moderate: ${stakeholders.filter(s => s.engagementLevel === 'Moderate').length}
Minimal: ${stakeholders.filter(s => s.engagementLevel === 'Minimal').length}
None: ${stakeholders.filter(s => s.engagementLevel === 'None').length}

RISK ASSESSMENT
High Risk: ${stakeholders.filter(s => s.riskLevel === 'High').length}
Medium Risk: ${stakeholders.filter(s => s.riskLevel === 'Medium').length}
Low Risk: ${stakeholders.filter(s => s.riskLevel === 'Low').length}

STAKEHOLDER DETAILS
${stakeholders.map(s => `
${s.name} (${s.type})
- Influence: ${s.influence} | Interest: ${s.interest}
- Relationship: ${s.relationship} (Strength: ${s.relationshipStrength}/10)
- Engagement: ${s.engagementLevel} | Risk: ${s.riskLevel}
- Last Contact: ${s.lastContact}
- Next Action: ${s.nextAction}
- Description: ${s.description}
`).join('')}

RECOMMENDATIONS
${stakeholders.filter(s => s.relationshipStrength <= 4).length > 0 
  ? `- Immediate attention needed for ${stakeholders.filter(s => s.relationshipStrength <= 4).length} weak relationships`
  : '- No immediate relationship concerns identified'}
${stakeholders.filter(s => s.riskLevel === 'High').length > 0 
  ? `- Address ${stakeholders.filter(s => s.riskLevel === 'High').length} high-risk stakeholders`
  : '- Risk levels are manageable'}
${stakeholders.filter(s => s.engagementLevel === 'None').length > 0 
  ? `- Re-engage ${stakeholders.filter(s => s.engagementLevel === 'None').length} inactive stakeholders`
  : '- Engagement levels are healthy'}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecosystem-mapping-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareData = async () => {
    const shareData = {
      title: 'Ecosystem Mapping Analysis',
      text: `Stakeholder analysis with ${stakeholders.length} stakeholders tracked. Average relationship strength: ${stakeholders.length > 0 ? (stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) / stakeholders.length).toFixed(1) : '0'}/10`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Share data copied to clipboard!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          <CardTitle>Export & Share</CardTitle>
          <CustomTooltip content="Export your ecosystem mapping data for external analysis, reporting, or sharing with stakeholders" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export CSV
            <Badge variant="secondary" className="ml-auto">Excel</Badge>
          </Button>
          
          <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export JSON
            <Badge variant="secondary" className="ml-auto">Data</Badge>
          </Button>
          
          <Button onClick={generateReport} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
            <Badge variant="secondary" className="ml-auto">TXT</Badge>
          </Button>
          
          <Button onClick={shareData} variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Analysis
            <Badge variant="secondary" className="ml-auto">Link</Badge>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Stakeholders:</span>
              <span className="ml-2 font-medium">{stakeholders.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Relationship:</span>
              <span className="ml-2 font-medium">
                {stakeholders.length > 0 
                  ? (stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) / stakeholders.length).toFixed(1)
                  : '0'}/10
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Engagement:</span>
              <span className="ml-2 font-medium">{stakeholders.filter(s => s.engagementLevel === 'Active').length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">High Risk:</span>
              <span className="ml-2 font-medium">{stakeholders.filter(s => s.riskLevel === 'High').length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcosystemExport;