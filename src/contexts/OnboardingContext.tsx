import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { database } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  completed: boolean;
  optional?: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  finishOnboarding: () => void;
  resetOnboarding: () => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PF Strategize+',
    description: 'Let\'s get you started with your business planning journey',
    component: 'WelcomeStep',
    completed: false
  },
  {
    id: 'create-project',
    title: 'Create Your First Project',
    description: 'Set up your first business planning project',
    component: 'CreateProjectStep',
    completed: false
  },
  {
    id: 'explore-modules',
    title: 'Explore Business Modules',
    description: 'Discover the powerful business planning tools available',
    component: 'ExploreModulesStep',
    completed: false
  },
  {
    id: 'invite-collaborators',
    title: 'Invite Team Members',
    description: 'Collaborate with your team on business planning',
    component: 'InviteCollaboratorsStep',
    completed: false,
    optional: true
  },
  {
    id: 'setup-preferences',
    title: 'Customize Your Experience',
    description: 'Set up your preferences and notifications',
    component: 'PreferencesStep',
    completed: false,
    optional: true
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start building your business plan',
    component: 'CompleteStep',
    completed: false
  }
];

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);
  const [isLoading, setIsLoading] = useState(false);
  const { user, appUser } = useAuth();
  const { toast } = useToast();

  // Check if user needs onboarding
  useEffect(() => {
    if (appUser && !appUser.onboarding_completed) {
      const savedProgress = localStorage.getItem(`onboarding_${appUser.id}`);
      if (savedProgress) {
        const { currentStep: savedStep, steps: savedSteps } = JSON.parse(savedProgress);
        setCurrentStep(savedStep);
        setSteps(savedSteps);
      }
      setIsOnboardingActive(true);
    }
  }, [appUser]);

  // Save progress to localStorage
  const saveProgress = () => {
    if (appUser) {
      localStorage.setItem(`onboarding_${appUser.id}`, JSON.stringify({
        currentStep,
        steps
      }));
    }
  };

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
    setSteps(defaultSteps);
    
    // Track onboarding start
    if (appUser) {
      database.trackEvent('onboarding_started', {
        user_id: appUser.id,
        timestamp: new Date().toISOString()
      }, appUser.id);
    }
  };

  const completeStep = async (stepId: string) => {
    setIsLoading(true);
    try {
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      saveProgress();

      // Track step completion
      if (appUser) {
        await database.trackEvent('onboarding_step_completed', {
          step_id: stepId,
          step_number: currentStep + 1,
          user_id: appUser.id
        }, appUser.id);
      }

      toast({
        title: "Step Completed!",
        description: `Great job completing "${steps.find(s => s.id === stepId)?.title}"`,
      });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipStep = async (stepId: string) => {
    if (appUser) {
      await database.trackEvent('onboarding_step_skipped', {
        step_id: stepId,
        step_number: currentStep + 1,
        user_id: appUser.id
      }, appUser.id);
    }
    nextStep();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      saveProgress();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      saveProgress();
    }
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      if (appUser) {
        // Mark onboarding as completed in database
        await database.updateUserProfile(appUser.id, {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

        // Track onboarding completion
        await database.trackEvent('onboarding_completed', {
          user_id: appUser.id,
          total_steps: steps.length,
          completed_steps: steps.filter(s => s.completed).length,
          skipped_steps: steps.filter(s => !s.completed && !s.optional).length,
          completion_time: new Date().toISOString()
        }, appUser.id);

        // Clear saved progress
        localStorage.removeItem(`onboarding_${appUser.id}`);
      }

      setIsOnboardingActive(false);
      toast({
        title: "Welcome aboard! 🎉",
        description: "You're all set to start building amazing business plans!",
      });
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    setSteps(defaultSteps);
    setIsOnboardingActive(true);
    if (appUser) {
      localStorage.removeItem(`onboarding_${appUser.id}`);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingActive,
        currentStep,
        steps,
        startOnboarding,
        completeStep,
        skipStep,
        nextStep,
        previousStep,
        finishOnboarding,
        resetOnboarding,
        isLoading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
