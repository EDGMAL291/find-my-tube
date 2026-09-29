# Find My Tube engineering notes

## Product boundaries

- Clinical content is reference support, not diagnosis. Preserve urgent, paediatric, transfusion, and local-protocol warnings.
- Supabase is the source of truth for users, sessions, requests, receipts, inventory, batches, and audit logs.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Preserve request history when resetting current stock.

## Change order

1. Confirm database and business-rule impact.
2. Update server validation and authorization.
3. Update the browser workflow.
4. Advance static asset and service-worker versions.
5. Run `npm run check`, `npm test`, and browser checks at desktop and mobile widths.

## Important files

- `server.js`: HTTP API, auth, Supabase persistence, and static serving.
- `assets/js/stock-catalog-data.js`: canonical stock catalogue shared by browser and server.
- `assets/js/script.js`: shared public product behavior.
- `assets/js/stock-dashboard.js`: protected work queue and inventory UI.
- `supabase/migrations/`: ordered production database changes.
- `service-worker.js`: PWA shell and cache policy.

## Deployment truth

GitHub Pages publishes the frontend from `main`; Render hosts the Node API. A successful local test or Git push is not proof that either deployment is live. Verify the GitHub Pages site and `/api/health` independently after publishing.
