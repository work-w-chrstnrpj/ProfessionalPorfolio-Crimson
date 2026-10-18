'use client';
import { useRef, useState, useEffect } from 'react';
import type { Portfolio } from '../lib/config';
import { Wordmark } from './primitives';
export function Header({ profile, navigation, copy }: { profile:Portfolio['profile']; navigation:Portfolio['site']['navigation']; copy:Portfolio['site']['copy'] }) {
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>20);update();window.addEventListener('scroll',update,{passive:true});return ()=>window.removeEventListener('scroll',update);},[]);
  const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const main=document.getElementById('content');
    const skip=document.querySelector<HTMLElement>('.skip-link');
    const footer=document.querySelector<HTMLElement>('.site-footer');
    if(main)main.inert=true;
    if(skip)skip.inert=true;
    if(footer)footer.inert=true;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const wide=window.matchMedia('(min-width:1101px)');
    const resize=()=>{if(wide.matches)setOpen(false);};
    wide.addEventListener('change',resize);
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}};
    document.addEventListener('keydown',close);
    return ()=>{document.removeEventListener('keydown',close);wide.removeEventListener('change',resize);if(main)main.inert=false;if(skip)skip.inert=false;if(footer)footer.inert=false;document.body.style.overflow=previousOverflow;};
  },[open]);
  return <header className="site-header" data-scrolled={scrolled} data-menu-open={open}>
    <div className="header-inner"><Wordmark profile={profile}/>
      <nav className="desktop-navigation" aria-label="Primary">{navigation.map(n=><a key={n.id} href={`/#${n.id}`}>{n.label}</a>)}</nav>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?copy.menuClose:copy.menuOpen}</button>
    </div>
    <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile" hidden={!open}>
      <div className="mobile-menu-items">{navigation.map((n,i)=><div className="mobile-menu-item" key={n.id}><a href={`/#${n.id}`} onClick={()=>setOpen(false)}><span>{String(i+1).padStart(2,'0')}</span>{n.label}</a></div>)}<p>{copy.menuClosing}</p></div>
    </nav>
    <noscript><nav className="no-script-navigation" aria-label="Primary">{navigation.map(n=><a key={n.id} href={`/#${n.id}`}>{n.label}</a>)}</nav></noscript>
  </header>;
}
