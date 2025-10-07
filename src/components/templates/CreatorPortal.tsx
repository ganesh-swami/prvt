import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, DollarSign, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ConnectOnboarding } from '@/components/connect/ConnectOnboarding';
import { PayoutDashboard } from '@/components/connect/PayoutDashboard';

interface CreatorTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  price_cents: number;
  status: 'pending' | 'approved' | 'rejected';
  downloads: number;
  earnings_cents: number;
  created_at: string;
}

const categories = [
  'Pitch Deck',
  'GTM Strategy',
  'Financial Model',
  'Business Plan',
  'Investor Update',
  'Market Analysis'
];

export const CreatorPortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CreatorTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price_cents: 0,
    blueprint: '',
  });

  useEffect(() => {
    if (user) {
      fetchCreatorTemplates();
    }
  }, [user]);

  const fetchCreatorTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching creator templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let blueprint;
      try {
        blueprint = JSON.parse(formData.blueprint);
      } catch {
        toast({
          title: "Invalid Blueprint",
          description: "Please provide valid JSON for the template blueprint.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('templates').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        price_cents: formData.price_cents,
        blueprint,
        creator_id: user.id,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Template Submitted",
        description: "Your template has been submitted for review.",
      });

      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        price_cents: 0,
        blueprint: '',
      });

      fetchCreatorTemplates();
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: "Error",
        description: "Failed to submit template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const totalEarnings = templates.reduce((sum, template) => sum + (template.earnings_cents || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Creator Portal</h1>
          <p className="text-muted-foreground">
            Share your templates and earn 70% revenue share
          </p>
        </div>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="onboarding">Payout Setup</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="upload">Upload Template</TabsTrigger>
          <TabsTrigger value="templates">My Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatPrice(totalEarnings)}
                </div>
                <p className="text-sm text-muted-foreground">70% revenue share</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{templates.length}</div>
                <p className="text-sm text-muted-foreground">
                  {templates.filter(t => t.status === 'approved').length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {templates.reduce((sum, t) => sum + t.downloads, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total downloads</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          <ConnectOnboarding />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <PayoutDashboard />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Template</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new template to share with the community
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Template title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this template includes..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input
                      type="number"
                      value={formData.price_cents / 100}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                      })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="startup, pitch, funding (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Template Blueprint (JSON)</label>
                  <Textarea
                    value={formData.blueprint}
                    onChange={(e) => setFormData({ ...formData, blueprint: e.target.value })}
                    placeholder='{"sections": [], "data": {}}'
                    rows={8}
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide the JSON structure that will populate the template
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Template'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.title}
                        {getStatusIcon(template.status)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.category} • {formatPrice(template.price_cents)}
                      </p>
                    </div>
                    <Badge variant={
                      template.status === 'approved' ? 'default' :
                      template.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {template.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{template.description}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <span>{template.downloads} downloads</span>
                      <span>Earned: {formatPrice(template.earnings_cents || 0)}</span>
                    </div>
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates uploaded yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};