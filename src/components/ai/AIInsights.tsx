import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { AIAnalystTopUp } from './AIAnalystTopUp';
import { checkUsageLimit } from '@/lib/usageCounters';

interface AIInsightsProps {
  type: 'swot_analysis' | 'financial_analysis' | 'pricing_strategy';
  data: any;
  context?: string;
  className?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  type,
  data,
  context,
  className = ''
}) => {
  const [insight, setInsight] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasInsight, setHasInsight] = useState(false);
  const [creditsExhausted, setCreditsExhausted] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    setCreditsExhausted(false);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-insights', {
        body: { type, data, context }
      });

      if (error) {
        if (error.message?.includes('credits') || error.message?.includes('limit')) {
          setCreditsExhausted(true);
          return;
        }
        throw error;
      }

      setInsight(result.insight);
      setSuggestions(result.suggestions || []);
      setConfidence(result.confidence || 0);
      setHasInsight(true);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsight('Unable to generate insights at this time. Please try again later.');
      setHasInsight(true);
    }
    setLoading(false);
  };

  const getInsightTypeLabel = () => {
    switch (type) {
      case 'swot_analysis':
        return 'SWOT Analysis';
      case 'financial_analysis':
        return 'Financial Analysis';
      case 'pricing_strategy':
        return 'Pricing Strategy';
      default:
        return 'AI Analysis';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>AI Insights: {getInsightTypeLabel()}</span>
          </CardTitle>
          {confidence > 0 && (
            <Badge variant="secondary">
              {Math.round(confidence * 100)}% Confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {creditsExhausted && (
          <AIAnalystTopUp 
            onPurchaseComplete={() => {
              setCreditsExhausted(false);
              generateInsight();
            }}
          />
        )}
        {!hasInsight ? (
          <Button
            onClick={generateInsight}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {insight}
              </div>
            </div>

            {suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">
                  Recommended Actions:
                </h4>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={generateInsight}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Refresh Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};