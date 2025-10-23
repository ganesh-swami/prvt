import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { marketSizingApi } from "@/lib/api";
import type { RootState } from "../index";

export interface MarketData {
  totalMarket: string;
  targetSegment: string;
  penetrationRate: string;
  avgRevenue: string;
  marketGrowth: string;
  competitorShare: string;
}

export interface MarketResults {
  tam: number;
  sam: number;
  som: number;
  revenueOpportunity: number;
}

interface MarketSizingState {
  projectId: string | null;
  sizingId: string | null;
  name: string;
  marketData: MarketData;
  approach: string;
  valueUnit: "millions" | "billions";
  results: MarketResults;
  showAnalysis: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialState: MarketSizingState = {
  projectId: null,
  sizingId: null,
  name: "",
  marketData: {
    totalMarket: "",
    targetSegment: "",
    penetrationRate: "",
    avgRevenue: "",
    marketGrowth: "",
    competitorShare: "",
  },
  approach: "top-down",
  valueUnit: "billions",
  results: {
    tam: 0,
    sam: 0,
    som: 0,
    revenueOpportunity: 0,
  },
  showAnalysis: false,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Async thunks
export const saveMarketSizing = createAsyncThunk(
  "marketSizing/save",
  async (
    {
      projectId,
      sizingId,
      name,
      marketData,
      approach,
      valueUnit,
      results,
    }: {
      projectId: string;
      sizingId?: string | null;
      name: string;
      marketData: MarketData;
      approach: string;
      valueUnit: string;
      results: MarketResults;
    },
    { rejectWithValue }
  ) => {
    try {
      if (sizingId) {
        // Update existing
        const updated = await marketSizingApi.update(sizingId, {
          name,
          market_data: marketData,
          approach,
          value_unit: valueUnit,
          results,
        });
        return updated;
      } else {
        // Create new
        const created = await marketSizingApi.create({
          project_id: projectId,
          name,
          market_data: marketData,
          approach,
          value_unit: valueUnit,
          results,
        });
        return created;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save market sizing";
      return rejectWithValue(message);
    }
  }
);

export const loadLatestMarketSizing = createAsyncThunk(
  "marketSizing/loadLatest",
  async (projectId: string) => {
    const sizings = await marketSizingApi.getByProjectId(projectId);
    if (sizings.length === 0) {
      return null;
    }
    return sizings[0];
  }
);

export const fetchMarketSizings = createAsyncThunk(
  "marketSizing/fetch",
  async (projectId: string) => {
    const sizings = await marketSizingApi.getByProjectId(projectId);
    return sizings;
  }
);

const marketSizingSlice = createSlice({
  name: "marketSizing",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setMarketData: (state, action: PayloadAction<Partial<MarketData>>) => {
      state.marketData = { ...state.marketData, ...action.payload };
    },
    setApproach: (state, action: PayloadAction<string>) => {
      state.approach = action.payload;
    },
    setValueUnit: (
      state,
      action: PayloadAction<"millions" | "billions">
    ) => {
      state.valueUnit = action.payload;
    },
    setResults: (state, action: PayloadAction<MarketResults>) => {
      state.results = action.payload;
      state.showAnalysis = true;
    },
    setShowAnalysis: (state, action: PayloadAction<boolean>) => {
      state.showAnalysis = action.payload;
    },
    resetMarketSizing: (state) => {
      state.sizingId = null;
      state.name = "";
      state.marketData = initialState.marketData;
      state.approach = initialState.approach;
      state.valueUnit = initialState.valueUnit;
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
      // Save market sizing
      .addCase(saveMarketSizing.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveMarketSizing.fulfilled, (state, action) => {
        state.saving = false;
        state.sizingId = action.payload.id;
        state.name = action.payload.name;
        state.lastSaved = action.payload.updated_at;
      })
      .addCase(saveMarketSizing.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Load latest market sizing
      .addCase(loadLatestMarketSizing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLatestMarketSizing.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sizingId = action.payload.id;
          state.name = action.payload.name;
          state.marketData = action.payload.market_data as MarketData;
          state.approach = action.payload.approach;
          state.valueUnit = action.payload.value_unit as "millions" | "billions";
          state.results = action.payload.results as MarketResults;
          state.lastSaved = action.payload.updated_at;
          state.showAnalysis = true;
        }
      })
      .addCase(loadLatestMarketSizing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load market sizing";
      })
      // Fetch market sizings
      .addCase(fetchMarketSizings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketSizings.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchMarketSizings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch market sizings";
      });
  },
});

export const {
  setProjectId,
  setName,
  setMarketData,
  setApproach,
  setValueUnit,
  setResults,
  setShowAnalysis,
  resetMarketSizing,
  clearError,
} = marketSizingSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) =>
  state.marketSizing.projectId;
export const selectSizingId = (state: RootState) =>
  state.marketSizing.sizingId;
export const selectName = (state: RootState) => state.marketSizing.name;
export const selectMarketData = (state: RootState) =>
  state.marketSizing.marketData;
export const selectApproach = (state: RootState) => state.marketSizing.approach;
export const selectValueUnit = (state: RootState) =>
  state.marketSizing.valueUnit;
export const selectResults = (state: RootState) => state.marketSizing.results;
export const selectShowAnalysis = (state: RootState) =>
  state.marketSizing.showAnalysis;
export const selectLoading = (state: RootState) => state.marketSizing.loading;
export const selectSaving = (state: RootState) => state.marketSizing.saving;
export const selectError = (state: RootState) => state.marketSizing.error;
export const selectLastSaved = (state: RootState) =>
  state.marketSizing.lastSaved;

export default marketSizingSlice.reducer;
