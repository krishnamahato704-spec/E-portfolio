import {initDemocracy,cleanupDemocracy} from './democracy.js';
// Keep local evidence navigation, with no decorative scroll or entrance effects.
export function cleanupMotion(){cleanupDemocracy();}
export function initMotion(){
 cleanupMotion();
 const root=document.querySelector('#main');
 if(root && document.body.dataset.route==='democracy')initDemocracy(root);
}
