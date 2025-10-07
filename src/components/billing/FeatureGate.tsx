import React, { useEffect } from "react";
import { useGate } from "@/hooks/useGate";
import UpgradePrompt from "./UpgradePrompt";
import GracePeriodBanner from "./GracePeriodBanner";
import { analytics } from "@/lib/analytics";
import { getSubscriptionStatus, canWriteFeatures } from "@/lib/subscriptionStatus";
import type { WorkspaceSubscription, FeatureKey } from "@/lib/pricing";

export default function FeatureGate({
  feature,
  sub,
  children,
  fallback,
  showLocked = true
}: {
  feature: FeatureKey;
  sub: WorkspaceSubscription;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLocked?: boolean;
}) {
  const { loading, allowed, upgradeTo } = useGate(feature, sub);

  useEffect(() => {
    if (!loading && !allowed) {
      analytics.gateDenied(feature, sub.planId, upgradeTo);
    }
  }, [loading, allowed, feature, sub.planId, upgradeTo]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    if (!showLocked) return null;
    
    analytics.upgradePromptShown(feature, sub.planId);
    return <UpgradePrompt plans={upgradeTo ?? ["pro"]} feature={feature} />;
  }
  
  return <>{children}</>;
}