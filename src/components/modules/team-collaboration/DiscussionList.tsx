import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { TeamDiscussion } from "@/types";

interface DiscussionListProps {
  discussions: TeamDiscussion[];
  selectedDiscussionId: string | null;
  loading: boolean;
  onSelectDiscussion: (discussion: TeamDiscussion) => void;
}

export function DiscussionList({
  discussions,
  selectedDiscussionId,
  loading,
  onSelectDiscussion,
}: DiscussionListProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-gray-500">
          No discussions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {discussions.map((discussion) => (
          <Card
            key={discussion.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedDiscussionId === discussion.id ? "border-blue-500 border-2" : ""
            }`}
            onClick={() => onSelectDiscussion(discussion)}
          >
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm">{discussion.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                by {discussion.creator?.name || "Unknown"} • {formatDate(discussion.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
