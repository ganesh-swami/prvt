import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Calendar, AlertCircle, Plus, Check } from 'lucide-react';

interface Reminder {
  id: string;
  stakeholderId: string;
  type: 'follow-up' | 'meeting' | 'check-in' | 'deadline';
  title: string;
  description: string;
  dueDate: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly';
  isActive: boolean;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface EngagementRemindersProps {
  stakeholders: any[];
}

const EngagementReminders: React.FC<EngagementRemindersProps> = ({ stakeholders }) => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      stakeholderId: '1',
      type: 'follow-up',
      title: 'Follow up on policy discussion',
      description: 'Check progress on regulatory framework alignment',
      dueDate: '2024-01-25',
      frequency: 'once',
      isActive: true,
      isCompleted: false,
      priority: 'high'
    },
    {
      id: '2',
      stakeholderId: '2',
      type: 'check-in',
      title: 'Monthly beneficiary check-in',
      description: 'Regular engagement to maintain relationship',
      dueDate: '2024-02-01',
      frequency: 'monthly',
      isActive: true,
      isCompleted: false,
      priority: 'medium'
    }
  ]);

  const [newReminder, setNewReminder] = useState({
    stakeholderId: '',
    type: 'follow-up' as const,
    title: '',
    description: '',
    dueDate: '',
    frequency: 'once' as const,
    priority: 'medium' as const
  });

  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const upcoming = reminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      const today = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 7 && daysDiff >= 0 && reminder.isActive && !reminder.isCompleted;
    });
    setUpcomingReminders(upcoming);
  }, [reminders]);

  const addReminder = () => {
    if (newReminder.stakeholderId && newReminder.title && newReminder.dueDate) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        ...newReminder,
        isActive: true,
        isCompleted: false
      };
      setReminders([...reminders, reminder]);
      setNewReminder({
        stakeholderId: '',
        type: 'follow-up',
        title: '',
        description: '',
        dueDate: '',
        frequency: 'once',
        priority: 'medium'
      });
    }
  };

  const completeReminder = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, isCompleted: true } : reminder
    ));
  };

  const snoozeReminder = (id: string, days: number) => {
    setReminders(reminders.map(reminder => {
      if (reminder.id === id) {
        const newDate = new Date(reminder.dueDate);
        newDate.setDate(newDate.getDate() + days);
        return { ...reminder, dueDate: newDate.toISOString().split('T')[0] };
      }
      return reminder;
    }));
  };

  const getStakeholderName = (id: string) => {
    return stakeholders.find(s => s.id === id)?.name || 'Unknown';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'follow-up': return <Bell className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'check-in': return <Clock className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      {upcomingReminders.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">Upcoming Reminders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(reminder.type)}
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getStakeholderName(reminder.stakeholderId)} • Due in {getDaysUntilDue(reminder.dueDate)} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => snoozeReminder(reminder.id, 3)}>
                      Snooze 3d
                    </Button>
                    <Button size="sm" onClick={() => completeReminder(reminder.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <CardTitle>Create Engagement Reminder</CardTitle>
          </div>
          <CardDescription>
            Set up automated reminders to maintain stakeholder relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={newReminder.stakeholderId} onValueChange={(value) => setNewReminder({...newReminder, stakeholderId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select stakeholder" />
              </SelectTrigger>
              <SelectContent>
                {stakeholders.map(stakeholder => (
                  <SelectItem key={stakeholder.id} value={stakeholder.id}>
                    {stakeholder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newReminder.type} onValueChange={(value: any) => setNewReminder({...newReminder, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="check-in">Check-in</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input 
            placeholder="Reminder title"
            value={newReminder.title}
            onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
          />
          <Input 
            placeholder="Description (optional)"
            value={newReminder.description}
            onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input 
              type="date"
              value={newReminder.dueDate}
              onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
            />
            <Select value={newReminder.frequency} onValueChange={(value: any) => setNewReminder({...newReminder, frequency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newReminder.priority} onValueChange={(value: any) => setNewReminder({...newReminder, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addReminder} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Reminder
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className={`p-4 border rounded-lg ${reminder.isCompleted ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(reminder.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${reminder.isCompleted ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h4>
                        <Badge className={getPriorityColor(reminder.priority)}>
                          {reminder.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {getStakeholderName(reminder.stakeholderId)}
                      </p>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span>Due: {reminder.dueDate}</span>
                        <span>Frequency: {reminder.frequency}</span>
                        <span>Type: {reminder.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!reminder.isCompleted && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => snoozeReminder(reminder.id, 7)}>
                          Snooze 1w
                        </Button>
                        <Button size="sm" onClick={() => completeReminder(reminder.id)}>
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementReminders;