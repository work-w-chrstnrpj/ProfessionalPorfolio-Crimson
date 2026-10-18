import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/media-browser',fullyParallel:true,
 use:{baseURL:'http://127.0.0.1:4184',browserName:'chromium',headless:true},
 webServer:{command:'npm run preview',env:{PORT:'4184'},url:'http://127.0.0.1:4184',reuseExistingServer:false}
});
