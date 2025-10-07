import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export const CompetitorAnalysis: React.FC = () => {
  const [competitors, setCompetitors] = useState([
    { id: 1, name: '[Competitor]' },
    { id: 2, name: '[Competitor]' },
    { id: 3, name: '[Competitor]' },
    { id: 4, name: '[Competitor]' }
  ]);

  const columns = [
    'Target market',
    'Product offerings', 
    'What works?',
    "What doesn't work?"
  ];

  const addCompetitor = () => {
    const newId = Math.max(...competitors.map(c => c.id)) + 1;
    setCompetitors([...competitors, { id: newId, name: '[New Competitor]' }]);
  };

  const removeCompetitor = (id: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter(c => c.id !== id));
    }
  };

  const updateCompetitorName = (id: number, name: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, name } : c));
  };

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
                  <th key={column} className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                    {column}
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
                  <td key={`your-${column}`} className="border border-gray-300 p-3">
                    <Textarea 
                      placeholder="[Type here]"
                      className="min-h-[80px] text-sm"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-3"></td>
              </tr>
              {competitors.map((competitor) => (
                <tr key={competitor.id}>
                  <td className="border border-gray-300 p-3">
                    <Input
                      value={competitor.name}
                      onChange={(e) => updateCompetitorName(competitor.id, e.target.value)}
                      className="font-medium"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={`${competitor.id}-${column}`} className="border border-gray-300 p-3">
                      <Textarea 
                        placeholder="[Type here]"
                        className="min-h-[80px] text-sm"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetitor(competitor.id)}
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
          <Button onClick={addCompetitor} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};