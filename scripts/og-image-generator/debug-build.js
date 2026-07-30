// Re-export composeSvg by re-reading and eval-ing the relevant function from build.js
const fs = require('fs');
const matter = require('gray-matter');
const path = require('path');

// Load build.js source and extract the composeSvg + loadVerticalLabels code by running it
// We just patch the script to expose composeSvg
const src = fs.readFileSync('build.js', 'utf-8');
// Remove the main() call at the end and the auto-execute
const patched = src.replace(/main\(\)\.catch[\s\S]*$/, 'module.exports = { composeSvg, loadVerticalLabels, renderArticle };');
fs.writeFileSync('build-as-module.js', patched);

const mod = require('./build-as-module.js');
const labels = mod.loadVerticalLabels();
console.log('Loaded labels:', Object.keys(labels).length, 'entries');

// Generate SVG for the clinical-fleets article
const verticalSlug = 'dental-medical';
const verticalLabel = labels[verticalSlug];
console.log('vertical slug:', verticalSlug, '-> label:', verticalLabel);

const svg = mod.composeSvg({
  vertical: verticalLabel,
  title: 'Apple Business Manager for clinical fleets',
  dek: "A dental or medical practice's iPads and Macs cross more access points than most owners realise.",
});

fs.writeFileSync('debug-built.svg', svg);
console.log('SVG written to debug-built.svg');
console.log('--- First 1500 chars of SVG ---');
console.log(svg.slice(0, 1500));
