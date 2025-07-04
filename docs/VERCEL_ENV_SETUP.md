# Vercel Environment Variables Setup Guide

## 🎯 **Quick Setup for Your DomDom ERP**

### **Step 1: Required Variables (Set in Vercel Dashboard)**

Go to your Vercel project → Settings → Environment Variables and add these:

#### **🔧 Database Variables**
```bash
# Variable Name: DATABASE_URL
# Value: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWkI1WFpZQ0tHMTRNQlowRDRDN1lCTkEiLCJ0ZW5hbnRfaWQiOiJiNjk0YmJlOThlOTZhNzNhZDBkZmE2MGJiODM1NzI4NjI0OWJlZGE0YWNkMWUzMGNmOWI2MWJmN2YwZTdhMDBjIiwiaW50ZXJuYWxfc2VjcmV0IjoiZDNjY2UxZGUtNmFlOS00OTE1LTg1OWEtMzg2OThmMWU3MjcyIn0.OnKQ13mpYURI7uAqK--SQmbUxit3pc8MG_zUtwUPSlY
# Environments: Production, Preview

# Variable Name: POSTGRES_URL  
# Value: postgres://b694bbe98e96a73ad0dfa60bb8357286249beda4acd1e30cf9b61bf7f0e7a00c:sk_X1UZFqXs8IktNTtRszhMj@db.prisma.io:5432/?sslmode=require
# Environments: Production, Preview
```

#### **🔐 Authentication Variables**
```bash
# Variable Name: NEXTAUTH_SECRET
# Value: [Generate a random 32+ character string]
# Environments: Production, Preview
# Example: super-secure-random-string-for-production-use-only-2024

# Variable Name: NEXTAUTH_URL
# Value (Production): https://your-app.vercel.app
# Value (Preview): https://your-app-git-$VERCEL_GIT_COMMIT_REF.vercel.app
# Environments: Production, Preview
```

### **Step 2: Optional Enhancement Variables**

#### **📧 Email Service (if you plan to add email features)**
```bash
# Variable Name: EMAIL_SERVICE_HOST
# Value: smtp.gmail.com
# Environments: Production

# Variable Name: EMAIL_SERVICE_PORT
# Value: 587
# Environments: Production

# Variable Name: EMAIL_SERVICE_USER
# Value: your-app-email@gmail.com
# Environments: Production

# Variable Name: EMAIL_SERVICE_PASS
# Value: your-app-password
# Environments: Production
```

#### **🎛️ Feature Flags**
```bash
# Variable Name: FEATURE_BETA_TESTING
# Value: false
# Environments: Production

# Variable Name: FEATURE_ANALYTICS
# Value: true
# Environments: Production
```

#### **🔍 Debug Configuration (for troubleshooting)**
```bash
# Variable Name: DEBUG_MODE
# Value: false
# Environments: Production
# Value: true
# Environments: Preview

# Variable Name: LOG_LEVEL
# Value: info
# Environments: Production
# Value: debug
# Environments: Preview
```

## 🚀 **Vercel Dashboard Configuration Steps**

### **1. Access Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your DomDom project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar

### **2. Add Variables with Proper Targeting**

For each variable above:

1. **Name**: Enter the variable name exactly as shown
2. **Value**: Enter the corresponding value
3. **Environments**: Select appropriate environment(s):
   - ✅ **Production** (main branch deployments)
   - ✅ **Preview** (branch/PR deployments)  
   - ❌ **Development** (leave unchecked - use `.env.local`)

### **3. Environment-Specific Configuration**

#### **Production Environment**
```bash
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_PROD_API_KEY
POSTGRES_URL=postgres://user:pass@prod-host:5432/prod_db?sslmode=require
NEXTAUTH_SECRET=super-secure-production-secret-key-32-chars-minimum
NEXTAUTH_URL=https://your-app.vercel.app
FEATURE_BETA_TESTING=false
DEBUG_MODE=false
LOG_LEVEL=info
```

#### **Preview Environment** 
```bash
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_STAGING_API_KEY
POSTGRES_URL=postgres://user:pass@staging-host:5432/staging_db?sslmode=require
NEXTAUTH_SECRET=staging-secret-key-can-be-different
NEXTAUTH_URL=https://your-app-git-$VERCEL_GIT_COMMIT_REF.vercel.app
FEATURE_BETA_TESTING=true
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📋 **Your Specific Configuration**

Based on your provided database credentials, here's your exact setup:

### **Copy-Paste Ready Configuration**

```bash
# Database Variables
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWkI1WFpZQ0tHMTRNQlowRDRDN1lCTkEiLCJ0ZW5hbnRfaWQiOiJiNjk0YmJlOThlOTZhNzNhZDBkZmE2MGJiODM1NzI4NjI0OWJlZGE0YWNkMWUzMGNmOWI2MWJmN2YwZTdhMDBjIiwiaW50ZXJuYWxfc2VjcmV0IjoiZDNjY2UxZGUtNmFlOS00OTE1LTg1OWEtMzg2OThmMWU3MjcyIn0.OnKQ13mpYURI7uAqK--SQmbUxit3pc8MG_zUtwUPSlY

POSTGRES_URL=postgres://b694bbe98e96a73ad0dfa60bb8357286249beda4acd1e30cf9b61bf7f0e7a00c:sk_X1UZFqXs8IktNTtRszhMj@db.prisma.io:5432/?sslmode=require

# Auth Variables (Generate your own NEXTAUTH_SECRET!)
NEXTAUTH_SECRET=domdom-production-secret-2024-change-this-to-something-random-and-secure
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## ⚡ **Quick Setup Commands**

### **Using Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add POSTGRES_URL production  
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Pull environment variables to local
vercel env pull .env.local
```

### **Verification Commands**
```bash
# Test your environment configuration locally
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔒 **Security Checklist**

- [ ] **NEXTAUTH_SECRET** is random and 32+ characters
- [ ] **Database URLs** are not exposed in client-side code
- [ ] **Environment targeting** is correctly set (Production/Preview only)
- [ ] **No sensitive data** in Preview deployments you don't control
- [ ] **Different secrets** for development vs production

## 🎯 **Your Next Steps**

1. **Set the 4 required variables** in Vercel dashboard
2. **Generate a secure NEXTAUTH_SECRET** 
3. **Update NEXTAUTH_URL** with your actual domain
4. **Deploy to Vercel** - everything will migrate and seed automatically!

## ✅ **Deployment Verification**

After deployment, verify:
- ✅ Database migrated successfully
- ✅ Seed data populated (check admin login)
- ✅ Authentication working
- ✅ No environment variable errors in logs

**Default Login:** `admin@domdom.com` / `password123` 