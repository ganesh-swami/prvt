import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, FileText, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PartnerStats {
  partner_id: string;
  partner_name: string;
  total_orgs: number;
  active_orgs: number;
  total_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  total_exports: number;
  upgrades: number;
  revenue_generated: number;
}

interface CohortDetail {
  id: string;
  name: string;
  cohort_code: string;
  seat_cap: number;
  used_seats: number;
  expiry_date?: string;
  organizations: Array<{
    id: string;
    name: string;
    joined_at: string;
    has_upgraded: boolean;
    last_active?: string;
  }>;
}

export default function PartnerDashboard() {
  const [stats, setStats] = useState<PartnerStats[]>([]);
  const [cohorts, setCohorts] = useState<CohortDetail[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load partner statistics
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          partner_organizations!inner(
            organization_id,
            has_upgraded,
            joined_at,
            organizations!inner(
              id,
              name,
              created_at,
              org_members!inner(
                user_id,
                users!inner(
                  id,
                  last_sign_in_at
                )
              )
            )
          )
        `);

      if (partnersError) throw partnersError;

      // Process partner stats
      const processedStats: PartnerStats[] = partnersData?.map(partner => {
        const orgs = partner.partner_organizations;
        const totalOrgs = orgs.length;
        const activeOrgs = orgs.filter(org => 
          org.organizations.org_members.some(member => 
            member.users.last_sign_in_at && 
            new Date(member.users.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          )
        ).length;

        const allUsers = orgs.flatMap(org => org.organizations.org_members);
        const totalUsers = allUsers.length;
        
        const weeklyActive = allUsers.filter(member =>
          member.users.last_sign_in_at &&
          new Date(member.users.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        const monthlyActive = allUsers.filter(member =>
          member.users.last_sign_in_at &&
          new Date(member.users.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        const upgrades = orgs.filter(org => org.has_upgraded).length;

        return {
          partner_id: partner.id,
          partner_name: partner.name,
          total_orgs: totalOrgs,
          active_orgs: activeOrgs,
          total_users: totalUsers,
          weekly_active_users: weeklyActive,
          monthly_active_users: monthlyActive,
          total_exports: 0, // Would need to track this separately
          upgrades,
          revenue_generated: upgrades * 49 // Rough estimate
        };
      }) || [];

      setStats(processedStats);

      // Load cohort details
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('partner_cohorts')
        .select(`
          id,
          name,
          cohort_code,
          seat_cap,
          expiry_date,
          partner_organizations(
            count
          ),
          partner_organizations!inner(
            organization_id,
            joined_at,
            has_upgraded,
            organizations!inner(
              id,
              name
            )
          )
        `);

      if (cohortsError) throw cohortsError;

      const processedCohorts: CohortDetail[] = cohortsData?.map(cohort => ({
        id: cohort.id,
        name: cohort.name,
        cohort_code: cohort.cohort_code,
        seat_cap: cohort.seat_cap,
        used_seats: cohort.partner_organizations?.length || 0,
        expiry_date: cohort.expiry_date,
        organizations: cohort.partner_organizations?.map(po => ({
          id: po.organizations.id,
          name: po.organizations.name,
          joined_at: po.joined_at,
          has_upgraded: po.has_upgraded
        })) || []
      })) || [];

      setCohorts(processedCohorts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({ title: 'Error loading dashboard', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partner Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(stat => (
              <Card key={stat.partner_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.partner_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{stat.total_orgs} orgs ({stat.active_orgs} active)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">MAU: {stat.monthly_active_users}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{stat.upgrades} upgrades</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cohorts.map(cohort => (
              <Card key={cohort.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <Badge variant={cohort.used_seats < cohort.seat_cap ? "default" : "secondary"}>
                      {cohort.used_seats}/{cohort.seat_cap} seats
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Code: {cohort.cohort_code}
                    {cohort.expiry_date && (
                      <span className="ml-4">
                        Expires: {new Date(cohort.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cohort.organizations.map(org => (
                      <div key={org.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{org.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Joined {new Date(org.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                        {org.has_upgraded && (
                          <Badge variant="secondary">Upgraded</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map(stat => (
                  <div key={stat.partner_id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{stat.partner_name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Users:</span>
                        <div className="font-medium">{stat.total_users}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">WAU:</span>
                        <div className="font-medium">{stat.weekly_active_users}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MAU:</span>
                        <div className="font-medium">{stat.monthly_active_users}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-medium">${stat.revenue_generated}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}