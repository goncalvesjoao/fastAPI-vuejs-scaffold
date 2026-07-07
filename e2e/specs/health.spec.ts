import { test, expect } from "@playwright/test";

test("/health", async ({ page }) => {
  await page.goto("/health");

  await expect(page.getByText("API: Up")).toBeVisible();
  await expect(page.getByText("DB: Up")).toBeVisible();
});
