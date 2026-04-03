# Pit Scouting Offline App

This is a small installable web app based on the Google Form:
https://docs.google.com/forms/d/e/1FAIpQLScIQ8xcGvd0TV2XRkuY1JSq5T1qE03inmege_OQSYX_I7dh2A/viewform

## What it does

- Mirrors every visible field from the form
- Saves submissions locally in IndexedDB
- Works offline after first load on supported browsers
- Exports saved submissions as CSV or JSON
- Supports sharing the CSV file from compatible mobile browsers
- Opens an email draft so you can attach the exported file and send it

## Files

- `index.html` — main app
- `service-worker.js` — offline caching
- `manifest.webmanifest` — install metadata
- `icon-192.png`, `icon-512.png` — app icons

## Host it

Because service workers usually require HTTP instead of `file://`, host this folder on a simple web server or static site host such as GitHub Pages.

### Quick local test with Python

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Install on iPhone or iPad

1. Open the hosted app in **Safari**.
2. Let the page fully load once while online.
3. Tap the **Share** button.
4. Tap **Add to Home Screen**.
5. Tap **Add**.
6. Launch the app from the Home Screen for the best offline behavior.

If **Add to Home Screen** does not appear, make sure the page is open directly in Safari rather than inside another app’s built-in browser.

## Install on Android

1. Open the hosted app in **Chrome** or **Edge**.
2. Let the page fully load once while online.
3. Accept the **Install app** prompt if it appears.
4. If no prompt appears, open the browser menu and choose **Install app** or **Add to Home screen**.
5. Launch it from the Home Screen or app drawer.

## Before using it offline at an event

1. Open the installed app once while online.
2. Save a test submission.
3. Turn on Airplane Mode.
4. Reopen the app from the Home Screen icon.
5. Confirm that the form opens and that you can save another submission.
6. Export a CSV to verify the workflow end to end.

## Importing into Google Sheets

1. Export CSV from the app.
2. Open Google Sheets.
3. Import the CSV file into a sheet.

## Notes

- The app stores data only on the current device/browser unless you export it.
- Clearing browser storage or uninstalling site data may remove saved submissions.
- The linked Google Form includes an `Other:` option for Drivetrain Type. This app includes a text field for that description.
