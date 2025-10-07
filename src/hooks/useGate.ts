import { useEffect, useState } from "react";
import { canUseFeature, loadPricing, WorkspaceSubscription, FeatureKey } from "@/lib/pricing";

export function useGate(feature: FeatureKey, sub: WorkspaceSubscription) {
  const [state, setState] = useState<{ loading: boolean; allowed: boolean; upgradeTo?: string[] }>({
    loading: true,
    allowed: false
  });

  useEffect(() => {
    (async () => {
      try {
        const cfg = await loadPricing();
        const res = canUseFeature(cfg, sub, feature);
        setState({ 
          loading: false, 
          allowed: (res as any).allowed, 
          upgradeTo: (res as any).upgradeTo 
        });
      } catch (error) {
        console.error('Failed to load pricing config:', error);
        setState({ loading: false, allowed: false, upgradeTo: ["pro"] });
      }
    })();
  }, [feature, sub.planId, (sub.addons ?? []).join(",")]);

  return state;
}