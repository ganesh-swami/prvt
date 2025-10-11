import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTimeline,
  addTimelineEvent,
  selectTimeline,
  selectLoadingTimeline,
  selectStakeholders,
} from "@/store/slices/stakeholdersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { Clock, Plus, TrendingUp, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RelationshipTimelineProps {
  projectId: string;
}

const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const timelineEntries = useAppSelector(selectTimeline);
  const stakeholders = useAppSelector(selectStakeholders);
  const loading = useAppSelector(selectLoadingTimeline);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newEntry, setNewEntry] = useState({
    stakeholderId: "",
    date: "",
    type: "Meeting" as "Meeting" | "Email" | "Call" | "Event" | "Milestone",
    description: "",
    outcome: "Neutral" as "Positive" | "Neutral" | "Negative",
    relationshipChange: 0,
  });

  // Fetch timeline on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchTimeline(projectId));
    }
  }, [dispatch, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newEntry.stakeholderId) {
      newErrors.stakeholderId = "Please select a stakeholder";
    }
    if (!newEntry.date) {
      newErrors.date = "Please select a date";
    }
    if (!newEntry.description.trim()) {
      newErrors.description = "Please enter a description";
    }
    if (newEntry.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (newEntry.relationshipChange < -5 || newEntry.relationshipChange > 5) {
      newErrors.relationshipChange =
        "Relationship change must be between -5 and +5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTimelineEntry = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        addTimelineEvent({
          projectId,
          stakeholderId: newEntry.stakeholderId,
          date: new Date(newEntry.date).toISOString(),
          type: newEntry.type,
          description: newEntry.description.trim(),
          outcome: newEntry.outcome,
          relationshipChange: newEntry.relationshipChange,
        })
      ).unwrap();

      toast.success("Timeline entry added successfully");
      setNewEntry({
        stakeholderId: "",
        date: "",
        type: "Meeting",
        description: "",
        outcome: "Neutral",
        relationshipChange: 0,
      });
      setErrors({});
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add timeline entry");
      console.error("Error adding timeline entry:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStakeholderName = (id: string) => {
    return stakeholders.find((s) => s.id === id)?.name || "Unknown";
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "Positive":
        return "bg-green-100 text-green-800";
      case "Negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedEntries = [...timelineEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Relationship Timeline</h3>
          <CustomTooltip content="Track all stakeholder interactions over time to identify relationship trends and patterns" />
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Timeline Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Stakeholder <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newEntry.stakeholderId}
                  onValueChange={(value) =>
                    setNewEntry({ ...newEntry, stakeholderId: value })
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
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, date: e.target.value })
                  }
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Interaction Type</label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value: any) =>
                    setNewEntry({ ...newEntry, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Select
                  value={newEntry.outcome}
                  onValueChange={(value: any) =>
                    setNewEntry({ ...newEntry, outcome: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Relationship Change (-5 to +5)
              </label>
              <Input
                type="number"
                min="-5"
                max="5"
                value={newEntry.relationshipChange}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    relationshipChange: parseInt(e.target.value) || 0,
                  })
                }
                className={errors.relationshipChange ? "border-red-500" : ""}
              />
              {errors.relationshipChange && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.relationshipChange}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, description: e.target.value })
                }
                placeholder="Describe the interaction and key outcomes... (min 10 characters)"
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTimelineEntry} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {saving ? "Saving..." : "Add Entry"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sortedEntries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Timeline Entries</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking stakeholder interactions to build a comprehensive
              relationship history.
            </p>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {getStakeholderName(entry.stakeholderId)}
                      </span>
                      <Badge variant="outline">{entry.type}</Badge>
                      <Badge className={getOutcomeColor(entry.outcome)}>
                        {entry.outcome}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {entry.relationshipChange !== 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`h-3 w-3 ${
                              entry.relationshipChange > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                          <span
                            className={
                              entry.relationshipChange > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            Relationship{" "}
                            {entry.relationshipChange > 0 ? "+" : ""}
                            {entry.relationshipChange}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelationshipTimeline;
