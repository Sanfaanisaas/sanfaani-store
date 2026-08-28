# Sanfaani Store Frontend

Next.js web storefront with a shared typed API contract and an Expo customer app in mobile/.

## Runtime and setup

Use Node 22.15.x and pnpm 11.15.1. Run pnpm install --frozen-lockfile, copy .env.example, and configure BACKEND_URL server-side plus NEXT_PUBLIC_SITE_URL for metadata. Never put secrets in NEXT_PUBLIC_* variables.

## Architecture

Web routes live in src/app/; transport and normalized DTOs are in src/lib/api/; repository guides are in src/content/; the mobile Expo Router app is in mobile/. Backend OpenAPI/status snapshots are recorded in contracts/ and checked by pnpm api:check.

Authentication keeps browser access tokens in memory and uses the backend HTTP-only refresh cookie. Logout clears runtime auth and user-scoped state. Mobile uses Expo SecureStore, never AsyncStorage.

## Commands

pnpm dev, pnpm build, pnpm start
pnpm lint, pnpm type-check
pnpm test:unit, pnpm test:integration, pnpm test:e2e, pnpm test:a11y
pnpm api:generate, pnpm api:check, pnpm smoke:api, pnpm smoke:vercel, pnpm security:scan
pnpm mobile:validate, pnpm mobile:type-check, pnpm mobile:test

## CI, deployment, and rollback

The required workflow is .github/workflows/frontend.yml; its required checks are lint, type-check, API contract, tests, build, browser/a11y, Lighthouse, security scan, and mobile validation. Vercel should use the same Node/pnpm versions and server-side backend URL. Set VERCEL_SMOKE_URL to run safe deployment checks. To roll back, identify the last successful Vercel deployment, promote it using the Vercel dashboard/CLI, then run smoke checks and record owner and timestamp.

## Accessibility and security

Use keyboard-visible focus, semantic labels, reduced-motion support, no unsafe HTML, no tokens in URLs/logs, safe external links, and essential-only consent by default. Private routes are noindexed.

## Mobile release

Expo/EAS profiles are in mobile/eas.json; signing credentials remain outside the repository. Build numbers use EAS auto-increment for production. Crash monitoring and push-device registration are explicit integration boundaries until backend support exists. See docs/route-prd-matrix.md for known unavailable capabilities (customer warranty list, evidence upload, device-token registration).