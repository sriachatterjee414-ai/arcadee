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
 const boughtHat=await api('/api/shop/purchase',{itemId:'party'});assert.equal(boughtHat.coins,27);assert.equal(boughtHat.equipment.hat,'party');
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
 let p=await api('/api/shop/purchase',{itemId:'cat'});assert.equal(p.diamonds,120);assert.equal(p.equipment.pet,'cat');
 p=await api('/api/shop/equip',{itemId:'cat'});assert.equal(p.equipment.pet,'cat');
 assert.equal((await api('/api/shop/purchase',{itemId:'cat'})).status,409);
 p=await api('/api/shop/purchase',{itemId:'dog'});assert.equal(p.diamonds,20);assert.equal(p.equipment.pet,'dog');
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

test('online Jenga validates turns, blocks, concurrent moves, collapse and score ownership',async()=>{
 await ready;
 const host=await api('/api/login',{name:'WalletTest',pin:'123456'}),guest=await api('/api/login',{name:'ShopFixture',pin:'123456'});
 token=host.token;const room=await api('/api/rooms',{game:'jenga'});assert.equal(room.game,'jenga');assert.equal(room.blocks.length,9);
 token=guest.token;await api('/api/rooms/'+room.code+'/join',{});
 assert.equal((await api('/api/rooms/'+room.code+'/move',{row:1,col:0})).status,409);
 token=host.token;
 for(const row of [0,8,-1,1.5])assert.equal((await api('/api/rooms/'+room.code+'/move',{row,col:0})).status,400);
 const attempts=await Promise.all([api('/api/rooms/'+room.code+'/move',{row:1,col:1}),api('/api/rooms/'+room.code+'/move',{row:2,col:0})]);
 assert.equal(attempts.filter(x=>x.turn==='guest').length,1);assert.equal(attempts.filter(x=>x.status===409).length,1);
 const after=await api('/api/rooms/'+room.code);assert.equal(after.pulls,1);
 // Make a separate deterministic tower: middle first, then edge; the guest tips it.
 const second=await api('/api/rooms',{game:'jenga'});token=guest.token;await api('/api/rooms/'+second.code+'/join',{});
 token=host.token;await api('/api/rooms/'+second.code+'/move',{row:1,col:1});
 token=guest.token;const lost=await api('/api/rooms/'+second.code+'/move',{row:1,col:0});
 assert.equal(lost.status,'complete');assert.equal(lost.winner,'host');assert.equal(lost.fallen,true);
 assert.equal((await api('/api/rooms/'+second.code+'/move',{row:2,col:0})).status,409);
 token=host.token;const players=await (await fetch('http://localhost:'+port+'/api/players')).json();assert.equal(players.find(p=>p.id===host.id).data.stats.jenga.w,1);
 const reward=await api('/api/game/reward',{game:'jenga'});assert.ok(reward.gameReward>0);
 assert.equal((await api('/api/game/reward',{game:'jenga'})).gameReward,0);
});

test('pocket games and café save scores, reward coins once, and count toward daily tasks',async()=>{
 await ready;const player=await api('/api/register',{name:'PocketTester',pin:'123456'});token=player.token;
 const stats={};for(const game of ['cloudhop','jellystack','startrail','garden','cafe']){
  stats[game]={p:1,w:1,pts:200,best:200,lv:['startrail','garden','cafe'].includes(game)?2:1};
  assert.equal((await api('/api/players/'+player.id,{stats,following:[]},'PUT')).status,200);
  const reward=await api('/api/game/reward',{game});assert.ok(reward.gameReward>=22);
  assert.equal((await api('/api/game/reward',{game})).gameReward,0);
  await api('/api/daily/activity',{game,won:true});
 }
 assert.equal((await api('/api/profile/me')).daily.challenges.find(x=>x.id==='try-three').progress,3);
});

test('global and personal chats preserve unicode and only expose DMs to participants',async()=>{
 await ready;const a=await api('/api/login',{name:'WalletTest',pin:'123456'}),b=await api('/api/login',{name:'ShopFixture',pin:'123456'}),outsider=await api('/api/login',{name:'PocketTester',pin:'123456'});
 token=a.token;const text='A little hello 🐰🌷 <script>not markup</script>';
 assert.equal((await api('/api/chat',{text})).status,201);
 assert.equal((await api('/api/direct/'+b.id,{text})).status,201);
 token=b.token;assert.equal((await api('/api/chat')).messages.at(-1).text,text);
 assert.equal((await api('/api/direct/'+a.id)).messages.at(-1).text,text);
 token=outsider.token;assert.equal((await api('/api/direct/'+a.id)).messages.length,0);
 token='';assert.equal((await api('/api/direct/'+a.id)).status,401);
});

test('Photo Booth rooms create, join, share captures and signals, and protect private strips',async()=>{
 await ready;
 const host=await api('/api/register',{name:'BoothHost',pin:'123456'}),guest=await api('/api/register',{name:'BoothGuest',pin:'123456'}),other=await api('/api/register',{name:'BoothOther',pin:'123456'});
 token='';assert.equal((await api('/api/rooms',{game:'booth'})).status,401);
 token=host.token;const room=await api('/api/rooms',{game:'booth'});
 assert.equal(room.game,'booth');assert.equal(room.status,'waiting');assert.match(room.code,/^[A-HJ-NP-Z2-9]{6}$/);assert.deepEqual(room.counts,{host:0,guest:0});
 token=guest.token;const joined=await api('/api/rooms/'+room.code+'/join',{});assert.equal(joined.game,'booth');assert.equal(joined.status,'playing');assert.equal(joined.role,'guest');
 const jpeg='data:image/jpeg;base64,/9j/2Q==';
 const guestShot=await api('/api/rooms/'+room.code+'/move',{image:jpeg});assert.equal(guestShot.counts.guest,1);
 token=host.token;const hostShot=await api('/api/rooms/'+room.code+'/move',{image:jpeg});assert.equal(hostShot.counts.host,1);assert.equal(hostShot.counts.guest,1);
 assert.deepEqual((await api('/api/rooms/'+room.code+'/shots')).shots,{host:[jpeg],guest:[jpeg]});
 const signal={type:'ready'};assert.equal((await api('/api/rooms/'+room.code+'/signal',{data:signal})).ok,true);
 token=guest.token;assert.deepEqual((await api('/api/rooms/'+room.code+'/signal')).messages,[{data:signal}]);assert.deepEqual((await api('/api/rooms/'+room.code+'/signal')).messages,[]);
 token=host.token;const cleared=await api('/api/rooms/'+room.code+'/move',{action:'clear'});assert.deepEqual(cleared.counts,{host:0,guest:1});
 token=other.token;
 assert.equal((await api('/api/rooms/'+room.code+'/join',{})).status,409);
 for(const suffix of ['', '/shots','/signal'])assert.equal((await api('/api/rooms/'+room.code+suffix)).status,403);
 assert.equal((await api('/api/rooms/'+room.code+'/move',{image:jpeg})).status,403);
});
