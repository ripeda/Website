# OG Image Generator

Generates 1200×630 Open Graph (social preview) images for spoke articles in
`_insights/`. Each image renders the article title, dek, primary vertical
label, RIPEDA logo, and `ripeda.com` footer onto a branded card.

## Rendering approach

The generator launches **headless Chrome via Puppeteer**, loads `template.html`
with the article's content interpolated, and takes a 1200×630 screenshot. This
is the same rendering path your browser uses to display HTML, so the output
looks identical to what you see when you open `template.html` directly in
Safari or Chrome.

This requires Puppeteer's bundled Chromium, which downloads on first install.
Run this on a Mac (or any machine with network access for the Chromium
download). Once installed, the generator runs entirely locally.

## Install

```bash
cd scripts/og-image-generator
npm install
```

The `npm install` step downloads Chromium (~150MB). One-time cost.

## Use

```bash
# Generate any missing OG images (skips ones already on disk)
node build.js

# Regenerate all OG images (overwrites)
node build.js --all

# Generate just one article's OG image (used by the ripeda-insight-article skill
# when a new article is published)
node build.js <slug>
```

## How it works

1. Reads each article's frontmatter from `_insights/[slug].md` for the title and dek.
2. Looks up the article's `vertical` from `_data/insights.yml` (source of truth for
   category assignment; the vertical is **not** stored in the article frontmatter).
3. Loads `template.html` and replaces `{{VERTICAL}}`, `{{TITLE}}`, `{{DEK}}`,
   and `{{LOGO_SRC}}` with the article's data.
4. Sets the page in headless Chrome at 1200×630 with `deviceScaleFactor: 2` so
   text renders at high-DPI for crisp edges.
5. Screenshots the page and writes the PNG to `images/insights/[slug]-og.png`.
6. Updates the article frontmatter to add `image: /images/insights/[slug]-og.png`
   so the existing layout's OG meta tags pick it up automatically.

## Iterating on the template

Open `template.html` directly in any browser. The `{{...}}` placeholders render
as visible text in standalone preview, which is fine for design iteration. Tweak
the CSS, save, reload the browser. When the visual is right, the next generator
run will produce PNGs matching the design.

## Files

- `build.js` — the generator script
- `template.html` — the OG card HTML/CSS template (rendered through headless Chrome)
- `package.json` — Node.js dependencies (`puppeteer`, `gray-matter`)
- `README.md` — this file
