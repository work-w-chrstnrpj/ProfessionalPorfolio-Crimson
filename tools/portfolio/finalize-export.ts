import {rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadPortfolio} from '../../application/src/lib/config';
// Next requires a parameter for an exported dynamic route even with no records.
// Remove only our reserved generated 404 artifact; never publish a fake project.
if(loadPortfolio().projects.length===0){
 rmSync(fileURLToPath(new URL('../../application/out/projects/_empty/',import.meta.url)),{recursive:true,force:true});
}
