// Database Schema Types for PF_Strategize+

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: "free" | "pro" | "business" | "enterprise";
  created_at: string;
  updated_at: string;
  notification_preferences?: {
    mentions: boolean;
    assignments: boolean;
    email_enabled: boolean;
    slack_enabled: boolean;
    weekly_digest: boolean;
    investor_updates: boolean;
  };
  slack_access_token?: string;
  slack_team_id?: string;
  slack_team_name?: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  subscription_plan: string;
  subscription_status: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  subscription_period_end?: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  template_id?: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
  module_data?: Record<string, any>;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
}

export interface BusinessPlan {
  id: string;
  project_id: string;
  vision?: string;
  mission?: string;
  value_proposition?: string;
  target_market?: string;
  business_model?: string;
  revenue_streams?: any[];
  key_metrics?: Record<string, any>;
  executive_summary?: string;
  problem_statement?: string;
  solution_description?: string;
  plan_builder?: Record<string, Record<string, string | boolean>>; // Plan Builder data
  created_at: string;
  updated_at: string;
}

export interface SocialBusinessCanvas {
  id: string;
  project_id: string;
  social_mission?: string;
  key_delivery_partners?: string;
  key_activities?: string;
  social_impact_measurement?: string;
  social_value_proposition?: string;
  relationships?: string;
  impact_gap_analysis?: string;
  key_stakeholders?: string;
  channels?: string;
  competitors_competition?: string;
  key_resources?: string;
  pestel_analysis?: string;
  costs?: string;
  surplus?: string;
  revenue?: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemTree {
  id: string;
  project_id: string;
  problem_impact_society?: string;
  harms_direct_beneficiaries?: string;
  effects_involved_parties?: string;
  main_problem?: string;
  problem_position?: string;
  main_causes?: string;
  key_insights?: string;
  strategic_implications?: string;
  created_at: string;
  updated_at: string;
}

export interface Stakeholder {
  id: string;
  project_id: string;
  name: string;
  type?: string;
  influence?: 'High' | 'Medium' | 'Low';
  interest?: 'High' | 'Medium' | 'Low';
  relationship?: 'Supportive' | 'Neutral' | 'Opposing';
  relationship_strength?: number; // 1-10
  engagement_level?: 'Active' | 'Moderate' | 'Minimal' | 'None';
  last_contact?: string;
  next_action?: string;
  risk_level?: 'High' | 'Medium' | 'Low';
  description?: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

export interface EcosystemMapTimeline {
  id: string;
  project_id: string;
  stakeholder_id: string;
  date: string;
  type?: 'Meeting' | 'Email' | 'Call' | 'Event' | 'Milestone';
  description: string;
  outcome?: 'Positive' | 'Neutral' | 'Negative';
  relationship_change?: number; // -5 to +5
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EcosystemMapSharedNote {
  id: string;
  project_id: string;
  stakeholder_id: string;
  content: string;
  is_shared: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EcosystemMapTask {
  id: string;
  project_id: string;
  stakeholder_id: string;
  type?: 'follow-up' | 'meeting' | 'check-in' | 'deadline';
  title: string;
  description?: string;
  due_date: string;
  frequency?: 'once' | 'weekly' | 'monthly' | 'quarterly';
  priority?: 'high' | 'medium' | 'low';
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketAssumptions {
  id: string;
  project_id: string;
  tam?: number;
  sam?: number;
  som?: number;
  market_growth_rate?: number;
  assumptions?: any[];
  validation_status: "unvalidated" | "testing" | "validated";
  created_at: string;
  updated_at: string;
}

export interface PricingScenario {
  id: string;
  project_id: string;
  name: string;
  pricing_model?: "subscription" | "one-time" | "usage-based" | "freemium";
  tiers?: any[];
  assumptions?: Record<string, any>;
  price_points?: any;
  created_at: string;
  updated_at: string;
}

export interface FinancialModel {
  id: string;
  name: string;
  project_id?: string;
  projections: Record<string, any>;
  results: Record<string, any>;
  scenarios?: any;
  assumptions?: any;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  project_id: string;
  name: string;
  website?: string;
  pricing_model?: string;
  strengths?: string[];
  weaknesses?: string[];
  market_share?: number;
  revenue_estimate?: string;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  project_id: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  owner?: string;
  mitigation_strategy?: string;
  status: 'Active' | 'Resolved' | 'Mitigated' | 'Monitoring';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  module: string;
  section: string;
  content: string;
  author_id: string;
  mentions?: any[];
  module_id?: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_to?: string;
  assignee?: {
    name: string;
    avatar_url?: string;
  };
}

export interface Mention {
  id: string;
  comment_id: string;
  mentioned_user_id: string;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  properties?: Record<string, any>;
  timestamp: string;
  user_id?: string;
  org_id?: string;
  created_at: string;
}

export interface Subscription {
  org_id: string;
  plan_id: string;
  addons: string[];
  seats: number;
  billing_cycle: string;
  renew_at?: string;
  updated_at: string;
  status: string;
  grace_period_end?: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface UsageCounter {
  org_id: string;
  feature: string;
  period_start: string;
  count: number;
  allowance?: number;
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  preview_image_url?: string;
  blueprint: Record<string, any>;
  price_cents: number;
  creator_id?: string;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  downloads: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Draft {
  id: string;
  user_id: string;
  name: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  version: number;
  parent_draft_id?: string;
}

// Legacy types for backward compatibility
export interface PricePoint {
  tier: string;
  price: number;
  features: string[];
  target_segment?: string;
}

export interface FinancialScenario {
  name: "best_case" | "base_case" | "worst_case";
  projections: FinancialProjection[];
}

export interface FinancialProjection {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  cash_flow: number;
}
