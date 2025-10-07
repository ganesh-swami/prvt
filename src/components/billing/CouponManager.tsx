import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description?: string;
  usage_limit?: number;
  usage_count: number;
  expires_at?: string;
  active: boolean;
  created_at: string;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 0,
    description: '',
    usage_limit: '',
    expires_at: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      toast({ title: 'Error loading coupons', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const createCoupon = async () => {
    try {
      const couponData = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: form.value,
        description: form.description || null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expires_at: form.expires_at || null
      };

      const { error } = await supabase.from('coupons').insert([couponData]);
      if (error) throw error;

      toast({ title: 'Coupon created successfully' });
      setShowDialog(false);
      setForm({
        code: '',
        type: 'percent',
        value: 0,
        description: '',
        usage_limit: '',
        expires_at: ''
      });
      loadCoupons();
    } catch (error: any) {
      toast({ 
        title: 'Error creating coupon', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;
      toast({ title: `Coupon ${!active ? 'activated' : 'deactivated'}` });
      loadCoupons();
    } catch (error) {
      toast({ title: 'Error updating coupon', variant: 'destructive' });
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Coupon deleted' });
      loadCoupons();
    } catch (error) {
      toast({ title: 'Error deleting coupon', variant: 'destructive' });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied to clipboard' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                  />
                </div>
                <Button type="button" onClick={generateCode} className="mt-6">
                  Generate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={form.type} onValueChange={(value: 'percent' | 'fixed') => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">
                    Value {form.type === 'percent' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="20% off first month"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Expires At</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={createCoupon} className="w-full">
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {coupon.code}
                    </code>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`} off
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                    <span>Used: {coupon.usage_count}</span>
                    {coupon.usage_limit && <span>Limit: {coupon.usage_limit}</span>}
                    {coupon.expires_at && (
                      <span>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(coupon.code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={coupon.active ? "secondary" : "default"}
                    onClick={() => toggleCoupon(coupon.id, coupon.active)}
                  >
                    {coupon.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCoupon(coupon.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}