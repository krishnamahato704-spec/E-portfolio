const sessionKey='portfolio-atlas-opening-v2';
let dispose=()=>{};

// Matching polygon points let native animations interpolate a real even-odd hole.
export function irisClipPath(width,height,radius=.5){
 const size=value=>Number.isFinite(value)?Math.max(1,value):1;
 const w=size(width),h=size(height),r=Number.isFinite(radius)?Math.max(.5,radius):.5;
 const px=value=>`${Number(value.toFixed(3))}px`;
 const points=[`0px 0px`,`${px(w)} 0px`,`${px(w)} ${px(h)}`,`0px ${px(h)}`,`0px 0px`];
 for(let point=0;point<=64;point++){
  const angle=point/64*Math.PI*2;
  points.push(`${px(w/2+Math.cos(angle)*r)} ${px(h/2+Math.sin(angle)*r)}`);
 }
 return `polygon(evenodd,${points.join(',')})`;
}

export function irisLayerPaths(width,height){
 const w=Number.isFinite(width)?Math.max(1,width):1,h=Number.isFinite(height)?Math.max(1,height):1;
 const radius=Math.hypot(w,h)/2+2,paperRadius=radius+20;
 return {closed:irisClipPath(w,h,.5),lining:irisClipPath(w,h,radius),paper:irisClipPath(w,h,paperRadius),radius,paperRadius};
}

export function canPlayOpening({initial=false,animated=false,top=0,reduced=false,saveData=false,slow=false,fragment='',seen=false,hidden=false,force=false}={}){
 return Boolean(initial&&animated&&!reduced&&!saveData&&!slow&&!fragment&&!hidden&&top<25&&(!seen||force));
}

export function cleanupPortfolioOpening(){dispose();dispose=()=>{};}

export function initPortfolioOpening(root=globalThis.document?.querySelector('#main'),{initial=false}={}){
 cleanupPortfolioOpening();
 const hero=root?.querySelector?.('.opening-hero');
 const stage=hero?.querySelector('.atlas-stage');
 const doc=hero?.ownerDocument,win=doc?.defaultView;
 const replay=hero?.querySelector('[data-opening-replay]');
 // Test fixtures and embedded fragments remain ordinary static documents.
 if(!stage||!win||!replay||!doc.querySelector('.site-header')||doc.body.dataset.route!=='home'){win?.__portfolioOpeningBoot?.release('unavailable');return;}
 const events=new win.AbortController(),options={signal:events.signal};
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator.connection;
 let overlay,skip,timer=0,launch=0,active=false,manual=false,generation=0;
 const animations=new Set();
 const limited=()=>preference.matches||connection?.saveData||/^(slow-2g|2g)$/.test(connection?.effectiveType||'');
 const seen=()=>{try{return win.sessionStorage.getItem(sessionKey)==='seen';}catch{return hero.dataset.openingPlayed==='true';}};
 const markSeen=()=>{hero.dataset.openingPlayed='true';try{win.sessionStorage.setItem(sessionKey,'seen');}catch{}};
 const syncReplay=()=>{replay.hidden=limited()||typeof stage.animate!=='function'||active;};
 const finish=reason=>{
  if(timer)win.clearTimeout(timer);timer=0;
  const restore=skip&&(doc.activeElement===skip||reason==='skipped');
  active=false;
  delete hero.dataset.openingActive;
  hero.dataset.openingState=reason;
  animations.forEach(animation=>animation.cancel());animations.clear();
  overlay?.remove();skip?.remove();overlay=null;skip=null;
  syncReplay();
  if(restore&&!replay.hidden)replay.focus({preventScroll:true});
 };
 const animate=(element,frames,timing)=>{
  if(!element)return null;
  const animation=element.animate(frames,{fill:'both',...timing});
  animations.add(animation);
  // Cancel is an expected early-exit path for every animation in this scene.
  animation.finished.catch(()=>{});
  return animation;
 };
 const start=(explicit=false)=>{
  if(active||events.signal.aborted)return;
  if(!canPlayOpening({initial:explicit||initial,animated:typeof stage.animate==='function',top:win.scrollY,reduced:preference.matches,saveData:connection?.saveData,slow:/^(slow-2g|2g)$/.test(connection?.effectiveType||''),fragment:win.location.hash,seen:seen(),hidden:doc.hidden,force:explicit||new URLSearchParams(win.location.search).get('intro')==='replay'})){win.__portfolioOpeningBoot?.release('bypassed');syncReplay();return;}
  // Without an unbroken prepaint cover, an automatic late intro would recreate
  // the flash. Explicit Replay remains available after a failed/slow startup.
  if(!explicit&&!win.__portfolioOpeningBoot?.claim()){syncReplay();return;}
  const id=++generation;
  active=true;manual=explicit;markSeen();syncReplay();
  hero.dataset.openingActive='true';hero.dataset.openingState='playing';
  overlay=doc.createElement('div');overlay.className='portfolio-opening';overlay.setAttribute('aria-hidden','true');overlay.inert=true;
  const lining=doc.createElement('div');lining.className='opening-iris-lining';lining.dataset.openingLining='';
  const paper=doc.createElement('div');paper.className='opening-iris-paper';paper.dataset.openingIris='';
  const ring=doc.createElement('div');ring.className='opening-iris-ring';
  const innerRing=doc.createElement('div');innerRing.className='opening-iris-ring opening-iris-ring-inner';
  const bounds=stage.getBoundingClientRect(),width=Math.max(1,bounds.width),height=Math.max(1,bounds.height);
  const layers=irisLayerPaths(width,height),{radius,paperRadius}=layers;
  const closedIris=layers.closed,openIris=layers.paper;
  const supportsIris=Boolean(win.CSS?.supports?.('clip-path',closedIris)&&win.CSS.supports('clip-path',openIris));
  overlay.dataset.openingReveal=supportsIris?'iris':'fade';
  if(supportsIris){paper.style.clipPath=closedIris;lining.style.clipPath=closedIris;}
  lining.hidden=!supportsIris;ring.hidden=!supportsIris;innerRing.hidden=!supportsIris;
  const identity=doc.createElement('div');identity.className='opening-identity';
  const kicker=doc.createElement('p');kicker.className='opening-kicker';kicker.textContent='A teaching portfolio / An ongoing education';
  identity.append(kicker);
  const name=hero.querySelector('#opening-name')?.textContent.trim()||doc.title;
  const parts=name.split(/\s+/),split=Math.ceil(parts.length/2);
  const lines=parts.length>1?[parts.slice(0,split).join(' '),parts.slice(split).join(' ')]:[name];
  const longest=Math.max(...lines.map(line=>line.length));
  identity.style.setProperty('--opening-size',`${Math.min(18,155/longest)}vw`);
  lines.forEach((line,i)=>{const mask=doc.createElement('div');mask.className='opening-name-line'+(i===lines.length-1?' opening-name-line-last':'');const word=doc.createElement('span');word.className='opening-word';word.textContent=line;mask.append(word);identity.append(mask);});
  const note=doc.createElement('div');note.className='opening-note';
  const role=doc.createElement('span');role.textContent=hero.querySelector('.hero-role')?.textContent||'Teaching portfolio';
  const student=doc.createElement('span');student.textContent='Forever student';note.append(role,student);identity.append(note);
  overlay.append(lining,paper,ring,innerRing,identity);
  skip=doc.createElement('button');skip.type='button';skip.className='opening-skip';skip.dataset.openingSkip='';skip.textContent='Skip intro ↗';
  // Safari can blur a button on mousedown, dismissing it before click arrives.
  skip.addEventListener('mousedown',event=>event.preventDefault(),options);
  skip.addEventListener('click',()=>finish('skipped'),options);
  stage.append(overlay,skip);
  win.__portfolioOpeningBoot?.release('handed-off');
  const ease='cubic-bezier(.76,0,.24,1)',easeOut='cubic-bezier(.16,1,.3,1)';
  const words=[...identity.querySelectorAll('.opening-word')];
  words.forEach((word,i)=>animate(word,[{transform:'translateY(112%)'},{transform:'translateY(0)'}],{duration:740,delay:100+i*110,easing:easeOut}));
  animate(kicker,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,delay:80,easing:easeOut});
  animate(note,[{opacity:0},{opacity:1}],{duration:450,delay:400});
  animate(identity,[{opacity:1,transform:'translateY(-50%)'},{opacity:0,transform:'translateY(-63%)'}],{duration:480,delay:1130,easing:ease});
  if(supportsIris){
   animate(paper,[{clipPath:closedIris},{clipPath:openIris}],{duration:1150,delay:1050,easing:ease});
   animate(lining,[{clipPath:closedIris},{clipPath:layers.lining}],{duration:1150,delay:1050,easing:ease});
   // Brief absolute-size animation keeps the ring's stroke thin as it expands.
   animate(ring,[{width:'1px',height:'1px',opacity:0},{offset:.12,opacity:.85},{offset:.85,opacity:.55},{width:`${paperRadius*2}px`,height:`${paperRadius*2}px`,opacity:0}],{duration:1150,delay:1050,easing:ease});
   animate(innerRing,[{width:'1px',height:'1px',opacity:0},{offset:.18,opacity:.5},{offset:.86,opacity:.35},{width:`${radius*2}px`,height:`${radius*2}px`,opacity:0}],{duration:1150,delay:1050,easing:ease});
   animate(paper,[{opacity:1},{opacity:0}],{duration:120,delay:2180});
   animate(lining,[{opacity:1},{opacity:0}],{duration:120,delay:2180});
  }else{
   animate(paper,[{opacity:1},{opacity:0}],{duration:900,delay:1050,easing:ease});
  }
  const field=hero.querySelector('[data-atlas-field]');
  if(field){
   const resting=win.getComputedStyle(field),opacity=Number(resting.opacity),filter=resting.filter;
   animate(field,[{opacity:opacity*.55,filter:'blur(4px)'},{opacity,filter}],{duration:1050,delay:1120,easing:easeOut});
  }
  const titleTeacher=hero.querySelector('.atlas-title-teacher'),titleStudent=hero.querySelector('.atlas-title-student');
  [titleTeacher,titleStudent].forEach((element,i)=>{
   if(!element)return;
   const resting=win.getComputedStyle(element),opacity=Number(resting.opacity),transform=resting.transform;
   animate(element,[{opacity:opacity*.82,transform:`translateY(50px) scale(.94) ${transform==='none'?'':transform}`},{opacity,transform}],{duration:1000,delay:1250+i*120,easing:easeOut});
  });
  for(const [i,element] of [...hero.querySelectorAll('.atlas-controls,.hero-statement,.hero-study,.hero-joining,.hero-copy>.actions')].entries()){
   animate(element,[{opacity:.75,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:1650+i*55,easing:easeOut});
  }
  timer=win.setTimeout(()=>{if(active&&generation===id)finish('completed');},2600);
  // A defensive bound leaves the full page exposed even if an engine stalls.
  Promise.allSettled([...animations].map(animation=>animation.finished)).then(()=>{if(active&&generation===id)finish('completed');});
  if(manual)skip.focus({preventScroll:true});
 };
 replay.addEventListener('click',()=>{
  if(limited())return;
  if(win.location.hash){const url=new URL(win.location.href);url.hash='';win.history.replaceState(win.history.state,'',url);}
  win.scrollTo({top:0,behavior:'instant'});
  launch=win.requestAnimationFrame(()=>{launch=win.requestAnimationFrame(()=>{launch=0;start(true);});});
 },options);
 doc.addEventListener('keydown',event=>{if(active&&event.key==='Escape')finish('escaped');},options);
 doc.addEventListener('focusin',event=>{if(active&&event.target!==skip)finish('focused');},options);
 doc.addEventListener('pointerdown',event=>{if(active&&event.target!==skip&&event.target.closest?.('a,button,input,summary'))finish('interacted');},options);
 win.addEventListener('scroll',()=>{if(active)finish('scrolled');},{...options,passive:true});
 win.addEventListener('resize',()=>{if(active)finish('resized');},{...options,passive:true});
 const preferencesChanged=()=>{if(active)finish('preferences');syncReplay();};
 preference.addEventListener('change',preferencesChanged,options);
 connection?.addEventListener?.('change',preferencesChanged,options);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&active)finish('hidden');},options);
 win.addEventListener('pagehide',()=>finish('pagehide'),options);
 dispose=()=>{if(launch)win.cancelAnimationFrame(launch);launch=0;finish('disposed');events.abort();replay.hidden=true;};
 syncReplay();start();
}
