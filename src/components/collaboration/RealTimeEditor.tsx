import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, Users, Eye } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: number;
  isTyping: boolean;
}

export const RealTimeEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Alice', color: 'bg-blue-500', cursor: 0, isTyping: false },
    { id: '2', name: 'Bob', color: 'bg-green-500', cursor: 50, isTyping: true },
    { id: '3', name: 'Carol', color: 'bg-purple-500', cursor: 100, isTyping: false }
  ]);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => ({
        ...c,
        isTyping: Math.random() > 0.7,
        cursor: Math.floor(Math.random() * content.length)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [content.length]);

  const handleSave = () => {
    setLastSaved(new Date());
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Collaborative Document
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {collaborators.map((collab) => (
              <Avatar key={collab.id} className="w-6 h-6 border-2 border-white">
                <AvatarFallback className={`text-xs text-white ${collab.color}`}>
                  {collab.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {collaborators.length} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {collaborators.filter(c => c.isTyping).map(c => (
              <span key={c.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c.color} animate-pulse`} />
                {c.name} is typing...
              </span>
            ))}
          </div>
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing to collaborate in real-time..."
          className="min-h-[300px] resize-none"
        />
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Document
        </Button>
      </CardContent>
    </Card>
  );
};