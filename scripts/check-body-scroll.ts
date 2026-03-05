import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();
  
  await page.goto('file:///home/wijnandb/sites/klanten/byhava-website/index0.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      htmlClientWidth: html.clientWidth,
      htmlScrollWidth: html.scrollWidth,
      bodyClientWidth: body.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      htmlOverflows: html.scrollWidth > html.clientWidth,
      bodyOverflows: body.scrollWidth > body.clientWidth,
      // Check which direct children of body cause overflow
      bodyChildren: Array.from(body.children).map(c => ({
        tag: c.tagName,
        cls: c.className?.toString().substring(0, 40),
        scrollW: (c as HTMLElement).scrollWidth,
        clientW: (c as HTMLElement).clientWidth,
        offsetW: (c as HTMLElement).offsetWidth,
        overflows: (c as HTMLElement).scrollWidth > (c as HTMLElement).clientWidth
      }))
    };
  });

  console.log('html:', result.htmlClientWidth, 'scroll:', result.htmlScrollWidth, result.htmlOverflows ? '⚠️ OVERFLOWS' : '✅ OK');
  console.log('body:', result.bodyClientWidth, 'scroll:', result.bodyScrollWidth, result.bodyOverflows ? '⚠️ OVERFLOWS' : '✅ OK');
  console.log('\nBody children:');
  for (const c of result.bodyChildren) {
    const flag = c.overflows ? '⚠️' : '✅';
    console.log(`  ${flag} ${c.tag}.${c.cls} — clientW: ${c.clientW}, scrollW: ${c.scrollW}, offsetW: ${c.offsetW}`);
  }

  await browser.close();
}
main().catch(console.error);
