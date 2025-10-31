import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import pricingData from "../../../public/pricing.json";

interface UpgradeRequiredProps {
  featureId: string;
  featureName: string;
  currentPlan: string;
  description?: string;
}

export function UpgradeRequired({
  featureId,
  featureName,
  currentPlan,
  description,
}: UpgradeRequiredProps) {
  const navigate = useNavigate();

  // Find which plans have this feature
  const availableInPlans: string[] = [];
  Object.entries(pricingData.plans).forEach(([planKey, planData]) => {
    const grants = planData.grants as Record<string, boolean | object>;
    const grant = grants[featureId];

    let hasAccess = false;
    if (typeof grant === "boolean") {
      hasAccess = grant;
    } else if (typeof grant === "object" && grant !== null) {
      hasAccess = (grant as { enabled?: boolean }).enabled === true;
    }

    if (hasAccess && planKey !== "starter") {
      availableInPlans.push(planData.name);
    }
  });

  // Get recommended plan (lowest tier that has this feature)
  const recommendedPlan = availableInPlans[0] || "Solo";

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
            <Lock className="h-10 w-10 text-purple-600" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Upgrade to Access {featureName}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {description || `This feature is available in higher-tier plans`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Plan Badge */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Current Plan:</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>

          {/* Available In */}
          {availableInPlans.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-center mb-3">
                <Sparkles className="inline h-4 w-4 mr-1 text-yellow-500" />
                Available in these plans:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableInPlans.map((plan) => (
                  <Badge
                    key={plan}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {plan}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-semibold text-center">
              Unlock Premium Features:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Access to {featureName} and advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Unlimited projects and exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Team collaboration features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Priority support and training</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => navigate("/pricing")}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              View All Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/pricing")}
              variant="outline"
              className="flex-1 h-12 text-base"
              size="lg"
            >
              Upgrade to {recommendedPlan}
            </Button>
          </div>

          {/* Contact Sales */}
          <p className="text-center text-sm text-muted-foreground">
            Need a custom plan?{" "}
            <a
              href="mailto:sales@pfstrategize.com"
              className="text-primary hover:underline font-medium"
            >
              Contact Sales
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
