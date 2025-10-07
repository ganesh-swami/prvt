import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { WorkspaceSubscription } from "@/lib/pricing";

export function useWorkspaceSubscription(): WorkspaceSubscription {
  const [subscription, setSubscription] = useState<WorkspaceSubscription>({ 
    planId: "starter", 
    addons: [] 
  });

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { data, error } = await supabase.functions.invoke('get-subscription');
        
        if (error) {
          console.error('Error fetching subscription:', error);
          return;
        }

        if (data) {
          setSubscription({
            planId: data.planId || "starter",
            addons: data.addons || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    }

    fetchSubscription();

    // Listen for subscription updates
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      setSubscription({
        planId: event.detail.subscription_plan || "starter",
        addons: []
      });
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate as EventListener);
    };
  }, []);

  return subscription;
}