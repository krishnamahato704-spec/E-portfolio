// A brief, automatic film opening dissolves into the readable Home hero.
let dispose=()=>{};
export function cleanupOpening(){dispose();dispose=()=>{};}
export function initOpening({auto=true}={}){
 cleanupOpening();
 const hero=document.querySelector('.opening-hero');
 const boot=window.portfolioOpeningBoot;
 if(document.body.dataset.route!=='home'||!hero)return;
 const film=hero.querySelector('.hero-film'),audio=hero.querySelector('[data-opening-audio]');
 if(!film)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const events=new AbortController(),options={signal:events.signal};
 const controls=hero.querySelector('[data-film-controls]'),pause=hero.querySelector('[data-film-pause]');
 const filmHome=hero;
 const closeFilm=hero.querySelector('[data-film-close]');
 const status=hero.querySelector('.film-status');
 const hold=2200,fade=1000;
 let intro=null,timer=0,generation=0,heroVisible=hero.getBoundingClientRect().bottom>0,filmSize=null,cropFrame=0;
 let started=0,audioGeneration=0,audioPending=false,soundChosen=false;
 const entryControls=hero.querySelector('[data-opening-controls]');
 const sound=hero.querySelector('[data-opening-sound]');
 const say=text=>{if(status)status.textContent=text;};
 const limited=()=>navigator.connection?.saveData||/^(slow-2g|2g)$/.test(navigator.connection?.effectiveType||'');
 const eligible=()=>!preference.matches&&!limited();
 const wantsBackground=()=>hero.dataset.userPaused!=='true'&&hero.dataset.filmHidden!=='true'&&hero.dataset.filmFailed!=='true'&&(film.dataset.manualPlay||eligible());
 const shouldPlay=()=>!events.signal.aborted&&!document.hidden&&(intro||heroVisible)&&(intro||wantsBackground());
 const sync=()=>{if(pause)pause.textContent=film.paused?'Play film':'Pause film';if(closeFilm)closeFilm.hidden=hero.dataset.filmHidden==='true'||!film.getAttribute('src');};
 const stopAudio=()=>{
  audioGeneration++;audioPending=false;
  if(audio){audio.pause();audio.currentTime=0;}
 };
 const playAudio=()=>{
  if(!soundChosen||!audio||!intro||audioPending||!audio.paused||document.hidden||preference.matches)return;
  const elapsed=performance.now()-started;
  if(elapsed>=hold)return;
  const request=++audioGeneration;audioPending=true;
  if(!audio.getAttribute('src'))audio.src=audio.dataset.src;
  // The asset itself is quiet and fades out at 3.2s, including on browsers
  // that do not allow scripts to change media volume.
  audio.currentTime=elapsed/1000;
  audio.play().then(()=>{
   if(request!==audioGeneration||!intro||document.hidden||preference.matches){audio.pause();return;}
   // Keep the baked fade aligned with the opening if media loading was slow.
   audio.currentTime=Math.min((performance.now()-started)/1000,(hold+fade)/1000);
   audioPending=false;
  }).catch(()=>{if(request===audioGeneration){audioPending=false;say('Music could not play. The portfolio is ready to read.');}});
 };
 const stopCrop=()=>{
  if(film.cancelVideoFrameCallback)film.cancelVideoFrameCallback(cropFrame);
  else cancelAnimationFrame(cropFrame);
  cropFrame=0;
 };
 const frameFilm=(mediaTime=film.currentTime)=>{
  if(innerWidth>760||!intro?.contains(film)){
   film.style.removeProperty('width');film.style.removeProperty('translate');
   film.style.objectPosition=innerWidth>760?'76% top':'50% top';return;
  }
  // Measure once. Move the wide video on the compositor for each decoded
  // frame, instead of repainting object-position at timeupdate intervals.
  filmSize??={width:intro.clientWidth,height:intro.clientHeight};
  const {width,height}=filmSize,ratio=film.videoWidth&&film.videoHeight?film.videoWidth/film.videoHeight:16/9;
  const renderedWidth=Math.max(width,height*ratio),overflow=renderedWidth-width;
  const focalX=.677+(.49-.677)*Math.min(1,mediaTime);
  const offset=Math.max(0,Math.min(overflow,focalX*renderedWidth-width*.5));
  film.style.width=renderedWidth+'px';film.style.objectPosition='50% top';film.style.translate=`${-offset}px 0`;
 };
 const followCrop=()=>{
  if(!intro?.contains(film)||events.signal.aborted||innerWidth>760)return;
  if(film.requestVideoFrameCallback)cropFrame=film.requestVideoFrameCallback((_,frame)=>{frameFilm(frame.mediaTime);followCrop();});
  else cropFrame=requestAnimationFrame(()=>{frameFilm();followCrop();});
 };
 const finish=({resume=true}={})=>{
  generation++;clearTimeout(timer);timer=0;stopCrop();stopAudio();
  const restore=intro?.contains(document.activeElement)||entryControls?.contains(document.activeElement);
  if(intro){if(intro.contains(film))filmHome.prepend(film);intro.remove();intro=null;}
  if(entryControls&&entryControls.parentElement!==hero)hero.append(entryControls);
  film.style.removeProperty('transition');filmSize=null;frameFilm();boot?.release();
  if(resume&&shouldPlay())play();else{film.pause();sync();}
  if(restore)document.querySelector('#main')?.focus({preventScroll:true});
 };
 const load=()=>{if(!film.getAttribute('src'))film.src=film.dataset.src;};
 const play=async()=>{
  load();
  try{
   await film.play();
   if(!shouldPlay()){film.pause();sync();return false;}
   sync();return true;
  }catch{film.pause();sync();say('Film playback is unavailable. The portfolio remains ready to read.');return false;}
 };
 const settle=()=>{
  if(!intro)return;
  // Hold one frame for the dissolve while the same video continues in the hero.
  // This avoids a second decoder and a visible jump when the video changes size.
  if(film.readyState>=2){
   const frame=document.createElement('canvas');frame.className='intro-film-frame';
   frame.width=Math.min(640,film.videoWidth);frame.height=Math.round(frame.width*film.videoHeight/film.videoWidth);frame.setAttribute('aria-hidden','true');
   frame.style.objectPosition=getComputedStyle(film).objectPosition;
   frame.style.transform=getComputedStyle(film).transform;
   frame.style.width=film.style.width;frame.style.translate=film.style.translate;
   try{
    const context=frame.getContext('2d');
    if(context){context.drawImage(film,0,0,frame.width,frame.height);intro.prepend(frame);}
   }catch{/* The page background still provides the dissolve. */}
  }
  stopCrop();filmHome.prepend(film);frameFilm();
  intro.classList.add('intro-settling');timer=setTimeout(finish,fade);
 };
 const begin=()=>{
  intro=document.createElement('div');intro.className='identity-intro intro-running';
  intro.setAttribute('role','region');intro.setAttribute('aria-label','Portfolio introduction');
  film.style.transition='none';
  intro.prepend(film);document.body.append(intro);
  // The page main is an isolated stacking context. Put these fixed controls
  // beside the cover so they remain visible above it, including on phones.
  if(entryControls)document.body.append(entryControls);
  boot?.release();frameFilm();followCrop();
  requestAnimationFrame(()=>{if(intro?.contains(film))film.style.removeProperty('transition');});
  // The sequence has a fixed deadline, including on slow media connections.
  started=performance.now();timer=setTimeout(settle,hold);
  const pending=generation;
  play().then(playing=>{if(!playing&&pending===generation)finish();});
 };
 // Safari can focus the tabindex=-1 main ancestor when a pointer presses a
 // button. Keep focus on this control so that does not dismiss the opening
 // before its click handler can run. Music still starts only on click.
 entryControls?.addEventListener('pointerdown',event=>{
  const button=event.target.closest('button');
  if(button){event.preventDefault();button.focus({preventScroll:true});}
 },options);
 hero.querySelector('[data-opening-skip]')?.addEventListener('click',()=>{finish();document.querySelector('#main')?.focus({preventScroll:true});},options);
 sound?.addEventListener('click',()=>{
  soundChosen=!soundChosen;sound.setAttribute('aria-pressed',String(soundChosen));
  sound.textContent=soundChosen?'Mute music':'Enable music';
  if(soundChosen)playAudio();else stopAudio();
 },options);
 pause?.addEventListener('click',()=>{
  if(film.paused){hero.dataset.userPaused='false';hero.dataset.filmHidden='false';hero.dataset.filmFailed='false';film.dataset.manualPlay='true';play();}
  else{hero.dataset.userPaused='true';film.pause();finish({resume:false});sync();}
 },options);
 closeFilm?.addEventListener('click',()=>{
  delete film.dataset.manualPlay;hero.dataset.userPaused='true';hero.dataset.filmHidden='true';film.pause();sync();
  pause?.focus({preventScroll:true});
 },options);
 film.addEventListener('play',sync,options);film.addEventListener('pause',sync,options);
 film.addEventListener('loadedmetadata',()=>{filmSize=null;frameFilm();},options);
 film.addEventListener('error',()=>{hero.dataset.filmFailed='true';finish({resume:false});sync();say('Film unavailable. Showing the portfolio poster.');},options);
 window.addEventListener('resize',()=>{if(intro)finish();else frameFilm();},options);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape')finish();
 },options);
 document.addEventListener('focusin',event=>{if(intro&&!intro.contains(event.target)&&!entryControls?.contains(event.target))finish();},options);
 window.addEventListener('scroll',()=>{if(intro&&scrollY>24)finish();},{passive:true,...options});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){film.pause();finish({resume:false});sync();}
  else if(shouldPlay())play();
 },options);
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   heroVisible=entries[0].isIntersecting;
   if(intro)return;
   if(!heroVisible)film.pause();
   else if(shouldPlay())play();
  });
  observer.observe(hero);events.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 }
 const preferencesChanged=()=>{delete film.dataset.manualPlay;film.pause();finish({resume:false});if(shouldPlay())play();sync();};
 preference.addEventListener('change',preferencesChanged,options);
 navigator.connection?.addEventListener?.('change',preferencesChanged,options);
 if(controls){controls.inert=false;controls.removeAttribute('aria-hidden');}filmHome.prepend(film);sync();frameFilm();
 dispose=()=>{events.abort();finish({resume:false});film.pause();};
 if(!auto||!eligible()||scrollY>24||location.hash){boot?.release();if(shouldPlay())play();return;}
 try{
  if(!boot?.pending||performance.now()>boot.expiresAt){boot?.release();if(shouldPlay())play();return;}
  sessionStorage.setItem('portfolio-identity-seen','1');
 }catch{/* The automatic opening also works when storage is unavailable. */}
 begin();
}
