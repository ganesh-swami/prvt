import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, X } from 'lucide-react';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
  mentions?: string[];
}

interface CommentSidebarProps {
  moduleId: string;
  moduleName: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: string;
}

export function CommentSidebar({ moduleId, moduleName, isOpen, onOpenChange, projectId }: CommentSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);

  // Mock data - in real app, this would come from API/database
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        author: 'Sarah Johnson',
        content: 'Great work on the **financial projections**! The revenue model looks solid. What about the customer acquisition costs?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        mentions: ['john'],
        replies: [
          {
            id: '1-1',
            author: 'John Smith',
            content: 'Thanks @sarah! CAC is around $150 based on our current marketing channels. Planning to optimize this further.',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            mentions: ['sarah']
          }
        ]
      },
      {
        id: '2',
        author: 'Mike Chen',
        content: 'Should we consider adding more detail to the competitive analysis section? Here are some key points:\n\n• Market positioning\n• Feature comparison\n• Pricing strategy',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      }
    ];
    
    setComments(mockComments);
    
    // Count total comments including replies
    const totalCount = mockComments.reduce((acc, comment) => {
      return acc + 1 + (comment.replies?.length || 0);
    }, 0);
    setCommentCount(totalCount);
  }, [moduleId]);

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      content,
      timestamp: new Date().toISOString(),
      mentions: extractMentions(content)
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentCount(prev => prev + 1);
  };

  const handleReply = (commentId: string, content: string) => {
    const newReply: Comment = {
      id: `${commentId}-${Date.now()}`,
      author: 'Current User',
      content,
      timestamp: new Date().toISOString(),
      mentions: extractMentions(content)
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    }));
    setCommentCount(prev => prev + 1);
  };

  const handleEdit = (commentId: string, newContent: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, content: newContent };
      }
      // Check replies
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId ? { ...reply, content: newContent } : reply
          )
        };
      }
      return comment;
    }));
  };

  const handleDelete = (commentId: string) => {
    setComments(prev => {
      // Remove top-level comment
      const filtered = prev.filter(comment => comment.id !== commentId);
      
      // Remove from replies
      return filtered.map(comment => ({
        ...comment,
        replies: comment.replies?.filter(reply => reply.id !== commentId)
      }));
    });
    setCommentCount(prev => prev - 1);
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const SidebarTrigger = () => (
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="relative shadow-sm border-blue-200 hover:border-blue-300 hover:bg-blue-50">
        <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
        <span className="font-medium">Comments</span>
        {commentCount > 0 && (
          <Badge variant="default" className="ml-2 h-5 min-w-5 text-xs bg-blue-600 hover:bg-blue-700">
            {commentCount}
          </Badge>
        )}
      </Button>
    </SheetTrigger>
  );

  if (isOpen !== undefined && onOpenChange) {
    // Controlled mode
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SidebarTrigger />
        <SheetContent side="right" className="w-96 sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{moduleName} Comments</span>
              <Badge variant="secondary">{commentCount}</Badge>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full mt-4">
            <div className="mb-4">
              <CommentInput onSubmit={handleAddComment} />
            </div>
            
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-1">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Uncontrolled mode
  return (
    <Sheet>
      <SidebarTrigger />
      <SheetContent side="right" className="w-96 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{moduleName} Comments</span>
            <Badge variant="secondary">{commentCount}</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full mt-4">
          <div className="mb-4">
            <CommentInput onSubmit={handleAddComment} />
          </div>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-1">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}