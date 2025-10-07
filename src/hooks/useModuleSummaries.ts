import { useState, useEffect } from 'react';

export interface ModuleSummary {
  id: string;
  name: string;
  lastUpdated: string;
  keyMetrics: Record<string, any>;
  status: 'active' | 'draft' | 'completed';
  data?: any;
}

export const useModuleSummaries = () => {
  const [summaries, setSummaries] = useState<ModuleSummary[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would fetch from various modules
    const mockSummaries: ModuleSummary[] = [
      {
        id: 'financial-modeler',
        name: 'Financial Modeler',
        lastUpdated: '2024-01-15',
        status: 'active',
        keyMetrics: {
          revenue: 450000,
          expenses: 320000,
          profit: 130000,
          growth: 15.2
        },
        data: {
          projections: [
            { period: 'Q1 2024', revenue: 450000, expenses: 320000 },
            { period: 'Q2 2024', revenue: 520000, expenses: 350000 }
          ]
        }
      },
      {
        id: 'market-sizing',
        name: 'Market Sizing',
        lastUpdated: '2024-01-12',
        status: 'completed',
        keyMetrics: {
          tam: 50000000000,
          sam: 5000000000,
          som: 500000000,
          marketShare: 0.1
        },
        data: {
          segments: [
            { name: 'Enterprise', size: 2000000000 },
            { name: 'SMB', size: 3000000000 }
          ]
        }
      },
      {
        id: 'competitor-analysis',
        name: 'Competitor Analysis',
        lastUpdated: '2024-01-10',
        status: 'active',
        keyMetrics: {
          competitorsAnalyzed: 8,
          avgPricing: 299,
          marketPosition: 'Strong',
          differentiationScore: 8.5
        },
        data: {
          competitors: [
            { name: 'Competitor A', pricing: 399, marketShare: 25 },
            { name: 'Competitor B', pricing: 199, marketShare: 15 }
          ]
        }
      },
      {
        id: 'unit-economics',
        name: 'Unit Economics',
        lastUpdated: '2024-01-08',
        status: 'active',
        keyMetrics: {
          ltv: 2400,
          cac: 150,
          ltvCacRatio: 16,
          paybackPeriod: 3.2
        }
      },
      {
        id: 'risk-center',
        name: 'Risk Center',
        lastUpdated: '2024-01-05',
        status: 'draft',
        keyMetrics: {
          totalRisks: 12,
          highRisks: 3,
          mitigatedRisks: 7,
          riskScore: 6.8
        }
      }
    ];

    setSummaries(mockSummaries);
  }, []);

  const getSummaryById = (id: string) => {
    return summaries.find(s => s.id === id);
  };

  const updateSummary = (id: string, updates: Partial<ModuleSummary>) => {
    setSummaries(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : s
    ));
  };

  return {
    summaries,
    getSummaryById,
    updateSummary
  };
};