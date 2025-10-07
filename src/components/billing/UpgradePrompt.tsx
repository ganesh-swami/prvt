import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { analytics } from '@/lib/analytics';

interface UpgradePromptProps {
  plans: string[];
  feature?: string;
  showTrial?: boolean;
}

export function UpgradePrompt({ plans, feature, showTrial = true }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [trialStarted, setTrialStarted] = useState(false);

  const handleStartTrial = async () => {
    if (trialStarted) return;
    
    setLoading(true);
    analytics.upgradeClicked('trial_start', feature || 'unknown');
    
    try {
      // Start 14-day Pro trial
      const { error } = await supabase.functions.invoke('start-trial', {
        body: { planId: 'pro', days: 14 }
      });
      
      if (!error) {
        setTrialStarted(true);
        analytics.trialStarted('pro', 14);
        // Refresh page to show new features
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    analytics.upgradeClicked(planId, feature || 'unknown');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { planId, billingCycle: 'annual' }
      });
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setLoading(false);
    }
  };
  const planDetails = {
    pro: {
      name: 'Pro Team',
      price: '€49/month',
      features: [
        'Unlimited projects',
        'Team collaboration',
        'Advanced analytics',
        'Priority support'
      ]
    },
    business: {
      name: 'Business',
      price: '€99/month', 
      features: [
        'Everything in Pro',
        'Advanced integrations',
        'Custom branding',
        'Dedicated support'
      ]
    }
  };

  const recommendedPlan = plans[0];
  const plan = planDetails[recommendedPlan as keyof typeof planDetails];

  if (!plan) return null;

  return (
    <Card className="max-w-md mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">Unlock This Feature</CardTitle>
        <CardDescription>
          {feature ? `${feature} requires` : 'Upgrade to'} {plan.name} plan
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showTrial && !trialStarted && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Free Trial Available!</span>
            </div>
            <Button 
              onClick={handleStartTrial}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              {loading ? 'Starting...' : 'Start 14-Day Free Trial'}
            </Button>
          </div>
        )}

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
          <div className="text-sm text-gray-500">billed annually</div>
        </div>

        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => handleUpgrade(recommendedPlan)}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
        </Button>

        <div className="text-xs text-center text-gray-500 pt-2">
          Cancel anytime • No setup fees
        </div>
      </CardContent>
    </Card>
  );
}