import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotes,
  addNote,
  selectNotes,
  selectLoadingNotes,
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
  const loading = useAppSelector(selectLoadingNotes);

  const [newNote, setNewNote] = useState({
    stakeholderId: "",
    content: "",
    isShared: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch notes on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchNotes(projectId));
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

  const getStakeholderName = (id: string) => {
    return stakeholders.find((s) => s.id === id)?.name || "Unknown";
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
              <CardTitle>Task Management</CardTitle>
            </div>
            <CardDescription>
              Task management feature coming soon. Use the Reminders tab for
              now.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Tasks Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              This feature is currently under development.
            </p>
          </CardContent>
        </Card>
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
