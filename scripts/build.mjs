import fs from 'node:fs/promises';
import path from 'node:path';
import {loadPublishedContent,sourceDate} from './load-published-content.mjs';
import {createHash} from 'node:crypto';
import {routes,view,header,footer,esc} from '../src/views.js';
import {config} from '../src/config.js';
import {generateResume} from './generate-resume-pdf.mjs';
import {buildStyles} from './build-styles.mjs';
import {packageSite} from './package-site.mjs';
import {resolveSiteUrl} from './site-origin.mjs';
import {readPagePalettes} from './page-palettes.mjs';
const siteUrl=resolveSiteUrl();
const root=path.resolve(import.meta.dirname,'..');
const pagePalettes=await readPagePalettes();
const release=await loadPublishedContent();
const {content}=release;
await buildStyles();
const historyPath=path.join(root,'src/page-history.json');
const history=JSON.parse(await fs.readFile(historyPath,'utf8').catch(()=>'{}'));
const modifiedDate=new Date(Math.max(Date.parse(release.updatedAt),Date.parse(sourceDate()))).toISOString().slice(0,10);
await fs.mkdir(path.join(root,'outputs/release'),{recursive:true});
await fs.writeFile(path.join(root,'outputs/release/content.json'),JSON.stringify(release));
const structured=JSON.stringify({'@context':'https://schema.org','@type':'ProfilePage',mainEntity:{'@type':'Person',name:content.profile.name,jobTitle:'History & Social Science Educator',url:siteUrl,knowsAbout:['History','Social Science','English',...content.competencies.slice(0,4)]}}).replace(/</g,'\\u003c');
const structuredHash=createHash('sha256').update(structured).digest('base64');
for(const [route,meta] of Object.entries(routes)) {
 const depth=meta.path.endsWith('/')?meta.path.split('/').filter(Boolean).length:0;
 const base=route==='404'?new URL(siteUrl).pathname:depth?'../'.repeat(depth):'./';
 const target=meta.path.endsWith('/')||!meta.path?meta.path+'index.html':meta.path;
 const description=route==='home'?content.profile.summary:`${meta.title} — Krishna Mahato’s History and Social Science teaching portfolio.`;
  const meaningful=view(route,content,base,{release:true})+header(route,base,content)+footer(base,content);
 const hash=createHash('sha256').update(meaningful).digest('hex');
 if(history[route]?.hash!==hash)history[route]={hash,lastmod:modifiedDate};
 const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Krishna Mahato · ${meta.title}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="${pagePalettes[route].paper}"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-${structuredHash}'; style-src 'self'; img-src 'self' https:; connect-src 'self' ${config.url}; media-src 'self'; frame-src 'self' ${config.url}; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests"><link rel="canonical" href="${siteUrl+meta.path}"><meta property="og:title" content="Krishna Mahato · ${meta.title}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl+meta.path}"><meta property="og:image" content="${siteUrl}assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Krishna Mahato · ${meta.title}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${siteUrl}assets/og-image.jpg"><link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">${route==='home'?`<link rel="preload" as="image" href="${base}assets/hero-poster.webp" fetchpriority="high"><script src="${base}src/opening-boot.js?v=editorial-20261004"></script>`:''}<link rel="stylesheet" href="${base}src/styles.css?v=editorial-20261004"><noscript><link rel="stylesheet" href="${base}assets/no-script.css?v=editorial-20261004"></noscript>${['admin','404'].includes(route)?'<meta name="robots" content="noindex,nofollow">':''}${['home','profile'].includes(route)?`<script type="application/ld+json">${structured}</script>`:''}</head><body data-route="${route}" data-base="${base}">${header(route,base,content)}<main id="main" tabindex="-1" itemscope itemtype="https://schema.org/Person"><meta itemprop="name" content="Krishna Mahato"><meta itemprop="url" content="${siteUrl}">${view(route,content,base,{release:true})}</main>${footer(base,content)}<script type="module" src="${base}src/app.js?v=editorial-20261004"></script></body></html>`;
 await fs.mkdir(path.dirname(path.join(root,target)),{recursive:true});await fs.writeFile(path.join(root,target),html.replace(/[ \t]+$/gm,''));
}
await fs.writeFile(path.join(root,'.nojekyll'),'');
await fs.writeFile(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
await fs.writeFile(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.entries(routes).filter(([r])=>!['admin','404'].includes(r)).map(([key,r])=>`<url><loc>${siteUrl+r.path}</loc><lastmod>${history[key].lastmod}</lastmod></url>`).join('')}</urlset>`);
console.log(`Built ${Object.keys(routes).length} complete static pages. No client framework or remote scripts required.`);
await fs.writeFile(historyPath,JSON.stringify(history,null,2)+'\n');
await generateResume(content,{updatedAt:release.updatedAt,siteUrl});

await packageSite({siteUrl});
