const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Starting UI check...');
    console.log('Launching Chromium...');
    
    const browser = await chromium.launch({ headless: true }).catch(err => {
      console.error('Failed to launch chromium:', err.message);
      throw err;
    });
    
    console.log('Browser launched successfully');
    const context = await browser.newContext();
    console.log('Context created');

    const base = process.env.BASE_URL || 'http://localhost:5173';
    const pagesToCheck = ['/', '/dashboard'];

    // Inject localStorage auth
    await context.addInitScript(() => {
      try {
        const key = 'smart-dispatcher-auth';
        const value = JSON.stringify({ user: { id: 0, username: 'public', name: 'Public User', role: 'admin' }, token: 'public-token', isAuthenticated: true });
        localStorage.setItem(key, value);
      } catch (e) {}
    });

    const page = await context.newPage();
    console.log('Page created');

    const errors = [];
    const consoleMsgs = [];

    page.on('console', (msg) => {
      consoleMsgs.push({ type: msg.type(), text: msg.text() });
    });

    page.on('pageerror', (err) => {
      errors.push({ type: 'pageerror', message: err.message });
    });

    for (const path of pagesToCheck) {
      const url = base.replace(/\/$/, '') + path;
      console.log(`\n→ Testing: ${url}`);
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        console.log(`  Status: ${resp ? resp.status() : 'no response'}`);
      } catch (e) {
        console.error(`  Navigation failed: ${e.message}`);
        errors.push({ type: 'navigation', path, message: e.message });
      }
      await page.waitForTimeout(500);
    }

    await browser.close();
    console.log('\n✅ Test completed');
    console.log(`Errors found: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Error details:');
      errors.forEach(e => console.log(`  - ${e.type}: ${e.message}`));
    }

  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exitCode = 1;
  }
})();
