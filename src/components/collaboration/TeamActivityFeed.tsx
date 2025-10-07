import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, MessageSquare, CheckCircle, UserPlus, FileText, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'comment' | 'task' | 'document' | 'user' | 'assignment';
  priority?: 'high' | 'medium' | 'low';
}

export const TeamActivityFeed: React.FC = () => {
  const [activities] = useState<ActivityItem[]>([
    { id: '1', user: 'Alice', action: 'completed task', target: 'Market Research', timestamp: new Date(Date.now() - 300000), type: 'task', priority: 'high' },
    { id: '2', user: 'Bob', action: 'commented on', target: 'Financial Model v2', timestamp: new Date(Date.now() - 600000), type: 'comment' },
    { id: '3', user: 'Carol', action: 'created document', target: 'Team Guidelines', timestamp: new Date(Date.now() - 900000), type: 'document' },
    { id: '4', user: 'David', action: 'joined project', target: 'Social Impact Initiative', timestamp: new Date(Date.now() - 1200000), type: 'user' },
    { id: '5', user: 'Alice', action: 'assigned task', target: 'User Testing to Bob', timestamp: new Date(Date.now() - 1500000), type: 'assignment', priority: 'medium' },
    { id: '6', user: 'Eve', action: 'updated', target: 'Risk Assessment', timestamp: new Date(Date.now() - 1800000), type: 'document' },
    { id: '7', user: 'Bob', action: 'completed task', target: 'Competitor Analysis', timestamp: new Date(Date.now() - 2100000), type: 'task', priority: 'low' }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'document': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'user': return <UserPlus className="w-4 h-4 text-orange-500" />;
      case 'assignment': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Team Activity
        </CardTitle>
        <Badge variant="secondary">{activities.length} recent</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/30 ${getPriorityColor(activity.priority)}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.user}</span>
                    <span className="text-sm text-muted-foreground">{activity.action}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{activity.target}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};