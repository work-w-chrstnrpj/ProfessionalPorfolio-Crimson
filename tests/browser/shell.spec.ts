import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const evidence='.artifacts/browser/pf-t004';
for(const width of [1440,390,320,768,1024]) {
  test(`header/hero layout and navigation at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    const errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    expect(await page.locator('.hero-portrait img').evaluate((n:HTMLImageElement)=>n.complete&&n.naturalWidth>0)).toBe(true);
    await expect(page.getByRole('link',{name:'Explore Projects',exact:true})).toHaveAttribute('href','/#project');
    if(width<=1100) {
      const menu=page.locator('.menu-toggle');
      await expect(menu).toHaveAccessibleName('MENU +');
      await expect(menu).toHaveAttribute('aria-expanded','false');
      await expect(page.locator('#mobile-navigation')).toBeHidden();
      await menu.focus();await page.keyboard.press('Enter');
      await expect(menu).toHaveAttribute('aria-expanded','true');
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded','false');
      await expect(menu).toBeFocused();
      await menu.click();await page.locator('#mobile-navigation').getByRole('link',{name:'CONTACT',exact:false}).click();
      await expect(menu).toHaveAttribute('aria-expanded','false');
      expect(new URL(page.url()).hash).toBe('#contact');
    } else {
      await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:'CONTACT',exact:true}).click();
      expect(new URL(page.url()).hash).toBe('#contact');
    }
    await page.getByRole('banner').getByRole('link',{name:'Crimson — Home',exact:true}).click();
    expect(new URL(page.url()).hash).toBe('');
    if(width===1440||width===390){mkdirSync(evidence,{recursive:true});await page.locator('.hero').screenshot({path:`${evidence}/actual-${width}.png`});}
    expect(errors).toEqual([]);
  });
}
test('skip link, reduced motion and no-JavaScript core content',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:'ABOUT',exact:true})).toBeVisible();
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await context.close();
});

test('hero and navigation have no automated WCAG A/AA findings',async({page})=>{
  await page.setViewportSize({width:390,height:900});await page.goto('/');
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
  await page.locator('.menu-toggle').click();
  await page.screenshot({path:`${evidence}/actual-menu-390.png`});
  const expanded=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(expanded.violations).toEqual([]);
});

test('expanded menu follows compact header spacing and releases background on resize',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:800},deviceScaleFactor:Math.SQRT2});
  const page=await context.newPage();await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.locator('.menu-toggle').click();
  await expect(page.locator('#content')).toHaveAttribute('inert','');
  await expect(page.getByRole('contentinfo',{includeHidden:true})).toHaveAttribute('inert','');
  await page.screenshot({path:`${evidence}/actual-menu-native-density.png`});
  const first=await page.locator('.mobile-menu-item').first().boundingBox();
  expect(first?.y).toBe(112);
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#content')).not.toHaveAttribute('inert','');
  await context.close();
});
