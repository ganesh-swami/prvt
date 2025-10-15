import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  metrics: UnitEconomicsMetrics;
  results: UnitEconomicsResults;
  showAnalysis: boolean;
}

const initialState: UnitEconomicsState = {
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
};

const unitEconomicsSlice = createSlice({
  name: "unitEconomics",
  initialState,
  reducers: {
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
      state.metrics = initialState.metrics;
      state.results = initialState.results;
      state.showAnalysis = initialState.showAnalysis;
    },
  },
});

export const {
  setMetrics,
  setResults,
  setShowAnalysis,
  resetUnitEconomics,
} = unitEconomicsSlice.actions;

// Selectors
export const selectMetrics = (state: RootState) =>
  state.unitEconomics.metrics;
export const selectResults = (state: RootState) =>
  state.unitEconomics.results;
export const selectShowAnalysis = (state: RootState) =>
  state.unitEconomics.showAnalysis;

export default unitEconomicsSlice.reducer;
