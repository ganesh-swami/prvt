import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, Users, Target, Calculator, Zap, Shield, Award } from 'lucide-react';

interface PricingStrategyProps {
  strategy: string;
  setStrategy: (strategy: string) => void;
}

const PricingStrategy: React.FC<PricingStrategyProps> = ({ strategy, setStrategy }) => {
  const strategies = [
    {
      id: 'cost-plus',
      name: 'Cost-Plus Pricing',
      icon: Calculator,
      color: 'blue',
      description: 'Add a fixed markup to your costs to determine price',
      indicators: [
        'Production costs and overhead expenses',
        'Target profit margins and ROI requirements',
        'Break-even analysis and volume projections',
        'Cost structure stability and predictability'
      ],
      advantages: [
        'Simple to calculate and understand',
        'Ensures cost recovery and profit margin',
        'Provides pricing consistency',
        'Easy to justify to stakeholders'
      ],
      limitations: [
        'Ignores market demand and competition',
        'May not optimize revenue potential',
        'Doesn\'t account for customer value perception',
        'Can lead to overpricing or underpricing'
      ],
      bestFor: 'Manufacturing, utilities, regulated industries'
    },
    {
      id: 'competitive',
      name: 'Competitive Pricing',
      icon: TrendingUp,
      color: 'purple',
      description: 'Set prices based on competitor analysis and market positioning',
      indicators: [
        'Competitor pricing research and monitoring',
        'Market share and positioning analysis',
        'Product differentiation and feature comparison',
        'Customer switching costs and loyalty factors'
      ],
      advantages: [
        'Market-aligned pricing strategy',
        'Reduces price-based competition risk',
        'Quick market entry and acceptance',
        'Leverages market intelligence'
      ],
      limitations: [
        'May ignore unique value proposition',
        'Can lead to price wars',
        'Assumes competitors price optimally',
        'Difficult to achieve differentiation'
      ],
      bestFor: 'Commoditized markets, new market entry, price-sensitive segments'
    },
    {
      id: 'value-based',
      name: 'Value-Based Pricing',
      icon: Award,
      color: 'green',
      description: 'Price based on the perceived value delivered to customers',
      indicators: [
        'Customer willingness to pay research',
        'Value proposition quantification',
        'ROI and cost savings for customers',
        'Competitive advantage and differentiation'
      ],
      advantages: [
        'Maximizes revenue potential',
        'Aligns price with customer value',
        'Supports premium positioning',
        'Encourages innovation and quality'
      ],
      limitations: [
        'Requires deep customer understanding',
        'Complex to implement and communicate',
        'May face customer price resistance',
        'Needs strong value demonstration'
      ],
      bestFor: 'Innovative products, B2B solutions, premium brands, consulting services'
    },
    {
      id: 'hybrid',
      name: 'Hybrid Approach',
      icon: Zap,
      color: 'orange',
      description: 'Combine multiple pricing strategies for optimal results',
      indicators: [
        'Multi-factor pricing model development',
        'Weighted strategy importance analysis',
        'Market segment pricing variations',
        'Dynamic pricing capability assessment'
      ],
      advantages: [
        'Balances multiple pricing factors',
        'Provides pricing flexibility',
        'Adapts to different market conditions',
        'Reduces single-strategy risks'
      ],
      limitations: [
        'More complex to implement',
        'Requires sophisticated analysis',
        'May confuse pricing communication',
        'Needs ongoing strategy optimization'
      ],
      bestFor: 'Complex products, multiple market segments, dynamic markets'
    }
  ];

  const selectedStrategy = strategies.find(s => s.id === strategy);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Target className="h-5 w-5" />
            Pricing Strategy Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-base font-medium">Choose Your Primary Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <s.icon className="h-4 w-4" />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedStrategy && (
        <Card className="bg-white shadow-lg">
          <CardHeader className={`bg-gradient-to-r from-${selectedStrategy.color}-100 to-${selectedStrategy.color}-50 border-b`}>
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${selectedStrategy.color}-500 text-white`}>
                <selectedStrategy.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-xl font-bold text-${selectedStrategy.color}-800`}>
                  {selectedStrategy.name}
                </h3>
                <p className={`text-sm text-${selectedStrategy.color}-600 mt-1`}>
                  {selectedStrategy.description}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Key Indicators */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Key Indicators & Factors
              </h4>
              <ul className="space-y-2">
                {selectedStrategy.indicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>

            {/* Advantages & Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Advantages
                </h4>
                <ul className="space-y-2">
                  {selectedStrategy.advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Limitations
                </h4>
                <ul className="space-y-2">
                  {selectedStrategy.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best Use Cases */}
            <div className={`bg-gradient-to-r from-${selectedStrategy.color}-50 to-${selectedStrategy.color}-100 p-4 rounded-lg border border-${selectedStrategy.color}-200`}>
              <h4 className={`font-semibold text-${selectedStrategy.color}-800 mb-2 flex items-center gap-2`}>
                <Users className="h-4 w-4" />
                Best Suited For
              </h4>
              <p className={`text-sm text-${selectedStrategy.color}-700`}>
                {selectedStrategy.bestFor}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingStrategy;