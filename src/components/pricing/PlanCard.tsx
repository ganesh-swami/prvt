import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

interface PlanCardProps {
  planKey: string;
  name: string;
  price: number;
  period: "monthly" | "annual";
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect: () => void;
  subscribedPlan?: string;
}

// Plan hierarchy: starter < solo < pro-team < business
const PLAN_HIERARCHY: Record<string, number> = {
  starter: 0,
  solo: 1,
  "pro-team": 2,
  business: 3,
};

function getButtonText(
  planKey: string,
  subscribedPlan: string | undefined,
  isCurrentPlan: boolean
): string | null {
  if (isCurrentPlan) {
    return "Current Plan";
  }

  if (!subscribedPlan) {
    return "Get Started";
  }

  const currentPlanLevel = PLAN_HIERARCHY[subscribedPlan] ?? -1;
  const targetPlanLevel = PLAN_HIERARCHY[planKey] ?? -1;

  if (targetPlanLevel > currentPlanLevel) {
    return "Upgrade";
  }

  return null; // Hide button for lower or same tier plans
}

export function PlanCard({
  planKey,
  name,
  price,
  period,
  features,
  isPopular,
  isCurrentPlan,
  onSelect,
  subscribedPlan,
}: PlanCardProps) {
  const buttonText = getButtonText(planKey, subscribedPlan, isCurrentPlan);

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-xl ${
        isPopular
          ? "border-2 border-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-105"
          : "border hover:border-blue-200"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="mt-6">
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            €{price}
          </span>
          <span className="text-muted-foreground text-lg">
            /{period === "annual" ? "year" : "month"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        {buttonText && (
          <Button
            className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
              isPopular
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                : ""
            }`}
            variant={
              isCurrentPlan ? "outline" : isPopular ? "default" : "outline"
            }
            onClick={onSelect}
            disabled={isCurrentPlan}
          >
            {buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
