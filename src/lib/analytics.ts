import type { FeatureKey } from "./pricing";

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp?: Date;
}

export function trackEvent(
  event: string,
  properties: Record<string, any> = {}
) {
  const eventData: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
  };

  // Send to Google Analytics if available
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, properties);
  }

  // Send to custom analytics endpoint
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  }).catch(console.error);

  // Log for development
  // if (process.env.NODE_ENV === "development") {
  //   console.log("Analytics Event:", eventData);
  // }
}

export const analytics = {
  gateDenied: (feature: string, planId: string, upgradeTo?: string[]) => {
    trackEvent("gate_denied", {
      feature,
      planId,
      upgradeTo: upgradeTo?.join(","),
    });
  },

  upgradePromptShown: (feature: string, planId: string) => {
    trackEvent("upgrade_prompt_shown", { feature, planId });
  },

  upgradeClicked: (targetPlan: string, feature?: string) => {
    trackEvent("upgrade_clicked", { targetPlan, feature });
  },

  trialStarted: (planId: string, days: number) => {
    trackEvent("trial_started", { planId, days });
  },

  subscriptionCreated: (
    planId: string,
    orgId: string,
    billingCycle: string
  ) => {
    trackEvent("subscription_created", { planId, orgId, billingCycle });
  },

  subscriptionCancelled: (planId: string, orgId: string, reason?: string) => {
    trackEvent("subscription_cancelled", { planId, orgId, reason });
  },

  featureUsed: (feature: string, planId: string, orgId: string) => {
    trackEvent("feature_used", { feature, planId, orgId });
  },

  limitConsumed: (
    feature: string,
    planId: string,
    orgId: string,
    current: number,
    limit: number
  ) => {
    trackEvent("limit_consumed", { feature, planId, orgId, current, limit });
  },

  checkoutCreated: (planId: string, billingCycle: string) => {
    trackEvent("checkout_created", { planId, billingCycle });
  },
};

// Global analytics declaration for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}
