import type {Portfolio} from '../lib/config';
import {AnimatedShowcase} from './AnimatedShowcase';
import {SystemMotif} from './SectionHeading';
export function isInlinePreview(url:string){return /\.(mp4|webm)$/i.test(new URL(url,'https://preview.invalid').pathname);}
export function ProjectMedia({project,placeholder,videoLabel,transcriptLabel,language,compact=false}:{project:Portfolio['projects'][number];placeholder:string;videoLabel:string;transcriptLabel:string;language:string;compact?:boolean}){
 const video=project.video,image=video?.poster||project.poster||project.screenshots[0];
 if(project.showcase)return <div className="project-showcase"><AnimatedShowcase showcase={project.showcase} compact={compact}/></div>;
 return <>
  <div className="project-media">
   {video&&isInlinePreview(video.url)?<video controls playsInline preload="none" poster={video.poster.src} aria-label={`${project.title} — ${videoLabel}`}>
    <source src={video.url} type={new URL(video.url,'https://preview.invalid').pathname.toLowerCase().endsWith('.webm')?'video/webm':'video/mp4'}/>
    {video.captions&&<track kind="captions" src={video.captions} srcLang={language} label={language} default/>}
    <a href={video.url}>{videoLabel}</a>
   </video>:video?<a href={video.url} target="_blank" rel="noreferrer"><img src={video.poster.src} alt={video.poster.alt} loading="lazy" width={video.poster.width} height={video.poster.height}/><span className="preview-label">{videoLabel}</span></a>:image?<img src={image.src} alt={image.alt} loading="lazy" width={image.width} height={image.height}/>:<><SystemMotif/><p>{placeholder}</p></>}
  </div>
  {video&&isInlinePreview(video.url)&&<a className="project-action" href={video.transcript}>{transcriptLabel}</a>}
 </>;
}
export function ProjectPreview(props:Parameters<typeof ProjectMedia>[0]){
 return <div className="project-preview"><ProjectMedia {...props}/></div>;
}
