'use client';
import {useEffect,useRef,useState} from 'react';
import type {Project} from '../lib/config';

type Controller={destroy():void};
const stylesheets=new Map<string,Promise<void>>();
function loadStylesheet(href:string){
 let pending=stylesheets.get(href);
 if(!pending){
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;
  pending=new Promise<void>((resolve,reject)=>{
   link.onload=()=>resolve();
   link.onerror=()=>{stylesheets.delete(href);link.remove();reject(new Error('Showcase stylesheet unavailable'));};
  });
  stylesheets.set(href,pending);document.head.append(link);
 }
 return pending;
}

// Modules are reviewed local application code, never remote embeds or user uploads.
export function AnimatedShowcase({showcase,compact=false}:{showcase:NonNullable<Project['showcase']>;compact?:boolean}){
 const host=useRef<HTMLDivElement>(null);
 const [mounted,setMounted]=useState(false);
 useEffect(()=>{
  const element=host.current;
  if(!element)return;
  let disposed=false,started=false,controller:Controller|undefined;
  setMounted(false);
  const load=async()=>{
   if(started)return;
   started=true;
   try{
    const [module]=await Promise.all([
     import(/* webpackIgnore: true */ /* turbopackIgnore: true */ showcase.module),
     loadStylesheet(showcase.stylesheet)
    ]);
    if(disposed)return;
    if(typeof module.mountBravado!=='function')throw new Error('Missing mountBravado export');
    const instance=module.mountBravado(element,{aspectRatio:compact?'16 / 10':'16 / 9',displayMode:compact?'compact':'detail',controls:true});
    if(typeof instance?.destroy!=='function')throw new Error('Missing showcase cleanup');
    controller=instance;setMounted(true);
   }catch{
    if(!disposed){element.replaceChildren();setMounted(false);}
   }
  };
  const observer=typeof IntersectionObserver==='undefined'?undefined:new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){observer?.disconnect();void load();}
  },{rootMargin:'200px'});
  if(observer)observer.observe(element);else void load();
  return ()=>{disposed=true;observer?.disconnect();controller?.destroy();element.replaceChildren();};
 },[showcase.module,showcase.stylesheet,compact]);
 return <div className="animated-showcase" data-compact={compact} role="group" aria-label={showcase.label}>
  {!mounted&&<img src={showcase.poster.src} alt={showcase.poster.alt} width={showcase.poster.width} height={showcase.poster.height} loading="lazy"/>}
  <div ref={host}/>
 </div>;
}
