#!/usr/bin/env node

/**
 * FREE Deployment Helper Script
 * Checks prerequisites and generates deployment commands
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Smart Dispatcher - FREE Deployment Checker\n');
console.log('='.repeat(50));

// Check Node version
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`✅ Node.js installed: ${nodeVersion}`);
} catch {
  console.log('❌ Node.js not found. Install from https://nodejs.org/');
  process.exit(1);
}

// Check Git
try {
  execSync('git --version', { stdio: 'ignore' });
  console.log('✅ Git installed');
} catch {
  console.log('❌ Git not found. Install from https://git-scm.com/');
  process.exit(1);
}

// Check if repo is initialized
if (!fs.existsSync('.git')) {
  console.log('⚠️  Git repo not initialized');
  console.log('   Run: git init && git add . && git commit -m "Initial commit"');
} else {
  console.log('✅ Git repo initialized');
  try {
    const remotes = execSync('git remote -v').toString().trim();
    if (remotes.includes('github')) {
      console.log('✅ GitHub remote configured');
    } else {
      console.log('⚠️  GitHub remote not found');
    }
  } catch {}
}

// Check backend files
const backendFiles = [
  'backend/package.json',
  'backend/src/index.js',
];

console.log('\nBackend Check:');
let backendReady = true;
backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
    backendReady = false;
  }
});

// Check frontend files
const frontendFiles = [
  'frontend/package.json',
  'frontend/src/main.jsx',
  'frontend/vercel.json',
];

console.log('\nFrontend Check:');
let frontendReady = true;
frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
    frontendReady = false;
  }
});

console.log('\n' + '='.repeat(50));
console.log('\n📋 Deployment Checklist:\n');

const checklist = [
  { task: 'Create GitHub account', url: 'https://github.com/signup' },
  { task: 'Create Vercel account', url: 'https://vercel.com/signup' },
  { task: 'Create Render account', url: 'https://render.com' },
  { task: 'Push repo to GitHub', command: 'git push origin main' },
  { task: 'Deploy backend to Render.com', url: 'https://render.com' },
  { task: 'Deploy frontend to Vercel', url: 'https://vercel.com' },
];

checklist.forEach((item, i) => {
  console.log(`${i + 1}. ${item.task}`);
  if (item.url) console.log(`   ${item.url}`);
  if (item.command) console.log(`   $ ${item.command}`);
});

console.log('\n📖 Full Guide: See FREE_DEPLOYMENT.md\n');

if (backendReady && frontendReady) {
  console.log('✅ Your project is ready for deployment!\n');
  console.log('Next steps:');
  console.log('1. Push to GitHub');
  console.log('2. Go to https://render.com and deploy backend');
  console.log('3. Go to https://vercel.com and deploy frontend');
  console.log('4. Add environment variables to both');
} else {
  console.log('❌ Some files are missing. Fix errors above.\n');
}

// Generate environment template
console.log('\n🔐 Environment Variables Template:\n');
console.log('Backend (.env):');
console.log('PORT=3001');
console.log('NODE_ENV=production');
console.log('JWT_SECRET=your-secret-key-here');
console.log('FRONTEND_URL=https://your-frontend.vercel.app');

console.log('\nFrontend (Vercel Dashboard):');
console.log('VITE_API_URL=https://your-backend.onrender.com/api');

console.log('\n' + '='.repeat(50) + '\n');
