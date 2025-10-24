import { useAppSelector } from "@/store/hooks";
import { selectCurrentProject } from "@/store/slices/projectsSlice";

/**
 * Custom hook to get the current project and its ID
 * Returns the current project object and ID, or null if no project is selected
 */
export const useCurrentProject = () => {
  const currentProject = useAppSelector(selectCurrentProject);
  
  return {
    currentProject,
    currentProjectId: currentProject?.id || null,
  };
};
