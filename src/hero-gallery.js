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
 let index=restoring?Math.min(Number(root.dataset.slide)||0,slides.length-1):0,timer=0,preloadTimer=0,visible=true,hovered=false,userPaused=preference.matches||limited()||(restoring&&root.dataset.rotation==='paused'),explicit=false,intent=null,start=null,suppressClick=0;
 let requestedIndex=index,generation=0;
 const loading=new WeakMap();
 const prepare=slide=>{
  const image=slide.querySelector('img');
  if(!image)return Promise.resolve(false);
  if(loading.has(image))return loading.get(image);
  // Native lazy loading also fetches nearby horizontal slides. Keep their
  // sources out of the request queue until a real navigation or rotation.
  image.loading='eager';
  if(image.dataset.srcset){image.srcset=image.dataset.srcset;delete image.dataset.srcset;}
  if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src;}
  const ready=image.decode().then(()=>true,()=>image.complete&&image.naturalWidth>0);
  loading.set(image,ready);return ready;
 };
 const stop=()=>{clearTimeout(timer);clearTimeout(preloadTimer);timer=0;preloadTimer=0;};
 const canRotate=()=>!events.signal.aborted&&!userPaused&&!hovered&&visible&&!document.hidden&&(explicit||!preference.matches&&!limited());
 const sync=()=>{rotation.textContent=userPaused?'Play photos':'Pause photos';root.dataset.rotation=userPaused?'paused':'playing';};
 const schedule=()=>{
  stop();if(!canRotate())return;
  preloadTimer=setTimeout(()=>{if(canRotate()&&!document.querySelector('.identity-intro'))prepare(slides[(index+1)%slides.length]);},4800);
  timer=setTimeout(async()=>{if(canRotate()&&!document.querySelector('.identity-intro'))await change(1,false);schedule();},6000);
 };
 const paint=()=>{
  slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
  track.style.transform=`translateX(${-100*index}%)`;
  root.dataset.slide=String(index);count.textContent=`${index+1} / ${slides.length}`;
 };
 const change=async(step,manual=true)=>{
  const request=++generation;
  requestedIndex=(requestedIndex+step+slides.length)%slides.length;
  const target=requestedIndex;
  const previous=slides[index];
  const focusWasInSlide=slides[index].contains(document.activeElement);
  if(manual){userPaused=true;explicit=false;stop();sync();}
  root.setAttribute('aria-busy','true');
  const ready=await prepare(slides[target]);
  if(events.signal.aborted||request!==generation)return;
  root.removeAttribute('aria-busy');
  if(!ready){requestedIndex=index;userPaused=true;sync();status.textContent='This photograph is unavailable. The current photograph remains open.';return;}
  if(!manual&&!canRotate()){requestedIndex=index;return;}
  index=target;paint();
  if(manual){
   status.textContent=`Photograph ${index+1} of ${slides.length}: ${slides[index].querySelector('figcaption strong')?.textContent||''}`;
   if(focusWasInSlide&&previous.contains(document.activeElement))slides[index].querySelector('a')?.focus({preventScroll:true});
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
 paint();sync();schedule();
 dispose=()=>{generation++;stop();events.abort();root.removeAttribute('aria-busy');};
}
