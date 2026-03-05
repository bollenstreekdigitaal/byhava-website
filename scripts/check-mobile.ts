import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await context.newPage();
  
  await page.goto('file:///home/wijnandb/sites/klanten/byhava-website/index0.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check which elements overflow
  const overflowingElements = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const results: any[] = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 || rect.left < -1) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().substring(0, 60) || '';
        const id = el.id || '';
        results.push({
          tag, cls, id,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflow: Math.round(rect.right - docWidth)
        });
      }
    });
    return { docWidth, overflowing: results.filter(r => r.overflow > 0).slice(0, 20) };
  });

  console.log('Document width:', overflowingElements.docWidth);
  console.log('Overflowing elements:');
  for (const el of overflowingElements.overflowing) {
    console.log(`  ${el.tag}.${el.cls} — right: ${el.right}, overflow: +${el.overflow}px`);
  }

  await page.screenshot({ path: '/tmp/mobile-check.png', fullPage: false });
  console.log('\nScreenshot: /tmp/mobile-check.png');

  // Also scroll down and check each section
  const sections = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const secs = document.querySelectorAll('.hero, .portfolio, .services, .clients, .about, .contact, .footer');
    return Array.from(secs).map(s => {
      const rect = s.getBoundingClientRect();
      const scrollWidth = (s as HTMLElement).scrollWidth;
      return {
        cls: s.className.substring(0, 40),
        clientWidth: (s as HTMLElement).clientWidth,
        scrollWidth,
        overflows: scrollWidth > (s as HTMLElement).clientWidth
      };
    });
  });

  console.log('\nSection overflow check:');
  for (const s of sections) {
    const flag = s.overflows ? '⚠️ OVERFLOW' : '✅ OK';
    console.log(`  ${flag} ${s.cls} — clientW: ${s.clientWidth}, scrollW: ${s.scrollWidth}`);
  }

  await browser.close();
}

main().catch(console.error);
