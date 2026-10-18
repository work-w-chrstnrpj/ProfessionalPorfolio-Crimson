import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { loadPortfolio } from '../lib/config';
import type { CSSProperties } from 'react';
import './globals.css';
import { themeVariables } from '../lib/theme';
import { pageMetadata } from '../lib/seo';
export function generateMetadata(): Metadata {
  const { site } = loadPortfolio();
  return pageMetadata(loadPortfolio(),site.title,site.description,'/');
}
export default function RootLayout({ children }: { children: ReactNode }) {
  const { site, theme } = loadPortfolio();
  const variables=themeVariables(theme);
  return <html lang={site.language}><body style={variables as CSSProperties}>{children}</body></html>;
}
