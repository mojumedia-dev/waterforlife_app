// Playwright smoke test for the Water For Life React/Vite app.
//
// Walks the key user flows and captures mobile + desktop screenshots for
// visual regression. This app runs client-side only (no auth backend to
// mock) so the tests are straightforward.
//
// Usage:
//   npx playwright test tests/smoke.spec.ts                              # against http://localhost:5173
//   BASE_URL=https://waterforlife-app.up.railway.app npx playwright test # against deployed Railway URL

import { expect, test } from "@playwright/test";

const BASE = (process.env.BASE_URL ?? "http://localhost:5173").replace(/\/$/, "");

const BREAKPOINTS = [
  { name: "mobile",  width: 375,  height: 812 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const bp of BREAKPOINTS) {
  test.describe(`Water For Life (${bp.name})`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    test("home page renders without console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

      await page.goto(BASE);
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: `tests/output/home-${bp.name}.png`, fullPage: true });

      const nonFavicon = errors.filter((e) => !e.includes("favicon"));
      expect(nonFavicon, `Page errors on ${bp.name}: ${nonFavicon.join("; ")}`).toHaveLength(0);
    });

    test("wellness guide deep-link renders", async ({ page }) => {
      await page.goto(`${BASE}?startAt=wellness`);
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: `tests/output/wellness-${bp.name}.png`, fullPage: true });
    });
  });
}
