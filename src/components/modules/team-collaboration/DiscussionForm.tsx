import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DiscussionFormProps {
  newDiscussion: {
    title: string;
    content: string;
  };
  onDiscussionChange: (discussion: { title: string; content: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}

export function DiscussionForm({
  newDiscussion,
  onDiscussionChange,
  onSubmit,
  onCancel,
  saving,
}: DiscussionFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">New Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={newDiscussion.title}
          onChange={(e) =>
            onDiscussionChange({ ...newDiscussion, title: e.target.value })
          }
          placeholder="Title"
        />
        <Textarea
          value={newDiscussion.content}
          onChange={(e) =>
            onDiscussionChange({ ...newDiscussion, content: e.target.value })
          }
          placeholder="What would you like to discuss?"
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSubmit} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
