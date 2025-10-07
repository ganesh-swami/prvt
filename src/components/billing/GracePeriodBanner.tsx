import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface GracePeriodBannerProps {
  gracePeriodEnd: string;
  onUpdatePayment: () => void;
}

export default function GracePeriodBanner({ gracePeriodEnd, onUpdatePayment }: GracePeriodBannerProps) {
  const daysLeft = Math.ceil((new Date(gracePeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const handleUpdatePayment = () => {
    analytics.upgradeClicked('grace_period_banner', 'payment_update');
    onUpdatePayment();
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-orange-800">
          <strong>Payment Failed</strong> - Your account is in a grace period. 
          You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to update your payment method.
        </div>
        <Button 
          size="sm" 
          onClick={handleUpdatePayment}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Update Payment
        </Button>
      </AlertDescription>
    </Alert>
  );
}