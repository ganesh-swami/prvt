import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}

interface TaskKanbanProps {
  projectId: string;
  compact?: boolean;
}

export function TaskKanban({ projectId, compact = false }: TaskKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority')
        .eq('project_id', projectId)
        .limit(compact ? 6 : 50);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in-progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
    { id: 'done', title: 'Done', tasks: tasks.filter(t => t.status === 'done') }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 h-full">
          {columns.map(column => (
            <div key={column.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{column.title}</h4>
                <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {column.tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-2 bg-white border rounded text-xs">
                    <div className="font-medium truncate">{task.title}</div>
                    {task.priority && (
                      <Badge className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                ))}
                {column.tasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{column.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Task Board</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                {column.title}
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.tasks.map(task => (
                <Card key={task.id} className="p-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.priority && (
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}