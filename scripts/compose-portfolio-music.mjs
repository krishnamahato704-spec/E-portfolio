// Original short instrumental score: soft keyboard arpeggios and sustained chords.
// Optional media-authoring command; the ordinary site build uses the saved MP4.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
const ffmpeg=process.argv[2]||require(require.resolve('ffmpeg-static',{paths:[path.join(root,'outputs/media-tools')]}));
const rate=44100,duration=11.25,frames=Math.round(rate*duration);
const channels=[new Float64Array(frames),new Float64Array(frames)];
const beat=duration/16;
const chords=[[50,57,62,66,69],[47,54,59,62,66],[43,50,55,59,62],[45,52,57,61,64]];
function note(pitch,start,length,gain,pan=0,pad=false){
 const frequency=440*2**((pitch-69)/12);
 const count=Math.min(Math.round(length*rate),frames);
 for(let i=0;i<count;i++){
  const time=i/rate,position=(Math.round(start*rate)+i)%frames;
  const attack=1-Math.exp(-time/(pad?.12:.008));
  const release=Math.min(1,(length-time)/.24);
  const envelope=attack*Math.max(0,release)*Math.exp(-time/(pad?2.4:.72));
  const phase=2*Math.PI*frequency*time;
  const sound=(Math.sin(phase)+.28*Math.sin(phase*2)*Math.exp(-time*1.8)+.07*Math.sin(phase*3))*gain*envelope;
  channels[0][position]+=sound*(1-pan*.35);
  channels[1][position]+=sound*(1+pan*.35);
 }
}
for(let bar=0;bar<4;bar++){
 const chord=chords[bar];
 for(const pitch of chord.slice(0,3))note(pitch,bar*4*beat,4.8*beat,.045,0,true);
 for(let step=0;step<8;step++){
  const pitch=chord[[2,3,4,3,2,4,3,4][step]]+12;
  note(pitch,(bar*4+step*.5)*beat,1.9,.09,step%2?.35:-.35);
 }
}
// Short quiet echoes wrap around the boundary so the repeating score has no gap.
for(let channel=0;channel<2;channel++){
 const dry=channels[channel].slice();
 for(let echo=1;echo<=3;echo++){
  const offset=Math.round(beat*.5*echo*rate),gain=.13**echo;
  for(let i=0;i<frames;i++)channels[channel][(i+offset)%frames]+=dry[i]*gain;
 }
}
const peak=Math.max(...channels.map(data=>data.reduce((value,sample)=>Math.max(value,Math.abs(sample)),0)));
const pcm=Buffer.alloc(frames*4),level=.34/peak;
for(let i=0;i<frames;i++)for(let channel=0;channel<2;channel++)pcm.writeInt16LE(Math.round(channels[channel][i]*level*32767),i*4+channel*2);
const header=Buffer.alloc(44);
header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
const wav=path.join(root,'outputs/portfolio-score.wav');
await fs.mkdir(path.dirname(wav),{recursive:true});
await fs.writeFile(wav,Buffer.concat([header,pcm]));
const encoded=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',path.join(root,'assets/hero-video.mp4'),'-i',wav,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-t',String(duration),'-movflags','+faststart',path.join(root,'assets/hero-video-music.mp4')],{encoding:'utf8',windowsHide:true});
if(encoded.status!==0)throw Error(encoded.stderr||'Music/video mux failed');
console.log('Saved an original 11.25-second stereo instrumental score in assets/hero-video-music.mp4.');
