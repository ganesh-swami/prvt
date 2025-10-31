import { useAppSelector } from "@/store/hooks";
import { selectCurrentOrgSubscription } from "@/store/slices/subscriptionSlice";
import { useMemo } from "react";
import pricingData from "../../public/pricing.json";

export interface FeatureAccess {
  hasAccess: boolean;
  plan: string;
  feature: string;
  isLoading: boolean;
}

/**
 * Hook to check if current organization has access to a specific feature
 * @param featureId - The feature ID to check (matches pricing.json keys)
 * @returns Object with access status and plan info
 */
export function useFeatureAccess(featureId: string): FeatureAccess {
  const subscription = useAppSelector(selectCurrentOrgSubscription);

  const access = useMemo(() => {
    // If no subscription loaded yet, assume no access
    if (!subscription) {
      return {
        hasAccess: false,
        plan: "starter",
        feature: featureId,
        isLoading: true,
      };
    }

    const plan = subscription.subscription_plan || "starter";
    const planData = pricingData.plans[plan as keyof typeof pricingData.plans];

    if (!planData) {
      return {
        hasAccess: false,
        plan,
        feature: featureId,
        isLoading: false,
      };
    }

    const grants = planData.grants as Record<string, boolean | object>;
    const grant = grants[featureId];

    // Handle different grant types
    let hasAccess = false;
    if (typeof grant === "boolean") {
      hasAccess = grant;
    } else if (typeof grant === "object" && grant !== null) {
      // For objects like { enabled: true, allowance: 1 }
      hasAccess = (grant as { enabled?: boolean }).enabled === true;
    }

    return {
      hasAccess,
      plan,
      feature: featureId,
      isLoading: false,
    };
  }, [subscription, featureId]);

  return access;
}

/**
 * Hook to check multiple features at once
 */
export function useFeatureAccessBatch(featureIds: string[]): Record<string, FeatureAccess> {
  const subscription = useAppSelector(selectCurrentOrgSubscription);

  return useMemo(() => {
    const result: Record<string, FeatureAccess> = {};

    featureIds.forEach((featureId) => {
      if (!subscription) {
        result[featureId] = {
          hasAccess: false,
          plan: "starter",
          feature: featureId,
          isLoading: true,
        };
        return;
      }

      const plan = subscription.subscription_plan || "starter";
      const planData = pricingData.plans[plan as keyof typeof pricingData.plans];

      if (!planData) {
        result[featureId] = {
          hasAccess: false,
          plan,
          feature: featureId,
          isLoading: false,
        };
        return;
      }

      const grants = planData.grants as Record<string, boolean | object>;
      const grant = grants[featureId];

      let hasAccess = false;
      if (typeof grant === "boolean") {
        hasAccess = grant;
      } else if (typeof grant === "object" && grant !== null) {
        hasAccess = (grant as { enabled?: boolean }).enabled === true;
      }

      result[featureId] = {
        hasAccess,
        plan,
        feature: featureId,
        isLoading: false,
      };
    });

    return result;
  }, [subscription, featureIds]);
}
