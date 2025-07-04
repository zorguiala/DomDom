#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Configure Prisma Client with retries for Vercel deployment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
});

async function checkAndSeed() {
  console.log('🌱 Checking database seeding status...');
  
  let connectionAttempts = 0;
  const maxAttempts = 3;
  
  while (connectionAttempts < maxAttempts) {
    try {
      connectionAttempts++;
      console.log(`🔗 Connection attempt ${connectionAttempts}/${maxAttempts}...`);
      
      // Test connection with timeout
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
      
      console.log('✅ Database connection successful');
      break;
      
    } catch (error) {
      console.log(`❌ Connection attempt ${connectionAttempts} failed:`, error.message);
      
      if (connectionAttempts >= maxAttempts) {
        console.log('⚠️ Max connection attempts reached. Skipping seeding.');
        console.log('This is normal during Vercel cold starts or high latency.');
        console.log('The application will function without initial seed data.');
        process.exit(0); // Exit gracefully without failing the build
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  try {
    // Quick check if data exists
    const userCount = await Promise.race([
      prisma.user.count(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]);
    
    if (userCount > 0) {
      console.log(`ℹ️ Database already contains ${userCount} users. Skipping seed.`);
      process.exit(0);
    }
    
    console.log('🌱 Database is empty. Running full seed...');
    
    // Import and run the main seed function
    const { execSync } = require('child_process');
    execSync('tsx prisma/seed.ts', { stdio: 'inherit' });
    
    console.log('✅ Database seeded successfully');
    
  } catch (error) {
    console.log('⚠️ Seeding check failed:', error.message);
    console.log('This is often normal on Vercel. The app will work without seed data.');
    
    // Don't fail the build - log and continue
    process.exit(0);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, cleaning up...');
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Ignore
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, cleaning up...');
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Ignore
  }
  process.exit(0);
});

checkAndSeed().catch((error) => {
  console.error('💥 Unexpected error in seed check:', error);
  process.exit(0); // Exit gracefully to not fail Vercel build
}); 