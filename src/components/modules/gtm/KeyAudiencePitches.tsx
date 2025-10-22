import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectKeyAudiencePitches, setKeyAudiencePitch } from '@/store/slices/gtmPlannerSlice';

export const KeyAudiencePitches: React.FC = () => {
  const dispatch = useAppDispatch();
  const pitches = useAppSelector(selectKeyAudiencePitches);
  const pitchTypes = [
    {
      title: 'Appeal to leadership:',
      key: 'leadership' as const,
      subtitle: 'Green light product development',
      points: [
        'Describe sales and marketing messaging',
        'Share the data and context that justifies the new product',
        'List the potential for promotion',
        'List regional distribution channels',
        'Explain how the new product fits the brand',
        'Outline the financial payoff of creating the new product',
        'Explain how the product aligns with company goals'
      ]
    },
    {
      title: 'Appeal to donors and finance department:',
      key: 'donorsFinance' as const,
      subtitle: 'Get funding for your new product',
      points: [
        'Explain the ROI',
        'List what you will use their investment for',
        'Share your inspiration for the product',
        'Explain why there\'s a need for the product and who will buy it',
        'List a preliminary launch deadline'
      ]
    },
    {
      title: 'Appeal to your target audience:',
      key: 'targetAudience' as const,
      subtitle: 'Sell your new product',
      points: [
        'Describe use cases for the product',
        'List key features',
        'Explain how to use the product',
        'Outline competitive advantages',
        'Explain how your product can resolve customer problems'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">Pitches</CardTitle>
        <p className="text-gray-600">
          To get the green light on your new product from leadership or key investors and increase your chances of success in the marketplace, answer these prompts.
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-yellow-400 text-black p-4 rounded-t-lg">
          <h3 className="font-bold text-center text-lg">Key audience pitches</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300">
          {pitchTypes.map((pitch, index) => (
            <div key={index} className="border-r border-gray-300 last:border-r-0">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h4 className="font-bold text-sm">{pitch.title}</h4>
                <p className="text-sm">{pitch.subtitle}</p>
              </div>
              
              <div className="p-4">
                <ul className="text-xs space-y-2 mb-4">
                  {pitch.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <span className="text-gray-600 mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-2">Notes: [Type here]</p>
                  <Textarea 
                    placeholder="Enter your pitch notes here..."
                    value={pitches[pitch.key]}
                    onChange={(e) => dispatch(setKeyAudiencePitch({ type: pitch.key, content: e.target.value }))}
                    className="min-h-[100px] text-xs border-0 p-0 resize-none focus:ring-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Pitch Development Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tailor your message to each audience's priorities</li>
            <li>• Use data and specific examples to support your points</li>
            <li>• Keep pitches concise but comprehensive</li>
            <li>• Practice your delivery before presenting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};