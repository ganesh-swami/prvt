import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TaskKanbanProps {
  projectId: string;
  compact?: boolean;
}
import { Task, User as UserType } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TaskKanbanProps {
  projectId: string;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({ projectId }) => {
  const { user, appUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectMembers, setProjectMembers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (projectId) {
      loadTasks();
      loadProjectMembers();
    }
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadProjectMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('user:users(*)')
        .eq('project_id', projectId);

      if (error) throw error;
      const members = data?.map(item => item.user).filter(Boolean) || [];
      setProjectMembers(members);
    } catch (error) {
      console.error('Error loading project members:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          project_id: projectId,
          created_by: user.id,
          status: 'todo'
        }])
        .select(`
          *,
          assignee:assigned_to(name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setTasks([data, ...tasks]);
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
      setShowCreateTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in-progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
    { id: 'done', title: 'Done', tasks: tasks.filter(t => t.status === 'done') }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Task Board</h3>
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={createTask} disabled={loading}>
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {column.title}
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.tasks.map(task => (
                <Card key={task.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(task.priority || 'medium')}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={task.assignee.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{task.assignee.name}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {task.status !== 'todo' && (
                        <Button size="sm" variant="outline" className="text-xs h-6" 
                          onClick={() => updateTaskStatus(task.id, 'todo')}>
                          To Do
                        </Button>
                      )}
                      {task.status !== 'in-progress' && (
                        <Button size="sm" variant="outline" className="text-xs h-6"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}>
                          In Progress
                        </Button>
                      )}
                      {task.status !== 'done' && (
                        <Button size="sm" variant="outline" className="text-xs h-6"
                          onClick={() => updateTaskStatus(task.id, 'done')}>
                          Done
                        </Button>
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
};