/* A small, pointer-only paper tilt. Text and links work without this module. */
let activeCleanup;

export function initAcademicCards(root=document) {
 activeCleanup?.();
 const eligible=window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
 const cards=[...root.querySelectorAll('[data-tilt]')];
 const cleanups=[];
 let disposed=false;

 for(const card of cards) {
  let bounds,frame=0,pointer;
  const reset=()=>{
   if(frame)window.cancelAnimationFrame(frame);
   frame=0;pointer=null;bounds=null;
   card.classList.remove('is-tilting');
   card.style.removeProperty('--card-rx');
   card.style.removeProperty('--card-ry');
  };
  const update=()=>{
   frame=0;
   if(!pointer||!bounds||!eligible.matches)return;
   const x=Math.max(-1,Math.min(1,(pointer.x-bounds.left)/bounds.width*2-1));
   const y=Math.max(-1,Math.min(1,(pointer.y-bounds.top)/bounds.height*2-1));
   // Large evidence sheets move less so their reading lines stay steady.
   const amount=bounds.height>500?0.65:1.4;
   card.style.setProperty('--card-rx',(-y*amount).toFixed(2)+'deg');
   card.style.setProperty('--card-ry',(x*amount).toFixed(2)+'deg');
   card.classList.add('is-tilting');
  };
  const enter=event=>{
   if(!eligible.matches||event.pointerType!=='mouse')return;
   bounds=card.getBoundingClientRect();
  };
  const move=event=>{
   if(!eligible.matches||event.pointerType!=='mouse'||!bounds)return;
   // Nested cards never pull their parent sheet in a second direction.
   if(event.target.closest('[data-tilt]')!==card){reset();return;}
   pointer={x:event.clientX,y:event.clientY};
   if(!frame)frame=window.requestAnimationFrame(update);
  };
  card.addEventListener('pointerenter',enter);
  card.addEventListener('pointermove',move);
  card.addEventListener('pointerleave',reset);
  card.addEventListener('pointercancel',reset);
  eligible.addEventListener('change',reset);
  cleanups.push(()=>{
   reset();
   card.removeEventListener('pointerenter',enter);
   card.removeEventListener('pointermove',move);
   card.removeEventListener('pointerleave',reset);
   card.removeEventListener('pointercancel',reset);
   eligible.removeEventListener('change',reset);
  });
 }
 activeCleanup=()=>{
  if(disposed)return;
  disposed=true;
  cleanups.forEach(cleanup=>cleanup());
 };
 return activeCleanup;
}

export function cleanupAcademicCards(){activeCleanup?.();activeCleanup=undefined;}
