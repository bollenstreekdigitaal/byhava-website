import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const GALLERIES = [
  { slug: 'HtXsDIQ4OsiA4dFc', name: 'studio' },
  { slug: 'dCYrZCXEkjimSI0N', name: 'outdoor' },
];

const BASE_DIR = '/home/wijnandb/sites/klanten/byhava-website/images/portfolio';
const DOWNLOAD_DIR = '/tmp/hava-downloads';

async function main() {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true,
  });

  const page = await context.newPage();

  for (const gallery of GALLERIES) {
    const url = `https://hava.picflow.com/${gallery.slug}`;
    const destDir = path.join(BASE_DIR, gallery.name);
    fs.mkdirSync(destDir, { recursive: true });

    console.log(`\n=== ${gallery.name.toUpperCase()} ===`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    try {
      // Click download button
      await page.click('.download-button');
      await page.waitForTimeout(1500);

      // Take screenshot to debug
      await page.screenshot({ path: `/tmp/dl-${gallery.name}.png` });

      // These galleries only have "Original Files" - use force click to bypass overlay
      const downloadPromise = page.waitForEvent('download', { timeout: 120000 });

      // Try clicking "Original Files" with force
      const origBtn = await page.locator('button:has-text("Original")').first();
      await origBtn.click({ force: true });

      console.log(`  Waiting for download...`);
      const download = await downloadPromise;
      const downloadPath = path.join(DOWNLOAD_DIR, `${gallery.name}.zip`);
      await download.saveAs(downloadPath);

      const fileSize = fs.statSync(downloadPath).size;
      console.log(`  Downloaded: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

      execSync(`unzip -o -j "${downloadPath}" -d "${destDir}" 2>/dev/null`);
      const files = fs.readdirSync(destDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      console.log(`  Extracted ${files.length} images`);
    } catch (e: any) {
      console.error(`  Error: ${e.message?.substring(0, 200)}`);
    }

    await page.waitForTimeout(1000);
  }

  await browser.close();

  console.log('\n=== FINAL SUMMARY ===');
  const allDirs = ['21-dinners', 'studio', 'behind-the-scenes', 'artist', 'club', 'food', 'festival', 'outdoor'];
  let total = 0;
  for (const name of allDirs) {
    const dir = path.join(BASE_DIR, name);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)) : [];
    console.log(`  ${name}: ${files.length} images`);
    total += files.length;
  }
  console.log(`  TOTAL: ${total} images`);
}

main().catch(console.error);
