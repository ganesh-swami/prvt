import { supabase } from "./supabase";
import { TeamDiscussion, DiscussionComment, TeamTask, TeamActivity } from "@/types";

// Team Discussions API
export const teamDiscussionsApi = {
  async getByProjectId(projectId: string): Promise<TeamDiscussion[]> {
    const { data, error } = await supabase
      .from("team_discussions")
      .select(`
        *,
        creator:created_by(id, name, email)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<TeamDiscussion | null> {
    const { data, error} = await supabase
      .from("team_discussions")
      .select(`
        *,
        creator:created_by(id, name, email),
        comments:discussion_comments(
          *,
          creator:created_by(id, name, email)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(discussion: Partial<TeamDiscussion>): Promise<TeamDiscussion> {
    const { data, error } = await supabase
      .from("team_discussions")
      .insert({
        ...discussion,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        creator:created_by(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("team_discussions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Discussion Comments API
export const discussionCommentsApi = {
  async getByDiscussionId(discussionId: string): Promise<DiscussionComment[]> {
    const { data, error } = await supabase
      .from("discussion_comments")
      .select(`
        *,
        creator:created_by(id, name, email)
      `)
      .eq("discussion_id", discussionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(comment: Partial<DiscussionComment>): Promise<DiscussionComment> {
    const { data, error } = await supabase
      .from("discussion_comments")
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        creator:created_by(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("discussion_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Team Tasks API
export const teamTasksApi = {
  async getByProjectId(projectId: string): Promise<TeamTask[]> {
    const { data, error } = await supabase
      .from("team_tasks")
      .select(`
        *,
        creator:created_by(id, name, email),
        assignee:assigned_to(id, name, email)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<TeamTask | null> {
    const { data, error } = await supabase
      .from("team_tasks")
      .select(`
        *,
        creator:created_by(id, name, email),
        assignee:assigned_to(id, name, email)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(task: Partial<TeamTask>): Promise<TeamTask> {
    // Convert empty strings to null for optional fields (due_date and description)
    const sanitizedTask = {
      ...task,
      due_date: task.due_date && task.due_date.trim() !== "" ? task.due_date : null,
      description: task.description && task.description.trim() !== "" ? task.description : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("team_tasks")
      .insert(sanitizedTask)
      .select(`
        *,
        creator:created_by(id, name, email),
        assignee:assigned_to(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<TeamTask>): Promise<TeamTask> {
    // Convert empty strings to null for optional fields (due_date and description)
    const sanitizedUpdates = {
      ...updates,
      due_date: updates.due_date !== undefined
        ? (updates.due_date && updates.due_date.trim() !== "" ? updates.due_date : null)
        : undefined,
      description: updates.description !== undefined
        ? (updates.description && updates.description.trim() !== "" ? updates.description : null)
        : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("team_tasks")
      .update(sanitizedUpdates)
      .eq("id", id)
      .select(`
        *,
        creator:created_by(id, name, email),
        assignee:assigned_to(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("team_tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Team Activities API
export const teamActivitiesApi = {
  async getByProjectId(projectId: string, limit: number = 50): Promise<TeamActivity[]> {
    const { data, error } = await supabase
      .from("team_activities")
      .select(`
        *,
        user:user_id(id, name, email)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async create(activity: Partial<TeamActivity>): Promise<TeamActivity> {
    const { data, error } = await supabase
      .from("team_activities")
      .insert({
        ...activity,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:user_id(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  },
};
