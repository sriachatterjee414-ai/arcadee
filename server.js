// Arcade Hub backend: durable Supabase mode + local fallback.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const FILE = process.env.DATA_FILE || path.join(__dirname,'data.json');
const PUB = path.join(__dirname,'public');
const SB_URL = String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const SB_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const durable = !!(SB_URL && SB_KEY);
const SHOP_ITEMS=[
  {id:'neon',name:'Neon Arcade Theme',description:'A bright arcade palette for your whole cabinet.',price:80,type:'theme'},
  {id:'ocean',name:'Ocean Arcade Theme',description:'A cool blue-green look for your games.',price:70,type:'theme'},
  {id:'sunset',name:'Sunset Arcade Theme',description:'Warm peach and coral colors for your arcade.',price:70,type:'theme'}
];
const VALID_GAMES=new Set(['snake','tiles','ttt','rps','mem','react','guess','math','bird','g2048','word','m3','jenga','ludo','chess','bubble','beat','boba','fruit','golf','cat','race','cook','snl','sudoku','mystery','tetris','water','wordsearch','photo','simon','whack','slide','sketch','mines','c4','hangman','hilo','stroop']);
let local = {};
try{local=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){local={}}
if(!local || typeof local!=='object' || Array.isArray(local)) local={};
if(!local.chat) local.chat=[];
if(!local.direct) local.direct=[];
if(!local.rooms||typeof local.rooms!=='object')local.rooms={};
if(!process.env.SESSION_SECRET&&!SB_KEY&&!local.sessionSecret){local.sessionSecret=crypto.randomBytes(32).toString('base64url');try{fs.writeFileSync(FILE,JSON.stringify(local,null,2))}catch(e){}}
const SESSION_SECRET=process.env.SESSION_SECRET||SB_KEY||local.sessionSecret;
const n=x=>Math.max(0,Math.min(1e7,+x||0));
const clean=s=>{const o={};Object.keys(s||{}).slice(0,60).forEach(k=>{const v=s[k]||{};o[k]={p:n(v.p),w:n(v.w),pts:n(v.pts),best:n(v.best),lv:Math.min(30,n(v.lv)||1)}});return o};
function mergeStats(current,incoming){const merged=clean(current);for(const [key,value] of Object.entries(clean(incoming))){const old=merged[key]||{p:0,w:0,pts:0,best:0,lv:1};merged[key]={p:Math.max(old.p,value.p),w:Math.max(old.w,value.w),pts:Math.max(old.pts,value.pts),best:Math.max(old.best,value.best),lv:Math.max(old.lv,value.lv)}}return merged}
const normalizeName=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
const validName=s=>/^[A-Za-z0-9 _-]{2,16}$/.test(String(s||'').trim());
const validPin=s=>/^\d{4,8}$/.test(String(s||''));
const hashPin=(pin,salt)=>crypto.pbkdf2Sync(String(pin),salt,120000,32,'sha256').toString('hex');
const id=()=> 'u_'+crypto.randomBytes(9).toString('base64url');
const token=uid=>{const payload=Buffer.from(JSON.stringify({id:uid,exp:Date.now()+365*24*60*60*1000})).toString('base64url');const signature=crypto.createHmac('sha256',SESSION_SECRET).update(payload).digest('base64url');return payload+'.'+signature};
function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function body(req,cb){let b='';req.on('data',c=>{b+=c;if(b.length>250000)req.destroy()});req.on('end',()=>{try{cb(JSON.parse(b||'{}'))}catch(e){json(req.res,400,{error:'Invalid JSON'})}})}
function saveLocal(){return fs.promises.writeFile(FILE,JSON.stringify(local,null,2))}
async function sb(pathname,opts={}){const r=await fetch(SB_URL+'/rest/v1/'+pathname,{...opts,headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',...(opts.headers||{})}});const text=await r.text();let data=null;try{data=JSON.parse(text)}catch(e){}if(!r.ok)throw new Error((data&&data.message)||text||('Supabase '+r.status));return data}
async function sbUserByName(name){const q=encodeURIComponent(normalizeName(name));const a=await sb('arcade_users?select=*&username_normalized=eq.'+q+'&limit=1');return a[0]||null}
async function getPlayers(){if(!durable){return Object.entries(local).filter(([k,v])=>/^u_/.test(k)&&v&&typeof v==='object'&&!Array.isArray(v)).map(([id,v])=>({id,data:{stats:v.stats||{},following:v.following||[],name:v.name||'',badges:earnedBadges(v.stats||{},v.loginStreak||0)}}))}
 let users;try{users=await sb('arcade_users?select=id,username,stats,following,login_streak&order=username.asc')}catch(e){console.error('getPlayers fallback (run the SQL migration):',e.message);users=await sb('arcade_users?select=id,username,stats,following&order=username.asc')}return users.map(u=>({id:u.id,data:{stats:u.stats||{},following:Array.isArray(u.following)?u.following:[],name:u.username||'',badges:earnedBadges(u.stats||{},u.login_streak||0)}}))}
function sessionId(req){const h=req.headers.authorization||'';const t=h.startsWith('Bearer ')?h.slice(7):'',parts=t.split('.');if(parts.length!==2)return null;const expected=crypto.createHmac('sha256',SESSION_SECRET).update(parts[0]).digest(),actual=Buffer.from(parts[1],'base64url');if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return null;try{const payload=JSON.parse(Buffer.from(parts[0],'base64url').toString());return payload.id&&payload.exp>Date.now()?payload.id:null}catch(e){return null}}
async function requireUser(req){return sessionId(req)}
async function register(name,pin){if(durable){if(await sbUserByName(name))throw Object.assign(new Error('That username is already taken.'),{code:409});const salt=crypto.randomBytes(16).toString('hex');const uid=id();await sb('arcade_users',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:uid,username:name,username_normalized:normalizeName(name),pin_salt:salt,pin_hash:hashPin(pin,salt),stats:{},following:[],coins:0,login_streak:0,daily:{},owned_items:[]})});return {id:uid,name}}
 if(Object.values(local).some(v=>v&&v.name&&normalizeName(v.name)===normalizeName(name)))throw Object.assign(new Error('That username is already taken.'),{code:409});const uid=id(),salt=crypto.randomBytes(16).toString('hex');local[uid]={name,stats:{},following:[],coins:0,loginStreak:0,lastLoginDate:null,daily:{},ownedItems:[],auth:{salt,pin:hashPin(pin,salt)}};await saveLocal();return{id:uid,name}}
async function login(name,pin){if(durable){const p=await sbUserByName(name);if(!p)throw new Error('Username or PIN is incorrect.');const expected=hashPin(pin,p.pin_salt);if(expected!==p.pin_hash)throw new Error('Username or PIN is incorrect.');return{id:p.id,name:p.username}}
 for(const [uid,p] of Object.entries(local)){if(p&&p.name&&normalizeName(p.name)===normalizeName(name)){if(p.auth&&hashPin(pin,p.auth.salt)===p.auth.pin)return{id:uid,name:p.name}}}throw new Error('Username or PIN is incorrect.')}
async function savePlayer(uid,d){if(durable){const old=(await sb('arcade_users?select=following,username,stats&id=eq.'+encodeURIComponent(uid)+'&limit=1'))[0];if(!old)throw Object.assign(new Error('Account not found.'),{code:404});await sb('arcade_users?id=eq.'+encodeURIComponent(uid),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({stats:mergeStats(old.stats,d.stats),following:(Array.isArray(d.following)?d.following:[]).slice(0,500).map(String),updated_at:new Date().toISOString()})});return}
 if(!local[uid])throw Object.assign(new Error('Account not found.'),{code:404});local[uid]={...local[uid],stats:mergeStats(local[uid].stats,d.stats),following:(Array.isArray(d.following)?d.following:[]).slice(0,500).map(String)};await saveLocal()}
const today=()=>new Date().toISOString().slice(0,10);
const freshDaily=state=>state&&state.date===today()?{date:state.date,plays:Array.isArray(state.plays)?state.plays:[],wins:Array.isArray(state.wins)?state.wins:[],claimed:Array.isArray(state.claimed)?state.claimed:[]}:{date:today(),plays:[],wins:[],claimed:[]};
const challengeList=d=>[
 {id:'play-one',name:'Warm up',description:'Finish any game today.',progress:Math.min(1,d.plays.length),goal:1,reward:15},
 {id:'win-one',name:'Take a win',description:'Win a game today.',progress:Math.min(1,d.wins.length),goal:1,reward:25},
 {id:'try-three',name:'Mix it up',description:'Finish three different games today.',progress:Math.min(3,d.plays.length),goal:3,reward:30}
];
function earnedBadges(stats={},streak=0){
 const rows=Object.values(stats||{}),plays=rows.reduce((n,x)=>n+(x?.p||0),0),wins=rows.reduce((n,x)=>n+(x?.w||0),0),games=rows.filter(x=>(x?.p||0)>0).length;
 return [
  ...(plays>=1?[{id:'first-play',name:'First Round',description:'Played your first game.',icon:'🎮'}]:[]),
  ...(wins>=1?[{id:'first-win',name:'First Win',description:'Won your first game.',icon:'🏆'}]:[]),
  ...(games>=5?[{id:'explorer',name:'Game Explorer',description:'Played five different games.',icon:'🧭'}]:[]),
  ...(wins>=10?[{id:'champion',name:'Arcade Champion',description:'Won ten games.',icon:'⭐'}]:[]),
  ...(streak>=7?[{id:'streak7',name:'Seven-Day Streak',description:'Checked in seven days in a row.',icon:'🔥'}]:[])
 ];
}
async function getAccount(uid){
 if(durable){const rows=await sb('arcade_users?select=id,username,stats,following,coins,login_streak,last_login_date,daily,owned_items,updated_at&id=eq.'+encodeURIComponent(uid)+'&limit=1');if(!rows[0])throw Object.assign(new Error('Account not found.'),{code:404});return rows[0]}
 const u=local[uid];if(!u)throw Object.assign(new Error('Account not found.'),{code:404});
 return {...u,login_streak:u.loginStreak||0,last_login_date:u.lastLoginDate||null,owned_items:u.ownedItems||[],daily:u.daily||{},updated_at:u.updatedAt||''};
}
async function patchAccount(uid,current,patch){
 const stamp=new Date().toISOString();
 if(durable){
  const query='arcade_users?id=eq.'+encodeURIComponent(uid)+'&updated_at=eq.'+encodeURIComponent(current.updated_at);
  const rows=await sb(query,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...patch,updated_at:stamp})});
  if(!Array.isArray(rows)||!rows.length)throw Object.assign(new Error('Your account changed in another tab. Please try again.'),{code:409});
  return rows[0];
 }
 const u=local[uid];if(!u)throw Object.assign(new Error('Account not found.'),{code:404});
 const next={...u,...patch,updatedAt:stamp};if('login_streak'in patch)next.loginStreak=patch.login_streak;if('last_login_date'in patch)next.lastLoginDate=patch.last_login_date;if('owned_items'in patch)next.ownedItems=patch.owned_items;local[uid]=next;await saveLocal();return {...next,login_streak:next.loginStreak||0,last_login_date:next.lastLoginDate||null,owned_items:next.ownedItems||[],updated_at:next.updatedAt};
}
async function mutateAccount(uid,change){
 for(let i=0;i<3;i++){const current=await getAccount(uid),patch=change(current);if(!patch)return current;try{return await patchAccount(uid,current,patch)}catch(e){if(e.code!==409||i===2)throw e}}
}
function profileView(u,extra={}){
 const daily=freshDaily(u.daily),challenges=challengeList(daily);
 return {coins:Math.max(0,+u.coins||0),loginStreak:Math.max(0,+u.login_streak||0),lastLoginDate:u.last_login_date||null,checkedInToday:u.last_login_date===today(),ownedItems:Array.isArray(u.owned_items)?u.owned_items:[],daily:{date:daily.date,plays:daily.plays,wins:daily.wins,claimed:daily.claimed,challenges:challenges.map(c=>({...c,claimed:daily.claimed.includes(c.id)}))},badges:earnedBadges(u.stats||{},u.login_streak||0),...extra};
}
async function checkIn(uid){
 let reward=0;
 const u=await mutateAccount(uid,current=>{
  const date=today();if(current.last_login_date===date)return null;
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10),streak=current.last_login_date===yesterday?(+current.login_streak||0)+1:1;
  reward=10+Math.min(7,streak-1)*5;
  return {coins:Math.max(0,+current.coins||0)+reward,login_streak:streak,last_login_date:date};
 });
 return profileView(u,{checkInReward:reward});
}
async function addDailyActivity(uid,game,won){
 if(!VALID_GAMES.has(game))throw Object.assign(new Error('That game is not recognized.'),{code:400});
 return mutateAccount(uid,current=>{const d=freshDaily(current.daily);let changed=false;if(!d.plays.includes(game)){d.plays.push(game);changed=true}if(won&&!d.wins.includes(game)){d.wins.push(game);changed=true}return changed?{daily:d}:null});
}
async function claimChallenge(uid,challengeId){
 const rewards={ 'play-one':15,'win-one':25,'try-three':30 };
 if(!Object.prototype.hasOwnProperty.call(rewards,challengeId))throw Object.assign(new Error('Challenge not found.'),{code:404});
 return mutateAccount(uid,current=>{
  const daily=freshDaily(current.daily),challenge=challengeList(daily).find(c=>c.id===challengeId);
  if(daily.claimed.includes(challengeId))throw Object.assign(new Error('You already claimed this challenge.'),{code:409});
  if(challenge.progress<challenge.goal)throw Object.assign(new Error('Finish the challenge before claiming its coins.'),{code:400});
  daily.claimed.push(challengeId);return {daily,coins:Math.max(0,+current.coins||0)+rewards[challengeId]};
 });
}
async function purchaseItem(uid,itemId){
 const item=SHOP_ITEMS.find(x=>x.id===itemId);if(!item)throw Object.assign(new Error('Shop item not found.'),{code:404});
 return mutateAccount(uid,current=>{const owned=Array.isArray(current.owned_items)?current.owned_items:[];if(owned.includes(item.id))throw Object.assign(new Error('You already own this theme.'),{code:409});const coins=Math.max(0,+current.coins||0);if(coins<item.price)throw Object.assign(new Error('Not enough coins yet. Complete daily challenges to earn more.'),{code:400});return {coins:coins-item.price,owned_items:[...owned,item.id]}});
}
const ROOM_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const roomCode=()=>Array.from({length:6},()=>ROOM_ALPHABET[crypto.randomInt(ROOM_ALPHABET.length)]).join('');
function newRoomState(game){if(game==='booth')return{shots:{host:[],guest:[]}};return game==='ttt'?{board:Array(9).fill(null),turn:'host',winner:null,draw:false}:{round:1,scores:{host:0,guest:0},picks:{},lastResult:null}}
async function getRoom(code){
 if(durable){const rows=await sb('arcade_rooms?select=*&room_code=eq.'+encodeURIComponent(code)+'&limit=1');if(!rows[0])throw Object.assign(new Error('Room not found. Check the code and try again.'),{code:404});return rows[0]}
 const room=local.rooms[code];if(!room)throw Object.assign(new Error('Room not found. Check the code and try again.'),{code:404});return room;
}
function roomView(room,uid){
 const role=uid===room.host_id?'host':'guest',opponent=role==='host'?'guest':'host',state=room.state||{};
 if(room.game==='booth'){const sh=state.shots||{};return {code:room.room_code,game:'booth',status:room.status,hostName:room.host_name,guestName:room.guest_name||null,role,counts:{host:(sh.host||[]).length,guest:(sh.guest||[]).length}}}
 if(room.game==='ttt')return {code:room.room_code,game:room.game,status:room.status,hostName:room.host_name,guestName:room.guest_name||null,role,board:state.board||Array(9).fill(null),turn:state.turn,winner:state.winner,draw:!!state.draw};
 return {code:room.room_code,game:room.game,status:room.status,hostName:room.host_name,guestName:room.guest_name||null,role,round:state.round||1,scores:state.scores||{host:0,guest:0},myPick:(state.picks||{})[role]||null,opponentReady:!!(state.picks||{})[opponent],lastResult:state.lastResult||null,winner:state.winner||null};
}
async function createRoom(uid,game){
 if(!['ttt','rps','booth'].includes(game))throw Object.assign(new Error('Online play is available for Tic-Tac-Toe, Rock-Paper-Scissors and Photo Booth.'),{code:400});
 const u=await getAccount(uid),name=u.username||u.name||'Player';let code,room;
 for(let i=0;i<4;i++){code=roomCode();try{await getRoom(code)}catch(e){if(e.code===404)break;throw e}}
 room={room_code:code,game,host_id:uid,host_name:name,guest_id:null,guest_name:null,status:'waiting',state:newRoomState(game),created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
 if(durable)await sb('arcade_rooms',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(room)});else{local.rooms[code]=room;await saveLocal()}
 return roomView(room,uid);
}
async function saveRoom(room,patch){
 const stamp=new Date().toISOString();
 if(durable){const rows=await sb('arcade_rooms?room_code=eq.'+encodeURIComponent(room.room_code)+'&updated_at=eq.'+encodeURIComponent(room.updated_at),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...patch,updated_at:stamp})});if(!Array.isArray(rows)||!rows.length)throw Object.assign(new Error('The room changed. Refreshing the game—please try again.'),{code:409});return rows[0]}
 const next={...room,...patch,updated_at:stamp};local.rooms[room.room_code]=next;await saveLocal();return next;
}
async function joinRoom(uid,code){
 const room=await getRoom(code);if(room.host_id===uid)return roomView(room,uid);if(room.guest_id===uid)return roomView(room,uid);
 if(room.status!=='waiting'||room.guest_id)throw Object.assign(new Error('That room already has two players.'),{code:409});
 const u=await getAccount(uid);return roomView(await saveRoom(room,{guest_id:uid,guest_name:u.username||u.name||'Player',status:'playing'}),uid);
}
const SIGNALS=new Map();
function sigBox(code){let b=SIGNALS.get(code);if(!b){b={host:[],guest:[],t:0};SIGNALS.set(code,b)}b.t=Date.now();return b}
setInterval(()=>{const now=Date.now();for(const [k,v] of SIGNALS)if(now-v.t>3600000)SIGNALS.delete(k)},600000).unref();
function roomRole(room,uid){if(uid===room.host_id)return'host';if(uid===room.guest_id)return'guest';throw Object.assign(new Error('You are not a player in this room.'),{code:403})}
async function recordOnlineResult(room,winnerId,draw){
 for(const uid of [room.host_id,room.guest_id]){
  if(!uid)continue;const account=await getAccount(uid),stats=clean(account.stats||{}),score=draw?25:uid===winnerId?100:10;
  const old=stats[room.game]||{p:0,w:0,pts:0,best:0,lv:1};
  stats[room.game]={p:old.p+1,w:old.w+(uid===winnerId?1:0),pts:old.pts+score,best:Math.max(old.best,score),lv:old.lv};
  await savePlayer(uid,{stats,following:Array.isArray(account.following)?account.following:[]});
  await addDailyActivity(uid,room.game,uid===winnerId);
 }
}
async function roomMove(uid,room,move){
 const role=roomRole(room,uid);if(room.status!=='playing')throw Object.assign(new Error('This room is not accepting moves.'),{code:409});
 const state={...(room.state||{})};
 if(room.game==='booth'){
  let current=room;
  for(let i=0;i<3;i++){
   const sh=(current.state&&current.state.shots)||{},shots={host:[...(sh.host||[])],guest:[...(sh.guest||[])]};
   if(move.action==='clear')shots[role]=[];
   else{const img=String(move.image||'');if(!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(img)||img.length>160000)throw Object.assign(new Error('That photo could not be used. Please try again.'),{code:400});if(shots[role].length>=4)throw Object.assign(new Error('You already have four photos. Tap Retake to start over.'),{code:409});shots[role].push(img)}
   try{return roomView(await saveRoom(current,{state:{...(current.state||{}),shots}}),uid)}catch(e){if(e.code!==409||i===2)throw e;current=await getRoom(current.room_code)}
  }
 }
 if(room.game==='ttt'){
  const index=Number(move.index),board=Array.isArray(state.board)?state.board.slice():Array(9).fill(null);
  if(state.turn!==role)throw Object.assign(new Error('Wait for your turn.'),{code:409});
  if(!Number.isInteger(index)||index<0||index>8||board[index])throw Object.assign(new Error('That square is not available.'),{code:400});
  board[index]=role==='host'?'X':'O';const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],won=lines.some(line=>line.every(i=>board[i]===board[index])),draw=!won&&board.every(Boolean);
  const next={...state,board,turn:role==='host'?'guest':'host',winner:won?role:null,draw};
  const saved=await saveRoom(room,{state:next,status:won||draw?'complete':'playing'});if(won||draw)try{await recordOnlineResult(room,won?(role==='host'?room.host_id:room.guest_id):null,draw)}catch(e){console.error('Could not record online game result:',e.message)}return roomView(saved,uid);
 }
 const hand=String(move.choice||'');if(!['rock','paper','scissors'].includes(hand))throw Object.assign(new Error('Choose rock, paper, or scissors.'),{code:400});
 const picks={...(state.picks||{})};if(picks[role])throw Object.assign(new Error('You have already picked this round.'),{code:409});picks[role]=hand;
 let next={...state,picks};let status='playing';
 if(picks.host&&picks.guest){
  const result=picks.host===picks.guest?'draw':({rock:'scissors',paper:'rock',scissors:'paper'}[picks.host]===picks.guest?'host':'guest');
  const scores={...(state.scores||{host:0,guest:0})};if(result!=='draw')scores[result]=(scores[result]||0)+1;
  const winner=scores.host>=3?'host':scores.guest>=3?'guest':null;
  next={...next,scores,winner,lastResult:{host:picks.host,guest:picks.guest,winner:result}};if(winner){next.winner=winner;status='complete'}
 }
 const saved=await saveRoom(room,{state:next,status});if(status==='complete')try{const winnerId=next.winner==='host'?room.host_id:room.guest_id;await recordOnlineResult(room,winnerId,false)}catch(e){console.error('Could not record online game result:',e.message)}return roomView(saved,uid);
}
async function nextRoomRound(uid,room){
 const role=roomRole(room,uid),state=room.state||{};if(room.game!=='rps'||room.status!=='playing'||!state.lastResult)throw Object.assign(new Error('The next round is not ready yet.'),{code:409});
 const next={...state,round:(state.round||1)+1,picks:{},lastResult:null};return roomView(await saveRoom(room,{state:next}),uid);
}
async function chatGet(){if(!durable)return local.chat.slice(-100);const rows=await sb('arcade_chat?select=id,user_id,text,created_at,username&order=id.desc&limit=100');return rows.reverse().map(x=>({id:x.user_id,name:x.username||'Player',text:x.text,createdAt:x.created_at}))}
async function chatPost(uid,text){if(durable){const p=(await sb('arcade_users?select=username&id=eq.'+encodeURIComponent(uid)+'&limit=1'))[0];await sb('arcade_chat',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:uid,username:p?.username||'Player',text:text.slice(0,300)})});return}
 local.chat.push({id:uid,name:local[uid]?.name||'Player',text:text.slice(0,300),createdAt:new Date().toISOString()});local.chat=local.chat.slice(-100);await saveLocal()}
async function directGet(uid,other){
 if(uid===other)throw Object.assign(new Error('Choose another player.'),{code:400});
 if(!durable){if(!local[other])throw Object.assign(new Error('Player not found.'),{code:404});return local.direct.filter(m=>(m.senderId===uid&&m.recipientId===other)||(m.senderId===other&&m.recipientId===uid)).slice(-200).map(m=>({id:m.senderId,senderId:m.senderId,name:m.name,text:m.text,createdAt:m.createdAt}))}
  const select='?select=id,sender_id,recipient_id,sender_name,text,created_at&order=id.asc&limit=200';
  const [sent,received]=await Promise.all([sb('arcade_direct_messages'+select+'&sender_id=eq.'+encodeURIComponent(uid)+'&recipient_id=eq.'+encodeURIComponent(other)),sb('arcade_direct_messages'+select+'&sender_id=eq.'+encodeURIComponent(other)+'&recipient_id=eq.'+encodeURIComponent(uid))]);
  return sent.concat(received).sort((a,b)=>a.id-b.id).slice(-200).map(m=>({id:m.id,senderId:m.sender_id,name:m.sender_name||'Player',text:m.text,createdAt:m.created_at}));
}
async function directPost(uid,other,text){
 if(uid===other)throw Object.assign(new Error('Choose another player.'),{code:400});
 if(!durable){if(!local[uid]||!local[other])throw Object.assign(new Error('Player not found.'),{code:404});local.direct.push({senderId:uid,recipientId:other,name:local[uid].name||'Player',text:text.slice(0,300),createdAt:new Date().toISOString()});local.direct=local.direct.slice(-5000);await saveLocal();return}
 const users=await sb('arcade_users?select=id,username&id=in.('+encodeURIComponent(uid)+','+encodeURIComponent(other)+')');
 if(!users.some(user=>user.id===uid)||!users.some(user=>user.id===other))throw Object.assign(new Error('Player not found.'),{code:404});
 const sender=users.find(user=>user.id===uid);
 await sb('arcade_direct_messages',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({sender_id:uid,recipient_id:other,sender_name:sender.username||'Player',text:text.slice(0,300)})});
}
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp'};
 http.createServer(async(req,res)=>{req.res=res;const u=new URL(req.url,'http://x');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
 try{
  if(u.pathname==='/api/status'&&req.method==='GET'){const out={ok:true,durable,provider:durable?'supabase':'local'};if(durable){out.supabaseProject=SB_URL.replace(/^https?:\/\//,'').split('.')[0];const checks={'users.coins':'arcade_users?select=coins&limit=1','users.login_streak':'arcade_users?select=login_streak&limit=1','users.daily':'arcade_users?select=daily&limit=1','users.owned_items':'arcade_users?select=owned_items&limit=1','table arcade_chat':'arcade_chat?select=id&limit=1','table arcade_direct_messages':'arcade_direct_messages?select=id&limit=1','table arcade_rooms':'arcade_rooms?select=room_code&limit=1'};out.missing=[];for(const [label,q] of Object.entries(checks)){try{await sb(q)}catch(e){out.missing.push(label+' -> '+e.message)}}out.schemaOk=out.missing.length===0}return json(res,200,out)}
  if(u.pathname==='/api/players'&&req.method==='GET')return json(res,200,await getPlayers());
  if(u.pathname==='/api/register'&&req.method==='POST')return body(req,async d=>{try{const name=String(d.name||'').trim().replace(/\s+/g,' '),pin=String(d.pin||'');if(!validName(name))return json(res,400,{error:'Username must be 2-16 characters and use letters, numbers, spaces, _ or -.'});if(!validPin(pin))return json(res,400,{error:'PIN must be 4-8 digits.'});const v=await register(name,pin);json(res,201,{ok:true,...v,token:token(v.id)})}catch(e){json(res,e.code||500,{error:e.message||'Could not create account.'})}});
  if(u.pathname==='/api/login'&&req.method==='POST')return body(req,async d=>{try{const v=await login(String(d.name||'').trim(),String(d.pin||''));json(res,200,{ok:true,...v,token:token(v.id)})}catch(e){json(res,e.code||401,{error:e.message})}});
  if(u.pathname==='/api/session'&&req.method==='GET'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Not logged in.'});try{let name='';if(durable){const r=await sb('arcade_users?select=id,username&id=eq.'+encodeURIComponent(uid)+'&limit=1');if(!r[0])return json(res,401,{error:'Not logged in.'});name=r[0].username||''}else{const lu=local[uid];if(!lu)return json(res,401,{error:'Not logged in.'});name=lu.name||''}return json(res,200,{ok:true,id:uid,name})}catch(e){console.error('Session check failed:',e.message);return json(res,503,{error:'Could not verify session: '+e.message})}}
  if(u.pathname==='/api/players/me'&&req.method==='PUT'){const uid=await requireUser(req);if(!uid)return json(res,401,{error:'Please log in again.'});return body(req,async d=>{try{await savePlayer(uid,d);json(res,200,{ok:true})}catch(e){json(res,e.code||500,{error:e.message})}})}
  const pm=u.pathname.match(/^\/api\/players\/([\w-]{1,80})$/);if(pm&&req.method==='PUT'){const uid=await requireUser(req);if(!uid||uid!==pm[1])return json(res,401,{error:'Please log in again.'});return body(req,async d=>{try{await savePlayer(uid,d);json(res,200,{ok:true})}catch(e){json(res,e.code||500,{error:e.message})}})}
   if(u.pathname==='/api/profile/me'&&req.method==='GET'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{return json(res,200,profileView(await getAccount(uid)))}catch(e){return json(res,e.code||500,{error:e.message})}}
   if(u.pathname==='/api/daily/check-in'&&req.method==='POST'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{return json(res,200,await checkIn(uid))}catch(e){return json(res,e.code||500,{error:e.message})}}
   if(u.pathname==='/api/daily/activity'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{await addDailyActivity(uid,String(d.game||''),d.won===true);json(res,200,profileView(await getAccount(uid)))}catch(e){json(res,e.code||500,{error:e.message})}});
   if(u.pathname==='/api/daily/claim'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{const u=await claimChallenge(uid,String(d.challengeId||''));json(res,200,profileView(u))}catch(e){json(res,e.code||500,{error:e.message})}});
   if(u.pathname==='/api/shop'&&req.method==='GET'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{const u=await getAccount(uid);return json(res,200,{items:SHOP_ITEMS,profile:profileView(u)})}catch(e){return json(res,e.code||500,{error:e.message})}}
   if(u.pathname==='/api/shop/purchase'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in again.'});try{const u=await purchaseItem(uid,String(d.itemId||''));json(res,200,profileView(u))}catch(e){json(res,e.code||500,{error:e.message})}});
   if(u.pathname==='/api/rooms'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in to create an invite room.'});try{json(res,201,await createRoom(uid,String(d.game||'')))}catch(e){json(res,e.code||500,{error:e.message})}});
   if(u.pathname==='/api/rtc-config'&&req.method==='GET'){if(!sessionId(req))return json(res,401,{error:'Please log in.'});const ice=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];if(process.env.TURN_URL)ice.push({urls:process.env.TURN_URL.split(',').map(x=>x.trim()),username:process.env.TURN_USERNAME||'',credential:process.env.TURN_CREDENTIAL||''});return json(res,200,{iceServers:ice})}
   const roomMatch=u.pathname.match(/^\/api\/rooms\/([A-HJ-NP-Z2-9]{6})(?:\/(join|move|shots|signal))?$/);
   if(roomMatch){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Please log in to join online games.'});const code=roomMatch[1].toUpperCase();try{
    if(roomMatch[2]==='signal'){const room=await getRoom(code);const role=roomRole(room,uid),other=role==='host'?'guest':'host',box=sigBox(code);
     if(req.method==='GET'){const out=box[role];box[role]=[];return json(res,200,{messages:out})}
     if(req.method==='POST')return body(req,async d=>{const raw=JSON.stringify(d.data||{});if(raw.length>20000)return json(res,400,{error:'Signal too large.'});box[other].push({data:d.data});if(box[other].length>300)box[other].splice(0,box[other].length-300);json(res,200,{ok:true})})}
    if(req.method==='GET'&&roomMatch[2]==='shots'){const room=await getRoom(code);roomRole(room,uid);const sh=(room.state&&room.state.shots)||{};return json(res,200,{shots:{host:sh.host||[],guest:sh.guest||[]}})}
    if(req.method==='GET'&&!roomMatch[2]){const room=await getRoom(code);roomRole(room,uid);return json(res,200,roomView(room,uid))}
    if(req.method==='POST'&&roomMatch[2]==='join')return body(req,async()=>{try{json(res,200,await joinRoom(uid,code))}catch(e){json(res,e.code||500,{error:e.message})}});
    if(req.method==='POST'&&roomMatch[2]==='move')return body(req,async d=>{try{const room=await getRoom(code);roomRole(room,uid);json(res,200,d.action==='next'?await nextRoomRound(uid,room):await roomMove(uid,room,d))}catch(e){json(res,e.code||500,{error:e.message})}});
   }catch(e){return json(res,e.code||500,{error:e.message})}}
  if(u.pathname==='/api/chat'&&req.method==='GET')return json(res,200,{messages:await chatGet()});
  if(u.pathname==='/api/chat'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req),text=String(d.text||'').trim();if(!uid)return json(res,401,{error:'Log in to chat.'});if(!text)return json(res,400,{error:'Message is empty.'});try{await chatPost(uid,text);json(res,201,{ok:true})}catch(e){json(res,500,{error:e.message})}});
    const dm=u.pathname.match(/^\/api\/direct\/([\w-]{1,80})$/);
    if(dm&&req.method==='GET'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Log in to chat.'});try{return json(res,200,{messages:await directGet(uid,dm[1])})}catch(e){return json(res,e.code||500,{error:e.message})}}
    if(dm&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req),text=String(d.text||'').trim();if(!uid)return json(res,401,{error:'Log in to chat.'});if(!text)return json(res,400,{error:'Message is empty.'});try{await directPost(uid,dm[1],text);json(res,201,{ok:true})}catch(e){json(res,e.code||500,{error:e.message})}});
  const requested=u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname),f=path.join(PUB,requested);if(!f.startsWith(PUB)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(data)})
 }catch(e){json(res,500,{error:'Server error'})}
}).listen(PORT,()=>console.log(`Arcade Hub running on ${PORT} (${durable?'Supabase durable mode':'local prototype mode'})`));
