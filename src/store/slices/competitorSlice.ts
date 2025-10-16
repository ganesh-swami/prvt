import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { competitorsApi } from "@/lib/api";
import type { RootState } from "../index";

export interface Competitor {
  id: string;
  name: string;
  website: string;
  pricing: number;
  features: string[];
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  description: string;
}

interface CompetitorState {
  projectId: string | null;
  competitors: Competitor[];
  newCompetitor: Partial<Competitor>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialNewCompetitor: Partial<Competitor> = {
  name: '',
  website: '',
  pricing: 0,
  features: [],
  marketShare: 0,
  strengths: [],
  weaknesses: [],
  description: ''
};

const initialState: CompetitorState = {
  projectId: null,
  competitors: [],
  newCompetitor: initialNewCompetitor,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Map component format to database format
const toDBFormat = (competitor: Partial<Competitor>, projectId: string) => ({
  project_id: projectId,
  name: competitor.name,
  website: competitor.website,
  pricing_model: competitor.pricing?.toString() || "0",
  strengths: competitor.strengths || [],
  weaknesses: competitor.weaknesses || [],
  market_share: competitor.marketShare || 0,
  revenue_estimate: competitor.description || "",
});

// Map database format to component format
const fromDBFormat = (dbCompetitor: Record<string, any>): Competitor => ({
  id: (dbCompetitor.id as string) || "",
  name: (dbCompetitor.name as string) || "",
  website: (dbCompetitor.website as string) || "",
  pricing: parseFloat((dbCompetitor.pricing_model as string) || "0"),
  features: [], // Not stored in DB, could be derived from other data
  marketShare: (dbCompetitor.market_share as number) || 0,
  strengths: (dbCompetitor.strengths as string[]) || [],
  weaknesses: (dbCompetitor.weaknesses as string[]) || [],
  description: (dbCompetitor.revenue_estimate as string) || "",
});

// Async thunks
export const fetchCompetitors = createAsyncThunk(
  "competitors/fetchAll",
  async (projectId: string) => {
    const data = await competitorsApi.getByProjectId(projectId);
    return data.map(fromDBFormat);
  }
);

export const addCompetitor = createAsyncThunk(
  "competitors/add",
  async (
    { projectId, competitor }: { projectId: string; competitor: Partial<Competitor> },
    { rejectWithValue }
  ) => {
    try {
      const dbData = toDBFormat(competitor, projectId);
      const created = await competitorsApi.create(dbData);
      return fromDBFormat(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add competitor";
      return rejectWithValue(message);
    }
  }
);

export const updateCompetitor = createAsyncThunk(
  "competitors/update",
  async (
    {
      id,
      projectId,
      updates,
    }: {
      id: string;
      projectId: string;
      updates: Partial<Competitor>;
    },
    { rejectWithValue }
  ) => {
    try {
      const dbData = toDBFormat(updates, projectId);
      const updated = await competitorsApi.update(id, dbData);
      return fromDBFormat(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update competitor";
      return rejectWithValue(message);
    }
  }
);

export const deleteCompetitor = createAsyncThunk(
  "competitors/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await competitorsApi.delete(id);
      return id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete competitor";
      return rejectWithValue(message);
    }
  }
);

const competitorSlice = createSlice({
  name: "competitors",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setNewCompetitor: (state, action: PayloadAction<Partial<Competitor>>) => {
      state.newCompetitor = { ...state.newCompetitor, ...action.payload };
    },
    resetNewCompetitor: (state) => {
      state.newCompetitor = initialNewCompetitor;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCompetitors: (state, action: PayloadAction<Competitor[]>) => {
      state.competitors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch competitors
      .addCase(fetchCompetitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetitors.fulfilled, (state, action) => {
        state.loading = false;
        state.competitors = action.payload;
      })
      .addCase(fetchCompetitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch competitors";
      })
      // Add competitor
      .addCase(addCompetitor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addCompetitor.fulfilled, (state, action) => {
        state.saving = false;
        state.competitors.push(action.payload);
        state.newCompetitor = initialNewCompetitor;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(addCompetitor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Update competitor
      .addCase(updateCompetitor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCompetitor.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.competitors.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.competitors[index] = action.payload;
        }
        state.lastSaved = new Date().toISOString();
      })
      .addCase(updateCompetitor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Delete competitor
      .addCase(deleteCompetitor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteCompetitor.fulfilled, (state, action) => {
        state.saving = false;
        state.competitors = state.competitors.filter((c) => c.id !== action.payload);
        state.lastSaved = new Date().toISOString();
      })
      .addCase(deleteCompetitor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProjectId,
  setNewCompetitor,
  resetNewCompetitor,
  clearError,
  setCompetitors,
} = competitorSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) => state.competitors.projectId;
export const selectCompetitors = (state: RootState) => state.competitors.competitors;
export const selectNewCompetitor = (state: RootState) => state.competitors.newCompetitor;
export const selectLoading = (state: RootState) => state.competitors.loading;
export const selectSaving = (state: RootState) => state.competitors.saving;
export const selectError = (state: RootState) => state.competitors.error;
export const selectLastSaved = (state: RootState) => state.competitors.lastSaved;

export default competitorSlice.reducer;
