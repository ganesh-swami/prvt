import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GripVertical, Plus, User, Calendar, AlertCircle } from 'lucide-react';
import { TaskAssignmentDialog } from './TaskAssignmentDialog';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  due_date?: string;
}

interface DragDropTaskBoardProps {
  projectId: string;
  compact?: boolean;
}

export function DragDropTaskBoard({ projectId, compact = false }: DragDropTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [assignmentDialog, setAssignmentDialog] = useState<{ open: boolean; taskId?: string }>({
    open: false
  });

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Review financial projections',
      status: 'todo',
      priority: 'high',
      assignee: { id: '1', name: 'Sarah Chen', avatar_url: '' },
      due_date: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Update market analysis',
      status: 'in-progress',
      priority: 'medium',
      assignee: { id: '2', name: 'Mike Johnson', avatar_url: '' }
    },
    {
      id: '3',
      title: 'Complete risk assessment',
      status: 'done',
      priority: 'low'
    }
  ];

  React.useEffect(() => {
    setTasks(mockTasks);
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ));
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const handleAssignTask = (assignment: any) => {
    console.log('Task assigned:', assignment);
    // Update task with assignment details
  };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
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
            <div 
              key={column.id} 
              className="space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{column.title}</h4>
                <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {column.tasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="p-2 bg-white border rounded text-xs cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-1">
                      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium truncate">{task.title}</div>
                        {task.priority && (
                          <Badge className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
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
            <CardContent 
              className="space-y-2 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.tasks.map(task => (
                <Card 
                  key={task.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="p-2 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.priority && (
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      )}
                    </div>
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