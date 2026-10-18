import type {MetadataRoute} from 'next';
import {loadPortfolio} from '../lib/config';
import {indexable} from '../lib/seo';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{const c=loadPortfolio();return {rules:{userAgent:'*',...(indexable()?{allow:'/'}:{disallow:'/'})},sitemap:new URL('/sitemap.xml',c.site.url).href};}
