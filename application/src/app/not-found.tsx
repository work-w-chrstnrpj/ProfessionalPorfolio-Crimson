import {loadPortfolio} from '../lib/config';
import {AuxiliaryPage} from '../components/AuxiliaryPage';
export default function NotFound(){const config=loadPortfolio(),copy=config.site.copy.auxiliary;return <AuxiliaryPage config={config} kicker="404" title={copy.notFoundTitle} lead={copy.notFoundLead}><a className="action" href="/">{config.site.copy.home}</a></AuxiliaryPage>;}
