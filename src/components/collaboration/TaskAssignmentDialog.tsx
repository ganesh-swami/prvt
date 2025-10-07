import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  onAssign: (assignment: TaskAssignment) => void;
}

interface TaskAssignment {
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  notes?: string;
}

const mockUsers = [
  { id: '1', name: 'Sarah Chen', avatar: '', role: 'Product Manager' },
  { id: '2', name: 'Mike Johnson', avatar: '', role: 'Developer' },
  { id: '3', name: 'Emma Davis', avatar: '', role: 'Designer' },
  { id: '4', name: 'Alex Rodriguez', avatar: '', role: 'Analyst' }
];

export function TaskAssignmentDialog({ open, onOpenChange, taskId, onAssign }: TaskAssignmentDialogProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (!selectedUser || !dueDate) return;
    
    onAssign({
      assigneeId: selectedUser,
      priority,
      dueDate,
      notes
    });
    
    onOpenChange(false);
    setSelectedUser('');
    setPriority('medium');
    setDueDate('');
    setNotes('');
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Assignee</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge variant="outline" className={getPriorityColor('low')}>Low</Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge variant="outline" className={getPriorityColor('medium')}>Medium</Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge variant="outline" className={getPriorityColor('high')}>High</Badge>
                </SelectItem>
                <SelectItem value="urgent">
                  <Badge variant="outline" className={getPriorityColor('urgent')}>Urgent</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context or requirements..."
              className="h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedUser || !dueDate}
          >
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}