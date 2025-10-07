import React, { useState } from 'react';
import { TaskAssignmentDialog } from './TaskAssignmentDialog';

interface MentionTextProps {
  content: string;
  projectId: string;
  commentId?: string;
}

export const MentionText: React.FC<MentionTextProps> = ({ content, projectId, commentId }) => {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleMentionClick = (userId: string) => {
    setSelectedUserId(userId);
    setTaskDialogOpen(true);
  };

  const renderContent = () => {
    // Enhanced regex to capture @mentions with user IDs
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add clickable mention
      const userName = match[1];
      const userId = match[2];
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium bg-blue-50 px-1 py-0.5 rounded"
          onClick={() => handleMentionClick(userId)}
          title="Click to assign task"
        >
          @{userName}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      <span>{renderContent()}</span>
      <TaskAssignmentDialog
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        projectId={projectId}
        mentionedUserId={selectedUserId}
        commentId={commentId}
      />
    </>
  );
};
