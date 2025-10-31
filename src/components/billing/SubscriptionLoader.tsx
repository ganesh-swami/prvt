import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { fetchOrgSubscription, clearSubscription } from "@/store/slices/subscriptionSlice";

/**
 * Component that automatically loads subscription data when organization changes
 * Should be mounted at app level (in App.tsx)
 */
export function SubscriptionLoader() {
  const { currentOrganization, loading: authLoading } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If user has an organization, load its subscription
    if (currentOrganization?.id) {
      console.log("[SubscriptionLoader] Loading subscription for org:", currentOrganization.id);
      dispatch(fetchOrgSubscription(currentOrganization.id));
    } else {
      // No organization = clear subscription
      console.log("[SubscriptionLoader] No organization, clearing subscription");
      dispatch(clearSubscription());
    }
  }, [currentOrganization?.id, authLoading, dispatch]);

  // This component doesn't render anything
  return null;
}
