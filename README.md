# Find My Tube

Mobile-friendly lab test lookup tool for tube type, specimen handling, turnaround guidance, and clinical context.

## Local Preview

1. Install dependencies:

```bash
npm install
```

2. Run local dev server:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000`

## Local Backend

The stock request flow now has a free built-in backend:

- `POST /api/stock-requests` saves consumables requests locally
- `GET /api/stock-requests` returns recent requests
- `GET /api/lab/stock-stats` returns protected summary stats for lab users
- data is stored in `data/stock-requests.json`
- lab login data is stored in `data/stock-users.json`

Use `http://localhost:3000/stock-dashboard.html` to review recent requests and update their status.
Lab users cannot self-register anymore. The site owner creates them.

## Owner Setup

To set or reset the owner login from this Mac:

```bash
npm run owner:set -- --user 001 --pin 1234
```

That user becomes the owner and can:

- create other lab users
- clear saved stock request history
- access the protected dashboard

## Deploy Online

This project is static with no build step required.

The repo already includes a GitHub Pages workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), so pushing to `main` is enough to publish if Pages is enabled for the repository.

## Install As App (PWA)

This project now includes:
- `manifest.webmanifest`
- `service-worker.js` (offline caching)
- app icons (`assets/icons/icon-192.svg`, `assets/icons/icon-512.svg`)

How to install:
1. Open the deployed site in Chrome/Edge on Android or desktop.
2. Use browser menu -> `Install app` (or `Add to Home Screen`).
3. Launch from home screen/app launcher in standalone mode.

## Files

- `index.html` - structure and content
- `assets/css/style.css` - UI styles
- `assets/js/script.js` - search/filter logic and rendering
- `assets/js/stock-dashboard.js` - local stock dashboard
- `assets/data/data.js` - lab test dataset
- `server.js` - local backend and static file server
- `data/stock-requests.json` - saved consumables requests
- `data/stock-users.json` - local lab login records
- `assets/images/lab-bg.svg` - lab-themed background artwork
- `assets/icons/` - favicons, PWA icons, and source icon artwork
- `docs/find-my-tube-preview.zip` - packaged preview artifact

## Clinical Note

This is a clinical support tool. Always follow your local laboratory protocol and verify urgent/special sample handling requirements with the receiving lab.
