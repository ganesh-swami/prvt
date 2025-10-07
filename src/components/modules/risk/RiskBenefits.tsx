import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Brain, Users, Search, Shield, CheckCircle } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';

const RiskBenefits: React.FC = () => {
  const benefits = [
    {
      title: 'Proactive Risk Management',
      icon: Eye,
      color: 'bg-blue-500',
      description: 'Enables teams to anticipate and address potential problems before they escalate',
      details: 'Early identification allows for preventive measures rather than reactive responses',
      impact: 'Reduces crisis management costs and improves project success rates',
      tooltip: 'Systematic identification and early intervention prevents small issues from becoming major problems, saving time and resources while improving outcomes.'
    },
    {
      title: 'Improved Decision-Making',
      icon: Brain,
      color: 'bg-green-500',
      description: 'Provides a clear understanding of risks, supporting informed choices',
      details: 'Risk data enables evidence-based strategic and operational decisions',
      impact: 'Better resource allocation and strategic planning with risk-adjusted returns',
      tooltip: 'Comprehensive risk information enables leaders to make informed decisions by understanding potential consequences and trade-offs of different options.'
    },
    {
      title: 'Enhanced Accountability',
      icon: Users,
      color: 'bg-purple-500',
      description: 'Assigns ownership of risks, ensuring someone is responsible for managing them',
      details: 'Clear ownership creates responsibility and drives action on risk mitigation',
      impact: 'Improved risk response times and more effective mitigation strategies',
      tooltip: 'Designated risk owners ensure accountability and drive proactive management, preventing risks from falling through organizational cracks.'
    },
    {
      title: 'Increased Transparency',
      icon: Search,
      color: 'bg-amber-500',
      description: 'Provides a centralized view of all identified risks, promoting communication',
      details: 'Shared visibility enables better coordination and collaborative responses',
      impact: 'Enhanced team alignment and more effective cross-functional risk management',
      tooltip: 'Centralized risk visibility promotes open communication, enables better coordination, and ensures all stakeholders understand risk landscape.'
    },
    {
      title: 'Facilitates Audits',
      icon: Shield,
      color: 'bg-red-500',
      description: 'Helps demonstrate due diligence and compliance with relevant regulations',
      details: 'Documented risk management processes support regulatory compliance',
      impact: 'Reduced audit findings and improved regulatory standing',
      tooltip: 'Systematic documentation and processes demonstrate organizational maturity and compliance readiness, reducing regulatory and audit risks.'
    },
    {
      title: 'Continuous Improvement',
      icon: CheckCircle,
      color: 'bg-teal-500',
      description: 'Regular risk reviews drive organizational learning and process enhancement',
      details: 'Risk patterns reveal systemic issues and improvement opportunities',
      impact: 'Stronger organizational resilience and adaptive capacity over time',
      tooltip: 'Regular risk analysis reveals patterns and trends that drive systematic improvements in processes, controls, and organizational capabilities.'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Benefits of Risk Register Implementation</CardTitle>
            <CustomTooltip content="Risk registers provide systematic benefits across organizational functions, from strategic planning to operational execution. These benefits compound over time as risk management maturity increases." />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            A well-implemented risk register delivers measurable value across multiple organizational dimensions, 
            creating a foundation for sustainable growth and resilience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: benefit.color.replace('bg-', '').replace('-500', '') }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${benefit.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{benefit.title}</CardTitle>
                        <CustomTooltip content={benefit.tooltip} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    
                    <div>
                      <Badge variant="outline" className="mb-2">Details</Badge>
                      <p className="text-sm">{benefit.details}</p>
                    </div>
                    
                    <div>
                      <Badge variant="secondary" className="mb-2">Impact</Badge>
                      <p className="text-sm font-medium text-green-700">{benefit.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Implementation Success Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Organizational Factors:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Leadership commitment and support</li>
                    <li>• Clear roles and responsibilities</li>
                    <li>• Regular review and update cycles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Technical Factors:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• User-friendly tools and systems</li>
                    <li>• Integration with existing processes</li>
                    <li>• Training and capability building</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskBenefits;