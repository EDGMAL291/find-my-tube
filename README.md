# Find My Tube

Mobile-first clinical reference and laboratory stock workflow for choosing specimen tubes, building a Tube Plan, finding suggested tests, requesting consumables, tracking orders, and managing laboratory inventory.

## Run locally

```bash
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. Clinical reference pages work without Supabase; stock APIs return a clear `503` until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.

## Verify changes

```bash
npm run check
npm test
npm audit
```

Then exercise the affected workflow in a browser at desktop and mobile widths. For stock changes, separately verify public request submission, Track Orders, authenticated dashboard access, status transitions, receipts, and inventory balances.

## Architecture

- GitHub Pages: static HTML, CSS, JavaScript, datasets, images, and PWA shell.
- Render: `server.js` API and same-repository static preview.
- Supabase: users, server-side sessions, requests, receipts, batches, inventory, and audit logs.
- `assets/js/stock-catalog-data.js`: shared catalogue and quantity rules used by browser and server.

See [architecture](docs/architecture.md), [business rules](docs/business-rules.md), [local setup](docs/local-backend-setup.md), and [Render setup](docs/render-backend-setup.md).

## Environment

Required for stock workflows:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose it in browser assets

Optional:

- `ALLOWED_ORIGINS` — comma-separated additional browser origins
- `STOCK_SHEETS_WEBHOOK_URL`
- `STOCK_ORDER_SHEETS_WEBHOOK_URL`

Apply schema migrations in `supabase/migrations/` in filename order. Do not rerun `20260617_reset_current_stock_only.sql`: it is a one-time inventory reset, not a routine schema migration.

## Deployment

Pushing `main` triggers the GitHub Pages workflow. Render auto-deploys the API from the same branch. Verify these as separate facts:

1. the commit exists on `origin/main`;
2. the GitHub Pages workflow succeeded and the custom domain serves the new asset version;
3. Render reports a healthy deployment;
4. `GET https://find-my-tube-api.onrender.com/api/health` returns `200`;
5. a disposable, clearly labelled request succeeds before removing it from the work queue.

## Clinical safety

Find My Tube is a reference-support tool. Follow current local laboratory protocols and obtain direct laboratory or senior clinical guidance for urgent, paediatric, transfusion, unusual, or site-specific requests.
