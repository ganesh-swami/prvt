import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, MessageCircle, CheckSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'mention' | 'task_assigned';
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
  project_id: string;
  module_id?: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Set up real-time subscription
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'mentions',
            filter: `mentioned_user_id=eq.${user.id}`
          }, 
          () => loadNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Load mentions
      const { data: mentions, error: mentionsError } = await supabase
        .from('mentions')
        .select(`
          *,
          comment:comments(
            content,
            module_id,
            project_id,
            author:author_id(name)
          )
        `)
        .eq('mentioned_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (mentionsError) throw mentionsError;

      // Load task assignments
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          creator:created_by(name)
        `)
        .eq('assigned_to', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (tasksError) throw tasksError;

      // Combine and format notifications
      const mentionNotifications: Notification[] = (mentions || []).map(mention => ({
        id: mention.id,
        type: 'mention' as const,
        title: `${mention.comment?.author?.name || 'Someone'} mentioned you`,
        description: mention.comment?.content?.substring(0, 100) + '...' || '',
        created_at: mention.created_at,
        is_read: mention.is_read,
        project_id: mention.comment?.project_id || '',
        module_id: mention.comment?.module_id
      }));

      const taskNotifications: Notification[] = (tasks || []).map(task => ({
        id: task.id,
        type: 'task_assigned' as const,
        title: `${task.creator?.name || 'Someone'} assigned you a task`,
        description: task.title,
        created_at: task.created_at,
        is_read: false, // Tasks don't have read status yet
        project_id: task.project_id
      }));

      const allNotifications = [...mentionNotifications, ...taskNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string, type: string) => {
    if (type === 'mention') {
      try {
        await supabase
          .from('mentions')
          .update({ is_read: true })
          .eq('id', notificationId);
        
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('mentions')
        .update({ is_read: true })
        .eq('mentioned_user_id', user?.id);
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id, notification.type)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.type === 'mention' ? (
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};