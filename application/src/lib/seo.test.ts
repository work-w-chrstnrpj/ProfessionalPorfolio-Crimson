import {test,expect,afterEach,vi} from 'vitest';
import {loadPortfolio,validatePortfolio} from './config';
import {pageMetadata} from './seo';
import {storyBlocks} from './story';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
const config=loadPortfolio();
afterEach(()=>vi.unstubAllEnvs());
test('canonical and social URL use configured production root; previews are noindex',()=>{
 vi.stubEnv('PORTFOLIO_INDEXABLE','');
 const m=pageMetadata(config,'Example','Description','/projects/example/');
 expect(m.alternates?.canonical).toBe(config.site.url+'/projects/example/');
 expect(m.robots).toEqual({index:false,follow:false});
 vi.stubEnv('PORTFOLIO_INDEXABLE','true');expect(pageMetadata(config,'X','Y','/').robots).toEqual({index:true,follow:true});
});
test('production origin rejects repository paths and query/fragment contamination',()=>{
 for(const suffix of ['/repo/','/?x=1','/#content']){const c=structuredClone(config);c.site.url+=suffix;expect(()=>validatePortfolio(c,{publicDir:'application/public',contentDir:'application/src/content'})).toThrow(/production HTTPS origin/);}
});
test('story subset keeps executable markup and unsafe URLs escaped as text',()=>{
 const b=storyBlocks('## Evidence\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))');
 const html=renderToStaticMarkup(createElement('article',null,b.map((x,i)=>createElement(x.heading?'h2':'p',{key:i},x.text))));
 expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script>');expect(html).not.toContain('href=');
});
