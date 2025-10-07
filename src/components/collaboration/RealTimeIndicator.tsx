import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RealTimeIndicatorProps {
  moduleId: string;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ moduleId }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [activeUsers, setActiveUsers] = useState(2);

  useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : !prev);
      setActiveUsers(Math.floor(Math.random() * 5) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </Badge>
      
      {isConnected && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{activeUsers} online</span>
        </Badge>
      )}
    </div>
  );
};