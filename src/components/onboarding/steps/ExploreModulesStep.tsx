import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { database } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface BusinessModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  explored: boolean;
}

export const ExploreModulesStep: React.FC = () => {
  const [exploredModules, setExploredModules] = useState<Set<string>>(new Set());
  const { completeStep } = useOnboarding();
  const { appUser } = useAuth();

  const businessModules: BusinessModule[] = [
    {
      id: 'business-plan',
      name: 'Business Plan Builder',
      description: 'Create comprehensive business plans with guided templates',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      features: ['Executive Summary', 'Market Analysis', 'Financial Projections', 'Strategy Planning'],
      difficulty: 'Beginner',
      estimatedTime: '2-4 hours',
      explored: false
    },
    {
      id: 'financial-modeling',
      name: 'Financial Modeling',
      description: 'Build detailed financial models and projections',
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      features: ['Revenue Forecasting', 'Expense Planning', 'Cash Flow Analysis', 'Scenario Planning'],
      difficulty: 'Intermediate',
      estimatedTime: '3-5 hours',
      explored: false
    },
    {
      id: 'market-research',
      name: 'Market Research',
      description: 'Analyze your market and validate assumptions',
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      features: ['Competitor Analysis', 'Market Sizing', 'Customer Personas', 'SWOT Analysis'],
      difficulty: 'Beginner',
      estimatedTime: '1-3 hours',
      explored: false
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      description: 'Work together with your team on business planning',
      icon: <Users className="w-6 h-6 text-orange-500" />,
      features: ['Real-time Comments', 'Task Management', 'Version Control', 'Team Permissions'],
      difficulty: 'Beginner',
      estimatedTime: '30 minutes',
      explored: false
    },
    {
      id: 'strategy-planning',
      name: 'Strategy Planning',
      description: 'Define your business strategy and roadmap',
      icon: <Target className="w-6 h-6 text-red-500" />,
      features: ['Goal Setting', 'Milestone Planning', 'Risk Assessment', 'Success Metrics'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 hours',
      explored: false
    },
    {
      id: 'analytics-reporting',
      name: 'Analytics & Reporting',
      description: 'Track progress and generate professional reports',
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
      features: ['Progress Tracking', 'Custom Reports', 'Export Options', 'Dashboard Views'],
      difficulty: 'Advanced',
      estimatedTime: '1-2 hours',
      explored: false
    }
  ];

  const handleExploreModule = async (moduleId: string) => {
    const newExplored = new Set(exploredModules);
    newExplored.add(moduleId);
    setExploredModules(newExplored);

    // Track module exploration
    if (appUser) {
      await database.trackEvent('module_explored', {
        module_id: moduleId,
        source: 'onboarding',
        user_id: appUser.id
      }, appUser.id);
    }

    // Complete step if user has explored at least 2 modules
    if (newExplored.size >= 2) {
      completeStep('explore-modules');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Explore Business Planning Modules</h3>
        <p className="text-muted-foreground">
          Discover the powerful tools available to help you build your business plan. 
          Explore at least 2 modules to continue.
        </p>
        <div className="flex justify-center">
          <Badge variant="outline">
            {exploredModules.size} of {businessModules.length} explored
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessModules.map((module) => {
          const isExplored = exploredModules.has(module.id);
          
          return (
            <Card 
              key={module.id} 
              className={`transition-all duration-200 ${
                isExplored 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'hover:border-primary/50 cursor-pointer'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {module.icon}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {module.name}
                        {isExplored && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={getDifficultyColor(module.difficulty)}
                        >
                          {module.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {module.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription>{module.description}</CardDescription>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-current rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isExplored ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleExploreModule(module.id)}
                  disabled={isExplored}
                  className="w-full"
                >
                  {isExplored ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Explored
                    </>
                  ) : (
                    <>
                      Explore Module
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exploredModules.size >= 2 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Great! You've explored enough modules to get started. 
            You can always come back to explore more features later.
          </p>
        </div>
      )}
    </div>
  );
};
