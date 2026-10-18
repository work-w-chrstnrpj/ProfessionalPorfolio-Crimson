import type { Metadata } from 'next';
import type { Portfolio } from './config';
export const indexable = () => process.env.PORTFOLIO_INDEXABLE === 'true';
export function pageMetadata(config:Portfolio, title:string, description:string, path:string):Metadata {
 const url=new URL(path,config.site.url).href;
 const image=config.site.socialImage;
 return {title,description,metadataBase:new URL(config.site.url),alternates:{canonical:url},robots:{index:indexable(),follow:indexable()},openGraph:{type:'website',title,description,url,siteName:config.site.title,...(image?{images:[{url:image.src,width:image.width,height:image.height,alt:image.alt}]}:{})},twitter:{card:image?'summary_large_image':'summary',title,description,...(image?{images:[image.src]}:{})}};
}
