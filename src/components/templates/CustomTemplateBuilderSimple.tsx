import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedDragDropBuilder } from './EnhancedDragDropBuilder';
import { Save } from 'lucide-react';

interface TemplateSection {
  id: string;
  name: string;
  elements: any[];
}

export const CustomTemplateBuilder: React.FC<{ 
  onSave: (template: any) => void; 
  onCancel: () => void;
  editingTemplate?: any;
}> = ({ onSave, onCancel, editingTemplate }) => {
  const [templateName, setTemplateName] = useState(editingTemplate?.title || '');
  const [templateDescription, setTemplateDescription] = useState(editingTemplate?.description || '');
  const [sections, setSections] = useState<TemplateSection[]>([
    { id: '1', name: 'Executive Summary', elements: [] }
  ]);

  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.title);
      setTemplateDescription(editingTemplate.description);
    }
  }, [editingTemplate]);

  const handleSave = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      sections: sections,
      created_at: new Date().toISOString()
    };
    onSave(template);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{editingTemplate ? 'Edit Template' : 'Create Custom Template'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!templateName}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe your template"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Drag Drop Builder */}
        <div className="lg:col-span-2">
          <EnhancedDragDropBuilder
            sections={sections}
            onSectionsChange={setSections}
          />
        </div>
      </div>
    </div>
  );
};