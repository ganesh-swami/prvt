import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function SubscriptionSync() {
  const { appUser, currentOrganization } = useAuth();

  useEffect(() => {
    if (!appUser || !currentOrganization?.id) return;

    // Listen for subscription changes
    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "organizations",
          filter: `id=eq.${currentOrganization.id}`,
        },
        (payload) => {
          // Trigger a refresh of subscription data
          window.dispatchEvent(
            new CustomEvent("subscription-updated", {
              detail: payload.new,
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser, currentOrganization?.id]);

  return null;
}
