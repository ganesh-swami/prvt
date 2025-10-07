import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Image, FileSpreadsheet, FileJson } from 'lucide-react';
import { exportModuleData } from '@/utils/moduleExportUtils';

interface ExportOptionsProps {
  data: any;
  filename?: string;
  onExport?: (format: string) => void;
  moduleName?: string;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  data, 
  filename = 'export', 
  onExport,
  moduleName = 'Module Report'
}) => {
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format);
      return;
    }

    // Use the enhanced export utilities
    exportModuleData(data, format, filename, moduleName);
  };

  return (
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
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Word
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
  );
};