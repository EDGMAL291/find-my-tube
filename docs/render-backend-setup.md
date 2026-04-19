# Render Backend Setup

This project can use Render for the hosted stock API while the frontend stays on GitHub Pages.

## What You Will Get

- a hosted API URL such as `https://find-my-tube-api.onrender.com`
- persistent auth + stock storage in Supabase
- the existing stock submit and dashboard endpoints from `server.js`

## Files Added For This

- [`render.yaml`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/render.yaml) - Render blueprint for the Node API
- [`server.js`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/server.js) - uses Supabase-backed auth and stock persistence
- [`supabase/migrations/20260419_stock_dashboard.sql`](/Users/edgarmalesa/Desktop/new%20project/find%20my%20tube/supabase/migrations/20260419_stock_dashboard.sql) - required DB schema

## Create The Backend In Render

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Connect this GitHub repo.
4. Render should detect [`render.yaml`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/render.yaml).
5. Create the service.

Render will create a Node web service called `find-my-tube-api`.

Set these environment variables in Render:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
- optional: `SUPABASE_ANON_KEY` (frontend-safe only if needed for direct browser Supabase calls)

## Set The First Admin

After the service is live, open the Render Shell for the web service and run:

```bash
npm run admin:set -- --user 001 --pin 1234 --name "Lab Admin"
```

That creates or updates the first admin user in Supabase.

If you prefer not to use the Render shell, the live dashboard can now bootstrap the first admin automatically when no lab users exist yet.

## Wire The Live Frontend To The Backend

Once Render gives you the backend URL, update [`assets/js/app-config.js`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/assets/js/app-config.js):

```js
window.FMT_APP_CONFIG = Object.assign({}, window.FMT_APP_CONFIG, {
  stockApiBaseUrl: "https://YOUR-RENDER-URL.onrender.com",
  stockOrderSubmitUrl: ""
});
```

Then deploy the frontend again so the live site points at the hosted API.

## Smoke Test

After deploy, these should work:

- `GET https://YOUR-RENDER-URL.onrender.com/api/health`
- `POST https://YOUR-RENDER-URL.onrender.com/api/stock-requests`
- `GET https://YOUR-RENDER-URL.onrender.com/api/stock-requests?limit=12`

## Notes

- This setup uses Supabase as the source of truth for users, requests, receipts, inventory, sessions, and audit logs.
- Sessions are stored and validated server-side with Supabase-backed session records.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only and never expose it to the browser.
