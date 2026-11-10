import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source=await fs.readFile(new URL('../src/page-transition-boot.js',import.meta.url),'utf8');
test('Early incoming transition readiness is observed before pagereveal and only once',()=>{
 const handlers=[],events=new Map(),ready={catch(handler){handlers.push(handler);}};
 vm.runInNewContext(source,{document:{activeViewTransition:{ready}},addEventListener:(name,handler)=>events.set(name,handler)});
 assert.equal(handlers.length,1);
 events.get('pagereveal')({viewTransition:null});
 events.get('pagereveal')({viewTransition:{ready}});
 assert.equal(handlers.length,1);
 for(const name of ['AbortError','InvalidStateError','TimeoutError'])assert.doesNotThrow(()=>handlers[0]({name}));
 assert.throws(()=>handlers[0](new Error('Unexpected transition implementation failure')),/Unexpected transition/);
});
test('Engines without an initial active transition can observe a later reveal',()=>{
 let observed=false,reveal;
 vm.runInNewContext(source,{document:{},addEventListener:(name,handler)=>{if(name==='pagereveal')reveal=handler;}});
 reveal({viewTransition:{ready:{catch(){observed=true;}}}});
 assert.equal(observed,true);
});
