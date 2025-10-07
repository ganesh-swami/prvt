import { useState, useEffect } from 'react';
import { 
  projectApi, 
  businessPlanApi, 
  marketAssumptionsApi, 
  pricingScenariosApi, 
  financialModelsApi,
  competitorsApi,
  commentsApi,
  tasksApi
} from '@/lib/api';
import { 
  Project, 
  BusinessPlan, 
  MarketAssumptions, 
  PricingScenario, 
  FinancialModel,
  Competitor,
  Comment,
  Task
} from '@/types';

// Enhanced project store with full API integration
let projectState = {
  currentProject: null as Project | null,
  projects: [] as Project[],
  businessPlan: null as BusinessPlan | null,
  marketAssumptions: null as MarketAssumptions | null,
  pricingScenarios: [] as PricingScenario[],
  financialModels: [] as FinancialModel[],
  competitors: [] as Competitor[],
  comments: [] as Comment[],
  tasks: [] as Task[],
  loading: false,
  error: null as string | null,
};

const listeners: (() => void)[] = [];

const notify = () => listeners.forEach(listener => listener());

export const useProjectStore = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...projectState,
    
    // Project management
    setCurrentProject: (project: Project) => {
      projectState.currentProject = project;
      loadProjectData(project.id);
      notify();
    },
    
    loadProjects: async (userId: string) => {
      projectState.loading = true;
      notify();
      try {
        projectState.projects = await projectApi.getProjects(userId);
        projectState.loading = false;
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        projectState.loading = false;
        notify();
      }
    },

    createProject: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const newProject = await projectApi.createProject(projectData);
        projectState.projects = [newProject, ...projectState.projects];
        notify();
        return newProject;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    updateProject: async (id: string, updates: Partial<Project>) => {
      try {
        const updatedProject = await projectApi.updateProject(id, updates);
        projectState.projects = projectState.projects.map(p => 
          p.id === id ? updatedProject : p
        );
        if (projectState.currentProject?.id === id) {
          projectState.currentProject = updatedProject;
        }
        notify();
        return updatedProject;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    deleteProject: async (id: string) => {
      try {
        await projectApi.deleteProject(id);
        projectState.projects = projectState.projects.filter(p => p.id !== id);
        if (projectState.currentProject?.id === id) {
          projectState.currentProject = null;
        }
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Business Plan management
    updateBusinessPlan: async (updates: Partial<BusinessPlan>) => {
      if (!projectState.currentProject) return;
      
      try {
        if (projectState.businessPlan) {
          projectState.businessPlan = await businessPlanApi.update(projectState.businessPlan.id, updates);
        } else {
          projectState.businessPlan = await businessPlanApi.create({
            project_id: projectState.currentProject.id,
            ...updates
          });
        }
        notify();
        return projectState.businessPlan;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Market Assumptions management
    updateMarketAssumptions: async (updates: Partial<MarketAssumptions>) => {
      if (!projectState.currentProject) return;
      
      try {
        if (projectState.marketAssumptions) {
          projectState.marketAssumptions = await marketAssumptionsApi.update(projectState.marketAssumptions.id, updates);
        } else {
          projectState.marketAssumptions = await marketAssumptionsApi.create({
            project_id: projectState.currentProject.id,
            validation_status: 'unvalidated',
            ...updates
          });
        }
        notify();
        return projectState.marketAssumptions;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Pricing Scenarios management
    createPricingScenario: async (scenario: Omit<PricingScenario, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const newScenario = await pricingScenariosApi.create(scenario);
        projectState.pricingScenarios = [newScenario, ...projectState.pricingScenarios];
        notify();
        return newScenario;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    updatePricingScenario: async (id: string, updates: Partial<PricingScenario>) => {
      try {
        const updatedScenario = await pricingScenariosApi.update(id, updates);
        projectState.pricingScenarios = projectState.pricingScenarios.map(s => 
          s.id === id ? updatedScenario : s
        );
        notify();
        return updatedScenario;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    deletePricingScenario: async (id: string) => {
      try {
        await pricingScenariosApi.delete(id);
        projectState.pricingScenarios = projectState.pricingScenarios.filter(s => s.id !== id);
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Financial Models management
    createFinancialModel: async (model: Omit<FinancialModel, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const newModel = await financialModelsApi.create(model);
        projectState.financialModels = [newModel, ...projectState.financialModels];
        notify();
        return newModel;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    updateFinancialModel: async (id: string, updates: Partial<FinancialModel>) => {
      try {
        const updatedModel = await financialModelsApi.update(id, updates);
        projectState.financialModels = projectState.financialModels.map(m => 
          m.id === id ? updatedModel : m
        );
        notify();
        return updatedModel;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Competitors management
    createCompetitor: async (competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const newCompetitor = await competitorsApi.create(competitor);
        projectState.competitors = [newCompetitor, ...projectState.competitors];
        notify();
        return newCompetitor;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    updateCompetitor: async (id: string, updates: Partial<Competitor>) => {
      try {
        const updatedCompetitor = await competitorsApi.update(id, updates);
        projectState.competitors = projectState.competitors.map(c => 
          c.id === id ? updatedCompetitor : c
        );
        notify();
        return updatedCompetitor;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    deleteCompetitor: async (id: string) => {
      try {
        await competitorsApi.delete(id);
        projectState.competitors = projectState.competitors.filter(c => c.id !== id);
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Comments management
    loadComments: async (module?: string, section?: string) => {
      if (!projectState.currentProject) return;
      
      try {
        projectState.comments = await commentsApi.getByProject(
          projectState.currentProject.id, 
          module, 
          section
        );
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
      }
    },

    createComment: async (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'author'>) => {
      try {
        const newComment = await commentsApi.create(comment);
        projectState.comments = [...projectState.comments, newComment];
        notify();
        return newComment;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Tasks management
    loadTasks: async () => {
      if (!projectState.currentProject) return;
      
      try {
        projectState.tasks = await tasksApi.getByProject(projectState.currentProject.id);
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
      }
    },

    createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'assignee'>) => {
      try {
        const newTask = await tasksApi.create(task);
        projectState.tasks = [newTask, ...projectState.tasks];
        notify();
        return newTask;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    updateTask: async (id: string, updates: Partial<Task>) => {
      try {
        const updatedTask = await tasksApi.update(id, updates);
        projectState.tasks = projectState.tasks.map(t => 
          t.id === id ? updatedTask : t
        );
        notify();
        return updatedTask;
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    deleteTask: async (id: string) => {
      try {
        await tasksApi.delete(id);
        projectState.tasks = projectState.tasks.filter(t => t.id !== id);
        notify();
      } catch (error: any) {
        projectState.error = error.message;
        notify();
        throw error;
      }
    },

    // Utility functions
    clearError: () => {
      projectState.error = null;
      notify();
    },

    reset: () => {
      projectState.currentProject = null;
      projectState.businessPlan = null;
      projectState.marketAssumptions = null;
      projectState.pricingScenarios = [];
      projectState.financialModels = [];
      projectState.competitors = [];
      projectState.comments = [];
      projectState.tasks = [];
      projectState.error = null;
      notify();
    }
  };
};

const loadProjectData = async (projectId: string) => {
  projectState.loading = true;
  notify();
  
  try {
    const [
      businessPlan,
      marketAssumptions,
      pricingScenarios,
      financialModels,
      competitors,
      comments,
      tasks
    ] = await Promise.all([
      businessPlanApi.getByProjectId(projectId),
      marketAssumptionsApi.getByProjectId(projectId),
      pricingScenariosApi.getByProjectId(projectId),
      financialModelsApi.getByProjectId(projectId),
      competitorsApi.getByProjectId(projectId),
      commentsApi.getByProject(projectId),
      tasksApi.getByProject(projectId)
    ]);

    projectState.businessPlan = businessPlan;
    projectState.marketAssumptions = marketAssumptions;
    projectState.pricingScenarios = pricingScenarios;
    projectState.financialModels = financialModels;
    projectState.competitors = competitors;
    projectState.comments = comments;
    projectState.tasks = tasks;
    projectState.loading = false;
    notify();
  } catch (error: any) {
    projectState.error = error.message;
    projectState.loading = false;
    notify();
  }
};