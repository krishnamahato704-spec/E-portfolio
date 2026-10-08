// Quiet, locally synthesized sound. No music download or audio library is needed.
export const routeCues=Object.freeze({
 home:[261.63,392],profile:[293.66,440],teaching:[329.63,493.88],
 resources:[349.23,523.25],credentials:[392,587.33],resume:[440,659.25],
 contact:[493.88,739.99],gallery:[523.25,783.99],
 democracy:[293.66,392],pehchaan:[329.63,440],observation:[349.23,493.88]
});
const storageKey='portfolio-sound';
let controller;
export function initSound(){
 if(controller)return;
 const panel=document.querySelector('.portfolio-sound');
 if(!panel)return;
 const toggle=panel.querySelector('[data-sound-toggle]');
 const slider=panel.querySelector('[data-sound-volume]');
 const output=panel.querySelector('output'),status=panel.querySelector('[role="status"]');
 let enabled=false,volume=.2,context,master,ambient,filter;
 let introActive=!!window.portfolioOpeningBoot?.pending,revision=0,pendingCue=null;
 const players=new Set();
 try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(saved){enabled=saved.enabled===true;volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.2;}}catch{}
 const save=()=>{try{sessionStorage.setItem(storageKey,JSON.stringify({enabled,volume}));}catch{}};
 const notify=()=>{
  const playing=enabled&&volume>0&&context?.state==='running'&&!document.hidden;
  toggle.setAttribute('aria-pressed',String(playing));
  toggle.textContent=playing?'Sound on':enabled&&volume>0?'Resume sound':'Sound off';
  toggle.setAttribute('aria-label',playing?'Mute portfolio sound':enabled&&volume>0?'Resume portfolio sound':'Turn on portfolio sound');
  slider.value=String(Math.round(volume*100));output.value=slider.value+'%';
  panel.dataset.sound=playing?'on':'off';
  window.dispatchEvent(new CustomEvent('portfolio-sound-change',{detail:{enabled:playing,volume}}));
 };
 const mix=()=>{if(ambient&&context.state!=='closed')ambient.gain.setTargetAtTime(introActive||players.size?0:.12,context.currentTime,.35);};
 const create=()=>{
  if(context)return;
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)throw new Error('Audio is unavailable');
  context=new Audio();
  master=context.createGain();master.gain.value=volume;master.connect(context.destination);
  ambient=context.createGain();ambient.gain.value=0;
  filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;
  const breath=context.createGain();breath.gain.value=1;
  filter.connect(breath);breath.connect(ambient);ambient.connect(master);
  // A warm F-major chord breathes slowly; it stays well below the introduction.
  for(const frequency of [174.61,220,261.63]){
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.value=.16;
   oscillator.connect(gain);gain.connect(filter);oscillator.start();
  }
  const lfo=context.createOscillator();lfo.frequency.value=.09;
  const depth=context.createGain();depth.gain.value=.15;
  lfo.connect(depth);depth.connect(breath.gain);lfo.start();
  context.addEventListener('statechange',notify);
 };
 const cue=route=>{
  if(!enabled||document.hidden||context?.state!=='running'||introActive)return;
  const notes=routeCues[route];if(!notes)return;
  const now=context.currentTime;
  notes.forEach((frequency,index)=>{
   const oscillator=context.createOscillator(),gain=context.createGain();
   const start=now+index*.055;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.exponentialRampToValueAtTime(.14,start+.014);
   gain.gain.exponentialRampToValueAtTime(.0001,start+.3);
   oscillator.connect(gain);gain.connect(master);oscillator.start(start);oscillator.stop(start+.32);
   oscillator.addEventListener('ended',()=>{oscillator.disconnect();gain.disconnect();},{once:true});
  });
 };
 const resume=async()=>{
  if(!enabled||document.hidden)return false;
  const current=++revision;
  try{
   create();
   // resume() is called directly inside the visitor gesture when one is required.
   await context.resume();
   if(current!==revision||!enabled||document.hidden){if(!enabled||document.hidden)context.suspend().catch(()=>{});return false;}
   master.gain.setTargetAtTime(volume,context.currentTime,.08);mix();notify();
   if(pendingCue){cue(pendingCue);pendingCue=null;}
   return context.state==='running';
  }catch{
   notify();status.textContent='Sound is unavailable. The portfolio remains ready to read.';return false;
  }
 };
 const setEnabled=on=>{
  enabled=on;revision++;
  if(on&&volume===0)volume=.2;
  save();
  if(on)return resume();
  if(context?.state==='running'){master.gain.setValueAtTime(0,context.currentTime);context.suspend().catch(()=>{});}
  notify();return Promise.resolve(false);
 };
 controller={enable:()=>setEnabled(true),mute:()=>setEnabled(false),isOn:()=>enabled&&volume>0&&context?.state==='running',volume:()=>volume};
 toggle.addEventListener('click',()=>setEnabled(!controller.isOn()));
 slider.addEventListener('input',()=>{
  volume=Number(slider.value)/100;save();
  if(master)master.gain.setTargetAtTime(volume,context.currentTime,.08);
  notify();
 });
 window.addEventListener('portfolio-intro-state',event=>{introActive=event.detail.active;mix();});
 // Give spoken introductions and evidence videos the audio space they need.
 document.addEventListener('play',event=>{const media=event.target;if(media instanceof HTMLMediaElement&&!media.muted&&media.volume>0){players.add(media);mix();}},true);
 for(const name of ['pause','ended','error'])document.addEventListener(name,event=>{players.delete(event.target);mix();},true);
 const gesture=event=>{if(event.isTrusted&&enabled&&context?.state!=='running')resume();};
 document.addEventListener('pointerdown',gesture,{passive:true});
 document.addEventListener('keydown',gesture);
 const base=new URL(document.body.dataset.base||'./',location.href);
 const destinations={'':'home','profile/':'profile','teaching/':'teaching','resources/':'resources','credentials/':'credentials','resume/':'resume','contact/':'contact','gallery/':'gallery','teaching/democracy/':'democracy','teaching/pehchaan/':'pehchaan','teaching/observation/':'observation'};
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target&&link.target!=='_self')return;
  const url=new URL(link.href,location.href);
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||url.pathname===location.pathname)return;
  const route=destinations[url.pathname.slice(base.pathname.length)];if(!route||!enabled)return;
  cue(route);
  // Finish the destination cue on the next document, with no navigation delay.
  try{sessionStorage.setItem('portfolio-arrival-sound',JSON.stringify({path:url.pathname,at:Date.now()}));}catch{}
 });
 try{
  const arrival=JSON.parse(sessionStorage.getItem('portfolio-arrival-sound')||'null');
  sessionStorage.removeItem('portfolio-arrival-sound');
  if(arrival?.path===location.pathname&&Date.now()-arrival.at<8000)pendingCue=document.body.dataset.route;
 }catch{}
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){revision++;context?.suspend().catch(()=>{});notify();}
  else resume();
 });
 window.addEventListener('pagehide',()=>{revision++;context?.suspend().catch(()=>{});});
 window.addEventListener('pageshow',event=>{if(event.persisted)resume();});
 panel.hidden=false;notify();
 if(enabled)resume();
}
export function enablePortfolioSound(){return controller?.enable()||Promise.resolve(false);}
export function mutePortfolioSound(){return controller?.mute();}
export function isPortfolioSoundOn(){return controller?.isOn()||false;}
