import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CreditCard, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AIAnalystTopUpProps {
  onPurchaseComplete?: () => void;
  className?: string;
}

export const AIAnalystTopUp: React.FC<AIAnalystTopUpProps> = ({
  onPurchaseComplete,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          items: [{
            type: 'addon',
            id: 'ai_analyst_extra',
            quantity: 1
          }],
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
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-900">
                AI Analyst Credits Exhausted
              </h3>
              <p className="text-sm text-orange-700">
                Get 1M more credits to continue analysis
              </p>
            </div>
          </div>
          <Button
            onClick={handleTopUp}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            +1M Credits (€15)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};