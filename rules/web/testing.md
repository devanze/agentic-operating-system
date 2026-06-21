# Web/Frontend Testing

## Playwright for E2E Testing

```typescript
import { test, expect } from "@playwright/test";

test("user can complete checkout", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await page.getByRole("link", { name: /checkout/i }).click();

    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: /place order/i }).click();

    await expect(page.getByText(/order confirmed/i)).toBeVisible();
});
```

## Visual Regression Testing

```typescript
// Percy (visual diff service)
import percySnapshot from "@percy/playwright";

test("homepage visual consistency", async ({ page }) => {
    await page.goto("/");
    await percySnapshot(page, "Homepage");
});

// Or Chromatic for Storybook stories
```

- Run visual tests on every PR to catch unintended style changes
- Set up a baseline and diff against it
- Approve intentional changes, reject unintended ones

## Lighthouse CI for Performance Budgets

```typescript
import { playAudit } from "playwright-lighthouse";

test("passes Lighthouse performance audit", async ({ page }) => {
    await page.goto("/");
    await playAudit({
        page,
        thresholds: {
            performance: 80,
            accessibility: 90,
            "best-practices": 90,
            seo: 90,
        },
        port: 9222, // Lighthouse requires remote debugging port
    });
});
```

## Keyboard Navigation Testing

```typescript
test("modal is keyboard accessible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByText(/open settings/i).click();

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /save/i })).toBeFocused();

    // Escape closes modal
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
});
```

## Multi-viewport Testing

```typescript
const viewports = [
    { width: 375, height: 667 },   // mobile
    { width: 768, height: 1024 },  // tablet
    { width: 1280, height: 800 },  // desktop
];

for (const viewport of viewports) {
    test(`navigation renders at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/");
        await expect(page.getByRole("navigation")).toBeVisible();
    });
}
```

## Mocking API Responses for Deterministic Tests

```typescript
test("shows empty state when no users", async ({ page }) => {
    await page.route("**/api/users**", async (route) => {
        await route.fulfill({ json: [] });
    });
    await page.goto("/users");
    await expect(page.getByText(/no users found/i)).toBeVisible();
});
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `page.waitForTimeout(1000)` | `waitForSelector` / `waitForResponse` | Time-based waits are flaky |
| Testing CSS values (color, size) | Visual regression tests | CSS values change with refactors |
| Real API calls in E2E tests | `page.route()` to mock | Tests fail when API is down |
| Single viewport in all tests | Multiple viewport configurations | Mobile layout breaks differ from desktop |
