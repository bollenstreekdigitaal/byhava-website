import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

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

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (e) {
    console.error(`  Failed to download ${url}: ${e}`);
    return false;
  }
}

async function scrapeGallery(page: any, gallery: typeof GALLERIES[0]): Promise<string[]> {
  const uuids = new Set<string>();
  const url = `https://hava.picflow.com/${gallery.slug}`;

  console.log(`\n=== Scraping ${gallery.name} (${url}) ===`);

  // Navigate to gallery
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Collect UUIDs from current DOM
  const collectFromDOM = async () => {
    const imgs = await page.$$eval('img[src*="cdn.picflow.com"]', (imgs: any[]) =>
      imgs.map(i => i.src)
    );
    for (const src of imgs) {
      const match = src.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
      if (match) uuids.add(match[1]);
    }
  };

  await collectFromDOM();
  console.log(`  Initial DOM scan: ${uuids.size} images`);

  // Try to click the first thumbnail to open lightbox
  try {
    const thumbContainer = await page.$('.gallery-assets-container');
    if (thumbContainer) {
      const thumbImgs = await thumbContainer.$$('img');
      if (thumbImgs.length > 0) {
        await thumbImgs[0].click();
        await page.waitForTimeout(1500);
        await collectFromDOM();

        // Navigate through slideshow with arrow clicks
        let noNewCount = 0;
        let prevCount = uuids.size;

        for (let i = 0; i < 100; i++) {
          // Click the right arrow button
          const rightArrow = await page.$('[class*="arrow-right"], [class*="next"], button[aria-label*="next"], .nav-next, .right-arrow');
          if (rightArrow) {
            await rightArrow.click();
          } else {
            // Try keyboard
            await page.keyboard.press('ArrowRight');
          }
          await page.waitForTimeout(400);
          await collectFromDOM();

          if (uuids.size === prevCount) {
            noNewCount++;
            if (noNewCount > 5) break; // No new images for 5 attempts
          } else {
            noNewCount = 0;
            prevCount = uuids.size;
          }
        }

        // Close lightbox
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  } catch (e) {
    console.error(`  Lightbox navigation error: ${e}`);
  }

  // Also try scrolling thumbnail strip
  try {
    const container = await page.$('.gallery-assets-container');
    if (container) {
      for (let pos = 0; pos < 20000; pos += 300) {
        await container.evaluate((el: any, p: number) => { el.scrollLeft = p; }, pos);
        await page.waitForTimeout(200);
        await collectFromDOM();
      }
    }
  } catch (e) {}

  console.log(`  Total unique images found: ${uuids.size}`);
  return [...uuids];
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  // Intercept responses to capture asset data
  const allUUIDs: Record<string, string[]> = {};

  const page = await context.newPage();

  // Monitor all responses for image UUIDs
  page.on('response', async (response: any) => {
    const url = response.url();
    if (url.includes('cdn.picflow.com/assets/images')) {
      const match = url.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
      if (match) {
        // Add to current gallery if we're tracking one
        if (currentGallery) {
          if (!allUUIDs[currentGallery]) allUUIDs[currentGallery] = [];
          if (!allUUIDs[currentGallery].includes(match[1])) {
            allUUIDs[currentGallery].push(match[1]);
          }
        }
      }
    }
  });

  let currentGallery = '';

  for (const gallery of GALLERIES) {
    currentGallery = gallery.name;
    allUUIDs[gallery.name] = [];

    const uuids = await scrapeGallery(page, gallery);

    // Merge DOM-found UUIDs with response-intercepted ones
    for (const uuid of uuids) {
      if (!allUUIDs[gallery.name].includes(uuid)) {
        allUUIDs[gallery.name].push(uuid);
      }
    }

    const dir = path.join(BASE_DIR, gallery.name);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`  Downloading ${allUUIDs[gallery.name].length} images...`);

    let downloaded = 0;
    for (const uuid of allUUIDs[gallery.name]) {
      // Use l1280 for good quality without being massive
      const imageUrl = `https://cdn.picflow.com/assets/images/${uuid}/base/${uuid}.jpg`;
      const filepath = path.join(dir, `${uuid}.jpg`);

      if (fs.existsSync(filepath)) {
        downloaded++;
        continue;
      }

      const ok = await downloadImage(imageUrl, filepath);
      if (ok) {
        downloaded++;
        process.stdout.write(`\r  Downloaded ${downloaded}/${allUUIDs[gallery.name].length}`);
      } else {
        // Try resized version
        const resizedUrl = `https://cdn.picflow.com/assets/images/resized/l1280/${uuid}.jpg`;
        const ok2 = await downloadImage(resizedUrl, filepath);
        if (ok2) downloaded++;
      }
    }
    console.log(`\n  Done: ${downloaded}/${allUUIDs[gallery.name].length} downloaded`);
  }

  await browser.close();

  // Summary
  console.log('\n=== SUMMARY ===');
  for (const [name, uuids] of Object.entries(allUUIDs)) {
    const dir = path.join(BASE_DIR, name);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.jpg')) : [];
    console.log(`  ${name}: ${files.length} images`);
  }
}

main().catch(console.error);
