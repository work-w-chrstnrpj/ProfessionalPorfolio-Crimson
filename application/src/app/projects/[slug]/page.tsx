import {notFound} from 'next/navigation';
import {loadPortfolio} from '../../../lib/config';
import {pageMetadata} from '../../../lib/seo';
import {readStory,storyBlocks} from '../../../lib/story';
import {AuxiliaryPage} from '../../../components/AuxiliaryPage';
import {ProjectPreview,isInlinePreview} from '../../../components/ProjectPreview';
import {ArrowIcon} from '../../../components/primitives';
export const dynamicParams=false;
export const dynamic='force-static';
export function generateStaticParams(){
 const projects=loadPortfolio().projects;
 // Next static export requires one parameter even when no projects exist. This
 // reserved non-configurable slug resolves to notFound; finalize-export removes
 // that generated artifact before publication.
 return projects.length?projects.map(p=>({slug:p.slug})):[{slug:'_empty'}];
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const config=loadPortfolio(),{slug}=await params,p=config.projects.find(p=>p.slug===slug);
 if(!p)notFound();
 return pageMetadata(config,`${p.title} | ${config.site.title}`,p.summary,`/projects/${p.slug}/`);
}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
 const config=loadPortfolio(),{slug}=await params,p=config.projects.find(p=>p.slug===slug);
 if(!p)notFound();
 const copy=config.site.copy.auxiliary;
 return <AuxiliaryPage config={config} kicker={p.categories.join(' / ')} title={p.title} lead={p.summary}>
  <ProjectPreview project={p} placeholder={config.site.copy.projectPreview} videoLabel={copy.video} transcriptLabel={copy.transcript} language={config.site.language}/>
  <dl className="project-facts"><div><dt>{copy.role}</dt><dd>{p.role}</dd></div><div><dt>{copy.status}</dt><dd>{p.status}</dd></div><div><dt>{copy.stack}</dt><dd>{p.stack.join(' · ')}</dd></div></dl>
  {p.caseStudy&&<article className="story-content">{storyBlocks(readStory(p.caseStudy),copy.caseStudyHeadings,p.caseStudyHeadings).map((b,i)=>b.heading?<h2 key={i}>{b.text}</h2>:<p key={i}>{b.text}</p>)}</article>}
  {p.screenshots.length>0&&<section className="detail-gallery" aria-label={copy.evidence}>{p.screenshots.map(image=><figure key={image.src}><img src={image.src} alt={image.alt} width={image.width} height={image.height}/><figcaption>{image.alt}</figcaption></figure>)}</section>}
  <nav className="detail-actions" aria-label={copy.evidence}>{p.repository&&<a className="action" href={p.repository} target="_blank" rel="noreferrer">{copy.source}<ArrowIcon/></a>}{p.live&&<a className="action action-secondary" href={p.live} target="_blank" rel="noreferrer">{copy.live}<ArrowIcon/></a>}{!p.showcase&&p.video&&!isInlinePreview(p.video.url)&&<><a className="action action-secondary" href={p.video.url} target="_blank" rel="noreferrer">{copy.video}<ArrowIcon/></a><a className="project-action" href={p.video.transcript}>{copy.transcript}</a></>}</nav>
  <a className="project-action" href={config.site.sections.some(s=>s.id==='project'&&s.visible)?'/#project':'/'}>{config.site.copy.allProjects}<ArrowIcon/></a>
 </AuxiliaryPage>;
}
