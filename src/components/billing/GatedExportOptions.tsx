import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Image, FileSpreadsheet, FileJson, Lock } from 'lucide-react';
import { exportModuleData } from '@/utils/moduleExportUtils';
import { useGate } from '@/hooks/useGate';
import { UpgradePrompt } from './UpgradePrompt';

interface GatedExportOptionsProps {
  data: any;
  filename?: string;
  onExport?: (format: string) => void;
  moduleName?: string;
}

export const GatedExportOptions: React.FC<GatedExportOptionsProps> = ({ 
  data, 
  filename = 'export', 
  onExport,
  moduleName = 'Module Report'
}) => {
  const { canAccess: canExportPDF } = useGate('exports.pdf');
  const { canAccess: canExportPPT } = useGate('exports.ppt');
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [upgradeContext, setUpgradeContext] = React.useState<string>('');

  const handleExport = (format: string) => {
    // Check gates for premium formats
    if (format === 'pdf' && !canExportPDF) {
      setUpgradeContext('Export professional PDF reports with your branding and formatting');
      setShowUpgrade(true);
      return;
    }
    
    if (format === 'ppt' && !canExportPPT) {
      setUpgradeContext('Export PowerPoint presentations ready for investor meetings');
      setShowUpgrade(true);
      return;
    }

    if (onExport) {
      onExport(format);
      return;
    }

    exportModuleData(data, format, filename, moduleName);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
            {!canExportPDF && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('ppt')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PowerPoint
            {!canExportPPT && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('png')}>
            <Image className="h-4 w-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showUpgrade && (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature="Premium Export"
          description={upgradeContext}
          requiredPlan="pro"
        />
      )}
    </>
  );
};