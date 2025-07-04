# Environment Variables Prefix Storage Guide

## 📋 **Overview**

This document explains how to properly configure environment variables with prefixes for different storage contexts in Vercel deployment.

## 🏗️ **Environment Variable Prefixes**

### 1. **Database Variables**
```bash
# Primary Database (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Direct Database Connection (for migrations)
POSTGRES_URL="postgres://username:password@host:port/database?sslmode=require"

# Alternative naming convention (if needed)
DB_URL="prisma+postgres://..."
DB_DIRECT_URL="postgres://..."
```

### 2. **NextAuth Variables**
```bash
# Authentication Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# OAuth Providers (if needed)
NEXTAUTH_GOOGLE_ID="your-google-client-id"
NEXTAUTH_GOOGLE_SECRET="your-google-client-secret"
NEXTAUTH_GITHUB_ID="your-github-client-id"
NEXTAUTH_GITHUB_SECRET="your-github-client-secret"
```

### 3. **Client-Side Variables (NEXT_PUBLIC_ prefix)**
```bash
# These are exposed to the browser
NEXT_PUBLIC_APP_NAME="DomDom ERP"
NEXT_PUBLIC_API_URL="https://your-app.vercel.app/api"
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
```

### 4. **Service-Specific Prefixes**
```bash
# Email Service
EMAIL_SERVICE_HOST="smtp.gmail.com"
EMAIL_SERVICE_PORT="587"
EMAIL_SERVICE_USER="your-email@gmail.com"
EMAIL_SERVICE_PASS="your-app-password"

# File Storage
STORAGE_BUCKET_NAME="your-bucket-name"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"

# External APIs
API_EXCHANGE_RATE_KEY="your-exchange-rate-api-key"
API_PAYMENT_STRIPE_KEY="your-stripe-key"
```

## 🌍 **Environment-Specific Configuration**

### **Development (.env.local)**
```bash
# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=DEV_API_KEY"
POSTGRES_URL="postgres://dev_user:dev_pass@localhost:5432/domdom_dev"

# NextAuth
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Debug
DEBUG_MODE="true"
LOG_LEVEL="debug"
```

### **Preview/Staging**
```bash
# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=STAGING_API_KEY"
POSTGRES_URL="postgres://staging_user:staging_pass@staging-host:5432/domdom_staging"

# NextAuth
NEXTAUTH_SECRET="staging-secret-key"
NEXTAUTH_URL="https://your-app-git-branch.vercel.app"

# Features
FEATURE_BETA_TESTING="true"
```

### **Production**
```bash
# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=PROD_API_KEY"
POSTGRES_URL="postgres://prod_user:prod_pass@prod-host:5432/domdom_prod"

# NextAuth
NEXTAUTH_SECRET="super-secure-production-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"

# Performance
NODE_ENV="production"
```

## 🔒 **Security Best Practices**

### **1. Variable Classification**
- **Public** (`NEXT_PUBLIC_*`): Safe to expose to browser
- **Server-only**: Keep secret, never expose to client
- **Sensitive**: Database URLs, API keys, secrets

### **2. Naming Conventions**
```bash
# ✅ Good naming
DATABASE_URL="..."
AUTH_SECRET="..."
STRIPE_WEBHOOK_SECRET="..."

# ❌ Avoid generic names
URL="..."
SECRET="..."
KEY="..."
```

### **3. Environment Separation**
```bash
# ✅ Environment-specific prefixes
DEV_DATABASE_URL="..."
STAGING_DATABASE_URL="..."
PROD_DATABASE_URL="..."

# Or use Vercel's environment targeting
DATABASE_URL="..." # with different values per environment
```

## ⚙️ **Vercel Configuration**

### **1. Environment Variable Targeting**
In Vercel dashboard, set variables for specific environments:
- **Development**: Local development only
- **Preview**: Git branch deployments
- **Production**: Main branch deployments

### **2. System Environment Variables**
Vercel automatically provides these:
```bash
VERCEL="1"
VERCEL_ENV="production" # or "preview" or "development"
VERCEL_URL="your-deployment-url.vercel.app"
VERCEL_REGION="iad1"
```

## 📝 **Implementation Example**

### **Environment Configuration Hook**
```typescript
// lib/env.ts
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  POSTGRES_URL: process.env.POSTGRES_URL!,
  
  // Auth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  
  // Public (client-side)
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DomDom ERP',
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: process.env.VERCEL === '1',
}
```

## 🚀 **Deployment Checklist**

### **Before Deployment:**
- [ ] Set all required environment variables in Vercel dashboard
- [ ] Use different values for development/staging/production
- [ ] Test with `vercel env pull` to sync local variables
- [ ] Verify client-side variables use `NEXT_PUBLIC_` prefix
- [ ] Check sensitive variables are server-only

### **Variable Organization:**
- [ ] Group related variables with consistent prefixes
- [ ] Use descriptive names (not generic like `URL` or `KEY`)
- [ ] Document all variables and their purposes
- [ ] Set appropriate environment targeting (dev/preview/prod)

## 🔧 **Vercel CLI Commands**

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# List all environment variables
vercel env ls

# Add environment variable
vercel env add DATABASE_URL production

# Remove environment variable
vercel env rm VARIABLE_NAME
``` 