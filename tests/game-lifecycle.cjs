const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function runtime(){
 let serial=0;const timers=new Map(),intervals=new Map(),frames=new Map();
 const env={document:{hidden:false},setTimeout:fn=>{timers.set(++serial,fn);return serial},clearTimeout:id=>timers.delete(id),setInterval:fn=>{intervals.set(++serial,fn);return serial},clearInterval:id=>intervals.delete(id),requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id)};
 const context=vm.createContext(env),source=fs.readFileSync(path.join(__dirname,'../public/js4-engine.js'),'utf8').split('function fit(){')[0];
 vm.runInContext(source,context);
 const run=code=>vm.runInContext(code,context);
 return {context,run,timers,intervals,frames};
}
test('replaying or leaving cancels old game callbacks, including already queued work',()=>{
 const {run,context,timers,intervals,frames}=runtime();context.hits=[];
 run('beginGame();gameTimeout(()=>hits.push("old timeout"),20);gameInterval(()=>hits.push("old interval"),20);gameAnimation(()=>hits.push("old frame"))');
 const stale=[...timers.values(),...intervals.values(),...frames.values()];
 run('beginGame();gameTimeout(()=>hits.push("new run"),20)');
 stale.forEach(fn=>fn(100));assert.deepEqual(context.hits,[]);assert.equal(intervals.size,0);assert.equal(frames.size,0);assert.equal(timers.size,1);
 const [id,fire]=[...timers.entries()][0];timers.delete(id);fire();assert.deepEqual(context.hits,['new run']);
 run('disposeGame()');assert.equal(timers.size,0);assert.equal(run('gameTimeout(()=>hits.push("orphan"),1)'),0);
});
test('game keyboard listeners and camera cleanups are released exactly once',()=>{
 const {run,context}=runtime();let attached=0,released=0,cameraStops=0;
 context.target={addEventListener(){attached++},removeEventListener(){released++}};context.stopCamera=()=>cameraStops++;
 run('beginGame();gameListen(target,"keydown",()=>{});gameCleanup(stopCamera);disposeGame();disposeGame()');
 assert.equal(attached,1);assert.equal(released,1);assert.equal(cameraStops,1);
});
test('background tabs do not advance interval gameplay',()=>{
 const {run,context,intervals}=runtime();context.hits=[];
 run('beginGame();gameInterval(()=>hits.push(1),10)');const tick=[...intervals.values()][0];
 context.document.hidden=true;tick();assert.deepEqual(context.hits,[]);
 context.document.hidden=false;tick();assert.deepEqual(context.hits,[1]);
});

test('late account initialization preserves a game started while the request was pending',async()=>{
 let release,refreshes=0,renders=0,sides=0;
 const gate=new Promise(resolve=>{release=resolve});
 const db={collection:()=>({onSnapshot(){}})};
 const context=vm.createContext({window:{},standaloneDb:async()=>{await gate;return db},user:null,db:null,myId:'u_test',restoreLocalStats(){},loadAccountProfile:async()=>{},render(){renders++},renderSide(){sides++},refreshLiveStats(){refreshes++}});
 const source=fs.readFileSync(path.join(__dirname,'../public/js9-init.js'),'utf8');
 const pending=vm.runInContext(source.slice(source.lastIndexOf('(async()=>{')),context);
 context.playing='snake';release();await pending;
 assert.equal(renders,0);assert.equal(refreshes,1);assert.equal(sides,1);assert.equal(context.playing,'snake');
});
