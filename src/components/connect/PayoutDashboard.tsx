import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  template_id: string;
  gross_amount_cents: number;
  platform_fee_cents: number;
  seller_net_cents: number;
  status: string;
  payout_scheduled_at: string | null;
  payout_paid_at: string | null;
  created_at: string;
  templates: {
    title: string;
  };
}

export const PayoutDashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_transactions')
        .select(`
          *,
          templates(title)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  const getStatusIcon = (transaction: Transaction) => {
    if (transaction.payout_paid_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (transaction.payout_scheduled_at) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (transaction: Transaction) => {
    if (transaction.payout_paid_at) return 'Paid';
    if (transaction.payout_scheduled_at) return 'Scheduled';
    return 'Pending';
  };

  const totalEarnings = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.seller_net_cents, 0);

  const pendingPayouts = transactions
    .filter(t => t.status === 'succeeded' && !t.payout_paid_at)
    .reduce((sum, t) => sum + t.seller_net_cents, 0);

  const paidOut = transactions
    .filter(t => t.payout_paid_at)
    .reduce((sum, t) => sum + t.seller_net_cents, 0);

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-sm text-muted-foreground">From {transactions.length} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(pendingPayouts)}</div>
            <p className="text-sm text-muted-foreground">Next payout: Weekly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(paidOut)}</div>
            <p className="text-sm text-muted-foreground">Successfully transferred</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payout Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{transaction.templates?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(transaction)}
                      <Badge variant={
                        transaction.payout_paid_at ? 'default' :
                        transaction.payout_scheduled_at ? 'secondary' : 'outline'
                      }>
                        {getStatusText(transaction)}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold">
                      {formatPrice(transaction.seller_net_cents)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gross: {formatPrice(transaction.gross_amount_cents)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Payout Frequency:</span>
                  <Badge>Weekly</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Next Payout:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Amount:</span>
                  <span className="font-bold">{formatPrice(pendingPayouts)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};