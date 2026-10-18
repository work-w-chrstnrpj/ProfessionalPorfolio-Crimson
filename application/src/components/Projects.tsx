'use client';
import {useEffect,useState} from 'react';
import type {Portfolio} from '../lib/config';
import {ProjectMedia} from './ProjectPreview';
import {SectionHeading} from './SectionHeading';
import {ArrowIcon} from './primitives';
export function Projects({projects,copy,categories,language='en'}:{projects:Portfolio['projects'];copy:Portfolio['site']['copy'];categories:string[];language?:string}){
 const [category,setCategory]=useState('');
 const [enhanced,setEnhanced]=useState(false);
 useEffect(()=>setEnhanced(true),[]);
 const selected=projects.filter(p=>!category||p.categories.includes(category));
 return <section className="portfolio-section projects-section" id="project" aria-label={copy.project.kicker}>
  <SectionHeading copy={copy.project}/><p className="project-lead">{copy.project.lead}</p>
  {enhanced&&<details className="project-filter"><summary>{copy.allProjects}</summary><div className="filter-options" aria-label={copy.allProjects}><button type="button" aria-pressed={!category} onClick={()=>setCategory('')}>{copy.showAll}</button>{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div></details>}
  <div className="project-list">{selected.map(p=><article className="project-row" key={p.id} data-slug={p.slug} data-featured={p.featured}>
   <div className="project-card-preview"><ProjectMedia project={p} placeholder={copy.projectPreview} videoLabel={copy.auxiliary.video} transcriptLabel={copy.auxiliary.transcript} language={language} compact/></div>
   <div className="project-copy"><p className="project-attribution">{copy.projectAttribution}</p><h3>{p.title}</h3><p className="project-summary">{p.summary}</p><p className="project-stack">{p.stack.join(' / ')}</p><a className="project-action" href={`/projects/${p.slug}/`}>{copy.viewProject}<ArrowIcon/></a></div>
  </article>)}</div>
  {selected.length===0&&<div className="project-empty" role="status"><p>{copy.noProjects}</p><button type="button" className="action" onClick={()=>setCategory('')}>{copy.showAll}</button></div>}
 </section>;
}
