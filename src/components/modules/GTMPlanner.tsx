import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Save, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductRoadmap } from './gtm/ProductRoadmap';
import { CustomerPainPoints } from './gtm/CustomerPainPoints';
import { CompetitorAnalysis } from './gtm/CompetitorAnalysis';
import { SWOTAnalysis } from './gtm/SWOTAnalysis';
import { ProductConcept } from './gtm/ProductConcept';
import { KeyAudiencePitches } from './gtm/KeyAudiencePitches';
import { LaunchGoalsKPIs } from './gtm/LaunchGoalsKPIs';
import { StatusLog } from './gtm/StatusLog';
import { CustomerJourneyMap } from './gtm/CustomerJourneyMap';
import { PromotionsChecklist } from './gtm/PromotionsChecklist';
import { OutreachChannels } from './gtm/OutreachChannels';
import { useGTMData } from '@/hooks/useGTMData';
import { exportGTMPlan } from '@/utils/gtmExportUtils';

export const GTMPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { gtmData, saving, updateGTMData, saveGTMData } = useGTMData();
  const { toast } = useToast();

  const handleExport = (format: string) => {
    try {
      const exportData = {
        ...gtmData,
        exportDate: new Date().toLocaleDateString()
      };
      
      exportGTMPlan(exportData, format, `gtm-plan-${gtmData.projectName.toLowerCase().replace(/\s+/g, '-')}`);
      
      toast({
        title: "Export Successful",
        description: `GTM Plan exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your GTM plan.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await saveGTMData(gtmData);
      toast({
        title: "Saved Successfully",
        description: "Your GTM plan has been saved.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your GTM plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GTM Planner</h1>
          <p className="text-gray-600 mt-2">
            Develop your comprehensive go-to-market strategy
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProductRoadmap projectName={gtmData.projectName} />
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <CustomerPainPoints />
          <CompetitorAnalysis />
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <SWOTAnalysis />
          <ProductConcept />
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          <KeyAudiencePitches />
          <LaunchGoalsKPIs />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <StatusLog />
          <CustomerJourneyMap />
        </TabsContent>

        <TabsContent value="outreach" className="space-y-6">
          <PromotionsChecklist />
          <OutreachChannels />
        </TabsContent>
      </Tabs>
    </div>
  );
};