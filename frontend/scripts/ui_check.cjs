const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const pagesToCheck = ['/', '/dashboard', '/orders', '/technicians', '/claims', '/reports', '/import'];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const errors = [];
  const consoleMsgs = [];

  // Inject localStorage auth so ProtectedRoute sees an authenticated user
  await context.addInitScript(() => {
    try {
      const key = 'smart-dispatcher-auth';
      const value = JSON.stringify({ user: { id: 0, username: 'public', name: 'Public User', role: 'admin' }, token: 'public-token', isAuthenticated: true });
      localStorage.setItem(key, value);
    } catch (e) {}
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  for (const path of pagesToCheck) {
    const url = base.replace(/\/$/, '') + path;
    console.log('→ Navigating to', url);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`  status: ${resp && resp.status()}`);
    } catch (e) {
      errors.push({ type: 'navigation', path, message: e.message });
    }

    // Try interacting: click first primary button if present
    try {
      const btn = await page.$('button.btn-primary');
      if (btn) {
        await btn.click({ timeout: 2000 }).catch(() => {});
      }
    } catch (e) {
      // ignore
    }

    // Short pause
    await page.waitForTimeout(500);
  }

  await browser.close();

  console.log('\n=== Console Messages ===');
  consoleMsgs.forEach(m => console.log(m.type, m.text));

  console.log('\n=== Errors ===');
  if (errors.length === 0) console.log('No errors detected');
  errors.forEach(e => console.log(e.type, e.message));

  if (errors.length > 0) process.exitCode = 2;
  else process.exitCode = 0;
})();
