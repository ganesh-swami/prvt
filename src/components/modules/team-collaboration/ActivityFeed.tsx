import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageSquare, Activity as ActivityIcon } from "lucide-react";
import { TeamActivity } from "@/types";

interface ActivityFeedProps {
  activities: TeamActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "discussion":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getActivityText = (activity: TeamActivity) => {
    switch (activity.activity_type) {
      case "task_created":
        return "created a task";
      case "task_completed":
        return "completed a task";
      case "task_updated":
        return "updated a task";
      case "discussion_created":
        return "started a discussion";
      case "comment_created":
        return "commented on a discussion";
      default:
        return "performed an action";
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No activity yet. Start by creating tasks or discussions!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="mt-1">{getActivityIcon(activity.entity_type)}</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {activity.user?.name || "Someone"}
                  </span>{" "}
                  <span className="text-gray-600">{getActivityText(activity)}</span>
                  {activity.metadata?.title && (
                    <span className="font-medium"> "{activity.metadata.title}"</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
