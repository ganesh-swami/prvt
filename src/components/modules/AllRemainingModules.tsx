import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Zap, Leaf } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ExportOptions } from '@/components/common/ExportOptions';
import SaveButtons from '@/components/common/SaveButtons';

// CompetitorAnalysis Component
export const CompetitorAnalysis: React.FC = () => {
  const [competitors, setCompetitors] = useState([
    { name: '', strengths: '', weaknesses: '', pricing: '' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CustomTooltip content="Analyze competitors to identify market positioning, pricing strategies, and competitive advantages">
            <h1 className="text-3xl font-bold">Competitor Analysis</h1>
          </CustomTooltip>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons moduleKey="competitor-analysis" moduleData={{ competitors }} />
          <ExportOptions data={{ competitors }} filename="competitor-analysis" moduleName="Competitor Analysis" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Competitive Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Competitor Name</Label>
              <Input placeholder="Enter competitor name" />
            </div>
            <div>
              <Label>Key Strengths</Label>
              <Textarea placeholder="What are their main advantages?" />
            </div>
            <div>
              <Label>Weaknesses</Label>
              <Textarea placeholder="Where do they fall short?" />
            </div>
            <div>
              <Label>Pricing Strategy</Label>
              <Input placeholder="How do they price their products?" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// RiskCenter Component
export const RiskCenter: React.FC = () => {
  const [risks, setRisks] = useState([
    { category: '', description: '', impact: '', probability: '', mitigation: '' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CustomTooltip content="Identify, assess, and manage business risks with comprehensive mitigation strategies">
            <h1 className="text-3xl font-bold">Risk Center</h1>
          </CustomTooltip>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons moduleKey="risk-center" moduleData={{ risks }} />
          <ExportOptions data={{ risks }} filename="risk-center" moduleName="Risk Management Center" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Risk Category</Label>
              <CustomTooltip content="Categorize risks (e.g., Financial, Operational, Strategic, Compliance)">
                <Input placeholder="e.g., Financial, Operational, Strategic" />
              </CustomTooltip>
            </div>
            <div>
              <Label>Risk Description</Label>
              <Textarea placeholder="Describe the potential risk in detail" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Impact Level (1-5)</Label>
                <CustomTooltip content="Rate the potential impact: 1=Low, 3=Medium, 5=High">
                  <Input type="number" min="1" max="5" placeholder="Rate 1-5" />
                </CustomTooltip>
              </div>
              <div>
                <Label>Probability (1-5)</Label>
                <CustomTooltip content="Rate the likelihood: 1=Very Low, 3=Moderate, 5=Very High">
                  <Input type="number" min="1" max="5" placeholder="Rate 1-5" />
                </CustomTooltip>
              </div>
            </div>
            <div>
              <Label>Mitigation Strategy</Label>
              <Textarea placeholder="How will you address this risk?" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ESGComplianceTracking Component
export const ESGComplianceTracking: React.FC = () => {
  const [esgData, setEsgData] = useState({
    environmental: '',
    social: '',
    governance: '',
    compliance: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CustomTooltip content="Track Environmental, Social, and Governance metrics for sustainable business practices">
            <h1 className="text-3xl font-bold">ESG Compliance Tracking</h1>
          </CustomTooltip>
        </div>
        <div className="flex items-center gap-4">
          <SaveButtons moduleKey="esg-compliance" moduleData={esgData} />
          <ExportOptions data={esgData} filename="esg-compliance" moduleName="ESG Compliance Report" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Environmental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomTooltip content="Track carbon footprint, waste reduction, energy efficiency, and environmental impact metrics">
              <Textarea 
                placeholder="Environmental initiatives and metrics..."
                value={esgData.environmental}
                onChange={(e) => setEsgData({...esgData, environmental: e.target.value})}
              />
            </CustomTooltip>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomTooltip content="Monitor employee welfare, community impact, diversity & inclusion, and social responsibility">
              <Textarea 
                placeholder="Social impact and community programs..."
                value={esgData.social}
                onChange={(e) => setEsgData({...esgData, social: e.target.value})}
              />
            </CustomTooltip>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomTooltip content="Ensure board diversity, executive compensation transparency, and ethical business practices">
              <Textarea 
                placeholder="Governance policies and practices..."
                value={esgData.governance}
                onChange={(e) => setEsgData({...esgData, governance: e.target.value})}
              />
            </CustomTooltip>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};