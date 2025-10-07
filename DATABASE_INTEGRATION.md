# Database Integration Guide

This document outlines the complete database integration for PF_Strategize+ with real Supabase schema and API functionality.

## Overview

The application has been updated to work with a comprehensive database schema that includes:
- User management and authentication
- Organization and team collaboration
- Project management with full CRUD operations
- Business planning modules (business plans, market assumptions, pricing scenarios, financial models)
- Competitor analysis
- Comments and task management
- Analytics and usage tracking
- Notifications system

## Database Schema

The complete database schema includes the following tables:

### Core Tables
- `users` - User profiles and preferences
- `organizations` - Organization/workspace management
- `org_members` - Organization membership and roles
- `projects` - Project management
- `project_collaborators` - Project collaboration and permissions

### Business Planning Tables
- `business_plans` - Executive summaries, problem statements, solutions
- `market_assumptions` - TAM, SAM, SOM, market growth rates
- `pricing_scenarios` - Pricing models and strategies
- `financial_models` - Financial projections and scenarios
- `competitors` - Competitive analysis data

### Collaboration Tables
- `comments` - Comments on projects and modules
- `tasks` - Task management and assignments
- `mentions` - User mentions in comments
- `notifications` - System notifications

### Analytics & Tracking
- `analytics_events` - User behavior tracking
- `usage_counters` - Feature usage tracking
- `subscriptions` - Subscription management

### Additional Tables
- `drafts` - Draft management
- `templates` - Project templates

## Setup Instructions

### 1. Database Setup

Run the `database-setup.sql` script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database-setup.sql
-- This will create all tables, functions, policies, and indexes
```

### 2. Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_STRIPE_PUBLISHABLE_KEY="your_stripe_key"
VITE_APP_URL="http://localhost:5173"
```

### 3. Row Level Security (RLS)

The database setup includes comprehensive RLS policies:
- Users can only access their own data
- Project access is controlled by ownership and collaboration
- Organization members can access shared resources
- Proper isolation between different users and organizations

## API Structure

### Core API Modules

#### User API (`userApi`)
```typescript
- getCurrentUser(): Get current authenticated user
- getUserById(id): Get user by ID
- updateUser(id, updates): Update user profile
```

#### Organization API (`organizationApi`)
```typescript
- getUserOrganizations(userId): Get user's organizations
- createOrganization(name, ownerId): Create new organization
- getOrganizationMembers(orgId): Get organization members
```

#### Project API (`projectApi`)
```typescript
- getProjects(userId): Get user's projects
- getProjectById(id): Get project by ID
- createProject(data): Create new project
- updateProject(id, updates): Update project
- deleteProject(id): Delete project
- getProjectCollaborators(projectId): Get project collaborators
```

#### Business Planning APIs
```typescript
// Business Plan API
- businessPlanApi.getByProjectId(projectId)
- businessPlanApi.create(data)
- businessPlanApi.update(id, updates)

// Market Assumptions API
- marketAssumptionsApi.getByProjectId(projectId)
- marketAssumptionsApi.create(data)
- marketAssumptionsApi.update(id, updates)

// Pricing Scenarios API
- pricingScenariosApi.getByProjectId(projectId)
- pricingScenariosApi.create(data)
- pricingScenariosApi.update(id, updates)
- pricingScenariosApi.delete(id)

// Financial Models API
- financialModelsApi.getByProjectId(projectId)
- financialModelsApi.create(data)
- financialModelsApi.update(id, updates)

// Competitors API
- competitorsApi.getByProjectId(projectId)
- competitorsApi.create(data)
- competitorsApi.update(id, updates)
- competitorsApi.delete(id)
```

#### Collaboration APIs
```typescript
// Comments API
- commentsApi.getByProject(projectId, module?, section?)
- commentsApi.create(data)
- commentsApi.update(id, updates)
- commentsApi.delete(id)

// Tasks API
- tasksApi.getByProject(projectId)
- tasksApi.create(data)
- tasksApi.update(id, updates)
- tasksApi.delete(id)

// Notifications API
- notificationsApi.getByUser(userId)
- notificationsApi.create(data)
- notificationsApi.markAsRead(id)
```

#### Analytics & Tracking APIs
```typescript
// Analytics API
- analyticsApi.trackEvent(event)
- analyticsApi.getEvents(filters)

// Usage Counters API
- usageCountersApi.getUsage(orgId, feature)
- usageCountersApi.incrementUsage(orgId, feature, increment)
```

## Enhanced Project Store

The `useProjectStore` has been completely rewritten to integrate with the real database:

### Key Features
- Full CRUD operations for all project-related data
- Real-time data synchronization
- Error handling and loading states
- Optimistic updates where appropriate
- Comprehensive data management for:
  - Projects
  - Business plans
  - Market assumptions
  - Pricing scenarios
  - Financial models
  - Competitors
  - Comments
  - Tasks

### Usage Example
```typescript
const {
  currentProject,
  businessPlan,
  marketAssumptions,
  pricingScenarios,
  financialModels,
  competitors,
  comments,
  tasks,
  loading,
  error,
  
  // Actions
  setCurrentProject,
  updateBusinessPlan,
  createPricingScenario,
  createCompetitor,
  createComment,
  createTask,
  // ... more actions
} = useProjectStore();
```

## Enhanced Authentication

The `AuthContext` now includes:
- Organization management
- Enhanced user profiles
- Analytics tracking
- Proper session handling
- Multi-organization support

### New Auth Features
```typescript
const {
  user,
  appUser,
  currentOrganization,
  organizations,
  loading,
  
  // Actions
  signIn,
  signUp,
  signOut,
  switchOrganization,
  refreshUser
} = useAuth();
```

## Testing

### API Testing Utilities

Use the provided testing utilities:

```typescript
import { quickApiTest, databaseHealthCheck, ApiTester } from '@/lib/api-test';

// Quick test
await quickApiTest();

// Health check
await databaseHealthCheck();

// Comprehensive testing
const tester = new ApiTester(userId, orgId, projectId);
await tester.testAllApis();
```

### Testing in Browser Console

```javascript
// Test basic functionality
import { quickApiTest } from './src/lib/api-test';
quickApiTest();

// Test specific APIs
import { userApi, projectApi } from './src/lib/api';
const user = await userApi.getCurrentUser();
const projects = await projectApi.getProjects(user.id);
```

## Database Functions

The setup includes several utility functions:

### `increment_usage_counter`
Tracks feature usage for billing and analytics:
```sql
SELECT increment_usage_counter(
  'org-id',
  'feature-name',
  CURRENT_DATE,
  1
);
```

### `get_user_current_org`
Gets user's primary organization:
```sql
SELECT get_user_current_org('user-id');
```

## Security Features

### Row Level Security (RLS)
- All tables have appropriate RLS policies
- Users can only access their own data
- Project collaboration is properly controlled
- Organization membership determines access

### Data Isolation
- Complete isolation between organizations
- Project-level permissions
- User-specific notifications and preferences

## Performance Optimizations

### Indexes
- Optimized indexes for common queries
- Foreign key indexes for joins
- Timestamp indexes for sorting

### Query Optimization
- Efficient joins using Supabase's query builder
- Selective field fetching
- Proper use of single() vs array queries

## Migration from Mock Data

The integration replaces all mock data with real database queries:

1. **Type System**: Updated to match exact database schema
2. **API Layer**: Complete rewrite using Supabase client
3. **State Management**: Enhanced with real CRUD operations
4. **Authentication**: Integrated with user profiles and organizations
5. **Real-time Features**: Ready for real-time subscriptions

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user is authenticated and has proper permissions
2. **Foreign Key Violations**: Check that referenced records exist
3. **Type Mismatches**: Verify data types match database schema
4. **Connection Issues**: Check Supabase URL and API key

### Debug Tools

```typescript
// Enable detailed logging
localStorage.setItem('supabase.debug', 'true');

// Test database connection
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('users').select('count');
```

## Next Steps

1. Run the database setup script
2. Test the API using the provided utilities
3. Update any existing components to use the new API structure
4. Set up real-time subscriptions for collaborative features
5. Configure analytics and usage tracking
6. Set up proper error monitoring

The database integration is now complete and ready for production use with full CRUD operations, proper security, and comprehensive data management.
