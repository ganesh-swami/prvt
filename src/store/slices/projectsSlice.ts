import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { projectApi, userApi } from "@/lib/api";
import type { Project, User } from "@/types";
import type { RootState } from "../index";

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentUser: User | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  saving: false,
  error: null,
  currentUser: null,
};

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  "projects/fetchCurrentUser",
  async () => {
    const user = await userApi.getCurrentUser();
    return user;
  }
);

// Fetch all projects for the current user
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (userId: string) => {
    const projects = await projectApi.getProjects(userId);
    return projects;
  }
);

// Create a new project and add the creator as a collaborator
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (
    {
      name,
      description,
      ownerId,
    }: {
      name: string;
      description?: string;
      ownerId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Create the project
      const project = await projectApi.createProject({
        name,
        description,
        owner_id: ownerId,
        status: "active",
      });

      // Automatically add the creator as a collaborator with "owner" role
      await projectApi.addCollaborator(project.id, ownerId, "owner");

      return project;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create project");
    }
  }
);

// Archive a project (soft delete)
export const archiveProject = createAsyncThunk(
  "projects/archiveProject",
  async (projectId: string) => {
    const archivedProject = await projectApi.archiveProject(projectId);
    return archivedProject;
  }
);

// Update project
export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
    const updatedProject = await projectApi.updateProject(id, updates);
    return updatedProject;
  }
);

// Delete project permanently
export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId: string) => {
    await projectApi.deleteProject(projectId);
    return projectId;
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProjects: (state) => {
      state.projects = [];
      state.currentProject = null;
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch projects";
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.saving = false;
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string || "Failed to create project";
      })
      // Archive project
      .addCase(archiveProject.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(archiveProject.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to archive project";
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update project";
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.saving = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to delete project";
      });
  },
});

export const { setCurrentProject, clearError, resetProjects } =
  projectsSlice.actions;

// Selectors
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectActiveProjects = (state: RootState) =>
  state.projects.projects.filter((p) => p.status === "active");
export const selectArchivedProjects = (state: RootState) =>
  state.projects.projects.filter((p) => p.status === "archived");
export const selectCurrentProject = (state: RootState) =>
  state.projects.currentProject;
export const selectProjectsLoading = (state: RootState) =>
  state.projects.loading;
export const selectProjectsSaving = (state: RootState) =>
  state.projects.saving;
export const selectProjectsError = (state: RootState) => state.projects.error;
export const selectCurrentUser = (state: RootState) =>
  state.projects.currentUser;

export default projectsSlice.reducer;
