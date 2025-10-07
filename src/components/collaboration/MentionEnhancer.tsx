import React from 'react';
import { NotificationEmitter } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface MentionEnhancerProps {
  children: React.ReactNode;
  onMention?: (userId: string, commentId: string) => void;
}

export const MentionEnhancer: React.FC<MentionEnhancerProps> = ({ 
  children, 
  onMention 
}) => {
  const { appUser } = useAuth();

  const handleMentionCreated = async (mentionedUserId: string, commentId: string) => {
    if (appUser?.name) {
      await NotificationEmitter.emitMention(
        commentId, 
        mentionedUserId, 
        appUser.name
      );
    }
    onMention?.(mentionedUserId, commentId);
  };

  // This component wraps comment systems to automatically emit mention notifications
  return (
    <div data-mention-handler="true">
      {React.cloneElement(children as React.ReactElement, {
        onMentionCreated: handleMentionCreated
      })}
    </div>
  );
};