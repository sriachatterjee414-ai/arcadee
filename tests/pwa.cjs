const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../public/sw.js'),'utf8');
function worker(){
 const events={},stored=[],removed=[],requests=[];let skip=0,claimed=0,unavailable=false,cached={page:'offline'},network={page:'online'};
 const context=vm.createContext({URL,Response,self:{location:{origin:'https://arcade.test'},addEventListener:(name,fn)=>events[name]=fn,clients:{claim:async()=>{claimed++}},skipWaiting:()=>{skip++}},caches:{open:async()=>({addAll:async files=>stored.push(...files)}),keys:async()=>['mochi-app-v0','mochi-app-v1','unrelated-cache'],delete:async name=>removed.push(name),match:async()=>cached},fetch:async req=>{requests.push(req);if(unavailable)throw Error('offline');return network}});
 vm.runInContext(source,context);
 return {events,stored,removed,requests,offline(){unavailable=true},setCached(value){cached=value},get skip(){return skip},get claimed(){return claimed},network,cached};
}
function request(w,url,mode='navigate',method='GET'){
 let response=null;
 w.events.fetch({request:{url,method,mode},respondWith:value=>response=value});
 return response;
}
test('phone app service worker never intercepts APIs, writes, external URLs or game scripts',()=>{
 const w=worker();
 for(const [url,mode,method] of [
  ['https://arcade.test/api/profile/me','navigate','GET'],['https://arcade.test/api','navigate','GET'],['https://arcade.test/api/chat','cors','POST'],['https://other.test/','navigate','GET'],['https://arcade.test/js2-core.js','no-cors','GET'],['https://arcade.test/','navigate','POST']
 ])assert.equal(request(w,url,mode,method),null);
 assert.equal(w.requests.length,0);
});
test('navigation uses live responses and falls back only to the public offline page',async()=>{
 const w=worker();assert.equal(await request(w,'https://arcade.test/'),w.network);
 w.offline();assert.equal(await request(w,'https://arcade.test/'),w.cached);
 assert.equal(await request(w,'https://arcade.test/icons/mochi-192.png','no-cors'),w.cached);
 w.setCached(undefined);assert.equal((await request(w,'https://arcade.test/')).type,'error');
});
test('installation caches only public fallback assets, cleans its own old cache, and updates on request',async()=>{
 const w=worker();let done;
 w.events.install({waitUntil:p=>done=p});await done;
 assert.equal(w.stored.length,4);assert.ok(w.stored.includes('/offline.html'));assert.ok(w.stored.every(file=>file==='/offline.html'||file.startsWith('/icons/')));assert.equal(w.skip,0);
 w.events.activate({waitUntil:p=>done=p});await done;assert.deepEqual(w.removed,['mochi-app-v0']);assert.equal(w.claimed,1);
 w.events.message({data:{type:'something-else'}});assert.equal(w.skip,0);
 w.events.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(w.skip,1);
});
