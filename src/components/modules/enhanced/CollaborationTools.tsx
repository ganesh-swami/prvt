import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotes,
  addNote,
  selectNotes,
  selectLoadingNotes,
  selectStakeholders,
  fetchTasks,
  addTask,
  completeTask,
  selectTasks,
  selectLoadingTasks,
  fetchTeamMembers,
  selectTeamMembers,
  selectLoadingTeamMembers,
} from "@/store/slices/stakeholdersSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  CheckSquare,
  Share2,
  Plus,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface CollaborationToolsProps {
  projectId: string;
}

const CollaborationTools: React.FC<CollaborationToolsProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectNotes);
  const stakeholders = useAppSelector(selectStakeholders);
  const tasks = useAppSelector(selectTasks);
  const teamMembers = useAppSelector(selectTeamMembers);
  const loading = useAppSelector(selectLoadingNotes);
  const loadingTasks = useAppSelector(selectLoadingTasks);
  const loadingTeamMembers = useAppSelector(selectLoadingTeamMembers);

  const [newNote, setNewNote] = useState({
    stakeholderId: "",
    content: "",
    isShared: false,
  });
  const [newTask, setNewTask] = useState<{
    stakeholderId: string;
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
  }>({
    stakeholderId: "",
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});

  // Fetch notes, tasks, and team members on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchNotes(projectId));
      dispatch(fetchTasks(projectId));
      dispatch(fetchTeamMembers(projectId));
    }
  }, [dispatch, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newNote.stakeholderId) {
      newErrors.stakeholderId = "Please select a stakeholder";
    }
    if (!newNote.content.trim()) {
      newErrors.content = "Please enter note content";
    }
    if (newNote.content.trim().length < 5) {
      newErrors.content = "Note must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNote = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        addNote({
          stakeholderId: newNote.stakeholderId,
          content: newNote.content.trim(),
          isShared: newNote.isShared,
          createdByName: "Current User", // TODO: Get from auth context
        })
      ).unwrap();

      toast.success(
        newNote.isShared
          ? "Shared note added successfully"
          : "Private note added successfully"
      );
      setNewNote({
        stakeholderId: "",
        content: "",
        isShared: false,
      });
      setErrors({});
    } catch (error) {
      toast.error("Failed to add note");
      console.error("Error adding note:", error);
    } finally {
      setSaving(false);
    }
  };

  const validateTaskForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newTask.stakeholderId) {
      newErrors.stakeholderId = "Please select a stakeholder";
    }
    if (!newTask.title.trim()) {
      newErrors.title = "Please enter task title";
    }
    if (!newTask.assignedTo) {
      newErrors.assignedTo = "Please select a team member";
    }
    if (!newTask.dueDate) {
      newErrors.dueDate = "Please select a due date";
    }

    setTaskErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    if (!validateTaskForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSavingTask(true);
    try {
      await dispatch(
        addTask({
          stakeholderId: newTask.stakeholderId,
          type: "follow-up",
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          dueDate: new Date(newTask.dueDate).toISOString(),
          frequency: "once",
          priority: newTask.priority,
          assignedTo: newTask.assignedTo,
        })
      ).unwrap();

      toast.success("Task created successfully");
      setNewTask({
        stakeholderId: "",
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "medium",
      });
      setTaskErrors({});
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    } finally {
      setSavingTask(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await dispatch(completeTask(taskId)).unwrap();
      toast.success("Task marked as completed");
    } catch (error) {
      toast.error("Failed to complete task");
      console.error("Error completing task:", error);
    }
  };

  const getStakeholderName = (id: string) => {
    return stakeholders.find((s) => s.id === id)?.name || "Unknown";
  };

  const getTeamMemberName = (id: string) => {
    return teamMembers.find((m) => m.id === id)?.name || "Unknown";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (isCompleted: boolean) => {
    if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <CardDescription>
              Create private notes or share them with your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Stakeholder <span className="text-red-500">*</span>
              </label>
              <Select
                value={newNote.stakeholderId}
                onValueChange={(value) =>
                  setNewNote({ ...newNote, stakeholderId: value })
                }
              >
                <SelectTrigger
                  className={errors.stakeholderId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select stakeholder" />
                </SelectTrigger>
                <SelectContent>
                  {stakeholders.map((stakeholder) => (
                    <SelectItem key={stakeholder.id} value={stakeholder.id}>
                      {stakeholder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stakeholderId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.stakeholderId}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Note Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Add your note about this stakeholder... (min 5 characters)"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                className={errors.content ? "border-red-500" : ""}
                rows={4}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">{errors.content}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="share-note"
                checked={newNote.isShared}
                onCheckedChange={(checked) =>
                  setNewNote({ ...newNote, isShared: checked === true })
                }
              />
              <label
                htmlFor="share-note"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share with team</span>
                </div>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  {newNote.isShared
                    ? "All team members can see this note"
                    : "Only you can see this note"}
                </p>
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Plus className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Notes Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start adding notes to track important information about your
                stakeholders.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">
                        {getStakeholderName(note.stakeholderId)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        by {note.createdByName || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.isShared ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-800"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="tasks" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <CardTitle>Create Task</CardTitle>
            </div>
            <CardDescription>
              Assign tasks to team members for stakeholder engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex mb-2">
                  Stakeholder <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newTask.stakeholderId}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, stakeholderId: value })
                  }
                >
                  <SelectTrigger
                    className={taskErrors.stakeholderId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select stakeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakeholders.map((stakeholder) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {taskErrors.stakeholderId && (
                  <p className="text-sm text-red-500 mt-1">
                    {taskErrors.stakeholderId}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium flex mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className={taskErrors.title ? "border-red-500" : ""}
                />
                {taskErrors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {taskErrors.title}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex mb-2">
                Description
              </label>
              <Textarea
                placeholder="Task description (optional)"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium flex mb-2">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, assignedTo: value })
                  }
                  disabled={loadingTeamMembers}
                >
                  <SelectTrigger
                    className={taskErrors.assignedTo ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loadingTeamMembers
                          ? "Loading team members..."
                          : teamMembers.length === 0
                          ? "No team members found"
                          : "Select team member"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No team members available
                      </SelectItem>
                    ) : (
                      teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {taskErrors.assignedTo && (
                  <p className="text-sm text-red-500 mt-1">
                    {taskErrors.assignedTo}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium flex mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className={taskErrors.dueDate ? "border-red-500" : ""}
                />
                {taskErrors.dueDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {taskErrors.dueDate}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium flex mb-2">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({
                      ...newTask,
                      priority: value as "high" | "medium" | "low",
                    })
                  }
                >
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
            </div>
            <Button onClick={handleAddTask} disabled={savingTask}>
              {savingTask && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              {savingTask ? "Creating..." : "Create Task"}
            </Button>
          </CardContent>
        </Card>

        {loadingTasks ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tasks Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first task to start tracking team work on
                stakeholder engagement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4
                          className={`font-medium ${
                            task.isCompleted ? "line-through opacity-50" : ""
                          }`}
                        >
                          {task.title}
                        </h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {getStatusBadge(task.isCompleted)}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          For: {getStakeholderName(task.stakeholderId)}
                        </span>
                        <span>•</span>
                        <span>
                          Assigned to:{" "}
                          {getTeamMemberName(task.assignedTo || "")}
                        </span>
                        <span>•</span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  {!task.isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Mark as Complete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              {stakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{stakeholder.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      Last contact: {stakeholder.lastContact}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Engagement Level: {stakeholder.engagementLevel}</p>
                    <p>
                      Relationship Strength: {stakeholder.relationshipStrength}
                      /10
                    </p>
                    <p>Next Action: {stakeholder.nextAction}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Notes:{" "}
                      {
                        notes.filter((n) => n.stakeholderId === stakeholder.id)
                          .length
                      }{" "}
                      | Tasks:{" "}
                      {
                        tasks.filter((t) => t.stakeholderId === stakeholder.id)
                          .length
                      }
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
