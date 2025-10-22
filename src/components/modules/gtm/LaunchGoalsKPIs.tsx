import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLaunchGoalsKPIs, addLaunchGoal, removeLaunchGoal, updateLaunchGoal } from '@/store/slices/gtmPlannerSlice';

export const LaunchGoalsKPIs: React.FC = () => {
  const dispatch = useAppDispatch();
  const goalsKPIs = useAppSelector(selectLaunchGoalsKPIs);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Goals and KPIs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-teal-800">Launch goals and KPIs</CardTitle>
          <p className="text-sm text-gray-600">
            List your goals for the new product launch and the KPIs you'll use to track its performance.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold">
                    Goal
                  </th>
                  <th className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                    KPI #1
                  </th>
                  <th className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                    KPI #2
                  </th>
                </tr>
              </thead>
              <tbody>
                {goalsKPIs.goals.map((goal) => (
                  <tr key={goal.id}>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium align-top">
                      <div className="flex justify-between items-start">
                        <span>{goal.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(removeLaunchGoal(goal.id))}
                          className="text-red-600 hover:text-red-800 p-1 ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Textarea 
                        placeholder="[Type here]"
                        value={goal.kpi1}
                        onChange={(e) => dispatch(updateLaunchGoal({ id: goal.id, field: 'kpi1', value: e.target.value }))}
                        className="min-h-[80px] text-sm border-0 p-1 resize-none"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Textarea 
                        placeholder="[Type here]"
                        value={goal.kpi2}
                        onChange={(e) => dispatch(updateLaunchGoal({ id: goal.id, field: 'kpi2', value: e.target.value }))}
                        className="min-h-[80px] text-sm border-0 p-1 resize-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <Button onClick={() => dispatch(addLaunchGoal())} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Setting Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">SMART Goals Framework:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Specific:</strong> Clear and well-defined</li>
              <li>• <strong>Measurable:</strong> Quantifiable outcomes</li>
              <li>• <strong>Achievable:</strong> Realistic and attainable</li>
              <li>• <strong>Relevant:</strong> Aligned with business objectives</li>
              <li>• <strong>Time-bound:</strong> Has a clear deadline</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">KPI Categories:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Revenue:</strong> Sales, MRR, ARR</li>
              <li>• <strong>Acquisition:</strong> New customers, leads</li>
              <li>• <strong>Conversion:</strong> Conversion rates, funnel metrics</li>
              <li>• <strong>Awareness:</strong> Brand recognition, reach</li>
              <li>• <strong>Engagement:</strong> Usage metrics, retention</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Tip:</strong> The goals for your new product should be specific, measurable, actionable, realistic, and timely. 
              Meanwhile, the KPIs can be related to any metrics you deem important, whether that's revenue, acquisition, conversion, awareness, or something else.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};