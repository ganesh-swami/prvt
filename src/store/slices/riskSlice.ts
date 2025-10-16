import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { risksApi } from "@/lib/api";
import type { RootState } from "../index";

export interface Risk {
  id: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  owner: string;
  mitigationStrategy: string;
  status: 'Active' | 'Resolved' | 'Mitigated' | 'Monitoring';
}

interface RiskState {
  projectId: string | null;
  risks: Risk[];
  newRisk: Partial<Risk>;
  showAddForm: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialNewRisk: Partial<Risk> = {
  description: '',
  category: '',
  likelihood: 5,
  impact: 5,
  owner: '',
  mitigationStrategy: '',
};

const initialState: RiskState = {
  projectId: null,
  risks: [],
  newRisk: initialNewRisk,
  showAddForm: false,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Map component format to database format
const toDBFormat = (risk: Partial<Risk>, projectId: string) => ({
  project_id: projectId,
  description: risk.description || '',
  category: risk.category || '',
  likelihood: risk.likelihood || 5,
  impact: risk.impact || 5,
  owner: risk.owner || '',
  mitigation_strategy: risk.mitigationStrategy || '',
  status: risk.status || 'Active',
});

// Map database format to component format
const fromDBFormat = (dbRisk: Record<string, any>): Risk => ({
  id: (dbRisk.id as string) || "",
  description: (dbRisk.description as string) || "",
  category: (dbRisk.category as string) || "",
  likelihood: (dbRisk.likelihood as number) || 5,
  impact: (dbRisk.impact as number) || 5,
  owner: (dbRisk.owner as string) || "",
  mitigationStrategy: (dbRisk.mitigation_strategy as string) || "",
  status: (dbRisk.status as 'Active' | 'Resolved' | 'Mitigated' | 'Monitoring') || 'Active',
});

// Async thunks
export const fetchRisks = createAsyncThunk(
  "risks/fetchAll",
  async (projectId: string) => {
    const data = await risksApi.getByProjectId(projectId);
    return data.map(fromDBFormat);
  }
);

export const addRisk = createAsyncThunk(
  "risks/add",
  async (
    { projectId, risk }: { projectId: string; risk: Partial<Risk> },
    { rejectWithValue }
  ) => {
    try {
      const dbData = toDBFormat(risk, projectId);
      const created = await risksApi.create(dbData);
      return fromDBFormat(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add risk";
      return rejectWithValue(message);
    }
  }
);

export const updateRisk = createAsyncThunk(
  "risks/update",
  async (
    {
      id,
      projectId,
      updates,
    }: {
      id: string;
      projectId: string;
      updates: Partial<Risk>;
    },
    { rejectWithValue }
  ) => {
    try {
      const dbData = toDBFormat(updates, projectId);
      const updated = await risksApi.update(id, dbData);
      return fromDBFormat(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update risk";
      return rejectWithValue(message);
    }
  }
);

export const deleteRisk = createAsyncThunk(
  "risks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await risksApi.delete(id);
      return id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete risk";
      return rejectWithValue(message);
    }
  }
);

const riskSlice = createSlice({
  name: "risks",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setNewRisk: (state, action: PayloadAction<Partial<Risk>>) => {
      state.newRisk = { ...state.newRisk, ...action.payload };
    },
    resetNewRisk: (state) => {
      state.newRisk = initialNewRisk;
    },
    setShowAddForm: (state, action: PayloadAction<boolean>) => {
      state.showAddForm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRisks: (state, action: PayloadAction<Risk[]>) => {
      state.risks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch risks
      .addCase(fetchRisks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRisks.fulfilled, (state, action) => {
        state.loading = false;
        state.risks = action.payload;
      })
      .addCase(fetchRisks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch risks";
      })
      // Add risk
      .addCase(addRisk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addRisk.fulfilled, (state, action) => {
        state.saving = false;
        state.risks.unshift(action.payload);
        state.newRisk = initialNewRisk;
        state.showAddForm = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(addRisk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Update risk
      .addCase(updateRisk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateRisk.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.risks.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.risks[index] = action.payload;
        }
        state.lastSaved = new Date().toISOString();
      })
      .addCase(updateRisk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Delete risk
      .addCase(deleteRisk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteRisk.fulfilled, (state, action) => {
        state.saving = false;
        state.risks = state.risks.filter((r) => r.id !== action.payload);
        state.lastSaved = new Date().toISOString();
      })
      .addCase(deleteRisk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProjectId,
  setNewRisk,
  resetNewRisk,
  setShowAddForm,
  clearError,
  setRisks,
} = riskSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) => state.risks.projectId;
export const selectRisks = (state: RootState) => state.risks.risks;
export const selectNewRisk = (state: RootState) => state.risks.newRisk;
export const selectShowAddForm = (state: RootState) => state.risks.showAddForm;
export const selectLoading = (state: RootState) => state.risks.loading;
export const selectSaving = (state: RootState) => state.risks.saving;
export const selectError = (state: RootState) => state.risks.error;
export const selectLastSaved = (state: RootState) => state.risks.lastSaved;

export default riskSlice.reducer;
