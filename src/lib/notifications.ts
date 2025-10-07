import { supabase } from './supabase';

export interface NotificationEvent {
  type: 'mention' | 'assignment' | 'investor_update';
  user_id: string;
  data: any;
  deep_link: string;
}

export class NotificationEmitter {
  static async emitMention(commentId: string, mentionedUserId: string, mentionerName: string) {
    const event: NotificationEvent = {
      type: 'mention',
      user_id: mentionedUserId,
      data: {
        comment_id: commentId,
        mentioner_name: mentionerName,
        message: `${mentionerName} mentioned you in a comment`
      },
      deep_link: `/comments/${commentId}`
    };
    
    await this.queueNotification(event);
  }

  static async emitTaskAssignment(taskId: string, assigneeId: string, assignerName: string) {
    const event: NotificationEvent = {
      type: 'assignment',
      user_id: assigneeId,
      data: {
        task_id: taskId,
        assigner_name: assignerName,
        message: `${assignerName} assigned you to a task`
      },
      deep_link: `/tasks/${taskId}`
    };
    
    await this.queueNotification(event);
  }

  static async emitInvestorUpdate(projectId: string, userId: string) {
    const event: NotificationEvent = {
      type: 'investor_update',
      user_id: userId,
      data: {
        project_id: projectId,
        message: 'Your investor update is ready for review'
      },
      deep_link: `/projects/${projectId}/investor-room`
    };
    
    await this.queueNotification(event);
  }

  private static async queueNotification(event: NotificationEvent) {
    // Store in notifications table
    await supabase
      .from('notifications')
      .insert({
        user_id: event.user_id,
        type: event.type,
        data: event.data,
        deep_link: event.deep_link,
        created_at: new Date().toISOString()
      });

    // Queue for immediate sending
    await supabase.functions.invoke('send-notification', {
      body: event
    });
  }
}

export const trackNotificationEvent = async (event: string, data: any) => {
  await supabase
    .from('analytics_events')
    .insert({
      event_type: event,
      event_data: data,
      created_at: new Date().toISOString()
    });
};