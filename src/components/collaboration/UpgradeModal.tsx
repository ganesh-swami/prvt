import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentPlan: string;
  upgradeTo: string[];
}

const planFeatures = {
  solo: {
    name: 'Solo',
    price: { monthly: 24, annual: 19 },
    features: ['3 Projects', 'Comments', 'PDF Export', '20 Exports/month'],
    popular: false
  },
  pro: {
    name: 'Pro Team',
    price: { monthly: 59, annual: 49 },
    features: ['Unlimited Projects', 'Team Tasks', '@Mentions', 'AI Analyst', 'Investor Room'],
    popular: true
  },
  business: {
    name: 'Business', 
    price: { monthly: 119, annual: 99 },
    features: ['Everything in Pro', 'Advanced Integrations', 'ESG Compliance', '1000 Exports/month'],
    popular: false
  }
};

export default function UpgradeModal({ 
  open, 
  onOpenChange, 
  feature, 
  currentPlan, 
  upgradeTo 
}: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planId,
          billingCycle,
          orgId: 'current-org-id' // Get from context in real app
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Unlock {feature}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {upgradeTo.map(planId => {
              const plan = planFeatures[planId as keyof typeof planFeatures];
              if (!plan) return null;

              return (
                <div 
                  key={planId}
                  className={`relative border rounded-lg p-6 ${
                    plan.popular ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-600">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        €{plan.price[billingCycle]}
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === 'annual' ? 'month' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-gray-500">
                        €{plan.price.annual * 12} billed annually
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleUpgrade(planId)}
                    disabled={loading === planId}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {loading === planId ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-gray-500">
            All plans include 14-day free trial • Cancel anytime
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}