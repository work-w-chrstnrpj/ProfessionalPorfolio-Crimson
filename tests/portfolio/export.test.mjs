import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const root = new URL('../../application/out/', import.meta.url);
test('production export contains renderable HTML, a 404, and resolvable local assets', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /<main\b/);
  assert.match(html, /<h1>/);
  await access(new URL('404.html', root));
  const assets = [...html.matchAll(/(?:src|href)="(\/_next\/[^"?]+)(?:[^"<>]*)"/g)].map(m => m[1]);
  assert.ok(assets.length > 0, 'Expected exported Next assets');
  for (const path of new Set(assets)) await access(new URL('.' + path, root));
  assert.doesNotMatch(html, /localhost:3001|api\/repos|turnstile/i);
});
