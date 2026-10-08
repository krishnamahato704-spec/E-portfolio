import fs from 'node:fs/promises';

// CSS is the palette source for both browser chrome and contrast checks.
export async function readPagePalettes(){
 const css=await fs.readFile(new URL('../src/styles/page-palettes.css',import.meta.url),'utf8');
 return Object.fromEntries([...css.matchAll(/body\[data-route="([^"]+)"\]\s*\{([^}]+)\}/g)].map(([,route,body])=>[
  route,Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map(([,key,value])=>[key,value]))
 ]));
}
