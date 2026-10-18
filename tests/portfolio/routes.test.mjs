import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const configDir=process.env.PORTFOLIO_CONFIG_DIR||resolve('application/src/config');
const projects=JSON.parse(await readFile(resolve(configDir,'projects.json'),'utf8'));
const site=JSON.parse(await readFile(resolve(configDir,'site.json'),'utf8'));
const output=resolve('application/out');
test('exported routes and sitemap match configured records, including zero projects',async()=>{
 const dirs=await readdir(resolve(output,'projects'),{withFileTypes:true}).catch(()=>[]);
 assert.deepEqual(dirs.filter(x=>x.isDirectory()).map(x=>x.name).sort(),projects.map(p=>p.slug).sort());
 const sitemap=await readFile(resolve(output,'sitemap.xml'),'utf8');
 for(const p of projects){const path=`/projects/${p.slug}/`;const html=await readFile(resolve(output,'.'+path,'index.html'),'utf8');assert.ok(html.includes(`<link rel="canonical" href="${new URL(path,site.url).href}"`));assert.ok(sitemap.includes(new URL(path,site.url).href));}
 assert.ok(sitemap.includes(new URL('/privacy/',site.url).href));
 assert.ok(!sitemap.includes('_empty'));
 const privacy=await readFile(resolve(output,'privacy/index.html'),'utf8');assert.ok(privacy.includes('rel="canonical"'));
});
