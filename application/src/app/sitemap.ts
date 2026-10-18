import type {MetadataRoute} from 'next';
import {loadPortfolio} from '../lib/config';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const c=loadPortfolio();return ['/','/privacy/',...c.projects.map(p=>`/projects/${p.slug}/`)].map(path=>({url:new URL(path,c.site.url).href}));}
