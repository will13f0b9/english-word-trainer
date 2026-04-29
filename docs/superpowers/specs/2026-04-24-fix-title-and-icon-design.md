# Fix Page Title and App Icon — Design Spec

**Date:** 2026-04-24  
**Status:** Approved

## Problem

The app still uses all Create React App defaults:
- Browser tab title shows `React App`
- `manifest.json` names are `React App` / `Create React App Sample`
- `favicon.ico`, `logo192.png`, and `logo512.png` are the default React spinning logo

## Goal

Replace all default CRA branding with meaningful, app-specific title and icon.

## Changes

### 1. Page Title (`public/index.html`)
- Change `<title>React App</title>` → `<title>Word Trainer</title>`
- Update the `description` meta tag from the generic CRA text to something descriptive: `"Vocabulary learning app — memorize English words with flashcards and quizzes"`

### 2. Web App Manifest (`public/manifest.json`)
- `short_name`: `"React App"` → `"Word Trainer"`
- `name`: `"Create React App Sample"` → `"Word Trainer"`
- `background_color`: `"#ffffff"` → `"#111827"` (matches the app's dark theme)
- `theme_color`: `"#000000"` → `"#111827"`

### 3. App Icon
- Source a free, open-license book or open-book SVG icon from SVG Repo (svgrepo.com) or similar
- The icon should clearly represent vocabulary/learning (open book preferred)
- Generate three assets from the icon:
  - `public/favicon.ico` — 16x16 and 32x32 embedded ICO
  - `public/logo192.png` — 192x192 PNG
  - `public/logo512.png` — 512x512 PNG
- Replace the existing files in `public/`

## Out of Scope
- Changing the app logo shown inside the UI (Header component uses no image logo)
- Any color customization of the icon beyond what the source provides

## Success Criteria
- Browser tab shows "Word Trainer" as the title
- The favicon in the browser tab is an icon that represents a vocabulary/learning app (not the React logo)
- PWA manifest reflects the correct app name
- No regressions in the existing UI
