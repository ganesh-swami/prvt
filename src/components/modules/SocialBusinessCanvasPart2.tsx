import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Users, Target, Shield, DollarSign, TrendingUp, Globe, Activity, Building, Eye, Heart, Handshake, Zap } from 'lucide-react';

interface SocialBusinessCanvasPart2Props {
  canvasData: any;
  handleInputChange: (field: string, value: string) => void;
}

const SocialBusinessCanvasPart2: React.FC<SocialBusinessCanvasPart2Props> = ({
  canvasData,
  handleInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Impact Gap Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-red-600" />
              <span>Impact Gap Analysis</span>
              <CustomTooltip content="Pre-work analysis identifying the gap between current state and desired social impact. What problems exist that your social business aims to solve?" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., 60% of rural women lack access to financial services, limiting economic opportunities and perpetuating poverty cycles"
              value={canvasData.impactGapAnalysis}
              onChange={(e) => handleInputChange('impactGapAnalysis', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Key Stakeholders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Key Stakeholders</span>
              <CustomTooltip content="Who are the people that you need to partner with? Who are the people who can help or hinder your operations? Include beneficiaries, funders, partners, regulators, and community leaders." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Rural women (beneficiaries), local government, impact investors, community elders, regulatory bodies"
              value={canvasData.keyStakeholders}
              onChange={(e) => handleInputChange('keyStakeholders', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-cyan-600" />
              <span>Channels</span>
              <CustomTooltip content="Through which channels do you want to reach your beneficiaries and customers? How do you raise awareness, help customers evaluate, allow purchase, deliver, and provide post-purchase support?" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Community centers, mobile apps, local agents, social media, word-of-mouth, partner networks"
              value={canvasData.channels}
              onChange={(e) => handleInputChange('channels', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitors & Competition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span>Competitors & Competition</span>
              <CustomTooltip content="Who are your main competitors in the social impact space? Include other social businesses, traditional businesses, NGOs, and government programs addressing similar issues." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Traditional banks, other microfinance institutions, government welfare programs, informal lending networks"
              value={canvasData.competitorsCompetition}
              onChange={(e) => handleInputChange('competitorsCompetition', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Key Resources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Key Resources</span>
              <CustomTooltip content="What key resources does your social value proposition require? Think about physical, intellectual, human, and financial resources that are essential to your social business model." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Trained staff, technology platform, funding capital, community trust, regulatory licenses, impact measurement tools"
              value={canvasData.keyResources}
              onChange={(e) => handleInputChange('keyResources', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SocialBusinessCanvasPart2;