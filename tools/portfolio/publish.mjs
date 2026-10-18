import {readFile,writeFile,readdir,lstat,mkdir,copyFile,unlink,realpath} from 'node:fs/promises';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const manifestName='.portfolio-deployment.json';
const hash=data=>createHash('sha256').update(data).digest('hex');
const protectedPath=p=>p.split('/').some(part=>part.startsWith('.')&&part!=='.nojekyll')||['CNAME','README.md'].includes(p.split('/')[0]);
function safePath(p){if(typeof p!=='string'||!p||isAbsolute(p)||p.includes('\\')||p.split('/').some(x=>!x||x==='.'||x==='..')||protectedPath(p))throw Error(`Unsafe/protected generated path: ${p}`);return p;}
async function exists(p){try{return await lstat(p);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function walk(root,dir=root){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isSymbolicLink())throw Error('Export symlinks are not allowed');if(entry.isDirectory())files.push(...await walk(root,path));else if(entry.isFile())files.push(relative(root,path).split('\\').join('/'));else throw Error('Unsupported export entry');}return files.sort();}
async function checkParents(root,path){let current=root;for(const part of path.split('/')){current=resolve(current,part);const info=await exists(current);if(info?.isSymbolicLink())throw Error(`Destination symlink: ${path}`);}}
export async function preparePublication({source,destination,revision,repository='local',dryRun=false}){
 if(!/^[a-f0-9]{40}$/.test(revision||''))throw Error('A full source Git revision is required');
 source=await realpath(source);destination=await realpath(destination);
 if(source===destination||source.startsWith(destination+'/')||destination.startsWith(source+'/'))throw Error('Export and destination must be separate');
 if(!(await exists(resolve(destination,'.git'))))throw Error('Destination must be a Git checkout');
 const manifestPath=resolve(destination,manifestName);await checkParents(destination,manifestName);
 const old=await exists(manifestPath)?JSON.parse(await readFile(manifestPath,'utf8')):{generatedFiles:[]};
 if(!Array.isArray(old.generatedFiles))throw Error('Invalid deployment manifest');
 const previous=new Map();for(const entry of old.generatedFiles){safePath(entry.path);if(!/^[a-f0-9]{64}$/.test(entry.sha256||''))throw Error('Invalid manifest hash');previous.set(entry.path,entry.sha256);}
 const files=await walk(source);if(!files.includes('index.html')||!files.includes('404.html'))throw Error('Missing export index/404');
 const next=new Map();for(const path of files){safePath(path);if(path.endsWith('.map')||path.split('/').includes('node_modules'))throw Error(`Unexpected export: ${path}`);next.set(path,hash(await readFile(resolve(source,path))));}next.set('.nojekyll',hash(''));
 const stale=[...previous.keys()].filter(p=>!next.has(p));
 // Validate everything before mutating. Unknown repository-owned files must survive.
 for(const path of new Set([...next.keys(),...stale])){
  await checkParents(destination,path);const target=resolve(destination,path),info=await exists(target);
  if(info&&!info.isFile())throw Error(`Destination conflict: ${path}`);
  if(info&&!previous.has(path)&&path!=='.nojekyll')throw Error(`Unmanaged destination collision: ${path}`);
  if(info&&previous.has(path)&&hash(await readFile(target))!==previous.get(path))throw Error(`Modified generated file: ${path}`);
 }
 const result={sourceRepository:repository,sourceRevision:revision,generatedFiles:[...next].map(([path,sha256])=>({path,sha256})),removed:stale,dryRun};
 if(dryRun)return result;
 for(const path of stale)if(await exists(resolve(destination,path)))await unlink(resolve(destination,path));
 for(const path of next.keys()){const target=resolve(destination,path);await mkdir(dirname(target),{recursive:true});if(path==='.nojekyll')await writeFile(target,'');else await copyFile(resolve(source,path),target);}
 const {removed,dryRun:_,...manifest}=result;await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);const arg=name=>args[args.indexOf(name)+1];
 try{const result=await preparePublication({source:arg('--source'),destination:arg('--destination'),revision:arg('--revision'),repository:arg('--repository'),dryRun:args.includes('--dry-run')});console.log(`${result.dryRun?'Dry run':'Prepared'}: ${result.generatedFiles.length} generated files; ${result.removed.length} stale files.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
