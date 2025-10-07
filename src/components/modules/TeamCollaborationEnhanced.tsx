import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Users,
  MessageSquare,
  Activity,
  Search,
  Filter,
  Plus,
  Bell,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface TeamCollaborationEnhancedProps {
  projectId: string;
}

export function TeamCollaborationEnhanced({
  projectId,
}: TeamCollaborationEnhancedProps) {
  const [activeTab, setActiveTab] = React.useState("tasks");
  const [searchQuery, setSearchQuery] = React.useState("");

  const mockTasks = [
    {
      id: "1",
      title: "Financial Model Review",
      status: "in-progress",
      priority: "high",
      assignee: "Sarah Chen",
      dueDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Market Research Analysis",
      status: "todo",
      priority: "medium",
      assignee: "Mike Johnson",
      dueDate: "2024-01-20",
    },
    {
      id: "3",
      title: "Competitor Analysis Update",
      status: "completed",
      priority: "low",
      assignee: "Alex Kim",
      dueDate: "2024-01-10",
    },
  ];

  const mockComments = [
    {
      id: "1",
      author: "Sarah Chen",
      content: "Updated the financial projections based on latest market data",
      time: "2 hours ago",
      replies: 3,
    },
    {
      id: "2",
      author: "Mike Johnson",
      content: "Great progress on the market sizing! Can we schedule a review?",
      time: "4 hours ago",
      replies: 1,
    },
  ];

  const mockActivity = [
    {
      id: "1",
      user: "Sarah Chen",
      action: "completed task",
      target: "Financial Model Review",
      time: "1 hour ago",
      type: "task",
    },
    {
      id: "2",
      user: "Mike Johnson",
      action: "commented on",
      target: "Market Research",
      time: "2 hours ago",
      type: "comment",
    },
    {
      id: "3",
      user: "Alex Kim",
      action: "assigned to",
      target: "Competitor Analysis",
      time: "3 hours ago",
      type: "assignment",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Collaboration
            </h1>
            <p className="text-gray-600">
              Manage tasks, discussions, and team activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // Simple seat check simulation
                const currentSeats = 3;
                const maxSeats = 2;
                if (currentSeats > maxSeats) {
                  // Would trigger SeatOverflowPaywall
                  console.log("Seat overflow detected");
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6">
          {[
            { id: "tasks", label: "Tasks", icon: CheckCircle2 },
            { id: "discussions", label: "Discussions", icon: MessageSquare },
            { id: "activity", label: "Activity", icon: Activity },
            { id: "editor", label: "Shared Editor", icon: Edit3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === "tasks" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Task Filters */}
            <div className="col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Status</h4>
                    {["All", "To Do", "In Progress", "Completed"].map(
                      (status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input type="checkbox" className="rounded" />
                          {status}
                        </label>
                      )
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Priority</h4>
                    {["High", "Medium", "Low"].map((priority) => (
                      <label
                        key={priority}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input type="checkbox" className="rounded" />
                        {priority}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <div className="col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tasks ({mockTasks.length})</span>
                    <Button size="sm">Add Task</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(task.status)}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(task.priority)}
                                >
                                  {task.priority}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Due {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {task.assignee}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "discussions" && (
          <Card>
            <CardHeader>
              <CardTitle>Team Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-l-4 border-blue-200 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {comment.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {comment.replies} replies
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === "editor" && (
          <Card>
            <CardHeader>
              <CardTitle>Shared Document Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-white">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="flex items-center gap-1">
                    {["Sarah Chen", "Mike Johnson"].map((user, i) => (
                      <div key={user} className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            i === 0 ? "bg-green-500" : "bg-blue-500"
                          }`}
                        />
                        <span className="text-xs text-gray-600">{user}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="prose max-w-none">
                  <h3>Project Strategy Document</h3>
                  <p>
                    This is a collaborative document where team members can work
                    together in real-time...
                  </p>
                  <p className="text-gray-500 italic">
                    Real-time editing features would be implemented here with
                    proper backend integration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
