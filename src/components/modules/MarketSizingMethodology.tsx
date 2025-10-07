import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, TrendingUp, DollarSign, Users, Lightbulb } from 'lucide-react';

interface MethodologyProps {
  approach: string;
}

export const MarketSizingMethodology: React.FC<MethodologyProps> = ({ approach }) => {
  const getMethodologyDetails = () => {
    switch (approach) {
      case 'top-down':
        return {
          title: 'Top-Down Analysis',
          description: 'Start with the total market and narrow down to your addressable segment',
          indicators: [
            { icon: Target, title: 'Market Research Data', desc: 'Industry reports and market studies' },
            { icon: TrendingUp, title: 'Growth Rates', desc: 'Historical and projected market growth' },
            { icon: Users, title: 'Demographics', desc: 'Target customer segmentation' }
          ],
          advantages: ['Quick estimation', 'Industry benchmarking', 'Investor-friendly'],
          limitations: ['May overestimate', 'Less granular', 'Assumes market accessibility']
        };
      case 'bottom-up':
        return {
          title: 'Bottom-Up Analysis',
          description: 'Build up from individual customer data and unit economics',
          indicators: [
            { icon: Users, title: 'Customer Base', desc: 'Actual customer count and acquisition rates' },
            { icon: DollarSign, title: 'Unit Economics', desc: 'Revenue per customer and pricing models' },
            { icon: Target, title: 'Conversion Rates', desc: 'Sales funnel and conversion metrics' }
          ],
          advantages: ['More accurate', 'Based on real data', 'Operational insights'],
          limitations: ['Time-intensive', 'Requires detailed data', 'May underestimate scale']
        };
      case 'value-theory':
        return {
          title: 'Value Theory',
          description: 'Calculate based on the value you create for customers',
          indicators: [
            { icon: Lightbulb, title: 'Monetary Value/Cost', desc: 'Price or cost associated with the solution, expressed in currency' },
            { icon: Target, title: 'Usefulness/Utility', desc: 'How beneficial the solution is, including ability to fulfill needs' },
            { icon: Users, title: 'Subjective Value', desc: 'Individual preferences and desirability based on personal experience' },
            { icon: DollarSign, title: 'Extrinsic vs Intrinsic Value', desc: 'Value from outcomes vs inherent worth' },
            { icon: BookOpen, title: 'Axiological Value', desc: 'Values and beliefs about what is good, right, or worthwhile' },
            { icon: TrendingUp, title: 'Expectancy-Value Theory', desc: 'Motivation influenced by success expectation and task value' }
          ],
          advantages: ['Customer-centric', 'Value-based pricing', 'Differentiation focus'],
          limitations: ['Subjective assessment', 'Complex to quantify', 'Market validation needed']
        };
      default:
        return null;
    }
  };

  const methodology = getMethodologyDetails();
  if (!methodology) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {methodology.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{methodology.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Advantages</h4>
              <ul className="space-y-2">
                {methodology.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">✓</Badge>
                    <span className="text-sm">{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-orange-700">Limitations</h4>
              <ul className="space-y-2">
                {methodology.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-200">!</Badge>
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Indicators & Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methodology.indicators.map((indicator, index) => {
              const IconComponent = indicator.icon;
              return (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h5 className="font-medium mb-1">{indicator.title}</h5>
                      <p className="text-sm text-gray-600">{indicator.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};