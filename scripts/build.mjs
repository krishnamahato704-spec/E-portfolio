import fs from 'node:fs/promises';
import path from 'node:path';
import {defaultContent} from '../src/content.js?v=recruiter-20260912';
import {routes,view,header,footer,esc} from '../src/views.js';
import {config} from '../src/config.js';
const root=path.resolve(import.meta.dirname,'..');
for(const [route,meta] of Object.entries(routes)) {
 const depth=meta.path.endsWith('/')?meta.path.split('/').filter(Boolean).length:0;
 const base=route==='404'?'/E-portfolio/':depth?'../'.repeat(depth):'./';
 const target=meta.path.endsWith('/')||!meta.path?meta.path+'index.html':meta.path;
 const description=route==='home'?defaultContent.profile.summary:`${meta.title} — Krishna Mahato’s History and Social Science teaching portfolio.`;
 const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Krishna Mahato · ${meta.title}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#692b36"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https:; connect-src 'self' ${config.url}; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests"><link rel="canonical" href="${config.canonical+meta.path}"><meta property="og:title" content="Krishna Mahato · ${meta.title}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${config.canonical+meta.path}"><meta property="og:image" content="${config.canonical}assets/portrait.webp"><meta name="twitter:card" content="summary"><link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${base}src/styles.css?v=recruiter-20260912"><noscript><link rel="stylesheet" href="${base}assets/no-script.css"></noscript>${['admin','404'].includes(route)?'<meta name="robots" content="noindex,nofollow">':''}</head><body data-route="${route}" data-base="${base}">${header(route,base,defaultContent)}<main id="main" tabindex="-1" itemscope itemtype="https://schema.org/Person"><meta itemprop="name" content="Krishna Mahato"><meta itemprop="url" content="${config.canonical}">${view(route,defaultContent,base)}</main>${footer(base,defaultContent)}<script type="module" src="${base}src/app.js?v=recruiter-20260912"></script></body></html>`;
 await fs.mkdir(path.dirname(path.join(root,target)),{recursive:true});await fs.writeFile(path.join(root,target),html);
}
await fs.writeFile(path.join(root,'.nojekyll'),'');
await fs.writeFile(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /E-portfolio/admin/\nSitemap: ${config.canonical}sitemap.xml\n`);
await fs.writeFile(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.entries(routes).filter(([r])=>!['admin','404'].includes(r)).map(([,r])=>`<url><loc>${config.canonical+r.path}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${Object.keys(routes).length} complete static pages. No client framework or remote scripts required.`);
