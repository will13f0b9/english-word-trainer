# Fix Page Title and App Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Create React App default branding (title, favicon, manifest names) with "Word Trainer" branding and a book icon sourced from the internet.

**Architecture:** Static file replacements only — no component code changes. Update `public/index.html` and `public/manifest.json` for text, then replace the three icon files (`favicon.ico`, `logo192.png`, `logo512.png`) with resized versions of a downloaded book icon. Use macOS `sips` for PNG resizing and a Node.js script for ICO generation.

**Tech Stack:** Shell (`curl`, `sips`), Node.js (built-in), React CRA project structure.

---

### Task 1: Download the source icon

**Files:**
- Create: `public/icon-source.png` (temporary, deleted after Task 2)

> Note: No unit tests apply here — these are static asset changes. Verification is visual (browser tab).

- [ ] **Step 1: Download a free open-book icon as PNG**

Run:
```bash
curl -L "https://www.svgrepo.com/show/532525/book-open.svg" -o /tmp/word-trainer-icon.svg
```

Expected: file `/tmp/word-trainer-icon.svg` created (SVG content, ~2–5 KB).

If the URL is unreachable, use this alternative:
```bash
curl -L "https://www.svgrepo.com/show/491978/book-open.svg" -o /tmp/word-trainer-icon.svg
```

- [ ] **Step 2: Convert SVG to a 512x512 PNG using sips**

```bash
# sips can't read SVG directly; use qlmanage to rasterize on macOS
qlmanage -t -s 512 -o /tmp/ /tmp/word-trainer-icon.svg
# The output will be /tmp/word-trainer-icon.svg.png
mv /tmp/word-trainer-icon.svg.png /tmp/word-trainer-icon.png
```

If `qlmanage` fails, use an online converter or the fallback below.

**Fallback (if qlmanage fails):** Download a pre-rasterized PNG directly:
```bash
curl -L "https://img.icons8.com/ios/512/book.png" -o /tmp/word-trainer-icon.png
```

Expected: `/tmp/word-trainer-icon.png` exists and is a valid PNG (check with `file /tmp/word-trainer-icon.png`).

- [ ] **Step 3: Verify the downloaded image**

```bash
file /tmp/word-trainer-icon.png
sips -g pixelWidth -g pixelHeight /tmp/word-trainer-icon.png
```

Expected output includes `PNG` and dimensions (ideally 512x512 or larger).

---

### Task 2: Generate icon assets

**Files:**
- Modify: `public/favicon.ico` (replace)
- Modify: `public/logo192.png` (replace)
- Modify: `public/logo512.png` (replace)

- [ ] **Step 1: Create logo512.png (512x512)**

```bash
sips -z 512 512 /tmp/word-trainer-icon.png --out /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/logo512.png
```

Expected: `public/logo512.png` replaced, 512x512 pixels.

- [ ] **Step 2: Create logo192.png (192x192)**

```bash
sips -z 192 192 /tmp/word-trainer-icon.png --out /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/logo192.png
```

Expected: `public/logo192.png` replaced, 192x192 pixels.

- [ ] **Step 3: Create favicon.ico using a Node.js script**

Create a 32x32 PNG first, then wrap it in ICO format:
```bash
sips -z 32 32 /tmp/word-trainer-icon.png --out /tmp/favicon-32.png
sips -z 16 16 /tmp/word-trainer-icon.png --out /tmp/favicon-16.png
```

Then generate the ICO file with Node.js:
```bash
node -e "
const fs = require('fs');

function pngToIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize * numImages;

  // ICONDIR header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);        // reserved
  header.writeUInt16LE(1, 2);        // type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // count

  const dirEntries = [];
  let currentOffset = dataOffset;

  for (const png of pngBuffers) {
    // Read width/height from PNG IHDR chunk (bytes 16-23)
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(w >= 256 ? 0 : w, 0);   // width (0 = 256)
    entry.writeUInt8(h >= 256 ? 0 : h, 1);   // height
    entry.writeUInt8(0, 2);                    // color count
    entry.writeUInt8(0, 3);                    // reserved
    entry.writeUInt16LE(1, 4);                 // color planes
    entry.writeUInt16LE(32, 6);                // bits per pixel
    entry.writeUInt32LE(png.length, 8);        // size of image data
    entry.writeUInt32LE(currentOffset, 12);    // offset of image data
    dirEntries.push(entry);
    currentOffset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

const png32 = fs.readFileSync('/tmp/favicon-32.png');
const png16 = fs.readFileSync('/tmp/favicon-16.png');
const ico = pngToIco([png32, png16]);
fs.writeFileSync('/Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/favicon.ico', ico);
console.log('favicon.ico written, size:', ico.length, 'bytes');
"
```

Expected: `public/favicon.ico` replaced, output shows size in bytes (typically 2–5 KB).

- [ ] **Step 4: Verify assets**

```bash
sips -g pixelWidth -g pixelHeight /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/logo512.png
sips -g pixelWidth -g pixelHeight /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/logo192.png
file /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/favicon.ico
```

Expected:
- `logo512.png`: `pixelWidth: 512`, `pixelHeight: 512`
- `logo192.png`: `pixelWidth: 192`, `pixelHeight: 192`
- `favicon.ico`: reported as `MS Windows icon resource`

- [ ] **Step 5: Commit**

```bash
cd /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer
git add public/favicon.ico public/logo192.png public/logo512.png
git commit -m "feat: replace default React icons with book icon"
```

---

### Task 3: Update index.html title and meta description

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Update the `<title>` tag**

In `public/index.html`, change line 27:
```html
<title>React App</title>
```
to:
```html
<title>Word Trainer</title>
```

- [ ] **Step 2: Update the meta description**

Change:
```html
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
```
to:
```html
    <meta
      name="description"
      content="Vocabulary learning app — memorize English words with flashcards and quizzes"
    />
```

- [ ] **Step 3: Verify**

```bash
grep -n "title\|description" /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/index.html
```

Expected output includes:
```
<title>Word Trainer</title>
content="Vocabulary learning app — memorize English words with flashcards and quizzes"
```

- [ ] **Step 4: Commit**

```bash
cd /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer
git add public/index.html
git commit -m "feat: update page title to Word Trainer"
```

---

### Task 4: Update manifest.json

**Files:**
- Modify: `public/manifest.json`

- [ ] **Step 1: Replace manifest content**

Replace the full contents of `public/manifest.json` with:
```json
{
  "short_name": "Word Trainer",
  "name": "Word Trainer",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#111827",
  "background_color": "#111827"
}
```

- [ ] **Step 2: Verify**

```bash
cat /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer/public/manifest.json
```

Expected: JSON shows `"short_name": "Word Trainer"` and `"theme_color": "#111827"`.

- [ ] **Step 3: Commit**

```bash
cd /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer
git add public/manifest.json
git commit -m "feat: update manifest with Word Trainer name and dark theme colors"
```

---

### Task 5: Mark backlog item complete

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Mark item 10 as done in README.md**

Change:
```
10 - Fix the title name page and also the icon page
```
to:
```
10 - ~~Fix the title name page and also the icon page~~ ✅
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wrrocha/Documents/programs/python/english_word_trainner/english-word-trainer
git add README.md
git commit -m "docs: mark backlog item 10 as complete"
```
