import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTasks,
  addTask,
  deleteTask,
  selectTasks,
  selectLoadingTasks,
  selectStakeholders,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface EngagementRemindersProps {
  projectId: string;
}

const EngagementReminders: React.FC<EngagementRemindersProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(selectTasks);
  const stakeholders = useAppSelector(selectStakeholders);
  const loading = useAppSelector(selectLoadingTasks);

  const [newReminder, setNewReminder] = useState<{
    stakeholderId: string;
    type: "follow-up" | "meeting" | "check-in" | "deadline";
    title: string;
    description: string;
    dueDate: string;
    frequency: "once" | "weekly" | "monthly" | "quarterly";
    priority: "high" | "medium" | "low";
  }>({
    stakeholderId: "",
    type: "follow-up",
    title: "",
    description: "",
    dueDate: "",
    frequency: "once",
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tasks on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  // Calculate upcoming reminders
  const upcomingReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const dueDate = new Date(reminder.dueDate);
      const today = new Date();
      const daysDiff = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );
      return (
        daysDiff <= 7 &&
        daysDiff >= 0 &&
        reminder.isActive &&
        !reminder.isCompleted
      );
    });
  }, [reminders]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newReminder.stakeholderId) {
      newErrors.stakeholderId = "Please select a stakeholder";
    }
    if (!newReminder.title.trim()) {
      newErrors.title = "Please enter a title";
    }
    if (!newReminder.dueDate) {
      newErrors.dueDate = "Please select a due date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addReminder = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        addTask({
          stakeholderId: newReminder.stakeholderId,
          type: newReminder.type,
          title: newReminder.title.trim(),
          description: newReminder.description.trim() || undefined,
          dueDate: new Date(newReminder.dueDate).toISOString(),
          frequency: newReminder.frequency,
          priority: newReminder.priority,
        })
      ).unwrap();

      toast.success("Reminder created successfully");
      setNewReminder({
        stakeholderId: "",
        type: "follow-up",
        title: "",
        description: "",
        dueDate: "",
        frequency: "once",
        priority: "medium",
      });
      setErrors({});
    } catch (error) {
      toast.error("Failed to create reminder");
      console.error("Error creating reminder:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success("Reminder deleted");
    } catch (error) {
      toast.error("Failed to delete reminder");
      console.error("Error deleting reminder:", error);
    }
  };

  const getStakeholderName = (id: string) => {
    return stakeholders.find((s) => s.id === id)?.name || "Unknown";
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "follow-up":
        return <Bell className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "check-in":
        return <Clock className="h-4 w-4" />;
      case "deadline":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
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
    <div className="space-y-6">
      {upcomingReminders.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">
                Upcoming Reminders
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-white rounded border"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(reminder.type)}
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getStakeholderName(reminder.stakeholderId)} • Due in{" "}
                        {getDaysUntilDue(reminder.dueDate)} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      Delete
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
            <div>
              <label className="text-sm font-medium flex mb-2">
                Stakeholder <span className="text-red-500">*</span>
              </label>
              <Select
                value={newReminder.stakeholderId}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, stakeholderId: value })
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
              <label className="text-sm font-medium flex mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={newReminder.type}
                onValueChange={(value) =>
                  setNewReminder({
                    ...newReminder,
                    type: value as
                      | "follow-up"
                      | "meeting"
                      | "check-in"
                      | "deadline",
                  })
                }
              >
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
          </div>
          <div>
            <label className="text-sm font-medium flex mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Reminder title"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder({ ...newReminder, title: e.target.value })
              }
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <Input
            placeholder="Description (optional)"
            value={newReminder.description}
            onChange={(e) =>
              setNewReminder({ ...newReminder, description: e.target.value })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium flex mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={newReminder.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, dueDate: e.target.value })
                }
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium flex mb-2">Frequency</label>
              <Select
                value={newReminder.frequency}
                onValueChange={(value) =>
                  setNewReminder({
                    ...newReminder,
                    frequency: value as
                      | "once"
                      | "weekly"
                      | "monthly"
                      | "quarterly",
                  })
                }
              >
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
            </div>
            <div>
              <label className="text-sm font-medium flex mb-2">Priority</label>
              <Select
                value={newReminder.priority}
                onValueChange={(value) =>
                  setNewReminder({
                    ...newReminder,
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
          <Button onClick={addReminder} className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {!saving && <Plus className="h-4 w-4 mr-2" />}
            {saving ? "Creating..." : "Create Reminder"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reminders Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first reminder to stay on top of stakeholder
                engagement.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 border rounded-lg ${
                    reminder.isCompleted ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(reminder.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`font-medium ${
                              reminder.isCompleted ? "line-through" : ""
                            }`}
                          >
                            {reminder.title}
                          </h4>
                          <Badge
                            className={getPriorityColor(reminder.priority)}
                          >
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
                          <span>Due: {formatDate(reminder.dueDate)}</span>
                          <span>
                            Frequency:{" "}
                            {reminder.frequency.charAt(0).toUpperCase() +
                              reminder.frequency.slice(1)}
                          </span>
                          <span>
                            Type:{" "}
                            {reminder.type.charAt(0).toUpperCase() +
                              reminder.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!reminder.isCompleted && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementReminders;
