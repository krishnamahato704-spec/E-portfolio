import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateResume} from './render-resume.mjs';
export {generateResume};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateResume();
