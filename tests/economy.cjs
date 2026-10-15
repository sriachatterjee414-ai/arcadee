const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-test-'));
const crypto=require('node:crypto');
fs.writeFileSync(path.join(dir,'data.json'),JSON.stringify({u_fixture:{name:'ShopFixture',stats:{snake:{p:15,w:4,pts:9000,best:1500,lv:5}},following:[],coins:500,diamonds:200,ownedItems:[],auth:{salt:'synthetic',pin:crypto.pbkdf2Sync('123456','synthetic',120000,32,'sha256').toString('hex')}}}));
const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'0',DATA_FILE:path.join(dir,'data.json'),SUPABASE_URL:'',SUPABASE_SECRET_KEY:'',SUPABASE_SERVICE_ROLE_KEY:''},stdio:['ignore','pipe','inherit']});
let port;
const ready=new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{const match=String(chunk).match(/running on (\d+)/);if(match){port=match[1];resolve()}});server.on('error',reject);server.on('exit',code=>reject(new Error('Server exited '+code)))});
after(async()=>{if(server.exitCode===null&&server.signalCode===null){const exited=new Promise(r=>server.once('exit',r));server.kill();await exited;}fs.rmSync(dir,{recursive:true,force:true})});
let token,uid;
async function api(url,data,method){const r=await fetch('http://localhost:'+port+url,{method:method||(data?'POST':'GET'),headers:{'Content-Type':'application/json',Authorization:'Bearer '+(token||'')},body:data?JSON.stringify(data):undefined});return {status:r.status,...await r.json()}}
test('wallet, claims, ownership, replay protection, concurrent debit, persistence',async()=>{
 await ready;
 const user=await api('/api/register',{name:'WalletTest',pin:'123456'});assert.equal(user.status,201);token=user.token;uid=user.id;
 let p=await api('/api/profile/me');assert.equal(p.diamonds,0);
 const gifts=await Promise.all([api('/api/daily/check-in',{}),api('/api/daily/check-in',{})]);
 p=await api('/api/profile/me');assert.equal(p.diamonds,3);assert.equal(p.coins,10);
 assert.equal((await api('/api/shop/equip',{itemId:'cat'})).status,403);
 assert.equal((await api('/api/shop/purchase',{itemId:'cat'})).status,400);
 await api('/api/daily/activity',{game:'ttt',won:true});
 await api('/api/daily/claim',{challengeId:'win-one'});assert.equal((await api('/api/daily/claim',{challengeId:'win-one'})).status,409);
 p=await api('/api/profile/me');assert.equal(p.diamonds,5);assert.equal(p.coins,35);
 await api('/api/players/'+uid,{stats:{snake:{p:1,w:1,pts:1000,best:1000,lv:2}},following:[]},'PUT');
 p=await api('/api/game/reward',{game:'snake'});assert.equal(p.gameReward,82);assert.equal(p.coins,117);
 assert.equal((await api('/api/game/reward',{game:'snake'})).gameReward,0);
 assert.equal((await api('/api/shop/purchase',{itemId:'party'})).coins,27);
 p=await api('/api/shop/equip',{itemId:'party'});assert.equal(p.equipment.hat,'party');
 const revives=await Promise.all([api('/api/game/revive',{}),api('/api/game/revive',{})]);assert.deepEqual(revives.map(x=>x.status).sort(),[200,400]);
 p=await api('/api/profile/me');assert.equal(p.coins,2);assert.equal(p.equipment.hat,'party');
 assert.equal((await api('/api/shop/equip',{itemId:'rabbit'})).equipment.pet,'rabbit');
 assert.equal((await api('/api/game/reward',{game:'photo'})).status,400);
 const stored=JSON.parse(fs.readFileSync(path.join(dir,'data.json'),'utf8'))[uid];assert.equal(stored.coins,2);assert.equal(stored.diamonds,5);assert.equal(stored.equipment.hat,'party');
});

test('premium pets, themes and repeatable lucky boxes',async()=>{
 await ready;
 const user=await api('/api/login',{name:'ShopFixture',pin:'123456'});token=user.token;
 assert.equal((await api('/api/game/reward',{game:'snake'})).gameReward,0);
 let p=await api('/api/shop/purchase',{itemId:'cat'});assert.equal(p.diamonds,120);
 p=await api('/api/shop/equip',{itemId:'cat'});assert.equal(p.equipment.pet,'cat');
 assert.equal((await api('/api/shop/purchase',{itemId:'cat'})).status,409);
 p=await api('/api/shop/purchase',{itemId:'dog'});assert.equal(p.diamonds,20);
 p=await api('/api/shop/equip',{itemId:'dog'});assert.equal(p.equipment.pet,'dog');
 await api('/api/shop/purchase',{itemId:'mint'});
 p=await api('/api/shop/equip',{itemId:'mint'});assert.equal(p.equipment.theme,'mint');
 for(let i=0;i<3;i++){
  const before=p;p=await api('/api/shop/purchase',{itemId:'lucky'});assert.equal(p.status,200);
  const prize=p.lastBox;assert.ok(['coins','diamonds'].includes(prize.currency));
  assert.ok(prize.amount>=(prize.currency==='coins'?10:1)&&prize.amount<=(prize.currency==='coins'?50:3));
  assert.equal(p.coins,before.coins-30+(prize.currency==='coins'?prize.amount:0));
  assert.equal(p.diamonds,before.diamonds+(prize.currency==='diamonds'?prize.amount:0));
 }
 assert.equal((await api('/api/shop/equip',{itemId:'lucky'})).status,404);
});

test('existing multiplayer joins, moves and next round remain playable',async()=>{
 await ready;
 const host=await api('/api/login',{name:'WalletTest',pin:'123456'});
 const guest=await api('/api/login',{name:'ShopFixture',pin:'123456'});
 for(const game of ['ttt','rps']){
  token=host.token;const room=await api('/api/rooms',{game});assert.equal(room.game,game);
  token=guest.token;const joined=await api('/api/rooms/'+room.code+'/join',{});assert.equal(joined.status,'playing');
  if(game==='ttt'){
   for(const [index,who] of [[0,host],[3,guest],[1,host],[4,guest],[2,host]]){token=who.token;const result=await api('/api/rooms/'+room.code+'/move',{index});assert.ok(result.board);if(index===2)assert.equal(result.winner,'host')}
  }else{
   token=host.token;await api('/api/rooms/'+room.code+'/move',{choice:'rock'});
   token=guest.token;const result=await api('/api/rooms/'+room.code+'/move',{choice:'scissors'});assert.equal(result.scores.host,1);
   const next=await api('/api/rooms/'+room.code+'/move',{action:'next'});assert.equal(next.round,2);
  }
 }
});
