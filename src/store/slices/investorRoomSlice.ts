import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import type { RootState } from "../index";

interface InvestorRoomState {
  projectId: string | null;
  milestones: Milestone[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: InvestorRoomState = {
  projectId: null,
  milestones: [],
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const loadMilestones = createAsyncThunk(
  "investorRoom/loadMilestones",
  async (projectId: string) => {
    const milestones = await milestonesApi.getByProjectId(projectId);
    return { projectId, milestones };
  }
);

export const createMilestone = createAsyncThunk(
  "investorRoom/createMilestone",
  async (milestone: Omit<Milestone, "id" | "created_at" | "updated_at">) => {
    const newMilestone = await milestonesApi.create(milestone);
    return newMilestone;
  }
);

export const updateMilestone = createAsyncThunk(
  "investorRoom/updateMilestone",
  async ({ id, updates }: { id: string; updates: Partial<Milestone> }) => {
    const updatedMilestone = await milestonesApi.update(id, updates);
    return updatedMilestone;
  }
);

export const deleteMilestone = createAsyncThunk(
  "investorRoom/deleteMilestone",
  async (id: string) => {
    await milestonesApi.delete(id);
    return id;
  }
);

const investorRoomSlice = createSlice({
  name: "investorRoom",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    resetInvestorRoom: (state) => {
      state.projectId = null;
      state.milestones = [];
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load milestones
    builder
      .addCase(loadMilestones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMilestones.fulfilled, (state, action) => {
        state.loading = false;
        state.projectId = action.payload.projectId;
        state.milestones = action.payload.milestones;
      })
      .addCase(loadMilestones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load milestones";
      });

    // Create milestone
    builder
      .addCase(createMilestone.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.saving = false;
        state.milestones.push(action.payload);
        // Sort by target_date
        state.milestones.sort((a, b) => 
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      })
      .addCase(createMilestone.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to create milestone";
      });

    // Update milestone
    builder
      .addCase(updateMilestone.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.milestones.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.milestones[index] = action.payload;
        }
        // Re-sort after update
        state.milestones.sort((a, b) => 
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update milestone";
      });

    // Delete milestone
    builder
      .addCase(deleteMilestone.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.saving = false;
        state.milestones = state.milestones.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to delete milestone";
      });
  },
});

export const { setProjectId, resetInvestorRoom } = investorRoomSlice.actions;

// Selectors
export const selectInvestorRoom = (state: RootState) => state.investorRoom;
export const selectMilestones = (state: RootState) => state.investorRoom.milestones;
export const selectMilestonesLoading = (state: RootState) => state.investorRoom.loading;
export const selectMilestonesSaving = (state: RootState) => state.investorRoom.saving;

export default investorRoomSlice.reducer;
