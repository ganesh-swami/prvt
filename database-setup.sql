-- Database Setup Script for PF_Strategize+
-- Run this in your Supabase SQL editor to set up the complete database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (if they don't exist)
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url text,
  subscription_tier text DEFAULT 'free'::text CHECK (subscription_tier = ANY (ARRAY['free'::text, 'pro'::text, 'business'::text, 'enterprise'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notification_preferences jsonb DEFAULT '{"mentions": true, "assignments": true, "email_enabled": true, "slack_enabled": false, "weekly_digest": true, "investor_updates": false}'::jsonb,
  slack_access_token text,
  slack_team_id text,
  slack_team_name text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  subscription_plan text DEFAULT 'starter'::text,
  subscription_status text DEFAULT 'active'::text,
  stripe_subscription_id text,
  stripe_customer_id text,
  subscription_period_end timestamp with time zone,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Organization members table
CREATE TABLE IF NOT EXISTS public.org_members (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT org_members_pkey PRIMARY KEY (org_id, user_id),
  CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT org_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid,
  template_id uuid,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  module_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Project collaborators table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  user_id uuid,
  role text DEFAULT 'viewer'::text CHECK (role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT project_collaborators_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT project_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Business plans table
CREATE TABLE IF NOT EXISTS public.business_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  vision text,
  mission text,
  value_proposition text,
  target_market text,
  business_model text,
  revenue_streams jsonb DEFAULT '[]'::jsonb,
  key_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  executive_summary text,
  problem_statement text,
  solution_description text,
  CONSTRAINT business_plans_pkey PRIMARY KEY (id),
  CONSTRAINT business_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Market assumptions table
CREATE TABLE IF NOT EXISTS public.market_assumptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tam numeric,
  sam numeric,
  som numeric,
  market_growth_rate numeric,
  assumptions jsonb DEFAULT '[]'::jsonb,
  validation_status text DEFAULT 'unvalidated'::text CHECK (validation_status = ANY (ARRAY['unvalidated'::text, 'testing'::text, 'validated'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT market_assumptions_pkey PRIMARY KEY (id),
  CONSTRAINT market_assumptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Pricing scenarios table
CREATE TABLE IF NOT EXISTS public.pricing_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  name text NOT NULL,
  pricing_model text CHECK (pricing_model = ANY (ARRAY['subscription'::text, 'one-time'::text, 'usage-based'::text, 'freemium'::text])),
  tiers jsonb DEFAULT '[]'::jsonb,
  assumptions jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  price_points jsonb,
  CONSTRAINT pricing_scenarios_pkey PRIMARY KEY (id),
  CONSTRAINT pricing_scenarios_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Financial models table
CREATE TABLE IF NOT EXISTS public.financial_models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  projections jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  project_id uuid,
  scenarios jsonb,
  assumptions jsonb,
  CONSTRAINT financial_models_pkey PRIMARY KEY (id),
  CONSTRAINT financial_models_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  name text NOT NULL,
  website text,
  pricing_model text,
  strengths text[],
  weaknesses text[],
  market_share numeric,
  revenue_estimate text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT competitors_pkey PRIMARY KEY (id),
  CONSTRAINT competitors_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  module text NOT NULL,
  section text NOT NULL,
  content text NOT NULL,
  author_id uuid,
  mentions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  module_id text,
  parent_comment_id uuid,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE,
  CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT comments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  title text NOT NULL,
  description text,
  assignee_id uuid,
  status text DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  assigned_to uuid,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type character varying NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT now(),
  user_id uuid,
  org_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  org_id uuid NOT NULL,
  plan_id text NOT NULL DEFAULT 'starter'::text,
  addons text[] NOT NULL DEFAULT '{}'::text[],
  seats integer NOT NULL DEFAULT 1,
  billing_cycle text NOT NULL DEFAULT 'annual'::text,
  renew_at date,
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text,
  grace_period_end timestamp with time zone,
  current_period_end timestamp with time zone,
  stripe_subscription_id text,
  stripe_customer_id text,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (org_id),
  CONSTRAINT subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Usage counters table
CREATE TABLE IF NOT EXISTS public.usage_counters (
  org_id uuid NOT NULL,
  feature text NOT NULL,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  allowance integer,
  CONSTRAINT usage_counters_pkey PRIMARY KEY (org_id, feature, period_start),
  CONSTRAINT usage_counters_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Mentions table
CREATE TABLE IF NOT EXISTS public.mentions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid,
  mentioned_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  CONSTRAINT mentions_pkey PRIMARY KEY (id),
  CONSTRAINT mentions_mentioned_user_id_fkey FOREIGN KEY (mentioned_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT mentions_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE
);

-- Drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  version integer DEFAULT 1,
  parent_draft_id uuid,
  CONSTRAINT drafts_pkey PRIMARY KEY (id),
  CONSTRAINT drafts_parent_draft_id_fkey FOREIGN KEY (parent_draft_id) REFERENCES public.drafts(id) ON DELETE SET NULL,
  CONSTRAINT drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create utility functions
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

-- Create function to get user's current organization
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

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Projects policies
DROP POLICY IF EXISTS "Users can view projects they own or collaborate on" ON projects;
CREATE POLICY "Users can view projects they own or collaborate on" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update projects they own" ON projects;
CREATE POLICY "Users can update projects they own" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete projects they own" ON projects;
CREATE POLICY "Users can delete projects they own" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- Business plans policies
DROP POLICY IF EXISTS "Users can view business plans for their projects" ON business_plans;
CREATE POLICY "Users can view business plans for their projects" ON business_plans
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage business plans for their projects" ON business_plans;
CREATE POLICY "Users can manage business plans for their projects" ON business_plans
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Similar policies for other project-related tables
DROP POLICY IF EXISTS "Users can view market assumptions for their projects" ON market_assumptions;
CREATE POLICY "Users can view market assumptions for their projects" ON market_assumptions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage market assumptions for their projects" ON market_assumptions;
CREATE POLICY "Users can manage market assumptions for their projects" ON market_assumptions
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Comments policies
DROP POLICY IF EXISTS "Users can view comments on their projects" ON comments;
CREATE POLICY "Users can view comments on their projects" ON comments
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create comments on projects they have access to" ON comments;
CREATE POLICY "Users can create comments on projects they have access to" ON comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

-- Tasks policies
DROP POLICY IF EXISTS "Users can view tasks on their projects" ON tasks;
CREATE POLICY "Users can view tasks on their projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage tasks on projects they can edit" ON tasks;
CREATE POLICY "Users can manage tasks on projects they can edit" ON tasks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_business_plans_project_id ON business_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_market_assumptions_project_id ON market_assumptions(project_id);
CREATE INDEX IF NOT EXISTS idx_pricing_scenarios_project_id ON pricing_scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_models_project_id ON financial_models(project_id);
CREATE INDEX IF NOT EXISTS idx_competitors_project_id ON competitors(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Insert sample data (optional)
-- You can uncomment and modify these to add sample data for testing

/*
-- Sample user
INSERT INTO users (id, email, name, subscription_tier) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User', 'free')
ON CONFLICT (id) DO NOTHING;

-- Sample organization
INSERT INTO organizations (id, name, subscription_plan, subscription_status)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Demo Organization', 'starter', 'active')
ON CONFLICT (id) DO NOTHING;

-- Link user to organization
INSERT INTO org_members (org_id, user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'owner')
ON CONFLICT (org_id, user_id) DO NOTHING;

-- Sample project
INSERT INTO projects (id, name, description, owner_id, status)
VALUES ('550e8400-e29b-41d4-a716-446655440002', 'Demo Project', 'A sample project for testing', '550e8400-e29b-41d4-a716-446655440000', 'active')
ON CONFLICT (id) DO NOTHING;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully!' as status;
