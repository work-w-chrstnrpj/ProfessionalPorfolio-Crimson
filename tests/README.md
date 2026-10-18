# Verification

- `npm test`: portfolio unit/component tests and safe publication-helper tests.
- `npm run test:starter`: placeholder-only identity/assets and non-deploying CI guard.
- `npm run verify:portfolio`: typecheck, portfolio tests, static build and export/asset checks.
- `npm run test:e2e`: Chromium browser checks for responsive layout, routes, navigation, contact mocks and accessibility. Install with `npx playwright install chromium`.
- `npm run test:layout`: installed Chrome and Playwright WebKit layout checks. Install WebKit with `npx playwright install webkit`.

Run browser/export checks after building. Browser captures go to ignored `.artifacts/browser/`. Synthetic content is in tests/fixtures/synthetic, with a synthetic PDF kept outside public assets. No automated test sends real email.
