import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setupCalendar } from './fixtures/calendar';

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => ({ document: document.scrollingElement!.scrollWidth <= window.innerWidth, main: [...document.querySelectorAll('main')].every(el => el.scrollWidth <= el.clientWidth) }))).toEqual({ document: true, main: true });
}

async function checkTargets(page: Page) {
  const undersized = await page.locator('button, a[href], select, input:not([type="hidden"]), summary, [role="tab"]').evaluateAll(elements => elements.flatMap(element => {
    const el = element as HTMLElement;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const hiddenByDetails = [...el.parentElement?.closest('details:not([open])')?.children ?? []].length > 0 && !el.closest('details:not([open])')?.querySelector(':scope > summary')?.contains(el);
    if (!rect.width || !rect.height || !el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) || hiddenByDetails || style.clip === 'rect(0px, 0px, 0px, 0px)' || style.clipPath === 'inset(50%)' || el.closest('[inert]')) return [];
    // A checkbox can use its associated label as its larger hit target.
    const target = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.closest('label') ?? el : el;
    const box = target.getBoundingClientRect();
    return box.width < 44 || box.height < 44 ? [`${el.tagName} ${el.getAttribute('aria-label') ?? el.textContent?.trim()}: ${box.width}x${box.height}`] : [];
  }));
  expect(undersized).toEqual([]);
}

async function checkMobileText(page: Page) {
  const smallText = await page.locator('main').evaluate(root => [...root.querySelectorAll('*')].flatMap(node => {
        const el = node as HTMLElement; const style = getComputedStyle(el); const box = el.getBoundingClientRect();
        const ownText = [...el.childNodes].some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
        const closed = el.closest('details:not([open])');
        const hiddenByDetails = closed && !closed.querySelector(':scope > summary')?.contains(el);
        if (!ownText || !box.width || !box.height || !el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) || hiddenByDetails || style.clip === 'rect(0px, 0px, 0px, 0px)' || style.clipPath === 'inset(50%)' || style.fontFamily.includes('Material Symbols') || el.closest('[inert]') || el.closest('svg')) return [];
        return parseFloat(style.fontSize) < 16 ? [`${el.tagName}: ${el.textContent?.trim()} (${style.fontSize})`] : [];
      }));
  expect(smallText).toEqual([]);
}

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => { await setupCalendar(page); });

test('home and planner views fit the viewport and expose usable controls', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Winter gathering' })).toBeVisible();
  await noHorizontalOverflow(page);
  if (page.viewportSize()!.width < 640) {
    expect(await page.locator('body').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await checkMobileText(page);
  }
  await checkTargets(page);
  if (page.viewportSize()!.width < 640) {
    const main = page.locator('main');
    await main.evaluate(el => { el.style.scrollBehavior = 'auto'; el.scrollTop = el.scrollHeight; });
    const lastLink = page.getByRole('link', { name: /Manage recurring events/ });
    const linkBox = await lastLink.boundingBox();
    const navBox = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox();
    expect(linkBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(navBox!.y);
    await noHorizontalOverflow(page);
    await main.evaluate(el => { el.scrollTop = 0; });
  }
  await page.getByRole('button', { name: 'Calendar view' }).click();
  const panel = page.locator('#calendar-panel');
  await expect(panel.getByRole('tab', { name: 'Upcoming' })).toHaveAttribute('aria-selected', 'true');
  if (page.viewportSize()!.width < 640) {
    const year = await panel.getByLabel('Starting year').locator('..').boundingBox();
    const closed = await panel.getByRole('checkbox', { name: 'Include closed' }).locator('..').boundingBox();
    expect(year).not.toBeNull();
    expect(closed).not.toBeNull();
    expect(year!.y + year!.height).toBeLessThanOrEqual(closed!.y);
  }
  expect(await panel.locator('..').locator('..').evaluate(el => getComputedStyle(el).transitionDuration)).toContain('0.26s');
  for (const view of ['Upcoming', 'Season', 'Month']) {
    await panel.getByRole('tab', { name: view }).click();
    if (view === 'Month') {
      if (page.viewportSize()!.width < 640) await panel.getByLabel('Choose a date').fill('2026-12-25');
      else {
        await panel.getByRole('button', { name: 'Next month' }).click();
        await panel.getByRole('button', { name: /Dec 25, 2026, 1 event/ }).click();
      }
      await expect(panel.getByRole('link', { name: /Winter gathering/ })).toBeVisible();
    }
    await noHorizontalOverflow(page);
    await checkTargets(page);
    if (page.viewportSize()!.width < 640) await checkMobileText(page);
    const results = await new AxeBuilder({ page }).include('#calendar-panel').analyze();
    expect(results.violations).toEqual([]);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Calendar view' })).toBeFocused();
});

test('season groups the year boundary and keeps closed events collapsed', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Calendar view' }).click();
  const panel = page.locator('#calendar-panel');
  await panel.getByRole('tab', { name: 'Season' }).click();
  await expect(panel.getByText('Winter 2026', { exact: true })).toBeVisible();
  await expect(panel.getByText('Winter 2027', { exact: true })).toBeVisible();
  const closed = panel.locator('details').filter({ hasText: 'Autumn gathering' });
  await expect(closed).not.toHaveAttribute('open', '');
  await closed.locator('summary').click();
  await expect(closed).toHaveAttribute('open', '');
  await expect(panel.getByRole('link', { name: /Autumn gathering/ })).toHaveCount(1);
  await panel.getByRole('checkbox', { name: 'Include closed' }).uncheck();
  await expect(panel.getByText('Autumn gathering')).toHaveCount(0);
});

test('remembers view and switches under reduced motion without duplicating cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Calendar view' }).click();
  const panel = page.locator('#calendar-panel');
  await panel.getByRole('tab', { name: 'Season' }).click();
  expect(await panel.locator('..').locator('..').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  expect(await panel.getByRole('tabpanel').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await expect(panel.getByRole('link', { name: /Winter gathering/ })).toHaveCount(1);
  await panel.getByRole('tab', { name: 'Upcoming' }).click();
  await expect(panel.getByRole('link', { name: /Winter gathering/ })).toHaveCount(1);
  await panel.getByRole('tab', { name: 'Season' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Calendar view' }).click();
  await expect(panel.getByRole('tab', { name: 'Season' })).toHaveAttribute('aria-selected', 'true');
  await panel.getByRole('tab', { name: 'Season' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Calendar view' })).toBeFocused();
});

// Opt-in captures use the same fixture and assertions as the browser tests.
test('capture planner evidence', async ({ page }) => {
  const directory = process.env.CALENDAR_EVIDENCE_DIR;
  test.skip(!directory, 'Set CALENDAR_EVIDENCE_DIR to capture evidence');
  await mkdir(directory!, { recursive: true });
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Calendar view' }).click();
  const panel = page.locator('#calendar-panel');
  await expect(panel.getByRole('tab', { name: 'Upcoming' })).toHaveAttribute('aria-selected', 'true');
  const capture = async (name: string) => {
    if (page.viewportSize()!.width < 640) {
      await page.getByRole('button', { name: 'Close calendar' }).evaluate(button => {
        const main = button.closest('main')!;
        const toolbar = button.parentElement!;
        main.style.scrollBehavior = 'auto';
        main.scrollTop += toolbar.getBoundingClientRect().top - main.getBoundingClientRect().top;
      });
    } else await panel.scrollIntoViewIfNeeded();
    await noHorizontalOverflow(page);
    await checkTargets(page);
    await page.screenshot({ path: join(directory!, `${name}.png`), animations: 'disabled' });
    const metrics = await page.evaluate(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      document: { scrollWidth: document.scrollingElement!.scrollWidth, clientWidth: document.scrollingElement!.clientWidth },
      main: [...document.querySelectorAll('main')].map(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollTop: el.scrollTop })),
      controls: [...document.querySelectorAll('button, a[href], select, input:not([type="hidden"]), summary, [role="tab"]')].flatMap(element => {
        const el = element as HTMLElement; const rect = el.getBoundingClientRect();
        const closed = el.closest('details:not([open])');
        const hiddenByDetails = closed && !closed.querySelector(':scope > summary')?.contains(el);
        if (!rect.width || !rect.height || !el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) || hiddenByDetails || getComputedStyle(el).clip === 'rect(0px, 0px, 0px, 0px)' || getComputedStyle(el).clipPath === 'inset(50%)' || el.closest('[inert]')) return [];
        const target = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.closest('label') ?? el : el;
        const box = target.getBoundingClientRect();
        return [{ name: el.getAttribute('aria-label') ?? el.textContent?.trim(), width: box.width, height: box.height }];
      }),
    }));
    await writeFile(join(directory!, `${name}.json`), JSON.stringify(metrics, null, 2));
  };
  if (page.viewportSize()!.width < 640) await capture('phone-upcoming');
  else {
    await capture('desktop-upcoming');
    await panel.getByRole('tab', { name: 'Season' }).click();
    await expect(panel.locator('details').filter({ hasText: 'Autumn gathering' })).not.toHaveAttribute('open', '');
    await capture('desktop-season');
  }
});
