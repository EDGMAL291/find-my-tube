# Local Backend Setup

This project now ships with a free built-in backend in `server.js`.

## What It Does

- serves the app on port `3000`
- accepts consumables requests at `POST /api/stock-requests`
- stores requests in `data/stock-requests.json`
- exposes protected lab stats at `GET /api/lab/stock-stats`
- lets only the owner create lab users with a user number and 4-digit PIN
- lets signed-in lab users update request status from the dashboard

## Run It

```bash
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:3000/order-stock.html`
- `http://localhost:3000/stock-dashboard.html`

## Set The Owner

From the Mac running the app:

```bash
npm run owner:set -- --user 001 --pin 1234
```

This sets the owner login. The owner can then create other lab users from the dashboard.

## Notes

- This is a local backend, so the data stays on the machine running the server.
- Staff on the same network can use it if they open the machine IP address and the Mac allows local incoming connections.
- Because requests are stored in JSON, this is best for a lightweight internal workflow. If usage grows later, we can move the same API to SQLite without changing the front end much.
- Lab login is lightweight and local. Sessions are in memory, so signing in again is needed after a server restart.
- Users cannot create their own accounts through the site. Only the owner can add them.
