import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Import step components
import { WelcomeStep } from './steps/WelcomeStep';
import { CreateProjectStep } from './steps/CreateProjectStep';
import { ExploreModulesStep } from './steps/ExploreModulesStep';
import { InviteCollaboratorsStep } from './steps/InviteCollaboratorsStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { CompleteStep } from './steps/CompleteStep';

const stepComponents = {
  WelcomeStep,
  CreateProjectStep,
  ExploreModulesStep,
  InviteCollaboratorsStep,
  PreferencesStep,
  CompleteStep
};

export const OnboardingWizard: React.FC = () => {
  const {
    isOnboardingActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    finishOnboarding,
    skipStep,
    isLoading
  } = useOnboarding();

  if (!isOnboardingActive) return null;

  const currentStepData = steps[currentStep];
  const StepComponent = stepComponents[currentStepData?.component as keyof typeof stepComponents];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      finishOnboarding();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    if (currentStepData.optional) {
      skipStep(currentStepData.id);
    }
  };

  return (
    <Dialog open={isOnboardingActive} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {currentStepData?.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {currentStepData?.optional && (
                <Badge variant="secondary">Optional</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-muted-foreground">
              {currentStepData?.description}
            </p>
          </div>
        </DialogHeader>

        <div className="py-6">
          {StepComponent && <StepComponent />}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={isFirstStep || isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStepData?.optional && !isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Complete Setup' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
