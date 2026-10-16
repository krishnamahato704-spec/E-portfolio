let dispose=()=>{};
export function cleanupHeroGallery(){dispose();dispose=()=>{};}
export function initHeroGallery(){
 cleanupHeroGallery();
 const root=document.querySelector('[data-hero-gallery]');
 if(!root)return;
 const slides=[...root.querySelectorAll('[data-hero-slide]')],track=root.querySelector('[data-gallery-track]');
 if(slides.length<2||!track)return;
 const rotation=root.querySelector('[data-gallery-rotation]'),count=root.querySelector('[data-gallery-count]'),status=root.querySelector('[data-gallery-status]');
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection;
 const limited=()=>connection?.saveData||/^(slow-2g|2g)$/.test(connection?.effectiveType||'');
 const events=new AbortController(),options={signal:events.signal};
 const restoring=root.dataset.enhanced==='true';
 let index=restoring?Math.min(Number(root.dataset.slide)||0,slides.length-1):0,timer=0,visible=true,hovered=false,userPaused=preference.matches||limited()||(restoring&&root.dataset.rotation==='paused'),explicit=false,intent=null,start=null,suppressClick=0;
 const stop=()=>{clearTimeout(timer);timer=0;};
 const canRotate=()=>!events.signal.aborted&&!userPaused&&!hovered&&visible&&!document.hidden&&(explicit||!preference.matches&&!limited());
 const sync=()=>{rotation.textContent=userPaused?'Play photos':'Pause photos';root.dataset.rotation=userPaused?'paused':'playing';};
 const schedule=()=>{
  stop();if(!canRotate())return;
  timer=setTimeout(()=>{if(canRotate()&&!document.querySelector('.identity-intro'))change(1,false);schedule();},6000);
 };
 const change=(step,manual=true)=>{
  const focusWasInSlide=slides[index].contains(document.activeElement);
  index=(index+step+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
  track.style.transform=`translateX(${-100*index}%)`;
  root.dataset.slide=String(index);count.textContent=`${index+1} / ${slides.length}`;
  if(manual){
   userPaused=true;explicit=false;stop();
   status.textContent=`Photograph ${index+1} of ${slides.length}: ${slides[index].querySelector('figcaption strong')?.textContent||''}`;
   if(focusWasInSlide)slides[index].querySelector('a')?.focus({preventScroll:true});
  }
  sync();
 };
 rotation.addEventListener('pointerdown',()=>{intent=userPaused?'play':'pause';},options);
 rotation.addEventListener('click',()=>{
  userPaused=(intent|| (userPaused?'play':'pause'))==='pause';intent=null;explicit=!userPaused;sync();schedule();
 },options);
 root.querySelector('[data-gallery-previous]').addEventListener('click',()=>change(-1),options);
 root.querySelector('[data-gallery-next]').addEventListener('click',()=>change(1),options);
 root.addEventListener('focusin',()=>{userPaused=true;explicit=false;stop();sync();},options);
 root.addEventListener('mouseenter',()=>{hovered=true;stop();},options);
 root.addEventListener('mouseleave',()=>{hovered=false;schedule();},options);
 root.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();change(event.key==='ArrowRight'?1:-1);}
 },options);
 root.addEventListener('touchstart',event=>{const t=event.changedTouches[0];start={x:t.clientX,y:t.clientY};},{passive:true,...options});
 root.addEventListener('touchend',event=>{
  if(!start)return;
  const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){suppressClick=performance.now()+400;change(dx<0?1:-1);}
 },{passive:true,...options});
 root.addEventListener('click',event=>{if(performance.now()<suppressClick){event.preventDefault();event.stopPropagation();}},{capture:true,...options});
 document.addEventListener('visibilitychange',schedule,options);
 const preferenceChanged=()=>{explicit=false;if(preference.matches||limited())userPaused=true;sync();schedule();};
 preference.addEventListener('change',preferenceChanged,options);
 connection?.addEventListener?.('change',preferenceChanged,options);
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1});
  observer.observe(root);events.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 }
 slides.forEach(slide=>{slide.hidden=false;});
 root.dataset.enhanced='true';const controls=root.querySelector('[data-gallery-controls]');controls.inert=false;controls.removeAttribute('aria-hidden');
 change(0,false);schedule();
 dispose=()=>{stop();events.abort();};
}
