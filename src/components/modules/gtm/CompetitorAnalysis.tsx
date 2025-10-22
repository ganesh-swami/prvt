import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectCompetitorAnalysis, 
  setYourBusinessData, 
  addCompetitor, 
  removeCompetitor, 
  updateCompetitor 
} from '@/store/slices/gtmPlannerSlice';

export const CompetitorAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const competitorAnalysis = useAppSelector(selectCompetitorAnalysis);

  const columns = [
    { label: 'Target market', key: 'targetMarket' as const },
    { label: 'Product offerings', key: 'productOfferings' as const },
    { label: 'What works?', key: 'whatWorks' as const },
    { label: "What doesn't work?", key: 'whatDoesntWork' as const }
  ];

  return (
    <Card>
      <CardHeader className="bg-yellow-400 text-black">
        <CardTitle className="text-center font-bold">
          Compare your business to top competitors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-teal-800 text-white font-bold w-48">
                  Businesses
                </th>
                {columns.map((column) => (
                  <th key={column.key} className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                    {column.label}
                  </th>
                ))}
                <th className="border border-gray-300 p-3 bg-teal-800 text-white w-12"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium">
                  [Your business]
                </td>
                {columns.map((column) => (
                  <td key={`your-${column.key}`} className="border border-gray-300 p-3">
                    <Textarea 
                      placeholder="[Type here]"
                      value={competitorAnalysis.yourBusiness[column.key]}
                      onChange={(e) => dispatch(setYourBusinessData({ field: column.key, content: e.target.value }))}
                      className="min-h-[80px] text-sm"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-3"></td>
              </tr>
              {competitorAnalysis.competitors.map((competitor) => (
                <tr key={competitor.id}>
                  <td className="border border-gray-300 p-3">
                    <Input
                      value={competitor.name}
                      onChange={(e) => dispatch(updateCompetitor({ id: competitor.id, field: 'name', value: e.target.value }))}
                      className="font-medium"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={`${competitor.id}-${column.key}`} className="border border-gray-300 p-3">
                      <Textarea 
                        placeholder="[Type here]"
                        value={competitor[column.key]}
                        onChange={(e) => dispatch(updateCompetitor({ id: competitor.id, field: column.key, value: e.target.value }))}
                        className="min-h-[80px] text-sm"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(removeCompetitor(competitor.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4">
          <Button onClick={() => dispatch(addCompetitor())} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};