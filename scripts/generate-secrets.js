#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate Secure Environment Variable Values
 * 
 * This script generates cryptographically secure values for environment variables
 */

console.log('🔐 Generating Secure Environment Variable Values\n');

// Generate NEXTAUTH_SECRET (32 bytes = 64 hex characters)
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

// Generate additional secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

// Generate API keys (shorter, URL-safe)
const apiKey = crypto.randomBytes(16).toString('base64url');

console.log('📋 Copy these to your Vercel Environment Variables:');
console.log('=' .repeat(60));

console.log('\n🔑 Authentication:');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);

console.log('\n🔒 Additional Security (if needed):');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log(`API_KEY=${apiKey}`);

console.log('\n🌍 URL Configuration:');
console.log('NEXTAUTH_URL=https://your-app-name.vercel.app');

console.log('\n💾 Database Configuration:');
console.log('DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('POSTGRES_URL=postgres://b694bbe98e96a73ad0dfa60bb8357286249beda4acd1e30cf9b61bf7f0e7a00c...');

console.log('\n⚠️  Important Security Notes:');
console.log('- Use DIFFERENT secrets for development and production');
console.log('- Store these securely (password manager recommended)');
console.log('- Never commit these to version control');
console.log('- Rotate secrets regularly in production');

console.log('\n🎯 Next Steps:');
console.log('1. Copy the NEXTAUTH_SECRET above');
console.log('2. Add it to Vercel → Settings → Environment Variables');
console.log('3. Set environment to "Production" and "Preview"');
console.log('4. Deploy your app to Vercel');

console.log('\n✅ Generated at:', new Date().toISOString()); 