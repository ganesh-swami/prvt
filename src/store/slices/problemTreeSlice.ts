import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { problemTreeApi } from '@/lib/api';
import type { ProblemTree } from '@/types';
import type { RootState } from '../index';

// camelCase version for frontend
export interface ProblemTreeData {
  problemImpactSociety: string;
  harmsDirectBeneficiaries: string;
  effectsInvolvedParties: string;
  mainProblem: string;
  problemPosition: string;
  mainCauses: string;
  keyInsights: string;
  strategicImplications: string;
}

interface ProblemTreeState {
  treeId: string | null;
  projectId: string | null;
  treeData: ProblemTreeData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastFetched: number | null;
  isDirty: boolean;
}

const initialTreeData: ProblemTreeData = {
  problemImpactSociety: '',
  harmsDirectBeneficiaries: '',
  effectsInvolvedParties: '',
  mainProblem: '',
  problemPosition: '',
  mainCauses: '',
  keyInsights: '',
  strategicImplications: '',
};

const initialState: ProblemTreeState = {
  treeId: null,
  projectId: null,
  treeData: initialTreeData,
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
  isDirty: false,
};

// Helper: Convert snake_case to camelCase
const snakeToCamel = (data: Partial<ProblemTree>): Partial<ProblemTreeData> => ({
  problemImpactSociety: data.problem_impact_society,
  harmsDirectBeneficiaries: data.harms_direct_beneficiaries,
  effectsInvolvedParties: data.effects_involved_parties,
  mainProblem: data.main_problem,
  problemPosition: data.problem_position,
  mainCauses: data.main_causes,
  keyInsights: data.key_insights,
  strategicImplications: data.strategic_implications,
});

// Helper: Convert camelCase to snake_case
const camelToSnake = (data: Partial<ProblemTreeData>): Partial<ProblemTree> => ({
  problem_impact_society: data.problemImpactSociety,
  harms_direct_beneficiaries: data.harmsDirectBeneficiaries,
  effects_involved_parties: data.effectsInvolvedParties,
  main_problem: data.mainProblem,
  problem_position: data.problemPosition,
  main_causes: data.mainCauses,
  key_insights: data.keyInsights,
  strategic_implications: data.strategicImplications,
});

// Async thunk to fetch problem tree
export const fetchProblemTree = createAsyncThunk(
  'problemTree/fetch',
  async ({ projectId, force = false }: { projectId: string; force?: boolean }, { getState }) => {
    const state = getState() as RootState;
    const { lastFetched } = state.problemTree;

    // Skip fetch if data was fetched recently (within 60 seconds) and not forced
    if (!force && lastFetched && Date.now() - lastFetched < 60000) {
      return null;
    }

    const tree = await problemTreeApi.getByProjectId(projectId);
    return tree;
  }
);

// Async thunk to save problem tree
export const saveProblemTree = createAsyncThunk(
  'problemTree/save',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { projectId, treeData } = state.problemTree;

    if (!projectId) {
      throw new Error('No project selected');
    }

    const snakeCaseData = camelToSnake(treeData);
    const savedTree = await problemTreeApi.upsertByProjectId(projectId, snakeCaseData);
    return savedTree;
  }
);

const problemTreeSlice = createSlice({
  name: 'problemTree',
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    updateField: (state, action: PayloadAction<{ field: keyof ProblemTreeData; value: string }>) => {
      const { field, value } = action.payload;
      state.treeData[field] = value;
      state.isDirty = true;
    },
    resetProblemTree: (state) => {
      state.treeId = null;
      state.treeData = initialTreeData;
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.lastFetched = null;
      state.isDirty = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch problem tree
      .addCase(fetchProblemTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemTree.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.treeId = action.payload.id;
          const camelCaseData = snakeToCamel(action.payload);
          state.treeData = { ...initialTreeData, ...camelCaseData };
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchProblemTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch problem tree';
      })
      // Save problem tree
      .addCase(saveProblemTree.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProblemTree.fulfilled, (state, action) => {
        state.saving = false;
        state.treeId = action.payload.id;
        const camelCaseData = snakeToCamel(action.payload);
        state.treeData = { ...initialTreeData, ...camelCaseData };
        state.isDirty = false;
        state.lastFetched = Date.now();
      })
      .addCase(saveProblemTree.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save problem tree';
      });
  },
});

export const { setProjectId, updateField, resetProblemTree, clearError } = problemTreeSlice.actions;

// Selectors
export const selectTreeData = (state: RootState) => state.problemTree.treeData;
export const selectIsLoading = (state: RootState) => state.problemTree.loading;
export const selectIsSaving = (state: RootState) => state.problemTree.saving;
export const selectError = (state: RootState) => state.problemTree.error;
export const selectIsDirty = (state: RootState) => state.problemTree.isDirty;
export const selectCompletionPercentage = (state: RootState) => {
  const fields = Object.values(state.problemTree.treeData);
  const filledFields = fields.filter(value => value.trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

export default problemTreeSlice.reducer;
