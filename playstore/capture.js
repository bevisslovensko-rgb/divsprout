// Reuses the puppeteer already installed in instagram/node_modules — no npm install needed
const puppeteer = require('../instagram/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await puppeteer.launch({ headless: 'new' });

  // ── SCREENSHOTS: 1080×1920 (viewport 540×960 @2x) ──────────────────
  console.log('\n📱 Generating screenshots...\n');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const fileUrl = 'file:///' + path.join(__dirname, 'assets.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1200)); // font rendering buffer

  const slides = [
    { id: 's1', name: '01-calculator-result' },
    { id: 's2', name: '02-growth-chart' },
    { id: 's3', name: '03-fire-goal' },
    { id: 's4', name: '04-scenarios' },
    { id: 's5', name: '05-milestones' },
    { id: 's6', name: '06-share-card' },
  ];

  for (const { id, name } of slides) {
    const el = await page.$(`#${id}`);
    if (!el) { console.log(`  ⚠ #${id} not found`); continue; }
    const outPath = path.join(outDir, `screenshot-${name}.png`);
    await el.screenshot({ path: outPath });
    console.log(`  ✓ screenshot-${name}.png  (1080×1920)`);
  }

  // ── FEATURE GRAPHIC: 1024×500 ──────────────────────────────────────
  console.log('\n🖼  Generating feature graphic...\n');
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));

  const feat = await page.$('#feat');
  if (feat) {
    const featPath = path.join(outDir, 'feature-graphic.png');
    await feat.screenshot({ path: featPath });
    console.log(`  ✓ feature-graphic.png  (1024×500)`);
  }

  // ── HI-RES APP ICON: 512×512 ──────────────────────────────────────
  console.log('\n🎨 Generating hi-res icon...\n');
  const cairosvg = require('child_process');
  // Use Python cairosvg to produce a clean 512px icon
  const svgSrc = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="0" y="0" width="100" height="100" rx="22" ry="22" fill="#0a0b0d"/>
  <radialGradient id="g" cx="50%" cy="45%" r="44%">
    <stop offset="0%"  stop-color="#22d47a" stop-opacity="0.22"/>
    <stop offset="100%" stop-color="#22d47a" stop-opacity="0"/>
  </radialGradient>
  <circle cx="50" cy="45" r="44" fill="url(#g)"/>
  <path d="M50 88 C50,88 18,62 18,37.5 C18,23.4 32.8,14 50,14 C67.2,14 82,23.4 82,37.5 C82,62 50,88 50,88 Z"
        fill="none" stroke="#22d47a" stroke-width="5" stroke-linejoin="round"/>
  <line x1="50" y1="88" x2="50" y2="48" stroke="#22d47a" stroke-width="5" stroke-linecap="round"/>
  <line x1="50" y1="60" x2="37" y2="72" stroke="#22d47a" stroke-width="5" stroke-linecap="round"/>
  <line x1="50" y1="60" x2="63" y2="72" stroke="#22d47a" stroke-width="5" stroke-linecap="round"/>
</svg>`;

  const svgPath = path.join(outDir, '_icon.svg');
  fs.writeFileSync(svgPath, svgSrc);

  const { execSync } = require('child_process');
  try {
    execSync(`python3 -c "import cairosvg; cairosvg.svg2png(url='${svgPath}', write_to='${path.join(outDir, 'icon-512.png')}', output_width=512, output_height=512)"`, { stdio: 'inherit' });
    console.log(`  ✓ icon-512.png  (512×512) — for Play Console`);
    fs.unlinkSync(svgPath);
  } catch(e) {
    console.log('  ⚠ cairosvg not available — icon-512 skipped');
  }

  await browser.close();

  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.png'));
  console.log(`\n✅ Done! ${files.length} files in playstore/output/`);
  files.forEach(f => console.log(`   • ${f}`));
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
