import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProjects,
  fetchCurrentUser,
  createProject,
  archiveProject,
  updateProject,
  selectActiveProjects,
  selectArchivedProjects,
  selectProjectsLoading,
  selectProjectsSaving,
  selectProjectsError,
  selectCurrentUser,
  clearError,
} from "@/store/slices/projectsSlice";
import type { Project } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Folder,
  Plus,
  Archive,
  Loader2,
  Calendar,
  Edit,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Projects: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProjects = useAppSelector(selectActiveProjects);
  const archivedProjects = useAppSelector(selectArchivedProjects);
  const loading = useAppSelector(selectProjectsLoading);
  const saving = useAppSelector(selectProjectsSaving);
  const error = useAppSelector(selectProjectsError);
  const currentUser = useAppSelector(selectCurrentUser);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch current user first
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    // Fetch projects once we have the current user
    if (currentUser) {
      dispatch(fetchProjects(currentUser.id));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Project name must be at least 3 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    try {
      await dispatch(
        createProject({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          ownerId: currentUser.id,
        })
      ).unwrap();

      toast.success("Project created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      setFormErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    }
  };

  const handleEditProject = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    if (!editingProject) return;

    try {
      await dispatch(
        updateProject({
          id: editingProject.id,
          updates: {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
          },
        })
      ).unwrap();

      toast.success("Project updated successfully");
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setFormData({ name: "", description: "" });
      setFormErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project");
    }
  };

  const handleArchiveProject = async (projectId: string, projectName: string) => {
    try {
      await dispatch(archiveProject(projectId)).unwrap();
      toast.success(`Project "${projectName}" archived successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive project");
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ProjectCard = ({ project, isArchived = false }: { project: Project; isArchived?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <Badge
                variant="secondary"
                className={
                  project.status === "active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "archived"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(project.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {formatDate(project.updated_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchiveProject(project.id, project.name)}
                  disabled={saving}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your strategic planning projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new strategic planning project. You'll be automatically
                added as the project owner.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-left block mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-left block mb-1.5">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ name: "", description: "" });
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-left block mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-left block mb-1.5">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Enter project description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingProject(null);
                setFormData({ name: "", description: "" });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">
            Active Projects ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Projects</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first project
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : archivedProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Archived Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Archived projects will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {archivedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isArchived />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Projects;
