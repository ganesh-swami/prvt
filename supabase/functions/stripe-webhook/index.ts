import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log("Processing webhook event:", event.type);

    // Log webhook event to database
    const { data: webhookLog, error: logError } = await supabase
      .from("webhook_events")
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_data: event as any,
        processing_status: "processing",
      })
      .select("id")
      .single();

    if (logError) {
      console.error("Error logging webhook event:", logError);
    }

    const webhookLogId = webhookLog?.id;

    try {
      // Handle events
      switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed:", session.id);

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determine plan from price ID or metadata
        const priceId = subscription.items.data[0].price.id;
        const planName =
          subscription.items.data[0].price.metadata.plan ||
          determinePlanFromPrice(priceId);
        const billingCycle =
          subscription.items.data[0].price.recurring?.interval || "month";

        // Get customer email
        const customerEmail =
          session.customer_email || session.customer_details?.email;

        // Calculate subscription dates
        const subscriptionStartDate = new Date(
          subscription.current_period_start * 1000
        );
        const subscriptionEndDate = new Date(
          subscription.current_period_end * 1000
        );
        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null;
        const cancelAtDate = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null;

        console.log("Subscription created:", {
          subscriptionId: subscription.id,
          customerId: session.customer,
          plan: planName,
          billingCycle,
          email: customerEmail,
          startDate: subscriptionStartDate,
          endDate: subscriptionEndDate,
        });

        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", customerEmail)
          .single();

        if (userError || !userData) {
          console.error("User not found for email:", customerEmail);
          break;
        }

        const userId = userData.id;

        // Strategy: Find or update existing organization
        // 1. Try to find by stripe_customer_id (existing subscription)
        // 2. If not found, find user's organization via org_members
        // 3. Update that organization with stripe details
        // 4. Only create new org if user has NO organization

        let orgId: string;
        let existingOrg = null;

        // First, try to find by stripe customer ID
        const { data: orgByStripe } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", session.customer)
          .single();

        if (orgByStripe) {
          existingOrg = orgByStripe;
        } else {
          // Try to find user's existing organization via org_members
          const { data: userOrgData } = await supabase
            .from("org_members")
            .select("org_id, organizations!inner(id, name)")
            .eq("user_id", userId)
            .eq("role", "owner")
            .single();

          if (userOrgData) {
            existingOrg = { id: userOrgData.org_id };
          }
        }

        if (existingOrg) {
          // Update existing organization with subscription details
          orgId = existingOrg.id;

          const { error: updateError } = await supabase
            .from("organizations")
            .update({
              subscription_plan: planName,
              subscription_status: subscription.status,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_period_end: subscriptionEndDate,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orgId);

          if (updateError) {
            console.error("Error updating organization:", updateError);
          } else {
            console.log("Updated existing organization:", orgId);
          }
        } else {
          // User has no organization - create new one (invited users case)
          const { data: newOrg, error: createError } = await supabase
            .from("organizations")
            .insert({
              name: `${customerEmail}'s Organization`,
              subscription_plan: planName,
              subscription_status: subscription.status,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_period_end: subscriptionEndDate,
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating organization:", createError);
            break;
          }

          orgId = newOrg.id;

          // Add user as owner
          await supabase.from("org_members").insert({
            org_id: orgId,
            user_id: userId,
            role: "owner",
          });

          console.log("Created new organization for invited user:", orgId);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);

        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (org) {
          const planName =
            subscription.items.data[0].price.metadata.plan ||
            determinePlanFromPrice(subscription.items.data[0].price.id);
          const billingCycle =
            subscription.items.data[0].price.recurring?.interval || "month";

          // Calculate subscription dates
          const subscriptionStartDate = new Date(
            subscription.current_period_start * 1000
          );
          const subscriptionEndDate = new Date(
            subscription.current_period_end * 1000
          );
          const cancelAtDate = subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null;

          await supabase
            .from("organizations")
            .update({
              subscription_plan: planName,
              subscription_status: subscription.status,
              subscription_period_end: subscriptionEndDate,
              updated_at: new Date().toISOString(),
            })
            .eq("id", org.id);

          console.log("Updated subscription status:", subscription.status);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);

        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (org) {
          await supabase
            .from("organizations")
            .update({
              subscription_plan: "starter",
              subscription_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", org.id);

          console.log("Downgraded to free plan");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment succeeded:", invoice.id);
        // Optional: Send receipt email, update payment history, etc.
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed:", invoice.id);

        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", invoice.customer as string)
          .single();

        if (org) {
          await supabase
            .from("organizations")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("id", org.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

      // Update webhook log status to success
      if (webhookLogId) {
        await supabase
          .from("webhook_events")
          .update({
            processing_status: "success",
            processed_at: new Date().toISOString(),
          })
          .eq("id", webhookLogId);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (processingError: any) {
      console.error("Error processing webhook:", processingError);
      
      // Update webhook log status to failed
      if (webhookLogId) {
        await supabase
          .from("webhook_events")
          .update({
            processing_status: "failed",
            error_message: processingError.message,
            processed_at: new Date().toISOString(),
          })
          .eq("id", webhookLogId);
      }

      return new Response(JSON.stringify({ error: processingError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

// Helper function to determine plan from price ID
// You'll need to map your actual Stripe price IDs here
function determinePlanFromPrice(priceId: string): string {
  // Map your actual price IDs to plan names
  const priceMap: Record<string, string> = {
    // Solo monthly/annual
    price_solo_monthly: "solo",
    price_solo_annual: "solo",
    // Pro Team monthly/annual
    price_pro_monthly: "pro-team",
    price_pro_annual: "pro-team",
    // Business monthly/annual
    price_business_monthly: "business",
    price_business_annual: "business",
  };

  return priceMap[priceId] || "solo";
}
