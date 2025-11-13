import { supabase } from "./supabase";
import { User } from "@/types";

// Database utility functions for authentication and user management
export const database = {
  // Authentication helpers
  async signUp(email: string, password: string, userData: { name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: userData,
      },
    });

    if (error) throw error;

    // Create user profile in public.users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        subscription_tier: "free",
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    // Sign out from all tabs/contexts and revoke refresh tokens
    const { error } = await supabase.auth.signOut({ scope: "global" as any });
    if (error) throw error;

    // Stop any realtime channels that might retrigger logic
    try {
      (supabase as any).removeAllChannels?.();
    } catch {}

    // Explicitly remove Supabase auth keys without wiping unrelated app storage
    try {
      const removeKeys = (storage: Storage) => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          if (key.startsWith("sb-") || key.startsWith("supabase.")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => storage.removeItem(k));
      };
      removeKeys(localStorage);
      removeKeys(sessionStorage);
    } catch {}

    // Clear cookies (best-effort)
    try {
      const rawCookies = document.cookie ? document.cookie.split(";") : [];
      const cookieNames = rawCookies
        .map((c) => c.split("=")[0].trim())
        .filter(Boolean);
      const hostname = window.location.hostname;
      const domainParts = hostname.split(".");
      const domains: string[] = [];
      // Current host
      domains.push(hostname);
      // Base domain (e.g., .example.com). Skip for localhost-like hosts
      if (
        domainParts.length > 1 &&
        !/^\d+\.\d+\.\d+\.\d+$/.test(hostname) &&
        hostname !== "localhost"
      ) {
        domains.push("." + domainParts.slice(-2).join("."));
      }
      const paths = ["/", window.location.pathname || "/"];
      const expirations = [
        new Date(0).toUTCString(),
        new Date(Date.now() - 86400000).toUTCString(),
      ];
      for (const name of cookieNames) {
        for (const path of paths) {
          // Without domain
          expirations.forEach((exp) => {
            document.cookie = `${name}=; expires=${exp}; path=${path}`;
          });
          // With domain variants
          for (const domain of domains) {
            expirations.forEach((exp) => {
              document.cookie = `${name}=; expires=${exp}; path=${path}; domain=${domain}`;
            });
          }
        }
      }
    } catch {}
  },

  async resetPasswordForEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

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

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Organization helpers
  async createUserOrganization(userId: string, orgName: string) {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        subscription_plan: "starter",
        subscription_status: "active",
      })
      .select()
      .single();

    if (orgError) throw orgError;

    console.log("Org created:", org);

    // Add user as owner
    const { data: orgMember, error: memberError } = await supabase
      .from("org_members")
      .insert({
        org_id: org.id,
        user_id: userId,
        role: "owner",
      });

    console.log("Member error:", memberError);

    if (memberError) throw memberError;

    console.log("Member created:", orgMember);

    // Create subscription record
    const { error: subError } = await supabase.from("subscriptions").insert({
      org_id: org.id,
      plan_id: "starter",
      addons: [],
      seats: 1,
      billing_cycle: "annual",
      status: "active",
    });

    if (subError) throw subError;

    return org;
  },

  // Usage tracking
  async trackUsage(orgId: string, feature: string, increment = 1) {
    const { error } = await supabase.rpc("increment_usage_counter", {
      p_org_id: orgId,
      p_feature: feature,
      p_period_start: new Date().toISOString().split("T")[0],
      p_increment: increment,
    });

    if (error) {
      console.error("Error tracking usage:", error);
    }
  },

  // Analytics
  async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string,
    orgId?: string
  ) {
    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties,
      user_id: userId,
      org_id: orgId,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Error tracking event:", error);
    }
  },

  // Notifications
  async createNotification(
    userId: string,
    type: string,
    message: string,
    metadata: Record<string, any> = {}
  ) {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      message,
      metadata,
      read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
    }
  },

  // Real-time subscriptions
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        callback
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `project_id=eq.${projectId}`,
        },
        callback
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToUserNotifications(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// Database functions that need to be created in Supabase
export const requiredDatabaseFunctions = `
-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage_counter(
  p_org_id UUID,
  p_feature TEXT,
  p_period_start DATE,
  p_increment INTEGER DEFAULT 1
)
RETURNS usage_counters AS $$
DECLARE
  result usage_counters;
BEGIN
  INSERT INTO usage_counters (org_id, feature, period_start, count)
  VALUES (p_org_id, p_feature, p_period_start, p_increment)
  ON CONFLICT (org_id, feature, period_start)
  DO UPDATE SET count = usage_counters.count + p_increment
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current organization
CREATE OR REPLACE FUNCTION get_user_current_org(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT om.org_id INTO org_id
  FROM org_members om
  WHERE om.user_id = p_user_id
  ORDER BY om.created_at ASC
  LIMIT 1;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_versions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization members policies
CREATE POLICY "Users can view org members for their organizations" ON org_members
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage members" ON org_members
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions for their organizations" ON subscriptions
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can manage subscriptions" ON subscriptions
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects they own or collaborate on" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update projects they own" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete projects they own" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- Project collaborators policies
CREATE POLICY "Users can view collaborators for their projects" ON project_collaborators
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Business plans policies
CREATE POLICY "Users can view business plans for their projects" ON business_plans
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create business plans for their projects" ON business_plans
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

CREATE POLICY "Users can update business plans for their projects" ON business_plans
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

-- Market assumptions policies
CREATE POLICY "Users can view market assumptions for their projects" ON market_assumptions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage market assumptions for their projects" ON market_assumptions
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

-- Pricing scenarios policies
CREATE POLICY "Users can view pricing scenarios for their projects" ON pricing_scenarios
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage pricing scenarios for their projects" ON pricing_scenarios
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

-- Financial models policies
CREATE POLICY "Users can view financial models for their projects" ON financial_models
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage financial models for their projects" ON financial_models
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

-- Competitors policies
CREATE POLICY "Users can view competitors for their projects" ON competitors
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage competitors for their projects" ON competitors
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments for their projects" ON comments
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments for their projects" ON comments
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or project owners can delete any" ON comments
  FOR DELETE USING (
    user_id = auth.uid() OR
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- Tasks policies
CREATE POLICY "Users can view tasks for their projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create tasks for their projects" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
    )
  );

CREATE POLICY "Users can update tasks assigned to them or that they created" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete tasks they created or project owners can delete any" ON tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Usage counters policies
CREATE POLICY "Users can view usage counters for their organizations" ON usage_counters
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage usage counters" ON usage_counters
  FOR ALL USING (true);

-- Drafts policies
CREATE POLICY "Users can view their own drafts" ON drafts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own drafts" ON drafts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own drafts" ON drafts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own drafts" ON drafts
  FOR DELETE USING (user_id = auth.uid());

-- Draft versions policies
CREATE POLICY "Users can view versions of their own drafts" ON draft_versions
  FOR SELECT USING (
    draft_id IN (
      SELECT id FROM drafts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create draft versions" ON draft_versions
  FOR INSERT WITH CHECK (
    draft_id IN (
      SELECT id FROM drafts WHERE user_id = auth.uid()
    )
  );
`;
