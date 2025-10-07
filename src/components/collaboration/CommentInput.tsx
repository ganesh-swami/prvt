import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, Smile, Paperclip, Bold, List, Link } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { MentionsDropdown } from './MentionsDropdown';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  onCommentAdded?: (comment: any) => void;
  placeholder?: string;
  isReply?: boolean;
  projectId?: string;
  moduleId?: string;
}
export function CommentInput({ onSubmit, onCommentAdded, placeholder = "Add a comment...", isReply = false, projectId, moduleId }: CommentInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatText = (type: string) => {
    // Placeholder for text formatting
    console.log('Format:', type);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);
    setCursorPosition(cursorPos);

    // Check for @ mentions
    const beforeCursor = newContent.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      
      // Calculate position for dropdown
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.bottom + 4,
          left: rect.left
        });
      }
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const handleMentionSelect = (selectedUser: { id: string; name: string; email: string }) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    
    // Remove the partial @mention and replace with full mention
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = beforeCursor.substring(0, beforeCursor.length - mentionMatch[0].length);
      const mentionText = `@[${selectedUser.name || selectedUser.email}](${selectedUser.id})`;
      const newContent = beforeMention + mentionText + afterCursor;
      setContent(newContent);
      
      // Set cursor after the mention
      const newCursorPos = beforeMention.length + mentionText.length;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          author_id: user.id,
          project_id: projectId,
          module_id: moduleId
        })
        .select()
        .single();

      if (error) throw error;

      // Extract mentions and create mention records
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const mentions = [];
      let match;

      while ((match = mentionRegex.exec(content)) !== null) {
        const userId = match[2];
        if (userId !== user.id) { // Don't notify self
          mentions.push({
            mentioned_user_id: userId,
            comment_id: comment.id,
            created_by: user.id,
            mention_type: 'comment_mention',
            is_read: false
          });
        }
      }

      // Insert mentions if any
      if (mentions.length > 0) {
        await supabase.from('mentions').insert(mentions);
      }

      setContent('');
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showMentions && (e.key === 'Escape')) {
      setShowMentions(false);
      setMentionQuery('');
      return;
    }
    
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className={`border rounded-lg p-3 bg-white ${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[60px] resize-none border-0 p-0 focus-visible:ring-0"
            />
            {showMentions && (
              <MentionsDropdown
                query={mentionQuery}
                onSelect={handleMentionSelect}
                position={mentionPosition}
                projectId={projectId}
              />
            )}
            
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('bold')}
                  className={`h-7 w-7 p-0 ${isBold ? 'bg-gray-100' : ''}`}
                >
                  <Bold className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('list')}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('link')}
                  className="h-7 w-7 p-0"
                >
                  <Link className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Smile className="h-3 w-3" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Paperclip className="h-3 w-3" />
          </Button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          size="sm"
          className="h-7"
        >
          <Send className="h-3 w-3 mr-1" />
          {isReply ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </div>
  );
}