import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PartnerInfo {
  partner_name: string;
  partner_logo_url?: string;
  partner_website?: string;
  cohort_name: string;
  plan_expires_at?: string;
}

interface PartnerBannerProps {
  organizationId: string;
  showPoweredBy?: boolean;
}

export default function PartnerBanner({ organizationId, showPoweredBy = true }: PartnerBannerProps) {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerInfo();
  }, [organizationId]);

  const loadPartnerInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_organizations')
        .select(`
          plan_expires_at,
          partner_cohorts!inner(
            name,
            partners!inner(
              name,
              logo_url,
              website
            )
          )
        `)
        .eq('organization_id', organizationId)
        .single();

      if (error || !data) {
        setPartnerInfo(null);
        return;
      }

      const cohort = data.partner_cohorts;
      const partner = cohort.partners;

      setPartnerInfo({
        partner_name: partner.name,
        partner_logo_url: partner.logo_url,
        partner_website: partner.website,
        cohort_name: cohort.name,
        plan_expires_at: data.plan_expires_at
      });
    } catch (error) {
      console.error('Error loading partner info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !partnerInfo || dismissed) {
    return null;
  }

  const isExpiringSoon = partnerInfo.plan_expires_at && 
    new Date(partnerInfo.plan_expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={`mb-4 border-l-4 ${isExpiringSoon ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {partnerInfo.partner_logo_url && (
              <img 
                src={partnerInfo.partner_logo_url} 
                alt={partnerInfo.partner_name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {partnerInfo.cohort_name} Cohort
                </span>
                <Badge variant="secondary" className="text-xs">
                  {isExpiringSoon ? 'Expiring Soon' : 'Active'}
                </Badge>
              </div>
              {showPoweredBy && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span>Powered by</span>
                  {partnerInfo.partner_website ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs font-medium"
                      onClick={() => window.open(partnerInfo.partner_website, '_blank')}
                    >
                      {partnerInfo.partner_name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <span className="font-medium">{partnerInfo.partner_name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {partnerInfo.plan_expires_at && (
              <span className="text-xs text-muted-foreground">
                Expires {new Date(partnerInfo.plan_expires_at).toLocaleDateString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="mt-3 p-3 bg-orange-100 rounded-md">
            <p className="text-sm text-orange-800">
              Your partner access expires soon. Contact your program coordinator or 
              <Button variant="link" className="h-auto p-0 ml-1 text-sm font-medium text-orange-800">
                upgrade to continue
              </Button>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}