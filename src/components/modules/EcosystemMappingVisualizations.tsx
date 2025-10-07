import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Info, Network, Users, Target, Handshake, DollarSign, Zap, Building2 } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  relationship: 'Supportive' | 'Neutral' | 'Opposing';
  description: string;
}

interface EcosystemVisualizationsProps {
  stakeholders: Stakeholder[];
}

const EcosystemMappingVisualizations: React.FC<EcosystemVisualizationsProps> = ({ stakeholders }) => {
  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'Key Actor': return Users;
      case 'Customer': return Target;
      case 'Partner': return Handshake;
      case 'Funder': return DollarSign;
      case 'Competitor': return Zap;
      case 'Sector': return Building2;
      default: return Network;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'Supportive': return 'bg-green-100 text-green-800 border-green-200';
      case 'Neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Opposing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInfluenceSize = (influence: string) => {
    switch (influence) {
      case 'High': return 'w-16 h-16';
      case 'Medium': return 'w-12 h-12';
      case 'Low': return 'w-8 h-8';
      default: return 'w-12 h-12';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Ecosystem Network Map</CardTitle>
            <CustomTooltip content="Visual representation of stakeholder relationships and positioning. Larger nodes indicate higher influence, colors represent relationship types. This helps identify key players and relationship dynamics for strategic planning.">
              <Info className="h-4 w-4 text-muted-foreground" />
            </CustomTooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 min-h-96">
            {/* Central Node - Your Venture */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                Your Venture
              </div>
            </div>

            {/* Stakeholder Nodes */}
            {stakeholders.map((stakeholder, index) => {
              const Icon = getStakeholderIcon(stakeholder.type);
              const angle = (index * 360) / stakeholders.length;
              const radius = 120;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <div
                  key={stakeholder.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                >
                  <div className={`${getInfluenceSize(stakeholder.influence)} ${getRelationshipColor(stakeholder.relationship)} rounded-full flex items-center justify-center shadow-md border-2 cursor-pointer hover:shadow-lg transition-shadow`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs text-center mt-1 max-w-20 truncate">
                    {stakeholder.name}
                  </div>
                  
                  {/* Connection Line */}
                  <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: Math.abs(x) + 50, height: Math.abs(y) + 50 }}>
                    <line
                      x1={x > 0 ? 0 : Math.abs(x)}
                      y1={y > 0 ? 0 : Math.abs(y)}
                      x2={x > 0 ? Math.abs(x) : 0}
                      y2={y > 0 ? Math.abs(y) : 0}
                      stroke={stakeholder.relationship === 'Supportive' ? '#10b981' : stakeholder.relationship === 'Opposing' ? '#ef4444' : '#6b7280'}
                      strokeWidth="1"
                      strokeDasharray={stakeholder.relationship === 'Neutral' ? '5,5' : '0'}
                      opacity="0.5"
                    />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Supportive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Opposing</span>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span>Size = Influence Level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Power-Interest Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Power-Interest Grid</CardTitle>
            <CustomTooltip content="Strategic positioning matrix showing stakeholder influence vs interest levels. High power/high interest stakeholders require active management, while low power/low interest need minimal monitoring. This guides engagement priority and resource allocation.">
              <Info className="h-4 w-4 text-muted-foreground" />
            </CustomTooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 h-80">
            {/* Headers */}
            <div></div>
            <div className="text-center font-medium text-sm">Low Interest</div>
            <div className="text-center font-medium text-sm">Medium Interest</div>
            <div className="text-center font-medium text-sm">High Interest</div>
            
            {/* High Power Row */}
            <div className="flex items-center justify-center font-medium text-sm transform -rotate-90">High Power</div>
            {['Low', 'Medium', 'High'].map((interest) => (
              <div key={`High-${interest}`} className="border rounded p-2 bg-red-50 min-h-16">
                <div className="text-xs font-medium mb-1">Manage Closely</div>
                {stakeholders
                  .filter(s => s.influence === 'High' && s.interest === interest)
                  .map(s => (
                    <Badge key={s.id} variant="secondary" className="text-xs mr-1 mb-1">
                      {s.name}
                    </Badge>
                  ))}
              </div>
            ))}

            {/* Medium Power Row */}
            <div className="flex items-center justify-center font-medium text-sm transform -rotate-90">Medium Power</div>
            {['Low', 'Medium', 'High'].map((interest) => (
              <div key={`Medium-${interest}`} className="border rounded p-2 bg-yellow-50 min-h-16">
                <div className="text-xs font-medium mb-1">Keep Satisfied</div>
                {stakeholders
                  .filter(s => s.influence === 'Medium' && s.interest === interest)
                  .map(s => (
                    <Badge key={s.id} variant="secondary" className="text-xs mr-1 mb-1">
                      {s.name}
                    </Badge>
                  ))}
              </div>
            ))}

            {/* Low Power Row */}
            <div className="flex items-center justify-center font-medium text-sm transform -rotate-90">Low Power</div>
            {['Low', 'Medium', 'High'].map((interest) => (
              <div key={`Low-${interest}`} className="border rounded p-2 bg-green-50 min-h-16">
                <div className="text-xs font-medium mb-1">Monitor</div>
                {stakeholders
                  .filter(s => s.influence === 'Low' && s.interest === interest)
                  .map(s => (
                    <Badge key={s.id} variant="secondary" className="text-xs mr-1 mb-1">
                      {s.name}
                    </Badge>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcosystemMappingVisualizations;