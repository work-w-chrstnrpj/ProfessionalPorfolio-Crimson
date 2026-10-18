import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const card=(page:import('@playwright/test').Page,n:number)=>page.locator(`[data-slug=example-project-${n}]`);
for(const width of [1440,768,390,320])test(`configured showcases, videos and posters at ${width}px`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width,height:1000});await page.goto('/');
 const showcase=card(page,1);await showcase.scrollIntoViewIfNeeded();
 await expect(showcase.locator('.fixture-showcase')).toHaveAttribute('data-mode','compact');
 await expect(showcase.locator('.fixture-showcase')).toHaveAttribute('data-controls','true');
 await showcase.getByRole('button',{name:'Play showcase',exact:true}).click();await expect(showcase.getByRole('button',{name:'Pause showcase',exact:true})).toBeVisible();
 await showcase.getByRole('button',{name:'Expand showcase'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('.project-filter summary').click();await page.getByRole('button',{name:'Desktop & Native',exact:true}).click();await expect(showcase).toHaveCount(0);await expect(page.locator('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Show all',exact:true}).click();await page.locator('.project-filter summary').click();await showcase.scrollIntoViewIfNeeded();await expect(showcase.getByRole('button',{name:'Play showcase',exact:true})).toBeVisible();
 const video=card(page,2).locator('video');await video.scrollIntoViewIfNeeded();await expect(video).toHaveAttribute('preload','none');await expect(video).not.toHaveAttribute('autoplay');await expect(video.locator('track')).toHaveAttribute('src',/captions\.vtt$/);
 expect(await video.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
 await video.evaluate(async(el:HTMLVideoElement)=>{const ended=new Promise<void>(resolve=>el.addEventListener('ended',()=>resolve(),{once:true}));await el.play();await ended;});
 expect(await video.evaluate((el:HTMLVideoElement)=>el.videoWidth)).toBe(160);
 await expect(card(page,3).locator('.project-media>img')).toHaveAttribute('alt','Synthetic preview poster');
 await expect(card(page,4).locator('.project-media>a')).toHaveAttribute('href','https://example.com/watch-demo');await expect(card(page,4).locator('iframe,video')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 if(width===1440||width===390){mkdirSync('.artifacts/media',{recursive:true});await showcase.scrollIntoViewIfNeeded();await showcase.screenshot({path:`.artifacts/media/card-${width}.png`});}
 for(const n of [1,2,3,4]){
  await page.goto(`/projects/example-project-${n}/`);const preview=page.locator('.project-preview');await preview.scrollIntoViewIfNeeded();
  if(n===1){await expect(preview.locator('.fixture-showcase')).toHaveAttribute('data-mode','detail');if(width===1440||width===390)await page.screenshot({path:`.artifacts/media/detail-${width}.png`,fullPage:true});}
  if(n===2)await expect(preview.locator('video')).toHaveAttribute('controls','');
  if(n===3)await expect(preview.locator('img')).toHaveAttribute('alt','Synthetic preview poster');
  if(n===4)await expect(preview.locator('a').first()).toHaveAttribute('href','https://example.com/watch-demo');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 }
 expect(errors).toEqual([]);
});
test('showcase is deferred and survives navigation back to the homepage',async({page})=>{
 let modules=0;page.on('request',request=>{if(request.url().endsWith('/bravado.js'))modules++;});
 await page.goto('/');await expect(page.locator('.project-filter')).toBeVisible();expect(modules).toBe(0);
 await card(page,1).scrollIntoViewIfNeeded();await expect(card(page,1).locator('.fixture-showcase')).toBeVisible();expect(modules).toBe(1);
 await card(page,1).getByRole('link',{name:'View project'}).click();await page.locator('.project-preview').scrollIntoViewIfNeeded();await expect(page.locator('.fixture-showcase')).toHaveAttribute('data-mode','detail');
 await page.getByRole('link',{name:'All projects',exact:true}).click();await card(page,1).scrollIntoViewIfNeeded();await expect(card(page,1).locator('.fixture-showcase')).toHaveAttribute('data-mode','compact');
 expect(await page.locator('head link[href$="/bravado.css"]').count()).toBe(1);
});
test('reduced motion and no JavaScript retain usable previews',async({page,browser})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/example-project-1/');await page.locator('.project-preview').scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Play showcase',exact:true})).toBeDisabled();
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();await plain.goto('/projects/example-project-1/');await expect(plain.locator('.project-preview img')).toHaveAttribute('alt','Synthetic preview poster');await context.close();
});
for(const failure of ['module','stylesheet','contract'])test(`showcase keeps its poster on ${failure} failure`,async({page})=>{
 if(failure==='contract')await page.route('**/bravado.js',route=>route.fulfill({contentType:'text/javascript',body:'export const missingMount = true;'}));
 else await page.route(failure==='module'?'**/bravado.js':'**/bravado.css',route=>route.abort());
 await page.goto('/projects/example-project-1/');await page.locator('.project-preview').scrollIntoViewIfNeeded();await expect(page.locator('.project-preview img')).toBeVisible();await expect(page.locator('.fixture-showcase')).toHaveCount(0);
});
