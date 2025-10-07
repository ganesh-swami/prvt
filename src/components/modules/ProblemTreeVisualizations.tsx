import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, TreePine, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProblemTreeVisualizationsProps {
  effects: string[];
  coreProblem: string;
  causes: string[];
}

const ProblemTreeVisualizations: React.FC<ProblemTreeVisualizationsProps> = ({
  effects = ['Effect 1', 'Effect 2', 'Effect 3'],
  coreProblem = 'Core Problem',
  causes = ['Cause 1', 'Cause 2', 'Cause 3']
}) => {
  return (
    <div className="space-y-6">
      {/* Visual Tree Diagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-600" />
            <CardTitle>Problem Tree Visualization</CardTitle>
            <CustomTooltip content="Visual representation helps identify causal relationships and prioritize interventions. This diagram shows how root causes lead to the core problem, which creates various effects. Essential for strategic planning and stakeholder communication." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Effects Level */}
            <div className="w-full">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  Effects & Consequences
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {effects.map((effect, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="text-sm text-red-800 font-medium">{effect}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <ArrowDown className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            {/* Core Problem Level */}
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800">
                  <TreePine className="h-3 w-3" />
                  Core Problem
                </Badge>
              </div>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-center">
                <div className="text-amber-900 font-semibold">{coreProblem}</div>
              </div>
              <div className="flex justify-center mt-2">
                <ArrowDown className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            {/* Root Causes Level */}
            <div className="w-full">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-700">
                  <ArrowDown className="h-3 w-3" />
                  Root Causes
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {causes.map((cause, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-sm text-blue-800 font-medium">{cause}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Priority Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle>Impact Priority Matrix</CardTitle>
            <CustomTooltip content="Helps prioritize which causes to address first based on impact potential and feasibility. High-impact, high-feasibility causes should be primary targets. This matrix guides resource allocation and intervention sequencing for maximum social impact." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 h-64">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col justify-center">
              <div className="text-center">
                <div className="font-semibold text-yellow-800 mb-2">High Impact</div>
                <div className="font-semibold text-yellow-800">Low Feasibility</div>
                <div className="text-xs text-yellow-600 mt-2">Long-term strategic focus</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col justify-center">
              <div className="text-center">
                <div className="font-semibold text-green-800 mb-2">High Impact</div>
                <div className="font-semibold text-green-800">High Feasibility</div>
                <div className="text-xs text-green-600 mt-2">Primary targets</div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
              <div className="text-center">
                <div className="font-semibold text-gray-600 mb-2">Low Impact</div>
                <div className="font-semibold text-gray-600">Low Feasibility</div>
                <div className="text-xs text-gray-500 mt-2">Avoid or deprioritize</div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col justify-center">
              <div className="text-center">
                <div className="font-semibold text-blue-800 mb-2">Low Impact</div>
                <div className="font-semibold text-blue-800">High Feasibility</div>
                <div className="text-xs text-blue-600 mt-2">Quick wins</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemTreeVisualizations;