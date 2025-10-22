import { supabase } from "./supabase";
import {
  User,
  Organization,
  OrgMember,
  Project,
  ProjectCollaborator,
  BusinessPlan,
  SocialBusinessCanvas,
  ProblemTree,
  Stakeholder,
  EcosystemMapTimeline,
  EcosystemMapSharedNote,
  EcosystemMapTask,
  MarketAssumptions,
  PricingScenario,
  FinancialModel,
  Competitor,
  Risk,
  Comment,
  Task,
  Mention,
  Notification,
  AnalyticsEvent,
  Subscription,
  UsageCounter,
  Template,
  Draft,
} from "@/types";

// User API
export const userApi = {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  },

  async getProjectTeamMembers(projectId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("project_collaborators")
      .select(
        `
        user_id,
        users!project_collaborators_user_id_fkey (*)
      `
      )
      .eq("project_id", projectId);

    if (error) throw error;
    
    // Filter out null users and return User array
    return (data?.map((item) => item.users).filter(Boolean) as unknown as User[]) || [];
  },
};

// Organization API
export const organizationApi = {
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from("org_members")
      .select(
        `
        org_id,
        organizations!inner (
          id,
          name,
          created_at,
          subscription_plan,
          subscription_status,
          stripe_subscription_id,
          stripe_customer_id,
          subscription_period_end
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return (
      data
        ?.map((item: any) => item.organizations as Organization)
        .filter(Boolean) || []
    );
  },

  async createOrganization(
    name: string,
    ownerId: string
  ): Promise<Organization> {
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name })
      .select()
      .single();

    if (orgError) throw orgError;

    const { error: memberError } = await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: ownerId,
      role: "owner",
    });

    if (memberError) throw memberError;
    return org;
  },

  async getOrganizationMembers(orgId: string): Promise<OrgMember[]> {
    const { data, error } = await supabase
      .from("org_members")
      .select(
        `
        *,
        users (name, email, avatar_url)
      `
      )
      .eq("org_id", orgId);

    if (error) throw error;
    return data || [];
  },
};

// Project API
export const projectApi = {
  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  },

  async createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">
  ): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
  },

  async getProjectCollaborators(
    projectId: string
  ): Promise<ProjectCollaborator[]> {
    const { data, error } = await supabase
      .from("project_collaborators")
      .select(
        `
        *,
        users (name, email, avatar_url)
      `
      )
      .eq("project_id", projectId);

    if (error) throw error;
    return data || [];
  },
};

// Business Plan API
export const businessPlanApi = {
  async getByProjectId(projectId: string): Promise<BusinessPlan | null> {
    const { data, error } = await supabase
      .from("business_plans")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) return null;
    return data;
  },

  async create(
    businessPlan: Omit<BusinessPlan, "id" | "created_at" | "updated_at">
  ): Promise<BusinessPlan> {
    const { data, error } = await supabase
      .from("business_plans")
      .insert(businessPlan)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<BusinessPlan>
  ): Promise<BusinessPlan> {
    const { data, error } = await supabase
      .from("business_plans")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Social Business Canvas API
export const socialCanvasApi = {
  async getByProjectId(
    projectId: string
  ): Promise<SocialBusinessCanvas | null> {
    const { data, error } = await supabase
      .from("social_business_canvas")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"
    return data;
  },

  async create(
    canvas: Omit<SocialBusinessCanvas, "id" | "created_at" | "updated_at">
  ): Promise<SocialBusinessCanvas> {
    const { data, error } = await supabase
      .from("social_business_canvas")
      .insert(canvas)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<SocialBusinessCanvas>
  ): Promise<SocialBusinessCanvas> {
    const { data, error } = await supabase
      .from("social_business_canvas")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertByProjectId(
    projectId: string,
    canvasData: Partial<SocialBusinessCanvas>
  ): Promise<SocialBusinessCanvas> {
    const { data, error } = await supabase
      .from("social_business_canvas")
      .upsert(
        {
          project_id: projectId,
          ...canvasData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Problem Tree API
export const problemTreeApi = {
  async getByProjectId(projectId: string): Promise<ProblemTree | null> {
    const { data, error } = await supabase
      .from("problem_tree")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"
    return data;
  },

  async create(
    tree: Omit<ProblemTree, "id" | "created_at" | "updated_at">
  ): Promise<ProblemTree> {
    const { data, error } = await supabase
      .from("problem_tree")
      .insert(tree)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<ProblemTree>
  ): Promise<ProblemTree> {
    const { data, error } = await supabase
      .from("problem_tree")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertByProjectId(
    projectId: string,
    treeData: Partial<ProblemTree>
  ): Promise<ProblemTree> {
    const { data, error } = await supabase
      .from("problem_tree")
      .upsert(
        {
          project_id: projectId,
          ...treeData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Stakeholders API
export const stakeholdersApi = {
  async getAllByProjectId(projectId: string): Promise<Stakeholder[]> {
    const { data, error } = await supabase
      .from("stakeholders")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    stakeholder: Omit<Stakeholder, "id" | "created_at" | "updated_at">
  ): Promise<Stakeholder> {
    const { data, error } = await supabase
      .from("stakeholders")
      .insert(stakeholder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<Stakeholder>
  ): Promise<Stakeholder> {
    const { data, error } = await supabase
      .from("stakeholders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("stakeholders").delete().eq("id", id);

    if (error) throw error;
  },
};

// Ecosystem Map Timeline API
export const ecosystemTimelineApi = {
  async getAllByProjectId(projectId: string): Promise<EcosystemMapTimeline[]> {
    const { data, error } = await supabase
      .from("ecosystem_map_timeline")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    timeline: Omit<EcosystemMapTimeline, "id" | "created_at" | "updated_at">
  ): Promise<EcosystemMapTimeline> {
    const { data, error } = await supabase
      .from("ecosystem_map_timeline")
      .insert(timeline)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<EcosystemMapTimeline>
  ): Promise<EcosystemMapTimeline> {
    const { data, error } = await supabase
      .from("ecosystem_map_timeline")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("ecosystem_map_timeline")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Ecosystem Map Shared Notes API
export const ecosystemNotesApi = {
  async getAllByProjectId(
    projectId: string
  ): Promise<EcosystemMapSharedNote[]> {
    const { data, error } = await supabase
      .from("ecosystem_map_shared_note")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    note: Omit<EcosystemMapSharedNote, "id" | "created_at" | "updated_at">
  ): Promise<EcosystemMapSharedNote> {
    const { data, error } = await supabase
      .from("ecosystem_map_shared_note")
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<EcosystemMapSharedNote>
  ): Promise<EcosystemMapSharedNote> {
    const { data, error } = await supabase
      .from("ecosystem_map_shared_note")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("ecosystem_map_shared_note")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Ecosystem Map Tasks/Reminders API
export const ecosystemTasksApi = {
  async getAllByProjectId(projectId: string): Promise<EcosystemMapTask[]> {
    const { data, error } = await supabase
      .from("ecosystem_map_task")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(
    task: Omit<EcosystemMapTask, "id" | "created_at" | "updated_at">
  ): Promise<EcosystemMapTask> {
    const { data, error } = await supabase
      .from("ecosystem_map_task")
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<EcosystemMapTask>
  ): Promise<EcosystemMapTask> {
    const { data, error } = await supabase
      .from("ecosystem_map_task")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async complete(id: string): Promise<EcosystemMapTask> {
    const { data, error } = await supabase
      .from("ecosystem_map_task")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("ecosystem_map_task")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};

// Market Assumptions API
export const marketAssumptionsApi = {
  async getByProjectId(projectId: string): Promise<MarketAssumptions | null> {
    const { data, error } = await supabase
      .from("market_assumptions")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) return null;
    return data;
  },

  async create(
    assumptions: Omit<MarketAssumptions, "id" | "created_at" | "updated_at">
  ): Promise<MarketAssumptions> {
    const { data, error } = await supabase
      .from("market_assumptions")
      .insert(assumptions)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<MarketAssumptions>
  ): Promise<MarketAssumptions> {
    const { data, error } = await supabase
      .from("market_assumptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Pricing Scenarios API
export const pricingScenariosApi = {
  async getByProjectId(projectId: string): Promise<PricingScenario[]> {
    const { data, error } = await supabase
      .from("pricing_scenarios")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    scenario: Omit<PricingScenario, "id" | "created_at" | "updated_at">
  ): Promise<PricingScenario> {
    const { data, error } = await supabase
      .from("pricing_scenarios")
      .insert(scenario)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<PricingScenario>
  ): Promise<PricingScenario> {
    const { data, error } = await supabase
      .from("pricing_scenarios")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("pricing_scenarios")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Financial Models API
export const financialModelsApi = {
  async getByProjectId(projectId: string): Promise<FinancialModel[]> {
    const { data, error } = await supabase
      .from("financial_models")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    model: Omit<FinancialModel, "id" | "created_at" | "updated_at">
  ): Promise<FinancialModel> {
    const { data, error } = await supabase
      .from("financial_models")
      .insert(model)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<FinancialModel>
  ): Promise<FinancialModel> {
    const { data, error } = await supabase
      .from("financial_models")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Competitors API
export const competitorsApi = {
  async getByProjectId(projectId: string): Promise<Competitor[]> {
    const { data, error } = await supabase
      .from("competitors")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    competitor: Omit<Competitor, "id" | "created_at" | "updated_at">
  ): Promise<Competitor> {
    const { data, error } = await supabase
      .from("competitors")
      .insert(competitor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Competitor>): Promise<Competitor> {
    const { data, error } = await supabase
      .from("competitors")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("competitors").delete().eq("id", id);

    if (error) throw error;
  },
};

// Risks API
export const risksApi = {
  async getByProjectId(projectId: string): Promise<Risk[]> {
    const { data, error } = await supabase
      .from("risks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(risk: Omit<Risk, "id" | "created_at" | "updated_at">): Promise<Risk> {
    const { data, error } = await supabase
      .from("risks")
      .insert(risk)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Risk>): Promise<Risk> {
    const { data, error } = await supabase
      .from("risks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("risks").delete().eq("id", id);

    if (error) throw error;
  },
};

// Comments API
export const commentsApi = {
  async getByProject(
    projectId: string,
    module?: string,
    section?: string
  ): Promise<Comment[]> {
    let query = supabase
      .from("comments")
      .select(
        `
        *,
        users!comments_author_id_fkey (name, avatar_url)
      `
      )
      .eq("project_id", projectId);

    if (module) query = query.eq("module", module);
    if (section) query = query.eq("section", section);

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) throw error;
    return (
      data?.map((comment) => ({
        ...comment,
        author: comment.users
          ? {
              name: comment.users.name,
              avatar_url: comment.users.avatar_url,
            }
          : undefined,
      })) || []
    );
  },

  async create(
    comment: Omit<Comment, "id" | "created_at" | "updated_at" | "author">
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select(
        `
        *,
        users!comments_author_id_fkey (name, avatar_url)
      `
      )
      .single();

    if (error) throw error;
    return {
      ...data,
      author: data.users
        ? {
            name: data.users.name,
            avatar_url: data.users.avatar_url,
          }
        : undefined,
    };
  },

  async update(id: string, updates: Partial<Comment>): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        `
        *,
        users!comments_author_id_fkey (name, avatar_url)
      `
      )
      .single();

    if (error) throw error;
    return {
      ...data,
      author: data.users
        ? {
            name: data.users.name,
            avatar_url: data.users.avatar_url,
          }
        : undefined,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) throw error;
  },
};

// Tasks API
export const tasksApi = {
  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        assignee:users!tasks_assignee_id_fkey (name, avatar_url)
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (
      data?.map((task) => ({
        ...task,
        assignee: task.assignee
          ? {
              name: task.assignee.name,
              avatar_url: task.assignee.avatar_url,
            }
          : undefined,
      })) || []
    );
  },

  async create(
    task: Omit<Task, "id" | "created_at" | "updated_at" | "assignee">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select(
        `
        *,
        assignee:users!tasks_assignee_id_fkey (name, avatar_url)
      `
      )
      .single();

    if (error) throw error;
    return {
      ...data,
      assignee: data.assignee
        ? {
            name: data.assignee.name,
            avatar_url: data.assignee.avatar_url,
          }
        : undefined,
    };
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        `
        *,
        assignee:users!tasks_assignee_id_fkey (name, avatar_url)
      `
      )
      .single();

    if (error) throw error;
    return {
      ...data,
      assignee: data.assignee
        ? {
            name: data.assignee.name,
            avatar_url: data.assignee.avatar_url,
          }
        : undefined,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
  },
};

// Notifications API
export const notificationsApi = {
  async getByUser(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async create(
    notification: Omit<Notification, "id" | "created_at" | "updated_at">
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Analytics API
export const analyticsApi = {
  async trackEvent(
    event: Omit<AnalyticsEvent, "id" | "timestamp" | "created_at">
  ): Promise<void> {
    const { error } = await supabase.from("analytics_events").insert({
      ...event,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  },

  async getEvents(filters: {
    user_id?: string;
    org_id?: string;
    event_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AnalyticsEvent[]> {
    let query = supabase.from("analytics_events").select("*");

    if (filters.user_id) query = query.eq("user_id", filters.user_id);
    if (filters.org_id) query = query.eq("org_id", filters.org_id);
    if (filters.event_name) query = query.eq("event_name", filters.event_name);
    if (filters.start_date) query = query.gte("timestamp", filters.start_date);
    if (filters.end_date) query = query.lte("timestamp", filters.end_date);

    const { data, error } = await query
      .order("timestamp", { ascending: false })
      .limit(filters.limit || 100);

    if (error) throw error;
    return data || [];
  },
};

// Usage Counters API
export const usageCountersApi = {
  async getUsage(
    orgId: string,
    feature: string,
    periodStart?: string
  ): Promise<UsageCounter | null> {
    const period = periodStart || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("usage_counters")
      .select("*")
      .eq("org_id", orgId)
      .eq("feature", feature)
      .eq("period_start", period)
      .single();

    if (error) return null;
    return data;
  },

  async incrementUsage(
    orgId: string,
    feature: string,
    increment = 1
  ): Promise<UsageCounter> {
    const periodStart = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("increment_usage_counter", {
      p_org_id: orgId,
      p_feature: feature,
      p_period_start: periodStart,
      p_increment: increment,
    });

    if (error) throw error;
    return data;
  },
};

// Templates API
export const templatesApi = {
  async getAll(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
  }): Promise<Template[]> {
    let query = supabase.from("templates").select("*");

    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.featured) query = query.eq("is_featured", filters.featured);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  },
};

// Drafts API
export const draftsApi = {
  async getByUser(userId: string): Promise<Draft[]> {
    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    draft: Omit<Draft, "id" | "created_at" | "updated_at">
  ): Promise<Draft> {
    const { data, error } = await supabase
      .from("drafts")
      .insert(draft)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Draft>): Promise<Draft> {
    const { data, error } = await supabase
      .from("drafts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("drafts").delete().eq("id", id);

    if (error) throw error;
  },
};

// GTM Plans API
export const gtmPlansApi = {
  async getByProjectId(projectId: string): Promise<any> {
    const { data, error } = await supabase
      .from("gtm_plans")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      // If no plan exists yet, return null
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(plan: any): Promise<any> {
    const { data, error } = await supabase
      .from("gtm_plans")
      .insert({
        ...plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from("gtm_plans")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("gtm_plans").delete().eq("id", id);

    if (error) throw error;
  },
};
