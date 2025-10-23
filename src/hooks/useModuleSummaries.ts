import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectResults as selectMarketSizingResults,
  selectLastSaved as selectMarketSizingLastSaved,
  selectProjectId as selectMarketSizingProjectId,
  loadLatestMarketSizing,
} from "@/store/slices/marketSizingSlice";
import {
  selectPricingData,
  selectPricingResults,
  selectStrategy,
  selectLastSaved as selectPricingLastSaved,
  selectProjectId as selectPricingProjectId,
  loadLatestPricingLab,
} from "@/store/slices/pricingLabSlice";
import {
  selectMetrics,
  selectResults as selectUnitEconomicsResults,
  selectLastSaved as selectUnitEconomicsLastSaved,
  selectProjectId as selectUnitEconomicsProjectId,
  loadLatestUnitEconomics,
} from "@/store/slices/unitEconomicsSlice";
import {
  selectResults as selectFinancialResults,
  selectLastSaved as selectFinancialLastSaved,
  selectProjectId as selectFinancialProjectId,
  loadLatestModel,
} from "@/store/slices/financialModelerSlice";

export interface ModuleSummary {
  id: string;
  name: string;
  lastUpdated: string;
  keyMetrics: Record<string, any>;
  status: "active" | "draft" | "completed";
  data?: any;
}

export const useModuleSummaries = (
  projectId: string = "666c94d4-4f2e-4b78-94d3-bfef5754eaeb"
) => {
  const dispatch = useAppDispatch();

  // Get data from Redux stores
  const marketSizingResults = useAppSelector(selectMarketSizingResults);
  const marketSizingLastSaved = useAppSelector(selectMarketSizingLastSaved);
  const marketSizingProjectId = useAppSelector(selectMarketSizingProjectId);

  const pricingData = useAppSelector(selectPricingData);
  const pricingResults = useAppSelector(selectPricingResults);
  const pricingStrategy = useAppSelector(selectStrategy);
  const pricingLastSaved = useAppSelector(selectPricingLastSaved);
  const pricingProjectId = useAppSelector(selectPricingProjectId);

  const unitEconomicsMetrics = useAppSelector(selectMetrics);
  const unitEconomicsResults = useAppSelector(selectUnitEconomicsResults);
  const unitEconomicsLastSaved = useAppSelector(selectUnitEconomicsLastSaved);
  const unitEconomicsProjectId = useAppSelector(selectUnitEconomicsProjectId);

  const financialResults = useAppSelector(selectFinancialResults);
  const financialLastSaved = useAppSelector(selectFinancialLastSaved);
  const financialProjectId = useAppSelector(selectFinancialProjectId);

  const [summaries, setSummaries] = useState<ModuleSummary[]>([]);
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch data from database if not already loaded in Redux
  useEffect(() => {
    if (!dataFetched && projectId) {
      const fetchAllData = async () => {
        try {
          // Only fetch if data is not already loaded (projectId is null means not loaded)
          if (!marketSizingProjectId) {
            await dispatch(loadLatestMarketSizing(projectId));
          }
          if (!pricingProjectId) {
            await dispatch(loadLatestPricingLab(projectId));
          }
          if (!unitEconomicsProjectId) {
            await dispatch(loadLatestUnitEconomics(projectId));
          }
          if (!financialProjectId) {
            await dispatch(loadLatestModel(projectId));
          }
          setDataFetched(true);
        } catch (error) {
          console.error("Error fetching module data:", error);
          setDataFetched(true); // Set to true even on error to prevent infinite loops
        }
      };

      fetchAllData();
    }
  }, [
    projectId,
    dataFetched,
    marketSizingProjectId,
    pricingProjectId,
    unitEconomicsProjectId,
    financialProjectId,
    dispatch,
  ]);

  useEffect(() => {
    // Build summaries from real Redux data
    const realSummaries: ModuleSummary[] = [
      {
        id: "financial-modeler",
        name: "Financial Modeler",
        lastUpdated: financialLastSaved
          ? new Date(financialLastSaved).toLocaleDateString()
          : "Not saved",
        status: financialResults.totalRevenue > 0 ? "completed" : "draft",
        keyMetrics: {
          revenue: financialResults.totalRevenue || 0,
          expenses: financialResults.totalOperatingExpenses || 0,
          profit: financialResults.netProfit || 0,
          margin: financialResults.netMargin || 0,
        },
        data: {
          projections: financialResults.monthlyProjections || [],
          ebitda: financialResults.ebitda || 0,
          freeCashFlow: financialResults.freeCashFlow || 0,
        },
      },
      {
        id: "market-sizing",
        name: "Market Sizing",
        lastUpdated: marketSizingLastSaved
          ? new Date(marketSizingLastSaved).toLocaleDateString()
          : "Not saved",
        status: marketSizingResults.tam > 0 ? "completed" : "draft",
        keyMetrics: {
          tam: marketSizingResults.tam || 0,
          sam: marketSizingResults.sam || 0,
          som: marketSizingResults.som || 0,
          revenueOpportunity: marketSizingResults.revenueOpportunity || 0,
        },
        data: {
          tam: marketSizingResults.tam || 0,
          sam: marketSizingResults.sam || 0,
          som: marketSizingResults.som || 0,
        },
      },
      {
        id: "pricing-lab",
        name: "Pricing Lab",
        lastUpdated: pricingLastSaved
          ? new Date(pricingLastSaved).toLocaleDateString()
          : "Not saved",
        status: pricingResults.recommendedPrice > 0 ? "completed" : "draft",
        keyMetrics: {
          recommendedPrice: pricingResults.recommendedPrice || 0,
          costPlusPrice: pricingResults.costPlusPrice || 0,
          competitivePrice: pricingResults.competitivePrice || 0,
          valueBasedPrice: pricingResults.valueBasedPrice || 0,
        },
        data: {
          strategy: pricingStrategy,
          demandForecast: pricingResults.demandForecast || 0,
          costBasis: parseFloat(pricingData.costBasis) || 0,
          targetMargin: parseFloat(pricingData.targetMargin) || 0,
        },
      },
      {
        id: "unit-economics",
        name: "Unit Economics",
        lastUpdated: unitEconomicsLastSaved
          ? new Date(unitEconomicsLastSaved).toLocaleDateString()
          : "Not saved",
        status: unitEconomicsResults.ltv > 0 ? "completed" : "draft",
        keyMetrics: {
          ltv: unitEconomicsResults.ltv || 0,
          cac: parseFloat(unitEconomicsMetrics.cac) || 0,
          ltvCacRatio: unitEconomicsResults.ltvCacRatio || 0,
          paybackPeriod: unitEconomicsResults.paybackPeriod || 0,
        },
        data: {
          arr: unitEconomicsResults.arr || 0,
          grossProfit: unitEconomicsResults.grossProfit || 0,
          unitProfitability: unitEconomicsResults.unitProfitability || 0,
          arpu: parseFloat(unitEconomicsMetrics.arpu) || 0,
        },
      },
    ];

    setSummaries(realSummaries);
  }, [
    marketSizingResults,
    marketSizingLastSaved,
    pricingData,
    pricingResults,
    pricingStrategy,
    pricingLastSaved,
    unitEconomicsMetrics,
    unitEconomicsResults,
    unitEconomicsLastSaved,
    financialResults,
    financialLastSaved,
    dataFetched,
  ]);

  const getSummaryById = (id: string) => {
    return summaries.find((s) => s.id === id);
  };

  const updateSummary = (id: string, updates: Partial<ModuleSummary>) => {
    setSummaries((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updates,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : s
      )
    );
  };

  return {
    summaries,
    getSummaryById,
    updateSummary,
  };
};
