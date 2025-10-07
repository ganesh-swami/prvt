import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, TrendingUp, Lightbulb, Shield, DollarSign, Globe, Activity, Building, Eye, Heart, Handshake, Zap } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';

interface CanvasData {
  socialMission: string;
  keyDeliveryPartners: string;
  keyActivities: string;
  socialImpactMeasurement: string;
  socialValueProposition: string;
  relationships: string;
  impactGapAnalysis: string;
  keyStakeholders: string;
  channels: string;
  competitorsCompetition: string;
  keyResources: string;
  pestelAnalysis: string;
  costs: string;
  surplus: string;
  revenue: string;
}

interface SocialCanvasVisualizationProps {
  canvasData: CanvasData;
}

const SocialCanvasVisualization: React.FC<SocialCanvasVisualizationProps> = ({ canvasData }) => {
  const getPreviewText = (text: string, maxLength: number = 80) => {
    if (!text) return 'Not defined yet...';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getCompletionColor = (text: string) => {
    if (!text) return 'bg-gray-50 border-gray-200 text-gray-400';
    if (text.length < 20) return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  };

  const sections = [
    { key: 'keyDeliveryPartners', title: 'Key Delivery Partners', icon: Handshake, number: 7, color: 'bg-blue-500', description: 'Strategic partnerships that enable delivery', justification: 'Essential for scaling social impact', impact: 'Multiplies reach and effectiveness' },
    { key: 'keyActivities', title: 'Key Activities', icon: Activity, number: 8, color: 'bg-purple-500', description: 'Core activities that create social value', justification: 'Defines operational focus', impact: 'Direct driver of social outcomes' },
    { key: 'socialImpactMeasurement', title: 'Social Impact Measurement Strategy', icon: Eye, number: 9, color: 'bg-green-500', description: 'Methods to track and measure social impact', justification: 'Ensures accountability and improvement', impact: 'Validates and optimizes social value creation' },
    { key: 'relationships', title: 'Relationships', icon: Heart, number: 5, color: 'bg-pink-500', description: 'Types of relationships with beneficiaries', justification: 'Builds trust and engagement', impact: 'Enhances service adoption and satisfaction' },
    { key: 'impactGapAnalysis', title: 'Pre-Work: Impact Gap Analysis', icon: Target, number: 2, color: 'bg-red-500', description: 'Analysis of social problems to address', justification: 'Identifies opportunity for impact', impact: 'Guides mission and strategy development' },
    { key: 'keyResources', title: 'Key Resources', icon: Building, number: 9, color: 'bg-indigo-500', description: 'Essential resources for operations', justification: 'Enables sustainable operations', impact: 'Determines scalability and sustainability' },
    { key: 'channels', title: 'Channels', icon: Zap, number: 6, color: 'bg-yellow-500', description: 'How you reach and serve beneficiaries', justification: 'Ensures accessibility and reach', impact: 'Maximizes beneficiary engagement' },
    { key: 'keyStakeholders', title: 'Key Stakeholders', icon: Users, number: 1, color: 'bg-cyan-500', description: 'People who influence or are affected', justification: 'Critical for support and legitimacy', impact: 'Enables sustainable social change' },
    { key: 'competitorsCompetition', title: 'Competitors & Cooperation', icon: Shield, number: 10, color: 'bg-orange-500', description: 'Competitive landscape and collaboration', justification: 'Informs positioning and partnerships', impact: 'Optimizes market approach and impact' },
    { key: 'pestelAnalysis', title: 'Macro-Environment/PESTEL', icon: Globe, number: 11, color: 'bg-teal-500', description: 'External factors affecting operations', justification: 'Identifies risks and opportunities', impact: 'Informs strategic planning and adaptation' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Business Model Canvas</h2>
          <p className="text-gray-600">Visual overview of your social business model</p>
        </div>
      </div>
      
      {/* Top Row - Mission */}
      <div className="grid grid-cols-1">
        <div className={`p-6 rounded-xl border-2 bg-gradient-to-r from-blue-50 to-green-50 border-blue-300 shadow-sm`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">Social Mission</span>
            <CustomTooltip content="Description: Your core social mission and purpose. Justification: Defines the fundamental reason for existence. Impact: Guides all strategic decisions and activities." />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{getPreviewText(canvasData.socialMission, 150)}</p>
        </div>
      </div>

      {/* Main Canvas Grid - 5 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Column 1 */}
        <div className="space-y-3">
          {sections.slice(0, 3).map((section, idx) => (
            <div key={section.key} className={`p-4 rounded-lg border-2 ${getCompletionColor(canvasData[section.key as keyof CanvasData])} min-h-40 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`${section.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>{section.number}</span>
                <section.icon className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-xs text-gray-800">{section.title}</span>
                <CustomTooltip content={`Description: ${section.description}. Justification: ${section.justification}. Impact: ${section.impact}.`} />
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{getPreviewText(canvasData[section.key as keyof CanvasData], 80)}</p>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          <div className={`p-4 rounded-lg border-2 ${getCompletionColor(canvasData.socialValueProposition)} min-h-40 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
              <Lightbulb className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-xs text-gray-800">Social Value Proposition</span>
              <CustomTooltip content="Description: The unique social value you deliver to beneficiaries. Justification: Differentiates your approach and impact. Impact: Attracts beneficiaries and stakeholders." />
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{getPreviewText(canvasData.socialValueProposition, 80)}</p>
          </div>
          
          {sections.slice(3, 5).map((section) => (
            <div key={section.key} className={`p-4 rounded-lg border-2 ${getCompletionColor(canvasData[section.key as keyof CanvasData])} min-h-40 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`${section.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>{section.number}</span>
                <section.icon className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-xs text-gray-800">{section.title}</span>
                <CustomTooltip content={`Description: ${section.description}. Justification: ${section.justification}. Impact: ${section.impact}.`} />
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{getPreviewText(canvasData[section.key as keyof CanvasData], 80)}</p>
            </div>
          ))}
        </div>

        {/* Columns 3, 4, 5 */}
        {[5, 7, 9].map((startIdx, colIdx) => (
          <div key={colIdx} className="space-y-3">
            {sections.slice(startIdx, startIdx + 2).map((section) => (
              <div key={section.key} className={`p-4 rounded-lg border-2 ${getCompletionColor(canvasData[section.key as keyof CanvasData])} min-h-40 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`${section.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>{section.number}</span>
                  <section.icon className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-xs text-gray-800">{section.title}</span>
                  <CustomTooltip content={`Description: ${section.description}. Justification: ${section.justification}. Impact: ${section.impact}.`} />
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{getPreviewText(canvasData[section.key as keyof CanvasData], 80)}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Row - Financial sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { key: 'costs', title: 'Costs - Programs, Products/Services, Fundraising, etc.', icon: DollarSign, number: 12, color: 'bg-red-500', description: 'All costs required to operate and deliver impact', justification: 'Essential for financial sustainability planning', impact: 'Determines pricing and funding needs' },
          { key: 'surplus', title: 'Surplus - Reinvestment / Donation, etc.', icon: TrendingUp, number: 13, color: 'bg-green-500', description: 'How surplus is allocated for greater impact', justification: 'Ensures sustainable growth and impact', impact: 'Maximizes long-term social value creation' },
          { key: 'revenue', title: 'Revenue: Funding & Tradeable Income, etc.', icon: DollarSign, number: 14, color: 'bg-blue-500', description: 'All sources of income and funding', justification: 'Enables operations and sustainability', impact: 'Determines scale and reach of impact' }
        ].map((section) => (
          <div key={section.key} className={`p-4 rounded-lg border-2 ${getCompletionColor(canvasData[section.key as keyof CanvasData])} min-h-32 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`${section.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>{section.number}</span>
              <section.icon className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-xs text-gray-800">{section.title}</span>
              <CustomTooltip content={`Description: ${section.description}. Justification: ${section.justification}. Impact: ${section.impact}.`} />
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{getPreviewText(canvasData[section.key as keyof CanvasData], 80)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialCanvasVisualization;