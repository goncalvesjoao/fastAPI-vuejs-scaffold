import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const backendPort = 8010;
const frontendPort = 5183;
const databasePath = path.resolve("test-results/test.db");
const environment = {
  BACKEND_PORT: String(backendPort),
  FRONTEND_PORT: String(frontendPort),
  DATABASE_URL: `sqlite:///${databasePath}`,
  NO_AUTH: "true",
  NO_AUTH_TOKEN: "current_user",
};
const isCI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: isCI
      ? `http://localhost:${backendPort}`
      : `http://localhost:${frontendPort}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Only on CI systems run the tests headless */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //   },
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev servers before starting the tests */
  webServer: isCI
    ? {
        command: `npm run db:seed:e2e-data && npm run backend:start`,
        port: backendPort,
        reuseExistingServer: false,
        env: environment,
      }
    : [
        {
          command: `npm run db:seed:e2e-data && npm run backend:dev`,
          port: backendPort,
          reuseExistingServer: true,
          env: environment,
        },
        {
          command: `npm run frontend:dev`,
          port: frontendPort,
          reuseExistingServer: true,
          env: environment,
        },
      ],
});
