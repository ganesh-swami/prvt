import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';

interface CommentSystemProps {
  targetType: string;
  targetId: string;
  className?: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  targetType,
  targetId,
  className = ''
}) => {
  const { user, appUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [targetType, targetId, showComments]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users(name, avatar_url)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: newComment,
          author_id: user.id,
          target_type: targetType,
          target_id: targetId,
          mentions: []
        }])
        .select(`
          *,
          author:users(name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="mb-2"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Comments ({comments.length})
      </Button>

      {showComments && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author?.avatar_url} />
                  <AvatarFallback>
                    {comment.author?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.author?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[80px]"
              />
              <Button type="submit" disabled={loading || !newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};