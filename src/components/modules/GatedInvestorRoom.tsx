import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Target, Lock } from 'lucide-react';
import { useGate } from '@/hooks/useGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const GatedInvestorRoom: React.FC = () => {
  const { user } = useAuth();
  const { canAccess, allowanceRemaining, bumpUsage } = useGate('investor.room');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [updateContent, setUpdateContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUpdate, setGeneratedUpdate] = useState('');

  const handleGenerateUpdate = async () => {
    if (!canAccess) {
      setShowUpgrade(true);
      return;
    }

    if (allowanceRemaining !== null && allowanceRemaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Generate investor update using AI
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          prompt: `Generate a professional investor update based on this content: ${updateContent}`,
          type: 'investor_update'
        }
      });

      if (error) throw error;

      setGeneratedUpdate(data.content);
      
      // Bump usage counter
      if (user?.organization_id) {
        await bumpUsage(user.organization_id, 'investor.room', 1);
      }
    } catch (error) {
      console.error('Error generating investor update:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investor Room</h2>
          <p className="text-muted-foreground">Generate professional investor updates and materials</p>
        </div>
        {allowanceRemaining !== null && (
          <Badge variant="outline">
            {allowanceRemaining} updates remaining
          </Badge>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+34%</div>
            <p className="text-xs text-muted-foreground">vs last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">+18% MoM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€540K</div>
            <p className="text-xs text-muted-foreground">+42% YoY</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Runway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18mo</div>
            <p className="text-xs text-muted-foreground">at current burn</p>
          </CardContent>
        </Card>
      </div>

      {/* Update Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Investor Update</CardTitle>
          <CardDescription>
            Create professional investor updates with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter key highlights, metrics, and updates to include in your investor communication..."
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            rows={4}
          />
          
          <Button 
            onClick={handleGenerateUpdate}
            disabled={isGenerating || !updateContent.trim()}
            className="w-full"
          >
            {!canAccess && <Lock className="h-4 w-4 mr-2" />}
            {isGenerating ? 'Generating Update...' : 'Generate Professional Update'}
          </Button>

          {generatedUpdate && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">Generated Investor Update:</h4>
              <div className="whitespace-pre-wrap text-sm">{generatedUpdate}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {showUpgrade && (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature="Investor Room"
          description="Generate unlimited professional investor updates with AI assistance"
          requiredPlan="pro"
        />
      )}
    </div>
  );
};