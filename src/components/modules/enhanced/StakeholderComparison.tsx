import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

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

interface StakeholderComparisonProps {
  stakeholders: EnhancedStakeholder[];
}

const StakeholderComparison: React.FC<StakeholderComparisonProps> = ({ stakeholders }) => {
  const getInfluenceScore = (influence: string) => {
    switch (influence) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getInterestScore = (interest: string) => {
    switch (interest) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getEngagementScore = (engagement: string) => {
    switch (engagement) {
      case 'Active': return 4;
      case 'Moderate': return 3;
      case 'Minimal': return 2;
      case 'None': return 1;
      default: return 0;
    }
  };

  const sortedByInfluence = [...stakeholders].sort((a, b) => 
    getInfluenceScore(b.influence) - getInfluenceScore(a.influence)
  );

  const sortedByEngagement = [...stakeholders].sort((a, b) => 
    getEngagementScore(b.engagementLevel) - getEngagementScore(a.engagementLevel)
  );

  const sortedByStrength = [...stakeholders].sort((a, b) => 
    b.relationshipStrength - a.relationshipStrength
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle>By Influence Level</CardTitle>
              <CustomTooltip content="Stakeholders ranked by their ability to impact project outcomes" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedByInfluence.map((stakeholder, index) => (
              <div key={stakeholder.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{stakeholder.name}</p>
                    <Badge variant="outline" className="text-xs">{stakeholder.influence}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{stakeholder.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle>By Engagement</CardTitle>
              <CustomTooltip content="Stakeholders ranked by current engagement activity levels" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedByEngagement.map((stakeholder, index) => (
              <div key={stakeholder.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{stakeholder.name}</p>
                    <Badge variant="outline" className="text-xs">{stakeholder.engagementLevel}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <CardTitle>By Relationship</CardTitle>
              <CustomTooltip content="Stakeholders ranked by relationship strength scores" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedByStrength.map((stakeholder, index) => (
              <div key={stakeholder.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{stakeholder.name}</p>
                    <div className="flex items-center gap-1">
                      <Progress value={stakeholder.relationshipStrength * 10} className="w-12 h-2" />
                      <span className="text-xs">{stakeholder.relationshipStrength}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakeholderComparison;