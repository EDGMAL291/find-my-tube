# Local Backend Setup

This project now ships with a free built-in backend in `server.js`.

## What It Does

- serves the app on port `3000`
- accepts consumables requests at `POST /api/stock-requests`
- stores auth and stock data in Supabase tables
- exposes protected lab stats at `GET /api/lab/stock-stats`
- lets only the admin create lab users with a user number and 4-digit PIN
- lets signed-in lab users update request status from the dashboard

## Run It

Before running locally, set:

```bash
export SUPABASE_URL=\"https://YOUR-PROJECT.supabase.co\"
export SUPABASE_SERVICE_ROLE_KEY=\"YOUR_SERVICE_ROLE_KEY\"
```

```bash
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:3000/order-stock.html`
- `http://localhost:3000/stock-dashboard.html`

## Set The Admin

From the Mac running the app:

```bash
npm run admin:set -- --user 001 --pin 1234
```

This sets the admin login. The admin can then create other lab users from the dashboard.

## Notes

- This runs locally, but auth and stock data persist in your configured Supabase project.
- Staff on the same network can use it if they open the machine IP address and the Mac allows local incoming connections.
- Data durability now comes from Supabase, not local JSON files.
- Lab sessions are validated server-side via Supabase-backed session records.
- Users cannot create their own accounts through the site. Only the admin can add them.
