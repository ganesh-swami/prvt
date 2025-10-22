import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCustomerJourneyMap, setCustomerJourneyMapCell } from '@/store/slices/gtmPlannerSlice';

export const CustomerJourneyMap: React.FC = () => {
  const dispatch = useAppDispatch();
  const journeyMap = useAppSelector(selectCustomerJourneyMap);
  const stages = ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'];
  const categories = [
    { label: 'Touchpoints', key: 'touchpoints' as const },
    { label: 'Departments', key: 'departments' as const },
    { label: 'Customer feelings', key: 'customerFeelings' as const },
    { label: 'Pain points', key: 'painPoints' as const },
    { label: 'Opportunities', key: 'opportunities' as const }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">Customer journey map</CardTitle>
        <p className="text-gray-600">
          Develop a customer journey map to understand what touchpoints need to happen at each stage of the buyer journey for your business to make a sale.
          <br />
          <span className="text-sm">This should include: stages, touchpoints, relevant departments, pain points, opportunities, and important actions.</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold w-32">
                  Stage
                </th>
                {stages.map((stage) => (
                  <th key={stage} className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold">
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.key}>
                  <td className="border border-gray-300 p-3 bg-gray-50 font-medium">
                    {category.label}
                  </td>
                  {stages.map((stage) => (
                    <td key={`${category.key}-${stage}`} className="border border-gray-300 p-2">
                      <Textarea 
                        placeholder="[Type here]"
                        value={journeyMap[category.key][stage]}
                        onChange={(e) => dispatch(setCustomerJourneyMapCell({ category: category.key, stage, content: e.target.value }))}
                        className="min-h-[80px] text-sm border-0 p-1 resize-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Journey Stage Definitions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Awareness:</strong> Customer becomes aware of the problem</li>
              <li>• <strong>Consideration:</strong> Customer evaluates solutions</li>
              <li>• <strong>Purchase:</strong> Customer makes buying decision</li>
              <li>• <strong>Retention:</strong> Customer continues using product</li>
              <li>• <strong>Advocacy:</strong> Customer recommends to others</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Mapping Tips:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Include all customer-facing touchpoints</li>
              <li>• Identify emotional states at each stage</li>
              <li>• Note internal departments involved</li>
              <li>• Highlight improvement opportunities</li>
              <li>• Consider both digital and offline interactions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};