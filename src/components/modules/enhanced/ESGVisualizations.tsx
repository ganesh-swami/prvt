import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

interface ESGVisualizationsProps {
  indicators: any[];
}

const ESGVisualizations: React.FC<ESGVisualizationsProps> = ({ indicators }) => {
  const categoryScores = {
    Environmental: indicators.filter(i => i.category === 'Environmental').reduce((sum, i) => sum + i.completionRate, 0) / indicators.filter(i => i.category === 'Environmental').length || 0,
    Social: indicators.filter(i => i.category === 'Social').reduce((sum, i) => sum + i.completionRate, 0) / indicators.filter(i => i.category === 'Social').length || 0,
    Governance: indicators.filter(i => i.category === 'Governance').reduce((sum, i) => sum + i.completionRate, 0) / indicators.filter(i => i.category === 'Governance').length || 0
  };

  const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 3;

  const riskLevels = [
    { level: 'Low Risk', range: '80-100%', count: indicators.filter(i => i.completionRate >= 80).length, color: 'bg-green-500' },
    { level: 'Medium Risk', range: '60-79%', count: indicators.filter(i => i.completionRate >= 60 && i.completionRate < 80).length, color: 'bg-yellow-500' },
    { level: 'High Risk', range: '40-59%', count: indicators.filter(i => i.completionRate >= 40 && i.completionRate < 60).length, color: 'bg-orange-500' },
    { level: 'Critical Risk', range: '0-39%', count: indicators.filter(i => i.completionRate < 40).length, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* ESG Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Overall ESG Score</CardTitle>
              <CustomTooltip content="Composite ESG score calculated from all indicators across Environmental, Social, and Governance categories." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {Math.round(overallScore)}
            </div>
            <Progress value={overallScore} className="w-full mb-2" />
            <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
              {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        {Object.entries(categoryScores).map(([category, score]) => (
          <Card key={category} className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2" style={{
                color: category === 'Environmental' ? '#16a34a' : 
                       category === 'Social' ? '#2563eb' : '#9333ea'
              }}>
                {Math.round(score)}
              </div>
              <Progress value={score} className="w-full mb-2" />
              <div className="text-sm text-muted-foreground">
                {indicators.filter(i => i.category === category).length} indicators
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" />
            <CardTitle>ESG Risk Heat Map</CardTitle>
            <CustomTooltip content="Visual representation of ESG risk levels based on completion rates. Critical and high-risk areas require immediate attention." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {riskLevels.map((risk) => (
              <Card key={risk.level} className="border-l-4" style={{ borderLeftColor: risk.color.replace('bg-', '') }}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{risk.level}</h4>
                    <Badge variant="outline">{risk.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{risk.range}</p>
                  <div className={`h-2 rounded-full ${risk.color}`} style={{ width: `${(risk.count / indicators.length) * 100}%` }} />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Compliance Progress Visualization</CardTitle>
            <CustomTooltip content="Progress tracking across all ESG indicators showing completion rates and status distribution for compliance monitoring." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{indicator.id}</Badge>
                    <span className="font-medium text-sm truncate">{indicator.indicator}</span>
                  </div>
                  <Progress value={indicator.completionRate} className="w-full h-2" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{indicator.completionRate}%</div>
                  <Badge 
                    variant={indicator.status === 'Compliant' ? 'default' : 
                            indicator.status === 'In Progress' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {indicator.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGVisualizations;