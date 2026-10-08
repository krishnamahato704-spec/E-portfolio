import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {routes} from '../src/view-helpers.js';
import {readPagePalettes} from './page-palettes.mjs';

const palettes=await readPagePalettes();
const luminance=hex=>{
 const rgb=hex.slice(1).match(/../g).map(part=>parseInt(part,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const ratio=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};
const results=[];
for(const route of Object.keys(routes)){
 const colors=palettes[route];assert.ok(colors,`Missing palette: ${route}`);
 for(const background of ['paper','surface-muted'])assert.ok(luminance(colors[background])>.8,`${route}: keep large backgrounds light`);
 const pairs=[...['ink','dark','muted','accent-hover'].flatMap(text=>['paper','surface-muted'].map(background=>[text,background])),['action','white'],['accent-hover','white']];
 for(const [text,background] of pairs){
  const contrast=ratio(colors[text],background==='white'?'#ffffff':colors[background]);
  results.push({route,text,background,ratio:Number(contrast.toFixed(2))});
  assert.ok(contrast>=4.5,`${route}: ${text} on ${background} has ${contrast.toFixed(2)}:1 contrast; 4.5:1 required`);
 }
}
assert.equal(new Set(Object.values(palettes).map(x=>x['surface-muted'])).size,Object.keys(routes).length,'Every route has its own light surface color');
await fs.mkdir('output/portfolio-design-review',{recursive:true});
await fs.writeFile('output/portfolio-design-review/palette-contrast.json',JSON.stringify(results,null,2));
console.log(`${results.length}/${results.length} text/button contrast pairs passed at 4.5:1 or higher across ${Object.keys(palettes).length} light page palettes.`);
