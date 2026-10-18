import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
// Config validation confines referenced files to content/. Render this small Markdown
// subset as React text; HTML, links and executable Markdown are never interpreted.
export function readStory(path:string):string {
 const appDir=existsSync(resolve(process.cwd(),'src/config'))?process.cwd():resolve(process.cwd(),'application');
 return readFileSync(resolve(appDir,'src/content',path),'utf8');
}
export function storyBlocks(source:string,defaults:Record<string,string>={},overrides:Record<string,string>={}) {
 const labels={...defaults,...overrides};
 return source.split(/\n\s*\n/).map(block=>block.trim()).filter(Boolean).map(block=>{
  const heading=/^##\s+/.test(block),text=block.replace(/^##\s+/,'');
  return {heading,text:heading&&Object.hasOwn(labels,text)?labels[text]:text};
 });
}
