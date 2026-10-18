import type {Portfolio} from '../lib/config';
import {SectionHeading} from './SectionHeading';import {SocialLinks} from './SocialLinks';import {ContactForm} from './ContactForm';import {Wordmark} from './primitives';
export function Contact({config}:{config:Portfolio}){
 return <section className="portfolio-section contact-section" id="contact" aria-label={config.site.copy.contact.kicker}>
  <div className="contact-overview"><SectionHeading copy={config.site.copy.contact}/><p className="contact-invitation">{config.site.copy.contact.lead}</p><a className="contact-email" href={`mailto:${config.profile.email}`}>{config.profile.email}</a><div className="contact-socials"><SocialLinks socials={config.profile.socials}/></div></div>
  <ContactForm config={config.contact} accessKey={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY}/>
 </section>;
}
export function Footer({config}:{config:Portfolio}){
 return <footer className="site-footer"><div className="footer-rule"/><Wordmark profile={config.profile}/><p className="footer-copyright">© {new Date().getUTCFullYear()} {config.profile.name} · {config.site.copy.footer}</p><div className="footer-links"><SocialLinks socials={config.profile.socials}/><a href="/privacy/">{config.site.copy.privacy}</a></div></footer>;
}
