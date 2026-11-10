// Incoming native transitions can be skipped before the deferred app starts.
// Observe readiness early; handle expected cancellations without hiding errors.
(() => {
 const observed=new WeakSet();
 const settle=transition=>{
  const ready=transition?.ready;
  if(!ready||observed.has(ready))return;
  observed.add(ready);
  ready.catch(error=>{
   if(!['AbortError','InvalidStateError','TimeoutError'].includes(error.name))throw error;
  });
 };
 settle(document.activeViewTransition);
 addEventListener('pagereveal',event=>settle(event.viewTransition));
})();
