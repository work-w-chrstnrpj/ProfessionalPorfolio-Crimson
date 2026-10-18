import {test,expect} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
const evidence='.artifacts/browser/pf-t006';
for(const width of [1440,390,320,768])test(`Projects visual and filtering ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const section=page.locator('#project');await expect(section.locator('.project-row')).toHaveCount(6);
 await expect(section.locator('img')).toHaveCount(0);
 await expect(section.locator('.project-action').first()).toHaveAttribute('href','/projects/example-project-1/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 if(width===1440||width===390){mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/geometry-${width}.json`,JSON.stringify(await section.boundingBox()));await page.screenshot({path:`${evidence}/full-${width}.png`,fullPage:true});}
 await section.locator('summary').click();await section.getByRole('button',{name:'Desktop & Native',exact:true}).click();await expect(section.locator('.project-row')).toHaveCount(2);
 await section.getByRole('button',{name:'Show all',exact:true}).click();await expect(section.locator('.project-row')).toHaveCount(6);
});
test('all six projects remain in no-JavaScript HTML',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('/');await expect(page.locator('#project .project-row')).toHaveCount(6);await context.close();
});

test('configured add/remove/reorder and empty projects render safely',async({page})=>{
 const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
 const {Projects}=await import('../../application/src/components/Projects');const {loadPortfolio}=await import('../../application/src/lib/config');
 const c=loadPortfolio();const projects=[{...c.projects[5],id:'synthetic-project',slug:'synthetic-project',title:'A long synthetic project title that must wrap safely across narrow viewports'},...c.projects.slice(1,3).reverse()];
 await page.setViewportSize({width:390,height:1000});await page.goto('/');
 await page.locator('#project').evaluate((n,html)=>{n.outerHTML=html;},renderToStaticMarkup(createElement(Projects,{projects,copy:c.site.copy,categories:[]})));
 await expect(page.locator('#project .project-row')).toHaveCount(3);await expect(page.locator('#project .project-row').first()).toHaveAttribute('data-slug','synthetic-project');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.locator('#project').evaluate((n,html)=>{n.outerHTML=html;},renderToStaticMarkup(createElement(Projects,{projects:[],copy:c.site.copy,categories:[]})));
 await expect(page.locator('#project [role="status"]')).toContainText(c.site.copy.noProjects);
});
