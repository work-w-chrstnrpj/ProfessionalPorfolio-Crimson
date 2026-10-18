import { expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from './page';
import { loadPortfolio } from '../lib/config';
test('static homepage exposes configured hero, actions and section targets without browser APIs', () => {
  const config=loadPortfolio(), html=renderToStaticMarkup(<Home />);
  expect(html).toContain('<main id="content"');
  expect(html).toContain(config.profile.hero.headline[0]);
  expect(html).toContain('href="/#project"');
  expect(html).toContain('id="contact"');
});
