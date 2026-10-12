// A brief, automatic film opening dissolves into the readable Home hero.
let dispose=()=>{};
export function cleanupOpening(){dispose();dispose=()=>{};}
export function initOpening({auto=true}={}){
 cleanupOpening();
 const hero=document.querySelector('.opening-hero');
 const boot=window.portfolioOpeningBoot;
 if(document.body.dataset.route!=='home'||!hero)return;
 const film=hero.querySelector('.hero-film');
 if(!film)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const events=new AbortController(),options={signal:events.signal};
 const controls=hero.querySelector('[data-film-controls]'),pause=hero.querySelector('[data-film-pause]');
 const status=hero.querySelector('.film-status');
 const hold=2200,fade=1000;
 let intro=null,timer=0,generation=0,heroVisible=true,filmSize=null;
 const say=text=>{if(status)status.textContent=text;};
 const sync=()=>{if(pause)pause.textContent=film.paused?'Play film':'Pause film';};
 const frameFilm=()=>{
  if(innerWidth>760){film.style.objectPosition='76% top';return;}
  if(!intro?.contains(film)){film.style.objectPosition='50% top';return;}
  // Cache geometry and interpolate media updates so the phone crop follows
  // the subject without the old stepwise jumps or an added zoom.
  filmSize??={width:film.clientWidth,height:film.clientHeight};
  const {width,height}=filmSize,ratio=film.videoWidth&&film.videoHeight?film.videoWidth/film.videoHeight:16/9;
  const renderedWidth=Math.max(width,height*ratio),overflow=renderedWidth-width;
  const focalX=.677+(.49-.677)*Math.min(1,film.currentTime);
  const position=overflow?Math.max(0,Math.min(1,(focalX*renderedWidth-width*.5)/overflow)):.5;
  film.style.objectPosition=position*100+'% top';
 };
 const finish=()=>{
  generation++;clearTimeout(timer);timer=0;
  const restore=intro?.contains(document.activeElement);
  if(intro){if(intro.contains(film))hero.prepend(film);intro.remove();intro=null;}
  film.style.removeProperty('transition');filmSize=null;frameFilm();boot?.release();
  if(restore)document.querySelector('#main')?.focus({preventScroll:true});
 };
 const load=()=>{if(!film.getAttribute('src'))film.src=film.dataset.src;};
 const play=async()=>{
  load();
  try{
   await film.play();
   if(events.signal.aborted||document.hidden||!intro&&!heroVisible||hero.dataset.userPaused==='true'){film.pause();sync();return false;}
   sync();return true;
  }catch{film.pause();sync();say('Film playback is unavailable. The portfolio remains ready to read.');return false;}
 };
 const settle=()=>{
  if(!intro)return;
  // Hold one frame for the dissolve while the same video continues in the hero.
  // This avoids a second decoder and a visible jump when the video changes size.
  if(film.readyState>=2){
   const frame=document.createElement('canvas');frame.className='intro-film-frame';
   frame.width=film.videoWidth;frame.height=film.videoHeight;frame.setAttribute('aria-hidden','true');
   frame.style.objectPosition=getComputedStyle(film).objectPosition;
   try{
    const context=frame.getContext('2d');
    if(context){context.drawImage(film,0,0);intro.prepend(frame);}
   }catch{/* The page background still provides the dissolve. */}
  }
  hero.prepend(film);frameFilm();
  intro.classList.add('intro-settling');timer=setTimeout(finish,fade);
 };
 const begin=()=>{
  intro=document.createElement('div');intro.className='identity-intro intro-running';
  intro.setAttribute('role','region');intro.setAttribute('aria-label','Portfolio introduction');
  intro.innerHTML='<div class="intro-name-card"><p class="intro-greeting">Hi, my name is</p><p class="intro-name"></p><p class="intro-role"></p></div><div class="intro-controls"><button type="button" class="intro-skip">Skip to portfolio</button></div>';
  intro.querySelector('.intro-name').textContent=hero.querySelector('h1').textContent;
  intro.querySelector('.intro-role').textContent=hero.querySelector('.hero-role').textContent;
  film.style.transition='none';
  intro.prepend(film);document.body.append(intro);
  boot?.release();frameFilm();
  requestAnimationFrame(()=>{if(intro?.contains(film))film.style.removeProperty('transition');});
  intro.querySelector('.intro-skip').addEventListener('click',finish,options);
  // The sequence has a fixed deadline, including on slow media connections.
  timer=setTimeout(settle,hold);
  const pending=generation;
  play().then(playing=>{if(!playing&&pending===generation)finish();});
 };
 pause?.addEventListener('click',()=>{
  if(film.paused){hero.dataset.userPaused='false';play();}
  else{hero.dataset.userPaused='true';film.pause();finish();sync();}
 },options);
 film.addEventListener('play',sync,options);film.addEventListener('pause',sync,options);
 film.addEventListener('timeupdate',()=>{if(intro?.contains(film))frameFilm();},options);
 film.addEventListener('loadedmetadata',()=>{filmSize=null;frameFilm();},options);
 film.addEventListener('error',()=>{finish();sync();say('Film unavailable. Showing the portfolio poster.');},options);
 window.addEventListener('resize',()=>{if(intro)finish();else frameFilm();},options);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')finish();},options);
 document.addEventListener('focusin',event=>{if(intro&&!intro.contains(event.target))finish();},options);
 window.addEventListener('scroll',()=>{if(intro&&scrollY>24)finish();},{passive:true,...options});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){film.pause();finish();sync();}
  else if(heroVisible&&!preference.matches&&hero.dataset.userPaused!=='true'&&film.getAttribute('src'))play();
 },options);
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   heroVisible=entries[0].isIntersecting;
   if(intro)return;
   if(!heroVisible)film.pause();
   else if(!document.hidden&&!preference.matches&&hero.dataset.userPaused!=='true'&&film.getAttribute('src'))play();
  });
  observer.observe(hero);events.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 }
 preference.addEventListener('change',()=>{film.pause();finish();sync();},options);
 if(controls)controls.hidden=false;sync();frameFilm();
 dispose=()=>{finish();film.pause();events.abort();};
 if(!auto||preference.matches||scrollY>24||location.hash){boot?.release();return;}
 try{
  if(!boot?.pending){if(sessionStorage.getItem('portfolio-identity-seen'))play();return;}
  sessionStorage.setItem('portfolio-identity-seen','1');
 }catch{/* The automatic opening also works when storage is unavailable. */}
 begin();
}
