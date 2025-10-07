import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react';

interface CanvasData {
  socialMission: string;
  keyDeliveryPartners: string;
  keyActivities: string;
  socialImpactMeasurement: string;
  socialValueProposition: string;
  relationships: string;
  impactGapAnalysis: string;
  keyStakeholders: string;
  channels: string;
  competitorsCompetition: string;
  keyResources: string;
  pestelAnalysis: string;
  costs: string;
  surplus: string;
  revenue: string;
}

interface SocialCanvasSummaryProps {
  canvasData: CanvasData;
}

const SocialCanvasSummary: React.FC<SocialCanvasSummaryProps> = ({ canvasData }) => {
  const fields = [
    { key: 'socialMission', name: 'Social Mission', category: 'Core' },
    { key: 'socialValueProposition', name: 'Value Proposition', category: 'Core' },
    { key: 'keyDeliveryPartners', name: 'Key Partners', category: 'Operations' },
    { key: 'keyActivities', name: 'Key Activities', category: 'Operations' },
    { key: 'keyResources', name: 'Key Resources', category: 'Operations' },
    { key: 'socialImpactMeasurement', name: 'Impact Measurement', category: 'Impact' },
    { key: 'relationships', name: 'Relationships', category: 'Market' },
    { key: 'keyStakeholders', name: 'Stakeholders', category: 'Market' },
    { key: 'channels', name: 'Channels', category: 'Market' },
    { key: 'costs', name: 'Costs', category: 'Financial' },
    { key: 'revenue', name: 'Revenue', category: 'Financial' },
    { key: 'surplus', name: 'Surplus', category: 'Financial' }
  ];

  const getCompletionStatus = (text: string) => {
    if (!text) return { status: 'empty', score: 0 };
    if (text.length < 20) return { status: 'partial', score: 50 };
    return { status: 'complete', score: 100 };
  };

  const completedFields = fields.filter(field => canvasData[field.key as keyof CanvasData]).length;
  const totalFields = fields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const categorySummary = fields.reduce((acc, field) => {
    const status = getCompletionStatus(canvasData[field.key as keyof CanvasData]);
    if (!acc[field.category]) {
      acc[field.category] = { total: 0, completed: 0 };
    }
    acc[field.category].total++;
    if (status.status === 'complete') acc[field.category].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold">Canvas Summary</h2>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overall Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{completedFields} of {totalFields} sections</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-gray-600">{completionPercentage}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Category Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(categorySummary).map(([category, data]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-xs text-gray-600">{data.completed}/{data.total}</span>
                </div>
                <Progress value={(data.completed / data.total) * 100} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Field Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fields.map((field) => {
              const status = getCompletionStatus(canvasData[field.key as keyof CanvasData]);
              return (
                <div key={field.key} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm">{field.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(status.status)}`}>
                      {status.status === 'complete' ? 'Complete' : 
                       status.status === 'partial' ? 'Partial' : 'Empty'}
                    </Badge>
                    <span className="text-xs text-gray-500">{field.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialCanvasSummary;