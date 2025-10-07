import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { exportEnhancedFinancialModel } from '../../utils/financialModelExport';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ModuleSummaries } from './ModuleSummaries';
import { useModuleSummaries } from '../../hooks/useModuleSummaries';
import { exportToPDFWithCharts } from '../../utils/enhancedExportUtils';
import { exportToPowerPoint } from '../../utils/powerpointExport';
import { generatePitchDeck } from '../../utils/pitchDeckExport';
import { exportFinancialModel } from '../../utils/financialModelExport';
import { FileText, Download, TrendingUp, DollarSign, Users, PieChart, Target, Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
}

interface CapTableEntry {
  id: string;
  shareholder: string;
  shares: number;
  percentage: number;
  type: 'common' | 'preferred' | 'options';
}

export const InvestorRoom: React.FC = () => {
  const { summaries } = useModuleSummaries();
  
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Product MVP Launch',
      description: 'Launch minimum viable product',
      targetDate: '2024-03-15',
      status: 'completed',
      progress: 100
    },
    {
      id: '2',
      title: 'First 1000 Users',
      description: 'Acquire first thousand active users',
      targetDate: '2024-06-30',
      status: 'in-progress',
      progress: 75
    }
  ]);

  const [capTable, setCapTable] = useState<CapTableEntry[]>([
    { id: '1', shareholder: 'Founders', shares: 7000000, percentage: 70, type: 'common' },
    { id: '2', shareholder: 'Seed Investors', shares: 2000000, percentage: 20, type: 'preferred' },
    { id: '3', shareholder: 'Employee Pool', shares: 1000000, percentage: 10, type: 'options' }
  ]);

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.targetDate) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        ...newMilestone,
        status: 'pending',
        progress: 0
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({ title: '', description: '', targetDate: '' });
    }
  };

  const handleExportToPDF = () => {
    const exportData = {
      metrics: {
        revenue: 45000,
        users: 2340,
        burnRate: 12000
      },
      capTable,
      milestones,
      moduleSummaries: summaries
    };
    exportToPDFWithCharts(exportData, summaries, 'Investor Report');
  };

  const handleExportToPowerPoint = () => {
    const exportData = {
      metrics: {
        revenue: 45000,
        users: 2340,
        burnRate: 12000
      },
      capTable,
      milestones,
      moduleSummaries: summaries
    };
    exportToPowerPoint(exportData, summaries, 'Investor Presentation');
  };

  const handleGeneratePitchDeck = () => {
    const companyData = {
      companyName: 'Your Company',
      tagline: 'Revolutionizing the industry',
      revenue: 45000,
      users: 2340,
      growth: 25,
      fundingAmount: 500000
    };
    generatePitchDeck(summaries, companyData);
  };

  const handleFinancialModelExport = () => {
    const companyData = {
      companyName: 'Your Company',
      revenue: 45000,
      burnRate: 12000
    };
    exportEnhancedFinancialModel(summaries, companyData);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Investor Room</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportToPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportToPowerPoint}>
            <Download className="w-4 h-4 mr-2" />
            Export PPT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Investor Update
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold">$45,000</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold">2,340</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Burn Rate</p>
                        <p className="text-2xl font-bold">$12,000</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Textarea 
                placeholder="Add key highlights, challenges, and next steps..."
                className="min-h-[100px]"
              />
              <Button>Generate Update Report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          <ModuleSummaries />
        </TabsContent>

        <TabsContent value="cap-table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Capitalization Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capTable.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{entry.shareholder}</p>
                      <p className="text-sm text-gray-600">{entry.shares.toLocaleString()} shares</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.type === 'preferred' ? 'default' : 'secondary'}>
                        {entry.type}
                      </Badge>
                      <span className="font-bold">{entry.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Milestone Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{milestone.title}</h3>
                    <Badge variant={
                      milestone.status === 'completed' ? 'default' :
                      milestone.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{milestone.targetDate}</span>
                  </div>
                  <Progress value={milestone.progress} className="w-full" />
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Add New Milestone</h4>
                <Input
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                />
                <Textarea
                  placeholder="Description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                />
                <Input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                />
                <Button onClick={addMilestone}>Add Milestone</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pitch-deck" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pitch Deck Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Generate investor-ready pitch decks with real-time data integration.</p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGeneratePitchDeck}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Pitch Deck
                </Button>
                <Button variant="outline" onClick={handleFinancialModelExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Financial Model Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};