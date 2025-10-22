import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { gtmPlansApi } from "@/lib/api";
import type { RootState } from "../index";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

// Product Roadmap
export interface ProductRoadmap {
  businessName: string;
  year: string;
  team: string;
  stages: Record<string, Record<string, string>>; // stage -> quarter -> content
}

// Customer Pain Points
export interface CustomerPainPoints {
  productivity: string;
  financial: string;
  process: string;
  support: string;
}

// Competitor Analysis
export interface CompetitorData {
  id: string;
  name: string;
  targetMarket: string;
  productOfferings: string;
  whatWorks: string;
  whatDoesntWork: string;
}

export interface CompetitorAnalysis {
  yourBusiness: {
    targetMarket: string;
    productOfferings: string;
    whatWorks: string;
    whatDoesntWork: string;
  };
  competitors: CompetitorData[];
}

// SWOT Analysis
export interface SWOTSection {
  notes: string;
  analysis: string;
}

export interface SWOTAnalysis {
  strengths: SWOTSection;
  weaknesses: SWOTSection;
  opportunities: SWOTSection;
  threats: SWOTSection;
}

// Product Concept
export interface ProductIdea {
  id: string;
  name: string;
  productName: string;
  description: string;
  painPointSolution: string;
  competitorNotes: string;
  importantFeatures: string;
  usp: string;
}

export interface ProductConcept {
  ideas: ProductIdea[];
}

// Key Audience Pitches
export interface KeyAudiencePitches {
  leadership: string;
  donorsFinance: string;
  targetAudience: string;
}

// Launch Goals & KPIs
export interface LaunchGoal {
  id: string;
  name: string;
  kpi1: string;
  kpi2: string;
}

export interface LaunchGoalsKPIs {
  goals: LaunchGoal[];
}

// Status Log
export interface StatusLogEntry {
  id: string;
  teamLead: string;
  team: string;
  department: string;
  tasks: string;
  deadline: string;
  status: boolean;
  notes: string;
}

export interface StatusLog {
  entries: StatusLogEntry[];
}

// Customer Journey Map
export interface CustomerJourneyMap {
  touchpoints: Record<string, string>; // stage -> content
  departments: Record<string, string>;
  customerFeelings: Record<string, string>;
  painPoints: Record<string, string>;
  opportunities: Record<string, string>;
}

// Promotions Checklist
export interface PromotionsChecklist {
  notes: string;
  selectedItems: Record<string, boolean>;
}

// Outreach Channels
export interface OutreachChannel {
  id: string;
  category: string;
  assets: string[];
  channelNotes: string;
}

export interface OutreachChannels {
  channels: OutreachChannel[];
}

// Main GTM Planner State
export interface GTMPlannerState {
  projectId: string | null;
  gtmId: string | null;
  name: string;
  
  // All sections
  productRoadmap: ProductRoadmap;
  customerPainPoints: CustomerPainPoints;
  competitorAnalysis: CompetitorAnalysis;
  swotAnalysis: SWOTAnalysis;
  productConcept: ProductConcept;
  keyAudiencePitches: KeyAudiencePitches;
  launchGoalsKPIs: LaunchGoalsKPIs;
  statusLog: StatusLog;
  customerJourneyMap: CustomerJourneyMap;
  promotionsChecklist: PromotionsChecklist;
  outreachChannels: OutreachChannels;
  
  // Meta
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialProductRoadmap: ProductRoadmap = {
  businessName: "[Zendesk]",
  year: "[2023]",
  team: "[Marketing]",
  stages: {
    Research: { Q1: "", Q2: "", Q3: "", Q4: "" },
    "Idea generation": { Q1: "", Q2: "", Q3: "", Q4: "" },
    Prototype: { Q1: "", Q2: "", Q3: "", Q4: "" },
    Testing: { Q1: "", Q2: "", Q3: "", Q4: "" },
    Approval: { Q1: "", Q2: "", Q3: "", Q4: "" },
    Development: { Q1: "", Q2: "", Q3: "", Q4: "" },
    Launch: { Q1: "", Q2: "", Q3: "", Q4: "" },
    Promotion: { Q1: "", Q2: "", Q3: "", Q4: "" },
  },
};

const initialCustomerPainPoints: CustomerPainPoints = {
  productivity: "",
  financial: "",
  process: "",
  support: "",
};

const initialCompetitorAnalysis: CompetitorAnalysis = {
  yourBusiness: {
    targetMarket: "",
    productOfferings: "",
    whatWorks: "",
    whatDoesntWork: "",
  },
  competitors: [
    { id: "1", name: "[Competitor]", targetMarket: "", productOfferings: "", whatWorks: "", whatDoesntWork: "" },
    { id: "2", name: "[Competitor]", targetMarket: "", productOfferings: "", whatWorks: "", whatDoesntWork: "" },
    { id: "3", name: "[Competitor]", targetMarket: "", productOfferings: "", whatWorks: "", whatDoesntWork: "" },
    { id: "4", name: "[Competitor]", targetMarket: "", productOfferings: "", whatWorks: "", whatDoesntWork: "" },
  ],
};

const initialSWOTAnalysis: SWOTAnalysis = {
  strengths: { notes: "", analysis: "" },
  weaknesses: { notes: "", analysis: "" },
  opportunities: { notes: "", analysis: "" },
  threats: { notes: "", analysis: "" },
};

const initialProductConcept: ProductConcept = {
  ideas: [
    { id: "1", name: "Idea #1", productName: "", description: "", painPointSolution: "", competitorNotes: "", importantFeatures: "", usp: "" },
    { id: "2", name: "Idea #2", productName: "", description: "", painPointSolution: "", competitorNotes: "", importantFeatures: "", usp: "" },
    { id: "3", name: "Idea #3", productName: "", description: "", painPointSolution: "", competitorNotes: "", importantFeatures: "", usp: "" },
    { id: "4", name: "Idea #4", productName: "", description: "", painPointSolution: "", competitorNotes: "", importantFeatures: "", usp: "" },
    { id: "5", name: "Idea #5", productName: "", description: "", painPointSolution: "", competitorNotes: "", importantFeatures: "", usp: "" },
  ],
};

const initialKeyAudiencePitches: KeyAudiencePitches = {
  leadership: "",
  donorsFinance: "",
  targetAudience: "",
};

const initialLaunchGoalsKPIs: LaunchGoalsKPIs = {
  goals: [
    { id: "1", name: "Goal #1", kpi1: "", kpi2: "" },
    { id: "2", name: "Goal #2", kpi1: "", kpi2: "" },
    { id: "3", name: "Goal #3", kpi1: "", kpi2: "" },
  ],
};

const initialStatusLog: StatusLog = {
  entries: [
    { id: "1", teamLead: "", team: "", department: "", tasks: "", deadline: "", status: false, notes: "" },
    { id: "2", teamLead: "", team: "", department: "", tasks: "", deadline: "", status: false, notes: "" },
    { id: "3", teamLead: "", team: "", department: "", tasks: "", deadline: "", status: false, notes: "" },
    { id: "4", teamLead: "", team: "", department: "", tasks: "", deadline: "", status: false, notes: "" },
    { id: "5", teamLead: "", team: "", department: "", tasks: "", deadline: "", status: false, notes: "" },
  ],
};

const initialCustomerJourneyMap: CustomerJourneyMap = {
  touchpoints: { Awareness: "", Consideration: "", Purchase: "", Retention: "", Advocacy: "" },
  departments: { Awareness: "", Consideration: "", Purchase: "", Retention: "", Advocacy: "" },
  customerFeelings: { Awareness: "", Consideration: "", Purchase: "", Retention: "", Advocacy: "" },
  painPoints: { Awareness: "", Consideration: "", Purchase: "", Retention: "", Advocacy: "" },
  opportunities: { Awareness: "", Consideration: "", Purchase: "", Retention: "", Advocacy: "" },
};

const initialPromotionsChecklist: PromotionsChecklist = {
  notes: "",
  selectedItems: {},
};

const initialOutreachChannels: OutreachChannels = {
  channels: [
    { id: "1", category: "Customer service", assets: ["[Asset]", "[Asset]", "[Asset]"], channelNotes: "" },
    { id: "2", category: "Outbound sales", assets: ["[Asset]", "[Asset]", "[Asset]"], channelNotes: "" },
    { id: "3", category: "Online marketing", assets: ["[Asset]", "[Asset]", "[Asset]"], channelNotes: "" },
    { id: "4", category: "Offline marketing", assets: ["[Asset]", "[Asset]", "[Asset]"], channelNotes: "" },
  ],
};

const initialState: GTMPlannerState = {
  projectId: null,
  gtmId: null,
  name: "GTM Plan",
  productRoadmap: initialProductRoadmap,
  customerPainPoints: initialCustomerPainPoints,
  competitorAnalysis: initialCompetitorAnalysis,
  swotAnalysis: initialSWOTAnalysis,
  productConcept: initialProductConcept,
  keyAudiencePitches: initialKeyAudiencePitches,
  launchGoalsKPIs: initialLaunchGoalsKPIs,
  statusLog: initialStatusLog,
  customerJourneyMap: initialCustomerJourneyMap,
  promotionsChecklist: initialPromotionsChecklist,
  outreachChannels: initialOutreachChannels,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchGTMPlan = createAsyncThunk(
  "gtmPlanner/fetchPlan",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const plan = await gtmPlansApi.getByProjectId(projectId);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch GTM plan");
    }
  }
);

export const saveGTMPlan = createAsyncThunk(
  "gtmPlanner/savePlan",
  async (
    {
      projectId,
      gtmId,
      data,
    }: {
      projectId: string;
      gtmId?: string | null;
      data: Partial<GTMPlannerState>;
    },
    { rejectWithValue }
  ) => {
    try {
      if (gtmId) {
        // Update existing plan
        const updated = await gtmPlansApi.update(gtmId, data);
        return updated;
      } else {
        // Create new plan
        const created = await gtmPlansApi.create({
          project_id: projectId,
          ...data,
        });
        return created;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to save GTM plan");
    }
  }
);

export const loadLatestGTMPlan = createAsyncThunk(
  "gtmPlanner/loadLatest",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const plan = await gtmPlansApi.getByProjectId(projectId);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load GTM plan");
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const gtmPlannerSlice = createSlice({
  name: "gtmPlanner",
  initialState,
  reducers: {
    // Set project ID
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },

    // Product Roadmap
    setProductRoadmapMetadata: (
      state,
      action: PayloadAction<{ businessName?: string; year?: string; team?: string }>
    ) => {
      if (action.payload.businessName !== undefined) {
        state.productRoadmap.businessName = action.payload.businessName;
      }
      if (action.payload.year !== undefined) {
        state.productRoadmap.year = action.payload.year;
      }
      if (action.payload.team !== undefined) {
        state.productRoadmap.team = action.payload.team;
      }
    },

    setProductRoadmapStage: (
      state,
      action: PayloadAction<{ stage: string; quarter: string; content: string }>
    ) => {
      const { stage, quarter, content } = action.payload;
      if (!state.productRoadmap.stages[stage]) {
        state.productRoadmap.stages[stage] = {};
      }
      state.productRoadmap.stages[stage][quarter] = content;
    },

    // Customer Pain Points
    setCustomerPainPoint: (
      state,
      action: PayloadAction<{ category: keyof CustomerPainPoints; content: string }>
    ) => {
      state.customerPainPoints[action.payload.category] = action.payload.content;
    },

    // Competitor Analysis
    setYourBusinessData: (
      state,
      action: PayloadAction<{ field: keyof CompetitorAnalysis["yourBusiness"]; content: string }>
    ) => {
      state.competitorAnalysis.yourBusiness[action.payload.field] = action.payload.content;
    },

    addCompetitor: (state) => {
      const newId = String(
        Math.max(...state.competitorAnalysis.competitors.map((c) => parseInt(c.id))) + 1
      );
      state.competitorAnalysis.competitors.push({
        id: newId,
        name: "[New Competitor]",
        targetMarket: "",
        productOfferings: "",
        whatWorks: "",
        whatDoesntWork: "",
      });
    },

    removeCompetitor: (state, action: PayloadAction<string>) => {
      state.competitorAnalysis.competitors = state.competitorAnalysis.competitors.filter(
        (c) => c.id !== action.payload
      );
    },

    updateCompetitor: (
      state,
      action: PayloadAction<{ id: string; field: keyof CompetitorData; value: string }>
    ) => {
      const competitor = state.competitorAnalysis.competitors.find(
        (c) => c.id === action.payload.id
      );
      if (competitor) {
        (competitor as any)[action.payload.field] = action.payload.value;
      }
    },

    // SWOT Analysis
    setSWOTSection: (
      state,
      action: PayloadAction<{
        section: keyof SWOTAnalysis;
        field: keyof SWOTSection;
        content: string;
      }>
    ) => {
      state.swotAnalysis[action.payload.section][action.payload.field] = action.payload.content;
    },

    // Product Concept
    addProductIdea: (state) => {
      const newId = String(Math.max(...state.productConcept.ideas.map((i) => parseInt(i.id))) + 1);
      state.productConcept.ideas.push({
        id: newId,
        name: `Idea #${newId}`,
        productName: "",
        description: "",
        painPointSolution: "",
        competitorNotes: "",
        importantFeatures: "",
        usp: "",
      });
    },

    removeProductIdea: (state, action: PayloadAction<string>) => {
      state.productConcept.ideas = state.productConcept.ideas.filter(
        (i) => i.id !== action.payload
      );
    },

    updateProductIdea: (
      state,
      action: PayloadAction<{ id: string; field: keyof ProductIdea; value: string }>
    ) => {
      const idea = state.productConcept.ideas.find((i) => i.id === action.payload.id);
      if (idea) {
        (idea as any)[action.payload.field] = action.payload.value;
      }
    },

    // Key Audience Pitches
    setKeyAudiencePitch: (
      state,
      action: PayloadAction<{ type: keyof KeyAudiencePitches; content: string }>
    ) => {
      state.keyAudiencePitches[action.payload.type] = action.payload.content;
    },

    // Launch Goals & KPIs
    addLaunchGoal: (state) => {
      const newId = String(Math.max(...state.launchGoalsKPIs.goals.map((g) => parseInt(g.id))) + 1);
      state.launchGoalsKPIs.goals.push({
        id: newId,
        name: `Goal #${newId}`,
        kpi1: "",
        kpi2: "",
      });
    },

    removeLaunchGoal: (state, action: PayloadAction<string>) => {
      state.launchGoalsKPIs.goals = state.launchGoalsKPIs.goals.filter(
        (g) => g.id !== action.payload
      );
    },

    updateLaunchGoal: (
      state,
      action: PayloadAction<{ id: string; field: keyof LaunchGoal; value: string }>
    ) => {
      const goal = state.launchGoalsKPIs.goals.find((g) => g.id === action.payload.id);
      if (goal) {
        (goal as any)[action.payload.field] = action.payload.value;
      }
    },

    // Status Log
    addStatusLogEntry: (state) => {
      const newId = String(Math.max(...state.statusLog.entries.map((e) => parseInt(e.id))) + 1);
      state.statusLog.entries.push({
        id: newId,
        teamLead: "",
        team: "",
        department: "",
        tasks: "",
        deadline: "",
        status: false,
        notes: "",
      });
    },

    removeStatusLogEntry: (state, action: PayloadAction<string>) => {
      state.statusLog.entries = state.statusLog.entries.filter((e) => e.id !== action.payload);
    },

    updateStatusLogEntry: (
      state,
      action: PayloadAction<{ id: string; field: keyof StatusLogEntry; value: any }>
    ) => {
      const entry = state.statusLog.entries.find((e) => e.id === action.payload.id);
      if (entry) {
        (entry as any)[action.payload.field] = action.payload.value;
      }
    },

    // Customer Journey Map
    setCustomerJourneyMapCell: (
      state,
      action: PayloadAction<{
        category: keyof CustomerJourneyMap;
        stage: string;
        content: string;
      }>
    ) => {
      state.customerJourneyMap[action.payload.category][action.payload.stage] =
        action.payload.content;
    },

    // Promotions Checklist
    setPromotionsNotes: (state, action: PayloadAction<string>) => {
      state.promotionsChecklist.notes = action.payload;
    },

    togglePromotionItem: (state, action: PayloadAction<{ item: string; checked: boolean }>) => {
      state.promotionsChecklist.selectedItems[action.payload.item] = action.payload.checked;
    },

    // Outreach Channels
    addOutreachChannel: (state) => {
      const newId = String(
        Math.max(...state.outreachChannels.channels.map((c) => parseInt(c.id))) + 1
      );
      state.outreachChannels.channels.push({
        id: newId,
        category: "New Category",
        assets: ["[Asset]", "[Asset]", "[Asset]"],
        channelNotes: "",
      });
    },

    removeOutreachChannel: (state, action: PayloadAction<string>) => {
      state.outreachChannels.channels = state.outreachChannels.channels.filter(
        (c) => c.id !== action.payload
      );
    },

    updateOutreachChannel: (
      state,
      action: PayloadAction<{ id: string; field: keyof OutreachChannel; value: any }>
    ) => {
      const channel = state.outreachChannels.channels.find((c) => c.id === action.payload.id);
      if (channel) {
        (channel as any)[action.payload.field] = action.payload.value;
      }
    },

    updateOutreachChannelAsset: (
      state,
      action: PayloadAction<{ channelId: string; assetIndex: number; value: string }>
    ) => {
      const channel = state.outreachChannels.channels.find((c) => c.id === action.payload.channelId);
      if (channel && channel.assets[action.payload.assetIndex] !== undefined) {
        channel.assets[action.payload.assetIndex] = action.payload.value;
      }
    },

    // Reset
    resetGTMPlanner: (state) => {
      return { ...initialState, projectId: state.projectId };
    },
  },
  extraReducers: (builder) => {
    // Fetch GTM Plan
    builder.addCase(fetchGTMPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGTMPlan.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.gtmId = action.payload.id;
        state.name = action.payload.name || "GTM Plan";
        state.productRoadmap = action.payload.product_roadmap || initialProductRoadmap;
        state.customerPainPoints = action.payload.customer_pain_points || initialCustomerPainPoints;
        state.competitorAnalysis = action.payload.competitor_analysis || initialCompetitorAnalysis;
        state.swotAnalysis = action.payload.swot_analysis || initialSWOTAnalysis;
        state.productConcept = action.payload.product_concept || initialProductConcept;
        state.keyAudiencePitches = action.payload.key_audience_pitches || initialKeyAudiencePitches;
        state.launchGoalsKPIs = action.payload.launch_goals_kpis || initialLaunchGoalsKPIs;
        state.statusLog = action.payload.status_log || initialStatusLog;
        state.customerJourneyMap = action.payload.customer_journey_map || initialCustomerJourneyMap;
        state.promotionsChecklist = action.payload.promotions_checklist || initialPromotionsChecklist;
        state.outreachChannels = action.payload.outreach_channels || initialOutreachChannels;
        state.lastSaved = action.payload.updated_at;
      }
    });
    builder.addCase(fetchGTMPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save GTM Plan
    builder.addCase(saveGTMPlan.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(saveGTMPlan.fulfilled, (state, action) => {
      state.saving = false;
      if (action.payload) {
        state.gtmId = action.payload.id;
        state.lastSaved = action.payload.updated_at;
      }
    });
    builder.addCase(saveGTMPlan.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Load Latest GTM Plan
    builder.addCase(loadLatestGTMPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadLatestGTMPlan.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.gtmId = action.payload.id;
        state.name = action.payload.name || "GTM Plan";
        state.productRoadmap = action.payload.product_roadmap || initialProductRoadmap;
        state.customerPainPoints = action.payload.customer_pain_points || initialCustomerPainPoints;
        state.competitorAnalysis = action.payload.competitor_analysis || initialCompetitorAnalysis;
        state.swotAnalysis = action.payload.swot_analysis || initialSWOTAnalysis;
        state.productConcept = action.payload.product_concept || initialProductConcept;
        state.keyAudiencePitches = action.payload.key_audience_pitches || initialKeyAudiencePitches;
        state.launchGoalsKPIs = action.payload.launch_goals_kpis || initialLaunchGoalsKPIs;
        state.statusLog = action.payload.status_log || initialStatusLog;
        state.customerJourneyMap = action.payload.customer_journey_map || initialCustomerJourneyMap;
        state.promotionsChecklist = action.payload.promotions_checklist || initialPromotionsChecklist;
        state.outreachChannels = action.payload.outreach_channels || initialOutreachChannels;
        state.lastSaved = action.payload.updated_at;
      }
    });
    builder.addCase(loadLatestGTMPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  setProjectId,
  setProductRoadmapMetadata,
  setProductRoadmapStage,
  setCustomerPainPoint,
  setYourBusinessData,
  addCompetitor,
  removeCompetitor,
  updateCompetitor,
  setSWOTSection,
  addProductIdea,
  removeProductIdea,
  updateProductIdea,
  setKeyAudiencePitch,
  addLaunchGoal,
  removeLaunchGoal,
  updateLaunchGoal,
  addStatusLogEntry,
  removeStatusLogEntry,
  updateStatusLogEntry,
  setCustomerJourneyMapCell,
  setPromotionsNotes,
  togglePromotionItem,
  addOutreachChannel,
  removeOutreachChannel,
  updateOutreachChannel,
  updateOutreachChannelAsset,
  resetGTMPlanner,
} = gtmPlannerSlice.actions;

// Selectors
export const selectGTMPlanner = (state: RootState) => state.gtmPlanner;
export const selectProductRoadmap = (state: RootState) => state.gtmPlanner.productRoadmap;
export const selectCustomerPainPoints = (state: RootState) => state.gtmPlanner.customerPainPoints;
export const selectCompetitorAnalysis = (state: RootState) => state.gtmPlanner.competitorAnalysis;
export const selectSWOTAnalysis = (state: RootState) => state.gtmPlanner.swotAnalysis;
export const selectProductConcept = (state: RootState) => state.gtmPlanner.productConcept;
export const selectKeyAudiencePitches = (state: RootState) => state.gtmPlanner.keyAudiencePitches;
export const selectLaunchGoalsKPIs = (state: RootState) => state.gtmPlanner.launchGoalsKPIs;
export const selectStatusLog = (state: RootState) => state.gtmPlanner.statusLog;
export const selectCustomerJourneyMap = (state: RootState) => state.gtmPlanner.customerJourneyMap;
export const selectPromotionsChecklist = (state: RootState) => state.gtmPlanner.promotionsChecklist;
export const selectOutreachChannels = (state: RootState) => state.gtmPlanner.outreachChannels;

export default gtmPlannerSlice.reducer;
