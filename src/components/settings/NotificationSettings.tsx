import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGate } from '@/hooks/useGate';
import { supabase } from '@/lib/supabase';
import { Slack, Mail, Bell } from 'lucide-react';

interface NotificationPrefs {
  mentions: boolean;
  assignments: boolean;
  investor_updates: boolean;
  weekly_digest: boolean;
  slack_enabled: boolean;
  email_enabled: boolean;
}

export const NotificationSettings: React.FC = () => {
  const { appUser } = useAuth();
  const { hasFeature } = useGate();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    mentions: true,
    assignments: true,
    investor_updates: false,
    weekly_digest: true,
    slack_enabled: false,
    email_enabled: true,
  });
  const [slackConnected, setSlackConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const canUseEmail = hasFeature('collab.notifications');
  const canUseSlack = hasFeature('integrations.advanced');

  const handleSlackConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('slack-oauth', {
        body: { action: 'connect', user_id: appUser?.id }
      });
      if (data?.auth_url) {
        window.open(data.auth_url, '_blank');
      }
    } catch (err) {
      console.error('Slack connect error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePrefs = async (newPrefs: Partial<NotificationPrefs>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    
    // Save to database
    await supabase
      .from('users')
      .update({ notification_prefs: updated })
      .eq('id', appUser?.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose when and how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mentions</p>
              <p className="text-sm text-muted-foreground">When someone mentions you</p>
            </div>
            <Switch
              checked={prefs.mentions}
              onCheckedChange={(checked) => updatePrefs({ mentions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Task Assignments</p>
              <p className="text-sm text-muted-foreground">When you're assigned to a task</p>
            </div>
            <Switch
              checked={prefs.assignments}
              onCheckedChange={(checked) => updatePrefs({ assignments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">Summary of your activity</p>
            </div>
            <Switch
              checked={prefs.weekly_digest}
              onCheckedChange={(checked) => updatePrefs({ weekly_digest: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
            {!canUseEmail && <Badge variant="secondary">Pro+</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Switch
            checked={prefs.email_enabled && canUseEmail}
            onCheckedChange={(checked) => updatePrefs({ email_enabled: checked })}
            disabled={!canUseEmail}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Slack Integration
            {!canUseSlack && <Badge variant="secondary">Business+</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slackConnected ? (
            <div className="flex items-center justify-between">
              <span className="text-green-600">Connected</span>
              <Button variant="outline" size="sm">Disconnect</Button>
            </div>
          ) : (
            <Button 
              onClick={handleSlackConnect}
              disabled={!canUseSlack || loading}
              className="w-full"
            >
              Connect Slack
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};