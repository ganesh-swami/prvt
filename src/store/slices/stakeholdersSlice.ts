import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  stakeholdersApi,
  ecosystemTimelineApi,
  ecosystemNotesApi,
  ecosystemTasksApi,
} from "@/lib/api";
import type {
  Stakeholder,
  EcosystemMapTimeline,
  EcosystemMapSharedNote,
  EcosystemMapTask,
} from "@/types";
import type { RootState } from "../index";

// camelCase version for frontend
export interface StakeholderData {
  id: string;
  name: string;
  type: string;
  influence: "High" | "Medium" | "Low";
  interest: "High" | "Medium" | "Low";
  relationship: "Supportive" | "Neutral" | "Opposing";
  relationshipStrength: number;
  engagementLevel: "Active" | "Moderate" | "Minimal" | "None";
  lastContact: string;
  nextAction: string;
  riskLevel: "High" | "Medium" | "Low";
  description: string;
  contactInfo?: string;
}

export interface EngagementAnalytics {
  active: number;
  moderate: number;
  minimal: number;
  none: number;
}

export interface RiskAnalytics {
  high: number;
  medium: number;
  low: number;
}

export interface RelationshipAnalytics {
  averageStrength: number;
  strongRelationships: number; // >= 8
  needAttention: number; // <= 4
}

// CamelCase versions for frontend
export interface TimelineEventData {
  id: string;
  projectId: string;
  stakeholderId: string;
  date: string;
  type: "Meeting" | "Email" | "Call" | "Event" | "Milestone";
  description: string;
  outcome: "Positive" | "Neutral" | "Negative";
  relationshipChange: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedNoteData {
  id: string;
  projectId: string;
  stakeholderId: string;
  content: string;
  isShared: boolean;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskData {
  id: string;
  projectId: string;
  stakeholderId: string;
  type: "follow-up" | "meeting" | "check-in" | "deadline";
  title: string;
  description?: string;
  dueDate: string;
  frequency: "once" | "weekly" | "monthly" | "quarterly";
  priority: "high" | "medium" | "low";
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface EcosystemMapState {
  projectId: string | null;
  stakeholders: StakeholderData[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastFetched: number | null;
  // Analytics
  engagementAnalytics: EngagementAnalytics;
  riskAnalytics: RiskAnalytics;
  relationshipAnalytics: RelationshipAnalytics;
  // Ecosystem features
  timeline: TimelineEventData[];
  notes: SharedNoteData[];
  tasks: TaskData[];
  loadingTimeline: boolean;
  loadingNotes: boolean;
  loadingTasks: boolean;
}

const initialState: EcosystemMapState = {
  projectId: null,
  stakeholders: [],
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
  engagementAnalytics: {
    active: 0,
    moderate: 0,
    minimal: 0,
    none: 0,
  },
  riskAnalytics: {
    high: 0,
    medium: 0,
    low: 0,
  },
  relationshipAnalytics: {
    averageStrength: 0,
    strongRelationships: 0,
    needAttention: 0,
  },
  timeline: [],
  notes: [],
  tasks: [],
  loadingTimeline: false,
  loadingNotes: false,
  loadingTasks: false,
};

// Helper: Convert snake_case to camelCase
const snakeToCamel = (stakeholder: Stakeholder): StakeholderData => ({
  id: stakeholder.id,
  name: stakeholder.name,
  type: stakeholder.type || "",
  influence: stakeholder.influence || "Medium",
  interest: stakeholder.interest || "Medium",
  relationship: stakeholder.relationship || "Neutral",
  relationshipStrength: stakeholder.relationship_strength || 5,
  engagementLevel: stakeholder.engagement_level || "None",
  lastContact:
    stakeholder.last_contact || new Date().toISOString().split("T")[0],
  nextAction: stakeholder.next_action || "",
  riskLevel: stakeholder.risk_level || "Medium",
  description: stakeholder.description || "",
  contactInfo: stakeholder.contact_info,
});

// Helper: Convert camelCase to snake_case
const camelToSnake = (
  data: Partial<StakeholderData>
): Partial<Stakeholder> => ({
  name: data.name,
  type: data.type,
  influence: data.influence,
  interest: data.interest,
  relationship: data.relationship,
  relationship_strength: data.relationshipStrength,
  engagement_level: data.engagementLevel,
  last_contact: data.lastContact,
  next_action: data.nextAction,
  risk_level: data.riskLevel,
  description: data.description,
  contact_info: data.contactInfo,
});

// Helper: Calculate all analytics
const calculateAnalytics = (stakeholders: StakeholderData[]) => {
  const engagement: EngagementAnalytics = {
    active: 0,
    moderate: 0,
    minimal: 0,
    none: 0,
  };

  const risk: RiskAnalytics = {
    high: 0,
    medium: 0,
    low: 0,
  };

  let totalStrength = 0;
  let strongCount = 0;
  let needAttentionCount = 0;

  stakeholders.forEach((stakeholder) => {
    // Engagement counts
    if (stakeholder.engagementLevel === "Active") engagement.active++;
    else if (stakeholder.engagementLevel === "Moderate") engagement.moderate++;
    else if (stakeholder.engagementLevel === "Minimal") engagement.minimal++;
    else if (stakeholder.engagementLevel === "None") engagement.none++;

    // Risk counts
    if (stakeholder.riskLevel === "High") risk.high++;
    else if (stakeholder.riskLevel === "Medium") risk.medium++;
    else if (stakeholder.riskLevel === "Low") risk.low++;

    // Relationship analytics
    totalStrength += stakeholder.relationshipStrength;
    if (stakeholder.relationshipStrength >= 8) strongCount++;
    if (stakeholder.relationshipStrength <= 4) needAttentionCount++;
  });

  const relationship: RelationshipAnalytics = {
    averageStrength:
      stakeholders.length > 0 ? totalStrength / stakeholders.length : 0,
    strongRelationships: strongCount,
    needAttention: needAttentionCount,
  };

  return { engagement, risk, relationship };
};

// Async thunk to fetch stakeholders
export const fetchStakeholders = createAsyncThunk(
  "ecosystemMap/fetchStakeholders",
  async (
    { projectId, force = false }: { projectId: string; force?: boolean },
    { getState }
  ) => {
    const state = getState() as RootState;
    const { lastFetched } = state.ecosystemMap;

    // Skip fetch if data was fetched recently (within 30 seconds) and not forced
    if (!force && lastFetched && Date.now() - lastFetched < 30000) {
      return null;
    }

    const stakeholders = await stakeholdersApi.getAllByProjectId(projectId);
    return stakeholders;
  }
);

// Async thunk to add stakeholder
export const addStakeholder = createAsyncThunk(
  "ecosystemMap/addStakeholder",
  async (stakeholderData: Omit<StakeholderData, "id">, { getState }) => {
    const state = getState() as RootState;
    const { projectId } = state.ecosystemMap;

    if (!projectId) {
      throw new Error("No project selected");
    }

    const snakeCaseData = camelToSnake(stakeholderData);
    const newStakeholder = await stakeholdersApi.create({
      project_id: projectId,
      name: stakeholderData.name,
      ...snakeCaseData,
    } as Omit<Stakeholder, "id" | "created_at" | "updated_at">);
    return newStakeholder;
  }
);

// Async thunk to update stakeholder
export const updateStakeholder = createAsyncThunk(
  "ecosystemMap/updateStakeholder",
  async ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<StakeholderData>;
  }) => {
    const snakeCaseData = camelToSnake(updates);
    const updatedStakeholder = await stakeholdersApi.update(id, snakeCaseData);
    return updatedStakeholder;
  }
);

// Async thunk to delete stakeholder
export const deleteStakeholder = createAsyncThunk(
  "ecosystemMap/deleteStakeholder",
  async (id: string) => {
    await stakeholdersApi.delete(id);
    return id;
  }
);

// Helper functions for Timeline
const timelineSnakeToCamel = (
  item: EcosystemMapTimeline
): TimelineEventData => ({
  id: item.id,
  projectId: item.project_id,
  stakeholderId: item.stakeholder_id,
  date: item.date,
  type: item.type || "Meeting",
  description: item.description,
  outcome: item.outcome || "Neutral",
  relationshipChange: item.relationship_change || 0,
  createdBy: item.created_by,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const timelineCamelToSnake = (
  data: Partial<TimelineEventData>
): Partial<EcosystemMapTimeline> => ({
  stakeholder_id: data.stakeholderId,
  date: data.date,
  type: data.type,
  description: data.description,
  outcome: data.outcome,
  relationship_change: data.relationshipChange,
});

// Timeline thunks
export const fetchTimeline = createAsyncThunk(
  "ecosystemMap/fetchTimeline",
  async (projectId: string) => {
    const timeline = await ecosystemTimelineApi.getAllByProjectId(projectId);
    return timeline;
  }
);

export const addTimelineEvent = createAsyncThunk(
  "ecosystemMap/addTimelineEvent",
  async (
    eventData: Omit<TimelineEventData, "id" | "createdAt" | "updatedAt">,
    { getState }
  ) => {
    const state = getState() as RootState;
    const { projectId } = state.ecosystemMap;
    if (!projectId) throw new Error("No project selected");

    const snakeData = timelineCamelToSnake(eventData);
    const newEvent = await ecosystemTimelineApi.create({
      project_id: projectId,
      stakeholder_id: eventData.stakeholderId,
      date: eventData.date,
      description: eventData.description,
      ...snakeData,
    } as Omit<EcosystemMapTimeline, "id" | "created_at" | "updated_at">);
    return newEvent;
  }
);

// Helper functions for Notes
const noteSnakeToCamel = (item: EcosystemMapSharedNote): SharedNoteData => ({
  id: item.id,
  projectId: item.project_id,
  stakeholderId: item.stakeholder_id,
  content: item.content,
  isShared: item.is_shared,
  createdBy: item.created_by,
  createdByName: item.created_by_name,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// Notes thunks
export const fetchNotes = createAsyncThunk(
  "ecosystemMap/fetchNotes",
  async (projectId: string) => {
    const notes = await ecosystemNotesApi.getAllByProjectId(projectId);
    return notes;
  }
);

export const addNote = createAsyncThunk(
  "ecosystemMap/addNote",
  async (
    noteData: {
      stakeholderId: string;
      content: string;
      isShared: boolean;
      createdByName?: string;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const { projectId } = state.ecosystemMap;
    if (!projectId) throw new Error("No project selected");

    const newNote = await ecosystemNotesApi.create({
      project_id: projectId,
      stakeholder_id: noteData.stakeholderId,
      content: noteData.content,
      is_shared: noteData.isShared,
      created_by_name: noteData.createdByName,
    });
    return newNote;
  }
);

// Helper functions for Tasks
const taskSnakeToCamel = (item: EcosystemMapTask): TaskData => ({
  id: item.id,
  projectId: item.project_id,
  stakeholderId: item.stakeholder_id,
  type: item.type || "follow-up",
  title: item.title,
  description: item.description,
  dueDate: item.due_date,
  frequency: item.frequency || "once",
  priority: item.priority || "medium",
  isActive: item.is_active,
  isCompleted: item.is_completed,
  completedAt: item.completed_at,
  assignedTo: item.assigned_to,
  createdBy: item.created_by,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// Tasks thunks
export const fetchTasks = createAsyncThunk(
  "ecosystemMap/fetchTasks",
  async (projectId: string) => {
    const tasks = await ecosystemTasksApi.getAllByProjectId(projectId);
    return tasks;
  }
);

export const addTask = createAsyncThunk(
  "ecosystemMap/addTask",
  async (
    taskData: Omit<
      TaskData,
      "id" | "projectId" | "isActive" | "isCompleted" | "createdAt" | "updatedAt"
    >,
    { getState }
  ) => {
    const state = getState() as RootState;
    const { projectId } = state.ecosystemMap;
    if (!projectId) throw new Error("No project selected");

    const newTask = await ecosystemTasksApi.create({
      project_id: projectId,
      stakeholder_id: taskData.stakeholderId,
      type: taskData.type,
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.dueDate,
      frequency: taskData.frequency,
      priority: taskData.priority,
      is_active: true,
      is_completed: false,
    });
    return newTask;
  }
);

export const completeTask = createAsyncThunk(
  "ecosystemMap/completeTask",
  async (taskId: string) => {
    const completed = await ecosystemTasksApi.complete(taskId);
    return completed;
  }
);

export const deleteTask = createAsyncThunk(
  "ecosystemMap/deleteTask",
  async (taskId: string) => {
    await ecosystemTasksApi.delete(taskId);
    return taskId;
  }
);

const ecosystemMapSlice = createSlice({
  name: "ecosystemMap",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    resetEcosystemMap: (state) => {
      state.stakeholders = [];
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.lastFetched = null;
      state.engagementAnalytics = initialState.engagementAnalytics;
      state.riskAnalytics = initialState.riskAnalytics;
      state.relationshipAnalytics = initialState.relationshipAnalytics;
      state.timeline = [];
      state.notes = [];
      state.tasks = [];
      state.loadingTimeline = false;
      state.loadingNotes = false;
      state.loadingTasks = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stakeholders
      .addCase(fetchStakeholders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.stakeholders = action.payload.map(snakeToCamel);
          state.lastFetched = Date.now();

          // Recalculate analytics
          const analytics = calculateAnalytics(state.stakeholders);
          state.engagementAnalytics = analytics.engagement;
          state.riskAnalytics = analytics.risk;
          state.relationshipAnalytics = analytics.relationship;
        }
      })
      .addCase(fetchStakeholders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stakeholders";
      })
      // Add stakeholder
      .addCase(addStakeholder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addStakeholder.fulfilled, (state, action) => {
        state.saving = false;
        state.stakeholders.unshift(snakeToCamel(action.payload));

        // Recalculate analytics
        const analytics = calculateAnalytics(state.stakeholders);
        state.engagementAnalytics = analytics.engagement;
        state.riskAnalytics = analytics.risk;
        state.relationshipAnalytics = analytics.relationship;
      })
      .addCase(addStakeholder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to add stakeholder";
      })
      // Update stakeholder
      .addCase(updateStakeholder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateStakeholder.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.stakeholders.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.stakeholders[index] = snakeToCamel(action.payload);

          // Recalculate analytics
          const analytics = calculateAnalytics(state.stakeholders);
          state.engagementAnalytics = analytics.engagement;
          state.riskAnalytics = analytics.risk;
          state.relationshipAnalytics = analytics.relationship;
        }
      })
      .addCase(updateStakeholder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update stakeholder";
      })
      // Delete stakeholder
      .addCase(deleteStakeholder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteStakeholder.fulfilled, (state, action) => {
        state.saving = false;
        state.stakeholders = state.stakeholders.filter(
          (s) => s.id !== action.payload
        );

        // Recalculate analytics
        const analytics = calculateAnalytics(state.stakeholders);
        state.engagementAnalytics = analytics.engagement;
        state.riskAnalytics = analytics.risk;
        state.relationshipAnalytics = analytics.relationship;
      })
      .addCase(deleteStakeholder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to delete stakeholder";
      })
      // Fetch timeline
      .addCase(fetchTimeline.pending, (state) => {
        state.loadingTimeline = true;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.loadingTimeline = false;
        state.timeline = action.payload.map(timelineSnakeToCamel);
      })
      .addCase(fetchTimeline.rejected, (state) => {
        state.loadingTimeline = false;
      })
      // Add timeline event
      .addCase(addTimelineEvent.fulfilled, (state, action) => {
        state.timeline.unshift(timelineSnakeToCamel(action.payload));
      })
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loadingNotes = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loadingNotes = false;
        state.notes = action.payload.map(noteSnakeToCamel);
      })
      .addCase(fetchNotes.rejected, (state) => {
        state.loadingNotes = false;
      })
      // Add note
      .addCase(addNote.fulfilled, (state, action) => {
        state.notes.unshift(noteSnakeToCamel(action.payload));
      })
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loadingTasks = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loadingTasks = false;
        state.tasks = action.payload.map(taskSnakeToCamel);
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loadingTasks = false;
      })
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(taskSnakeToCamel(action.payload));
      })
      // Complete task
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = taskSnakeToCamel(action.payload);
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setProjectId, resetEcosystemMap, clearError } =
  ecosystemMapSlice.actions;

// Selectors
export const selectStakeholders = (state: RootState) =>
  state.ecosystemMap.stakeholders;
export const selectIsLoading = (state: RootState) => state.ecosystemMap.loading;
export const selectIsSaving = (state: RootState) => state.ecosystemMap.saving;
export const selectError = (state: RootState) => state.ecosystemMap.error;
export const selectEngagementAnalytics = (state: RootState) =>
  state.ecosystemMap.engagementAnalytics;
export const selectRiskAnalytics = (state: RootState) =>
  state.ecosystemMap.riskAnalytics;
export const selectRelationshipAnalytics = (state: RootState) =>
  state.ecosystemMap.relationshipAnalytics;
export const selectStakeholderCount = (state: RootState) =>
  state.ecosystemMap.stakeholders.length;
export const selectTimeline = (state: RootState) => state.ecosystemMap.timeline;
export const selectNotes = (state: RootState) => state.ecosystemMap.notes;
export const selectTasks = (state: RootState) => state.ecosystemMap.tasks;
export const selectLoadingTimeline = (state: RootState) =>
  state.ecosystemMap.loadingTimeline;
export const selectLoadingNotes = (state: RootState) =>
  state.ecosystemMap.loadingNotes;
export const selectLoadingTasks = (state: RootState) =>
  state.ecosystemMap.loadingTasks;

export default ecosystemMapSlice.reducer;
