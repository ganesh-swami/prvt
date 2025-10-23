import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, MessageSquare, Activity } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createDiscussion,
  createTask,
  createComment,
  deleteDiscussion,
  deleteTask,
  deleteComment,
  fetchActivities,
  fetchDiscussions,
  fetchTasks,
  fetchComments,
  selectActivities,
  selectDiscussions,
  selectDiscussionsLoading,
  selectSaving,
  selectSelectedDiscussion,
  selectTasks,
  selectTasksLoading,
  selectDiscussionComments,
  updateTask,
  setSelectedDiscussion,
} from "@/store/slices/teamCollaborationSlice";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { TaskForm } from "./team-collaboration/TaskForm";
import { TaskList } from "./team-collaboration/TaskList";
import { DiscussionForm } from "./team-collaboration/DiscussionForm";
import { DiscussionList } from "./team-collaboration/DiscussionList";
import { DiscussionDetail } from "./team-collaboration/DiscussionDetail";
import { ActivityFeed } from "./team-collaboration/ActivityFeed";

interface TeamCollaborationEnhancedProps {
  projectId: string;
}

export function TeamCollaborationEnhanced({
  projectId,
}: TeamCollaborationEnhancedProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("tasks");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    assigned_to: "",
  });
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [commentText, setCommentText] = useState("");
  
  // Redux selectors
  const discussions = useAppSelector(selectDiscussions);
  const tasks = useAppSelector(selectTasks);
  const activities = useAppSelector(selectActivities);
  const selectedDiscussion = useAppSelector(selectSelectedDiscussion);
  const discussionsLoading = useAppSelector(selectDiscussionsLoading);
  const tasksLoading = useAppSelector(selectTasksLoading);
  const saving = useAppSelector(selectSaving);
  
  // Get comments for selected discussion
  const discussionComments = useAppSelector((state) =>
    selectedDiscussion ? selectDiscussionComments(state, selectedDiscussion.id) : []
  );
  
  // Load current user and data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);
  
  useEffect(() => {
    if (projectId) {
      dispatch(fetchDiscussions(projectId));
      dispatch(fetchTasks(projectId));
      dispatch(fetchActivities(projectId));
    }
  }, [projectId, dispatch]);
  
  // Load comments when discussion is selected
  useEffect(() => {
    if (selectedDiscussion) {
      dispatch(fetchComments(selectedDiscussion.id));
    }
  }, [selectedDiscussion, dispatch]);
  
  // Handlers
  const handleCreateTask = async () => {
    if (!newTask.title || !currentUser) {
      toast.error("Please fill in the task title");
      return;
    }
    
    try {
      await dispatch(createTask({
        projectId,
        userId: currentUser.id,
        task: newTask,
      })).unwrap();
      
      toast.success("Task created successfully!");
      setNewTask({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });
      setShowTaskForm(false);
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    }
  };
  
  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.content || !currentUser) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await dispatch(createDiscussion({
        projectId,
        userId: currentUser.id,
        discussion: newDiscussion,
      })).unwrap();
      
      toast.success("Discussion created successfully!");
      setNewDiscussion({ title: "", content: "" });
      setShowDiscussionForm(false);
    } catch (error) {
      toast.error("Failed to create discussion");
      console.error(error);
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser || !selectedDiscussion) return;
    
    try {
      await dispatch(createComment({
        discussionId: selectedDiscussion.id,
        projectId,
        userId: currentUser.id,
        content: commentText,
      })).unwrap();
      
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };
  
  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    if (!currentUser) return;
    
    try {
      await dispatch(updateTask({
        taskId,
        projectId,
        userId: currentUser.id,
        updates: { status: status as any },
      })).unwrap();
      
      toast.success("Task updated!");
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success("Task deleted!");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };
  
  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    
    try {
      await dispatch(deleteDiscussion(discussionId)).unwrap();
      toast.success("Discussion deleted!");
      dispatch(setSelectedDiscussion(null));
    } catch (error) {
      toast.error("Failed to delete discussion");
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string, discussionId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await dispatch(deleteComment({ commentId, discussionId })).unwrap();
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error(error);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
        <p className="text-gray-600">Manage tasks, discussions, and team activity</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b">
        {[
          { id: "tasks", label: "Tasks", icon: CheckCircle2 },
          { id: "discussions", label: "Discussions", icon: MessageSquare },
          { id: "activity", label: "Activity", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
              <Button onClick={() => setShowTaskForm(!showTaskForm)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            {showTaskForm && (
              <TaskForm
                newTask={newTask}
                onTaskChange={setNewTask}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
                saving={saving}
              />
            )}

            <TaskList
              tasks={tasks}
              currentUserId={currentUser?.id || null}
              loading={tasksLoading}
              onUpdateStatus={handleUpdateTaskStatus}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {/* DISCUSSIONS TAB */}
        {activeTab === "discussions" && (
          <div className="grid grid-cols-3 gap-4">
            {/* Discussions List */}
            <div className="col-span-1 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Discussions</h2>
                <Button size="sm" onClick={() => setShowDiscussionForm(!showDiscussionForm)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {showDiscussionForm && (
                <DiscussionForm
                  newDiscussion={newDiscussion}
                  onDiscussionChange={setNewDiscussion}
                  onSubmit={handleCreateDiscussion}
                  onCancel={() => setShowDiscussionForm(false)}
                  saving={saving}
                />
              )}

              <DiscussionList
                discussions={discussions}
                selectedDiscussionId={selectedDiscussion?.id || null}
                loading={discussionsLoading}
                onSelectDiscussion={(discussion) => dispatch(setSelectedDiscussion(discussion))}
              />
            </div>

            {/* Discussion Detail */}
            <div className="col-span-2">
              <DiscussionDetail
                discussion={selectedDiscussion}
                comments={discussionComments}
                currentUserId={currentUser?.id || null}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onAddComment={handleAddComment}
                onDeleteDiscussion={handleDeleteDiscussion}
                onDeleteComment={handleDeleteComment}
                saving={saving}
              />
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityFeed activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}
