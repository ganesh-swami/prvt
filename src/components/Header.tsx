import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnhancedNotifications } from "@/components/collaboration/EnhancedNotifications";
import { Menu, User, LogOut, Settings, FolderOpen } from "lucide-react";

export const Header: React.FC = () => {
  const { toggleSidebar } = useAppContext();
  const { user, signOut } = useAuth();
  const { currentProject } = useCurrentProject();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Strategize+</h1>
            <p className="text-sm text-gray-600">
              Helping You Grow, the Simple Way
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {false && currentProject && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {currentProject.name}
              </span>
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-800"
              >
                Active
              </Badge>
            </div>
          )}
          <EnhancedNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.name}
                  />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.user_metadata?.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
