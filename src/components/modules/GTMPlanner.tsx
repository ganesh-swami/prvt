import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Save, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { generateGTMPDF } from './gtm-pdf-export-new';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectGTMPlanner, 
  setProjectId, 
  fetchGTMPlan, 
  saveGTMPlan 
} from '@/store/slices/gtmPlannerSlice';
import { exportGTMPlan } from '@/utils/gtmExportUtils';

interface GTMPlannerProps {
  projectId?: string;
}

export const GTMPlanner: React.FC<GTMPlannerProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const dispatch = useAppDispatch();
  const gtmPlanner = useAppSelector(selectGTMPlanner);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      dispatch(setProjectId(projectId));
      dispatch(fetchGTMPlan(projectId));
    }
  }, [projectId, dispatch]);

  // Auto-save functionality (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only auto-save if we have a gtmId (existing plan) and projectId
    if (gtmPlanner.gtmId && projectId && !gtmPlanner.loading) {
      saveTimeoutRef.current = setTimeout(() => {
        // Inline save to avoid dependency issues
        dispatch(saveGTMPlan({
          projectId,
          gtmId: gtmPlanner.gtmId,
          data: {
            name: gtmPlanner.name,
            product_roadmap: gtmPlanner.productRoadmap,
            customer_pain_points: gtmPlanner.customerPainPoints,
            competitor_analysis: gtmPlanner.competitorAnalysis,
            swot_analysis: gtmPlanner.swotAnalysis,
            product_concept: gtmPlanner.productConcept,
            key_audience_pitches: gtmPlanner.keyAudiencePitches,
            launch_goals_kpis: gtmPlanner.launchGoalsKPIs,
            status_log: gtmPlanner.statusLog,
            customer_journey_map: gtmPlanner.customerJourneyMap,
            promotions_checklist: gtmPlanner.promotionsChecklist,
            outreach_channels: gtmPlanner.outreachChannels,
          } as any
        }));
      }, 3000); // 3 second debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gtmPlanner.productRoadmap, gtmPlanner.customerPainPoints, gtmPlanner.competitorAnalysis, 
      gtmPlanner.swotAnalysis, gtmPlanner.productConcept, gtmPlanner.keyAudiencePitches,
      gtmPlanner.launchGoalsKPIs, gtmPlanner.statusLog, gtmPlanner.customerJourneyMap,
      gtmPlanner.promotionsChecklist, gtmPlanner.outreachChannels]);

  const handleSaveInternal = async (silent = false) => {
    if (!projectId) {
      if (!silent) {
        toast({
          title: "Save Failed",
          description: "No project ID available.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await dispatch(saveGTMPlan({
        projectId,
        gtmId: gtmPlanner.gtmId,
        data: {
          name: gtmPlanner.name,
          product_roadmap: gtmPlanner.productRoadmap,
          customer_pain_points: gtmPlanner.customerPainPoints,
          competitor_analysis: gtmPlanner.competitorAnalysis,
          swot_analysis: gtmPlanner.swotAnalysis,
          product_concept: gtmPlanner.productConcept,
          key_audience_pitches: gtmPlanner.keyAudiencePitches,
          launch_goals_kpis: gtmPlanner.launchGoalsKPIs,
          status_log: gtmPlanner.statusLog,
          customer_journey_map: gtmPlanner.customerJourneyMap,
          promotions_checklist: gtmPlanner.promotionsChecklist,
          outreach_channels: gtmPlanner.outreachChannels,
        } as any
      })).unwrap();

      if (!silent) {
        toast({
          title: "Saved Successfully",
          description: gtmPlanner.lastSaved ? `Last saved at ${new Date(gtmPlanner.lastSaved).toLocaleTimeString()}` : "Your GTM plan has been saved.",
        });
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (!silent) {
        toast({
          title: "Save Failed",
          description: "There was an error saving your GTM plan.",
          variant: "destructive",
        });
      }
    }
  };

  const exportToPDF = async () => {
    if (!gtmPlanner.productRoadmap.businessName) {
      sonnerToast.error("Please fill in GTM plan data before exporting!");
      return;
    }

    setIsExporting(true);

    try {
      const doc = generateGTMPDF(gtmPlanner, sonnerToast);
      
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`gtm-strategy-${timestamp}.pdf`);
      sonnerToast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      sonnerToast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (format: string) => {
    if (format === 'pdf') {
      exportToPDF();
      return;
    }

    try {
      const exportData = {
        ...gtmPlanner,
        exportDate: new Date().toLocaleDateString()
      };
      
      exportGTMPlan(exportData as any, format, `gtm-plan-${gtmPlanner.name.toLowerCase().replace(/\s+/g, '-')}`);
      
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

  const handleSave = () => handleSaveInternal(false);

  // Show loading state
  if (gtmPlanner.loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading GTM Plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GTM Planner</h1>
          <p className="text-gray-600 mt-2">
            Develop your comprehensive go-to-market strategy
          </p>
          {gtmPlanner.lastSaved && (
            <p className="text-xs text-gray-500 mt-1">
              Last saved: {new Date(gtmPlanner.lastSaved).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline" disabled={gtmPlanner.saving}>
            {gtmPlanner.saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
          <Button onClick={exportToPDF} variant="outline" disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2 text-red-600" />}
            {isExporting ? "Exporting..." : "Export PDF"}
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
          <ProductRoadmap projectName={gtmPlanner.productRoadmap.businessName} />
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