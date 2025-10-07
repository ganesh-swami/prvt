import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface MentionsDropdownProps {
  query: string;
  onSelect: (user: User) => void;
  position: { top: number; left: number };
  projectId?: string;
}

export function MentionsDropdown({ query, onSelect, position, projectId }: MentionsDropdownProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        let usersQuery = supabase
          .from('users')
          .select('id, name, email, avatar_url')
          .ilike('name', `%${query}%`)
          .limit(5);

        // If we have a project ID, prioritize project collaborators
        if (projectId) {
          const { data: collaborators } = await supabase
            .from('project_collaborators')
            .select('user:users(id, name, email, avatar_url)')
            .eq('project_id', projectId)
            .ilike('user.name', `%${query}%`);

          if (collaborators) {
            const collaboratorUsers = collaborators.map(c => c.user).filter(Boolean);
            setUsers(collaboratorUsers as User[]);
            return;
          }
        }

        const { data } = await usersQuery;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query, projectId]);

  if (!query || users.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-48"
      style={{ top: position.top, left: position.left }}
    >
      {loading ? (
        <div className="p-2 text-sm text-gray-500">Loading...</div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelect(user)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{user.name || user.email}</div>
              {user.name && <div className="text-xs text-gray-500">{user.email}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}