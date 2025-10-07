import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, X, ChevronUp, ChevronDown, Copy, Layers, BarChart, Users, Target, DollarSign, TrendingUp, FileText, PieChart, Calculator } from 'lucide-react';

interface ModuleElement {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  description: string;
}

interface TemplateSection {
  id: string;
  name: string;
  elements: ModuleElement[];
}

const availableElements: ModuleElement[] = [
  { id: 'financial-model', name: 'Financial Model', type: 'analysis', icon: <BarChart className="h-4 w-4" />, description: 'Revenue projections and financial planning' },
  { id: 'market-sizing', name: 'Market Sizing', type: 'research', icon: <TrendingUp className="h-4 w-4" />, description: 'TAM, SAM, SOM analysis' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', type: 'research', icon: <Users className="h-4 w-4" />, description: 'Competitive landscape mapping' },
  { id: 'unit-economics', name: 'Unit Economics', type: 'analysis', icon: <Calculator className="h-4 w-4" />, description: 'CAC, LTV, and profitability metrics' },
  { id: 'problem-tree', name: 'Problem Tree', type: 'framework', icon: <Layers className="h-4 w-4" />, description: 'Root cause analysis framework' },
  { id: 'gtm-strategy', name: 'GTM Strategy', type: 'strategy', icon: <Target className="h-4 w-4" />, description: 'Go-to-market planning' },
  { id: 'pricing-model', name: 'Pricing Model', type: 'analysis', icon: <DollarSign className="h-4 w-4" />, description: 'Pricing strategy and optimization' },
  { id: 'risk-analysis', name: 'Risk Analysis', type: 'framework', icon: <FileText className="h-4 w-4" />, description: 'Risk assessment and mitigation' },
  { id: 'ecosystem-mapping', name: 'Ecosystem Mapping', type: 'visualization', icon: <PieChart className="h-4 w-4" />, description: 'Stakeholder and ecosystem visualization' }
];

interface EnhancedDragDropBuilderProps {
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
}

export const EnhancedDragDropBuilder: React.FC<EnhancedDragDropBuilderProps> = ({
  sections,
  onSectionsChange
}) => {
  const [draggedElement, setDraggedElement] = useState<ModuleElement | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const handleDragStart = (e: React.DragEvent, element: ModuleElement) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (!draggedElement) return;

    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const elementExists = section.elements.some(el => el.id === draggedElement.id);
        if (!elementExists) {
          return {
            ...section,
            elements: [...section.elements, { ...draggedElement, id: `${draggedElement.id}-${Date.now()}` }]
          };
        }
      }
      return section;
    });

    onSectionsChange(updatedSections);
    setDraggedElement(null);
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;
    
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: newSectionName,
      elements: []
    };
    
    onSectionsChange([...sections, newSection]);
    setNewSectionName('');
    setShowAddSection(false);
  };

  const removeSection = (sectionId: string) => {
    onSectionsChange(sections.filter(section => section.id !== sectionId));
  };

  const removeElement = (sectionId: string, elementId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          elements: section.elements.filter(el => el.id !== elementId)
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const moveElement = (sectionId: string, elementId: string, direction: 'up' | 'down') => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const elements = [...section.elements];
        const index = elements.findIndex(el => el.id === elementId);
        
        if (direction === 'up' && index > 0) {
          [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
        } else if (direction === 'down' && index < elements.length - 1) {
          [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
        }
        
        return { ...section, elements };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const duplicateElement = (sectionId: string, element: ModuleElement) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          elements: [...section.elements, { ...element, id: `${element.id}-copy-${Date.now()}` }]
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Available Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Available Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableElements.map((element) => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
              className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                {element.icon}
                <span className="font-medium text-sm">{element.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{element.description}</p>
              <Badge variant="outline" className="mt-1 text-xs">{element.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Template Builder */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Template Structure</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddSection(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>

        {showAddSection && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Section name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSection()}
                />
                <Button onClick={addSection} size="sm">Add</Button>
                <Button variant="outline" onClick={() => setShowAddSection(false)} size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {sections.map((section) => (
          <Card key={section.id} className="border-2 border-dashed border-muted-foreground/20">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{section.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent
              className="min-h-[100px] space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {section.elements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drag elements here to build your template</p>
                </div>
              ) : (
                section.elements.map((element, index) => (
                  <div
                    key={element.id}
                    className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {element.icon}
                    <span className="flex-1 text-sm font-medium">{element.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveElement(section.id, element.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveElement(section.id, element.id, 'down')}
                        disabled={index === section.elements.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateElement(section.id, element)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeElement(section.id, element.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};