import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import {
  TeamDiscussion,
  DiscussionComment,
  TeamTask,
  TeamActivity,
} from "@/types";
import {
  teamDiscussionsApi,
  discussionCommentsApi,
  teamTasksApi,
  teamActivitiesApi,
} from "@/lib/teamCollaborationApi";

interface TeamCollaborationState {
  projectId: string | null;
  
  // Discussions
  discussions: TeamDiscussion[];
  selectedDiscussion: TeamDiscussion | null;
  discussionComments: Record<string, DiscussionComment[]>;
  
  // Tasks
  tasks: TeamTask[];
  
  // Activities
  activities: TeamActivity[];
  
  // Loading states
  discussionsLoading: boolean;
  tasksLoading: boolean;
  activitiesLoading: boolean;
  
  // Saving states
  saving: boolean;
  
  // Error handling
  error: string | null;
}

const initialState: TeamCollaborationState = {
  projectId: null,
  discussions: [],
  selectedDiscussion: null,
  discussionComments: {},
  tasks: [],
  activities: [],
  discussionsLoading: false,
  tasksLoading: false,
  activitiesLoading: false,
  saving: false,
  error: null,
};

// Async Thunks

// Discussions
export const fetchDiscussions = createAsyncThunk(
  "teamCollaboration/fetchDiscussions",
  async (projectId: string) => {
    return await teamDiscussionsApi.getByProjectId(projectId);
  }
);

export const fetchDiscussionById = createAsyncThunk(
  "teamCollaboration/fetchDiscussionById",
  async (discussionId: string) => {
    return await teamDiscussionsApi.getById(discussionId);
  }
);

export const createDiscussion = createAsyncThunk(
  "teamCollaboration/createDiscussion",
  async ({
    projectId,
    userId,
    discussion,
  }: {
    projectId: string;
    userId: string;
    discussion: { title: string; content: string };
  }) => {
    const newDiscussion = await teamDiscussionsApi.create({
      project_id: projectId,
      created_by: userId,
      ...discussion,
    });

    // Create activity
    await teamActivitiesApi.create({
      project_id: projectId,
      activity_type: "discussion_created",
      entity_id: newDiscussion.id,
      entity_type: "discussion",
      user_id: userId,
      metadata: { title: discussion.title },
    });

    return newDiscussion;
  }
);

export const deleteDiscussion = createAsyncThunk(
  "teamCollaboration/deleteDiscussion",
  async (discussionId: string) => {
    await teamDiscussionsApi.delete(discussionId);
    return discussionId;
  }
);

// Comments
export const fetchComments = createAsyncThunk(
  "teamCollaboration/fetchComments",
  async (discussionId: string) => {
    return await discussionCommentsApi.getByDiscussionId(discussionId);
  }
);

export const createComment = createAsyncThunk(
  "teamCollaboration/createComment",
  async ({
    discussionId,
    projectId,
    userId,
    content,
  }: {
    discussionId: string;
    projectId: string;
    userId: string;
    content: string;
  }) => {
    const newComment = await discussionCommentsApi.create({
      discussion_id: discussionId,
      project_id: projectId,
      created_by: userId,
      content,
    });

    // Create activity
    await teamActivitiesApi.create({
      project_id: projectId,
      activity_type: "comment_created",
      entity_id: newComment.id,
      entity_type: "comment",
      user_id: userId,
      metadata: { discussion_id: discussionId },
    });

    return { discussionId, comment: newComment };
  }
);

export const deleteComment = createAsyncThunk(
  "teamCollaboration/deleteComment",
  async ({ commentId, discussionId }: { commentId: string; discussionId: string }) => {
    await discussionCommentsApi.delete(commentId);
    return { commentId, discussionId };
  }
);

// Tasks
export const fetchTasks = createAsyncThunk(
  "teamCollaboration/fetchTasks",
  async (projectId: string) => {
    return await teamTasksApi.getByProjectId(projectId);
  }
);

export const createTask = createAsyncThunk(
  "teamCollaboration/createTask",
  async ({
    projectId,
    userId,
    task,
  }: {
    projectId: string;
    userId: string;
    task: Partial<TeamTask>;
  }) => {
    const newTask = await teamTasksApi.create({
      project_id: projectId,
      created_by: userId,
      ...task,
    });

    // Create activity
    await teamActivitiesApi.create({
      project_id: projectId,
      activity_type: "task_created",
      entity_id: newTask.id,
      entity_type: "task",
      user_id: userId,
      metadata: { title: task.title },
    });

    return newTask;
  }
);

export const updateTask = createAsyncThunk(
  "teamCollaboration/updateTask",
  async ({
    taskId,
    projectId,
    userId,
    updates,
  }: {
    taskId: string;
    projectId: string;
    userId: string;
    updates: Partial<TeamTask>;
  }) => {
    const updatedTask = await teamTasksApi.update(taskId, updates);

    // Create activity for status changes
    if (updates.status === "completed") {
      await teamActivitiesApi.create({
        project_id: projectId,
        activity_type: "task_completed",
        entity_id: taskId,
        entity_type: "task",
        user_id: userId,
        metadata: { title: updatedTask.title },
      });
    } else if (updates.status) {
      await teamActivitiesApi.create({
        project_id: projectId,
        activity_type: "task_updated",
        entity_id: taskId,
        entity_type: "task",
        user_id: userId,
        metadata: { title: updatedTask.title, status: updates.status },
      });
    }

    return updatedTask;
  }
);

export const deleteTask = createAsyncThunk(
  "teamCollaboration/deleteTask",
  async (taskId: string) => {
    await teamTasksApi.delete(taskId);
    return taskId;
  }
);

// Activities
export const fetchActivities = createAsyncThunk(
  "teamCollaboration/fetchActivities",
  async (projectId: string) => {
    return await teamActivitiesApi.getByProjectId(projectId);
  }
);

// Slice
const teamCollaborationSlice = createSlice({
  name: "teamCollaboration",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setSelectedDiscussion: (state, action: PayloadAction<TeamDiscussion | null>) => {
      state.selectedDiscussion = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Discussions
    builder.addCase(fetchDiscussions.pending, (state) => {
      state.discussionsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDiscussions.fulfilled, (state, action) => {
      state.discussions = action.payload;
      state.discussionsLoading = false;
    });
    builder.addCase(fetchDiscussions.rejected, (state, action) => {
      state.discussionsLoading = false;
      state.error = action.error.message || "Failed to fetch discussions";
    });

    // Fetch Discussion By ID
    builder.addCase(fetchDiscussionById.fulfilled, (state, action) => {
      if (action.payload) {
        state.selectedDiscussion = action.payload;
        if (action.payload.comments) {
          state.discussionComments[action.payload.id] = action.payload.comments;
        }
      }
    });

    // Create Discussion
    builder.addCase(createDiscussion.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(createDiscussion.fulfilled, (state, action) => {
      state.discussions.unshift(action.payload);
      state.saving = false;
    });
    builder.addCase(createDiscussion.rejected, (state, action) => {
      state.saving = false;
      state.error = action.error.message || "Failed to create discussion";
    });

    // Delete Discussion
    builder.addCase(deleteDiscussion.fulfilled, (state, action) => {
      state.discussions = state.discussions.filter((d) => d.id !== action.payload);
      if (state.selectedDiscussion?.id === action.payload) {
        state.selectedDiscussion = null;
      }
    });

    // Fetch Comments
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      if (action.meta.arg) {
        state.discussionComments[action.meta.arg] = action.payload;
      }
    });

    // Create Comment
    builder.addCase(createComment.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      const { discussionId, comment } = action.payload;
      if (!state.discussionComments[discussionId]) {
        state.discussionComments[discussionId] = [];
      }
      state.discussionComments[discussionId].push(comment);
      state.saving = false;
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.saving = false;
      state.error = action.error.message || "Failed to create comment";
    });

    // Delete Comment
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const { commentId, discussionId } = action.payload;
      if (state.discussionComments[discussionId]) {
        state.discussionComments[discussionId] = state.discussionComments[discussionId].filter(
          (c) => c.id !== commentId
        );
      }
    });

    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.tasksLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.tasksLoading = false;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.tasksLoading = false;
      state.error = action.error.message || "Failed to fetch tasks";
    });

    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload);
      state.saving = false;
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.saving = false;
      state.error = action.error.message || "Failed to create task";
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    // Delete Task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    });

    // Fetch Activities
    builder.addCase(fetchActivities.pending, (state) => {
      state.activitiesLoading = true;
      state.error = null;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.activities = action.payload;
      state.activitiesLoading = false;
    });
    builder.addCase(fetchActivities.rejected, (state, action) => {
      state.activitiesLoading = false;
      state.error = action.error.message || "Failed to fetch activities";
    });
  },
});

// Actions
export const { setProjectId, setSelectedDiscussion, clearError, reset } =
  teamCollaborationSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) => state.teamCollaboration.projectId;
export const selectDiscussions = (state: RootState) => state.teamCollaboration.discussions;
export const selectSelectedDiscussion = (state: RootState) =>
  state.teamCollaboration.selectedDiscussion;
export const selectDiscussionComments = (state: RootState, discussionId: string) =>
  state.teamCollaboration.discussionComments[discussionId] || [];
export const selectTasks = (state: RootState) => state.teamCollaboration.tasks;
export const selectActivities = (state: RootState) => state.teamCollaboration.activities;
export const selectDiscussionsLoading = (state: RootState) =>
  state.teamCollaboration.discussionsLoading;
export const selectTasksLoading = (state: RootState) => state.teamCollaboration.tasksLoading;
export const selectActivitiesLoading = (state: RootState) =>
  state.teamCollaboration.activitiesLoading;
export const selectSaving = (state: RootState) => state.teamCollaboration.saving;
export const selectError = (state: RootState) => state.teamCollaboration.error;

export default teamCollaborationSlice.reducer;
