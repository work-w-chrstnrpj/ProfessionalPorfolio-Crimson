import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const evidence='.artifacts/browser/pf-t004/compact-header';
for(const width of [320,390,936,1101,1180,1280,1440])test(`anchor placement, equal CTAs and no horizontal scroll ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:800});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.locator('.hero-portrait img').evaluate((n:HTMLImageElement)=>n.decode());
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 const buttons=await page.locator('.hero-actions>a').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
 const header=await page.locator('.header-inner').boundingBox();expect(header!.y).toBe(12);expect(header!.height).toBeGreaterThanOrEqual(44);
 expect(await page.locator('.site-header').evaluate(n=>getComputedStyle(n,'::before').height)).toBe('72px');
 expect(buttons).toHaveLength(2);expect(buttons[0]).toEqual(buttons[1]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>document.documentElement.clientWidth));
 const capture=async(name:string)=>{if([390,1280,1440].includes(width)){mkdirSync(evidence,{recursive:true});await page.screenshot({path:`${evidence}/${info.project.name||'chromium'}-${name}-${width}.png`});}};
 await capture('hero');
 for(const id of ['about','project','service','contact']){
  if(width<=1100){await page.locator('.menu-toggle').click();await page.locator('#mobile-navigation').getByRole('link',{name:new RegExp(id,'i')}).click();}
  else await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:id,exact:false}).click();
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect.poll(async()=>Math.round((await page.locator(`#${id} .section-kicker`).boundingBox())!.y)).toBe(92);
  await expect.poll(()=>page.locator('.site-header').evaluate(n=>getComputedStyle(n,'::before').opacity)).toBe('1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>document.documentElement.clientWidth));
  await capture(id);
 }
 // Native direct fragments and the hero actions share the same offset, without JS scroll hacks.
 await page.goto('/#project');await expect.poll(async()=>Math.round((await page.locator('#project .section-kicker').boundingBox())!.y)).toBe(92);
 for(const [name,id] of [['Explore Projects','project'],['Hire Me','contact']]){
  await page.getByRole('banner').getByRole('link',{name:'Crimson — Home',exact:true}).click();
  await page.getByRole('link',{name,exact:true}).click();
  await expect.poll(async()=>Math.round((await page.locator(`#${id} .section-kicker`).boundingBox())!.y)).toBe(92);
 }
});
