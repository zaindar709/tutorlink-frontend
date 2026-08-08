/**
 * Renders each HTML screen to a high-resolution PNG via Playwright.
 * Output: 1440×3120 (430×932 @ deviceScaleFactor 3.35 ≈ 1440×3122)
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlDir = path.join(__dirname, 'html');
const outDir = path.join(__dirname, 'screenshots');

const SCREENS = [
  '01_Login',
  '02_Register',
  '03_OTP_Verification',
  '04_Student_Dashboard',
  '05_Tutor_Dashboard',
  '06_Parent_Dashboard',
  '07_Admin_Dashboard',
  '08_Search_Tutors',
  '09_Tutor_Profile',
  '10_Booking',
  '11_Payment',
  '12_Chat',
  '13_Live_Video_Session',
  '14_AI_Summary',
  '15_Notifications',
  '16_Rating_Review',
  '17_Settings',
];

const WIDTH = 430;
const HEIGHT = 932;
const SCALE = 3.35; // ≈ 1440 × 3122

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-font-subpixel-positioning', '--force-device-scale-factor=1'],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Wait for Material Symbols font
  await page.addStyleTag({
    content: `@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0&display=block');`,
  });

  for (const name of SCREENS) {
    const htmlPath = path.join(htmlDir, `${name}.html`);
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    console.log(`Rendering ${name}...`);

    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 60000 });
    // Allow fonts to settle
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const outPath = path.join(outDir, `${name}.png`);
    await page.screenshot({
      path: outPath,
      type: 'png',
      omitBackground: false,
      animations: 'disabled',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    const stat = fs.statSync(outPath);
    console.log(`  → ${outPath} (${Math.round(stat.size / 1024)} KB)`);
  }

  await browser.close();
  console.log(`\nDone. ${SCREENS.length} screenshots saved to screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
