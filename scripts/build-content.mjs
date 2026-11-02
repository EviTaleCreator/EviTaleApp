import {buildContent} from '../lib/content.mjs';
const result=await buildContent();
console.log(`Paruošta ${result.published} viešų pasakų. Juodraščiai (${result.drafts}) neįtraukti į svetainę.`);
