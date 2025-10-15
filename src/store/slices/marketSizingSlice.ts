import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  marketData: MarketData;
  approach: string;
  valueUnit: "millions" | "billions";
  results: MarketResults;
  showAnalysis: boolean;
}

const initialState: MarketSizingState = {
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
};

const marketSizingSlice = createSlice({
  name: "marketSizing",
  initialState,
  reducers: {
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
      state.marketData = initialState.marketData;
      state.approach = initialState.approach;
      state.valueUnit = initialState.valueUnit;
      state.results = initialState.results;
      state.showAnalysis = initialState.showAnalysis;
    },
  },
});

export const {
  setMarketData,
  setApproach,
  setValueUnit,
  setResults,
  setShowAnalysis,
  resetMarketSizing,
} = marketSizingSlice.actions;

// Selectors
export const selectMarketData = (state: RootState) =>
  state.marketSizing.marketData;
export const selectApproach = (state: RootState) => state.marketSizing.approach;
export const selectValueUnit = (state: RootState) =>
  state.marketSizing.valueUnit;
export const selectResults = (state: RootState) => state.marketSizing.results;
export const selectShowAnalysis = (state: RootState) =>
  state.marketSizing.showAnalysis;

export default marketSizingSlice.reducer;
