import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowUp, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { loadPricing } from '@/lib/pricing';

interface SeatOverflowPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  currentSeats: number;
  maxSeats: number;
  onUpgradeComplete?: () => void;
}

export const SeatOverflowPaywall: React.FC<SeatOverflowPaywallProps> = ({
  isOpen,
  onClose,
  currentPlan,
  currentSeats,
  maxSeats,
  onUpgradeComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const [proration, setProration] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPricingData();
      calculateProration();
    }
  }, [isOpen, currentPlan]);

  const loadPricingData = async () => {
    try {
      const pricing = await loadPricing();
      setPricingData(pricing);
    } catch (error) {
      console.error('Failed to load pricing:', error);
    }
  };

  const calculateProration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planId: getUpgradePlan(),
          preview: true
        }
      });

      if (error) throw error;
      setProration(data?.proration || 0);
    } catch (error) {
      console.error('Failed to calculate proration:', error);
    }
  };

  const getUpgradePlan = () => {
    switch (currentPlan.toLowerCase()) {
      case 'solo':
      case 'pro':
        return 'business';
      case 'business':
        return 'enterprise';
      default:
        return 'business';
    }
  };

  const getUpgradePlanName = () => {
    const plan = getUpgradePlan();
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getNewSeatLimit = () => {
    const upgradePlan = getUpgradePlan();
    if (!pricingData) return 'More';
    
    const planData = pricingData.plans.find((p: any) => p.id === upgradePlan);
    return planData?.limits?.seats_max || 'Unlimited';
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planId: getUpgradePlan(),
          successUrl: window.location.href,
          cancelUrl: window.location.href
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Seat Limit Reached</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {currentSeats}/{maxSeats}
                </div>
                <p className="text-sm text-red-700">
                  You've reached your seat limit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center">
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade to {getUpgradePlanName()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">New seat limit:</span>
                <span className="font-medium text-green-800">
                  {getNewSeatLimit()} seats
                </span>
              </div>
              
              {proration !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Prorated today:</span>
                  <span className="font-medium text-green-800">
                    €{(proration / 100).toFixed(2)}
                  </span>
                </div>
              )}

              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 mr-2" />
                )}
                Upgrade Now
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500 text-center">
            You'll be able to invite more team members immediately after upgrading.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};