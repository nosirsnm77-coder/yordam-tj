const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    expect: { timeout: 5000 },
    fullyParallel: true,
    retries: 0,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        // Desktop Chrome
        {
            name: 'desktop-chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        // Mobile Android
        {
            name: 'mobile-android',
            use: { ...devices['Pixel 7'] },
        },
        // Mobile iPhone
        {
            name: 'mobile-iphone',
            use: { ...devices['iPhone 14'] },
        },
    ],

    // Local dev server
    webServer: {
        command: 'npx serve -l 3000 -s .',
        port: 3000,
        reuseExistingServer: true,
    },
});
