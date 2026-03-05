import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const GALLERIES = [
  { slug: 'cqcrnRNsGnGufrdg', name: '21-dinners' },
  { slug: 'HtXsDIQ4OsiA4dFc', name: 'studio' },
  { slug: 'V5VPP2RBL44oC7oi', name: 'behind-the-scenes' },
  { slug: 'AufjsTvNw9xrKDA3', name: 'artist' },
  { slug: 'CNRPjA3BNZFeu0Hi', name: 'club' },
  { slug: 'Cv9ofykd1Wpz91GA', name: 'food' },
  { slug: 'rrorLSRikLjChg0J', name: 'festival' },
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
    console.log(`  Navigating to ${url}...`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click the Download button
    try {
      const downloadBtn = await page.waitForSelector('.download-button', { timeout: 5000 });
      if (downloadBtn) {
        await downloadBtn.click();
        await page.waitForTimeout(1000);

        // Look for "Large" or "Original Files" option and click it
        // The dropdown shows: Small, Medium, Large, Original Files
        // Each is a clickable element in the dropdown
        const options = await page.$$('text=Large');
        if (options.length > 0) {
          // Set up download handler before clicking
          const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
          await options[0].click();
          console.log(`  Waiting for download...`);

          const download = await downloadPromise;
          const suggestedName = download.suggestedFilename();
          const downloadPath = path.join(DOWNLOAD_DIR, `${gallery.name}.zip`);
          await download.saveAs(downloadPath);
          console.log(`  Downloaded: ${suggestedName} -> ${downloadPath}`);

          // Unzip to destination
          const fileSize = fs.statSync(downloadPath).size;
          console.log(`  File size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

          try {
            execSync(`unzip -o -j "${downloadPath}" -d "${destDir}" 2>/dev/null`);
            const files = fs.readdirSync(destDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
            console.log(`  Extracted ${files.length} images to ${destDir}`);
          } catch (e) {
            console.error(`  Failed to unzip: ${e}`);
          }
        } else {
          // Try "Download All" text
          const allOptions = await page.$$eval('button, a, [role="menuitem"], [class*="download"]',
            (els: any[]) => els.map(e => ({ text: e.textContent?.trim(), tag: e.tagName, class: e.className }))
          );
          console.log(`  Available options:`, JSON.stringify(allOptions.filter(o => o.text?.includes('arge') || o.text?.includes('riginal') || o.text?.includes('ownload'))));

          // Try clicking any visible download option
          const downloadAll = await page.$('text=Download All');
          if (downloadAll) {
            const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
            await downloadAll.click();
            const download = await downloadPromise;
            const downloadPath = path.join(DOWNLOAD_DIR, `${gallery.name}.zip`);
            await download.saveAs(downloadPath);
            console.log(`  Downloaded to ${downloadPath}`);
            execSync(`unzip -o -j "${downloadPath}" -d "${destDir}" 2>/dev/null`);
          }
        }
      }
    } catch (e) {
      console.error(`  Error downloading ${gallery.name}: ${e}`);
    }

    // Small delay between galleries
    await page.waitForTimeout(1000);
  }

  await browser.close();

  // Summary
  console.log('\n=== SUMMARY ===');
  let totalImages = 0;
  for (const gallery of GALLERIES) {
    const dir = path.join(BASE_DIR, gallery.name);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)) : [];
    console.log(`  ${gallery.name}: ${files.length} images`);
    totalImages += files.length;
  }
  console.log(`  TOTAL: ${totalImages} images`);
}

main().catch(console.error);
