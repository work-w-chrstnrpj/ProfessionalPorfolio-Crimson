import type {Portfolio} from '../lib/config';
import {SectionHeading} from './SectionHeading';
import {ActionLink,ArrowIcon} from './primitives';
export function ResumeAction({resume}:{resume:Portfolio['profile']['resume']}){
 return <div className="resume-action">{resume.available&&resume.path?<a className="action" href={resume.path} download>{resume.label}<ArrowIcon down/></a>:<button className="action" type="button" disabled aria-describedby={resume.note?'resume-note':undefined}>{resume.label}<ArrowIcon down/></button>}{resume.note&&<p id="resume-note">{resume.note}</p>}</div>;
}
export function Services({config,visible}:{config:Portfolio;visible:string[]}){
 const {site,services,skills,profile}=config;
 return <section className="portfolio-section services-section" id="service" aria-label={site.copy.service.kicker}>
  <SectionHeading copy={site.copy.service}/><p className="service-lead">{site.copy.service.lead}</p>
  {services.length>0&&<div className="services-grid">{services.map((s,i)=><article className="service-card" key={s.id} data-icon={s.icon}><p className="service-index">{String(i+1).padStart(2,'0')}  /</p><h3>{s.title}</h3><p className="service-description">{s.description}</p><p className="service-scope">{s.scope}</p>{s.action&&<ActionLink {...s.action} visible={visible}/>}</article>)}</div>}
  <div className="service-cta"><ActionLink {...site.copy.discuss} visible={visible}/></div>
  {skills.length>0&&<div className="skills-block"><h3>{site.copy.skills}</h3><p className="skills-lead">{site.copy.skillsLead}</p><div className="skills-list">{skills.map(s=><article className="skill-card" key={s.id}><h4>{s.title}</h4><p>{s.technologies.join(' · ')}</p></article>)}</div><ResumeAction resume={profile.resume}/></div>}
 </section>;
}
