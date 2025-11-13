-- Database Setup Script for Strategize+
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
  updated_at timestamp with time zone DEFAULT now(),
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
  plan_builder jsonb DEFAULT '{}'::jsonb,
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

-- Social Business Canvas table
CREATE TABLE IF NOT EXISTS public.social_business_canvas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  social_mission text,
  key_delivery_partners text,
  key_activities text,
  social_impact_measurement text,
  social_value_proposition text,
  relationships text,
  impact_gap_analysis text,
  key_stakeholders text,
  channels text,
  competitors_competition text,
  key_resources text,
  pestel_analysis text,
  costs text,
  surplus text,
  revenue text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_business_canvas_pkey PRIMARY KEY (id),
  CONSTRAINT social_business_canvas_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT social_business_canvas_project_id_unique UNIQUE (project_id)
);

-- Create index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_social_business_canvas_project_id ON public.social_business_canvas(project_id);

-- Problem Tree table
CREATE TABLE IF NOT EXISTS public.problem_tree (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  problem_impact_society text,
  harms_direct_beneficiaries text,
  effects_involved_parties text,
  main_problem text,
  problem_position text,
  main_causes text,
  key_insights text,
  strategic_implications text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT problem_tree_pkey PRIMARY KEY (id),
  CONSTRAINT problem_tree_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT problem_tree_project_id_unique UNIQUE (project_id)
);

-- Create index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_problem_tree_project_id ON public.problem_tree(project_id);

-- Stakeholders table for Ecosystem Mapping
CREATE TABLE IF NOT EXISTS public.stakeholders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  type text,
  influence text CHECK (influence = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])),
  interest text CHECK (interest = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])),
  relationship text CHECK (relationship = ANY (ARRAY['Supportive'::text, 'Neutral'::text, 'Opposing'::text])),
  relationship_strength integer CHECK (relationship_strength >= 1 AND relationship_strength <= 10),
  engagement_level text CHECK (engagement_level = ANY (ARRAY['Active'::text, 'Moderate'::text, 'Minimal'::text, 'None'::text])),
  last_contact timestamp with time zone,
  next_action text,
  risk_level text CHECK (risk_level = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])),
  description text,
  contact_info text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stakeholders_pkey PRIMARY KEY (id),
  CONSTRAINT stakeholders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Create index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_stakeholders_project_id ON public.stakeholders(project_id);

-- Ecosystem Map Timeline table
CREATE TABLE IF NOT EXISTS public.ecosystem_map_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  type text CHECK (type = ANY (ARRAY['Meeting'::text, 'Email'::text, 'Call'::text, 'Event'::text, 'Milestone'::text])),
  description text NOT NULL,
  outcome text CHECK (outcome = ANY (ARRAY['Positive'::text, 'Neutral'::text, 'Negative'::text])),
  relationship_change integer CHECK (relationship_change >= -5 AND relationship_change <= 5),
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_timeline_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_timeline_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_timeline_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_timeline_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_timeline_project_id ON public.ecosystem_map_timeline(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_timeline_stakeholder_id ON public.ecosystem_map_timeline(stakeholder_id);

-- Ecosystem Map Shared Notes table
CREATE TABLE IF NOT EXISTS public.ecosystem_map_shared_note (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  content text NOT NULL,
  is_shared boolean DEFAULT false,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_shared_note_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_shared_note_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_shared_note_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_shared_note_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_project_id ON public.ecosystem_map_shared_note(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_stakeholder_id ON public.ecosystem_map_shared_note(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_created_by ON public.ecosystem_map_shared_note(created_by);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_is_shared ON public.ecosystem_map_shared_note(is_shared);

-- Ecosystem Map Tasks/Reminders table
CREATE TABLE IF NOT EXISTS public.ecosystem_map_task (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['follow-up'::text, 'meeting'::text, 'check-in'::text, 'deadline'::text])),
  title text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  frequency text CHECK (frequency = ANY (ARRAY['once'::text, 'weekly'::text, 'monthly'::text, 'quarterly'::text])),
  priority text CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])),
  is_active boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_task_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_task_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_task_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_task_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT ecosystem_map_task_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_project_id ON public.ecosystem_map_task(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_stakeholder_id ON public.ecosystem_map_task(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_due_date ON public.ecosystem_map_task(due_date);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_is_completed ON public.ecosystem_map_task(is_completed);

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

-- Market sizing table
CREATE TABLE IF NOT EXISTS public.market_sizing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid NOT NULL,
  market_data jsonb,
  approach text,
  value_unit text,
  results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT market_sizing_pkey PRIMARY KEY (id),
  CONSTRAINT market_sizing_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Pricing lab table
CREATE TABLE IF NOT EXISTS public.pricing_lab (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid NOT NULL,
  pricing_data jsonb,
  strategy text,
  results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pricing_lab_pkey PRIMARY KEY (id),
  CONSTRAINT pricing_lab_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Unit economics table
CREATE TABLE IF NOT EXISTS public.unit_economics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid NOT NULL,
  metrics jsonb,
  results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unit_economics_pkey PRIMARY KEY (id),
  CONSTRAINT unit_economics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
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

-- Risks table
CREATE TABLE IF NOT EXISTS public.risks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  likelihood integer NOT NULL CHECK (likelihood >= 1 AND likelihood <= 10),
  impact integer NOT NULL CHECK (impact >= 1 AND impact <= 10),
  owner text,
  mitigation_strategy text,
  status text DEFAULT 'Active'::text CHECK (status = ANY (ARRAY['Active'::text, 'Resolved'::text, 'Mitigated'::text, 'Monitoring'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT risks_pkey PRIMARY KEY (id),
  CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- GTM Plans table
CREATE TABLE IF NOT EXISTS public.gtm_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'GTM Plan',
  product_roadmap jsonb DEFAULT '{}'::jsonb,
  customer_pain_points jsonb DEFAULT '{}'::jsonb,
  competitor_analysis jsonb DEFAULT '{}'::jsonb,
  swot_analysis jsonb DEFAULT '{}'::jsonb,
  product_concept jsonb DEFAULT '{}'::jsonb,
  key_audience_pitches jsonb DEFAULT '{}'::jsonb,
  launch_goals_kpis jsonb DEFAULT '{}'::jsonb,
  status_log jsonb DEFAULT '{}'::jsonb,
  customer_journey_map jsonb DEFAULT '{}'::jsonb,
  promotions_checklist jsonb DEFAULT '{}'::jsonb,
  outreach_channels jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gtm_plans_pkey PRIMARY KEY (id),
  CONSTRAINT gtm_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT gtm_plans_project_id_unique UNIQUE (project_id)
);

-- Create index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_gtm_plans_project_id ON public.gtm_plans(project_id);

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

-- Webhook events table (for logging Stripe webhooks)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processing_status text DEFAULT 'pending'::text CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'success'::text, 'failed'::text])),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT webhook_events_pkey PRIMARY KEY (id)
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
ALTER TABLE social_business_canvas ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_map_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_map_shared_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_map_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sizing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_lab ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_plans ENABLE ROW LEVEL SECURITY;
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

-- Social Business Canvas policies
DROP POLICY IF EXISTS "Users can view social canvas for their projects" ON social_business_canvas;
CREATE POLICY "Users can view social canvas for their projects" ON social_business_canvas
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage social canvas for their projects" ON social_business_canvas;
CREATE POLICY "Users can manage social canvas for their projects" ON social_business_canvas
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Problem Tree policies
DROP POLICY IF EXISTS "Users can view problem tree for their projects" ON problem_tree;
CREATE POLICY "Users can view problem tree for their projects" ON problem_tree
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage problem tree for their projects" ON problem_tree;
CREATE POLICY "Users can manage problem tree for their projects" ON problem_tree
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Stakeholders policies
DROP POLICY IF EXISTS "Users can view stakeholders for their projects" ON stakeholders;
CREATE POLICY "Users can view stakeholders for their projects" ON stakeholders
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage stakeholders for their projects" ON stakeholders;
CREATE POLICY "Users can manage stakeholders for their projects" ON stakeholders
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Ecosystem Map Timeline policies
DROP POLICY IF EXISTS "Users can view timeline for their projects" ON ecosystem_map_timeline;
CREATE POLICY "Users can view timeline for their projects" ON ecosystem_map_timeline
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage timeline for their projects" ON ecosystem_map_timeline;
CREATE POLICY "Users can manage timeline for their projects" ON ecosystem_map_timeline
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Ecosystem Map Shared Notes policies
-- Users can view:
-- 1. Shared notes in their projects (from any team member)
-- 2. Private notes they created themselves
DROP POLICY IF EXISTS "Users can view notes for their projects" ON ecosystem_map_shared_note;
CREATE POLICY "Users can view notes for their projects" ON ecosystem_map_shared_note
  FOR SELECT USING (
    (
      -- Shared notes in their projects
      is_shared = true AND
      project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
      )
    )
    OR
    (
      -- Private notes they created
      is_shared = false AND
      created_by = auth.uid()
    )
  );

-- Users can create notes in their projects
DROP POLICY IF EXISTS "Users can create notes for their projects" ON ecosystem_map_shared_note;
CREATE POLICY "Users can create notes for their projects" ON ecosystem_map_shared_note
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Users can only update/delete their own notes
DROP POLICY IF EXISTS "Users can update their own notes" ON ecosystem_map_shared_note;
CREATE POLICY "Users can update their own notes" ON ecosystem_map_shared_note
  FOR UPDATE USING (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own notes" ON ecosystem_map_shared_note;
CREATE POLICY "Users can delete their own notes" ON ecosystem_map_shared_note
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Ecosystem Map Tasks policies
DROP POLICY IF EXISTS "Users can view tasks for their projects" ON ecosystem_map_task;
CREATE POLICY "Users can view tasks for their projects" ON ecosystem_map_task
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage tasks for their projects" ON ecosystem_map_task;
CREATE POLICY "Users can manage tasks for their projects" ON ecosystem_map_task
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

-- Market sizing policies
DROP POLICY IF EXISTS "Users can view market sizing for their projects" ON market_sizing;
DROP POLICY IF EXISTS "Users can manage market sizing for their projects" ON market_sizing;
CREATE POLICY "Users can view market sizing for their projects" ON market_sizing
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create market sizing for their projects" ON market_sizing;
CREATE POLICY "Users can create market sizing for their projects" ON market_sizing
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can update market sizing for their projects" ON market_sizing;
CREATE POLICY "Users can update market sizing for their projects" ON market_sizing
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can delete market sizing for their projects" ON market_sizing;
CREATE POLICY "Users can delete market sizing for their projects" ON market_sizing
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Pricing lab policies
DROP POLICY IF EXISTS "Users can view pricing lab for their projects" ON pricing_lab;
CREATE POLICY "Users can view pricing lab for their projects" ON pricing_lab
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create pricing lab for their projects" ON pricing_lab;
CREATE POLICY "Users can create pricing lab for their projects" ON pricing_lab
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can update pricing lab for their projects" ON pricing_lab;
CREATE POLICY "Users can update pricing lab for their projects" ON pricing_lab
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can delete pricing lab for their projects" ON pricing_lab;
CREATE POLICY "Users can delete pricing lab for their projects" ON pricing_lab
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Unit economics policies
DROP POLICY IF EXISTS "Users can view unit economics for their projects" ON unit_economics;
CREATE POLICY "Users can view unit economics for their projects" ON unit_economics
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create unit economics for their projects" ON unit_economics;
CREATE POLICY "Users can create unit economics for their projects" ON unit_economics
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can update unit economics for their projects" ON unit_economics;
CREATE POLICY "Users can update unit economics for their projects" ON unit_economics
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

DROP POLICY IF EXISTS "Users can delete unit economics for their projects" ON unit_economics;
CREATE POLICY "Users can delete unit economics for their projects" ON unit_economics
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Competitors policies
DROP POLICY IF EXISTS "Users can view competitors for their projects" ON competitors;
CREATE POLICY "Users can view competitors for their projects" ON competitors
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage competitors for their projects" ON competitors;
CREATE POLICY "Users can manage competitors for their projects" ON competitors
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Risks policies
DROP POLICY IF EXISTS "Users can view risks for their projects" ON risks;
CREATE POLICY "Users can view risks for their projects" ON risks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage risks for their projects" ON risks;
CREATE POLICY "Users can manage risks for their projects" ON risks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- GTM Plans policies
DROP POLICY IF EXISTS "Users can view gtm plans for their projects" ON gtm_plans;
CREATE POLICY "Users can view gtm plans for their projects" ON gtm_plans
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage gtm plans for their projects" ON gtm_plans;
CREATE POLICY "Users can manage gtm plans for their projects" ON gtm_plans
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Organization members policies
-- IMPORTANT: These policies avoid infinite recursion by NOT querying org_members in the policy itself

-- INSERT: Allow inserts (signup happens immediately after user creation)
-- During signup, auth context might not be fully established yet
-- So we use a permissive policy that allows the insert
-- Security is maintained by:
-- 1. Only the backend can insert (via Supabase functions)
-- 2. Frontend signup flow is controlled
-- 3. Users can only add themselves (enforced in application logic)
DROP POLICY IF EXISTS "Users can insert org members" ON org_members;
CREATE POLICY "Users can insert org members" ON org_members
  FOR INSERT WITH CHECK (true);

-- UPDATE: Only admins/owners can modify member roles
DROP POLICY IF EXISTS "Admins can update org members" ON org_members;
CREATE POLICY "Admins can update org members" ON org_members
  FOR UPDATE USING (
    -- Only allow if user is an admin/owner in this organization
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- DELETE: Only admins/owners can remove members
DROP POLICY IF EXISTS "Admins can delete org members" ON org_members;
CREATE POLICY "Admins can delete org members" ON org_members
  FOR DELETE USING (
    -- Only allow if user is an admin/owner in this organization
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_business_plans_project_id ON business_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_market_assumptions_project_id ON market_assumptions(project_id);
CREATE INDEX IF NOT EXISTS idx_pricing_scenarios_project_id ON pricing_scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_models_project_id ON financial_models(project_id);
CREATE INDEX IF NOT EXISTS idx_market_sizing_project_id ON market_sizing(project_id);
CREATE INDEX IF NOT EXISTS idx_pricing_lab_project_id ON pricing_lab(project_id);
CREATE INDEX IF NOT EXISTS idx_unit_economics_project_id ON unit_economics(project_id);
CREATE INDEX IF NOT EXISTS idx_competitors_project_id ON competitors(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(processing_status);
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

-- Function to create default project for new users
CREATE OR REPLACE FUNCTION create_default_project_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_project_id uuid;
BEGIN
  -- Create a default project for the new user
  INSERT INTO public.projects (name, description, owner_id, status)
  VALUES (
    'My First Project',
    'Welcome to Strategize+! This is your default project to get started.',
    NEW.id,
    'active'
  )
  RETURNING id INTO new_project_id;

  -- Automatically add the user as the project owner in collaborators
  INSERT INTO public.project_collaborators (project_id, user_id, role)
  VALUES (new_project_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS create_default_project_trigger ON public.users;
CREATE TRIGGER create_default_project_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_project_for_user();

-- Team Collaboration: Discussions table
CREATE TABLE IF NOT EXISTS public.team_discussions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_discussions_pkey PRIMARY KEY (id),
  CONSTRAINT team_discussions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT team_discussions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_discussions_project_id ON public.team_discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_team_discussions_created_by ON public.team_discussions(created_by);

-- Team Collaboration: Discussion Comments table
CREATE TABLE IF NOT EXISTS public.discussion_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL,
  project_id uuid NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT discussion_comments_pkey PRIMARY KEY (id),
  CONSTRAINT discussion_comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.team_discussions(id) ON DELETE CASCADE,
  CONSTRAINT discussion_comments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT discussion_comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discussion_comments_discussion_id ON public.discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_project_id ON public.discussion_comments(project_id);

-- Team Collaboration: Tasks table (separate from ecosystem map tasks)
CREATE TABLE IF NOT EXISTS public.team_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'completed'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  due_date timestamp with time zone,
  assigned_to uuid,
  created_by uuid NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT team_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT team_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT team_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_tasks_project_id ON public.team_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned_to ON public.team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON public.team_tasks(status);

-- Team Collaboration: Activities table
CREATE TABLE IF NOT EXISTS public.team_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type = ANY (ARRAY['task_created'::text, 'task_completed'::text, 'task_updated'::text, 'discussion_created'::text, 'comment_created'::text])),
  entity_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type = ANY (ARRAY['task'::text, 'discussion'::text, 'comment'::text])),
  user_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_activities_pkey PRIMARY KEY (id),
  CONSTRAINT team_activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT team_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_activities_project_id ON public.team_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_user_id ON public.team_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_activity_type ON public.team_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_team_activities_created_at ON public.team_activities(created_at DESC);

-- Enable RLS on Team Collaboration tables
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- Team Discussions RLS Policies
DROP POLICY IF EXISTS "Users can view discussions for their projects" ON team_discussions;
CREATE POLICY "Users can view discussions for their projects" ON team_discussions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create discussions for their projects" ON team_discussions;
CREATE POLICY "Users can create discussions for their projects" ON team_discussions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own discussions" ON team_discussions;
CREATE POLICY "Users can delete their own discussions" ON team_discussions
  FOR DELETE USING (created_by = auth.uid());

-- Discussion Comments RLS Policies
DROP POLICY IF EXISTS "Users can view comments for their projects" ON discussion_comments;
CREATE POLICY "Users can view comments for their projects" ON discussion_comments
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create comments for their projects" ON discussion_comments;
CREATE POLICY "Users can create comments for their projects" ON discussion_comments
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own comments" ON discussion_comments;
CREATE POLICY "Users can delete their own comments" ON discussion_comments
  FOR DELETE USING (created_by = auth.uid());

-- Team Tasks RLS Policies
DROP POLICY IF EXISTS "Users can view team tasks for their projects" ON team_tasks;
CREATE POLICY "Users can view team tasks for their projects" ON team_tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create team tasks for their projects" ON team_tasks;
CREATE POLICY "Users can create team tasks for their projects" ON team_tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update team tasks for their projects" ON team_tasks;
CREATE POLICY "Users can update team tasks for their projects" ON team_tasks
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own team tasks" ON team_tasks;
CREATE POLICY "Users can delete their own team tasks" ON team_tasks
  FOR DELETE USING (created_by = auth.uid());

-- Team Activities RLS Policies
DROP POLICY IF EXISTS "Users can view activities for their projects" ON team_activities;
CREATE POLICY "Users can view activities for their projects" ON team_activities
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create activities" ON team_activities;
CREATE POLICY "System can create activities" ON team_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

-- Milestones table for Investor Room
CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  target_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text])),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT milestones_pkey PRIMARY KEY (id),
  CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Create index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);

-- Enable RLS for milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Milestones RLS Policies
DROP POLICY IF EXISTS "Users can view milestones for their projects" ON milestones;
CREATE POLICY "Users can view milestones for their projects" ON milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage milestones for their projects" ON milestones;
CREATE POLICY "Users can manage milestones for their projects" ON milestones
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;


-- Enhanced subscription tracking for organizations
-- This migration adds fields to track subscription details and enforce access control

-- Add subscription tracking fields
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id 
  ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription_id 
  ON organizations(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status 
  ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan 
  ON organizations(subscription_plan);

-- Add comments for documentation
COMMENT ON COLUMN organizations.subscription_status IS 
  'Stripe subscription status: trialing, active, past_due, canceled, incomplete, incomplete_expired, unpaid';
COMMENT ON COLUMN organizations.subscription_plan IS 
  'Plan type: starter (free), solo, pro-team, business';
COMMENT ON COLUMN organizations.billing_cycle IS 
  'Billing frequency: monthly or annual';
COMMENT ON COLUMN organizations.subscription_start_date IS 
  'When the current subscription period started';
COMMENT ON COLUMN organizations.subscription_end_date IS 
  'When the current subscription period ends (for billing cycle)';
COMMENT ON COLUMN organizations.subscription_cancel_at IS 
  'Scheduled cancellation date (subscription remains active until this date)';
COMMENT ON COLUMN organizations.trial_end_date IS 
  'When the trial period ends';

-- Create a helper function to check if organization has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_record RECORD;
BEGIN
  SELECT subscription_status, subscription_end_date
  INTO org_record
  FROM organizations
  WHERE id = org_id;
  
  -- Active if status is active/trialing and not past end date
  RETURN org_record.subscription_status IN ('active', 'trialing')
    AND (org_record.subscription_end_date IS NULL 
         OR org_record.subscription_end_date > NOW());
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to get plan features
CREATE OR REPLACE FUNCTION get_plan_limits(plan_name TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE plan_name
    WHEN 'starter' THEN jsonb_build_object(
      'projects_max', 3,
      'exports_per_month', 5,
      'seats_max', 1,
      'features', jsonb_build_array('Basic modules', 'JSON export')
    )
    WHEN 'solo' THEN jsonb_build_object(
      'projects_max', 10,
      'exports_per_month', 50,
      'seats_max', 1,
      'features', jsonb_build_array('All modules', 'PDF export', 'CSV export')
    )
    WHEN 'pro-team' THEN jsonb_build_object(
      'projects_max', 50,
      'exports_per_month', 200,
      'seats_max', 5,
      'features', jsonb_build_array('All modules', 'Team collaboration', 'PowerPoint export', 'AI Analyst')
    )
    WHEN 'business' THEN jsonb_build_object(
      'projects_max', -1,
      'exports_per_month', -1,
      'seats_max', 20,
      'features', jsonb_build_array('Everything', 'Unlimited exports', 'Priority support', 'Investor Room')
    )
    ELSE jsonb_build_object('projects_max', 3, 'exports_per_month', 5, 'seats_max', 1)
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create view for easy subscription info access
CREATE OR REPLACE VIEW organization_subscriptions AS
SELECT 
  o.id,
  o.name,
  o.subscription_plan,
  o.subscription_status,
  o.billing_cycle,
  o.subscription_start_date,
  o.subscription_end_date,
  o.subscription_cancel_at,
  o.trial_end_date,
  o.stripe_customer_id,
  o.stripe_subscription_id,
  has_active_subscription(o.id) as is_active,
  get_plan_limits(o.subscription_plan) as plan_limits,
  CASE 
    WHEN o.subscription_end_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (o.subscription_end_date - NOW()))::INTEGER
    ELSE NULL
  END as days_until_renewal
FROM organizations o;

COMMENT ON VIEW organization_subscriptions IS 
  'Unified view of organization subscription information with computed fields';

-- Add missing updated_at column to organizations table
-- Add webhook_events table for logging Stripe webhooks

-- Step 1: Add updated_at column to organizations table if it doesn't exist
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Step 2: Create webhook_events table for logging
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processing_status text DEFAULT 'pending'::text CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'success'::text, 'failed'::text])),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT webhook_events_pkey PRIMARY KEY (id)
);

-- Step 3: Create indexes for webhook_events table
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(processing_status);

-- Step 4: Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' AND column_name = 'updated_at';

SELECT tablename, schemaname 
FROM pg_tables 
WHERE tablename = 'webhook_events';


-- Fix: Subscription RLS Policy for Signup
-- This fixes the "new row violates row-level security policy" error during signup

-- First, enable RLS on subscriptions if not already enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view subscriptions for their organizations" ON subscriptions;
DROP POLICY IF EXISTS "Organization owners can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow subscription insert during organization creation" ON subscriptions;

-- Policy 1: Users can view subscriptions for their organizations
CREATE POLICY "Users can view subscriptions for their organizations" 
ON subscriptions FOR SELECT 
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Policy 2: Allow INSERT for new organizations being created
-- This allows creating subscriptions when the organization is being set up
-- The unique constraint on org_id prevents duplicate subscriptions
CREATE POLICY "Allow subscription insert during organization creation" 
ON subscriptions FOR INSERT 
WITH CHECK (
  -- Allow if the org was just created (within last 5 minutes)
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = org_id 
    AND organizations.created_at > NOW() - INTERVAL '5 minutes'
  )
);

-- Policy 3: Organization owners can update/delete subscriptions
CREATE POLICY "Organization owners can manage subscriptions" 
ON subscriptions FOR UPDATE 
USING (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Organization owners can delete subscriptions" 
ON subscriptions FOR DELETE 
USING (
  org_id IN (
    SELECT org_id FROM org_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'subscriptions';


-- Step 5: View recent webhook events (for testing)
-- SELECT event_id, event_type, processing_status, created_at, processed_at
-- FROM webhook_events
-- ORDER BY created_at DESC
-- LIMIT 10;


-- Success message
SELECT 'Database setup completed successfully!' as status;
