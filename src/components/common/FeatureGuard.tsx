import { ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradeRequired } from "./UpgradeRequired";
import { Loader2 } from "lucide-react";

interface FeatureGuardProps {
  featureId: string;
  featureName: string;
  description?: string;
  children: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Wrapper component that protects features based on subscription plan
 * Shows UpgradeRequired screen if user doesn't have access
 */
export function FeatureGuard({
  featureId,
  featureName,
  description,
  children,
  loadingFallback,
}: FeatureGuardProps) {
  const { hasAccess, plan, isLoading } = useFeatureAccess(featureId);

  // Show loading state while checking access
  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show upgrade screen if no access
  if (!hasAccess) {
    return (
      <UpgradeRequired
        featureId={featureId}
        featureName={featureName}
        currentPlan={plan}
        description={description}
      />
    );
  }

  // User has access - render the protected content
  return <>{children}</>;
}
