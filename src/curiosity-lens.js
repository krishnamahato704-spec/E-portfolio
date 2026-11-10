export function canRevealLens({visible=false,reduced=false,saveData=false,paused=false,hidden=false,opening=false}={}){
 return visible&&!reduced&&!saveData&&!paused&&!hidden&&!opening;
}

const empty=()=>({render(){},hide(){},dispose(){}});
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function collectLensPhotos(root){
 const seen=new Set();
 return [...(root?.querySelectorAll?.('[data-hero-slide] img.plate-image')||[])].flatMap(source=>{
  const raw=source.getAttribute('src')||source.getAttribute('data-src');
  const url=source.currentSrc||raw;
  const caption=source.closest('figure')?.querySelector('figcaption strong')?.textContent?.trim();
  if(!url||!caption)return [];
  let key=raw||url;
  try{key=new URL(key,root.ownerDocument?.baseURI).href;}catch{/* A relative test record can still be deduplicated. */}
  if(seen.has(key))return [];
  seen.add(key);return [{url,caption}];
 });
}

export function nextLensPhotoIndex(count,current,excluded=new Set()){
 for(let step=1;step<=count;step++){
  const index=(current+step+count)%count;
  if(!excluded.has(index))return index;
 }
 return -1;
}

// This controller never owns an animation loop. The existing atlas calls render.
export function createCuriosityLens(hero,{signal}={}){
 const stage=hero?.querySelector?.('.atlas-stage'),doc=hero?.ownerDocument,win=doc?.defaultView;
 if(!stage||!doc?.createElement||!win)return empty();
 const events=new win.AbortController(),options={signal:events.signal};
 const fine=win.matchMedia('(hover:hover) and (pointer:fine)');
 const photos=collectLensPhotos(hero.closest?.('main')||hero);
 const lens=doc.createElement('div');lens.className='atlas-lens';lens.dataset.atlasLens='';lens.hidden=true;lens.inert=true;lens.setAttribute('aria-hidden','true');
 const orbit=doc.createElement('span');orbit.className='atlas-lens-orbit';
 const window=doc.createElement('div');window.className='atlas-lens-window';
 const image=doc.createElement('img');image.alt='';image.decoding='async';window.append(image);
 const cross=doc.createElement('span');cross.className='atlas-lens-cross';
 const label=doc.createElement('p');label.className='atlas-lens-caption';
 const eyebrow=doc.createElement('span');eyebrow.textContent='A closer look';
 const title=doc.createElement('span');title.textContent='';label.append(eyebrow,title);
 lens.append(orbit,window,cross,label);
 const ripple=doc.createElement('div');ripple.className='atlas-tap-ring';ripple.dataset.atlasRipple='';ripple.hidden=true;ripple.inert=true;ripple.setAttribute('aria-hidden','true');
 stage.append(lens,ripple);
 let state={},bounds,disposed=false;
 const failedPhotos=new Set(),readyPhotos=new Map();
 let activePhoto=-1,requestedPhoto=-1,photoRequest=0,pendingPhoto=null,photoAlpha=1;
 let lastPhotoChange=-Infinity,travel=0,lastLocation=null,entered=false;
 let inside=false,overControl=false,interacted=false,demoStarted=0,demoDone=false;
 let x=0,y=0,targetX=0,targetY=0,alpha=0,positioned=false,touchStart,lastRendered=0;
 let flashUntil=0,rippleStarted=-Infinity,rippleX=0,rippleY=0;
 const now=()=>win.performance.now();
 const interactive=target=>Boolean(target?.closest?.('a,button,input,textarea,select,summary,[role="button"]'));
 const eligible=()=>canRevealLens(state);
 const requestPhoto=index=>{
  if(disposed||!eligible()||index<0||index===requestedPhoto)return;
  requestedPhoto=index;lastPhotoChange=now();travel=0;
  const request=++photoRequest,photo=photos[index];
  pendingPhoto=null;
  if(readyPhotos.has(index)){pendingPhoto={index,...photo};return;}
  const loader=doc.createElement('img');loader.decoding='async';
  let settled=false;
  const failed=()=>{
   if(settled)return;settled=true;
   if(disposed)return;
   failedPhotos.add(index);
   if(request===photoRequest)requestedPhoto=activePhoto;
  };
  const ready=async()=>{
   if(settled)return;settled=true;
   try{if(loader.decode)await loader.decode();}catch{/* A loaded browser image may already be ready to paint. */}
   if(disposed)return;
   if(!loader.naturalWidth){failedPhotos.add(index);if(request===photoRequest)requestedPhoto=activePhoto;return;}
   readyPhotos.set(index,true);
   if(request===photoRequest)pendingPhoto={index,...photo};
  };
  loader.addEventListener('load',ready,{...options,once:true});
  loader.addEventListener('error',failed,{...options,once:true});
  // Deferred gallery sources are read without activating the carousel slides.
  loader.src=photo.url;
  if(loader.complete&&loader.naturalWidth)ready();
 };
 const advancePhoto=()=>requestPhoto(nextLensPhotoIndex(photos.length,requestedPhoto,failedPhotos));
 const ensureImage=()=>{if(requestedPhoto<0)advancePhoto();};
 const hide=()=>{
  lens.hidden=true;ripple.hidden=true;alpha=0;inside=false;flashUntil=0;
  lastLocation=null;travel=0;
  delete hero.dataset.lensActive;
 };
 const locate=event=>{
  targetX=clamp(event.clientX-bounds.left,0,state.width);
  targetY=clamp(event.clientY-bounds.top,0,state.height);
 };
 stage.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||!bounds||!eligible())return;
  const entering=!inside;
  interacted=true;demoDone=true;inside=true;overControl=interactive(event.target);locate(event);
  if(overControl){lastLocation=null;travel=0;return;}
  if(lastLocation)travel+=Math.hypot(targetX-lastLocation.x,targetY-lastLocation.y);
  lastLocation={x:targetX,y:targetY};
  if((entering&&entered||travel>=clamp(state.width*.16,180,320))&&now()-lastPhotoChange>=900)advancePhoto();
  entered=true;
 },options);
 stage.addEventListener('pointerleave',()=>{inside=false;demoDone=true;lastLocation=null;travel=0;},options);
 stage.addEventListener('pointerdown',event=>{
  if(!bounds||!eligible()||interactive(event.target))return;
  touchStart={x:event.clientX,y:event.clientY,time:now(),pointerId:event.pointerId};
 },options);
 stage.addEventListener('pointerup',event=>{
  const start=touchStart;touchStart=null;
  if(!start||start.pointerId!==event.pointerId||!eligible()||interactive(event.target))return;
  if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>9||now()-start.time>450)return;
  interacted=true;demoDone=true;overControl=false;locate(event);
  advancePhoto();
  rippleX=targetX;rippleY=targetY;rippleStarted=now();
  if(event.pointerType==='touch'){inside=false;flashUntil=now()+1050;x=targetX;y=targetY;positioned=true;}
 },options);
 stage.addEventListener('pointercancel',()=>{touchStart=null;inside=false;},options);
 const render=(time,next={})=>{
  if(disposed)return;
  state=next;bounds=next.bounds;
  const elapsed=lastRendered&&time>=lastRendered?Math.min(250,time-lastRendered):1000/24;
  lastRendered=time;
  if(!eligible()){hide();return;}
  let strength=inside&&!overControl?1:time<flashUntil?1:0;
  if(!interacted&&!demoDone&&fine.matches&&photos.length){
   if(!demoStarted)demoStarted=time;
   const progress=(time-demoStarted)/2300;
   if(progress<1){
    targetX=state.width*(.19+.045*Math.sin(progress*Math.PI));
    targetY=state.height*(.38+.045*progress);
    strength=Math.min(1,progress/.16,(1-progress)/.2);
   }else demoDone=true;
  }
  if(strength>0)ensureImage();
  // Fade only the photograph and its matching caption. The lens follows the
  // pointer continuously while the next approved image decodes off the page.
  if(pendingPhoto){
   photoAlpha=activePhoto<0||alpha<.05?0:Math.max(0,photoAlpha-elapsed/140);
   if(photoAlpha===0){
    const first=activePhoto<0;
    image.src=pendingPhoto.url;title.textContent=pendingPhoto.caption;
    activePhoto=pendingPhoto.index;pendingPhoto=null;photoAlpha=first?1:0;
    lens.dataset.imageReady='true';lens.dataset.photoIndex=String(activePhoto);
   }
  }else photoAlpha=Math.min(1,photoAlpha+elapsed/220);
  image.style.opacity=String(photoAlpha);title.style.opacity=String(photoAlpha);
  if(activePhoto<0)strength=0;
  alpha+=(strength-alpha)*(1-Math.exp(-elapsed/(strength?110:70)));
  if(alpha>.015){
   if(!positioned){x=targetX;y=targetY;positioned=true;}
   const dx=targetX-x,dy=targetY-y;
   const ease=1-Math.exp(-elapsed/240);
   x+=dx*ease;y+=dy*ease;
   lens.hidden=false;
   lens.style.opacity=String(alpha);
   lens.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${clamp(dx*.025,-5,5).toFixed(2)}deg)`;
   orbit.style.transform=`rotate(${((x+y)*.055).toFixed(2)}deg)`;
   hero.dataset.lensActive='true';
  }else{lens.hidden=true;delete hero.dataset.lensActive;}
  const progress=(time-rippleStarted)/1050;
  if(progress>=0&&progress<1){
   ripple.hidden=false;ripple.style.opacity=String((1-progress)*.8);
   ripple.style.transform=`translate3d(${rippleX}px,${rippleY}px,0) translate(-50%,-50%) scale(${.35+progress*2.8})`;
  }else ripple.hidden=true;
 };
 const dispose=()=>{
  if(disposed)return;disposed=true;++photoRequest;pendingPhoto=null;events.abort();lens.remove();ripple.remove();delete hero.dataset.lensActive;
  signal?.removeEventListener('abort',dispose);
 };
 signal?.addEventListener('abort',dispose,{once:true});
 return {render,hide,dispose};
}
