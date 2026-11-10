import test from 'node:test';
import assert from 'node:assert/strict';
import {settlePageSwap} from '../src/navigation.js';

test('A skipped outgoing document transition leaves successful navigation usable',async()=>{
 assert.equal(settlePageSwap({}),undefined);
 for(const name of ['AbortError','InvalidStateError','TimeoutError']){
  await assert.doesNotReject(settlePageSwap({viewTransition:{ready:Promise.reject(new DOMException('Transition was skipped',name))}}));
 }
});

test('Unexpected transition failures remain observable',async()=>{
 await assert.rejects(settlePageSwap({viewTransition:{ready:Promise.reject(new Error('Unexpected implementation failure'))}}),/Unexpected implementation failure/);
});
