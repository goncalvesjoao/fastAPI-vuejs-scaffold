import { test, expect } from "@playwright/test";

test("/", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Scientific Article1").first()).toBeVisible();
  await expect(page.getByText("Journal Article1").first()).toBeVisible();
});
