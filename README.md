# Bodly 🌿

Your all-in-one wellness companion — weight goal, alcohol tracking, blood-sugar
log, hydration, healthy meal plans with auto shopping lists, a weekly exercise
plan, and a meditation timer with bells. Built as an installable **Progressive
Web App (PWA)**, so it lives on your phone's home screen and runs fullscreen
like a native app. All your data is stored privately on your own device.

---

## 1. Run it on your computer

You'll need [Node.js](https://nodejs.org) (version 18 or newer).

```bash
npm install      # install dependencies (one time)
npm run dev      # start the local dev server
```

Open the URL it prints (usually http://localhost:5173).

---

## 2. Build for production

```bash
npm run build    # outputs the finished site into the dist/ folder
npm run preview  # preview the production build locally (with --host for phone testing)
```

The `dist/` folder is the entire deployable app, service worker and all.

---

## 3. Put it online (free)

Pick any one of these. All you need is the public URL afterward.

### Option A — Vercel (easiest)
1. Push this folder to a GitHub repo.
2. Go to vercel.com → "Add New Project" → import the repo.
3. Framework preset: **Vite**. Click Deploy. Done — you get a URL.

### Option B — Netlify
1. Push to GitHub (or drag-and-drop the `dist/` folder at app.netlify.com/drop).
2. Build command: `npm run build` · Publish directory: `dist`.

### Option C — GitHub Pages
1. In `vite.config.js`, set `base: "/your-repo-name/"`.
2. `npm run build`, then publish the `dist/` folder to the `gh-pages` branch
   (e.g. with the `gh-pages` npm package).

---

## 4. Install on your home screen 📱

Open your deployed URL on your phone:

**iPhone (Safari):** tap the **Share** button → **Add to Home Screen**.
**Android (Chrome):** tap the **⋮** menu → **Install app** / **Add to Home Screen**.

The Bodly icon (the Vitruvian figure) appears on your home screen and launches
fullscreen — no browser bars. It also works offline after the first load.

---

## 5. Want a real App Store / Play Store app later?

This same project can be wrapped natively with **Capacitor** — no rewrite:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init Bodly com.yourname.bodly
npm run build
npx cap add ios       # and/or: npx cap add android
npx cap copy
npx cap open ios      # opens Xcode (needs a Mac + Apple Developer account)
```

---

## Notes

- **Your data** is saved in your browser/device via `localStorage` under the key
  `bodly-data`. Clearing site data or uninstalling removes it. (A future version
  could add cloud sync or export/import.)
- **The meditation bell** uses the Web Audio API and starts on your first tap
  (the "Begin" button) — that's a normal browser requirement for sound.
- **Not medical advice.** Bodly supports healthy habits; please partner with your
  doctor for prediabetes and significant weight-loss goals.

Enjoy, and be well. 💚
