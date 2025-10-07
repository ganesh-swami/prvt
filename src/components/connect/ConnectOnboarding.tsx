import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CreatorAccount {
  id: string;
  stripe_account_id: string;
  onboarding_complete: boolean;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  status: string;
  take_rate_percent: number;
}

export const ConnectOnboarding: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [account, setAccount] = useState<CreatorAccount | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCreatorAccount();
    }
  }, [user]);

  const fetchCreatorAccount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('creator_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAccount(data);
    } catch (error) {
      console.error('Error fetching creator account:', error);
    }
  };

  const handleOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const action = account ? 'create_link' : 'create_account';
      const { data, error } = await supabase.functions.invoke('connect-onboarding', {
        body: {
          action,
          return_url: `${window.location.origin}/creator-portal`,
          refresh_url: `${window.location.origin}/creator-portal`
        }
      });

      if (error) throw error;

      if (data.account_id) {
        // Account created, refresh data
        await fetchCreatorAccount();
        toast({
          title: "Account Created",
          description: "Your Stripe account has been created. Complete onboarding to start receiving payouts."
        });
      }

      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: "Failed to start onboarding process.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!account) return <Badge variant="secondary">Not Started</Badge>;
    
    if (account.payouts_enabled) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    }
    
    if (account.details_submitted) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
    }
    
    return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Incomplete</Badge>;
  };

  const getNextStep = () => {
    if (!account) return "Create your Stripe account to start receiving payouts";
    if (!account.details_submitted) return "Complete your account setup with Stripe";
    if (!account.payouts_enabled) return "Your account is under review by Stripe";
    return "Your account is ready to receive payouts!";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payout Setup</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {getNextStep()}
          </p>
          
          {account && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenue Share:</span>
                <span className="font-medium">{100 - account.take_rate_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span className="font-medium">{account.take_rate_percent}%</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleOnboarding}
          disabled={loading || (account?.payouts_enabled)}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 
           !account ? 'Start Onboarding' :
           account.payouts_enabled ? 'Setup Complete' : 'Continue Setup'}
        </Button>

        {account?.payouts_enabled && (
          <p className="text-xs text-green-600 text-center">
            ✓ You're all set to receive payouts from template sales
          </p>
        )}
      </CardContent>
    </Card>
  );
};