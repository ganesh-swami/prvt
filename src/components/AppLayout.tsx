import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

const AppLayout: React.FC = () => {
  const { sidebarOpen } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
export { AppLayout };
