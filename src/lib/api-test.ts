import { 
  userApi, 
  organizationApi, 
  projectApi, 
  businessPlanApi, 
  marketAssumptionsApi, 
  pricingScenariosApi, 
  financialModelsApi,
  competitorsApi,
  commentsApi,
  tasksApi,
  notificationsApi,
  analyticsApi
} from './api';

// API Testing Utility
export class ApiTester {
  private userId: string;
  private orgId: string;
  private projectId: string;

  constructor(userId: string, orgId: string, projectId: string) {
    this.userId = userId;
    this.orgId = orgId;
    this.projectId = projectId;
  }

  async testAllApis() {
    console.log('🚀 Starting API Tests...');
    
    const results = {
      user: await this.testUserApi(),
      organization: await this.testOrganizationApi(),
      project: await this.testProjectApi(),
      businessPlan: await this.testBusinessPlanApi(),
      marketAssumptions: await this.testMarketAssumptionsApi(),
      pricingScenarios: await this.testPricingScenariosApi(),
      financialModels: await this.testFinancialModelsApi(),
      competitors: await this.testCompetitorsApi(),
      comments: await this.testCommentsApi(),
      tasks: await this.testTasksApi(),
      notifications: await this.testNotificationsApi(),
      analytics: await this.testAnalyticsApi()
    };

    console.log('✅ API Test Results:', results);
    return results;
  }

  private async testUserApi() {
    try {
      const user = await userApi.getCurrentUser();
      const userById = await userApi.getUserById(this.userId);
      return { success: true, user, userById };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testOrganizationApi() {
    try {
      const orgs = await organizationApi.getUserOrganizations(this.userId);
      return { success: true, organizations: orgs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testProjectApi() {
    try {
      const projects = await projectApi.getProjects(this.userId);
      const project = await projectApi.getProjectById(this.projectId);
      return { success: true, projects, project };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testBusinessPlanApi() {
    try {
      const businessPlan = await businessPlanApi.getByProjectId(this.projectId);
      return { success: true, businessPlan };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testMarketAssumptionsApi() {
    try {
      const assumptions = await marketAssumptionsApi.getByProjectId(this.projectId);
      return { success: true, assumptions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testPricingScenariosApi() {
    try {
      const scenarios = await pricingScenariosApi.getByProjectId(this.projectId);
      return { success: true, scenarios };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testFinancialModelsApi() {
    try {
      const models = await financialModelsApi.getByProjectId(this.projectId);
      return { success: true, models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testCompetitorsApi() {
    try {
      const competitors = await competitorsApi.getByProjectId(this.projectId);
      return { success: true, competitors };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testCommentsApi() {
    try {
      const comments = await commentsApi.getByProject(this.projectId);
      return { success: true, comments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testTasksApi() {
    try {
      const tasks = await tasksApi.getByProject(this.projectId);
      return { success: true, tasks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testNotificationsApi() {
    try {
      const notifications = await notificationsApi.getByUser(this.userId);
      return { success: true, notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testAnalyticsApi() {
    try {
      await analyticsApi.trackEvent({
        event_name: 'api_test',
        user_id: this.userId,
        org_id: this.orgId,
        properties: { test: true }
      });
      
      const events = await analyticsApi.getEvents({
        user_id: this.userId,
        limit: 10
      });
      
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Quick test function for development
export async function quickApiTest() {
  console.log('🔍 Running Quick API Test...');
  
  try {
    // Test basic user functionality
    const currentUser = await userApi.getCurrentUser();
    console.log('Current User:', currentUser);
    
    if (currentUser) {
      const orgs = await organizationApi.getUserOrganizations(currentUser.id);
      console.log('User Organizations:', orgs);
      
      const projects = await projectApi.getProjects(currentUser.id);
      console.log('User Projects:', projects);
      
      // Track test event
      await analyticsApi.trackEvent({
        event_name: 'quick_api_test',
        user_id: currentUser.id,
        properties: { timestamp: new Date().toISOString() }
      });
      
      console.log('✅ Quick API Test Completed Successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Quick API Test Failed:', error);
    return false;
  }
}

// Database health check
export async function databaseHealthCheck() {
  const checks = {
    users: false,
    organizations: false,
    projects: false,
    business_plans: false,
    market_assumptions: false,
    pricing_scenarios: false,
    financial_models: false,
    competitors: false,
    comments: false,
    tasks: false,
    notifications: false,
    analytics_events: false
  };

  try {
    // Test each table by attempting a simple query
    const currentUser = await userApi.getCurrentUser();
    if (currentUser) {
      checks.users = true;
      
      try {
        await organizationApi.getUserOrganizations(currentUser.id);
        checks.organizations = true;
      } catch (e) { console.warn('Organizations table issue:', e.message); }
      
      try {
        await projectApi.getProjects(currentUser.id);
        checks.projects = true;
      } catch (e) { console.warn('Projects table issue:', e.message); }
      
      // Test other tables with a dummy project ID
      const dummyProjectId = '00000000-0000-0000-0000-000000000000';
      
      try {
        await businessPlanApi.getByProjectId(dummyProjectId);
        checks.business_plans = true;
      } catch (e) { 
        if (!e.message.includes('not found')) {
          console.warn('Business plans table issue:', e.message);
        } else {
          checks.business_plans = true;
        }
      }
      
      try {
        await marketAssumptionsApi.getByProjectId(dummyProjectId);
        checks.market_assumptions = true;
      } catch (e) { 
        if (!e.message.includes('not found')) {
          console.warn('Market assumptions table issue:', e.message);
        } else {
          checks.market_assumptions = true;
        }
      }
      
      try {
        await pricingScenariosApi.getByProjectId(dummyProjectId);
        checks.pricing_scenarios = true;
      } catch (e) { console.warn('Pricing scenarios table issue:', e.message); }
      
      try {
        await financialModelsApi.getByProjectId(dummyProjectId);
        checks.financial_models = true;
      } catch (e) { console.warn('Financial models table issue:', e.message); }
      
      try {
        await competitorsApi.getByProjectId(dummyProjectId);
        checks.competitors = true;
      } catch (e) { console.warn('Competitors table issue:', e.message); }
      
      try {
        await commentsApi.getByProject(dummyProjectId);
        checks.comments = true;
      } catch (e) { console.warn('Comments table issue:', e.message); }
      
      try {
        await tasksApi.getByProject(dummyProjectId);
        checks.tasks = true;
      } catch (e) { console.warn('Tasks table issue:', e.message); }
      
      try {
        await notificationsApi.getByUser(currentUser.id);
        checks.notifications = true;
      } catch (e) { console.warn('Notifications table issue:', e.message); }
      
      try {
        await analyticsApi.getEvents({ user_id: currentUser.id, limit: 1 });
        checks.analytics_events = true;
      } catch (e) { console.warn('Analytics events table issue:', e.message); }
    }
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  console.log('🏥 Database Health Check Results:', checks);
  return checks;
}
