export type FeatureKey =
  | "projects.core"
  | "collab.tasks"
  | "collab.comments"
  | "collab.mentions"
  | "collab.notifications"
  | "integrations.basic"
  | "integrations.advanced"
  | "investor.room"
  | "models.scenarios"
  | "esg.compliance"
  | "exports.pdf"
  | "exports.ppt"
  | "ai.analyst";

type Grant = boolean | { enabled: boolean; allowance?: number | "unlimited" | string };

export interface Plan {
  name: string;
  seat_pricing: boolean;
  public?: boolean;
  billing: { monthly: number; annual: number };
  limits: {
    seats_max?: number | "unlimited";
    viewer_seats_free?: number | "unlimited";
    projects_max?: number | "unlimited";
    exports_per_month?: number | "unlimited";
    storage_items_max?: number | "unlimited";
    integrations_max?: number | "unlimited";
  };
  grants: Record<FeatureKey, Grant>;
  addons_included?: string[];
}

export interface PricingConfig {
  currency: "EUR" | "USD" | "GBP";
  features: Record<string, { label: string; description?: string }>;
  plans: Record<string, Plan>;
  addons?: Record<
    string,
    { name: string; billing: { monthly: number; annual: number }; grants: Record<FeatureKey, Grant> }
  >;
}

export async function loadPricing(): Promise<PricingConfig> {
  const res = await fetch("/pricing.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load pricing.json");
  return res.json();
}

export type WorkspaceSubscription = {
  planId: keyof PricingConfig["plans"];
  addons?: string[];
};

export type GateResult =
  | { allowed: true; allowance?: number | "unlimited" | string; source: "plan" | "addon" }
  | { allowed: false; reason: "not-granted" | "limit-reached"; upgradeTo?: string[] };

function evalGrant(grant: Grant): { allowed: boolean; allowance?: any } {
  if (typeof grant === "boolean") return { allowed: grant };
  return { allowed: grant.enabled, allowance: grant.allowance };
}

export function canUseFeature(
  cfg: PricingConfig,
  sub: WorkspaceSubscription,
  feature: FeatureKey
): GateResult {
  const plan = cfg.plans[sub.planId];
  if (!plan) return { allowed: false, reason: "not-granted", upgradeTo: ["pro"] };

  const planGrant = plan.grants[feature];
  if (planGrant !== undefined) {
    const g = evalGrant(planGrant);
    if (g.allowed) return { allowed: true, allowance: g.allowance, source: "plan" };
  }

  for (const addonId of sub.addons ?? []) {
    const addon = cfg.addons?.[addonId];
    if (!addon) continue;
    const addonGrant = addon.grants[feature];
    if (addonGrant !== undefined) {
      const g = evalGrant(addonGrant);
      if (g.allowed) return { allowed: true, allowance: g.allowance, source: "addon" };
    }
  }

  const eligiblePlans = Object.entries(cfg.plans)
    .filter(([_, p]) => p.public !== false && evalGrant((p.grants as any)[feature] ?? false).allowed)
    .map(([id]) => id);

  return { allowed: false, reason: "not-granted", upgradeTo: eligiblePlans };
}