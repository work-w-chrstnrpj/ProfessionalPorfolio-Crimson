import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync} from 'node:fs';
const slugs=['example-project-1','example-project-2','example-project-3','example-project-4','example-project-5','example-project-6'];
test('all configured routes load directly, have unique metadata and honest evidence',async({page})=>{
 const titles=new Set();
 for(const slug of slugs){const r=await page.goto(`/projects/${slug}/`);expect(r?.status()).toBe(200);titles.add(await page.title());await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://example.com/projects/${slug}/`);await expect(page.getByRole('heading',{name:'Purpose & Goals',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Problem',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Limitations',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Evidence',exact:true})).toHaveCount(0);await expect(page.locator('.project-preview .project-media')).toContainText('PROJECT PREVIEW / PLACEHOLDER');const positions=await page.evaluate(()=>({lead:document.querySelector('.auxiliary-lead')!.getBoundingClientRect().bottom,preview:document.querySelector('.project-preview')!.getBoundingClientRect(),facts:document.querySelector('.project-facts')!.getBoundingClientRect().top}));expect(positions.preview.y).toBeGreaterThan(positions.lead);expect(positions.preview.bottom).toBeLessThan(positions.facts);await expect(page.getByRole('link',{name:'View source',exact:true})).toHaveAttribute('href',/^https:\/\/example.com\//);await expect(page.getByRole('link',{name:'Open live project',exact:true})).toHaveCount(0);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');}
 expect(titles.size).toBe(6);
});
for(const width of [1440,390,320,768])test(`auxiliary templates reflow and return home ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const [path,name] of [['/projects/example-project-2/','project'],['/privacy/','privacy'],['/unavailable-project/','404']]){
  const r=await page.goto(path);expect(r?.status()).toBe(name==='404'?404:200);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  if(width===1440||width===390){mkdirSync('.artifacts/browser/pf-t010/detail-preview',{recursive:true});await page.screenshot({path:`.artifacts/browser/pf-t010/detail-preview/${name}-${width}.png`,fullPage:true});}
  await page.getByRole('banner').getByRole('link',{name:'Crimson — Home',exact:true}).click();expect(new URL(page.url()).pathname).toBe('/');
 }
});
test('sitemap and robots use canonical origin without source repository prefix',async({request})=>{
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.ok()).toBe(true);const text=await sitemap.text();for(const slug of slugs)expect(text).toContain(`https://example.com/projects/${slug}/`);expect(text).not.toContain('ProfessionalPorfolio-Crimson');const robots=await request.get('/robots.txt');expect(await robots.text()).toContain('Disallow: /');
});
