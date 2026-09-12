// Run at a mobile/tablet width (<=1000px). The fixture renders the real header
// and navigation implementation; no app.js, cloud requests or account writes.
import {defaultContent} from '../src/content.js';
import {header,footer,view,routes} from '../src/views.js';
import {initNavigation} from '../src/navigation.js';

const results=[];
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const check=async(name,run)=>{
  try{await run();results.push({name,pass:true})}
  catch(error){results.push({name,pass:false,error:error.message})}
};
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const fragment=markup=>{const node=document.createElement('template');node.innerHTML=markup;return node.content};
const key=(value,shiftKey=false)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:value,shiftKey,bubbles:true,cancelable:true}));

document.body.insertAdjacentHTML('afterbegin',header('home','../',defaultContent));
document.body.insertAdjacentHTML('beforeend',footer('../',defaultContent));
const toggle=document.querySelector('.menu-toggle');
const panel=document.querySelector('#navigation');
const closeButton=panel.querySelector('.menu-close');
const links=[...panel.querySelectorAll('nav a')];
const main=document.querySelector('#main');
const footerElement=document.querySelector('.site-footer');
const originalInert=document.querySelector('#previously-inert');
const brand=document.querySelector('.brand');
let initialPosition=0;
const bodyStyle=Object.fromEntries(['position','top','width','overflow'].map(key=>[key,document.body.style[key]]));

try{
  initNavigation();
  await check('Mobile fixture has a semantic menu trigger and hidden closed links',()=>{
    assert(matchMedia('(max-width: 1000px)').matches,'Run this fixture at a viewport width <=1000px');
    assert(toggle.tagName==='BUTTON' && toggle.getAttribute('aria-controls')==='navigation','Trigger must be a button associated with its panel');
    assert(toggle.getAttribute('aria-expanded')==='false','Menu must start closed');
    assert(getComputedStyle(panel).visibility==='hidden' || getComputedStyle(panel).display==='none','Closed navigation must be hidden');
    toggle.focus();links[0].focus();
    assert(document.activeElement===toggle,'A closed navigation link accepted focus');
    assert(!panel.hasAttribute('role') && !panel.hasAttribute('aria-modal'),'Closed panel must not announce a modal');
  });
  await check('Opening focuses the first link and creates an accessible modal',async()=>{
    window.scrollTo({top:320,behavior:'instant'});await frame();
    initialPosition=scrollY;
    toggle.click();
    assert(toggle.getAttribute('aria-expanded')==='true' && panel.classList.contains('is-open'),'Menu did not open');
    assert(panel.getAttribute('role')==='dialog' && panel.getAttribute('aria-modal')==='true','Open panel lacks modal semantics');
    assert(document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent.trim(),'Modal has no accessible title');
    assert(document.activeElement===links[0],'Opening did not focus the first navigation link');
    assert(panel.querySelector('nav').getAttribute('aria-label')==='Main navigation','Navigation landmark label was lost');
    assert(!panel.querySelector('[role="menu"],[role="menuitem"]'),'Ordinary links must not become application menu items');
  });
  await check('Open navigation locks scrolling and makes the background inert',()=>{
    assert(document.body.style.position==='fixed' && document.body.style.overflow==='hidden','Background scroll is not locked');
    assert(document.body.style.top===`-${initialPosition}px`,'Scroll position was not retained');
    assert(main.inert && footerElement.inert && brand.inert && toggle.inert,'Background controls remain interactive');
    assert(!panel.inert && !closeButton.inert,'The modal is inert');
    document.querySelector('#background-control').focus();
    assert(document.activeElement===links[0],'Focus escaped to the background');
  });
  await check('Tab wraps from the final link to close, and Shift+Tab wraps back',()=>{
    const last=links.at(-1);
    last.focus();
    assert(key('Tab')===false,'Forward wrap did not cancel the default Tab action');
    assert(document.activeElement===closeButton,'Forward Tab did not wrap to the close button');
    assert(key('Tab',true)===false,'Reverse wrap did not cancel the default Tab action');
    assert(document.activeElement===last,'Shift+Tab did not wrap to the final link');
  });
  await check('Escape restores trigger focus, body styles, scroll and original inert states',async()=>{
    key('Escape');await frame();
    assert(toggle.getAttribute('aria-expanded')==='false' && !panel.classList.contains('is-open'),'Escape did not close navigation');
    assert(document.activeElement===toggle,'Escape did not restore focus to the trigger');
    assert(!main.inert && !footerElement.inert && !brand.inert && !toggle.inert,'Background remained inert');
    assert(originalInert.inert,'A previously inert element was incorrectly enabled');
    assert(!document.body.classList.contains('navigation-open'),'Body open class survived close');
    for(const [property,value] of Object.entries(bodyStyle))assert(document.body.style[property]===value,`${property} was not restored`);
    assert(Math.abs(scrollY-initialPosition)<=1,'Closing moved the page away from its original position');
    assert(!panel.hasAttribute('aria-modal') && !panel.hasAttribute('role'),'Closed navigation retained modal semantics');
  });
  await check('Repeated initialization and reopening retain one functioning close action',()=>{
    initNavigation();initNavigation();
    toggle.click();
    assert(panel.classList.contains('is-open'),'Duplicate initialization toggled the menu closed');
    closeButton.click();
    assert(!panel.classList.contains('is-open') && !main.inert,'Close button did not release the page');
    assert(document.activeElement===toggle,'Close button did not restore trigger focus');
  });
  await check('Activating a navigation link closes and unlocks the page',()=>{
    toggle.click();
    links[0].addEventListener('click',event=>event.preventDefault(),{once:true});
    links[0].click();
    assert(!panel.classList.contains('is-open') && !main.inert,'Link activation did not close and release the page');
    assert(document.body.style.position===bodyStyle.position && document.body.style.overflow===bodyStyle.overflow,'Link activation retained scroll lock');
  });
  await check('Page lifecycle cleanup releases an open navigation',()=>{
    toggle.click();
    window.dispatchEvent(new Event('pagehide'));
    assert(!panel.classList.contains('is-open') && !main.inert,'Page hide left a modal open');
    window.dispatchEvent(new Event('pageshow'));
    assert(!document.body.classList.contains('navigation-open'),'Page restore retained stale navigation state');
  });
  await check('All generated header routes retain destinations and accurate active state',()=>{
    const navRoutes=['profile','teaching','resources','credentials','resume','contact'];
    for(const [route,meta] of Object.entries(routes)){
      const depth=meta.path.endsWith('/')?meta.path.split('/').filter(Boolean).length:0;
      const base=route==='404'?'/E-portfolio/':depth?'../'.repeat(depth):'./';
      const rendered=fragment(header(route,base,defaultContent));
      const navLinks=[...rendered.querySelectorAll('nav a')];
      assert(navLinks.length===navRoutes.length,`${route}: missing navigation link`);
      navLinks.forEach((link,index)=>assert(link.getAttribute('href')===base+routes[navRoutes[index]].path,`${route}: incorrect ${navRoutes[index]} target`));
      const expected=['pehchaan','observation','democracy'].includes(route)?'teaching':navRoutes.includes(route)?route:null;
      const current=[...rendered.querySelectorAll('a[aria-current="page"]')];
      assert(current.length===(expected?1:0),`${route}: incorrect number of active links`);
      if(expected)assert(current[0].getAttribute('href')===base+routes[expected].path,`${route}: wrong active destination`);
    }
  });
  await check('Hero CTAs retain teaching and existing printable resume functionality',()=>{
    const home=fragment(view('home',defaultContent,'../'));
    const actions=[...home.querySelectorAll('.hero .actions a')];
    assert(actions.length===2,'Hero must have two primary actions');
    assert(actions[0].textContent.includes('Explore My Teaching') && actions[0].getAttribute('href')==='../teaching/','Teaching CTA changed destination');
    assert(actions[1].textContent.includes('View Résumé') && actions[1].getAttribute('href')==='../resume/','Resume CTA changed destination');
    assert(fragment(view('resume',defaultContent,'../')).querySelector('button#print-resume')?.textContent.includes('Print / save as PDF'),'Printable resume control was removed');
  });
  await check('Live status follows existing internship and teacher-education evidence',()=>{
    const status=content=>fragment(view('home',content,'../')).querySelector('.opening-status');
    assert(status(defaultContent).textContent.includes('Currently developing through school internship'),'Existing ongoing internship is not represented');
    const noInternship=structuredClone(defaultContent);
    noInternship.experiences=[];
    assert(!status(noInternship).textContent.includes('school internship'),'Removed internship still appears current');
    assert(status(noInternship).textContent.includes('Currently developing through teacher education'),'Current B.Ed. evidence did not provide an accurate fallback');
    noInternship.qualifications.forEach(qualification=>{qualification.status='Completed'});
    assert(!status(noInternship).textContent.includes('Currently developing') && !status(noInternship).querySelector('.status-dot'),'No ongoing evidence must produce a static status without a live dot');
    const completedInternship=structuredClone(defaultContent);
    completedInternship.experiences.forEach(experience=>{experience.status='Completed'});
    assert(!status(completedInternship).textContent.includes('school internship'),'Completed internship is presented as current');
  });
}finally{
  key('Escape');
  document.querySelector('#results').textContent=JSON.stringify(results,null,2);
  document.body.dataset.testResult=results.every(result=>result.pass)?'pass':'fail';
}
