import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

test("/health", async ({ page }) => {
  await page.goto("/health");

  await expect(page.getByText("API: ok")).toBeVisible();
  await expect(page.getByText("DB: up")).toBeVisible();
});
