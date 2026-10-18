import {test,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ProjectPreview} from './ProjectPreview';
import {loadPortfolio} from '../lib/config';
const project=loadPortfolio().projects[0];
const render=(p=project)=>renderToStaticMarkup(<ProjectPreview project={p} placeholder="Preview coming next" videoLabel="Watch demo" transcriptLabel="Read transcript" language="en"/>);
const poster={src:'/media/poster.webp',alt:'Approved demo poster',width:1600,height:900,provenance:'Synthetic test'};
test('missing media shows the homepage motif and placeholder without playback controls',()=>{const html=render();expect(html).toContain('Preview coming next');expect(html).toContain('<svg');expect(html).not.toContain('<video');});
test('local preview uses an explicit player, poster and transcript without autoplay or preloading',()=>{const html=render({...project,video:{url:'/media/preview.mp4',poster,transcript:'/media/transcript.txt',captions:'/media/captions.vtt'}});expect(html).toContain('<video');expect(html).toContain('controls=""');expect(html).toContain('preload="none"');expect(html).toContain('poster="/media/poster.webp"');expect(html).toContain('kind="captions"');expect(html).toContain('Read transcript');expect(html).not.toContain('autoPlay');expect(html).not.toContain('autoplay');});
test('external video pages use a poster link without loading a third-party embed',()=>{const html=render({...project,video:{url:'https://www.youtube.com/watch?v=example',poster,transcript:'/media/transcript.txt'}});expect(html).toContain('Watch demo');expect(html).toContain('Approved demo poster');expect(html).not.toContain('<video');expect(html).not.toContain('<iframe');});

test('a configured screenshot replaces the placeholder',()=>{const html=render({...project,screenshots:[poster]});expect(html).toContain('Approved demo poster');expect(html).not.toContain('Preview coming next');});

test('standalone poster works without a video or screenshot gallery',()=>{
 const html=render({...project,poster});expect(html).toContain('Approved demo poster');expect(html).not.toContain('<video');expect(html).not.toContain('Preview coming next');
});
test('showcase takes precedence over video and exposes a no-JS poster',()=>{
 const html=render({...project,showcase:{module:'/media/demo/bravado.js',stylesheet:'/media/demo/bravado.css',label:'Example animated showcase',poster},video:{url:'/media/demo.mp4',poster,transcript:'/media/demo.txt'}});
 expect(html).toContain('Example animated showcase');expect(html).toContain('Approved demo poster');expect(html).not.toContain('<video');expect(html).not.toContain('<iframe');
});
