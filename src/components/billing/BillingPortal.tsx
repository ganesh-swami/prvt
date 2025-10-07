import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Settings, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';
import { analytics } from '@/lib/analytics';
import { loadPricing, type PricingConfig } from '@/lib/pricing';
import DunningBanner from './DunningBanner';
import CancelSurvey from './CancelSurvey';

interface BillingPortalProps {
  organizationId: string;
}

export function BillingPortal({ organizationId }: BillingPortalProps) {
  const { subscription, loading } = useWorkspaceSubscription();
  const [showCancelSurvey, setShowCancelSurvey] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPricing().then(setPricing).catch(console.error);
  }, []);

  useEffect(() => {
    if (subscription?.stripe_customer_id) {
      loadInvoices();
    }
  }, [subscription]);

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-invoices', {
        body: { customer_id: subscription?.stripe_customer_id }
      });

      if (error) throw error;
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      analytics.track('payment_update_clicked', { source: 'billing_portal' });
      
      const { data, error } = await supabase.functions.invoke('billing-portal', {
        body: { 
          customer_id: subscription?.stripe_customer_id,
          return_url: window.location.href
        }
      });

      if (error) throw error;
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({ title: "Error", description: "Failed to open billing portal", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async (reason: string, feedback?: string) => {
    try {
      analytics.track('cancel_reason', { reason, has_feedback: !!feedback });
      
      await supabase.from('cancel_surveys').insert([{
        organization_id: organizationId,
        subscription_id: subscription?.id,
        reason,
        feedback
      }]);

      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscription_id: subscription?.stripe_subscription_id }
      });

      if (error) throw error;
      setShowCancelSurvey(false);
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    }
  };

  if (loading || !pricing) {
    return <div className="p-6">Loading billing information...</div>;
  }

  const currentPlan = subscription?.plan_id ? pricing.plans[subscription.plan_id] : Object.values(pricing.plans)[0];
  const isInGracePeriod = subscription?.status === 'past_due' && subscription?.grace_period_end;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, payment methods, and billing history</p>
      </div>

      {isInGracePeriod && (
        <DunningBanner
          gracePeriodEnd={subscription.grace_period_end}
          failedPaymentDate={subscription.failed_payment_date}
          onUpdatePayment={handleUpdatePayment}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan?.name}</h3>
              <Badge variant={subscription?.status === 'active' ? 'default' : 'destructive'}>
                {subscription?.status || 'inactive'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">€{currentPlan?.billing.monthly}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2 justify-between">
            <Button 
              onClick={handleUpdatePayment}
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payment
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowCancelSurvey(true)}
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <CancelSurvey
        isOpen={showCancelSurvey}
        onClose={() => setShowCancelSurvey(false)}
        onCancel={handleCancelSubscription}
        onAlternative={() => {}}
      />
    </div>
  );
}