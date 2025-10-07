import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, Link } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

interface Cohort {
  id: string;
  partner_id: string;
  name: string;
  cohort_code: string;
  seat_cap: number;
  expiry_date?: string;
  plan_type: string;
  plan_duration_months: number;
  discount_percent: number;
  is_active: boolean;
  partner?: { name: string };
}

export default function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showCohortDialog, setShowCohortDialog] = useState(false);
  const { toast } = useToast();

  const [partnerForm, setPartnerForm] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    contact_email: ''
  });

  const [cohortForm, setCohortForm] = useState({
    partner_id: '',
    name: '',
    seat_cap: 25,
    expiry_date: '',
    plan_type: 'pro',
    plan_duration_months: 6,
    discount_percent: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [partnersRes, cohortsRes] = await Promise.all([
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_cohorts').select(`
          *,
          partner:partners(name)
        `).order('created_at', { ascending: false })
      ]);

      if (partnersRes.data) setPartners(partnersRes.data);
      if (cohortsRes.data) setCohorts(cohortsRes.data);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async () => {
    try {
      const { error } = await supabase.from('partners').insert([partnerForm]);
      if (error) throw error;

      toast({ title: 'Partner created successfully' });
      setShowPartnerDialog(false);
      setPartnerForm({ name: '', slug: '', logo_url: '', website: '', contact_email: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Error creating partner', variant: 'destructive' });
    }
  };

  const createCohort = async () => {
    try {
      const cohort_code = `${cohortForm.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      const { error } = await supabase.from('partner_cohorts').insert([{
        ...cohortForm,
        cohort_code
      }]);
      
      if (error) throw error;

      toast({ title: 'Cohort created successfully' });
      setShowCohortDialog(false);
      setCohortForm({
        partner_id: '',
        name: '',
        seat_cap: 25,
        expiry_date: '',
        plan_type: 'pro',
        plan_duration_months: 6,
        discount_percent: 0
      });
      loadData();
    } catch (error) {
      toast({ title: 'Error creating cohort', variant: 'destructive' });
    }
  };

  const generateInviteUrl = (cohortCode: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${cohortCode}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partner Management</h1>
        <div className="space-x-2">
          <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Partner</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Partner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Partner Name</Label>
                  <Input
                    id="name"
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={partnerForm.slug}
                    onChange={(e) => setPartnerForm({ ...partnerForm, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={partnerForm.contact_email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contact_email: e.target.value })}
                  />
                </div>
                <Button onClick={createPartner} className="w-full">Create Partner</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCohortDialog} onOpenChange={setShowCohortDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Users className="w-4 h-4 mr-2" />Create Cohort</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Cohort</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partner_id">Partner</Label>
                  <select
                    id="partner_id"
                    value={cohortForm.partner_id}
                    onChange={(e) => setCohortForm({ ...cohortForm, partner_id: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Partner</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cohort_name">Cohort Name</Label>
                  <Input
                    id="cohort_name"
                    value={cohortForm.name}
                    onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="seat_cap">Seat Capacity</Label>
                  <Input
                    id="seat_cap"
                    type="number"
                    value={cohortForm.seat_cap}
                    onChange={(e) => setCohortForm({ ...cohortForm, seat_cap: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={cohortForm.expiry_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, expiry_date: e.target.value })}
                  />
                </div>
                <Button onClick={createCohort} className="w-full">Create Cohort</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partners.map(partner => (
                <div key={partner.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">{partner.contact_email}</p>
                  </div>
                  <Badge variant={partner.is_active ? "default" : "secondary"}>
                    {partner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cohorts.map(cohort => (
                <div key={cohort.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{cohort.name}</h3>
                    <Badge variant={cohort.is_active ? "default" : "secondary"}>
                      {cohort.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Partner: {cohort.partner?.name}</p>
                    <p>Code: {cohort.cohort_code}</p>
                    <p>Seats: {cohort.seat_cap} | Plan: {cohort.plan_type}</p>
                    {cohort.expiry_date && (
                      <p>Expires: {new Date(cohort.expiry_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(generateInviteUrl(cohort.cohort_code))}
                    >
                      <Link className="w-3 h-3 mr-1" />Copy Invite URL
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}