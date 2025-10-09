import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { RootState } from '../index';

// Types
export interface SocialCanvasData {
  socialMission: string;
  keyDeliveryPartners: string;
  keyActivities: string;
  socialImpactMeasurement: string;
  socialValueProposition: string;
  relationships: string;
  impactGapAnalysis: string;
  keyStakeholders: string;
  channels: string;
  competitorsCompetition: string;
  keyResources: string;
  pestelAnalysis: string;
  costs: string;
  surplus: string;
  revenue: string;
}

export interface SocialCanvas {
  id: string;
  project_id: string;
  social_mission?: string;
  key_delivery_partners?: string;
  key_activities?: string;
  social_impact_measurement?: string;
  social_value_proposition?: string;
  relationships?: string;
  impact_gap_analysis?: string;
  key_stakeholders?: string;
  channels?: string;
  competitors_competition?: string;
  key_resources?: string;
  pestel_analysis?: string;
  costs?: string;
  surplus?: string;
  revenue?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialCanvasState {
  canvasId: string | null;
  projectId: string | null;
  canvasData: SocialCanvasData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastFetched: number | null;
  isDirty: boolean;
}

const initialCanvasData: SocialCanvasData = {
  socialMission: '',
  keyDeliveryPartners: '',
  keyActivities: '',
  socialImpactMeasurement: '',
  socialValueProposition: '',
  relationships: '',
  impactGapAnalysis: '',
  keyStakeholders: '',
  channels: '',
  competitorsCompetition: '',
  keyResources: '',
  pestelAnalysis: '',
  costs: '',
  surplus: '',
  revenue: '',
};

const initialState: SocialCanvasState = {
  canvasId: null,
  projectId: null,
  canvasData: initialCanvasData,
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
  isDirty: false,
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper to convert canvas data to DB format
const canvasDataToDb = (data: SocialCanvasData): Partial<SocialCanvas> => {
  const dbData: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = toSnakeCase(key);
    dbData[snakeKey] = value;
  });
  return dbData as Partial<SocialCanvas>;
};

// Helper to convert DB format to canvas data
const dbToCanvasData = (canvas: SocialCanvas): SocialCanvasData => {
  return {
    socialMission: canvas.social_mission || '',
    keyDeliveryPartners: canvas.key_delivery_partners || '',
    keyActivities: canvas.key_activities || '',
    socialImpactMeasurement: canvas.social_impact_measurement || '',
    socialValueProposition: canvas.social_value_proposition || '',
    relationships: canvas.relationships || '',
    impactGapAnalysis: canvas.impact_gap_analysis || '',
    keyStakeholders: canvas.key_stakeholders || '',
    channels: canvas.channels || '',
    competitorsCompetition: canvas.competitors_competition || '',
    keyResources: canvas.key_resources || '',
    pestelAnalysis: canvas.pestel_analysis || '',
    costs: canvas.costs || '',
    surplus: canvas.surplus || '',
    revenue: canvas.revenue || '',
  };
};

// Async Thunks

/**
 * Fetch social canvas from database
 * Only fetches if not already loaded or if forced
 */
export const fetchSocialCanvas = createAsyncThunk(
  'socialCanvas/fetchSocialCanvas',
  async (
    { projectId, force = false }: { projectId: string; force?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const { lastFetched, canvasId } = state.socialCanvas;

      // If already fetched recently and not forced, return cached data
      if (!force && lastFetched && Date.now() - lastFetched < 60000 && canvasId) {
        return null;
      }

      // Fetch social canvas from database
      const { data, error } = await supabase
        .from('social_business_canvas')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw error;
      }

      if (data) {
        return {
          canvasId: data.id,
          projectId,
          canvasData: dbToCanvasData(data),
        };
      }

      // No canvas exists yet
      return {
        canvasId: null,
        projectId,
        canvasData: initialCanvasData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch social canvas';
      console.error('Error fetching social canvas:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Save/Update social canvas to database
 * Creates new canvas if doesn't exist, updates if exists
 */
export const saveSocialCanvas = createAsyncThunk(
  'socialCanvas/saveSocialCanvas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { canvasId, projectId, canvasData } = state.socialCanvas;

      if (!projectId) {
        throw new Error('No project ID set');
      }

      const dbData = canvasDataToDb(canvasData);

      if (canvasId) {
        // Update existing canvas
        const { data, error } = await supabase
          .from('social_business_canvas')
          .update({
            ...dbData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', canvasId)
          .select()
          .single();

        if (error) throw error;

        return {
          canvasId: data.id,
          canvasData: dbToCanvasData(data),
        };
      } else {
        // Create new canvas (upsert to handle race conditions)
        const { data, error } = await supabase
          .from('social_business_canvas')
          .upsert(
            {
              project_id: projectId,
              ...dbData,
            },
            {
              onConflict: 'project_id',
            }
          )
          .select()
          .single();

        if (error) throw error;

        return {
          canvasId: data.id,
          canvasData: dbToCanvasData(data),
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save social canvas';
      console.error('Error saving social canvas:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const socialCanvasSlice = createSlice({
  name: 'socialCanvas',
  initialState,
  reducers: {
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },

    updateField: (state, action: PayloadAction<{ field: keyof SocialCanvasData; value: string }>) => {
      const { field, value } = action.payload;
      state.canvasData[field] = value;
      state.isDirty = true;
    },

    resetSocialCanvas: (state) => {
      state.canvasId = null;
      state.projectId = null;
      state.canvasData = initialCanvasData;
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
      // Fetch social canvas
      .addCase(fetchSocialCanvas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialCanvas.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload === null) {
          // Using cached data, no update needed
          return;
        }

        state.canvasId = action.payload.canvasId;
        state.projectId = action.payload.projectId;
        state.canvasData = action.payload.canvasData;
        state.lastFetched = Date.now();
        state.isDirty = false;
      })
      .addCase(fetchSocialCanvas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save social canvas
      .addCase(saveSocialCanvas.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveSocialCanvas.fulfilled, (state, action) => {
        state.saving = false;
        state.canvasId = action.payload.canvasId;
        state.isDirty = false;
        state.lastFetched = Date.now();
      })
      .addCase(saveSocialCanvas.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setProjectId, updateField, resetSocialCanvas, clearError } = socialCanvasSlice.actions;

// Selectors
export const selectSocialCanvas = (state: RootState) => state.socialCanvas;
export const selectCanvasData = (state: RootState) => state.socialCanvas.canvasData;
export const selectIsLoading = (state: RootState) => state.socialCanvas.loading;
export const selectIsSaving = (state: RootState) => state.socialCanvas.saving;
export const selectError = (state: RootState) => state.socialCanvas.error;
export const selectIsDirty = (state: RootState) => state.socialCanvas.isDirty;
export const selectCompletionPercentage = (state: RootState) => {
  const data = state.socialCanvas.canvasData;
  const fields = Object.values(data);
  const filledFields = fields.filter((value) => value.trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

export default socialCanvasSlice.reducer;
