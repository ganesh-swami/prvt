import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export const CustomerPainPoints: React.FC = () => {
  const categories = [
    { name: 'Productivity', description: 'Time-wasting processes or inefficient workflows' },
    { name: 'Financial', description: 'Cost-related issues or budget constraints' },
    { name: 'Process', description: 'Complicated or unclear procedures' },
    { name: 'Support', description: 'Lack of help or guidance when needed' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Pain Points Analysis</CardTitle>
        <p className="text-sm text-gray-600">
          Identify and categorize the main pain points your customers experience
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 text-left font-medium w-32">
                  Category
                </th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black text-center font-bold">
                  Customer pain points
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.name}>
                  <td className="border border-gray-300 p-3 font-medium bg-gray-50 align-top">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{category.description}</div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <Textarea 
                      placeholder="[Type here]"
                      className="min-h-[120px] w-full resize-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Research Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use surveys and focus groups to gather direct feedback</li>
            <li>• Analyze customer service tickets and sales data</li>
            <li>• Conduct digital research and review online feedback</li>
            <li>• Quantify the population experiencing each pain point</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};