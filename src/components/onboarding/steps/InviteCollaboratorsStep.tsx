import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { database } from '@/lib/database';
import { validateInput, emailSchema } from '@/lib/validation';
import { 
  UserPlus, 
  Mail, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Share
} from 'lucide-react';

export const InviteCollaboratorsStep: React.FC = () => {
  const [email, setEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  const { completeStep } = useOnboarding();
  const { appUser } = useAuth();
  const { toast } = useToast();

  const collaboratorRoles = [
    {
      name: 'Editor',
      description: 'Can edit and comment on business plans',
      permissions: ['View', 'Edit', 'Comment', 'Export']
    },
    {
      name: 'Viewer',
      description: 'Can view and comment on business plans',
      permissions: ['View', 'Comment', 'Export']
    },
    {
      name: 'Admin',
      description: 'Full access including user management',
      permissions: ['View', 'Edit', 'Comment', 'Export', 'Manage Users']
    }
  ];

  const handleInviteByEmail = async () => {
    if (!appUser) return;

    try {
      setIsInviting(true);
      
      // Validate email
      const validatedEmail = validateInput(emailSchema, email);
      
      // Check if already invited
      if (invitedEmails.includes(validatedEmail)) {
        toast({
          title: "Already Invited",
          description: "This email has already been invited.",
          variant: "destructive"
        });
        return;
      }

      // Send invitation (implement this API call)
      await database.inviteCollaborator({
        email: validatedEmail,
        role: 'editor',
        invitedBy: appUser.id
      });

      // Track invitation
      await database.trackEvent('collaborator_invited', {
        invited_email: validatedEmail,
        source: 'onboarding',
        user_id: appUser.id
      }, appUser.id);

      setInvitedEmails([...invitedEmails, validatedEmail]);
      setEmail('');
      
      toast({
        title: "Invitation Sent! 📧",
        description: `Invitation sent to ${validatedEmail}`,
      });

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Invitation Failed",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const generateInviteLink = async () => {
    if (!appUser) return;

    try {
      // Generate shareable invite link (implement this API call)
      const link = await database.generateInviteLink(appUser.id);
      setInviteLink(link);
      
      await database.trackEvent('invite_link_generated', {
        source: 'onboarding',
        user_id: appUser.id
      }, appUser.id);

    } catch (error) {
      console.error('Error generating invite link:', error);
      toast({
        title: "Error",
        description: "Failed to generate invite link",
        variant: "destructive"
      });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
  };

  const handleSkipForNow = () => {
    completeStep('invite-collaborators');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Invite Your Team</h3>
        <p className="text-muted-foreground">
          Collaborate with your team members on business planning. You can always invite more people later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invite by Email
              </CardTitle>
              <CardDescription>
                Send direct invitations to team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleInviteByEmail}
                    disabled={!email.trim() || isInviting}
                  >
                    {isInviting ? 'Sending...' : 'Invite'}
                  </Button>
                </div>
              </div>

              {invitedEmails.length > 0 && (
                <div className="space-y-2">
                  <Label>Invited Members</Label>
                  <div className="space-y-1">
                    {invitedEmails.map((invitedEmail, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{invitedEmail}</span>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5" />
                Share Invite Link
              </CardTitle>
              <CardDescription>
                Generate a link to share with multiple people
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!inviteLink ? (
                <Button onClick={generateInviteLink} variant="outline" className="w-full">
                  Generate Invite Link
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label>Shareable Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={copyInviteLink} size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can join your organization
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaboration Roles
              </CardTitle>
              <CardDescription>
                Different permission levels for team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {collaboratorRoles.map((role, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{role.name}</h4>
                    <Badge variant="outline">{role.permissions.length} permissions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission, permIndex) => (
                      <Badge key={permIndex} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Start with a small core team and expand as your business plan develops. 
                  You can always adjust permissions later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSkipForNow} variant="outline">
          Skip for Now - I'll Invite People Later
        </Button>
      </div>
    </div>
  );
};
