# Exploding Bacon Pit Scouting

Offline-ready web app based on the Google Form:

https://docs.google.com/forms/d/e/1FAIpQLScIQ8xcGvd0TV2XRkuY1JSq5T1qE03inmege_OQSYX_I7dh2A/viewform

## What's in this version

- Includes every visible field from the Google Form
- Save button stays disabled until every form field has a value
- Install instructions are collapsible
- Install instructions default to collapsed when launched from the Home Screen
- App icon is based on the supplied Exploding Bacon image
- Mobile layout is tighter for phone use
- Styling follows the 1902 branding cheatsheet colors and font guidance
- Saves submissions locally in IndexedDB
- Exports saved submissions to CSV or JSON
- Supports Web Share API for CSV sharing when available

## Files

- `index.html` — main app
- `manifest.webmanifest` — PWA manifest
- `service-worker.js` — offline caching
- `icons/` — app icons based on the supplied team logo

## Host on GitHub Pages

1. Create a public GitHub repo
2. Upload the contents of this folder to the repo root
3. In GitHub: **Settings → Pages**
4. Set:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Wait for Pages to publish
6. Open the live URL on your phone

## Install to Home Screen

### iPhone / iPad

1. Open the app in Safari
2. Tap **Share**
3. Tap **Add to Home Screen**
4. Tap **Add**
5. Open the Home Screen icon once while online
6. Test saving one submission while offline

### Android

1. Open the app in Chrome or Edge
2. Tap the browser menu
3. Choose **Install app** or **Add to Home screen**
4. Confirm the install
5. Open the installed app once while online
6. Test saving one submission while offline

## Quick test

1. Open the app while online
2. Fill out and save a test submission
3. Turn on Airplane Mode
4. Open the Home Screen version of the app
5. Save another test submission
6. Export CSV to confirm your backup workflow works


## Update behavior

The service worker now uses a network-first strategy for the app shell (`index.html`, JavaScript, CSS, and manifest).

- **When online:** it checks the network first and refreshes the cached app files with the newest version it can reach.
- **When offline or unreachable:** it falls back to the cached version so the app still opens and works.
- The app also asks the browser to check for updates on load, when connectivity returns, when the tab becomes visible again, and once a minute while open.
