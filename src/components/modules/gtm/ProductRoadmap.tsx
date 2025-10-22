import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectProductRoadmap, 
  setProductRoadmapMetadata, 
  setProductRoadmapStage 
} from '@/store/slices/gtmPlannerSlice';

interface ProductRoadmapProps {
  projectName: string;
}

export const ProductRoadmap: React.FC<ProductRoadmapProps> = ({ projectName }) => {
  const dispatch = useAppDispatch();
  const productRoadmap = useAppSelector(selectProductRoadmap);

  const stages = [
    'Research', 'Idea generation', 'Prototype', 'Testing', 
    'Approval', 'Development', 'Launch', 'Promotion'
  ];

  const quarters = [
    { name: 'Q1', months: 'Jan | Feb | Mar' },
    { name: 'Q2', months: 'Apr | May | June' },
    { name: 'Q3', months: 'Jul | Aug | Sept' },
    { name: 'Q4', months: 'Oct | Nov | Dec' }
  ];

  return (
    <Card>
      <CardHeader className="bg-yellow-400 text-black">
        <CardTitle className="text-center text-xl font-bold">Product roadmap</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">Business name:</label>
            <Input 
              value={productRoadmap.businessName} 
              onChange={(e) => dispatch(setProductRoadmapMetadata({ businessName: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Year:</label>
            <Input 
              value={productRoadmap.year} 
              onChange={(e) => dispatch(setProductRoadmapMetadata({ year: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Team:</label>
            <Input 
              value={productRoadmap.team} 
              onChange={(e) => dispatch(setProductRoadmapMetadata({ team: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 text-left font-medium">Stage</th>
                {quarters.map((quarter) => (
                  <th key={quarter.name} className="border border-gray-300 p-3 bg-teal-800 text-white text-center">
                    <div className="font-bold">{quarter.name}</div>
                    <div className="text-sm font-normal">{quarter.months}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stages.map((stage) => (
                <tr key={stage}>
                  <td className="border border-gray-300 p-3 font-medium bg-gray-50">{stage}</td>
                  {quarters.map((quarter) => (
                    <td key={`${stage}-${quarter.name}`} className="border border-gray-300 p-3">
                      <Textarea 
                        placeholder="[Type here]"
                        value={productRoadmap.stages[stage]?.[quarter.name] || ''}
                        onChange={(e) => dispatch(setProductRoadmapStage({ 
                          stage, 
                          quarter: quarter.name, 
                          content: e.target.value 
                        }))}
                        className="min-h-[60px] text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};