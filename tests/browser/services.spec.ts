import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {Services,ResumeAction} from '../../application/src/components/Services';import {loadPortfolio} from '../../application/src/lib/config';
const evidence='.artifacts/browser/pf-t007/resume-skills';
for(const width of [1440,390,320,768])test(`Services skills resume ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const section=page.locator('#service');await expect(section.locator('.service-card')).toHaveCount(3);await expect(section.locator('.skill-card')).toHaveCount(7);
 await expect(section.getByRole('button',{name:'Download resume'})).toBeDisabled();await expect(section.locator('.resume-action a')).toHaveCount(0);await expect(section.locator('#resume-note')).toContainText('Add your own resume PDF');
 await expect(section.getByRole('link',{name:'Discuss a Project'})).toHaveAttribute('href','/#contact');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 if(width===1440||width===390){mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/geometry-${width}.json`,JSON.stringify(await section.boundingBox()));await page.screenshot({path:`${evidence}/full-${width}.png`,fullPage:true});}
});
test('extra long services and reordered skills expand safely; configured PDF uses a download link',async({page})=>{
 const c=structuredClone(loadPortfolio());c.services.reverse();c.skills.reverse();c.services.push({...c.services[0],id:'synthetic-service',title:'A long synthetic service title for responsive layout verification',description:'Synthetic scope detail. '.repeat(30)});c.skills.push({id:'synthetic-skills',title:'Synthetic additional technology group with a longer name',technologies:['Synthetic technology label '.repeat(20)]});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.locator('#service').evaluate((n,html)=>{n.outerHTML=html;},renderToStaticMarkup(createElement(Services,{config:c,visible:['contact']})));
  await expect(page.locator('.service-card')).toHaveCount(4);await expect(page.locator('.skill-card')).toHaveCount(8);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  const clipped=await page.locator('#service').evaluate(root=>Array.from(root.querySelectorAll('article')).some(n=>n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1));expect(clipped).toBe(false);
 }
 const html=renderToStaticMarkup(createElement(ResumeAction,{resume:{available:true,path:'/media/example-approved.pdf',label:'Example resume',note:'Synthetic fixture'}}));
 expect(html).toContain('href="/media/example-approved.pdf"');expect(html).toContain('download=""');
 const unavailable=renderToStaticMarkup(createElement(ResumeAction,{resume:{available:false,label:'Resume'}}));expect(unavailable).toContain('disabled');expect(unavailable).not.toContain('aria-describedby');expect(unavailable).not.toContain('resume-note');
});
