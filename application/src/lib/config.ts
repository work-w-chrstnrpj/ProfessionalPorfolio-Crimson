import { z } from 'zod';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';

const text = z.string().trim().min(1).max(10000);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case ID');
const webURL = z.url().refine(v => {try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}, 'Use an HTTPS URL');
const localPath = z.string().regex(/^\/media\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/, 'Use a local /media/ asset path without traversal');
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');
const icon = z.enum(['software', 'fullstack', 'integration', 'ai', 'github', 'linkedin', 'email']);
const sectionID = z.enum(['about', 'project', 'service', 'contact']);
const asset = z.strictObject({ src: localPath.refine(v => /\.(png|jpe?g|webp|avif|svg)$/i.test(v), 'Use a supported local image'), alt: text, width: z.number().int().positive(), height: z.number().int().positive(), provenance: text });
const action = z.strictObject({ label: text, section: sectionID });
const unique = <T extends { id: string }>(rows: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>();
  rows.forEach((row, i) => { if (seen.has(row.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `Duplicate ID: ${row.id}` }); seen.add(row.id); });
};
const timeline = z.strictObject({ id, employer: text, title: text, start: month, end: month.optional(), current: z.boolean(), displayDates: text, description: text, highlights: z.array(text), url: webURL.optional() }).superRefine((v, ctx) => {
  if (v.current && v.end) ctx.addIssue({ code: 'custom', path: ['end'], message: 'Current employment cannot have an end date' });
  if (!v.current && !v.end) ctx.addIssue({ code: 'custom', path: ['end'], message: 'Past employment needs an end date' });
  if (v.end && v.end < v.start) ctx.addIssue({ code: 'custom', path: ['end'], message: 'End must follow start' });
});
const sectionCopy = z.strictObject({ kicker: text, title: text, lead: text.optional() });
export const schemas = {
  site: z.strictObject({ title: text, description: text, url: webURL.refine(v => {const u=new URL(v);return u.pathname==='/'&&!u.search&&!u.hash;}, 'Use the production HTTPS origin without a path, query or fragment'), language: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/), socialImage: asset.optional(), navigation: z.array(z.strictObject({ id: sectionID, label: text })).superRefine(unique), sections: z.array(z.strictObject({ id: sectionID, visible: z.boolean() })).superRefine(unique), copy: z.strictObject({ about: sectionCopy, project: sectionCopy, service: sectionCopy, contact: sectionCopy, experience: text, education: text, skills: text, skillsLead: text, projectAttribution: text, projectPreview: text, viewProject: text, allProjects: text, noProjects: text, showAll: text, discuss: action, privacy: text, home: text, menuOpen: text, menuClose: text, menuClosing: text, skip: text, footer: text, auxiliary: z.strictObject({ caseStudyHeadings:z.record(text,text).default({}), role:text, status:text, stack:text, evidence:text, source:text, live:text, video:text, transcript:text, privacyLead:text, privacyContact:text, privacyLinks:z.array(z.strictObject({label:text,url:webURL})), privacySections:z.array(z.strictObject({title:text,body:text})).min(1), notFoundTitle:text, notFoundLead:text }) }) }),
  profile: z.strictObject({ name: text, fullName: text, wordmark: text, roles: z.array(text).min(1), biography: text, location: text.optional(), email: z.email(), portrait: asset.optional(), hero: z.strictObject({ headline: z.array(text).min(1), mobileHeadline: z.array(text).min(1), introduction: text, positioning: text, mobilePositioning: text, primary: action, secondary: action, portraitCaption: text, disciplines: z.array(z.strictObject({ id, title: text, description: text })).superRefine(unique) }), socials: z.array(z.strictObject({ id, label: text, icon: z.enum(['github','linkedin','email']), url: z.string().refine(v => { try { const u = new URL(v); return u.protocol === 'https:' || (u.protocol === 'mailto:' && z.email().safeParse(u.pathname).success && !/[\r\n]/.test(v)); } catch { return false; } }, 'Use HTTPS or a valid mailto URL') })).superRefine(unique), expertise: z.array(z.strictObject({ id, title: text, tools: text })).superRefine(unique), resume: z.strictObject({ available: z.boolean(), label: text, note: text.optional(), path: localPath.optional() }).superRefine((v,ctx) => { if (v.available && (!v.path || !v.path.endsWith('.pdf'))) ctx.addIssue({ code:'custom',path:['path'],message:'An available resume requires a local PDF' }); }) }),
  experience: z.array(timeline).superRefine(unique),
  education: z.array(z.strictObject({ id, institution: text, qualification: text, start: month.optional(), end: month.optional(), status: z.enum(['awaiting-graduation', 'completed', 'studying']), description: text, url: webURL.optional() }).superRefine((v,ctx) => { if(v.end && (!v.start || v.end < v.start))ctx.addIssue({code:'custom',path:['end'],message:'End requires an earlier start'}); })).superRefine(unique),
  skills: z.array(z.strictObject({ id, title: text, technologies: z.array(text).min(1), icon: icon.optional() })).superRefine(unique),
  projects: z.array(z.strictObject({ id, slug: id, title: text, summary: text, categories: z.array(text).min(1), stack: z.array(text).min(1), role: text, status: text, featured: z.boolean(), repository: webURL.optional(), live: webURL.optional(), screenshots: z.array(asset), caseStudyHeadings:z.record(text,text).default({}), video: z.strictObject({ url: z.union([webURL,localPath.refine(v=>/\.(mp4|webm)$/i.test(v), 'Use a local MP4/WebM preview')]), poster: asset, transcript: localPath, captions: localPath.refine(v=>v.endsWith('.vtt'), 'Use WebVTT captions').optional() }).optional(), caseStudy: z.string().regex(/^[a-z0-9/-]+\.md$/, 'Use a relative Markdown path without traversal').optional() })).superRefine((rows,ctx) => { unique(rows,ctx); const seen=new Set<string>(); rows.forEach((r,i)=>{if(seen.has(r.slug))ctx.addIssue({code:'custom',path:[i,'slug'],message:`Duplicate slug: ${r.slug}`});seen.add(r.slug);}); }),
  services: z.array(z.strictObject({ id, title: text, description: text, scope: text, icon, action: action.optional() })).superRefine(unique),
  theme: z.strictObject({ colors: z.strictObject({ background: text, surface: text, foreground: text, muted: text, decorative: text, accent: text, functional: text, border: text, primaryHover: text, glowInner: text, glowMid: text }).superRefine((v,ctx) => { for(const [key,value] of Object.entries(v)) if(!/^#[\da-fA-F]{6}$/.test(value))ctx.addIssue({code:'custom',path:[key],message:'Use a six-digit hex color'}); }), fonts: z.strictObject({ body: z.literal('Manrope'), display: z.literal('Michroma') }), spacing: z.strictObject({ desktopGutter: z.number().min(24).max(100), mobileGutter: z.number().min(16).max(32), cardGap: z.number().min(12).max(40), cardPadding: z.number().min(16).max(40), controlHeight: z.number().min(44).max(64) }), motion: z.enum(['none', 'subtle']), wordmarkAsset: localPath.optional() }),
  contact: z.strictObject({ provider: z.literal('web3forms'), enabled: z.boolean(), timeoutMs: z.number().int().min(1000).max(60000), labels: z.strictObject({ name: text, email: text, inquiry: text, company: text, message: text, select: text, submit: text, copyEmail: text }), inquiries: z.array(z.strictObject({ id, label: text })).min(1).superRefine(unique), messages: z.strictObject({ privacy: text, sending: text, accepted: text, validation: text, unavailable: text, failed: text, timeout: text, quota: text, copied: text }) }),
} as const;
export type Portfolio = { -readonly [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]> };
export type Project = Portfolio['projects'][number];
export type ConfigInput = { -readonly [K in keyof typeof schemas]: unknown };

export function validatePortfolio(input: ConfigInput, options: { publicDir: string; contentDir: string }): Portfolio {
  const errors: string[]=[];
  const parsed: Record<string,unknown>={};
  for(const [file,schema] of Object.entries(schemas)) {
    const result=schema.safeParse(input[file as keyof ConfigInput]);
    if(result.success)parsed[file]=result.data;
    else for(const issue of result.error.issues)errors.push(`${file}.json:${issue.path.join('.') || '$'}: ${issue.message}`);
  }
  if(errors.length)throw new Error(`Invalid portfolio configuration:\n${errors.join('\n')}`);
  const config=parsed as Portfolio;
  const luminance=(hex:string)=>{
    const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
    return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;
  };
  const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
  for(const surface of ['background','surface'] as const) {
    for(const foreground of ['foreground','muted','accent'] as const)if(contrast(config.theme.colors[foreground],config.theme.colors[surface])<4.5)errors.push(`theme.json:colors.${foreground}: Text contrast on ${surface} must be at least 4.5:1`);
    if(contrast(config.theme.colors.functional,config.theme.colors[surface])<3)errors.push(`theme.json:colors.functional: Icon contrast on ${surface} must be at least 3:1`);
  }

  function checkFile(path:string,base:string,field:string) {
    const target=resolve(base,path.replace(/^\//,''));
    const inside=(root:string,file:string)=>{const r=relative(root,file);return !isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+sep);};
    if(!inside(resolve(base),target)||!existsSync(target)||!statSync(target).isFile()) {errors.push(`${field}: Missing or invalid file ${path}`);return;}
    if(!inside(realpathSync(base),realpathSync(target)))errors.push(`${field}: Asset escapes its configured root`);
  }
  const visit=(value:unknown,file:string,path:string[])=>{
    if(typeof value==='string'&&value.startsWith('/media/'))checkFile(value,options.publicDir,`${file}.json:${path.join('.')}`);
    if(Array.isArray(value))value.forEach((v,i)=>visit(v,file,[...path,String(i)]));
    else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))visit(v,file,[...path,k]);
  };
  for(const [file,value] of Object.entries(config))visit(value,file,[]);
  config.projects.forEach((p,i)=>{if(p.caseStudy)checkFile(p.caseStudy,options.contentDir,`projects.json:${i}.caseStudy`);});
  const sections=new Set(config.site.sections.map(s=>s.id));
  for(const [i,n] of config.site.navigation.entries())if(!sections.has(n.id))errors.push(`site.json:navigation.${i}.id: Missing section ${n.id}`);
  const actions=[config.profile.hero.primary,config.profile.hero.secondary,config.site.copy.discuss,...config.services.flatMap(s=>s.action?[s.action]:[])];
  for(const a of actions)if(!sections.has(a.section))errors.push(`profile/site/services.json:action.section: Missing section ${a.section}`);
  if(errors.length)throw new Error(`Invalid portfolio configuration:\n${errors.join('\n')}`);
  return config;
}
export function loadPortfolio(options: { configDir?: string; publicDir?: string; contentDir?: string } = {}): Portfolio {
  const appDir=existsSync(resolve(process.cwd(),'src/config'))?process.cwd():resolve(process.cwd(),'application');
  const configDir=options.configDir || process.env.PORTFOLIO_CONFIG_DIR || resolve(appDir,'src/config');
  const input={} as ConfigInput;
  for(const file of Object.keys(schemas) as (keyof ConfigInput)[]) {
    try { input[file]=JSON.parse(readFileSync(resolve(configDir,`${file}.json`),'utf8')); }
    catch { throw new Error(`${file}.json:$: Cannot read valid JSON configuration`); }
  }
  return validatePortfolio(input,{publicDir:options.publicDir||resolve(appDir,'public'),contentDir:options.contentDir||resolve(appDir,'src/content')});
}
export function deriveContent(config: Portfolio) {
  const populated={about:!!(config.profile.biography||config.experience.length||config.education.length),project:config.projects.length>0,service:!!(config.services.length||config.skills.length),contact:!!config.profile.email};
  const sections=config.site.sections.filter(s=>s.visible&&populated[s.id]);
  const visible=new Set(sections.map(s=>s.id));
  return {sections,navigation:config.site.navigation.filter(n=>visible.has(n.id)),categories:[...new Set(config.projects.flatMap(p=>p.categories))],projectRoutes:config.projects.map(p=>({slug:p.slug,href:`/projects/${p.slug}/`})),featured:config.projects.filter(p=>p.featured)};
}
