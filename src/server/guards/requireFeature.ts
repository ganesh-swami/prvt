import { canUseFeature, loadPricing, type FeatureKey, type WorkspaceSubscription } from '@/lib/pricing';

let pricingCache: any = null;
let cacheExpiry = 0;

async function loadPricingCached() {
  const now = Date.now();
  if (pricingCache && now < cacheExpiry) {
    return pricingCache;
  }
  
  try {
    pricingCache = await loadPricing();
    cacheExpiry = now + 5 * 60 * 1000; // 5 minute cache
    return pricingCache;
  } catch (error) {
    // Fallback to cached version if available
    if (pricingCache) return pricingCache;
    throw error;
  }
}

export interface GuardResult {
  allowed: boolean;
  subscription?: WorkspaceSubscription;
  upgradeTo?: string[];
  reason?: string;
}

export async function requireFeature(
  orgId: string,
  feature: FeatureKey,
  subscription?: WorkspaceSubscription
): Promise<GuardResult> {
  try {
    const pricing = await loadPricingCached();
    
    // Use provided subscription or fetch from database
    let sub = subscription;
    if (!sub) {
      // In real implementation, fetch from database
      sub = { planId: 'starter', addons: [] };
    }
    
    const result = canUseFeature(pricing, sub, feature);
    
    return {
      allowed: result.allowed,
      subscription: sub,
      upgradeTo: result.allowed ? undefined : result.upgradeTo,
      reason: result.allowed ? undefined : result.reason
    };
  } catch (error) {
    console.error('Feature guard error:', error);
    return {
      allowed: false,
      reason: 'system-error'
    };
  }
}

export function createFeatureGuard(feature: FeatureKey) {
  return async (orgId: string, subscription?: WorkspaceSubscription) => {
    return requireFeature(orgId, feature, subscription);
  };
}

// Pre-built guards for common features
export const requireTasks = createFeatureGuard('collab.tasks');
export const requireComments = createFeatureGuard('collab.comments');
export const requireMentions = createFeatureGuard('collab.mentions');
export const requireInvestorRoom = createFeatureGuard('investor.room');
export const requirePDFExport = createFeatureGuard('exports.pdf');
export const requirePPTExport = createFeatureGuard('exports.ppt');
export const requireAIAnalyst = createFeatureGuard('ai.analyst');