#!/usr/bin/env node

/**
 * Smart Dispatcher - Interactive Deployment Assistant
 * This script will guide you through deploying to Render.com and Vercel
 */

const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 Smart Dispatcher - Deployment Assistant 🚀          ║');
  console.log('║                  Deploy to Render + Vercel                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Pre-Deployment Checklist:\n');
  
  // Check GitHub
  console.log('Checking prerequisites...\n');
  
  let githubReady = false;
  try {
    const remotes = execSync('git remote -v').toString();
    if (remotes.includes('github')) {
      console.log('✅ GitHub repository configured');
      const repoUrl = remotes.split('\n')[0].split('\t')[1].split(' ')[0];
      console.log(`   Repository: ${repoUrl}\n`);
      githubReady = true;
    }
  } catch {
    console.log('⚠️  No GitHub remote found. Continuing...\n');
  }

  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`✅ Node.js: ${nodeVersion}\n`);

  // Get GitHub Username
  console.log('═'.repeat(60));
  console.log('\n🔐 STEP 1: Get Your GitHub Username\n');
  
  const githubUrl = await question('Enter your GitHub repository URL (e.g., https://github.com/yourname/smart-dispatcher): ');
  const githubUsername = githubUrl.split('github.com/')[1]?.split('/')[0];
  
  if (!githubUsername) {
    console.log('\n❌ Invalid GitHub URL. Exiting...');
    rl.close();
    return;
  }
  
  console.log(`\n✅ GitHub Username: ${githubUsername}`);
  console.log(`✅ Repository: smart-dispatcher\n`);

  // Render Configuration
  console.log('═'.repeat(60));
  console.log('\n🔌 STEP 2: Configure Render Backend\n');
  
  const jwtSecret = await question('Enter a JWT Secret (or press Enter for auto-generated): ');
  const finalJwtSecret = jwtSecret || `secret_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  
  const backendName = await question('Enter backend service name (or press Enter for "smart-dispatcher-backend"): ') || 'smart-dispatcher-backend';
  
  console.log(`\n✅ Backend Configuration:
  - Service Name: ${backendName}
  - JWT Secret: ***hidden*** (${finalJwtSecret.length} chars)
  - Environment: Node
  - Region: Oregon (free tier)`);

  // Vercel Configuration
  console.log('\n═'.repeat(60));
  console.log('\n🌐 STEP 3: Configure Vercel Frontend\n');
  
  const frontendName = await question('Enter frontend project name (or press Enter for "smart-dispatcher"): ') || 'smart-dispatcher';
  
  console.log(`\n✅ Frontend Configuration:
  - Project Name: ${frontendName}
  - Framework: Vite (React)
  - Root Directory: frontend`);

  // Telegram (Optional)
  console.log('\n═'.repeat(60));
  console.log('\n📱 STEP 4: Telegram Bot (Optional)\n');
  
  const hasBot = await question('Do you have a Telegram Bot Token? (yes/no, default: no): ');
  let telegramToken = '';
  
  if (hasBot.toLowerCase() === 'yes' || hasBot.toLowerCase() === 'y') {
    telegramToken = await question('Enter your Telegram Bot Token: ');
  }

  // Generate Deployment Instructions
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           📋 Your Personalized Deployment Plan             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const instructions = `
🚀 DEPLOYMENT STEPS FOR ${githubUsername}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Deploy Backend to Render.com (5 minutes)
─────────────────────────────────────────────────

1. Go to → https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select your GitHub repository: smart-dispatcher
4. Fill in these settings:
   
   Name:              ${backendName}
   Environment:       Node
   Build Command:     npm install
   Start Command:     npm start
   Root Directory:    backend

5. Click "Create Web Service"
6. Wait for build to complete (3-5 minutes)
7. Click "Advanced" → "Environment Variables"
   
   Add these variables:
   ┌─────────────────────────────────────────────────┐
   │ PORT              = 3001                         │
   │ NODE_ENV          = production                   │
   │ JWT_SECRET        = ${finalJwtSecret}│
   ${telegramToken ? `│ TELEGRAM_BOT_TOKEN = ${telegramToken}│` : ''}
   │ FRONTEND_URL      = https://${frontendName}.vercel.app │
   └─────────────────────────────────────────────────┘

8. Click "Save" (backend will redeploy)
9. Wait for deployment to complete
10. Copy your backend URL: https://${backendName}.onrender.com


STEP 2: Deploy Frontend to Vercel (5 minutes)
──────────────────────────────────────────────

1. Go to → https://vercel.com/dashboard
2. Click "New Project"
3. Import Git Repository → select smart-dispatcher
4. Fill in these settings:
   
   Project Name:      ${frontendName}
   Framework:         Vite
   Root Directory:    frontend

5. Scroll to "Environment Variables" and add:
   ┌──────────────────────────────────────────────────┐
   │ Key:   VITE_API_URL                              │
   │ Value: https://${backendName}.onrender.com/api  │
   └──────────────────────────────────────────────────┘

6. Click "Deploy"
7. Wait for deployment to complete (2-3 minutes)
8. Copy your frontend URL: https://${frontendName}.vercel.app


STEP 3: Verify Everything Works
────────────────────────────────

1. Open your frontend: https://${frontendName}.vercel.app
2. Login with demo credentials:
   Username: admin
   Password: admin123

3. Test features:
   ✓ Navigate through Dashboard, Orders, Technicians
   ✓ Try creating an order
   ✓ Check technician map
   ✓ View reports

If you see errors:
- Check browser console (F12 → Console tab)
- Verify VITE_API_URL is correct in Vercel environment
- Wait for Render backend to fully deploy


🎉 SUCCESS INDICATORS
─────────────────────

✅ Frontend loads without blank page
✅ Login page appears with demo credentials
✅ Dashboard loads with statistics
✅ Map loads with technician pins
✅ No "Cannot connect to backend" errors


📞 TROUBLESHOOTING
──────────────────

"Cannot connect to backend"
→ Backend might still be deploying (wait 5 min)
→ Check Render logs for errors
→ Verify JWT_SECRET is set

"Blank page"
→ Check browser console (F12)
→ Hard refresh (Ctrl+Shift+R)
→ Verify VITE_API_URL is correct

"Render backend keeps spinning down"
→ This is normal on free tier after 15+ minutes
→ First request = ~30 sec startup time
→ Upgrade to Render Pro ($7/mo) to disable


💰 COSTS
────────

Vercel:  $0/month (unlimited free tier)
Render:  $0/month (free tier with spin-down)
GitHub:  $0/month (free repositories)
─────────────────
TOTAL:   $0/month


📌 SAVE THIS INFORMATION
────────────────────────

Backend URL:      https://${backendName}.onrender.com
Frontend URL:     https://${frontendName}.vercel.app
API URL:          https://${backendName}.onrender.com/api
GitHub:           https://github.com/${githubUsername}/smart-dispatcher
JWT Secret:       ${finalJwtSecret}

`;

  console.log(instructions);

  // Save configuration
  const configFile = {
    github_username: githubUsername,
    backend_name: backendName,
    frontend_name: frontendName,
    jwt_secret: finalJwtSecret,
    telegram_token: telegramToken,
    deployed_at: new Date().toISOString(),
    backend_url: `https://${backendName}.onrender.com`,
    frontend_url: `https://${frontendName}.vercel.app`,
    api_url: `https://${backendName}.onrender.com/api`
  };

  fs.writeFileSync('DEPLOYMENT_CONFIG.json', JSON.stringify(configFile, null, 2));
  console.log('\n📄 Saved configuration to DEPLOYMENT_CONFIG.json\n');

  // Ask if user wants quick links
  const openBrowser = await question('\nOpen Render and Vercel dashboards? (yes/no): ');
  
  if (openBrowser.toLowerCase() === 'yes' || openBrowser.toLowerCase() === 'y') {
    try {
      if (process.platform === 'win32') {
        execSync('start https://render.com/dashboard');
        execSync('start https://vercel.com/dashboard');
      } else if (process.platform === 'darwin') {
        execSync('open https://render.com/dashboard');
        execSync('open https://vercel.com/dashboard');
      }
      console.log('\n✅ Dashboards opened in browser!');
    } catch {
      console.log('\n⚠️  Could not open browsers. Visit manually:');
      console.log('   https://render.com/dashboard');
      console.log('   https://vercel.com/dashboard');
    }
  }

  console.log('\n✅ Deployment assistant complete!');
  console.log('👉 Follow the steps above to deploy your dashboard\n');
  
  rl.close();
}

main().catch(console.error);
