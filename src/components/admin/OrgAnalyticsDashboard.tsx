import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Users, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OrgMetrics {
  usage: {
    exports: number;
    investorUpdates: number;
    comments: number;
    projects: number;
  };
  engagement: {
    activeUsers: number;
    sessionTime: number;
    lastActivity: string;
  };
  features: {
    mostUsed: string[];
    planUtilization: number;
  };
}

const OrgAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d'>('28d');
  const [metrics, setMetrics] = useState<OrgMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organization_id) {
      fetchOrgMetrics();
    }
  }, [timeRange, user?.organization_id]);

  const fetchOrgMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('org-analytics', {
        body: { 
          organizationId: user?.organization_id,
          timeRange 
        }
      });
      
      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching org metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization Analytics</h1>
          <p className="text-muted-foreground">Track your team's usage and engagement</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="28d">28 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usage.exports}</div>
            <p className="text-xs text-muted-foreground">
              Documents exported
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investor Updates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usage.investorUpdates}</div>
            <p className="text-xs text-muted-foreground">
              Updates created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usage.comments}</div>
            <p className="text-xs text-muted-foreground">
              Comments & mentions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="engagement">Team Engagement</TabsTrigger>
          <TabsTrigger value="features">Feature Adoption</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projects Created</span>
                    <span>{metrics.usage.projects}</span>
                  </div>
                  <Progress value={(metrics.usage.projects / 10) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documents Exported</span>
                    <span>{metrics.usage.exports}</span>
                  </div>
                  <Progress value={(metrics.usage.exports / 50) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Comments</span>
                    <span>{metrics.usage.comments}</span>
                  </div>
                  <Progress value={(metrics.usage.comments / 100) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Plan Utilization</span>
                      <Badge variant="outline">{metrics.features.planUtilization}%</Badge>
                    </div>
                    <Progress value={metrics.features.planUtilization} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Last activity: {new Date(metrics.engagement.lastActivity).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg session: {metrics.engagement.sessionTime} minutes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active team members</span>
                  <span className="font-semibold">{metrics.engagement.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average session time</span>
                  <span className="font-semibold">{metrics.engagement.sessionTime}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Collaboration score</span>
                  <Badge variant="outline">
                    {metrics.usage.comments > 20 ? 'High' : metrics.usage.comments > 10 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Used Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.features.mostUsed.map((feature, index) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm">{feature}</span>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgAnalyticsDashboard;