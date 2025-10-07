import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { TaskKanban } from '@/components/collaboration/TaskKanban';
import { EnhancedCommentSystem } from '@/components/collaboration/EnhancedCommentSystem';
import { CommentSidebar } from '@/components/collaboration/CommentSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectStore } from '@/stores/useProjectStore';

const sections = [
  { id: 'executive', title: 'Executive Summary', completed: true },
  { id: 'company', title: 'Company Overview', completed: true },
  { id: 'problem', title: 'Problem & Value Prop', completed: false },
  { id: 'pestle', title: 'PESTLE Analysis', completed: false },
  { id: 'market', title: 'Market Analysis', completed: false },
  { id: 'tam', title: 'TAM/SAM/SOM', completed: false },
  { id: 'swot', title: 'SWOT Analysis', completed: false },
  { id: 'business-model', title: 'Business Model', completed: false }
];

export const PlanBuilder: React.FC = () => {
  const [activeSection, setActiveSection] = useState('problem');
  const { currentProject } = useProjectStore();

  return (
    <Tabs defaultValue="plan" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="plan">Plan Builder</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="plan">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Sections</h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {section.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      activeSection === section.id ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">2 of 8 sections complete</div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Problem & Value Proposition</h3>
              <div className="flex gap-3">
                <CommentSidebar moduleId="plan-builder" moduleName="Plan Builder" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <span>✨</span>
                  AI Assist
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Statement
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the core problem your solution addresses..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Customer (ICP)
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mid-market SaaS companies with 50-200 employees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Proposition
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="How does your solution create 10x better outcomes?"
                />
              </div>

              <div className="flex justify-between">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save Draft
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="tasks">
        {currentProject && (
          <TaskKanban projectId={currentProject.id} />
        )}
      </TabsContent>
      
      <TabsContent value="comments">
        {currentProject && (
          <EnhancedCommentSystem 
            projectId={currentProject.id}
            moduleId="plan-builder"
          />
        )}
      </TabsContent>
    </Tabs>
};