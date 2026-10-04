// The fixture renders the real compact header
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
  // Initial page loading must finish before interactions start. The separate
  // lifecycle check below deliberately exercises pagehide/pageshow cleanup.
  if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('pageshow',resolve,{once:true}));
  await document.fonts.ready;await frame();
  initNavigation();
  await check('Compact navigation has a semantic trigger and hidden closed links',()=>{
    assert(toggle.tagName==='BUTTON' && toggle.getAttribute('aria-controls')==='navigation','Trigger must be a button associated with its panel');
    assert(toggle.getAttribute('aria-expanded')==='false','Menu must start closed');
    assert(getComputedStyle(panel).visibility==='hidden' || getComputedStyle(panel).display==='none','Closed navigation must be hidden');
    toggle.focus();links[0].focus();
    assert(document.activeElement===toggle,'A closed navigation link accepted focus');
    assert(!panel.hasAttribute('role') && !panel.hasAttribute('aria-modal'),'Closed panel must not announce a modal');
  });
  await check('Opening focuses ordinary navigation links without a modal',async()=>{
    window.scrollTo({top:320,behavior:'instant'});await frame();
    initialPosition=scrollY;
    toggle.click();
    assert(toggle.getAttribute('aria-expanded')==='true' && panel.classList.contains('is-open'),'Menu did not open');
    assert(!panel.hasAttribute('role') && !panel.hasAttribute('aria-modal'),'Dropdown must not announce a dialog or modal');
    assert(document.activeElement===links[0],'Opening did not focus the first navigation link');
    assert(panel.querySelector('nav').getAttribute('aria-label')==='Main navigation','Navigation landmark label was lost');
    assert(!panel.querySelector('[role="menu"],[role="menuitem"]'),'Ordinary links must not become application menu items');
  });
  await check('Dropdown stays compact and leaves page controls and scrolling available',()=>{
    const rect=panel.getBoundingClientRect(),trigger=toggle.getBoundingClientRect();
    assert(rect.width<=321 && rect.left>=0 && rect.right<=innerWidth,'Dropdown exceeds its compact width or viewport');
    assert(rect.top>=trigger.bottom && rect.height<innerHeight-72,'Dropdown covers the full page');
    assert(parseFloat(getComputedStyle(links[0]).fontSize)<=17,'Dropdown links are oversized');
    assert(!main.inert && !footerElement.inert && !brand.inert && !toggle.inert,'Dropdown disabled page controls');
    for(const [property,value] of Object.entries(bodyStyle))assert(document.body.style[property]===value,`${property} was changed when opening`);
    assert(Math.abs(scrollY-initialPosition)<=1,'Opening moved the page');
  });
  await check('Tab is not trapped, and moving focus to the page dismisses the dropdown',()=>{
    const last=links.at(-1);
    last.focus({preventScroll:true});
    assert(key('Tab')===true,'Dropdown trapped forward Tab');
    assert(key('Tab',true)===true,'Dropdown trapped reverse Tab');
    document.querySelector('#background-control').focus({preventScroll:true});
    assert(document.activeElement.id==='background-control' && !panel.classList.contains('is-open'),'Focus outside did not dismiss the dropdown');
    toggle.click();
  });
  await check('Escape restores trigger focus without changing page state',async()=>{
    window.scrollTo({top:460,behavior:'instant'});await frame();
    const positionBeforeClose=scrollY;
    key('Escape');await frame();
    assert(toggle.getAttribute('aria-expanded')==='false' && !panel.classList.contains('is-open'),'Escape did not close navigation');
    assert(document.activeElement===toggle,'Escape did not restore focus to the trigger');
    assert(!main.inert && !footerElement.inert && !brand.inert && !toggle.inert,'Background remained inert');
    assert(originalInert.inert,'A previously inert element was incorrectly enabled');
    assert(!document.body.classList.contains('navigation-open'),'Body open class survived close');
    for(const [property,value] of Object.entries(bodyStyle))assert(document.body.style[property]===value,`${property} was not restored`);
    assert(Math.abs(scrollY-positionBeforeClose)<=1,'Closing moved the page away from its current position');
    assert(!panel.hasAttribute('aria-modal') && !panel.hasAttribute('role'),'Closed navigation retained modal semantics');
  });
  await check('A pointer outside dismisses the dropdown without stealing focus',()=>{
    toggle.click();
    document.querySelector('#background-control').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    assert(!panel.classList.contains('is-open') && toggle.getAttribute('aria-expanded')==='false','Outside pointer did not close the dropdown');
    document.querySelector('#background-control').focus();
    assert(document.activeElement.id==='background-control','Closing stole focus from the page');
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
  await check('Initial page display preserves navigation; pagehide and history restore dismiss it',()=>{
    toggle.click();
    window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}));
    assert(panel.classList.contains('is-open'),'Initial page display interrupted an open dropdown');
    window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    assert(!panel.classList.contains('is-open') && !main.inert,'Page hide left the dropdown open');
    toggle.click();
    window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
    assert(!panel.classList.contains('is-open') && toggle.getAttribute('aria-expanded')==='false','History restore retained an open dropdown');
    assert(!document.body.classList.contains('navigation-open'),'History restore retained stale navigation state');
  });
  await check('All generated header routes retain destinations and accurate active state',()=>{
    const navRoutes=['home','profile','teaching','resources','credentials','resume','contact'];
    for(const [route,meta] of Object.entries(routes)){
      const depth=meta.path.endsWith('/')?meta.path.split('/').filter(Boolean).length:0;
      const base=route==='404'?'/E-portfolio/':depth?'../'.repeat(depth):'./';
      const rendered=fragment(header(route,base,defaultContent));
      const navLinks=[...rendered.querySelectorAll('#navigation nav a')];
      assert(navLinks.length===navRoutes.length,`${route}: missing navigation link`);
      navLinks.forEach((link,index)=>assert(link.getAttribute('href')===base+routes[navRoutes[index]].path,`${route}: incorrect ${navRoutes[index]} target`));
      const fallbackLinks=[...rendered.querySelectorAll('.fallback-navigation nav a')];
      assert(fallbackLinks.length===navRoutes.length,`${route}: missing native fallback link`);
      fallbackLinks.forEach((link,index)=>assert(link.getAttribute('href')===base+routes[navRoutes[index]].path,`${route}: incorrect native fallback target`));
      const expected=['pehchaan','observation'].includes(route)?'teaching':route==='democracy'?'resources':navRoutes.includes(route)?route:null;
      const current=[...rendered.querySelectorAll('a[aria-current="page"]')];
      assert(current.length===(expected?1:0),`${route}: incorrect number of active links`);
      if(expected)assert(current[0].getAttribute('href')===base+routes[expected].path,`${route}: wrong active destination`);
    }
  });
  await check('Hero CTAs retain teaching and existing printable resume functionality',()=>{
    const home=fragment(view('home',defaultContent,'../'));
    const actions=[...home.querySelectorAll('.hero .actions a')];
    assert(actions.length===2,'Hero must have two primary actions');
    assert(actions[0].textContent.includes('View Teaching Evidence') && actions[0].getAttribute('href')==='../resources/','Evidence CTA reaches the original resource route');
    assert(actions[1].textContent.includes('Download Résumé') && actions[1].getAttribute('href')==='../assets/krishna-mahato-resume.pdf','Resume CTA downloads the generated PDF');
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
