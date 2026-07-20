import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

async function dismissModalIfAny() {
  const count = await page.locator('.modal-backdrop').count();
  if (count > 0) {
    const btn = page.locator('.event-choices button, .modal-actions button').first();
    if (await btn.count()) await btn.click();
    await page.waitForTimeout(150);
  }
}

await page.goto('http://localhost:5200', { waitUntil: 'networkidle' });

// grind gold via "Faire la manche" to afford research too via "Faire des courses"
await page.click('.tabs-nav button:has-text("Tâches")');
for (let i = 0; i < 12; i++) {
  await dismissModalIfAny();
  await page.click('.card:has-text("Faire des courses") >> button:has-text("Agir")');
  await page.waitForTimeout(2200);
}
const researchAfterClicks = await page.locator('.resource-row', { hasText: 'Recherche' }).locator('.r-values').innerText();
console.log('Research after clicking errands:', researchAfterClicks);

// unlock "lore" skill (research 20)
await page.click('.tabs-nav button:has-text("Compétences")');
await dismissModalIfAny();
const loreBtn = page.locator('.card', { has: page.locator('h3', { hasText: 'Lore arcanique' }) }).locator('button:has-text("Apprendre")');
const loreDisabled = await loreBtn.isDisabled();
console.log('Lore unlock button disabled?', loreDisabled);
if (!loreDisabled) {
  await loreBtn.click();
  await page.waitForTimeout(200);
}
const loreCardClass = await page.locator('.card', { has: page.locator('h3', { hasText: 'Lore arcanique' }) }).getAttribute('class');
console.log('Lore card class after unlock:', loreCardClass);

// assign lore to slot 1
await page.click('.tabs-nav button:has-text("Tâches")');
await dismissModalIfAny();
await page.selectOption('.slot-card select', 'lore');
await page.waitForTimeout(3000);
const arcana = await page.locator('.resource-row', { hasText: 'Arcana' }).count();
console.log('Arcana row visible after lore practiced (should unlock once cap>0):', arcana > 0);
if (arcana > 0) {
  const arcanaVal = await page.locator('.resource-row', { hasText: 'Arcana' }).locator('.r-values').innerText();
  console.log('Arcana value:', arcanaVal);
}

await page.screenshot({ path: process.argv[2] + '/loop-final.png', fullPage: true });
console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
