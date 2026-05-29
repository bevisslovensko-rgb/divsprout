const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const file = 'c6-qqq-vs-schd.html';
  const absPath = path.join(__dirname, file);
  const fileUrl = 'file:///' + absPath.replace(/\\/g, '/');

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 4000, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1200));

  const slides = await page.$$('.slide');
  console.log('Slides found: ' + slides.length);

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const outPath = path.join(outDir, 'c6-qqq-vs-schd-' + num + '.png');
    await slides[i].screenshot({ path: outPath });
    console.log('OK: c6-qqq-vs-schd-' + num + '.png');
  }

  await browser.close();
  console.log('Hotovo!');
}
run().catch(e => { console.error(e.message); process.exit(1); });
