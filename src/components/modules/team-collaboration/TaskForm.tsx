import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  email?: string;
}

interface TaskFormProps {
  newTask: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_date: string;
    assigned_to: string;
  };
  collaborators: Collaborator[];
  onTaskChange: (task: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}

export function TaskForm({ newTask, collaborators, onTaskChange, onSubmit, onCancel, saving }: TaskFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Create New Task
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-left block mb-1.5">Title *</Label>
          <Input
            value={newTask.title}
            onChange={(e) => onTaskChange({ ...newTask, title: e.target.value })}
            placeholder="Task title"
          />
        </div>
        <div>
          <Label className="text-left block mb-1.5">Description</Label>
          <Textarea
            value={newTask.description}
            onChange={(e) => onTaskChange({ ...newTask, description: e.target.value })}
            placeholder="Task description"
            rows={3}
          />
        </div>
        <div>
          <Label className="text-left block mb-1.5">Assigned To *</Label>
          <Select
            value={newTask.assigned_to}
            onValueChange={(value) => onTaskChange({ ...newTask, assigned_to: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {collaborators.map((collab) => (
                <SelectItem key={collab.id} value={collab.id}>
                  {collab.name} {collab.email && `(${collab.email})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-left block mb-1.5">Priority</Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) => onTaskChange({ ...newTask, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-left block mb-1.5">Due Date</Label>
            <Input
              type="date"
              value={newTask.due_date}
              onChange={(e) => onTaskChange({ ...newTask, due_date: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
