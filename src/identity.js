// One supplied film moves from the opening back into the readable Home hero.
let dispose=()=>{};
export function cleanupOpening(){dispose();dispose=()=>{};}
export function initOpening({auto=true}={}){
 cleanupOpening();
 const hero=document.querySelector('.opening-hero');
 const boot=window.portfolioOpeningBoot;
 if(document.body.dataset.route!=='home'||!hero)return;
 const film=hero.querySelector('.hero-film'),audio=hero.querySelector('audio');
 if(!film||!audio)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const events=new AbortController(),options={signal:events.signal};
 const controls=hero.querySelector('[data-film-controls]'),pause=hero.querySelector('[data-film-pause]');
 const status=hero.querySelector('.film-status');
 const progress=hero.querySelector('.film-progress span');
 let intro=null,timer=0,started=0,soundEnabled=false,generation=0,audioGeneration=0,filmSize=null,heroVisible=true;
 const say=text=>{if(status)status.textContent=text;};
 const sync=()=>{pause.textContent=film.paused?'Play film':'Pause film';};
 const stopAudio=()=>{
  audioGeneration++;
  audio.pause();audio.currentTime=0;soundEnabled=false;
  syncSound();
 };
 const syncSound=()=>{
  const on=soundEnabled&&!audio.paused;
  const control=intro?.querySelector('.intro-sound');
  if(control){control.setAttribute('aria-pressed',String(on));control.textContent=on?'Mute music':'Unmute music';}
 };
 const frameFilm=()=>{
  if(innerWidth>760){film.style.objectPosition='76% top';return;}
  filmSize??={width:film.clientWidth,height:film.clientHeight};
  const {width,height}=filmSize;
  const ratio=film.videoWidth&&film.videoHeight?film.videoWidth/film.videoHeight:16/9;
  const renderedWidth=Math.max(width,height*ratio),overflow=renderedWidth-width;
  const time=film.currentTime;
  // Follow the supplied film's subject as he moves into the courtyard centre.
  const focalX=time<2?0.677+(0.49-0.677)*time/2:time<8?0.50:0.50+(0.56-0.50)*Math.min(1,(time-8)/2);
  const position=overflow?Math.max(0,Math.min(1,(focalX*renderedWidth-width*.5)/overflow)):0.5;
  film.style.objectPosition=(position*100)+'% top';
 };
 const finish=({reveal=true}={})=>{
  generation++;clearTimeout(timer);timer=0;
  const restore=intro?.contains(document.activeElement);
  if(intro){hero.prepend(film);intro.remove();intro=null;}
  hero.classList.remove('intro-active');stopAudio();filmSize=null;frameFilm();
  if(reveal)boot?.release();
  if(restore)document.querySelector('#main')?.focus({preventScroll:true});
 };
 const load=()=>{if(!film.getAttribute('src'))film.src=film.dataset.src;};
 const play=async()=>{load();try{await film.play();if(document.hidden||!intro&&!heroVisible||hero.dataset.userPaused==='true'){film.pause();sync();return false;}sync();return true;}catch{film.pause();sync();say('Film playback is unavailable. The portfolio remains ready to read.');return false;}};
 const enableSound=()=>{
  const request=++audioGeneration;
  soundEnabled=true;
  audio.volume=.48;
  audio.currentTime=Math.min(Math.max(0,(performance.now()-started)/1000),7.9);
  audio.play().then(()=>{if(request===audioGeneration)syncSound();}).catch(()=>{if(request===audioGeneration){stopAudio();say('Music could not play. Replay the introduction to try again.');}});
 };
 const restart=()=>{
  started=performance.now();film.currentTime=0;frameFilm();
  intro.classList.remove('intro-running');
  // Restart the finite sequence after an explicit replay.
  void intro.offsetWidth;intro.classList.add('intro-running');
  clearTimeout(timer);timer=setTimeout(finish,8000);
 };
 const begin=async(withSound=false,requested=false,waitForEntry=false)=>{
  finish({reveal:false});const pending=generation;
  if(preference.matches){
   if(withSound){started=performance.now();enableSound();timer=setTimeout(finish,8000);}
   else say('Reduced motion is enabled. The homepage is ready to read.');
   boot?.release();
   return;
  }
  film.pause();film.currentTime=0;
  intro=document.createElement('div');intro.className='identity-intro';
  intro.setAttribute('role','region');intro.setAttribute('aria-label','Portfolio introduction');
  intro.innerHTML='<div class="intro-entry"><p class="eyebrow">A short introduction</p><button type="button" class="button primary" data-intro-enter>Enter with music</button><p>A short piano melody accompanies the opening film.</p><p class="small" data-intro-status role="status"></p></div><div class="intro-name-card"><p class="intro-greeting">Hi, my name is</p><p class="intro-name"></p><p class="intro-role"></p></div><span class="intro-film-label">Illustrative film</span><div class="intro-controls"><button type="button" class="intro-skip">Skip to portfolio</button><button type="button" class="intro-sound" aria-pressed="false" hidden>Mute music</button></div>';
  intro.querySelector('.intro-name').textContent=hero.querySelector('h1').textContent;
  intro.querySelector('.intro-role').textContent=hero.querySelector('.hero-role').textContent;
  intro.prepend(film);document.body.append(intro);hero.classList.add('intro-active');
  // Replace the first-paint film cover synchronously, before awaiting playback.
  boot?.release();filmSize=null;frameFilm();
  intro.querySelector('.intro-skip').addEventListener('click',finish,options);
  intro.querySelector('.intro-sound').addEventListener('click',()=>{if(soundEnabled)stopAudio();else enableSound();},options);
  const start=async soundOn=>{
   const button=intro?.querySelector('[data-intro-enter]');if(!button||button.disabled)return;
   button.disabled=true;intro.querySelector('[data-intro-status]').textContent='Starting introduction…';
   hero.dataset.userPaused='false';
   started=performance.now();timer=setTimeout(finish,5000);
   // Both media play requests happen inside the entry click, before any await.
   if(soundOn)enableSound();
   if(!await play()){if(pending===generation)finish();return;}
   if(events.signal.aborted||pending!==generation)return;
   if(!requested&&(scrollY>24||document.hidden)){finish();return;}
   intro.querySelector('.intro-entry').hidden=true;
   intro.querySelector('.intro-sound').hidden=false;
   restart();syncSound();
   // A late media promise must not steal focus from a visitor already using Skip.
   if(soundOn&&!intro.contains(document.activeElement))intro.querySelector('.intro-sound').focus({preventScroll:true});
  };
  intro.querySelector('[data-intro-enter]').addEventListener('click',()=>start(true),options);
  if(!waitForEntry)start(withSound);
  else if(document.activeElement===document.body)intro.querySelector('[data-intro-enter]').focus({preventScroll:true});
 };
 pause.addEventListener('click',()=>{if(film.paused){hero.dataset.userPaused='false';play();}else{hero.dataset.userPaused='true';film.pause();finish();sync();}},options);
 hero.querySelector('[data-film-replay]').addEventListener('click',()=>begin(true,true),options);
 for(const event of ['play','pause','ended'])audio.addEventListener(event,syncSound,options);
 film.addEventListener('play',sync,options);film.addEventListener('pause',sync,options);
 film.addEventListener('error',()=>{finish();sync();say('Film unavailable. Showing the portfolio poster.');},options);
 film.addEventListener('timeupdate',()=>{frameFilm();if(progress)progress.style.width=(film.duration?film.currentTime/film.duration*100:0)+'%';},options);
 film.addEventListener('loadedmetadata',()=>{filmSize=null;frameFilm();},options);
 window.addEventListener('resize',()=>{filmSize=null;if(intro)finish();else frameFilm();},options);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')finish();},options);
 document.addEventListener('focusin',event=>{if(intro&&!intro.contains(event.target))finish();},options);
 window.addEventListener('scroll',()=>{if(intro&&scrollY>24)finish();},{passive:true,...options});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){film.pause();finish();sync();}else if(heroVisible&&!preference.matches&&hero.dataset.userPaused!=='true'&&film.getAttribute('src'))play();},options);
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
 controls.hidden=false;syncSound();
 dispose=()=>{finish();film.pause();events.abort();};
 if(!auto||preference.matches||scrollY>24||location.hash){boot?.release();return;}
 try{
  // Internal return links keep the page ready to read. New arrivals and reloads
  // use the eligibility already selected by the pre-paint script.
  if(!boot?.pending){if(sessionStorage.getItem('portfolio-identity-seen'))play();return;}
  sessionStorage.setItem('portfolio-identity-seen','1');
 }catch{/* Entry and its controls also work when storage is unavailable. */}
 begin(false,false,true);
}
