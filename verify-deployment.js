#!/usr/bin/env node

/**
 * Smart Dispatcher - Deployment Verification Script
 * Run this after deploying to verify everything works
 */

const fs = require('fs');
const https = require('https');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode === 200
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });
  });
}

async function main() {
  console.log('\n🔍 Smart Dispatcher - Deployment Verification\n');
  
  // Get URLs from user or config
  console.log('Enter your deployed URLs:\n');
  
  const prompt = (question) => {
    return new Promise(resolve => {
      process.stdout.write(question);
      process.stdin.once('data', data => {
        resolve(data.toString().trim());
      });
    });
  };

  try {
    const backendUrl = await prompt('Backend URL (e.g., https://smart-dispatcher-backend.onrender.com): ');
    const frontendUrl = await prompt('Frontend URL (e.g., https://smart-dispatcher.vercel.app): ');

    console.log('\n⏳ Testing deployment...\n');

    // Test backend health
    const healthResult = await checkUrl(`${backendUrl}/api/health`);
    console.log(`Backend Health Check: ${healthResult.ok ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   URL: ${healthResult.url}`);
    console.log(`   Status: ${healthResult.status}\n`);

    // Test frontend
    const frontendResult = await checkUrl(`${frontendUrl}/`);
    console.log(`Frontend Loading: ${frontendResult.ok ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   URL: ${frontendResult.url}`);
    console.log(`   Status: ${frontendResult.status}\n`);

    if (healthResult.ok && frontendResult.ok) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ DEPLOYMENT SUCCESSFUL!\n');
      console.log('Your dashboard is LIVE! 🎉\n');
      console.log('📍 Access at: ' + frontendUrl);
      console.log('🔌 API at: ' + backendUrl + '/api\n');
      console.log('Next steps:');
      console.log('1. Open ' + frontendUrl + ' in your browser');
      console.log('2. Login with: admin / admin123');
      console.log('3. Test features (Dashboard, Orders, Technicians)');
      console.log('4. Monitor Render & Vercel dashboards');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  Some checks failed. Troubleshooting:\n');
      if (!healthResult.ok) {
        console.log('❌ Backend not responding:');
        console.log('   - Is Render deployment complete? (wait 5 min)');
        console.log('   - Check Render logs for errors\n');
      }
      if (!frontendResult.ok) {
        console.log('❌ Frontend not loading:');
        console.log('   - Is Vercel deployment complete? (wait 3 min)');
        console.log('   - Hard refresh: Ctrl+Shift+R\n');
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  }

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkUrl };
