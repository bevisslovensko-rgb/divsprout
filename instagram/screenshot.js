const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const files = [
  // --- pridaj sem nový súbor keď chceš vygenerovať PNG ---
  'c6-qqq-vs-schd.html',
  'p3-snowball.html',
  'p4-while-you-sleep.html',
  'p5-plant-today.html',
  'p6-freedom-number.html',
  'p7-first-dollar.html',
];

async function run() {
  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  console.log('Spustam Chrome...\n');
  const browser = await puppeteer.launch({ headless: 'new' });

  for (const file of files) {
    const baseName = file.replace('.html', '');
    const absPath = path.join(__dirname, file);
    const fileUrl = 'file:///' + absPath.replace(/\\/g, '/');

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 4000, deviceScaleFactor: 2 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 600));

    const slides = await page.$$('.slide');
    console.log(file + ' -- ' + slides.length + ' slide(s)');

    for (let i = 0; i < slides.length; i++) {
      const num = String(i + 1).padStart(2, '0');
      const outPath = path.join(outDir, baseName + '-' + num + '.png');
      await slides[i].screenshot({ path: outPath });
      console.log('  OK ' + baseName + '-' + num + '.png');
    }

    await page.close();
  }

  await browser.close();

  const count = fs.readdirSync(outDir).filter(f => f.endsWith('.png')).length;
  console.log('\nHotovo! ' + count + ' PNG suborov v priecinku screenshots/');
}

run().catch(err => {
  console.error('Chyba:', err.message);
  process.exit(1);
});
