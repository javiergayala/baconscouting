# Exploding Bacon Pit Scouting

This package includes:

- `index.html`
- `styles.css`
- `app.js`
- `service-worker.js`
- `manifest.webmanifest`
- `icons/`

## What changed
- Fixed offline launch from the Home Screen by caching the full app shell.
- Added a stronger service worker strategy:
  - **network-first** for HTML, JS, CSS, and the manifest
  - **cached fallback** when the network is unavailable
- Added update checks on load, on reconnect, when the page becomes visible, and every minute.
- Kept **Notes optional**.

## GitHub Pages
Publish the contents of this folder at the root of your repo and keep `.nojekyll`.

## Test
1. Open the site once while online.
2. Wait a few seconds for the service worker to install.
3. Add it to the Home Screen.
4. Turn on Airplane Mode.
5. Launch from the icon. It should load from cache.
