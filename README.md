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
- `assets/data/data.js` - lab test dataset
- `assets/images/lab-bg.svg` - lab-themed background artwork
- `assets/icons/` - favicons, PWA icons, and source icon artwork
- `docs/find-my-tube-preview.zip` - packaged preview artifact

## Clinical Note

This is a clinical support tool. Always follow your local laboratory protocol and verify urgent/special sample handling requirements with the receiving lab.
