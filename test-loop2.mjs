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

// unlock free skill "lightlore" (luménologie)
await page.click('.tabs-nav button:has-text("Compétences")');
await dismissModalIfAny();
const lightBtn = page.locator('.card', { has: page.locator('h3', { hasText: 'Luménologie' }) }).locator('button:has-text("Apprendre")');
await lightBtn.click();
await page.waitForTimeout(200);
const lightCardClass = await page.locator('.card', { has: page.locator('h3', { hasText: 'Luménologie' }) }).getAttribute('class');
console.log('Luménologie card class after unlock (should include owned):', lightCardClass);

// assign to slot 1 and let it tick
await page.click('.tabs-nav button:has-text("Tâches")');
await dismissModalIfAny();
await page.selectOption('.slot-card select', 'lightlore');
await page.waitForTimeout(4000);
await dismissModalIfAny();

const lightRow = await page.locator('.resource-row', { hasText: 'Mana de Lumière' }).count();
console.log('Light mana row visible:', lightRow > 0);
if (lightRow > 0) {
  console.log('Light mana value:', await page.locator('.resource-row', { hasText: 'Mana de Lumière' }).locator('.r-values').innerText());
}

// unassign the slot so energy regen isn't contested while we grind active tasks
await page.click('.tabs-nav button:has-text("Tâches")');
await page.selectOption('.slot-card select', '');
await page.waitForTimeout(3000);

// unlock a class: apprentice needs research 10 + gold 20; use "Faire la manche" (gold) and "Faire des courses" (research) a few times
for (let i = 0; i < 6; i++) {
  await dismissModalIfAny();
  await page.click('.card:has-text("Faire la manche") >> button:has-text("Agir")');
  await page.waitForTimeout(2100);
}
for (let i = 0; i < 6; i++) {
  await dismissModalIfAny();
  await page.click('.card:has-text("Faire des courses") >> button:has-text("Agir")');
  await page.waitForTimeout(2100);
}
await page.click('.tabs-nav button:has-text("Classes")');
await dismissModalIfAny();
const apprenticeCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Apprenti' }) });
const apprenticeBtn = apprenticeCard.locator('button:has-text("Adopter")');
console.log('Apprentice adopt disabled?', await apprenticeBtn.isDisabled());
if (!(await apprenticeBtn.isDisabled())) {
  await apprenticeBtn.click();
  await page.waitForTimeout(200);
  console.log('Apprentice card class after buy:', await apprenticeCard.getAttribute('class'));
}

await page.screenshot({ path: process.argv[2] + '/loop2-final.png', fullPage: true });
console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
