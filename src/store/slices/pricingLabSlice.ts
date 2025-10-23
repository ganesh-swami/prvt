import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { pricingLabApi } from "@/lib/api";
import type { RootState } from "../index";

export interface PricingData {
  costBasis: string;
  targetMargin: string;
  competitorPrice: string;
  valueDelivered: string;
  priceElasticity: number[];
}

export interface PricingResults {
  costPlusPrice: number;
  competitivePrice: number;
  valueBasedPrice: number;
  recommendedPrice: number;
  demandForecast: number;
}

interface PricingLabState {
  projectId: string | null;
  pricingId: string | null;
  name: string;
  pricingData: PricingData;
  strategy: string;
  results: PricingResults;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialState: PricingLabState = {
  projectId: null,
  pricingId: null,
  name: "",
  pricingData: {
    costBasis: "",
    targetMargin: "",
    competitorPrice: "",
    valueDelivered: "",
    priceElasticity: [50],
  },
  strategy: "value-based",
  results: {
    costPlusPrice: 0,
    competitivePrice: 0,
    valueBasedPrice: 0,
    recommendedPrice: 0,
    demandForecast: 0,
  },
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Async thunks
export const savePricingLab = createAsyncThunk(
  "pricingLab/save",
  async (
    {
      projectId,
      pricingId,
      name,
      pricingData,
      strategy,
      results,
    }: {
      projectId: string;
      pricingId?: string | null;
      name: string;
      pricingData: PricingData;
      strategy: string;
      results: PricingResults;
    },
    { rejectWithValue }
  ) => {
    try {
      if (pricingId) {
        const updated = await pricingLabApi.update(pricingId, {
          name,
          pricing_data: pricingData,
          strategy,
          results,
        });
        return updated;
      } else {
        const created = await pricingLabApi.create({
          project_id: projectId,
          name,
          pricing_data: pricingData,
          strategy,
          results,
        });
        return created;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save pricing lab";
      return rejectWithValue(message);
    }
  }
);

export const loadLatestPricingLab = createAsyncThunk(
  "pricingLab/loadLatest",
  async (projectId: string) => {
    const pricingLabs = await pricingLabApi.getByProjectId(projectId);
    if (pricingLabs.length === 0) {
      return null;
    }
    return pricingLabs[0];
  }
);

export const fetchPricingLabs = createAsyncThunk(
  "pricingLab/fetch",
  async (projectId: string) => {
    const pricingLabs = await pricingLabApi.getByProjectId(projectId);
    return pricingLabs;
  }
);

const pricingLabSlice = createSlice({
  name: "pricingLab",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setPricingData: (state, action: PayloadAction<Partial<PricingData>>) => {
      state.pricingData = { ...state.pricingData, ...action.payload };
    },
    setStrategy: (state, action: PayloadAction<string>) => {
      state.strategy = action.payload;
    },
    setResults: (state, action: PayloadAction<PricingResults>) => {
      state.results = action.payload;
    },
    resetPricingLab: (state) => {
      state.pricingId = null;
      state.name = "";
      state.pricingData = initialState.pricingData;
      state.strategy = initialState.strategy;
      state.results = initialState.results;
      state.error = null;
      state.lastSaved = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save pricing lab
      .addCase(savePricingLab.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(savePricingLab.fulfilled, (state, action) => {
        state.saving = false;
        state.pricingId = action.payload.id;
        state.name = action.payload.name;
        state.lastSaved = action.payload.updated_at;
      })
      .addCase(savePricingLab.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Load latest pricing lab
      .addCase(loadLatestPricingLab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLatestPricingLab.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.pricingId = action.payload.id;
          state.name = action.payload.name;
          state.pricingData = action.payload.pricing_data as PricingData;
          state.strategy = action.payload.strategy;
          state.results = action.payload.results as PricingResults;
          state.lastSaved = action.payload.updated_at;
        }
      })
      .addCase(loadLatestPricingLab.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load pricing lab";
      })
      // Fetch pricing labs
      .addCase(fetchPricingLabs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPricingLabs.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchPricingLabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch pricing labs";
      });
  },
});

export const {
  setProjectId,
  setName,
  setPricingData,
  setStrategy,
  setResults,
  resetPricingLab,
  clearError,
} = pricingLabSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) =>
  state.pricingLab.projectId;
export const selectPricingId = (state: RootState) =>
  state.pricingLab.pricingId;
export const selectName = (state: RootState) => state.pricingLab.name;
export const selectPricingData = (state: RootState) =>
  state.pricingLab.pricingData;
export const selectStrategy = (state: RootState) => state.pricingLab.strategy;
export const selectPricingResults = (state: RootState) =>
  state.pricingLab.results;
export const selectLoading = (state: RootState) => state.pricingLab.loading;
export const selectSaving = (state: RootState) => state.pricingLab.saving;
export const selectError = (state: RootState) => state.pricingLab.error;
export const selectLastSaved = (state: RootState) =>
  state.pricingLab.lastSaved;

export default pricingLabSlice.reducer;
