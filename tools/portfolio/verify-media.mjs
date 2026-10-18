// Build a disposable media configuration; never alter the starter's default content.
import {cpSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from '@playwright/test';
const root=resolve(import.meta.dirname,'../..');
const artifacts=resolve(root,'.artifacts');mkdirSync(artifacts,{recursive:true});
const configDir=mkdtempSync(resolve(artifacts,'media-config-'));
const publicRoot=resolve(root,'application/public/media');
const assets=mkdtempSync(resolve(publicRoot,'test-showcase-'));
const media=`/media/${assets.split('/').at(-1)}`;
const run=(command,args,env={})=>{const result=spawnSync(command,args,{cwd:root,stdio:'inherit',env:{...process.env,...env}});if(result.status!==0)throw new Error(`${command} failed (${result.status})`);};
let failed=false;
try{
 cpSync(resolve(root,'application/src/config'),configDir,{recursive:true});
 cpSync(resolve(root,'tests/fixtures/showcase'),assets,{recursive:true});
 writeFileSync(resolve(assets,'transcript.txt'),'Synthetic silent color animation.');
 writeFileSync(resolve(assets,'captions.vtt'),'WEBVTT\n\n00:00.000 --> 00:00.300\nSynthetic silent color animation.\n');
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage();
  const bytes=await page.evaluate(async()=>{
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
   const stream=canvas.captureStream(10),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
   recorder.ondataavailable=e=>chunks.push(e.data);
   const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start();
   const context=canvas.getContext('2d');context.fillStyle='#303c35';context.fillRect(0,0,160,90);
   await new Promise(resolve=>setTimeout(resolve,300));recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());
   return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
  });
  writeFileSync(resolve(assets,'demo.webm'),Buffer.from(bytes));
 }finally{await browser.close();}
 const projects=JSON.parse(readFileSync(resolve(configDir,'projects.json'),'utf8'));
 const poster={src:`${media}/poster.svg`,alt:'Synthetic preview poster',width:640,height:360,provenance:'Locally authored synthetic test asset'};
 projects[0].showcase={module:`${media}/bravado.js`,stylesheet:`${media}/bravado.css`,label:'Synthetic animated showcase',poster};
 projects[1].video={url:`${media}/demo.webm`,poster,transcript:`${media}/transcript.txt`,captions:`${media}/captions.vtt`};
 projects[2].poster=poster;
 projects[3].video={url:'https://example.com/watch-demo',poster,transcript:`${media}/transcript.txt`};
 writeFileSync(resolve(configDir,'projects.json'),JSON.stringify(projects,null,2));
 run('npm',['run','build'],{PORTFOLIO_CONFIG_DIR:configDir});
 run('npx',['playwright','test','--config','playwright.media.config.ts']);
}catch(error){console.error(error.message);failed=true;}
finally{
 rmSync(assets,{recursive:true,force:true});rmSync(configDir,{recursive:true,force:true});
 try{run('npm',['run','build'],{PORTFOLIO_CONFIG_DIR:resolve(root,'application/src/config')});}catch(error){console.error(error.message);failed=true;}
}
if(failed)process.exitCode=1;
