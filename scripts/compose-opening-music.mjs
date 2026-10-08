// Optional authoring tool. The site serves the saved eight-second MP3.
// Original melody using Alexander Holm's CC BY 3.0 Salamander piano samples.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const ffmpeg=process.argv[2];
if(!ffmpeg)throw Error('Pass the path to an FFmpeg executable.');
const rate=44100,duration=8,frames=rate*duration;
const work=path.join(root,'outputs/opening-music');await fs.mkdir(work,{recursive:true});
const samples=new Map();
for(const [name,pitch] of [['C3',48],['C4',60],['A4',69],['C5',72]]){
 const file=path.join(work,name+'.mp3');
 if(!await fs.stat(file).catch(()=>null)){
  const r=await fetch('https://raw.githubusercontent.com/Tonejs/audio/master/salamander/'+name+'.mp3');
  if(!r.ok)throw Error('Piano sample download failed: '+r.status);
  await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 }
 const decoded=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-i',file,'-f','f32le','-ar',String(rate),'-ac','2','pipe:1'],{windowsHide:true,maxBuffer:24*1024*1024});
 if(decoded.status!==0)throw Error(decoded.stderr.toString());
 const values=new Float32Array(decoded.stdout.length/4);
 for(let i=0;i<values.length;i++)values[i]=decoded.stdout.readFloatLE(i*4);
 samples.set(pitch,values);
}
const channels=[new Float64Array(frames),new Float64Array(frames)];
function note(pitch,start,length,gain){
 const sourcePitch=[...samples.keys()].sort((a,b)=>Math.abs(a-pitch)-Math.abs(b-pitch))[0];
 const source=samples.get(sourcePitch),speed=2**((pitch-sourcePitch)/12);
 const offset=Math.round(start*rate),count=Math.min(Math.round(length*rate),frames-offset);
 for(let i=0;i<count;i++){
  const position=i*speed,index=Math.floor(position),fraction=position-index;
  if((index+1)*2+1>=source.length)break;
  const attack=Math.min(1,i/(rate*.006)),release=Math.min(1,(count-i)/(rate*.32));
  for(let c=0;c<2;c++)channels[c][offset+i]+=(source[index*2+c]*(1-fraction)+source[(index+1)*2+c]*fraction)*gain*attack*release;
 }
}
// C major, A minor, F major, G suspended, then a soft C-major resolution.
for(const [at,chord] of [[0,[48,55,64]],[2,[45,52,60]],[4,[53,60,64]],[5.65,[43,55,62]],[6.95,[48,55,64,72]]]){
 chord.forEach((pitch,i)=>note(pitch,at+i*.022,2.3,.3));
}
for(const [at,pitch,gain] of [[.09,76,.63],[.74,79,.60],[1.4,76,.58],[2.08,72,.57],[2.74,76,.61],[3.4,74,.53],[4.1,72,.60],[4.76,69,.54],[5.42,71,.51],[6.07,74,.56],[6.72,76,.56],[7.05,72,.51]])note(pitch,at,1.65,gain);
// A small room reflection keeps the acoustic piano soft without an endless pad.
for(const channel of channels){const dry=channel.slice();for(const [delay,gain] of [[.079,.10],[.131,.06]]){const offset=Math.round(delay*rate);for(let i=offset;i<frames;i++)channel[i]+=dry[i-offset]*gain;}}
let peak=0;for(const channel of channels)for(const value of channel)peak=Math.max(peak,Math.abs(value));
const pcm=Buffer.alloc(frames*4),scale=.66/peak;
for(let i=0;i<frames;i++){
 const t=i/rate,fade=Math.min(1,t/.08)*Math.min(1,(duration-t)/.85);
 for(let c=0;c<2;c++)pcm.writeInt16LE(Math.round(channels[c][i]*scale*fade*32767),i*4+c*2);
}
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
const wav=path.join(work,'opening-piano.wav');await fs.writeFile(wav,Buffer.concat([header,pcm]));
const encoded=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',wav,'-c:a','libmp3lame','-b:a','128k',path.join(root,'assets/opening-piano.mp3')],{windowsHide:true});
if(encoded.status!==0)throw Error(encoded.stderr.toString());
console.log('Saved eight seconds of acoustic piano melody, with a gentle fade and no voice.');
