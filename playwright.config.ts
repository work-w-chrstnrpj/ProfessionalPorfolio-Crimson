import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  use: { baseURL:'http://127.0.0.1:4183', browserName:'chromium', headless:true },
  webServer: { command:'npm run preview', url:'http://127.0.0.1:4183', reuseExistingServer:!process.env.CI },
});
