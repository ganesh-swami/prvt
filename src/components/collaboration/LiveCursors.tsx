import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { MousePointer2, Eye, Edit3, Users } from 'lucide-react';

interface UserPresence {
  id: string;
  name: string;
  avatar_url?: string;
  status: 'active' | 'idle' | 'away';
  cursor?: { x: number; y: number };
  currentSection?: string;
  lastSeen: string;
}

interface LiveCursorsProps {
  projectId: string;
  currentUser: { id: string; name: string; avatar_url?: string };
}

export function LiveCursors({ projectId, currentUser }: LiveCursorsProps) {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [showPresenceList, setShowPresenceList] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: UserPresence[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar_url: '',
        status: 'active',
        cursor: { x: 45, y: 30 },
        currentSection: 'Financial Model',
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mike Johnson',
        avatar_url: '',
        status: 'active',
        cursor: { x: 65, y: 50 },
        currentSection: 'Market Analysis',
        lastSeen: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar_url: '',
        status: 'idle',
        currentSection: 'Risk Assessment',
        lastSeen: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      }
    ];

    setActiveUsers(mockUsers.filter(user => user.id !== currentUser.id));
  }, [currentUser.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="relative">
      {/* Live cursors overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {activeUsers
          .filter(user => user.cursor && user.status === 'active')
          .map(user => (
            <div
              key={user.id}
              className="absolute transition-all duration-100 ease-out"
              style={{
                left: `${user.cursor!.x}%`,
                top: `${user.cursor!.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center gap-1">
                <MousePointer2 
                  className="h-4 w-4 text-blue-600 drop-shadow-sm" 
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                />
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                  {user.name}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Presence indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setShowPresenceList(!showPresenceList)}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{activeUsers.length + 1}</span>
            <div className="flex -space-x-1">
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback className="text-xs">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {activeUsers.slice(0, 3).map(user => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeUsers.length > 3 && (
                <div className="h-6 w-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{activeUsers.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded presence list */}
        {showPresenceList && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
            <h3 className="font-medium text-sm mb-3">Active Users</h3>
            <div className="space-y-3">
              {/* Current user */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="text-sm">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor('active')}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{currentUser.name} (You)</div>
                  <div className="text-xs text-gray-500">Active now</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Editing
                </Badge>
              </div>

              {/* Other users */}
              {activeUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.status === 'active' ? 'Active now' : formatLastSeen(user.lastSeen)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      <Eye className="h-3 w-3 mr-1" />
                      {getStatusText(user.status)}
                    </Badge>
                    {user.currentSection && (
                      <div className="text-xs text-gray-500">{user.currentSection}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}