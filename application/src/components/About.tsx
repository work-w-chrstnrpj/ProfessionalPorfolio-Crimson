import type { Portfolio } from '../lib/config';
import { SectionHeading, SystemMotif } from './SectionHeading';
import { SocialLinks } from './SocialLinks';
export function About({config}:{config:Portfolio}){
  const {profile,site,experience,education}=config;
  return <section className="portfolio-section about-section" id="about" aria-label={site.copy.about.kicker}>
    <SectionHeading copy={site.copy.about}/><SystemMotif className="about-motif"/>
    <p className="about-introduction">{profile.biography}</p>
    <div className="about-socials"><SocialLinks socials={profile.socials}/></div>
    {profile.expertise.length>0&&<div className="expertise-grid">{profile.expertise.map(e=><article className="expertise-card" key={e.id}><h3>{e.title}</h3><p>{e.tools}</p></article>)}</div>}
    {experience.length>0&&<div className="experience-block"><h3>{site.copy.experience}</h3><div className="experience-list">{experience.map(e=><article className="experience-row" key={e.id}>
      <p className="experience-date">{e.displayDates}</p><div className="experience-position"><h4>{e.title}</h4><p>{e.url?<a href={e.url}>{e.employer}</a>:e.employer}</p></div>
      <div className="experience-summary"><p>{e.description}</p>{e.highlights.length>0&&<ul>{e.highlights.map((h,i)=><li key={i}>{h}</li>)}</ul>}</div>
    </article>)}</div></div>}
    {education.length>0&&<div className="education-block"><h3>{site.copy.education}</h3><div className="education-list">{education.map(e=><article className="education-card" key={e.id} data-status={e.status}><h4>{e.qualification}</h4><p>{e.url?<a href={e.url}>{e.institution}</a>:e.institution}<br/>{e.description}</p></article>)}</div></div>}
  </section>;
}
