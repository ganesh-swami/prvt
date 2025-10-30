import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { unitEconomicsApi } from "@/lib/api";
import type { RootState } from "../index";

export interface UnitEconomicsMetrics {
  cac: string;
  arpu: string;
  averageOrderValue: string;
  numberOfCustomers: string;
  retentionRate: string;
  transactionSize: string;
  discountRate: string;
  grossMargin: string;
  churnRate: string;
  operatingExpenses: string;
}

export interface UnitEconomicsResults {
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackPeriod: number;
  arr: number;
  grossProfit: number;
  totalRevenue: number;
  retentionRate: number;
  grossMarginPerLifespan: number;
  unitProfitability: number;
}

interface UnitEconomicsState {
  projectId: string | null;
  economicsId: string | null;
  name: string;
  metrics: UnitEconomicsMetrics;
  results: UnitEconomicsResults;
  showAnalysis: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialState: UnitEconomicsState = {
  projectId: null,
  economicsId: null,
  name: "",
  metrics: {
    cac: "",
    arpu: "",
    averageOrderValue: "",
    numberOfCustomers: "",
    retentionRate: "",
    transactionSize: "",
    discountRate: "",
    grossMargin: "",
    churnRate: "",
    operatingExpenses: "",
  },
  results: {
    ltv: 0,
    cac: 0,
    ltvCacRatio: 0,
    paybackPeriod: 0,
    arr: 0,
    grossProfit: 0,
    totalRevenue: 0,
    retentionRate: 0,
    grossMarginPerLifespan: 0,
    unitProfitability: 0,
  },
  showAnalysis: false,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Async thunks
export const saveUnitEconomics = createAsyncThunk(
  "unitEconomics/save",
  async (
    {
      projectId,
      economicsId,
      name,
      metrics,
      results,
    }: {
      projectId: string;
      economicsId?: string | null;
      name: string;
      metrics: UnitEconomicsMetrics;
      results: UnitEconomicsResults;
    },
    { rejectWithValue }
  ) => {
    try {
      if (economicsId) {
        const updated = await unitEconomicsApi.update(economicsId, {
          name,
          metrics,
          results,
        });
        return updated;
      } else {
        const created = await unitEconomicsApi.create({
          project_id: projectId,
          name,
          metrics,
          results,
        });
        return created;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save unit economics";
      return rejectWithValue(message);
    }
  }
);

export const loadLatestUnitEconomics = createAsyncThunk(
  "unitEconomics/loadLatest",
  async (projectId: string) => {
    const economics = await unitEconomicsApi.getByProjectId(projectId);
    if (economics.length === 0) {
      return null;
    }
    return economics[0];
  }
);

export const fetchUnitEconomics = createAsyncThunk(
  "unitEconomics/fetch",
  async (projectId: string) => {
    const economics = await unitEconomicsApi.getByProjectId(projectId);
    return economics;
  }
);

const unitEconomicsSlice = createSlice({
  name: "unitEconomics",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setMetrics: (
      state,
      action: PayloadAction<Partial<UnitEconomicsMetrics>>
    ) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setResults: (state, action: PayloadAction<UnitEconomicsResults>) => {
      state.results = action.payload;
      state.showAnalysis = true;
    },
    setShowAnalysis: (state, action: PayloadAction<boolean>) => {
      state.showAnalysis = action.payload;
    },
    resetUnitEconomics: (state) => {
      state.economicsId = null;
      state.name = "";
      state.metrics = initialState.metrics;
      state.results = initialState.results;
      state.showAnalysis = initialState.showAnalysis;
      state.error = null;
      state.lastSaved = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save unit economics
      .addCase(saveUnitEconomics.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveUnitEconomics.fulfilled, (state, action) => {
        state.saving = false;
        state.economicsId = action.payload.id;
        state.name = action.payload.name;
        state.lastSaved = action.payload.updated_at;
      })
      .addCase(saveUnitEconomics.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Load latest unit economics
      .addCase(loadLatestUnitEconomics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLatestUnitEconomics.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.economicsId = action.payload.id;
          state.name = action.payload.name;
          state.metrics = action.payload.metrics as UnitEconomicsMetrics;
          state.results = action.payload.results as UnitEconomicsResults;
          state.lastSaved = action.payload.updated_at;
          state.showAnalysis = true;
        }
      })
      .addCase(loadLatestUnitEconomics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load unit economics";
      })
      // Fetch unit economics
      .addCase(fetchUnitEconomics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnitEconomics.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchUnitEconomics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch unit economics";
      });
  },
});

export const {
  setProjectId,
  setName,
  setMetrics,
  setResults,
  setShowAnalysis,
  resetUnitEconomics,
  clearError,
} = unitEconomicsSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) =>
  state.unitEconomics.projectId;
export const selectEconomicsId = (state: RootState) =>
  state.unitEconomics.economicsId;
export const selectName = (state: RootState) => state.unitEconomics.name;
export const selectMetrics = (state: RootState) =>
  state.unitEconomics.metrics;
export const selectResults = (state: RootState) =>
  state.unitEconomics.results;
export const selectShowAnalysis = (state: RootState) =>
  state.unitEconomics.showAnalysis;
export const selectLoading = (state: RootState) => state.unitEconomics.loading;
export const selectSaving = (state: RootState) => state.unitEconomics.saving;
export const selectError = (state: RootState) => state.unitEconomics.error;
export const selectLastSaved = (state: RootState) =>
  state.unitEconomics.lastSaved;

export default unitEconomicsSlice.reducer;
