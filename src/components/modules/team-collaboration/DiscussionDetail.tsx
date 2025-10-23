import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Send } from "lucide-react";
import { TeamDiscussion, DiscussionComment } from "@/types";

interface DiscussionDetailProps {
  discussion: TeamDiscussion | null;
  comments: DiscussionComment[];
  currentUserId: string | null;
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onAddComment: () => void;
  onDeleteDiscussion: (discussionId: string) => void;
  onDeleteComment: (commentId: string, discussionId: string) => void;
  saving: boolean;
}

export function DiscussionDetail({
  discussion,
  comments,
  currentUserId,
  commentText,
  onCommentTextChange,
  onAddComment,
  onDeleteDiscussion,
  onDeleteComment,
  saving,
}: DiscussionDetailProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (!discussion) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-gray-500">
          Select a discussion to view details
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-xl">{discussion.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              by {discussion.creator?.name || "Unknown"} • {formatDate(discussion.created_at)}
            </p>
          </div>
          {discussion.created_by === currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteDiscussion(discussion.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{discussion.content}</p>

        <Separator className="my-4" />

        <h4 className="font-semibold mb-4">Comments ({comments.length})</h4>

        <ScrollArea className="h-[300px] mb-4">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {comment.creator?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    {comment.created_by === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComment(comment.id, discussion.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="flex-1"
          />
          <Button onClick={onAddComment} disabled={saving || !commentText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
