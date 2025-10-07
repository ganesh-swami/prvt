// Input validation utilities for API functions
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long').trim();
export const uuidSchema = z.string().uuid('Invalid ID format');

// Project validation schemas
export const projectNameSchema = z.string()
  .min(1, 'Project name is required')
  .max(100, 'Project name must be less than 100 characters')
  .trim()
  .refine(name => name.length > 0, 'Project name cannot be empty');

export const projectDescriptionSchema = z.string()
  .max(1000, 'Description must be less than 1000 characters')
  .optional();

// Comment validation schemas
export const commentContentSchema = z.string()
  .min(1, 'Comment cannot be empty')
  .max(2000, 'Comment must be less than 2000 characters')
  .trim();

// Organization validation schemas
export const organizationNameSchema = z.string()
  .min(1, 'Organization name is required')
  .max(100, 'Organization name must be less than 100 characters')
  .trim()
  .refine(name => /^[a-zA-Z0-9\s\-_]+$/.test(name), 'Organization name contains invalid characters');

// Task validation schemas
export const taskTitleSchema = z.string()
  .min(1, 'Task title is required')
  .max(200, 'Task title must be less than 200 characters')
  .trim();

export const taskDescriptionSchema = z.string()
  .max(1000, 'Task description must be less than 1000 characters')
  .optional();

// Notification validation schemas
export const notificationTypeSchema = z.enum(['info', 'warning', 'error', 'success']);
export const notificationMessageSchema = z.string()
  .min(1, 'Notification message is required')
  .max(500, 'Notification message must be less than 500 characters');

// Analytics validation schemas
export const eventNameSchema = z.string()
  .min(1, 'Event name is required')
  .max(100, 'Event name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Event name can only contain letters, numbers, and underscores');

export const featureNameSchema = z.string()
  .min(1, 'Feature name is required')
  .max(50, 'Feature name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Feature name can only contain letters, numbers, and underscores');

// Composite validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userData: z.object({
    name: nameSchema
  })
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  ownerId: uuidSchema
});

export const createCommentSchema = z.object({
  content: commentContentSchema,
  projectId: uuidSchema,
  userId: uuidSchema
});

export const createOrganizationSchema = z.object({
  userId: uuidSchema,
  orgName: organizationNameSchema
});

export const trackUsageSchema = z.object({
  orgId: uuidSchema,
  feature: featureNameSchema,
  increment: z.number().int().positive().max(1000).default(1)
});

export const trackEventSchema = z.object({
  eventName: eventNameSchema,
  properties: z.record(z.any()).default({}),
  userId: uuidSchema.optional(),
  orgId: uuidSchema.optional()
});

export const createNotificationSchema = z.object({
  userId: uuidSchema,
  type: notificationTypeSchema,
  message: notificationMessageSchema,
  metadata: z.record(z.any()).default({})
});

export const updateUserProfileSchema = z.object({
  userId: uuidSchema,
  updates: z.object({
    name: nameSchema.optional(),
    avatar_url: z.string().url().optional(),
    subscription_tier: z.enum(['free', 'pro', 'enterprise']).optional()
  }).refine(updates => Object.keys(updates).length > 0, 'At least one field must be updated')
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Rate limiting helpers
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

export function getRateLimitKey(userId: string, action: string): string {
  return `${userId}:${action}`;
}
