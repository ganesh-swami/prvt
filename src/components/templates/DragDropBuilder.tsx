import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

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

export const DragDropBuilder: React.FC<{ 
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
}> = ({ sections, onSectionsChange }) => {
  const [draggedElement, setDraggedElement] = useState<ModuleElement | null>(null);
  const [draggedFromSection, setDraggedFromSection] = useState<string | null>(null);

  const addSection = () => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      name: `Section ${sections.length + 1}`,
      elements: []
    };
    onSectionsChange([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    onSectionsChange(sections.filter(s => s.id !== sectionId));
  };

  const updateSectionName = (sectionId: string, name: string) => {
    onSectionsChange(sections.map(s => s.id === sectionId ? { ...s, name } : s));
  };

  const addElementToSection = (sectionId: string, element: ModuleElement) => {
    onSectionsChange(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          elements: [...section.elements, { ...element, id: `${element.id}-${Date.now()}` }]
        };
      }
      return section;
    }));
  };

  const removeElement = (sectionId: string, elementId: string) => {
    onSectionsChange(sections.map(section => 
      section.id === sectionId 
        ? { ...section, elements: section.elements.filter(e => e.id !== elementId) }
        : section
    ));
  };

  const moveElement = (sectionId: string, elementIndex: number, direction: 'up' | 'down') => {
    onSectionsChange(sections.map(section => {
      if (section.id === sectionId) {
        const newElements = [...section.elements];
        const targetIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
        
        if (targetIndex >= 0 && targetIndex < newElements.length) {
          [newElements[elementIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[elementIndex]];
        }
        
        return { ...section, elements: newElements };
      }
      return section;
    }));
  };

  const handleDragStart = (element: ModuleElement, fromSection?: string) => {
    setDraggedElement(element);
    setDraggedFromSection(fromSection || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    
    if (draggedElement) {
      if (draggedFromSection) {
        // Moving from one section to another
        removeElement(draggedFromSection, draggedElement.id);
      }
      addElementToSection(sectionId, draggedElement);
    }
    
    setDraggedElement(null);
    setDraggedFromSection(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Available Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableElements.map((element) => (
              <div
                key={element.id}
                draggable
                onDragStart={() => handleDragStart(element)}
                className="p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow"
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
            ))}
          </div>
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
                
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, section.id)}
                  className="min-h-[100px] p-2 border-2 border-dashed rounded-lg border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {section.elements.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Drag elements here
                    </p>
                  )}
                  {section.elements.map((element, index) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={() => handleDragStart(element, section.id)}
                      className="flex items-center justify-between p-2 bg-white border rounded mb-2 cursor-move"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{element.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveElement(section.id, index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveElement(section.id, index, 'down')}
                          disabled={index === section.elements.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeElement(section.id, element.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};