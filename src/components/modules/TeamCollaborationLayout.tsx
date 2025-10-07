import React from 'react';
import { TeamCollaborationEnhanced } from './TeamCollaborationEnhanced';

interface TeamCollaborationLayoutProps {
  projectId: string;
}

export function TeamCollaborationLayout({ projectId }: TeamCollaborationLayoutProps) {
  return <TeamCollaborationEnhanced projectId={projectId} />;
}