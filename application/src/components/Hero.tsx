import type { Portfolio } from '../lib/config';
import { ActionLink, HeroWireframe } from './primitives';
export function Hero({profile, visible}:{profile:Portfolio['profile'];visible:string[]}) {
  const hero=profile.hero;
  return <section className="hero" aria-label={profile.name}>
    <div className="hero-stage">
      <div className="desktop-art" aria-hidden="true"><div className="hero-glow"/><HeroWireframe/></div>
      <div className="hero-copy">
        <p className="hero-positioning"><span className="desktop-positioning">{hero.positioning}</span><span className="mobile-positioning">{hero.mobilePositioning}</span></p>
        <h1><span className="desktop-headline">{hero.headline.map((line,i)=><span key={i}>{line}</span>)}</span><span className="mobile-headline">{hero.mobileHeadline.map((line,i)=><span key={i}>{line}</span>)}</span></h1>
        <div className="hero-rule"/>
        <p className="hero-introduction">{hero.introduction}</p>
        <div className="hero-actions"><ActionLink {...hero.primary} visible={visible}/><ActionLink {...hero.secondary} secondary visible={visible}/></div>
      </div>
      {profile.portrait&&<div className="hero-portrait"><div className="mobile-glow"/>
        {/* Local image pre-optimized at build preparation; static Pages needs no image service. */}
        <img src={profile.portrait.src} alt={profile.portrait.alt} width={profile.portrait.width} height={profile.portrait.height} fetchPriority="high"/>
        <div className="portrait-fade"/>
      </div>}
      <div className="portrait-caption"><p>{profile.fullName.toUpperCase()}</p><p>{hero.portraitCaption}</p></div>
    </div>
    {hero.disciplines.length>0&&<div className="discipline-band">{hero.disciplines.map((d,i)=><div className="discipline" key={d.id}><div><span>{String(i+1).padStart(2,'0')}</span><h2>{d.title}</h2></div><p>{d.description}</p></div>)}</div>}
  </section>;
}
