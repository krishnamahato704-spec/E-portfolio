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
 const sound=hero.querySelector('[data-film-sound]'),status=hero.querySelector('.film-status');
 const progress=hero.querySelector('.film-progress span');
 let intro=null,timer=0,started=0,soundEnabled=false,generation=0;
 const say=text=>{if(status)status.textContent=text;};
 const sync=()=>{pause.textContent=film.paused?'Play film':'Pause film';};
 const stopAudio=()=>{
  audio.pause();audio.currentTime=0;soundEnabled=false;
  sound.setAttribute('aria-pressed','false');sound.textContent='Sound on';
  if(intro)intro.querySelector('.intro-sound').textContent='Play with voice & piano';
 };
 const frameFilm=()=>{
  if(innerWidth>760){film.style.objectPosition='76% top';return;}
  const width=film.clientWidth,height=film.clientHeight;
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
  hero.classList.remove('intro-active');stopAudio();frameFilm();
  if(reveal)boot?.release();
  if(restore)document.querySelector('#main')?.focus({preventScroll:true});
 };
 const load=()=>{if(!film.getAttribute('src'))film.src=film.dataset.src;};
 const play=async()=>{load();try{await film.play();sync();return true;}catch{film.pause();sync();say('Film playback is unavailable. The portfolio remains ready to read.');return false;}};
 const enableSound=()=>{
  soundEnabled=true;sound.setAttribute('aria-pressed','true');sound.textContent='Sound off';
  if(intro)intro.querySelector('.intro-sound').textContent='Mute voice & piano';
  audio.currentTime=Math.min(Math.max(0,(performance.now()-started)/1000),7.9);
  audio.play().catch(()=>{stopAudio();say('Audio could not play. Use Sound on to try again.');});
 };
 const restart=()=>{
  started=performance.now();film.currentTime=0;frameFilm();
  intro.classList.remove('intro-running');
  // Restart the film, name reveal and transition together after a sound gesture.
  void intro.offsetWidth;intro.classList.add('intro-running');
  clearTimeout(timer);timer=setTimeout(finish,8000);
 };
 const begin=async(withSound=false,requested=false)=>{
  finish({reveal:false});const pending=generation;
  if(preference.matches){
   if(withSound){started=performance.now();enableSound();timer=setTimeout(finish,8000);}
   else say('Reduced motion is enabled. The homepage is ready to read.');
   boot?.release();
   return;
  }
  // Measure the final frame before moving the same video into the opening.
  document.documentElement.classList.add('opening-measure');
  const target=film.getBoundingClientRect();
  document.documentElement.classList.remove('opening-measure');
  film.pause();film.currentTime=0;
  intro=document.createElement('div');intro.className='identity-intro';
  intro.setAttribute('role','region');intro.setAttribute('aria-label','Portfolio introduction');
  for(const [key,value] of Object.entries({left:target.left,top:target.top,width:target.width,height:target.height}))intro.style.setProperty('--film-'+key,value+'px');
  intro.innerHTML='<div class="intro-name-card"><p class="intro-greeting">Hi, my name is</p><p class="intro-name"></p><p class="intro-role"></p></div><span class="intro-film-label">Illustrative film</span><div class="intro-controls"><button type="button" class="intro-skip">Skip to portfolio</button><button type="button" class="intro-sound">Play with voice &amp; piano</button></div>';
  intro.querySelector('.intro-name').textContent=hero.querySelector('h1').textContent;
  intro.querySelector('.intro-role').textContent=hero.querySelector('.hero-role').textContent;
  intro.prepend(film);document.body.append(intro);hero.classList.add('intro-active');
  // Replace the first-paint film cover synchronously, before awaiting playback.
  boot?.release();frameFilm();
  intro.querySelector('.intro-skip').addEventListener('click',finish,options);
  intro.querySelector('.intro-sound').addEventListener('click',()=>{if(soundEnabled)stopAudio();else{restart();enableSound();}},options);
  intro.querySelector('.intro-sound').disabled=true;
  started=performance.now();timer=setTimeout(finish,2500);
  if(withSound)enableSound();
  if(!await play()){if(pending===generation)finish();return;}
  if(events.signal.aborted||pending!==generation)return;
  if(!requested&&(scrollY>24||document.hidden)){finish();return;}
  intro.querySelector('.intro-sound').disabled=false;
  restart();
  if(withSound){
   if(soundEnabled){audio.currentTime=0;intro.querySelector('.intro-sound').textContent='Mute voice & piano';}
   intro.querySelector('.intro-sound').focus({preventScroll:true});
  }
 };
 pause.addEventListener('click',()=>{if(film.paused)play();else{film.pause();finish();sync();}},options);
 sound.addEventListener('click',()=>{if(soundEnabled)stopAudio();else if(intro)enableSound();else begin(true,true);},options);
 hero.querySelector('[data-film-replay]').addEventListener('click',()=>begin(false,true),options);
 film.addEventListener('play',sync,options);film.addEventListener('pause',sync,options);
 film.addEventListener('error',()=>{finish();sync();say('Film unavailable. Showing the portfolio poster.');},options);
 film.addEventListener('timeupdate',()=>{frameFilm();if(progress)progress.style.width=(film.duration?film.currentTime/film.duration*100:0)+'%';},options);
 film.addEventListener('loadedmetadata',frameFilm,options);
 window.addEventListener('resize',()=>{if(intro)finish();else frameFilm();},options);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')finish();},options);
 document.addEventListener('focusin',event=>{if(intro&&!intro.contains(event.target))finish();},options);
 window.addEventListener('scroll',()=>{if(intro)finish();},{passive:true,...options});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){film.pause();finish();sync();}},options);
 preference.addEventListener('change',()=>{film.pause();finish();sync();},options);
 controls.hidden=false;
 dispose=()=>{finish();film.pause();events.abort();};
 if(!auto||preference.matches||scrollY>24||location.hash){boot?.release();return;}
 try{
  // Internal return links keep the page ready to read. New arrivals and reloads
  // use the eligibility already selected by the pre-paint script.
  if(!boot?.pending){if(sessionStorage.getItem('portfolio-identity-seen'))play();return;}
  sessionStorage.setItem('portfolio-identity-seen','1');
 }catch{boot?.release();return;}
 begin();
}
