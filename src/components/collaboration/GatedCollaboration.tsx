import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, CheckSquare, Lock, Clock } from 'lucide-react';
import { useGate } from '@/hooks/useGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

interface GatedCollaborationProps {
  children?: React.ReactNode;
}

export const GatedCollaboration: React.FC<GatedCollaborationProps> = ({ children }) => {
  const { canAccess: canComment } = useGate('collaboration.comments');
  const { canAccess: canAssignTasks } = useGate('collaboration.tasks');
  const { canAccess: canMention } = useGate('collaboration.mentions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState('');

  const handleLockedAction = (feature: string, description: string) => {
    setUpgradeContext(description);
    setShowUpgrade(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Team Collaboration</h2>
        <p className="text-muted-foreground">Work together on business plans and analysis</p>
      </div>

      {/* Collaboration Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={!canComment ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments & Discussions
              {!canComment && <Lock className="h-3 w-3 text-amber-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Add contextual comments and start discussions on any section
            </p>
            <Button 
              size="sm" 
              variant={canComment ? "default" : "outline"}
              onClick={() => !canComment && handleLockedAction('comments', 'Start collaborative discussions with contextual comments and real-time notifications')}
              disabled={!canComment}
            >
              {canComment ? 'Add Comment' : 'Unlock Comments'}
            </Button>
          </CardContent>
        </Card>

        <Card className={!canAssignTasks ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Task Management
              {!canAssignTasks && <Lock className="h-3 w-3 text-amber-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create and assign tasks with due dates and priorities
            </p>
            <Button 
              size="sm" 
              variant={canAssignTasks ? "default" : "outline"}
              onClick={() => !canAssignTasks && handleLockedAction('tasks', 'Organize work with advanced task management, assignments, and progress tracking')}
              disabled={!canAssignTasks}
            >
              {canAssignTasks ? 'Create Task' : 'Unlock Tasks'}
            </Button>
          </CardContent>
        </Card>

        <Card className={!canMention ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              @Mentions & Notifications
              {!canMention && <Lock className="h-3 w-3 text-amber-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Mention team members and get instant notifications
            </p>
            <Button 
              size="sm" 
              variant={canMention ? "default" : "outline"}
              onClick={() => !canMention && handleLockedAction('mentions', 'Keep everyone in the loop with @mentions and smart notifications')}
              disabled={!canMention}
            >
              {canMention ? '@Mention' : 'Unlock Mentions'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trial Banner */}
      {(!canComment || !canAssignTasks || !canMention) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Unlock Team Collaboration</h3>
                <p className="text-sm text-amber-700">
                  Start a 14-day Pro trial to access comments, task management, and real-time collaboration features.
                </p>
              </div>
              <Button 
                variant="default" 
                onClick={() => handleLockedAction('collaboration', 'Get full access to team collaboration tools with a 14-day Pro trial')}
              >
                Start Free Trial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Render children if collaboration is enabled */}
      {(canComment || canAssignTasks || canMention) && children}

      {showUpgrade && (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature="Team Collaboration"
          description={upgradeContext}
          requiredPlan="pro"
          showTrial={true}
        />
      )}
    </div>
  );
};