import { loadPortfolio, deriveContent } from '../lib/config';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Projects } from '../components/Projects';
import { Services } from '../components/Services';
import { Contact, Footer } from '../components/Contact';
export default function Home() {
  const config=loadPortfolio(), content=deriveContent(config);
  return <div className="site-frame">
    <a className="skip-link" href="#content">{config.site.copy.skip}</a>
    <Header profile={config.profile} navigation={content.navigation} copy={config.site.copy}/>
    <main id="content" tabIndex={-1}><Hero profile={config.profile} visible={content.sections.map(s=>s.id)}/>
      {content.sections.map(s=>s.id==='about'?<About key={s.id} config={config}/>:s.id==='project'?<Projects key={s.id} projects={config.projects} categories={content.categories} copy={config.site.copy}/>:s.id==='service'?<Services key={s.id} config={config} visible={content.sections.map(s=>s.id)}/>:s.id==='contact'?<Contact key={s.id} config={config}/>:null)}
    </main><Footer config={config}/>
  </div>;
}
