import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModuleSummaries } from "@/hooks/useModuleSummaries";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  AlertTriangle,
  Activity
} from "lucide-react";

const getModuleIcon = (moduleId: string) => {
  switch (moduleId) {
    case 'financial-modeler':
      return <DollarSign className="w-5 h-5" />;
    case 'market-sizing':
      return <BarChart3 className="w-5 h-5" />;
    case 'pricing-lab':
      return <Target className="w-5 h-5" />;
    case 'competitor-analysis':
      return <TrendingUp className="w-5 h-5" />;
    case 'unit-economics':
      return <Users className="w-5 h-5" />;
    case 'risk-center':
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
};

export const ModuleSummaries: React.FC = () => {
  const { summaries } = useModuleSummaries();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Module Summaries</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <Card key={summary.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getModuleIcon(summary.id)}
                  {summary.name}
                </div>
                <Badge variant={
                  summary.status === 'active' ? 'default' :
                  summary.status === 'completed' ? 'secondary' : 'outline'
                }>
                  {summary.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-gray-500">
                Last updated: {summary.lastUpdated}
              </div>
              <div className="space-y-2">
                {Object.entries(summary.keyMetrics).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">
                      {typeof value === 'number' && value > 1000 
                        ? value.toLocaleString() 
                        : value}
                      {key.includes('percentage') || key.includes('growth') ? '%' : ''}
                      {key.includes('revenue') || key.includes('expenses') || key.includes('profit') ? '' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};