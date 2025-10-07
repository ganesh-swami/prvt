import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, CheckSquare, Share2, Plus } from 'lucide-react';

interface CollaborationNote {
  id: string;
  stakeholderId: string;
  author: string;
  content: string;
  timestamp: string;
  isShared: boolean;
}

interface Task {
  id: string;
  stakeholderId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface CollaborationToolsProps {
  stakeholders: any[];
}

const CollaborationTools: React.FC<CollaborationToolsProps> = ({ stakeholders }) => {
  const [notes, setNotes] = useState<CollaborationNote[]>([
    {
      id: '1',
      stakeholderId: '1',
      author: 'John Doe',
      content: 'Had productive meeting about policy alignment. They are supportive of our initiative.',
      timestamp: '2024-01-15T10:30:00Z',
      isShared: true
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      stakeholderId: '2',
      title: 'Conduct user feedback session',
      description: 'Gather insights from target beneficiaries about current solution',
      assignedTo: 'Sarah Smith',
      dueDate: '2024-01-25',
      status: 'pending',
      priority: 'high'
    }
  ]);

  const [newNote, setNewNote] = useState({ stakeholderId: '', content: '', isShared: false });
  const [newTask, setNewTask] = useState({
    stakeholderId: '', title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' as const
  });

  const addNote = () => {
    if (newNote.stakeholderId && newNote.content) {
      const note: CollaborationNote = {
        id: Date.now().toString(),
        ...newNote,
        author: 'Current User',
        timestamp: new Date().toISOString()
      };
      setNotes([...notes, note]);
      setNewNote({ stakeholderId: '', content: '', isShared: false });
    }
  };

  const addTask = () => {
    if (newTask.stakeholderId && newTask.title) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'pending'
      };
      setTasks([...tasks, task]);
      setNewTask({ stakeholderId: '', title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' });
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status } : task));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tabs defaultValue="notes" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="notes">Shared Notes</TabsTrigger>
        <TabsTrigger value="tasks">Task Management</TabsTrigger>
        <TabsTrigger value="communication">Communication Log</TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <CardTitle>Add Collaboration Note</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newNote.stakeholderId} onValueChange={(value) => setNewNote({...newNote, stakeholderId: value})}>
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
            <Textarea 
              placeholder="Add your note about this stakeholder..."
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={newNote.isShared}
                  onChange={(e) => setNewNote({...newNote, isShared: e.target.checked})}
                />
                <span className="text-sm">Share with team</span>
              </label>
              <Button onClick={addNote}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {notes.map(note => (
            <Card key={note.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{getStakeholderName(note.stakeholderId)}</h4>
                    <p className="text-sm text-muted-foreground">by {note.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.isShared && <Share2 className="h-4 w-4 text-blue-600" />}
                    <span className="text-sm text-muted-foreground">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="tasks" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <CardTitle>Create Task</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTask.stakeholderId} onValueChange={(value) => setNewTask({...newTask, stakeholderId: value})}>
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
              <Input 
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            <Textarea 
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input 
                placeholder="Assigned to"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
              />
              <Input 
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
              <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
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
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>For: {getStakeholderName(task.stakeholderId)}</span>
                      <span>•</span>
                      <span>Assigned to: {task.assignedTo}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'in-progress')}>
                    Start
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'completed')}>
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="communication" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Communication History</CardTitle>
            </div>
            <CardDescription>
              Track all interactions and communications with stakeholders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakeholders.map(stakeholder => (
                <div key={stakeholder.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{stakeholder.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      Last contact: {stakeholder.lastContact}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Engagement Level: {stakeholder.engagementLevel}</p>
                    <p>Relationship Strength: {stakeholder.relationshipStrength}/10</p>
                    <p>Next Action: {stakeholder.nextAction}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Notes: {notes.filter(n => n.stakeholderId === stakeholder.id).length} |
                      Tasks: {tasks.filter(t => t.stakeholderId === stakeholder.id).length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CollaborationTools;