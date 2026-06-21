# Next.js Testing

## Framework
- Unit: Jest + `@testing-library/react` for component tests
- E2E: Playwright (recommended) or Cypress
- Utilities: `@testing-library/jest-dom` for DOM matchers

## Conventions
- Test files: `*.test.tsx` or `*.spec.tsx` alongside source
- E2E tests in `e2e/` directory with `.spec.ts` extension
- Mock server for API tests with `msw` (Mock Service Worker)

## Patterns

### Server Component Testing
```tsx
import { render, screen } from '@testing-library/react';

// Server components can be rendered for snapshot/content tests
it('renders post titles from fetched data', async () => {
  // Mock global fetch
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve([{ id: 1, title: 'Test Post' }]),
  });

  const Page = await import('@/app/posts/page').then(m => m.default);
  render(await Page());

  expect(screen.getByText('Test Post')).toBeInTheDocument();
});
```

### Client Component Testing with User Events
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('submits form and shows success message', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.type(screen.getByLabelText('Email'), 'test@test.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
});
```

### E2E with Playwright
```typescript
// e2e/login.spec.ts
test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Coverage
- Target: 80%+ for components and utilities, 90%+ for server actions
- Tool: Jest coverage (`--coverage`) or istanbul
- CI: Run unit tests + E2E smoke tests on every PR
