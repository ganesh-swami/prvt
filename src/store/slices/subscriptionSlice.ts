import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import type { RootState } from "../index";

export interface OrganizationSubscription {
  id: string;
  name: string;
  subscription_plan: string;
  subscription_status: string;
  billing_cycle: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_cancel_at: string | null;
  trial_end_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_active: boolean;
  plan_limits: {
    seats_max: number;
    viewer_seats_free: number;
    projects_max: number | string;
    exports_per_month: number;
    storage_items_max: number;
    integrations_max: number;
  };
  days_until_renewal: number | null;
}

interface SubscriptionState {
  currentOrgSubscription: OrganizationSubscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  currentOrgSubscription: null,
  loading: false,
  error: null,
};

// Fetch current organization's subscription
export const fetchOrgSubscription = createAsyncThunk(
  "subscription/fetchOrgSubscription",
  async (orgId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("organization_subscriptions")
        .select("*")
        .eq("id", orgId)
        .single();

      if (error) throw error;
      return data as OrganizationSubscription;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch subscription";
      return rejectWithValue(errorMessage);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscription: (state) => {
      state.currentOrgSubscription = null;
      state.error = null;
    },
    setSubscription: (state, action: PayloadAction<OrganizationSubscription>) => {
      state.currentOrgSubscription = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrgSubscription = action.payload;
      })
      .addCase(fetchOrgSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscription, setSubscription } = subscriptionSlice.actions;

// Selectors
export const selectCurrentOrgSubscription = (state: RootState) =>
  state.subscription.currentOrgSubscription;
export const selectSubscriptionLoading = (state: RootState) =>
  state.subscription.loading;
export const selectSubscriptionError = (state: RootState) =>
  state.subscription.error;

export default subscriptionSlice.reducer;
