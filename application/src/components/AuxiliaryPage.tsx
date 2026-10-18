import type {ReactNode} from 'react';
import type {Portfolio} from '../lib/config';
import {deriveContent} from '../lib/config';
import {Header} from './Header';
import {Footer} from './Contact';
export function AuxiliaryPage({config,kicker,title,lead,children}:{config:Portfolio;kicker:string;title:string;lead?:string;children:ReactNode}){
 return <div className="site-frame"><a className="skip-link" href="#content">{config.site.copy.skip}</a><Header profile={config.profile} navigation={deriveContent(config).navigation} copy={config.site.copy}/><main id="content" className="auxiliary-page" tabIndex={-1}><p className="section-kicker">{kicker}</p><h1>{title}</h1>{lead&&<p className="auxiliary-lead">{lead}</p>}{children}</main><Footer config={config}/></div>;
}
