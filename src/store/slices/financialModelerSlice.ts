import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { financialModelsApi } from "@/lib/api";
import type { RootState } from "../index";

export interface Projections {
  initialRevenue: string;
  growthRate: string;
  cogs: string;
  staffCosts: string;
  marketingCosts: string;
  adminCosts: string;
  investments: string;
  taxRate: string;
  timeHorizon: string;
}

export interface MonthlyProjection {
  month: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  taxes: number;
  netProfit: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  cumulativeProfit: number;
}

export interface Results {
  monthlyProjections: MonthlyProjection[];
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalOperatingExpenses: number;
  operatingExpenses: number;
  ebitda: number;
  totalTaxes: number;
  netProfit: number;
  netMargin: number;
  marginPercent: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  breakEvenMonth: number;
  profitabilityRatio: number;
  revenueGrowthRate: number;
}

interface FinancialModelerState {
  projectId: string | null;
  modelId: string | null;
  modelName: string;
  projections: Projections;
  results: Results;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialProjections: Projections = {
  initialRevenue: "",
  growthRate: "",
  cogs: "",
  staffCosts: "",
  marketingCosts: "",
  adminCosts: "",
  investments: "",
  taxRate: "25",
  timeHorizon: "12",
};

const initialResults: Results = {
  monthlyProjections: [],
  totalRevenue: 0,
  totalCogs: 0,
  grossProfit: 0,
  grossMargin: 0,
  totalOperatingExpenses: 0,
  operatingExpenses: 0,
  ebitda: 0,
  totalTaxes: 0,
  netProfit: 0,
  netMargin: 0,
  marginPercent: 0,
  operatingCashFlow: 0,
  freeCashFlow: 0,
  breakEvenMonth: 0,
  profitabilityRatio: 0,
  revenueGrowthRate: 0,
};

const initialState: FinancialModelerState = {
  projectId: null,
  modelId: null,
  modelName: "",
  projections: initialProjections,
  results: initialResults,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// Async thunks
export const fetchFinancialModels = createAsyncThunk(
  "financialModeler/fetchModels",
  async (projectId: string) => {
    const models = await financialModelsApi.getByProjectId(projectId);
    return models;
  }
);

export const saveFinancialModel = createAsyncThunk(
  "financialModeler/saveModel",
  async (
    {
      projectId,
      modelId,
      name,
      projections,
      results,
    }: {
      projectId: string;
      modelId?: string | null;
      name: string;
      projections: Projections;
      results: Results;
    },
    { rejectWithValue }
  ) => {
    try {
      if (modelId) {
        // Update existing model
        const updated = await financialModelsApi.update(modelId, {
          name,
          projections,
          results,
        });
        return updated;
      } else {
        // Create new model
        const created = await financialModelsApi.create({
          project_id: projectId,
          name,
          projections,
          results,
          scenarios: null,
          assumptions: null,
        });
        return created;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save model";
      return rejectWithValue(message);
    }
  }
);

export const loadFinancialModel = createAsyncThunk(
  "financialModeler/loadModel",
  async (modelId: string) => {
    // Fetch specific model - we'll need to add a getById method to API
    const models = await financialModelsApi.getByProjectId(""); // This is a workaround
    const model = models.find((m) => m.id === modelId);
    if (!model) throw new Error("Model not found");
    return model;
  }
);

export const loadLatestModel = createAsyncThunk(
  "financialModeler/loadLatest",
  async (projectId: string) => {
    const models = await financialModelsApi.getByProjectId(projectId);
    if (models.length === 0) {
      return null; // No models exist yet
    }
    // Return the most recent model (already sorted by created_at desc)
    return models[0];
  }
);

const financialModelerSlice = createSlice({
  name: "financialModeler",
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setModelName: (state, action: PayloadAction<string>) => {
      state.modelName = action.payload;
    },
    setProjections: (state, action: PayloadAction<Partial<Projections>>) => {
      state.projections = { ...state.projections, ...action.payload };
    },
    setResults: (state, action: PayloadAction<Results>) => {
      state.results = action.payload;
    },
    resetModel: (state) => {
      state.modelId = null;
      state.modelName = "";
      state.projections = initialProjections;
      state.results = initialResults;
      state.error = null;
      state.lastSaved = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save model
      .addCase(saveFinancialModel.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveFinancialModel.fulfilled, (state, action) => {
        state.saving = false;
        state.modelId = action.payload.id;
        state.modelName = action.payload.name;
        state.lastSaved = action.payload.updated_at;
      })
      .addCase(saveFinancialModel.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Load model
      .addCase(loadFinancialModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFinancialModel.fulfilled, (state, action) => {
        state.loading = false;
        state.modelId = action.payload.id;
        state.modelName = action.payload.name;
        state.projections = action.payload.projections as Projections;
        state.results = action.payload.results as Results;
        state.lastSaved = action.payload.updated_at;
      })
      .addCase(loadFinancialModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load model";
      })
      // Fetch models (just sets loading state)
      .addCase(fetchFinancialModels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinancialModels.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchFinancialModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch models";
      })
      // Load latest model
      .addCase(loadLatestModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLatestModel.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.modelId = action.payload.id;
          state.modelName = action.payload.name;
          state.projections = action.payload.projections as Projections;
          state.results = action.payload.results as Results;
          state.lastSaved = action.payload.updated_at;
        }
      })
      .addCase(loadLatestModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load latest model";
      });
  },
});

export const {
  setProjectId,
  setModelName,
  setProjections,
  setResults,
  resetModel,
  clearError,
} = financialModelerSlice.actions;

// Selectors
export const selectProjectId = (state: RootState) =>
  state.financialModeler.projectId;
export const selectModelId = (state: RootState) =>
  state.financialModeler.modelId;
export const selectModelName = (state: RootState) =>
  state.financialModeler.modelName;
export const selectProjections = (state: RootState) =>
  state.financialModeler.projections;
export const selectResults = (state: RootState) =>
  state.financialModeler.results;
export const selectLoading = (state: RootState) =>
  state.financialModeler.loading;
export const selectSaving = (state: RootState) =>
  state.financialModeler.saving;
export const selectError = (state: RootState) => state.financialModeler.error;
export const selectLastSaved = (state: RootState) =>
  state.financialModeler.lastSaved;

export default financialModelerSlice.reducer;
