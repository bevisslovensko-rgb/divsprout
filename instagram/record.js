const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');

const REELS = [
  { file: 'reels/reel-drip.html', name: 'reel-drip', duration: 36, fps: 30 },
];

// Use local ffmpeg.exe if available, otherwise try PATH
const LOCAL_FFMPEG = path.join(__dirname, 'ffmpeg.exe');
const FFMPEG = fs.existsSync(LOCAL_FFMPEG) ? `"${LOCAL_FFMPEG}"` : 'ffmpeg';

function checkFFmpeg() {
  const ffmpegBin = fs.existsSync(LOCAL_FFMPEG) ? LOCAL_FFMPEG : 'ffmpeg';
  const result = spawnSync(ffmpegBin, ['-version'], { stdio: 'pipe' });
  if (result.status !== 0 && result.error) {
    console.error('❌ FFmpeg nenájdený.');
    process.exit(1);
  }
  console.log('✅ FFmpeg OK\n');
}

async function recordReel({ file, name, duration, fps }) {
  const framesDir = path.join(__dirname, 'reels', 'frames', name);
  const outDir    = path.join(__dirname, 'reels');
  const outPath   = path.join(outDir, `${name}.mp4`);

  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
  if (!fs.existsSync(outDir))    fs.mkdirSync(outDir,    { recursive: true });

  const totalFrames = duration * fps;
  const fileUrl = 'file:///' + path.join(__dirname, file).replace(/\\/g, '/');

  console.log(`🎬 Nahrávam: ${name}`);
  console.log(`   Súbor: ${file}`);
  console.log(`   Dĺžka: ${duration}s · ${fps}fps · ${totalFrames} snímok\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // Extra wait for fonts + first render
  await new Promise(r => setTimeout(r, 800));

  const startTime = Date.now();

  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    await page.evaluate(t => { window.__seek(t); }, t);
    const framePath = path.join(framesDir, `frame${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, clip: { x: 0, y: 0, width: 540, height: 960 } });

    if (i % fps === 0 || i === totalFrames - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = Math.round((i / totalFrames) * 100);
      process.stdout.write(`\r   [${'█'.repeat(Math.floor(pct/5))}${'░'.repeat(20-Math.floor(pct/5))}] ${pct}% · ${i}/${totalFrames} snímok · ${elapsed}s`);
    }
  }

  await browser.close();
  console.log('\n\n✅ Snímky hotové, spájam video...\n');

  const framePattern = path.join(framesDir, 'frame%04d.png');
  const ffmpegCmd = `${FFMPEG} -y -r ${fps} -i "${framePattern}" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart "${outPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log(`\n🎥 Hotovo: reels/${name}.mp4`);

    // Cleanup frames
    fs.rmSync(framesDir, { recursive: true });
    console.log('🗑️  Dočasné snímky vymazané\n');
  } catch (err) {
    console.error('❌ FFmpeg chyba:', err.message);
    console.log('   Snímky sú stále v: ' + framesDir);
  }
}

async function main() {
  console.log('═══════════════════════════════════');
  console.log('  DivSprout Reel Recorder');
  console.log('═══════════════════════════════════\n');

  checkFFmpeg();

  for (const reel of REELS) {
    await recordReel(reel);
  }

  console.log('═══════════════════════════════════');
  console.log('  Všetky reely hotové!');
  console.log('  Priečinok: instagram/reels/');
  console.log('═══════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ Chyba:', err.message);
  process.exit(1);
});
