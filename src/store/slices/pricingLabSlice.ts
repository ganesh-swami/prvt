import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  pricingData: PricingData;
  strategy: string;
  results: PricingResults;
}

const initialState: PricingLabState = {
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
};

const pricingLabSlice = createSlice({
  name: "pricingLab",
  initialState,
  reducers: {
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
      state.pricingData = initialState.pricingData;
      state.strategy = initialState.strategy;
      state.results = initialState.results;
    },
  },
});

export const {
  setPricingData,
  setStrategy,
  setResults,
  resetPricingLab,
} = pricingLabSlice.actions;

// Selectors
export const selectPricingData = (state: RootState) =>
  state.pricingLab.pricingData;
export const selectStrategy = (state: RootState) => state.pricingLab.strategy;
export const selectPricingResults = (state: RootState) =>
  state.pricingLab.results;

export default pricingLabSlice.reducer;
