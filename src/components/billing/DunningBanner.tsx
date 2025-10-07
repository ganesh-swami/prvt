import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CreditCard, Clock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DunningInfo {
  status: 'grace_period' | 'past_due' | 'unpaid';
  days_remaining: number;
  amount_due: number;
  next_attempt?: string;
  payment_method_failed: boolean;
}

interface DunningBannerProps {
  organizationId: string;
}

export default function DunningBanner({ organizationId }: DunningBannerProps) {
  const [dunningInfo, setDunningInfo] = useState<DunningInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDunningInfo();
  }, [organizationId]);

  const loadDunningInfo = async () => {
    try {
      // This would typically come from Stripe webhook data stored in the database
      // For now, we'll simulate the dunning state
      const { data: org, error } = await supabase
        .from('organizations')
        .select('subscription_status, plan_expires_at')
        .eq('id', organizationId)
        .single();

      if (error || !org) return;

      // Simulate dunning logic based on subscription status
      if (org.subscription_status === 'past_due') {
        const expiresAt = new Date(org.plan_expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 7 && daysRemaining > 0) {
          setDunningInfo({
            status: 'grace_period',
            days_remaining: daysRemaining,
            amount_due: 49, // Example amount
            payment_method_failed: true
          });
        } else if (daysRemaining <= 0) {
          setDunningInfo({
            status: 'unpaid',
            days_remaining: Math.abs(daysRemaining),
            amount_due: 49,
            payment_method_failed: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading dunning info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      // Track analytics event
      await supabase.from('analytics_events').insert({
        event_type: 'dunning_update_payment_clicked',
        organization_id: organizationId,
        metadata: {
          status: dunningInfo?.status,
          days_remaining: dunningInfo?.days_remaining
        }
      });

      // Redirect to billing portal
      const { data, error } = await supabase.functions.invoke('billing-portal', {
        body: { organizationId }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({ title: 'Error opening billing portal', variant: 'destructive' });
    }
  };

  const handleDismiss = async () => {
    setDismissed(true);
    
    // Track dismissal
    await supabase.from('analytics_events').insert({
      event_type: 'dunning_banner_dismissed',
      organization_id: organizationId,
      metadata: {
        status: dunningInfo?.status,
        days_remaining: dunningInfo?.days_remaining
      }
    });
  };

  if (loading || !dunningInfo || dismissed) {
    return null;
  }

  const getUrgencyLevel = () => {
    if (dunningInfo.status === 'unpaid') return 'critical';
    if (dunningInfo.days_remaining <= 1) return 'urgent';
    if (dunningInfo.days_remaining <= 3) return 'warning';
    return 'info';
  };

  const urgency = getUrgencyLevel();

  const getBannerStyles = () => {
    switch (urgency) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'urgent':
        return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-900';
    }
  };

  const getIcon = () => {
    switch (urgency) {
      case 'critical':
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getMessage = () => {
    if (dunningInfo.status === 'unpaid') {
      return `Your account is ${dunningInfo.days_remaining} days overdue. Update your payment method to restore access.`;
    }
    return `Payment failed. Your account will be suspended in ${dunningInfo.days_remaining} day${dunningInfo.days_remaining !== 1 ? 's' : ''}.`;
  };

  return (
    <Alert className={`mb-4 ${getBannerStyles()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div className="flex-1">
            <AlertDescription className="font-medium">
              {getMessage()}
            </AlertDescription>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="secondary" className="text-xs">
                Amount due: ${dunningInfo.amount_due}
              </Badge>
              {dunningInfo.next_attempt && (
                <span className="text-xs text-muted-foreground">
                  Next attempt: {new Date(dunningInfo.next_attempt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleUpdatePayment}
            className={urgency === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}