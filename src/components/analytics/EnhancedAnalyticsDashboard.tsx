import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, RefreshCw } from 'lucide-react';
import RealTimeChart from './RealTimeChart';
import MetricsGrid from './MetricsGrid';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  realTimeMetrics: {
    activeUsers: number;
    revenue: number;
    conversions: number;
    engagement: number;
  };
  chartData: Array<{
    name: string;
    value: number;
    revenue: number;
  }>;
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual Supabase function
      const mockData: AnalyticsData = {
        realTimeMetrics: {
          activeUsers: Math.floor(Math.random() * 1000) + 500,
          revenue: Math.floor(Math.random() * 50000) + 25000,
          conversions: Math.floor(Math.random() * 100) + 50,
          engagement: Math.floor(Math.random() * 80) + 60
        },
        chartData: Array.from({ length: 7 }, (_, i) => ({
          name: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 200,
          revenue: Math.floor(Math.random() * 10000) + 5000
        }))
      };
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  if (loading || !data) {
    return <div className="p-6">Loading enhanced analytics...</div>;
  }

  const metrics = [
    {
      title: 'Active Users',
      value: data.realTimeMetrics.activeUsers.toLocaleString(),
      change: 12.5,
      trend: 'up' as const,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Revenue',
      value: `$${data.realTimeMetrics.revenue.toLocaleString()}`,
      change: 8.2,
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Conversions',
      value: data.realTimeMetrics.conversions,
      change: -2.1,
      trend: 'down' as const,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Engagement',
      value: `${data.realTimeMetrics.engagement}%`,
      change: 5.3,
      trend: 'up' as const,
      icon: <Activity className="h-4 w-4 text-muted-foreground" />
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            variant={autoRefresh ? "default" : "outline"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      <MetricsGrid metrics={metrics} />

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealTimeChart 
              title="Active Users" 
              color="#3b82f6" 
              dataKey="users"
              updateInterval={3000}
            />
            <RealTimeChart 
              title="Revenue Stream" 
              color="#10b981" 
              dataKey="revenue"
              updateInterval={5000}
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                value: { label: "Users", color: "#3b82f6" },
                revenue: { label: "Revenue", color: "#10b981" }
              }}>
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                mobile: { label: "Mobile", color: "#3b82f6" },
                desktop: { label: "Desktop", color: "#10b981" },
                tablet: { label: "Tablet", color: "#f59e0b" }
              }}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mobile', value: 45 },
                      { name: 'Desktop', value: 35 },
                      { name: 'Tablet', value: 20 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;