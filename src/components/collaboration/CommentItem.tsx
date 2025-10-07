import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageCircle, Heart, MoreHorizontal } from 'lucide-react';
import { MentionText } from './MentionText';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    author: {
      name: string;
      avatar_url?: string;
    };
    created_at: string;
    replies_count?: number;
    likes_count?: number;
  };
  projectId: string;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
}
export function CommentItem({ comment, projectId, onReply, onLike }: CommentItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="group mt-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar_url} />
          <AvatarFallback className="text-sm">
            {comment.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
          </div>
          
          <div className="text-sm text-gray-700 mb-2">
            <MentionText 
              content={comment.content} 
              projectId={projectId}
              commentId={comment.id}
            />
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply?.(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply {comment.replies_count ? `(${comment.replies_count})` : ''}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <Heart className="h-3 w-3 mr-1" />
              {comment.likes_count || 0}
            </Button>
            
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentItem;