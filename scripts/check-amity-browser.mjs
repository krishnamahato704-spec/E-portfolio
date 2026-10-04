import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {mergeContent,validateContent} from '../src/content.js';
import {loadContent} from '../src/cloud.js';
import assert from 'node:assert/strict';
const row=await loadContent();const content=validateContent(mergeContent(row.content));
const observation=content.experiences.find(e=>e.id==='observation');
assert.equal(observation.period,'1–4 December');assert.equal(observation.duration,'4');
assert.ok(content.resources.some(r=>r.id==='amity-observation-journal'));
const base='http://127.0.0.1:3000/E-portfolio/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
const output=new URL('../outputs/amity-browser/',import.meta.url);await fs.mkdir(output,{recursive:true});
try {
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/rest/v1/portfolio_public?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([row])}));
  await page.goto(base+'teaching/observation/',{waitUntil:'networkidle'});
  await page.getByText('The four-day record',{exact:true}).waitFor();
  assert.equal(await page.locator('main .observation-day').count(),4);
  assert.equal(await page.locator('main img[src*="certificate-2"]').count(),0);
  assert.ok(await page.getByText('1–4 December',{exact:true}).isVisible());
  for(const img of await page.locator('main img').all())await img.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('main img')].every(i=>i.complete&&i.naturalWidth));
  assert.ok(await page.evaluate(()=>[...document.querySelectorAll('main img')].every(i=>i.complete&&i.naturalWidth)));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:new URL(`observation-${width}.png`,output).pathname.slice(1),fullPage:true});
  const read=page.getByRole('link',{name:'Read reflective journal',exact:false});await read.click();
  const dialog=page.getByRole('dialog');await dialog.waitFor({state:'visible'});
  const iframe=dialog.locator('iframe');await iframe.waitFor();
  const src=await iframe.getAttribute('src');assert.match(src,/amity-observation-reflective-journal\.pdf/);
  const response=await page.request.get(src);assert.equal(response.status(),200);
  assert.match(response.headers()['content-type'],/application\/pdf/);
  assert.equal((await response.body()).subarray(0,5).toString(),'%PDF-');
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await assert.doesNotReject(()=>read.evaluate(e=>{if(document.activeElement!==e)throw new Error('Focus not restored');}));
  const download=page.getByRole('link',{name:'Download journal PDF'});
  assert.equal(await download.getAttribute('download'),'amity-observation-reflective-journal.pdf');
  assert.equal(errors.length,0,errors.join('\n'));
  await context.close();
 }
 console.log('Live public content merge, four-day record, correct evidence, desktop/mobile layout, PDF viewer, download and focus restoration passed.');
}finally{await browser.close();}
