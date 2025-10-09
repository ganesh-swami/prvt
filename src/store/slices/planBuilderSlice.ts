import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { businessPlanApi } from "@/lib/api";
import type { RootState } from "../index";

// Types
export interface PlanSection {
  id: string;
  title: string;
  completed: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea";
    placeholder: string;
    tooltip: {
      title: string;
      description: string;
      explanation?: string;
      justification?: string;
    };
  }>;
}

export interface PlanBuilderState {
  businessPlanId: string | null;
  projectId: string | null;
  activeSection: string;
  planData: Record<string, Record<string, string | boolean>>;
  sections: PlanSection[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastFetched: number | null;
  isDirty: boolean; // Track if there are unsaved changes
}

const initialState: PlanBuilderState = {
  businessPlanId: null,
  projectId: null,
  activeSection: "executive",
  planData: {},
  sections: [],
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
  isDirty: false,
};

// Async Thunks

/**
 * Fetch plan builder data from database
 * Only fetches if not already loaded or if forced
 */
export const fetchPlanBuilder = createAsyncThunk(
  "planBuilder/fetchPlanBuilder",
  async (
    { projectId, force = false }: { projectId: string; force?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const { lastFetched, businessPlanId } = state.planBuilder;

      // If already fetched recently and not forced, return cached data
      if (
        !force &&
        lastFetched &&
        Date.now() - lastFetched < 60000 &&
        businessPlanId
      ) {
        return null; // Will be handled in the reducer
      }

      // Fetch business plan from database
      const businessPlan = await businessPlanApi.getByProjectId(projectId);

      if (businessPlan) {
        return {
          businessPlanId: businessPlan.id,
          projectId,
          planData: businessPlan.plan_builder || {},
        };
      }

      // No business plan exists yet
      return {
        businessPlanId: null,
        projectId,
        planData: {},
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch plan builder";
      console.error("Error fetching plan builder:", error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Save/Update plan builder data to database
 */
export const savePlanBuilder = createAsyncThunk(
  "planBuilder/savePlanBuilder",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { businessPlanId, projectId, planData } = state.planBuilder;

      if (!projectId) {
        throw new Error("No project ID set");
      }

      if (businessPlanId) {
        // Update existing business plan
        const updatedPlan = await businessPlanApi.update(businessPlanId, {
          plan_builder: planData,
          updated_at: new Date().toISOString(),
        });

        return {
          businessPlanId: updatedPlan.id,
          planData: updatedPlan.plan_builder || {},
        };
      } else {
        // Create new business plan
        const newPlan = await businessPlanApi.create({
          project_id: projectId,
          plan_builder: planData,
        });

        return {
          businessPlanId: newPlan.id,
          planData: newPlan.plan_builder || {},
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save plan builder";
      console.error("Error saving plan builder:", error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Mark a section as complete and auto-save
 */
export const markSectionComplete = createAsyncThunk(
  "planBuilder/markSectionComplete",
  async (sectionId: string, { dispatch, getState }) => {
    // First update the local state
    dispatch(setSectionCompleted({ sectionId, completed: true }));

    // Then save to database
    await dispatch(savePlanBuilder());

    return sectionId;
  }
);

// Slice
const planBuilderSlice = createSlice({
  name: "planBuilder",
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },

    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },

    setSections: (state, action: PayloadAction<PlanSection[]>) => {
      // Map over sections and create new objects with updated completed status
      state.sections = action.payload.map((section) => ({
        ...section,
        completed:
          state.planData[section.id]?.completed === true || section.completed,
      }));
    },

    updateFieldValue: (
      state,
      action: PayloadAction<{
        sectionId: string;
        fieldId: string;
        value: string;
      }>
    ) => {
      const { sectionId, fieldId, value } = action.payload;

      if (!state.planData[sectionId]) {
        state.planData[sectionId] = {};
      }

      state.planData[sectionId][fieldId] = value;
      state.isDirty = true;
    },

    setSectionCompleted: (
      state,
      action: PayloadAction<{ sectionId: string; completed: boolean }>
    ) => {
      const { sectionId, completed } = action.payload;

      // Update in planData
      if (!state.planData[sectionId]) {
        state.planData[sectionId] = {};
      }
      state.planData[sectionId].completed = completed;

      // Update in sections array - create new array with updated section
      state.sections = state.sections.map((section) =>
        section.id === sectionId ? { ...section, completed } : section
      );

      state.isDirty = true;
    },

    resetPlanBuilder: (state) => {
      state.businessPlanId = null;
      state.projectId = null;
      state.activeSection = "executive";
      state.planData = {};
      state.sections = [];
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.lastFetched = null;
      state.isDirty = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plan builder
      .addCase(fetchPlanBuilder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanBuilder.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload === null) {
          // Using cached data, no update needed
          return;
        }

        state.businessPlanId = action.payload.businessPlanId;
        state.projectId = action.payload.projectId;
        state.planData = action.payload.planData;
        state.lastFetched = Date.now();
        state.isDirty = false;

        // Update sections completed status - create new array with updated sections
        state.sections = state.sections.map((section) => ({
          ...section,
          completed:
            state.planData[section.id]?.completed === true || section.completed,
        }));
      })
      .addCase(fetchPlanBuilder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save plan builder
      .addCase(savePlanBuilder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(savePlanBuilder.fulfilled, (state, action) => {
        state.saving = false;
        state.businessPlanId = action.payload.businessPlanId;
        state.isDirty = false;
        state.lastFetched = Date.now();
      })
      .addCase(savePlanBuilder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Mark section complete
      .addCase(markSectionComplete.pending, (state) => {
        state.saving = true;
      })
      .addCase(markSectionComplete.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(markSectionComplete.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to mark section complete";
      });
  },
});

// Actions
export const {
  setActiveSection,
  setProjectId,
  setSections,
  updateFieldValue,
  setSectionCompleted,
  resetPlanBuilder,
  clearError,
} = planBuilderSlice.actions;

// Selectors
export const selectPlanBuilder = (state: RootState) => state.planBuilder;
export const selectActiveSection = (state: RootState) =>
  state.planBuilder.activeSection;
export const selectPlanData = (state: RootState) => state.planBuilder.planData;
export const selectSections = (state: RootState) => state.planBuilder.sections;
export const selectActiveSectionData = (state: RootState) => {
  const section = state.planBuilder.sections.find(
    (s) => s.id === state.planBuilder.activeSection
  );
  return section;
};
export const selectProgressPercentage = (state: RootState) => {
  const completedCount = state.planBuilder.sections.filter(
    (s) => s.completed
  ).length;
  const totalCount = state.planBuilder.sections.length;
  return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
};
export const selectIsLoading = (state: RootState) => state.planBuilder.loading;
export const selectIsSaving = (state: RootState) => state.planBuilder.saving;
export const selectError = (state: RootState) => state.planBuilder.error;
export const selectIsDirty = (state: RootState) => state.planBuilder.isDirty;

export default planBuilderSlice.reducer;
