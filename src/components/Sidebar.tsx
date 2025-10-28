import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveProjects,
  selectProjectsLoading,
  setCurrentProject,
  fetchProjects,
} from "@/store/slices/projectsSlice";
import { resetModel } from "@/store/slices/financialModelerSlice";
import { resetMarketSizing } from "@/store/slices/marketSizingSlice";
import { resetPricingLab } from "@/store/slices/pricingLabSlice";
import { resetUnitEconomics } from "@/store/slices/unitEconomicsSlice";
import { resetProblemTree } from "@/store/slices/problemTreeSlice";
import { resetSocialCanvas } from "@/store/slices/socialCanvasSlice";
import { resetEcosystemMap } from "@/store/slices/stakeholdersSlice";
import { resetPlanBuilder } from "@/store/slices/planBuilderSlice";
import { reset as resetTeamCollaboration } from "@/store/slices/teamCollaborationSlice";
import { resetGTMPlanner } from "@/store/slices/gtmPlannerSlice";
import { toast } from "sonner";
import {
  BarChart3,
  Calculator,
  Target,
  DollarSign,
  TrendingUp,
  Shield,
  LayoutDashboard,
  Heart,
  TreePine,
  Network,
  Users as UsersIcon,
  Zap,
  Presentation,
  FileText,
  MessageSquare,
  Package,
  Activity,
  PieChart,
  CreditCard,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  id: string;
  beta?: boolean;
  to?: string;
  category?: string;
};

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    id: "dashboard",
    category: "overview",
  },
  {
    icon: Target,
    label: "Plan Builder",
    id: "plan-builder",
    category: "planning",
  },
  {
    icon: Heart,
    label: "Social Canvas",
    id: "social-canvas",
    category: "planning",
  },
  {
    icon: TreePine,
    label: "Problem Tree",
    id: "problem-tree",
    category: "planning",
  },
  {
    icon: Network,
    label: "Ecosystem Map",
    id: "ecosystem-mapping",
    category: "analysis",
  },
  {
    icon: Calculator,
    label: "Market Sizing",
    id: "market-sizing",
    category: "analysis",
  },
  {
    icon: DollarSign,
    label: "Pricing Lab",
    id: "pricing",
    category: "analysis",
  },
  {
    icon: BarChart3,
    label: "Unit Economics",
    id: "unit-economics",
    category: "financial",
  },
  {
    icon: TrendingUp,
    label: "Financial Model",
    id: "financial",
    category: "financial",
  },
  {
    icon: TrendingUp,
    label: "Analyst Model",
    id: "analyst",
    beta: true,
    to: "/analyst",
    category: "financial",
  },
  { icon: UsersIcon, label: "GTM Planner", id: "gtm", category: "growth" },
  {
    icon: Zap,
    label: "Competitor Analysis",
    id: "competitor-analysis",
    category: "growth",
  },
  {
    icon: Presentation,
    label: "Investor Room",
    id: "investor-room",
    category: "growth",
  },
  {
    icon: Shield,
    label: "Risk Center",
    id: "risk-center",
    category: "compliance",
  },
  // {
  //   icon: Shield,
  //   label: "ESG Compliance",
  //   id: "esg-compliance",
  //   category: "compliance",
  // },
  {
    icon: MessageSquare,
    label: "Team Collaboration",
    id: "team-collaboration",
    category: "collaboration",
  },
  {
    icon: FileText,
    label: "Drafts and Plans",
    id: "drafts-and-plans",
    category: "collaboration",
  },
  {
    icon: FileText,
    label: "Projects",
    id: "projects",
    category: "collaboration",
  },
  { icon: Package, label: "Templates", id: "templates", category: "resources" },
  {
    icon: CreditCard,
    label: "Pricing",
    id: "pricing-module",
    category: "resources",
  },
  {
    icon: Activity,
    label: "Admin Analytics",
    id: "admin-analytics",
    category: "admin",
  },
  {
    icon: PieChart,
    label: "Org Analytics",
    id: "org-analytics",
    category: "admin",
  },
];

const categoryLabels = {
  overview: "Overview",
  planning: "Strategic Planning",
  analysis: "Market Analysis",
  financial: "Financial Modeling",
  growth: "Growth & Marketing",
  compliance: "Risk & Compliance",
  collaboration: "Team & Collaboration",
  resources: "Resources",
  admin: "Administration",
};

// Project Selector Component
const ProjectSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentProject, currentProjectId } = useCurrentProject();
  const activeProjects = useAppSelector(selectActiveProjects);
  const loading = useAppSelector(selectProjectsLoading);
  const [hasFetched, setHasFetched] = React.useState(false);

  // Fetch projects on mount if not already loaded
  React.useEffect(() => {
    if (user?.id && !hasFetched && activeProjects.length === 0 && !loading) {
      dispatch(fetchProjects(user.id));
      setHasFetched(true);
    }
  }, [dispatch, user?.id, activeProjects.length, loading, hasFetched]);

  const handleProjectChange = (projectId: string) => {
    // Don't proceed if same project is selected
    if (projectId === currentProjectId) return;

    const selectedProject = activeProjects.find((p) => p.id === projectId);
    if (!selectedProject) return;

    // Clear all module data from Redux stores
    dispatch(resetModel());
    dispatch(resetMarketSizing());
    dispatch(resetPricingLab());
    dispatch(resetUnitEconomics());
    dispatch(resetProblemTree());
    dispatch(resetSocialCanvas());
    dispatch(resetEcosystemMap());
    dispatch(resetPlanBuilder());
    dispatch(resetTeamCollaboration());
    dispatch(resetGTMPlanner());

    // Note: Competitor and Risk slices fetch data on mount, so they'll load fresh data automatically

    // Set new project
    dispatch(setCurrentProject(selectedProject));

    // Show success message
    toast.success(`Switched to "${selectedProject.name}"`, {
      description:
        "All module data has been cleared and will reload for this project.",
    });

    // Optional: Reload the page to ensure clean state
    // Uncomment if you want a hard refresh on project switch
    // setTimeout(() => window.location.reload(), 500);
  };

  // Show loading state while fetching projects
  if (loading && activeProjects.length === 0) {
    return (
      <div className="px-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show "No Projects" message only after loading is complete
  if (!loading && activeProjects.length === 0) {
    return (
      <div className="px-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          <p className="font-medium mb-1">No Projects</p>
          <p>Create a project to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Select
        value={currentProjectId || ""}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className="w-full h-9 text-sm bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
          <SelectValue placeholder="Select a project">
            {currentProject?.name || "Select project"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {activeProjects.map((project) => (
            <SelectItem key={project.id} value={project.id} className="text-sm">
              <div className="flex items-center justify-between w-full">
                <span>{project.name}</span>
                {project.id === currentProjectId && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentModule, setCurrentModule } = useAppContext();
  const [collapsedCategories, setCollapsedCategories] = React.useState<
    Set<string>
  >(new Set());

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const base =
    "w-full flex items-center px-3 py-2.5 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2";
  const active =
    "bg-gradient-to-r from-blue-50 to-purple-50 border-r-2 border-blue-500 text-blue-600 font-medium";
  const inactive = "text-gray-700 hover:text-blue-600";

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ${
        sidebarOpen ? "w-72" : "w-16"
      } border-r`}
    >
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Strategize+
              </h1>
              <p className="text-xs text-gray-500">
                Business Strategy Platform
              </p>
            </div>
          )}
        </div>

        {sidebarOpen && <ProjectSelector />}
      </div>

      <nav className="mt-4 pb-4 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            {sidebarOpen && (
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>
                  {categoryLabels[category as keyof typeof categoryLabels] ||
                    category}
                </span>
                {collapsedCategories.has(category) ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            {(!collapsedCategories.has(category) || !sidebarOpen) && (
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;

                  if (item.to) {
                    return (
                      <NavLink
                        key={item.id}
                        to={item.to}
                        className={({ isActive }) =>
                          `${base} ${isActive ? active : inactive}`
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && (
                          <div className="ml-3 flex items-center justify-between flex-1">
                            <span className="font-medium">{item.label}</span>
                            {item.beta && (
                              <Badge variant="secondary" className="text-xs">
                                Beta
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    );
                  }

                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentModule(item.id)}
                      className={`${base} ${isActive ? active : inactive}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <div className="ml-3 flex items-center justify-between flex-1">
                          <span className="font-medium">{item.label}</span>
                          {item.beta && (
                            <Badge variant="secondary" className="text-xs">
                              Beta
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {sidebarOpen && category !== "admin" && (
              <Separator className="mt-3" />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};
