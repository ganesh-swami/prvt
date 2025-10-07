import { canUseFeature, type PricingConfig, type WorkspaceSubscription } from './pricing';

const mockConfig: PricingConfig = {
  currency: 'EUR',
  features: {
    'projects.core': { label: 'Core Projects' },
    'collab.tasks': { label: 'Tasks' },
    'collab.comments': { label: 'Comments' },
    'ai.analyst': { label: 'AI Analyst' }
  },
  plans: {
    starter: {
      name: 'Starter',
      seat_pricing: false,
      billing: { monthly: 0, annual: 0 },
      limits: { projects_max: 1 },
      grants: {
        'projects.core': true,
        'collab.tasks': false,
        'collab.comments': false,
        'ai.analyst': false
      } as any
    },
    pro: {
      name: 'Pro',
      seat_pricing: true,
      billing: { monthly: 49, annual: 39 },
      limits: { projects_max: 'unlimited' },
      grants: {
        'projects.core': true,
        'collab.tasks': true,
        'collab.comments': true,
        'ai.analyst': { enabled: true, allowance: 1000 }
      } as any
    }
  },
  addons: {}
};

describe('Pricing System', () => {
  test('starter plan cannot use collaboration features', () => {
    const sub: WorkspaceSubscription = { planId: 'starter', addons: [] };
    
    const tasksResult = canUseFeature(mockConfig, sub, 'collab.tasks');
    const commentsResult = canUseFeature(mockConfig, sub, 'collab.comments');
    
    expect(tasksResult.allowed).toBe(false);
    expect(commentsResult.allowed).toBe(false);
    expect(tasksResult.upgradeTo).toContain('pro');
  });

  test('pro plan can use all features', () => {
    const sub: WorkspaceSubscription = { planId: 'pro', addons: [] };
    
    const tasksResult = canUseFeature(mockConfig, sub, 'collab.tasks');
    const aiResult = canUseFeature(mockConfig, sub, 'ai.analyst');
    
    expect(tasksResult.allowed).toBe(true);
    expect(aiResult.allowed).toBe(true);
    expect(aiResult.allowance).toBe(1000);
  });

  test('handles invalid plan gracefully', () => {
    const sub: WorkspaceSubscription = { planId: 'invalid' as any, addons: [] };
    
    const result = canUseFeature(mockConfig, sub, 'collab.tasks');
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not-granted');
  });

  test('addon grants override plan restrictions', () => {
    const configWithAddons = {
      ...mockConfig,
      addons: {
        'ai_boost': {
          name: 'AI Boost',
          billing: { monthly: 15, annual: 15 },
          grants: { 'ai.analyst': { enabled: true, allowance: 5000 } }
        }
      }
    };

    const sub: WorkspaceSubscription = { planId: 'starter', addons: ['ai_boost'] };
    
    const result = canUseFeature(configWithAddons, sub, 'ai.analyst');
    
    expect(result.allowed).toBe(true);
    expect(result.allowance).toBe(5000);
    expect(result.source).toBe('addon');
  });
});