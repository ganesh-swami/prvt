import { supabase } from './supabase';

export type SubscriptionStatus = 
  | 'active' 
  | 'past_due' 
  | 'grace_period' 
  | 'suspended' 
  | 'cancelled';

export interface SubscriptionInfo {
  planId: string;
  status: SubscriptionStatus;
  gracePeriodEnd?: string;
  currentPeriodEnd?: string;
  addons: string[];
}

export async function getSubscriptionStatus(orgId: string): Promise<SubscriptionInfo> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan_id, status, grace_period_end, current_period_end, addons')
    .eq('org_id', orgId)
    .single();

  if (error || !data) {
    return {
      planId: 'starter',
      status: 'active',
      addons: []
    };
  }

  return {
    planId: data.plan_id,
    status: data.status as SubscriptionStatus,
    gracePeriodEnd: data.grace_period_end,
    currentPeriodEnd: data.current_period_end,
    addons: data.addons || []
  };
}

export function canWriteFeatures(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'grace_period';
}

export function shouldShowGraceBanner(status: SubscriptionStatus, gracePeriodEnd?: string): boolean {
  if (status !== 'grace_period' || !gracePeriodEnd) return false;
  return new Date(gracePeriodEnd) > new Date();
}

export function shouldShowDowngradeBanner(
  status: SubscriptionStatus, 
  currentPeriodEnd?: string,
  wasDowngraded?: boolean
): boolean {
  if (!wasDowngraded || !currentPeriodEnd) return false;
  return new Date(currentPeriodEnd) > new Date();
}