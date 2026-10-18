import {test,expect} from 'vitest';
import {storyBlocks} from './story';
test('global heading labels change headings only; project labels take precedence',()=>{
 const source='## Problem\n\nProblem\n\n## Custom heading';
 expect(storyBlocks(source,{Problem:'Purpose & Goals'},{Problem:'Skills Showcase'})).toEqual([
  {heading:true,text:'Skills Showcase'},{heading:false,text:'Problem'},{heading:true,text:'Custom heading'}
 ]);
 expect(storyBlocks('## Problem',{Problem:'Purpose & Goals'})[0].text).toBe('Purpose & Goals');
 expect(storyBlocks('## Problem')[0].text).toBe('Problem');
});
test('unconfigured headings do not resolve inherited object properties',()=>{
 expect(storyBlocks('## constructor\n\n## toString').map(b=>b.text)).toEqual(['constructor','toString']);
});
