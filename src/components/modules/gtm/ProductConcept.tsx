import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProductConcept, addProductIdea, removeProductIdea, updateProductIdea } from '@/store/slices/gtmPlannerSlice';

export const ProductConcept: React.FC = () => {
  const dispatch = useAppDispatch();
  const productConcept = useAppSelector(selectProductConcept);

  const columns = [
    { label: 'Product name', key: 'productName' as const },
    { label: 'Description', key: 'description' as const },
    { label: 'Pain point / Solution', key: 'painPointSolution' as const },
    { label: 'Competitor notes', key: 'competitorNotes' as const },
    { label: 'Important features', key: 'importantFeatures' as const },
    { label: 'Unique selling proposition (USP)', key: 'usp' as const }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">Product concept</CardTitle>
        <p className="text-gray-600">
          Now that your research is complete, start brainstorming some ideas to resolve customer pain points.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-white font-medium w-24"></th>
                {columns.map((column) => (
                  <th key={column.key} className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">
                    {column.label}
                  </th>
                ))}
                <th className="border border-gray-300 p-3 bg-white w-12"></th>
              </tr>
            </thead>
            <tbody>
              {productConcept.ideas.map((idea) => (
                <tr key={idea.id}>
                  <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-sm">
                    {idea.name}
                  </td>
                  {columns.map((column) => (
                    <td key={`${idea.id}-${column.key}`} className="border border-gray-300 p-2">
                      <Textarea 
                        placeholder="[Type here]"
                        value={idea[column.key]}
                        onChange={(e) => dispatch(updateProductIdea({ id: idea.id, field: column.key, value: e.target.value }))}
                        className="min-h-[60px] text-xs resize-none border-0 p-1"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(removeProductIdea(idea.id))}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => dispatch(addProductIdea())} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Idea
          </Button>
          
          <div className="text-sm text-gray-600">
            Tip: Focus on ideas that directly address the pain points you identified
          </div>
        </div>
      </CardContent>
    </Card>
  );
};