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

## Deploy Online (Netlify)

This project is static (no build step required).

1. Commit and push to GitHub:

```bash
git add .
git commit -m "Prepare deployment"
git push origin main
```

2. In Netlify:
- `Add new site` -> `Import an existing project`
- Choose your GitHub repo
- Build command: leave empty
- Publish directory: `.`
- Deploy

3. After deploy:
- Share the generated Netlify URL with reviewers
- Optionally set a custom site name/domain

## Install As App (PWA)

This project now includes:
- `manifest.webmanifest`
- `service-worker.js` (offline caching)
- app icons (`icon-192.svg`, `icon-512.svg`)

How to install:
1. Open the deployed site in Chrome/Edge on Android or desktop.
2. Use browser menu -> `Install app` (or `Add to Home Screen`).
3. Launch from home screen/app launcher in standalone mode.

## Files

- `index.html` - structure and content
- `style.css` - UI styles
- `script.js` - search/filter logic and rendering
- `data.js` - lab test dataset
- `lab-bg.svg` - lab-themed background artwork

## Clinical Note

This is a clinical support tool. Always follow your local laboratory protocol and verify urgent/special sample handling requirements with the receiving lab.
