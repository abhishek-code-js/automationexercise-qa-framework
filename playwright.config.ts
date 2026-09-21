import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

import "dotenv/config";

const bddTestDir = defineBddConfig({
  paths: ["features/**/*.feature"],
  require: ["steps/**/*.ts"],
});

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "always" }],
    ["junit", { outputFile: "results.xml" }],
    ["./src/reporting/excel-reporter.ts"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "https://automationexercise.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "ui-chromium",
      testDir: "tests",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "bdd-chromium",
      testDir: ".features-gen",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
