// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false, // ทดสอบ Firestore จริง รันทีละตัวกันข้อมูลชนกัน
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "tests/results.json" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
