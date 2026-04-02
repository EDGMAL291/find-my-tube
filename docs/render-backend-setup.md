# Render Backend Setup

This project can use Render for the hosted stock API while the frontend stays on GitHub Pages.

## What You Will Get

- a hosted API URL such as `https://find-my-tube-api.onrender.com`
- persistent request storage on a Render disk
- the existing stock submit and dashboard endpoints from `server.js`

## Files Added For This

- [`render.yaml`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/render.yaml) - Render blueprint for the Node API
- [`server.js`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/server.js) - now supports `DATA_DIR` so Render can store data on its mounted disk

## Create The Backend In Render

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Connect this GitHub repo.
4. Render should detect [`render.yaml`](/Users/edgarmalesa/.codex/worktrees/f964/find%20my%20tube/render.yaml).
5. Create the service.

Render will create:

- a Node web service called `find-my-tube-api`
- a persistent disk mounted at `/var/data`
- an environment variable `DATA_DIR=/var/data/find-my-tube`

## Set The First Admin

After the service is live, open the Render Shell for the web service and run:

```bash
npm run admin:set -- --user 001 --pin 1234
```

That creates the first admin user in the hosted backend storage.

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

- This setup keeps your current JSON-file backend, but stores it on a Render disk instead of the repo filesystem.
- Sessions are still in memory, so lab users will need to sign in again after backend restarts.
- If you later want stronger durability and reporting, the next upgrade is moving requests/users from JSON files to a database.
