import {test,expect} from '@playwright/test';import {mkdirSync,writeFileSync} from 'node:fs';
const evidence='.artifacts/browser/pf-t015/contact';
for(const width of [1440,390,320,768])test(`Contact footer and validation prevents transport ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 let calls=0;await page.route('https://api.web3forms.com/**',route=>{calls++;return route.abort();});
 await expect(page.getByLabel('Name',{exact:true})).toBeVisible();await expect(page.locator('.contact-email')).toHaveAttribute('href','mailto:hello@example.com');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 if(width===1440||width===390){mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/geometry-${width}.json`,JSON.stringify({contact:await page.locator('#contact').boundingBox(),footer:await page.locator('footer').boundingBox()}));await page.screenshot({path:`${evidence}/full-${width}.png`,fullPage:true});}
 await page.getByRole('button',{name:'Send Message',exact:true}).click();await expect(page.getByRole('status')).toContainText('not available');await expect(page.locator('.captcha-slot')).toHaveCount(0);expect(calls).toBe(0);
});

test('no-JavaScript contact cannot GET-submit personal fields',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const page=await context.newPage();await page.goto('/');
 await expect(page.getByRole('button',{name:'Send Message',exact:true})).toBeDisabled();await expect(page.locator('.form-no-script')).toContainText('not available');
 await expect(page.locator('.contact-email')).toHaveAttribute('href','mailto:hello@example.com');await context.close();
});
