import test from 'node:test';
import assert from 'node:assert/strict';
import {canPlayOpening,irisClipPath,irisLayerPaths,initPortfolioOpening,cleanupPortfolioOpening} from '../src/opening-sequence.js';

const polygonPoints=value=>value.slice(value.indexOf(',')+1,-1).split(',').map(point=>point.trim().split(/\s+/).map(parseFloat));
const filledAt=(points,x,y)=>{
 let filled=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [xi,yi]=points[i],[xj,yj]=points[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)filled=!filled;
 }
 return filled;
};

test('The iris opens a real round hole and finishes beyond the complete viewport',()=>{
 for(const [width,height] of [[320,900],[1440,1000],[2560,1440],[3840,2160]]){
  const closed=polygonPoints(irisClipPath(width,height,.5));
  const expanded=polygonPoints(irisClipPath(width,height,Math.hypot(width,height)/2+2));
  assert.equal(closed.length,expanded.length,'Native polygon interpolation retains its point structure');
  assert.equal(filledAt(closed,width/2,height/2),false,'The center opens into the scene');
  assert.equal(filledAt(closed,1,1),true,'Paper still covers the corner before expansion');
  for(const [x,y] of [[1,1],[width-1,1],[width-1,height-1],[1,height-1],[width/2,height/2]]){
   assert.equal(filledAt(expanded,x,y),false,`${width}x${height}: ${x},${y} is clear after expansion`);
  }
 }
});

test('Iris clip paths remain finite in collapsed or missing-size layouts',()=>{
 for(const [width,height] of [[0,0],[undefined,NaN],[-20,Infinity]]){
  const path=irisClipPath(width,height,.5);
  assert.match(path,/^polygon\(evenodd,/);
  assert.doesNotMatch(path,/NaN|Infinity/);
  const layers=irisLayerPaths(width,height);
  assert.ok(Number.isFinite(layers.radius)&&Number.isFinite(layers.paperRadius));
  assert.doesNotMatch(layers.paper+layers.lining,/NaN|Infinity/);
 }
});

test('The layered iris leaves a narrow lining between the paper and scene',()=>{
 for(const [width,height] of [[320,900],[1440,1000]]){
  const layers=irisLayerPaths(width,height);
  assert.equal(layers.paperRadius-layers.radius,20);
  const progress=.28;
  const lining=polygonPoints(irisClipPath(width,height,layers.radius*progress));
  const paper=polygonPoints(irisClipPath(width,height,layers.paperRadius*progress));
  const x=width/2+(layers.radius+10)*progress,y=height/2;
  assert.equal(filledAt(lining,x,y),true,'Apricot lining is visible in the annulus');
  assert.equal(filledAt(paper,x,y),false,'The outer paper has already cleared the annulus');
  for(const value of Object.values(layers))if(typeof value==='string')assert.doesNotMatch(value,/NaN|Infinity/);
 }
});

test('A first visible home visit can play the optional opening',()=>{
 assert.equal(canPlayOpening({initial:true,animated:true,top:0}),true);
});

test('Reading preferences, history destinations and existing sessions bypass automatic opening',()=>{
 const first={initial:true,animated:true,top:0};
 for(const blocked of [{reduced:true},{saveData:true},{slow:true},{fragment:'#teaching-evidence'},{seen:true},{hidden:true},{top:80},{initial:false},{animated:false}]){
  assert.equal(canPlayOpening({...first,...blocked}),false,JSON.stringify(blocked));
 }
});

test('Explicit replay may bypass a previous viewing while retaining motion and destination preferences',()=>{
 const replay={initial:true,animated:true,seen:true,force:true,top:0};
 assert.equal(canPlayOpening(replay),true);
 assert.equal(canPlayOpening({...replay,reduced:true}),false);
 assert.equal(canPlayOpening({...replay,fragment:'#main'}),false);
});

test('The opening lifecycle is safe outside a browser or after the hero is removed',()=>{
 assert.doesNotThrow(()=>initPortfolioOpening(null));
 assert.doesNotThrow(()=>initPortfolioOpening({querySelector:()=>null}));
 assert.doesNotThrow(()=>cleanupPortfolioOpening());
 assert.doesNotThrow(()=>cleanupPortfolioOpening());
});
