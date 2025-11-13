import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PlanCard } from "@/components/pricing/PlanCard";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { MarketplaceSection } from "@/components/pricing/MarketplaceSection";
import { loadPricing } from "@/lib/pricing";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentOrgSubscription } from "@/store/slices/subscriptionSlice";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Zap, Shield, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Stripe Price IDs - REPLACE WITH YOUR ACTUAL STRIPE PRICE IDs FROM DASHBOARD
const STRIPE_PRICE_IDS = {
  solo: {
    monthly: "price_1SOEKL1ve6OZ00bMVJIzrov7", // Replace with solo monthly price ID
    annual: "price_1SOEp31ve6OZ00bMQwnDc4hH", // Replace with solo annual price ID
  },
  "pro-team": {
    monthly: "price_1SOEOY1ve6OZ00bMyMyRttUE", // Replace with pro-team monthly price ID
    annual: "price_1SOEoj1ve6OZ00bMuOsHs4XG", // Replace with pro-team annual price ID
  },
  business: {
    monthly: "price_1SOEP01ve6OZ00bMI4KjSeT2", // Replace with business monthly price ID
    annual: "price_1SOEoP1ve6OZ00bMFzDRPKGm", // Replace with business annual price ID
  },
};

export function PricingModule() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, appUser, currentOrganization } = useAuth();
  const orgSubscription = useAppSelector(selectCurrentOrgSubscription);
  // Get current plan from Redux subscription state
  const currentPlan = orgSubscription?.subscription_plan || "starter";
  const subscription = {
    planId: currentPlan,
    addons: [],
  };

  useEffect(() => {
    const loadData = async () => {
      const pricingData = await loadPricing();
      setPricing(pricingData);
    };
    loadData();
  }, []);

  const handlePlanSelect = async (planKey: string) => {
    console.log("[Pricing] Creating checkout session", { planKey, isAnnual });

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the correct Stripe Price ID
      const billingCycle = isAnnual ? "annual" : "monthly";
      const priceId =
        STRIPE_PRICE_IDS[planKey as keyof typeof STRIPE_PRICE_IDS]?.[
          billingCycle
        ];

      if (!priceId || priceId.startsWith("price_xxx")) {
        toast({
          title: "Configuration Error",
          description:
            "Stripe price IDs not configured. Please update STRIPE_PRICE_IDS in PricingModule.tsx",
          variant: "destructive",
        });
        return;
      }

      console.log("[Pricing] Using price ID:", priceId);

      // Call Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke(
        "stripe-create-checkout",
        {
          body: {
            priceId,
            planKey,
            billingCycle,
            userEmail: user.email,
            userId: user.id,
            orgId: currentOrganization?.id,
          },
        }
      );

      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        console.log("[Pricing] Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pricing) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  const plans = Object.entries(pricing.plans).map(
    ([key, plan]: [string, any]) => ({
      key,
      name: plan.name,
      price: isAnnual ? plan.billing.annual : plan.billing.monthly,
      features: [
        `${
          plan.limits.projects_max === "unlimited"
            ? "Unlimited"
            : plan.limits.projects_max
        } Projects`,
        `${plan.limits.exports_per_month} Exports/month`,
        `Up to ${plan.limits.seats_max} team members`,
        ...(plan.grants["exports.ppt"] ? ["PowerPoint Export"] : []),
        ...(plan.grants["collab.tasks"] ? ["Team Collaboration"] : []),
        ...(plan.grants["ai.analyst"]?.enabled ? ["AI Analyst"] : []),
        ...(plan.grants["investor.room"] ? ["Investor Room"] : []),
      ],
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Choose Your Growth Plan
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Accelerate Your Business Strategy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to build, analyze, and scale your business with
            confidence. Choose the plan that fits your ambitions.
          </p>
          {isAnnual && (
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-700 px-4 py-2">
                <Crown className="h-4 w-4 mr-1" />
                Save up to 20% with annual billing
              </Badge>
            </div>
          )}
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="plans"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Subscription Plans
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Feature Comparison
            </TabsTrigger>
            {/* <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Template Marketplace
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="plans" className="space-y-8">
            <div className="flex justify-center mb-8">
              <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.key}
                  planKey={plan.key}
                  name={plan.name}
                  price={plan.price}
                  period={isAnnual ? "annual" : "monthly"}
                  features={plan.features}
                  isPopular={plan.key === "pro-team"}
                  isCurrentPlan={subscription.planId === plan.key}
                  onSelect={() => handlePlanSelect(plan.key)}
                  subscribedPlan={subscription.planId}
                />
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <p className="text-gray-500 mb-6">
                Trusted by innovative businesses worldwide
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">500+</div>
                <div className="text-sm text-gray-500">Active Users</div>
                <div className="text-2xl font-bold text-gray-400">50+</div>
                <div className="text-sm text-gray-500">Countries</div>
                <div className="text-2xl font-bold text-gray-400">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Feature Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeatureComparison />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Template Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarketplaceSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
