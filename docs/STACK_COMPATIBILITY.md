# Openfront + Openship compatibility guide

This template is designed to run beside `pathtoresiliencebv/openship-template` without port or database collisions.

## Supported pair

| Layer | Openfront | Openship | Compatibility rule |
| --- | --- | --- | --- |
| Node.js | `>=20.0.0` | `>=20.0.0` | Same runtime floor |
| Next.js | `^16.0.10` | `^16.0.10` | Same major and patch baseline |
| React | `^19.2.2` | `^19.2.2` | Same major and patch baseline |
| Keystone | `^6.5.1` | `^6.5.1` | Same GraphQL/auth model generation |
| GraphQL | `^16.11.0` | `^16.11.0` | Same transport major |
| Prisma | `^6.10.1` | `6.5.0` | Separate databases; same major |
| App port | `3000` | `3100` | No collision |
| PostgreSQL host port | `54321` | `54322` | No collision |

Run `npm run template:check` with both repositories in the same parent directory to verify the shared runtime majors automatically.

## Local pair startup

```bash
# Terminal 1
cd openfront-template
cp .env.example .env
docker compose up -d postgres
npm ci
npm run dev

# Terminal 2
cd openship-template
cp .env.example .env
docker compose up -d postgres
npm ci
npm run dev
```

## Connect Openfront to Openship

1. Create the first Openfront administrator at `http://localhost:3000/dashboard/init` and complete onboarding.
2. Create the first Openship administrator at `http://localhost:3100/init`.
3. In Openfront, create an OAuth application under `/dashboard/platform/apps` for Openship.
4. Use `http://localhost:3100/api/oauth/callback` as the local callback URL. In production, replace both origins with HTTPS URLs.
5. In Openship, create an Openfront platform and enter the Openfront origin as `http://localhost:3000` without a trailing slash, plus the OAuth client ID and secret.
6. Connect that platform as a **shop** when orders originate in Openfront, or as a **channel** when another shop should be fulfilled through Openfront inventory.
7. Create product matches and a link in Openship, then test one order end to end.

The Openship template already includes Openfront shop and channel adapters. They call this template's `/api/graphql` and `/api/oauth/token` endpoints and use signed webhook events for order and fulfillment updates.

## Known upstream baseline

- The application build intentionally ignores Openfront TypeScript build errors in `next.config.ts`; a standalone `tsc --noEmit` currently reports upstream typing debt.
- The template migrates `npm run lint` from the removed `next lint` command to ESLint. Existing upstream source violations may still fail a full lint; `npm run lint:template` validates the template-owned script.
- Openship's Openfront channel adapter does not support `ORDER_CANCELLED` subscriptions; use tracking/fulfillment events for that direction.
- Use publicly reachable HTTPS URLs for production OAuth callbacks and webhooks.

## Safe upgrade sequence

1. Pull upstream changes into one template at a time.
2. Run `npm ci` and `npm run template:check` in both repositories.
3. Check the GraphQL operations in Openship's `features/integrations/shop/openfront.ts` and `features/integrations/channel/openfront.ts` against Openfront's generated schema.
4. Test OAuth authorization, product search, order import, purchase creation and tracking callbacks.
5. Only then update the matching template release.
