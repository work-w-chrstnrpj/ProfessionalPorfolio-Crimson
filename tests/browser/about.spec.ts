import {test,expect} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {About} from '../../application/src/components/About';
import {loadPortfolio,validatePortfolio} from '../../application/src/lib/config';
import {resolve} from 'node:path';
const evidence='.artifacts/browser/pf-t005';
for(const width of [1440,390,320,768])test(`About content, social targets and layout ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const about=page.locator('#about');
 await expect(about.locator('.experience-row')).toHaveCount(4);
 await expect(about.locator('.education-card')).toHaveCount(2);
 await expect(about.locator('[data-status="studying"]')).toContainText('Sample education entry');
 for(const [label,href] of [['LinkedIn','https://example.com/your-linkedin'],['GitHub','https://example.com/your-github'],['Email Crimson','mailto:hello@example.com']]){
  const link=about.getByRole('link',{name:label,exact:true});await expect(link).toHaveAttribute('href',href);
  const box=await link.boundingBox();expect(box?.width).toBe(44);expect(box?.height).toBe(44);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 if(width===1440||width===390){mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/geometry-${width}.json`,JSON.stringify(await about.boundingBox()));await page.screenshot({path:`${evidence}/full-${width}.png`,fullPage:true});}
});
test('long and added About records reflow without clipping or overlap',async({page})=>{
 const config=structuredClone(loadPortfolio());config.profile.biography+=' '+config.profile.biography.repeat(6);
 config.experience.push({...config.experience[0],id:'synthetic-long-role',title:'A long synthetic role title for responsive acceptance',employer:'Example organisation with a long name',description:'Long synthetic responsibility. '.repeat(35),highlights:['A synthetic highlight for layout verification.']});
 config.education.push({...config.education[0],id:'synthetic-education',qualification:'A long synthetic qualification for responsive layout verification',institution:'Example institution with a longer synthetic name'});
 validatePortfolio(config,{publicDir:resolve('application/public'),contentDir:resolve('application/src/content')});
 const html=renderToStaticMarkup(createElement(About,{config}));
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.locator('#about').evaluate((n,html)=>{n.outerHTML=html;},html);
  await expect(page.locator('#about .experience-row')).toHaveCount(5);
  await expect(page.locator('#about .education-card')).toHaveCount(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  const defects=await page.locator('#about').evaluate(root=>Array.from(root.querySelectorAll('article')).filter(n=>n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1).length);
  expect(defects).toBe(0);
  const section=await page.locator('#about').boundingBox(),next=await page.locator('#project').boundingBox();expect(next!.y).toBeGreaterThanOrEqual(section!.y+section!.height);
 }
});
