import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Users, BarChart3, Target, Lightbulb, Shield } from 'lucide-react';

export const WelcomeStep: React.FC = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Strategic Planning",
      description: "Build comprehensive business plans with guided templates"
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Team Collaboration",
      description: "Work together with real-time comments and task management"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      title: "Financial Modeling",
      description: "Create detailed financial projections and scenarios"
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      title: "Market Analysis",
      description: "Research competitors and validate market assumptions"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "Secure & Private",
      description: "Your business data is encrypted and protected"
    },
    {
      icon: <Rocket className="w-6 h-6 text-indigo-500" />,
      title: "Launch Ready",
      description: "Export professional presentations and documents"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome to PF Strategize+</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one platform for strategic business planning. Let's get you started 
            on building successful business plans with powerful tools and collaborative features.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Beta Version</Badge>
          <Badge variant="outline">Free Trial</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">What's Next?</h3>
        <p className="text-muted-foreground">
          We'll guide you through creating your first project, exploring our business planning modules, 
          and setting up collaboration with your team. This should take about 5-10 minutes.
        </p>
      </div>
    </div>
  );
};
