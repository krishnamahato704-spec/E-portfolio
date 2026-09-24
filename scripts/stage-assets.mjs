import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

// assets/ is the single tracked source; public/assets is a generated Vite input.
const generated = path.resolve('public/assets');
if (generated !== path.join(path.resolve(import.meta.dirname, '..'), 'public', 'assets')) throw new Error('Unexpected generated asset path');
await rm(generated, { recursive: true, force: true });
await mkdir(generated, { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
// Keep old direct URLs working without tracking a second copy of each file.
for (const [alias, source] of Object.entries({
  'hero-video.mp4':'hero-video-opt.mp4',
  'certificate-5.webp':'evidence/diksha-ai.webp',
  'certificate-6.webp':'evidence/nptel-writing.webp',
  'certificate-7.webp':'evidence/suraasa-linkedin.webp',
  'certificate-8.webp':'evidence/gemini-badge.webp',
  'amity-ntcc-community-work-report.pdf':'evidence/ntcc-community-report.pdf',
  'roots-to-wings-iks-presentation.pdf':'evidence/rootedness-iks.pdf',
})) await cp(`assets/${source}`, `public/assets/${alias}`);
