import { supabase } from './supabase';
import type { FeatureKey } from './pricing';

export interface UsageCounter {
  orgId: string;
  feature: FeatureKey;
  periodStart: string;
  count: number;
  allowance?: number;
}

export async function bumpUsage(
  orgId: string, 
  feature: FeatureKey, 
  increment: number = 1
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('bump_usage', {
      p_org_id: orgId,
      p_feature: feature,
      p_increment: increment
    });

    if (error) {
      console.error('Error bumping usage:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Failed to bump usage:', error);
    return 0;
  }
}

export async function getUsageForOrg(orgId: string): Promise<UsageCounter[]> {
  try {
    const { data, error } = await supabase
      .from('usage_counters')
      .select('*')
      .eq('org_id', orgId)
      .eq('period_start', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching usage:', error);
      return [];
    }

    return (data || []).map(row => ({
      orgId: row.org_id,
      feature: row.feature,
      periodStart: row.period_start,
      count: row.count,
      allowance: row.allowance
    }));
  } catch (error) {
    console.error('Failed to fetch usage:', error);
    return [];
  }
}

export async function checkUsageLimit(
  orgId: string,
  feature: FeatureKey,
  allowance: number | 'unlimited'
): Promise<{ allowed: boolean; current: number; limit: number | 'unlimited' }> {
  if (allowance === 'unlimited') {
    return { allowed: true, current: 0, limit: 'unlimited' };
  }

  const usage = await getUsageForOrg(orgId);
  const featureUsage = usage.find(u => u.feature === feature);
  const current = featureUsage?.count || 0;

  return {
    allowed: current < allowance,
    current,
    limit: allowance
  };
}