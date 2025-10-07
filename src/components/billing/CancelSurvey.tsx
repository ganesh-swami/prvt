import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Pause, TrendingDown, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CancelSurveyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  currentPlan: string;
}

const CANCEL_REASONS = [
  { value: 'price', label: 'Too expensive' },
  { value: 'value', label: 'Not getting enough value' },
  { value: 'budget', label: 'Budget constraints' },
  { value: 'missing_feature', label: 'Missing features I need' },
  { value: 'complexity', label: 'Too complex to use' },
  { value: 'competitor', label: 'Switching to competitor' },
  { value: 'other', label: 'Other reason' }
];

const ALTERNATIVES = [
  {
    id: 'downgrade_solo',
    title: 'Downgrade to Solo Plan',
    description: 'Keep essential features at $19/month',
    icon: <TrendingDown className="w-5 h-5" />,
    badge: 'Save 61%'
  },
  {
    id: 'downgrade_pro',
    title: 'Downgrade to Pro Plan', 
    description: 'Most features at $39/month',
    icon: <TrendingDown className="w-5 h-5" />,
    badge: 'Save 20%'
  },
  {
    id: 'pause_30',
    title: 'Pause for 30 Days',
    description: 'Take a break, resume anytime',
    icon: <Pause className="w-5 h-5" />,
    badge: 'Free'
  },
  {
    id: 'discount_20',
    title: '20% Off for 3 Months',
    description: 'Continue with current plan at reduced rate',
    icon: <Percent className="w-5 h-5" />,
    badge: '20% Off'
  }
];

export default function CancelSurvey({ open, onOpenChange, organizationId, currentPlan }: CancelSurveyProps) {
  const [step, setStep] = useState<'reason' | 'alternatives' | 'processing'>('reason');
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedAlternative, setSelectedAlternative] = useState('');
  const { toast } = useToast();

  const handleReasonSubmit = () => {
    if (!selectedReason) return;
    setStep('alternatives');
  };

  const handleAlternativeSelect = async (alternativeId: string) => {
    setSelectedAlternative(alternativeId);
    setStep('processing');

    try {
      // Save cancel survey
      await supabase.from('cancel_surveys').insert({
        organization_id: organizationId,
        reason: selectedReason,
        feedback: feedback,
        alternative_selected: alternativeId
      });

      // Track analytics
      await supabase.from('analytics_events').insert({
        event_type: 'cancel_reason',
        organization_id: organizationId,
        metadata: {
          reason: selectedReason,
          alternative: alternativeId,
          current_plan: currentPlan
        }
      });

      // Handle different alternatives
      switch (alternativeId) {
        case 'downgrade_solo':
        case 'downgrade_pro':
          const newPlan = alternativeId === 'downgrade_solo' ? 'solo' : 'pro';
          // Redirect to checkout for downgrade
          const { data } = await supabase.functions.invoke('stripe-checkout', {
            body: { 
              planId: newPlan, 
              billingCycle: 'monthly',
              orgId: organizationId,
              mode: 'change_plan'
            }
          });
          if (data?.url) window.location.href = data.url;
          break;

        case 'pause_30':
          // Pause subscription
          await supabase
            .from('organizations')
            .update({ 
              subscription_status: 'paused',
              pause_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', organizationId);
          toast({ title: 'Account paused for 30 days' });
          break;

        case 'discount_20':
          // Apply 20% discount coupon
          const { data: discountData } = await supabase.functions.invoke('stripe-checkout', {
            body: { 
              planId: currentPlan, 
              billingCycle: 'monthly',
              orgId: organizationId,
              couponCode: 'SAVE20'
            }
          });
          if (discountData?.url) window.location.href = discountData.url;
          break;

        default:
          // Proceed with cancellation
          toast({ title: 'Cancellation request submitted' });
          break;
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error processing cancel survey:', error);
      toast({ title: 'Error processing request', variant: 'destructive' });
    }
  };

  const handleSkipAlternatives = async () => {
    await handleAlternativeSelect('none');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'reason' && 'Before you go...'}
            {step === 'alternatives' && 'Wait! We have some options'}
            {step === 'processing' && 'Processing...'}
          </DialogTitle>
        </DialogHeader>

        {step === 'reason' && (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Help us improve by letting us know why you're cancelling.
            </p>
            
            <div>
              <Label className="text-base font-medium">What's the main reason?</Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-3">
                {CANCEL_REASONS.map(reason => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="font-normal">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="feedback">Additional feedback (optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="mt-2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleReasonSubmit} disabled={!selectedReason}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'alternatives' && (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Before cancelling, would any of these alternatives work for you?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALTERNATIVES.map(alternative => (
                <Card 
                  key={alternative.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAlternativeSelect(alternative.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {alternative.icon}
                        <CardTitle className="text-base">{alternative.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">{alternative.badge}</Badge>
                    </div>
                    <CardDescription>{alternative.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleSkipAlternatives}>
                No thanks, cancel anyway
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep my account
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Processing your request...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}