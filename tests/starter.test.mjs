import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const json=name=>JSON.parse(readFileSync(`application/src/config/${name}.json`,'utf8'));
test('starter ships only fictional identity and placeholder assets with outbound features disabled',()=>{
 assert.equal(json('profile').name,'Crimson');
 assert.equal(json('profile').email,'hello@example.com');
 assert.equal(json('site').url,'https://example.com');
 assert.equal(json('contact').enabled,false);
 assert.equal(json('profile').resume.available,false);
 assert.equal(json('profile').resume.path,undefined);
 assert.deepEqual(readdirSync('application/public/media').sort(),['example-avatar.svg','portrait-placeholder.svg']);
 for(const p of json('projects'))assert.ok(p.repository.startsWith('https://example.com/'));
 const workflow=readFileSync('.github/workflows/ci.yml','utf8');
 assert.ok(!workflow.includes('PAGES_DEPLOY_KEY'));
 assert.ok(!workflow.includes('git push'));
});
