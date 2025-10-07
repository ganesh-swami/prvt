import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lock, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { useGate } from '@/hooks/useGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'advanced';
  feature: string;
  connected: boolean;
}

const integrations: Integration[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Import website traffic and conversion data',
    icon: '📊',
    category: 'basic',
    feature: 'integrations.basic',
    connected: false
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync revenue and subscription metrics',
    icon: '💳',
    category: 'basic',
    feature: 'integrations.basic',
    connected: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Import CRM data and sales pipeline',
    icon: '🎯',
    category: 'basic',
    feature: 'integrations.basic',
    connected: false
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM integration with advanced analytics',
    icon: '☁️',
    category: 'advanced',
    feature: 'integrations.advanced',
    connected: false
  },
  {
    id: 'netsuite',
    name: 'NetSuite',
    description: 'ERP integration for financial data and reporting',
    icon: '🏢',
    category: 'advanced',
    feature: 'integrations.advanced',
    connected: false
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Data warehouse integration for custom analytics',
    icon: '❄️',
    category: 'advanced',
    feature: 'integrations.advanced',
    connected: false
  }
];

export const IntegrationsSettings: React.FC = () => {
  const { canAccess: canUseBasic } = useGate('integrations.basic');
  const { canAccess: canUseAdvanced } = useGate('integrations.advanced');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleIntegrationClick = (integration: Integration) => {
    const canAccess = integration.category === 'basic' ? canUseBasic : canUseAdvanced;
    
    if (!canAccess) {
      setSelectedIntegration(integration);
      setUpgradeContext(
        integration.category === 'basic' 
          ? 'Connect essential integrations like Google Analytics, Stripe, and HubSpot'
          : 'Access enterprise integrations including Salesforce, NetSuite, and Snowflake'
      );
      setShowUpgrade(true);
      return;
    }

    // Handle actual integration connection
    console.log('Connecting to', integration.name);
  };

  const basicIntegrations = integrations.filter(i => i.category === 'basic');
  const advancedIntegrations = integrations.filter(i => i.category === 'advanced');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations</h2>
        <p className="text-muted-foreground">Connect your tools to import data and automate workflows</p>
      </div>

      {/* Basic Integrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Essential Integrations</h3>
          {!canUseBasic && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <Lock className="h-3 w-3 mr-1" />
              Pro Required
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {basicIntegrations.map(integration => (
            <Card 
              key={integration.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${!canUseBasic ? 'opacity-60' : ''}`}
              onClick={() => handleIntegrationClick(integration)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div className="flex-1">
                    {integration.name}
                    {!canUseBasic && <Lock className="h-3 w-3 ml-2 inline text-amber-500" />}
                  </div>
                  {integration.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {integration.description}
                </p>
                <Button 
                  size="sm" 
                  variant={integration.connected ? "outline" : "default"}
                  disabled={!canUseBasic}
                  className="w-full"
                >
                  {integration.connected ? 'Configure' : 'Connect'}
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advanced Integrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Enterprise Integrations</h3>
          {!canUseAdvanced && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <Lock className="h-3 w-3 mr-1" />
              Business Required
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedIntegrations.map(integration => (
            <Card 
              key={integration.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${!canUseAdvanced ? 'opacity-60' : ''}`}
              onClick={() => handleIntegrationClick(integration)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div className="flex-1">
                    {integration.name}
                    {!canUseAdvanced && <Lock className="h-3 w-3 ml-2 inline text-amber-500" />}
                  </div>
                  {integration.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {integration.description}
                </p>
                <Button 
                  size="sm" 
                  variant={integration.connected ? "outline" : "default"}
                  disabled={!canUseAdvanced}
                  className="w-full"
                >
                  {integration.connected ? 'Configure' : 'Connect'}
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showUpgrade && selectedIntegration && (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature={`${selectedIntegration.name} Integration`}
          description={upgradeContext}
          requiredPlan={selectedIntegration.category === 'basic' ? 'pro' : 'business'}
        />
      )}
    </div>
  );
};