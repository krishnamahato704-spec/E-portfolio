// Native dialog supplies keyboard isolation and Escape handling. Original-file
// links remain usable without JavaScript or for unsupported document formats.
export function wireViewer(root=document){
 if(!HTMLDialogElement.prototype.showModal)return;
 for(const link of root.querySelectorAll('a[data-viewer]')){
  if(link.dataset.viewerReady)continue;link.dataset.viewerReady='true';
  link.addEventListener('click',event=>{
   if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const url=new URL(link.href,location.href);
   const pdf=/\.pdf$/i.test(url.pathname),picture=/\.(png|jpe?g|webp|avif)$/i.test(url.pathname);
   // CSP allows local documents and the existing Supabase public uploads.
   if(!picture&&!pdf)return;
   if(pdf&&url.origin!==location.origin&&url.origin!=='https://oyqevsygintkjrkfbzpx.supabase.co')return;
   event.preventDefault();
   const dialog=document.createElement('dialog');dialog.className='evidence-viewer';dialog.setAttribute('aria-labelledby','viewer-title');
   const toolbar=document.createElement('div');toolbar.className='viewer-toolbar';
   const title=document.createElement('h2');title.id='viewer-title';title.textContent=link.dataset.title||'Evidence preview';
   const close=document.createElement('button');close.type='button';close.className='button secondary';close.textContent='Close';close.setAttribute('aria-label','Close evidence preview');
   toolbar.append(title,close);
   const content=document.createElement('div');content.className='viewer-content';
   const media=document.createElement(pdf?'iframe':'img');media.src=url.href;
   if(pdf){media.title=title.textContent+' — PDF preview';}
   else media.alt=link.querySelector('img')?.alt||title.textContent;
   content.append(media);
   const footer=document.createElement('div');footer.className='viewer-footer';
   const original=document.createElement('a');original.className='text-link';original.href=link.dataset.originalUrl||url.href;original.target='_blank';original.rel='noopener noreferrer';original.textContent='Open original file in a new tab →';footer.append(original);
   dialog.append(toolbar,content,footer);document.body.append(dialog);
   const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
   close.addEventListener('click',()=>dialog.close());
   dialog.addEventListener('close',()=>{dialog.remove();document.body.style.overflow=previousOverflow;link.focus({preventScroll:true});},{once:true});
   dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
   dialog.showModal();close.focus();
  });
 }
}
export function wireVideo(root=document){
 for(const video of root.querySelectorAll('.teaching-video')){
  if(video.dataset.ready)continue;video.dataset.ready='true';
  const play=video.parentElement.querySelector('.video-play');
  const sound=video.parentElement.querySelector('.video-sound');
  if(!play)continue;
  play.hidden=false;
  if(sound)sound.hidden=false;
  video.volume=.5;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const soundEnabled=()=>{try{return sessionStorage.getItem('portfolio-film-sound')!=='off';}catch{return true;}};
  const updateSound=()=>{
   if(!sound)return;
   sound.textContent=video.muted?'Sound on':'Mute music';
   sound.setAttribute('aria-label',video.muted?'Turn on instrumental music':'Mute instrumental music');
   sound.setAttribute('aria-pressed',String(!video.muted));
  };
  const start=async(focus=true,audible=soundEnabled())=>{
   if(!video.getAttribute('src'))video.src=video.dataset.src;
   play.hidden=true;
   video.muted=!audible;
   if(focus)video.focus();
   try{await video.play();}
   catch{
    // An audible autoplay rejection must not prevent the requested continuous film.
    video.muted=true;
    try{await video.play();}catch{play.hidden=false;}
   }
   updateSound();
  };
  play.addEventListener('click',()=>start());
  sound?.addEventListener('click',()=>{
   const enable=video.muted;
   try{sessionStorage.setItem('portfolio-film-sound',enable?'on':'off');}catch{}
   if(enable)start(false,true);else {video.muted=true;updateSound();}
  });
  video.addEventListener('volumechange',updateSound);
  video.addEventListener('play',()=>{play.hidden=true;});
  video.addEventListener('ended',()=>{play.hidden=false;});
  video.addEventListener('click',()=>{if(!video.getAttribute('src'))start();});
  preference.addEventListener('change',e=>{if(e.matches)video.pause();});
  // Try the requested music, then fall back to muted autoplay if the browser requires a tap.
  if(video.dataset.autoplay==='true'&&!preference.matches)start(false);
 }
}
