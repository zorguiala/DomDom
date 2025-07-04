#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting Vercel build process...');

  // Generate Prisma Client
  runCommand('npx prisma generate', 'Generating Prisma Client');

  // Run migrations
  runCommand('npx prisma migrate deploy', 'Running database migrations');

  // Seed database (with error handling for already seeded)
  console.log('🌱 Seeding database...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.log('ℹ️ Database already seeded or seeding skipped');
  }

  // Build Next.js application
  runCommand('npx next build', 'Building Next.js application');

  console.log('🎉 Build completed successfully!');
}

main().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
}); 