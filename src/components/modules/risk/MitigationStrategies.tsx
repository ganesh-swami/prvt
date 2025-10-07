import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight, Users, FileX, CheckCircle } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';

const MitigationStrategies: React.FC = () => {
  const strategies = [
    {
      type: 'Risk Avoidance',
      icon: FileX,
      color: 'bg-red-500',
      description: 'Eliminating the risk entirely by changing the approach or scope',
      examples: [
        'Avoiding high-risk markets or customer segments',
        'Choosing alternative technologies with lower risk profiles',
        'Restructuring operations to eliminate risk sources'
      ],
      whenToUse: 'When the risk is too high to accept and alternative approaches exist',
      tooltip: 'Complete elimination of risk by changing project scope, approach, or methodology. Most effective for high-impact risks with viable alternatives.'
    },
    {
      type: 'Risk Reduction/Mitigation',
      icon: Shield,
      color: 'bg-blue-500',
      description: 'Implementing measures to decrease the likelihood or impact of the risk',
      examples: [
        'Enhanced quality control processes',
        'Staff training and development programs',
        'Implementing backup systems and redundancies'
      ],
      whenToUse: 'When risks cannot be avoided but can be managed through controls',
      tooltip: 'Proactive measures to reduce probability or impact of risks. Most common strategy involving controls, processes, and safeguards to minimize risk exposure.'
    },
    {
      type: 'Risk Transfer',
      icon: Users,
      color: 'bg-green-500',
      description: 'Shifting the responsibility for the risk to a third party',
      examples: [
        'Insurance policies for operational risks',
        'Outsourcing high-risk activities to specialists',
        'Contractual risk allocation to vendors'
      ],
      whenToUse: 'When third parties are better positioned to manage specific risks',
      tooltip: 'Shifting risk responsibility to external parties through insurance, contracts, or outsourcing. Effective when others have better risk management capabilities.'
    },
    {
      type: 'Risk Acceptance',
      icon: CheckCircle,
      color: 'bg-amber-500',
      description: 'Acknowledging the risk and accepting the potential consequences',
      examples: [
        'Setting aside contingency funds',
        'Developing response plans for risk events',
        'Regular monitoring and review processes'
      ],
      whenToUse: 'When the cost of mitigation exceeds the potential impact',
      tooltip: 'Conscious decision to accept risk exposure when mitigation costs exceed potential losses. Requires monitoring and contingency planning.'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Risk Mitigation Strategies Framework</CardTitle>
            <CustomTooltip content="Four fundamental approaches to managing organizational risks. Each strategy has specific use cases and effectiveness depending on risk characteristics and organizational capabilities." />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Choose the most appropriate strategy based on risk characteristics, organizational capabilities, and cost-benefit analysis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strategy, index) => {
              const IconComponent = strategy.icon;
              return (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: strategy.color.replace('bg-', '').replace('-500', '') }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${strategy.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{strategy.type}</CardTitle>
                        <CustomTooltip content={strategy.tooltip} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="space-y-1">
                        {strategy.examples.map((example, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">When to Use:</h4>
                      <p className="text-sm text-muted-foreground">{strategy.whenToUse}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MitigationStrategies;