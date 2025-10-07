import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Target, TrendingUp, Shield, Users } from 'lucide-react';

const ESGMeasurement: React.FC = () => {
  const measurementFrameworks = [
    {
      category: 'Environmental',
      icon: <Target className="h-5 w-5 text-green-600" />,
      metrics: [
        'GHG Emissions (Scope 1, 2, 3)',
        'Energy Consumption & Renewable %',
        'Water Usage & Waste Generation',
        'Biodiversity Impact Assessment',
        'Circular Economy Indicators'
      ],
      standards: ['TCFD', 'SBTi', 'CDP', 'GRI', 'SASB']
    },
    {
      category: 'Social',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      metrics: [
        'Employee Diversity & Inclusion',
        'Health & Safety Incidents',
        'Training Hours & Development',
        'Community Investment',
        'Human Rights Due Diligence'
      ],
      standards: ['UN Global Compact', 'ILO', 'SA8000', 'B Corp']
    },
    {
      category: 'Governance',
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      metrics: [
        'Board Diversity & Independence',
        'Executive Compensation Ratio',
        'Anti-corruption Measures',
        'Data Privacy & Cybersecurity',
        'Stakeholder Engagement'
      ],
      standards: ['OECD Guidelines', 'ISO 37001', 'COSO']
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <CardTitle>How to Measure ESG Compliance</CardTitle>
            <CustomTooltip content="Comprehensive framework for measuring and tracking ESG performance using quantitative metrics, qualitative assessments, and standardized reporting frameworks." />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>ESG compliance measurement requires a systematic approach combining quantitative metrics, qualitative assessments, and standardized frameworks:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {measurementFrameworks.map((framework) => (
              <Card key={framework.category} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {framework.icon}
                    <CardTitle className="text-lg">{framework.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Metrics:</h4>
                    <ul className="space-y-1">
                      {framework.metrics.map((metric, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Standards:</h4>
                    <div className="flex flex-wrap gap-1">
                      {framework.standards.map((standard, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Measurement Methodology:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">1. Data Collection</h4>
                  <p className="text-sm text-muted-foreground">Systematic gathering of quantitative and qualitative data from internal systems, third-party assessments, and stakeholder feedback.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Benchmarking</h4>
                  <p className="text-sm text-muted-foreground">Comparison against industry peers, regulatory requirements, and international standards to assess relative performance.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Scoring & Rating</h4>
                  <p className="text-sm text-muted-foreground">Application of weighted scoring systems and third-party ESG ratings to provide standardized performance indicators.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Continuous Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Regular tracking of KPIs, trend analysis, and progress assessment against established targets and commitments.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGMeasurement;