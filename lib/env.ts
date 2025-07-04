/**
 * Environment Variables Configuration
 * 
 * This file provides type-safe access to environment variables
 * with proper prefix organization for different storage contexts.
 */

import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database Configuration (DB_ prefix)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required for migrations'),
  
  // Authentication Configuration (AUTH_ prefix)
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Optional OAuth Providers (OAUTH_ prefix)
  NEXTAUTH_GOOGLE_ID: z.string().optional(),
  NEXTAUTH_GOOGLE_SECRET: z.string().optional(),
  NEXTAUTH_GITHUB_ID: z.string().optional(),
  NEXTAUTH_GITHUB_SECRET: z.string().optional(),
  
  // Email Service Configuration (EMAIL_ prefix)
  EMAIL_SERVICE_HOST: z.string().optional(),
  EMAIL_SERVICE_PORT: z.string().optional(),
  EMAIL_SERVICE_USER: z.string().optional(),
  EMAIL_SERVICE_PASS: z.string().optional(),
  
  // File Storage Configuration (STORAGE_ prefix)
  STORAGE_BUCKET_NAME: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  
  // External API Keys (API_ prefix)
  API_EXCHANGE_RATE_KEY: z.string().optional(),
  API_PAYMENT_STRIPE_KEY: z.string().optional(),
  
  // Feature Flags (FEATURE_ prefix)
  FEATURE_BETA_TESTING: z.string().transform(val => val === 'true').optional(),
  FEATURE_ANALYTICS: z.string().transform(val => val === 'true').optional(),
  
  // Debug Configuration (DEBUG_ prefix)
  DEBUG_MODE: z.string().transform(val => val === 'true').optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  
  // Vercel System Variables (VERCEL_ prefix)
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_REGION: z.string().optional(),
});

// Client-side environment variables (NEXT_PUBLIC_ prefix)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('DomDom ERP'),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    const serverEnv = envSchema.parse(process.env);
    const clientEnv = clientEnvSchema.parse(process.env);
    
    return {
      server: serverEnv,
      client: clientEnv,
    };
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment variables
const { server: serverEnv, client: clientEnv } = parseEnv();

// Organized environment configuration by prefix/service
export const env = {
  // Environment detection
  isDevelopment: serverEnv.NODE_ENV === 'development',
  isProduction: serverEnv.NODE_ENV === 'production',
  isTest: serverEnv.NODE_ENV === 'test',
  isVercel: serverEnv.VERCEL === '1',
  
  // Database (DB_ prefix context)
  database: {
    url: serverEnv.DATABASE_URL,
    directUrl: serverEnv.POSTGRES_URL,
  },
  
  // Authentication (AUTH_ prefix context)
  auth: {
    secret: serverEnv.NEXTAUTH_SECRET,
    url: serverEnv.NEXTAUTH_URL,
    providers: {
      google: {
        id: serverEnv.NEXTAUTH_GOOGLE_ID,
        secret: serverEnv.NEXTAUTH_GOOGLE_SECRET,
      },
      github: {
        id: serverEnv.NEXTAUTH_GITHUB_ID,
        secret: serverEnv.NEXTAUTH_GITHUB_SECRET,
      },
    },
  },
  
  // Email Service (EMAIL_ prefix context)
  email: {
    host: serverEnv.EMAIL_SERVICE_HOST,
    port: serverEnv.EMAIL_SERVICE_PORT ? parseInt(serverEnv.EMAIL_SERVICE_PORT) : undefined,
    user: serverEnv.EMAIL_SERVICE_USER,
    password: serverEnv.EMAIL_SERVICE_PASS,
  },
  
  // Storage (STORAGE_ prefix context)
  storage: {
    bucketName: serverEnv.STORAGE_BUCKET_NAME,
    accessKey: serverEnv.STORAGE_ACCESS_KEY,
    secretKey: serverEnv.STORAGE_SECRET_KEY,
  },
  
  // External APIs (API_ prefix context)
  api: {
    exchangeRate: serverEnv.API_EXCHANGE_RATE_KEY,
    stripe: serverEnv.API_PAYMENT_STRIPE_KEY,
  },
  
  // Feature Flags (FEATURE_ prefix context)
  features: {
    betaTesting: serverEnv.FEATURE_BETA_TESTING || false,
    analytics: serverEnv.FEATURE_ANALYTICS || false,
  },
  
  // Debug Configuration (DEBUG_ prefix context)
  debug: {
    enabled: serverEnv.DEBUG_MODE || false,
    logLevel: serverEnv.LOG_LEVEL || 'info',
  },
  
  // Vercel System (VERCEL_ prefix context)
  vercel: {
    env: serverEnv.VERCEL_ENV,
    url: serverEnv.VERCEL_URL,
    region: serverEnv.VERCEL_REGION,
  },
  
  // Client-side variables (NEXT_PUBLIC_ prefix)
  client: {
    appName: clientEnv.NEXT_PUBLIC_APP_NAME,
    apiUrl: clientEnv.NEXT_PUBLIC_API_URL,
    analyticsId: clientEnv.NEXT_PUBLIC_ANALYTICS_ID,
    sentryDsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  },
};

// Utility functions for environment variable management
export const envUtils = {
  /**
   * Check if a required environment variable is missing
   */
  requireEnv: (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  },
  
  /**
   * Get environment variable with fallback
   */
  getEnv: (key: string, fallback?: string): string | undefined => {
    return process.env[key] || fallback;
  },
  
  /**
   * Check if we're in a specific environment
   */
  isEnvironment: (environment: 'development' | 'production' | 'test'): boolean => {
    return serverEnv.NODE_ENV === environment;
  },
  
  /**
   * Get current deployment environment
   */
  getDeploymentEnv: (): 'development' | 'preview' | 'production' | 'local' => {
    if (serverEnv.VERCEL_ENV) {
      return serverEnv.VERCEL_ENV;
    }
    return serverEnv.NODE_ENV === 'development' ? 'local' : 'production';
  },
  
  /**
   * Validate environment for deployment
   */
  validateForDeployment: (): void => {
    const required = [
      'DATABASE_URL',
      'POSTGRES_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables for deployment: ${missing.join(', ')}`
      );
    }
  },
};

// Export types for TypeScript support
export type EnvConfig = typeof env;
export type ServerEnv = typeof serverEnv;
export type ClientEnv = typeof clientEnv; 