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
   // Gallery navigation is confined to the collection the visitor opened.
   const collection=link.closest('.gallery-grid,.moments-grid');
   if(picture&&collection){
    const links=[...collection.querySelectorAll('a[data-viewer]')].filter(a=>!a.closest('.gallery-card[hidden]'));
    let index=links.indexOf(link),startX=0,startY=0;
    const controls=document.createElement('div');controls.className='viewer-paging';
    const previous=document.createElement('button'),next=document.createElement('button'),position=document.createElement('span');
    for(const [button,label,text] of [[previous,'Previous gallery image','←'],[next,'Next gallery image','→']]){button.type='button';button.className='button secondary';button.setAttribute('aria-label',label);button.textContent=text;}
    position.setAttribute('role','status');
    const change=step=>{
     index=(index+step+links.length)%links.length;
     const current=links[index];
     media.src=current.href;media.alt=current.querySelector('img')?.alt||current.dataset.title;
     title.textContent=current.dataset.title||'Gallery image';
     original.href=current.dataset.originalUrl||current.href;
     position.textContent=`${index+1} of ${links.length}`;
    };
    controls.append(previous,position,next);footer.prepend(controls);change(0);
    previous.addEventListener('click',()=>change(-1));next.addEventListener('click',()=>change(1));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(e.key==='ArrowLeft'?-1:1);}});
    content.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});
    content.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)change(dx<0?1:-1);},{passive:true});
   }
   close.addEventListener('click',()=>dialog.close());
   dialog.addEventListener('close',()=>{dialog.remove();document.body.style.overflow=previousOverflow;link.focus({preventScroll:true});},{once:true});
   dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
   dialog.showModal();close.focus();
  });
 }
}
