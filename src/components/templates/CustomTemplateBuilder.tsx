import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DragDropBuilder } from './DragDropBuilder';
import { Save } from 'lucide-react';
import { GripVertical, Plus, X, Save } from 'lucide-react';

interface ModuleElement {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
}

interface TemplateSection {
  id: string;
  name: string;
  elements: ModuleElement[];
}

const availableElements: ModuleElement[] = [
  { id: 'financial-model', name: 'Financial Model', type: 'chart', category: 'Finance', description: 'Revenue projections and financial analysis' },
  { id: 'market-sizing', name: 'Market Sizing', type: 'analysis', category: 'Market', description: 'TAM, SAM, SOM analysis' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', type: 'table', category: 'Market', description: 'Competitive landscape overview' },
  { id: 'pricing-strategy', name: 'Pricing Strategy', type: 'framework', category: 'Strategy', description: 'Pricing model and strategy' },
  { id: 'gtm-plan', name: 'Go-to-Market Plan', type: 'roadmap', category: 'Strategy', description: 'Launch strategy and timeline' },
  { id: 'team-structure', name: 'Team Structure', type: 'org-chart', category: 'Operations', description: 'Organizational chart' },
  { id: 'risk-analysis', name: 'Risk Analysis', type: 'matrix', category: 'Risk', description: 'Risk assessment and mitigation' },
  { id: 'unit-economics', name: 'Unit Economics', type: 'metrics', category: 'Finance', description: 'Customer acquisition and lifetime value' }
];

export const CustomTemplateBuilder: React.FC<{ onSave: (template: any) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([
    { id: '1', name: 'Executive Summary', elements: [] }
  ]);

  const addSection = () => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      name: `Section ${sections.length + 1}`,
      elements: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, name } : s));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'available-elements') {
      // Dragging from available elements to a section
      const element = availableElements.find(e => e.id === result.draggableId);
      if (!element) return;

      const targetSectionId = destination.droppableId;
      setSections(sections.map(section => {
        if (section.id === targetSectionId) {
          return {
            ...section,
            elements: [...section.elements, { ...element, id: `${element.id}-${Date.now()}` }]
          };
        }
        return section;
      }));
    } else {
      // Reordering within sections
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;

      if (sourceSectionId === destSectionId) {
        // Reordering within same section
        const section = sections.find(s => s.id === sourceSectionId);
        if (!section) return;

        const newElements = Array.from(section.elements);
        const [removed] = newElements.splice(source.index, 1);
        newElements.splice(destination.index, 0, removed);

        setSections(sections.map(s => 
          s.id === sourceSectionId ? { ...s, elements: newElements } : s
        ));
      }
    }
  };

  const removeElement = (sectionId: string, elementId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, elements: section.elements.filter(e => e.id !== elementId) }
        : section
    ));
  };

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
        <h2 className="text-2xl font-bold">Create Custom Template</h2>
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

        {/* Available Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Available Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="available-elements" isDropDisabled={true}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {availableElements.map((element, index) => (
                      <Draggable key={element.id} draggableId={element.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded-lg cursor-move ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{element.name}</div>
                                <div className="text-xs text-muted-foreground">{element.description}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">{element.category}</Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Template Builder */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Template Structure</CardTitle>
              <Button size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <Input
                        value={section.name}
                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                        className="font-medium"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSection(section.id)}
                        disabled={sections.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Droppable droppableId={section.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[100px] p-2 border-2 border-dashed rounded-lg ${
                            snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {section.elements.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-8">
                              Drag elements here
                            </p>
                          )}
                          {section.elements.map((element, index) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between p-2 bg-white border rounded mb-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{element.name}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeElement(section.id, element.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};