import React from "react";
import { TeamCollaborationLayout } from "./TeamCollaborationLayout";

interface TeamCollaborationProps {
  projectId?: string | null;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ projectId }) => {
  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <p className="text-muted-foreground">No project selected</p>
        </div>
      </div>
    );
  }
  
  return <TeamCollaborationLayout projectId={projectId} />;
};

export default TeamCollaboration;
