import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export const SWOTAnalysis: React.FC = () => {
  const swotSections = [
    {
      title: 'Strengths',
      description: 'What attributes does your product have that give it a competitive advantage? (e.g., innovative features, scalability, etc.)',
      bgColor: 'bg-yellow-400',
      textColor: 'text-black'
    },
    {
      title: 'Weaknesses', 
      description: 'What factors about your product could weaken its competitive advantage? (e.g., price, lack of features, etc.)',
      bgColor: 'bg-yellow-400',
      textColor: 'text-black'
    },
    {
      title: 'Opportunities',
      description: 'What opportunities do you foresee that may aid in the success of this product? (e.g., heightened demand, industry trends, etc.)',
      bgColor: 'bg-yellow-400',
      textColor: 'text-black'
    },
    {
      title: 'Threats',
      description: 'What factors could threaten the success of your product launch? (e.g., taxes, issues with trademarking original ideas, etc.)',
      bgColor: 'bg-yellow-400', 
      textColor: 'text-black'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>SWOT Analysis</CardTitle>
        <p className="text-sm text-gray-600">
          Analyze your product's Strengths, Weaknesses, Opportunities, and Threats
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swotSections.map((section) => (
            <div key={section.title} className="border border-gray-300">
              <div className={`${section.bgColor} ${section.textColor} p-4`}>
                <h3 className="font-bold text-lg">{section.title}</h3>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-700 mb-3">
                  {section.description}
                </p>
                <div className="bg-white p-2 border border-gray-200 rounded">
                  <p className="text-sm text-gray-600 mb-2">Notes: [Type here]</p>
                  <Textarea 
                    placeholder="Enter your analysis here..."
                    className="min-h-[120px] border-0 p-0 resize-none focus:ring-0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">SWOT Analysis Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest and objective in your assessment</li>
            <li>• Consider both internal and external factors</li>
            <li>• Use specific examples and data when possible</li>
            <li>• Review and update regularly as conditions change</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};