#!/usr/bin/env node
/**
 * RIPEDA OG Image Generator (Puppeteer / headless Chrome)
 *
 * Builds 1200x630 Open Graph preview images for spoke articles in _insights/.
 * Renders the article title, dek, primary vertical, RIPEDA logo, and ripeda.com
 * footer onto a branded card. Output is committed PNG files in
 * images/insights/[slug]-og.png. Each article's frontmatter gets an `image:`
 * field added that points at its generated card.
 *
 * Rendering pipeline: Puppeteer launches headless Chrome, loads template.html
 * with each article's content interpolated, takes a 1200x630 screenshot. This
 * is the same rendering path your browser uses for the mockup HTML, so the
 * output looks identical to what you see when you open template.html directly.
 *
 * IMPORTANT: This script must be run on a Mac (or any machine where Puppeteer
 * can download Chromium). On first `npm install` Puppeteer pulls down a
 * compatible Chromium build (~150MB). After that, the generator runs entirely
 * locally and does not need network access.
 *
 * Usage:
 *   node build.js                         # generate any missing OG images
 *   node build.js --all                   # regenerate all OG images
 *   node build.js <slug>                  # generate a single article's OG image
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');

// ─── Paths ──────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const INSIGHTS_DIR = path.join(REPO_ROOT, '_insights');
const OUTPUT_DIR = path.join(REPO_ROOT, 'images', 'insights');
const LOGO_PATH = path.join(REPO_ROOT, 'images', 'logo', 'logo.png');
const DATA_FILE = path.join(REPO_ROOT, '_data', 'insights.yml');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');

const CANVAS_W = 1200;
const CANVAS_H = 630;

// ─── Verticals lookup ───────────────────────────────────────────────────────

function loadVerticalLabels() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const labels = {};
  const lines = raw.split('\n');
  let inVerticals = false;
  let currentId = null;
  for (const line of lines) {
    if (line.startsWith('verticals:')) { inVerticals = true; continue; }
    if (inVerticals && /^[a-z]/.test(line)) break;
    if (!inVerticals) continue;
    const idMatch = line.match(/^\s*-\s*id:\s*(\S+)/);
    if (idMatch) { currentId = idMatch[1]; continue; }
    const labelMatch = line.match(/^\s*label:\s*"([^"]+)"/);
    if (labelMatch && currentId) { labels[currentId] = labelMatch[1]; currentId = null; }
  }
  return labels;
}

function loadArticleVerticals() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const map = {};
  const lines = raw.split('\n');
  let inArticles = false;
  let currentSlug = null;
  let currentVertical = null;
  let currentVerticalsArray = null;
  const flush = () => {
    if (currentSlug) {
      map[currentSlug] = currentVertical
        || (currentVerticalsArray && currentVerticalsArray[0])
        || null;
    }
    currentSlug = null;
    currentVertical = null;
    currentVerticalsArray = null;
  };
  for (const line of lines) {
    if (line.startsWith('articles:')) { inArticles = true; continue; }
    if (!inArticles) continue;
    if (/^\s*-\s+title:/.test(line)) { flush(); continue; }
    const verticalMatch = line.match(/^\s+vertical:\s*(\S+)/);
    if (verticalMatch) { currentVertical = verticalMatch[1].replace(/['"]/g, '').replace(/#.*$/, '').trim(); continue; }
    const verticalsMatch = line.match(/^\s+verticals:\s*\[([^\]]+)\]/);
    if (verticalsMatch) {
      currentVerticalsArray = verticalsMatch[1].split(',').map(s => s.trim());
      continue;
    }
    const slugMatch = line.match(/^\s+slug:\s*(\S+)/);
    if (slugMatch) { currentSlug = slugMatch[1]; continue; }
  }
  flush();
  return map;
}

// ─── HTML escaping for template interpolation ───────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Render ─────────────────────────────────────────────────────────────────

// Read the logo once and cache as a base64 data URI. We embed the logo directly
// in the rendered HTML rather than referencing it via file:// path because the
// workspace contains spaces (e.g. "Ripeda Tickle Trunk") and browsers do not
// reliably load file:// URLs with unencoded spaces. Embedding as a data URI
// makes this work regardless of where the repo lives on disk.
let LOGO_DATA_URI = null;
function getLogoDataUri() {
  if (LOGO_DATA_URI === null) {
    const buf = fs.readFileSync(LOGO_PATH);
    LOGO_DATA_URI = 'data:image/png;base64,' + buf.toString('base64');
  }
  return LOGO_DATA_URI;
}

async function renderArticle(page, article, verticalLabels) {
  const verticalLabel = verticalLabels[article.vertical] || article.vertical || '';
  const verticalUpper = verticalLabel.toUpperCase();

  const templateRaw = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const html = templateRaw
    .replace(/\{\{VERTICAL\}\}/g, escapeHtml(verticalUpper))
    .replace(/\{\{TITLE\}\}/g, escapeHtml(article.title))
    .replace(/\{\{DEK\}\}/g, escapeHtml(article.dek))
    .replace(/\{\{LOGO_SRC\}\}/g, getLogoDataUri());

  await page.setContent(html, { waitUntil: 'networkidle0' });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${article.slug}-og.png`);
  await page.screenshot({
    path: outPath,
    type: 'png',
    clip: { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H },
    omitBackground: false,
  });
  return outPath;
}

// ─── Article reading and frontmatter update ─────────────────────────────────

function readArticles() {
  const slugToVertical = loadArticleVerticals();
  const files = fs.readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => {
    const slug = f.replace(/\.md$/, '');
    const fullPath = path.join(INSIGHTS_DIR, f);
    const parsed = matter(fs.readFileSync(fullPath, 'utf-8'));
    const fm = parsed.data;
    const vertical = slugToVertical[slug] || fm.vertical
      || (Array.isArray(fm.verticals) ? fm.verticals[0] : null);
    return {
      slug,
      fullPath,
      raw: fs.readFileSync(fullPath, 'utf-8'),
      parsed,
      title: fm.title || '',
      dek: fm.dek || '',
      vertical,
      hasImageField: 'image' in fm,
    };
  });
}

function ensureImageField(article, imagePath) {
  let { raw } = article;
  if (article.hasImageField) {
    raw = raw.replace(/^image:\s*.*$/m, `image: ${imagePath}`);
  } else {
    const anchor = /^description:\s*.*$/m.test(raw) ? /^description:\s*.*$/m : /^title:\s*.*$/m;
    raw = raw.replace(anchor, m => `${m}\nimage: ${imagePath}`);
  }
  fs.writeFileSync(article.fullPath, raw);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const targetSlug = args.find(a => !a.startsWith('--'));

  const articles = readArticles();
  let toProcess;
  if (targetSlug) {
    toProcess = articles.filter(a => a.slug === targetSlug);
    if (!toProcess.length) {
      console.error(`No article found with slug: ${targetSlug}`);
      process.exit(1);
    }
  } else if (all) {
    toProcess = articles;
  } else {
    toProcess = articles.filter(a => {
      const out = path.join(OUTPUT_DIR, `${a.slug}-og.png`);
      return !fs.existsSync(out);
    });
  }

  if (!toProcess.length) {
    console.log('No articles need OG image generation.');
    return;
  }

  const verticalLabels = loadVerticalLabels();

  console.log(`Launching headless Chrome...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: CANVAS_W,
    height: CANVAS_H,
    deviceScaleFactor: 2, // 2x rendering for crisp text on high-DPI displays
  });

  console.log(`Generating ${toProcess.length} OG image(s)...`);
  for (const article of toProcess) {
    try {
      const outPath = await renderArticle(page, article, verticalLabels);
      const relPath = '/images/insights/' + path.basename(outPath);
      ensureImageField(article, relPath);
      console.log(`  ✓ ${article.slug} -> ${relPath}`);
    } catch (e) {
      console.error(`  ✗ ${article.slug}:`, e.message);
    }
  }

  await browser.close();
  console.log('Done.');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
