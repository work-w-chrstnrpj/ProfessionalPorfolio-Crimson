# Verification

- `npm test`: portfolio unit/component tests and safe publication-helper tests.
- `npm run test:starter`: placeholder-only identity/assets and non-deploying CI guard.
- `npm run verify:portfolio`: typecheck, portfolio tests, static build and export/asset checks.
- `npm run test:e2e`: Chromium browser checks for responsive layout, routes, navigation, contact mocks and accessibility. Install with `npx playwright install chromium`.
- `npm run test:layout`: installed Chrome and Playwright WebKit layout checks. Install WebKit with `npx playwright install webkit`.

Run browser/export checks after building. Browser captures go to ignored `.artifacts/browser/`. Synthetic content is in tests/fixtures/synthetic, with a synthetic PDF kept outside public assets. No automated test sends real email.

- `npm run test:media`: builds disposable showcase/video/poster config, verifies the shared card/detail media renderer, lazy loading, controller cleanup, reduced motion and fallback in Chromium, then restores the default build. Requires installed Chromium. Do not overlap with another build. Fixtures live under tests/fixtures/showcase and browser cases under tests/media-browser; screenshots go to .artifacts/media. No personal assets or synthetic video files remain in the default public output.

Local verification on 2026-10-19: 53 portfolio tests, 42 default browser checks, 9 configurable-media browser checks, 5 publication-helper checks and the starter guard passed; typecheck, static build and 2 export smoke checks passed. A temporary local integration of the supplied Sophia Bravado module also passed card/detail playback, expansion and reduced motion at 1440/390px. Its assets were removed afterward and the default build restored. That personal package is not a starter dependency or committed fixture. Physical-device and production-host verification were not performed.
