import type {Portfolio} from '../lib/config';
import {SystemMotif} from './SectionHeading';
export function isInlinePreview(url:string){return /\.(mp4|webm)$/i.test(new URL(url,'https://preview.invalid').pathname);}
export function ProjectPreview({project,placeholder,videoLabel,transcriptLabel,language}:{project:Portfolio['projects'][number];placeholder:string;videoLabel:string;transcriptLabel:string;language:string}){
 const video=project.video,image=video?.poster||project.screenshots[0];
 return <div className="project-preview">
  <div className="project-media">
   {video&&isInlinePreview(video.url)?<video controls playsInline preload="none" poster={video.poster.src} aria-label={`${project.title} — ${videoLabel}`}>
    <source src={video.url} type={new URL(video.url,'https://preview.invalid').pathname.toLowerCase().endsWith('.webm')?'video/webm':'video/mp4'}/>
    {video.captions&&<track kind="captions" src={video.captions} srcLang={language} label={language} default/>}
    <a href={video.url}>{videoLabel}</a>
   </video>:video?<a href={video.url} target="_blank" rel="noreferrer"><img src={video.poster.src} alt={video.poster.alt} width={video.poster.width} height={video.poster.height}/><span className="preview-label">{videoLabel}</span></a>:image?<img src={image.src} alt={image.alt} width={image.width} height={image.height}/>:<><SystemMotif/><p>{placeholder}</p></>}
  </div>
  {video&&isInlinePreview(video.url)&&<a className="project-action" href={video.transcript}>{transcriptLabel}</a>}
 </div>;
}
