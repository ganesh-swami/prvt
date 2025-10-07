import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { database } from '@/lib/database';
import { validateInput, createProjectSchema } from '@/lib/validation';
import { FolderPlus, Sparkles } from 'lucide-react';

export const CreateProjectStep: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  
  const { completeStep } = useOnboarding();
  const { appUser } = useAuth();
  const { toast } = useToast();

  const projectTemplates = [
    {
      name: "Tech Startup",
      description: "SaaS platform for small businesses",
      icon: "💻"
    },
    {
      name: "Restaurant Business",
      description: "Local dining establishment",
      icon: "🍽️"
    },
    {
      name: "E-commerce Store",
      description: "Online retail business",
      icon: "🛒"
    },
    {
      name: "Consulting Firm",
      description: "Professional services business",
      icon: "💼"
    }
  ];

  const handleCreateProject = async () => {
    if (!appUser) return;

    try {
      setIsCreating(true);
      
      // Validate input
      const validatedData = validateInput(createProjectSchema, {
        name: projectName,
        description: projectDescription,
        ownerId: appUser.id
      });

      // Create project via API (you'll need to implement this)
      const project = await database.createProject({
        name: validatedData.name,
        description: validatedData.description,
        owner_id: validatedData.ownerId
      });

      // Track project creation
      await database.trackEvent('project_created', {
        project_id: project.id,
        source: 'onboarding',
        user_id: appUser.id
      }, appUser.id);

      setProjectCreated(true);
      completeStep('create-project');
      
      toast({
        title: "Project Created! 🎉",
        description: `"${projectName}" is ready for your business planning.`,
      });

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template: typeof projectTemplates[0]) => {
    setProjectName(template.name);
    setProjectDescription(template.description);
  };

  if (projectCreated) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <FolderPlus className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Project Created Successfully!</h3>
          <p className="text-muted-foreground">
            Your project "{projectName}" is now ready. Let's explore the business planning modules next.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Create Your First Project</h3>
        <p className="text-muted-foreground">
          Start by creating a project to organize your business planning work
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="Enter your project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Briefly describe your business idea"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreateProject}
            disabled={!projectName.trim() || isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">Quick Start Templates</span>
          </div>
          
          <div className="space-y-2">
            {projectTemplates.map((template, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
