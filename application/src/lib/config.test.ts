import { describe, expect, test } from 'vitest';
import { loadPortfolio, validatePortfolio, deriveContent, schemas, type ConfigInput } from './config';
import { resolve } from 'node:path';
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
const root=process.cwd();
const options={ publicDir:resolve(root,'application/public'), contentDir:resolve(root,'application/src/content') };
const valid=loadPortfolio();
const mutate=(change:(c:any)=>void)=>{const copy=structuredClone(valid);change(copy);return ()=>validatePortfolio(copy,options);};
describe('public portfolio configuration',()=>{
  test('starter defaults are clearly fictional and contain no personal assets or active form',()=>{
    expect(valid.profile.name).toBe('Crimson');
    expect(valid.site.url).toBe('https://example.com');
    expect(valid.projects).toHaveLength(6);
    expect(valid.projects.every(p=>p.status==='Sample project — replace me')).toBe(true);
    expect(valid.profile.portrait?.src).toBe('/media/portrait-placeholder.svg');
    expect(valid.profile.resume.available).toBe(false);
    expect(valid.profile.resume.path).toBeUndefined();
    expect(valid.contact.enabled).toBe(false);
  });
  test('synthetic identity loads through the same loader without owner content',()=>{
    const c=loadPortfolio({configDir:resolve(root,'tests/fixtures/synthetic')});
    expect(c.profile.name).toBe('Alex');
    expect(c.projects).toHaveLength(1);
    expect(c.profile.name).not.toBe(valid.profile.name);
  });
  test('arrays preserve add/remove/reorder without fixed counts',()=>{
    const c=structuredClone(valid);
    c.projects=[...c.projects.reverse(),{...c.projects[0],id:'new-work',slug:'new-work'}];
    c.experience.reverse();c.education=[];c.skills=[];c.services=[];
    const v=validatePortfolio(c,options), d=deriveContent(v);
    expect(d.projectRoutes.at(-1)?.href).toBe('/projects/new-work/');
    expect(d.projectRoutes[0].slug).toBe('example-project-6');
    expect(d.navigation.map(n=>n.id)).not.toContain('service');
    expect(d.categories).toContain('AI & Tooling');
  });
  test('empty optional sections and hidden sections are removed from navigation',()=>{
    const c=structuredClone(valid);c.projects=[];
    c.site.sections.find(s=>s.id==='about')!.visible=false;
    const d=deriveContent(validatePortfolio(c,options));
    expect(d.navigation.map(n=>n.id)).toEqual(['service','contact']);
    expect(d.projectRoutes).toEqual([]);
  });
  test.each(['javascript:alert(1)','data:text/html,hello','http://example.com','https://user:password@example.com'])('rejects unsafe repository URL %s',url=>{
    expect(mutate(c=>c.projects[0].repository=url)).toThrow(/projects.json:0.repository/);
  });
  test('rejects malformed dates and end-before-start',()=>{
    expect(mutate(c=>c.experience[0].start='2025-13')).toThrow(/experience.json:0.start/);
    expect(mutate(c=>c.experience[1].end='2020-01')).toThrow(/experience.json:1.end/);
    expect(mutate(c=>c.education[1].end='2010-01')).toThrow(/education.json:1.end/);
  });
  test.each(['experience','education','skills','services','projects'])('rejects duplicate IDs in %s',file=>{
    expect(mutate(c=>c[file].push(c[file][0]))).toThrow(new RegExp(`${file}.json:.*Duplicate ID`));
  });
  test('rejects duplicate slugs independently of record IDs',()=>{
    expect(mutate(c=>c.projects[1].slug=c.projects[0].slug)).toThrow(/projects.json:1.slug: Duplicate slug/);
  });
  test('rejects traversal and missing media',()=>{
    expect(mutate(c=>c.profile.portrait.src='/media/../private.png')).toThrow(/profile.json:portrait.src/);
    expect(mutate(c=>c.profile.portrait.src='/media/missing.png')).toThrow(/profile.json:portrait.src: Missing/);
    expect(mutate(c=>c.profile.portrait.src='/media/page.html')).toThrow(/supported local image/);
  });
  test('rejects symlinks escaping public root',()=>{
    const temp=mkdtempSync(resolve(tmpdir(),'portfolio-media-'));
    try {
      mkdirSync(resolve(temp,'public/media'),{recursive:true});
      writeFileSync(resolve(temp,'outside.svg'),'<svg/>');
      symlinkSync(resolve(temp,'outside.svg'),resolve(temp,'public/media/avatar.svg'));
      const c=structuredClone(valid);c.profile.portrait!.src='/media/avatar.svg';
      expect(()=>validatePortfolio(c,{...options,publicDir:resolve(temp,'public')})).toThrow(/escapes its configured root/);
    } finally {rmSync(temp,{recursive:true,force:true});}
  });
  test('validates optional Markdown case studies without layout changes',()=>{
    const dir=mkdtempSync(resolve(tmpdir(),'portfolio-story-'));
    try {
      const c=structuredClone(valid);c.projects=c.projects.slice(0,1);c.projects[0].caseStudy='example.md';
      expect(()=>validatePortfolio(c,{...options,contentDir:dir})).toThrow(/projects.json:0.caseStudy: Missing/);
      writeFileSync(resolve(dir,'example.md'),'# Factual example');
      expect(validatePortfolio(c,{...options,contentDir:dir}).projects[0].caseStudy).toBe('example.md');
      c.projects[0].caseStudy='../outside.md';
      expect(()=>validatePortfolio(c,{...options,contentDir:dir})).toThrow(/without traversal/);
    } finally {rmSync(dir,{recursive:true,force:true});}
  });
  test('rejects executable/unsupported theme values and inaccessible text',()=>{
    expect(mutate(c=>c.theme.fonts.body='Unreviewed Font')).toThrow(/theme.json:fonts.body/);
    expect(mutate(c=>c.theme.colors.background='url(https://example.com)')).toThrow(/six-digit hex/);
    expect(mutate(c=>c.theme.colors.muted='#333333')).toThrow(/Text contrast/);
    expect(mutate(c=>c.skills[0].icon='unknown')).toThrow(/skills.json:0.icon/);
  });
  test('private credential and arbitrary provider fields cannot enter config',()=>{
    expect(mutate(c=>c.contact.smtpPassword='private')).toThrow(/contact.json/);
    expect(mutate(c=>c.contact.endpoint='https://example.com')).toThrow(/contact.json/);
  });
  test('missing references and unavailable PDFs fail with field locations',()=>{
    expect(mutate(c=>c.site.sections=c.site.sections.filter((s:any)=>s.id!=='project'))).toThrow(/Missing section project/);
    expect(mutate(c=>{c.profile.resume.available=true;delete c.profile.resume.path;})).toThrow(/profile.json:resume.path/);
  });
  test('reports malformed/missing config without logging payload',()=>{
    const dir=mkdtempSync(resolve(tmpdir(),'portfolio-invalid-'));
    try {writeFileSync(resolve(dir,'site.json'),'{private malformed');expect(()=>loadPortfolio({configDir:dir})).toThrow('site.json:$: Cannot read valid JSON');}
    finally {rmSync(dir,{recursive:true,force:true});}
  });
});

test('case-study heading labels accept global defaults and project overrides; older configs remain valid',()=>{
 const c:any=structuredClone(valid);c.site.copy.auxiliary.caseStudyHeadings={Problem:'Purpose & Goals'};c.projects[0].caseStudyHeadings={Problem:'The Challenge'};
 const parsed=validatePortfolio(c,options);expect(parsed.projects[0].caseStudyHeadings.Problem).toBe('The Challenge');
 delete c.site.copy.auxiliary.caseStudyHeadings;delete c.projects[0].caseStudyHeadings;
 expect(validatePortfolio(c,options).projects[0].caseStudyHeadings).toEqual({});
 c.projects[0].caseStudyHeadings={Problem:'   '};expect(()=>validatePortfolio(c,options)).toThrow(/caseStudyHeadings/);
});

test('local preview video paths must be MP4/WebM and point to real public assets',()=>{
 const c=structuredClone(valid);c.projects[0].video={url:'/media/future-preview.mp4',poster:valid.profile.portrait!,transcript:'/media/future-transcript.txt'};
 expect(schemas.projects.parse(c.projects)[0].video?.url).toBe('/media/future-preview.mp4');
 expect(()=>validatePortfolio(c,options)).toThrow(/Missing or invalid file \/media\/future-preview.mp4/);
 c.projects[0].video.url='/media/preview.js';expect(()=>schemas.projects.parse(c.projects)).toThrow();
});
