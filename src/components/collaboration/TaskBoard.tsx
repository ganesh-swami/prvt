import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import FeatureGate from '@/components/billing/FeatureGate';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
}

const mockTasks: Task[] = [
  { id: '1', title: 'Complete market research', status: 'todo', priority: 'high' },
  { id: '2', title: 'Draft business plan', status: 'in-progress', assignee: 'John', priority: 'medium' },
  { id: '3', title: 'Review financial model', status: 'done', assignee: 'Sarah', priority: 'low' }
];

export const TaskBoard: React.FC = () => {
  const sub = useWorkspaceSubscription();
  
  return (
    <FeatureGate 
      feature="collab.tasks" 
      sub={sub}
      fallback={
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management</h3>
          <p className="text-gray-600 mb-4">Organize and track project tasks with your team</p>
        </div>
      }
    >
      <TaskBoardContent />
    </FeatureGate>
  );
};

const TaskBoardContent: React.FC = () => {
  const columns = [
    { id: 'todo', title: 'To Do', tasks: mockTasks.filter(t => t.status === 'todo') },
    { id: 'progress', title: 'In Progress', tasks: mockTasks.filter(t => t.status === 'in-progress') },
    { id: 'done', title: 'Done', tasks: mockTasks.filter(t => t.status === 'done') }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="text-lg">{column.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.tasks.map(task => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignee}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};