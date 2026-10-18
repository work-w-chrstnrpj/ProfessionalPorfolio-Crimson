import type { Portfolio } from '../lib/config';
export function Wordmark({ profile }: { profile: Portfolio['profile'] }) {
  return <a className="wordmark" href="/" aria-label={`${profile.name} — Home`}><span>{profile.wordmark[0]}</span>{profile.wordmark.slice(1)}</a>;
}
export function ArrowIcon({ down=false }: { down?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="arrow-icon"><path d={down?'M10 3.5v13m-5-5 5 5 5-5':'M3.333 10h12.5m-5-5 5 5-5 5'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function ActionLink({ label, section, secondary=false, visible }: { label:string; section:string; secondary?:boolean; visible:string[] }) {
  if(!visible.includes(section))return null;
  return <a className={`action${secondary?' action-secondary':''}`} href={`/#${section}`}>{label}<ArrowIcon/></a>;
}
export function HeroWireframe() {
  return <svg className="hero-wireframe" xmlns="http://www.w3.org/2000/svg" width="310" height="335.833" viewBox="0 0 240 260" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M120 28 210 78 210 182 120 232 30 182 30 78Z M30 78 120 130 210 78 M120 130V232 M120 28V82L166 108 M75 104V158L120 184 165 158V104 M30 182 75 158 M210 182 165 158"/><path d="m45 87 75 43m-60-35 60 35m-45-26 45 26m-30-18 30 18"/></g></svg>;
}
