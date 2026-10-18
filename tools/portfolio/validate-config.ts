import { loadPortfolio, deriveContent } from '../../application/src/lib/config';
const config=loadPortfolio();
const derived=deriveContent(config);
console.log(`Valid public config: ${config.projects.length} projects, ${derived.navigation.length} navigation links.`);
