const sharp = require('sharp');
const fs = require('fs');

const NAVY = '#1B3C6E';
const DARK_GREY = '#3D3D3D';
const FONT = "'Arial', 'Liberation Sans', sans-serif";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect width="1200" height="12" fill="${NAVY}"/>
  <text x="80" y="96" font-family="${FONT}" font-size="22" font-weight="700" letter-spacing="3.5" fill="${NAVY}">DENTAL &amp; MEDICAL</text>
  <text x="80" y="192" font-family="${FONT}" font-size="60" font-weight="700" fill="${NAVY}">Apple Business Manager for</text>
  <text x="80" y="258" font-family="${FONT}" font-size="60" font-weight="700" fill="${NAVY}">clinical fleets</text>
  <text x="80" y="338" font-family="${FONT}" font-size="24" font-weight="400" fill="${DARK_GREY}">A dental or medical practice's iPads and Macs cross more access points than most</text>
  <text x="1120" y="576" font-family="${FONT}" font-size="24" font-weight="700" fill="${NAVY}" text-anchor="end">ripeda.com</text>
</svg>`;
fs.writeFileSync('debug-test.svg', svg);
sharp(Buffer.from(svg)).png().toBuffer().then(buf => {
  fs.writeFileSync('debug-test.png', buf);
  console.log('rendered ' + buf.length + ' bytes');
});
