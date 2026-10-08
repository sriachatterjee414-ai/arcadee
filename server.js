// Arcade Hub backend: durable Supabase mode + local fallback.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const FILE = process.env.DATA_FILE || path.join(__dirname,'data.json');
const PUB = path.join(__dirname,'public');
const SB_URL = String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const SB_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const durable = !!(SB_URL && SB_KEY);
let local = {};
try{local=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){local={}}
if(!local || typeof local!=='object' || Array.isArray(local)) local={};
if(!local.chat) local.chat=[];
const sessions=new Map();
const n=x=>Math.max(0,Math.min(1e7,+x||0));
const clean=s=>{const o={};Object.keys(s||{}).slice(0,60).forEach(k=>{const v=s[k]||{};o[k]={p:n(v.p),w:n(v.w),pts:n(v.pts),best:n(v.best),lv:Math.min(10,n(v.lv)||1)}});return o};
const normalizeName=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
const validName=s=>/^[A-Za-z0-9 _-]{2,16}$/.test(String(s||'').trim());
const validPin=s=>/^\d{4,8}$/.test(String(s||''));
const hashPin=(pin,salt)=>crypto.pbkdf2Sync(String(pin),salt,120000,32,'sha256').toString('hex');
const token=()=>crypto.randomBytes(32).toString('hex');
const id=()=> 'u_'+crypto.randomBytes(9).toString('base64url');
function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function body(req,cb){let b='';req.on('data',c=>{b+=c;if(b.length>150000)req.destroy()});req.on('end',()=>{try{cb(JSON.parse(b||'{}'))}catch(e){json(req.res,400,{error:'Invalid JSON'})}})}
function saveLocal(){fs.writeFile(FILE,JSON.stringify(local,null,2),()=>{})}
async function sb(pathname,opts={}){const r=await fetch(SB_URL+'/rest/v1/'+pathname,{...opts,headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',...(opts.headers||{})}});const text=await r.text();let data=null;try{data=JSON.parse(text)}catch(e){}if(!r.ok)throw new Error((data&&data.message)||text||('Supabase '+r.status));return data}
async function sbUserByName(name){const q=encodeURIComponent(normalizeName(name));const a=await sb('arcade_users?select=*&username_normalized=eq.'+q+'&limit=1');return a[0]||null}
async function getPlayers(){if(!durable){return Object.entries(local).filter(([k,v])=>k!=='chat'&&v&&typeof v==='object'&&!Array.isArray(v)).map(([id,v])=>({id,data:{stats:v.stats||{},following:v.following||[],name:v.name||''}}))}
 const users=await sb('arcade_users?select=id,username,stats,following&order=username.asc');return users.map(u=>({id:u.id,data:{stats:u.stats||{},following:Array.isArray(u.following)?u.following:[],name:u.username||''}}))}
function sessionId(req){const h=req.headers.authorization||'';const t=h.startsWith('Bearer ')?h.slice(7):'';return sessions.get(t)||null}
async function requireUser(req){return sessionId(req)}
async function register(name,pin){if(durable){if(await sbUserByName(name))throw Object.assign(new Error('That username is already taken.'),{code:409});const salt=crypto.randomBytes(16).toString('hex');const uid=id();await sb('arcade_users',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:uid,username:name,username_normalized:normalizeName(name),pin_salt:salt,pin_hash:hashPin(pin,salt),stats:{},following:[]})});return {id:uid,name}}
 if(Object.values(local).some(v=>v&&v.name&&normalizeName(v.name)===normalizeName(name)))throw Object.assign(new Error('That username is already taken.'),{code:409});const uid=id(),salt=crypto.randomBytes(16).toString('hex');local[uid]={name,stats:{},following:[],auth:{salt,pin:hashPin(pin,salt)}};saveLocal();return{id:uid,name}}
async function login(name,pin){if(durable){const p=await sbUserByName(name);if(!p)throw new Error('Username or PIN is incorrect.');const expected=hashPin(pin,p.pin_salt);if(expected!==p.pin_hash)throw new Error('Username or PIN is incorrect.');return{id:p.id,name:p.username}}
 for(const [uid,p] of Object.entries(local)){if(p&&p.name&&normalizeName(p.name)===normalizeName(name)){if(p.auth&&hashPin(pin,p.auth.salt)===p.auth.pin)return{id:uid,name:p.name}}}throw new Error('Username or PIN is incorrect.')}
async function savePlayer(uid,d){if(durable){const old=(await sb('arcade_users?select=following,username&id=eq.'+encodeURIComponent(uid)+'&limit=1'))[0];if(!old)throw Object.assign(new Error('Account not found.'),{code:404});await sb('arcade_users?id=eq.'+encodeURIComponent(uid),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({stats:clean(d.stats),following:(Array.isArray(d.following)?d.following:[]).slice(0,500).map(String),updated_at:new Date().toISOString()})});return}
 if(!local[uid])throw Object.assign(new Error('Account not found.'),{code:404});local[uid]={...local[uid],stats:clean(d.stats),following:(Array.isArray(d.following)?d.following:[]).slice(0,500).map(String)};saveLocal()}
async function chatGet(){if(!durable)return local.chat.slice(-100);const rows=await sb('arcade_chat?select=id,user_id,text,created_at,username&order=id.desc&limit=100');return rows.reverse().map(x=>({id:x.user_id,name:x.username||'Player',text:x.text,createdAt:x.created_at}))}
async function chatPost(uid,text){if(durable){const p=(await sb('arcade_users?select=username&id=eq.'+encodeURIComponent(uid)+'&limit=1'))[0];await sb('arcade_chat',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:uid,username:p?.username||'Player',text:text.slice(0,300)})});return}
 local.chat.push({id:uid,name:local[uid]?.name||'Player',text:text.slice(0,300),createdAt:new Date().toISOString()});local.chat=local.chat.slice(-100);saveLocal()}
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp'};
http.createServer(async(req,res)=>{req.res=res;const u=new URL(req.url,'http://x');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
 try{
  if(u.pathname==='/api/status'&&req.method==='GET')return json(res,200,{ok:true,durable,provider:durable?'supabase':'local'});
  if(u.pathname==='/api/players'&&req.method==='GET')return json(res,200,await getPlayers());
  if(u.pathname==='/api/register'&&req.method==='POST')return body(req,async d=>{try{const name=String(d.name||'').trim().replace(/\s+/g,' '),pin=String(d.pin||'');if(!validName(name))return json(res,400,{error:'Username must be 2-16 characters and use letters, numbers, spaces, _ or -.'});if(!validPin(pin))return json(res,400,{error:'PIN must be 4-8 digits.'});const v=await register(name,pin),t=token();sessions.set(t,v.id);json(res,201,{ok:true,...v,token:t})}catch(e){json(res,e.code||500,{error:e.message||'Could not create account.'})}});
  if(u.pathname==='/api/login'&&req.method==='POST')return body(req,async d=>{try{const v=await login(String(d.name||'').trim(),String(d.pin||'')),t=token();sessions.set(t,v.id);json(res,200,{ok:true,...v,token:t})}catch(e){json(res,e.code||401,{error:e.message})}});
  if(u.pathname==='/api/session'&&req.method==='GET'){const uid=sessionId(req);if(!uid)return json(res,401,{error:'Not logged in.'});const p=(await getPlayers()).find(x=>x.id===uid);if(!p)return json(res,401,{error:'Not logged in.'});return json(res,200,{ok:true,id:uid,name:p.data.name})}
  if(u.pathname==='/api/players/me'&&req.method==='PUT'){const uid=await requireUser(req);if(!uid)return json(res,401,{error:'Please log in again.'});return body(req,async d=>{try{await savePlayer(uid,d);json(res,200,{ok:true})}catch(e){json(res,e.code||500,{error:e.message})}})}
  const pm=u.pathname.match(/^\/api\/players\/([\w-]{1,80})$/);if(pm&&req.method==='PUT'){const uid=await requireUser(req);if(!uid||uid!==pm[1])return json(res,401,{error:'Please log in again.'});return body(req,async d=>{try{await savePlayer(uid,d);json(res,200,{ok:true})}catch(e){json(res,e.code||500,{error:e.message})}})}
  if(u.pathname==='/api/chat'&&req.method==='GET')return json(res,200,{messages:await chatGet()});
  if(u.pathname==='/api/chat'&&req.method==='POST')return body(req,async d=>{const uid=sessionId(req),text=String(d.text||'').trim();if(!uid)return json(res,401,{error:'Log in to chat.'});if(!text)return json(res,400,{error:'Message is empty.'});try{await chatPost(uid,text);json(res,201,{ok:true})}catch(e){json(res,500,{error:e.message})}});
  const requested=u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname),f=path.join(PUB,requested);if(!f.startsWith(PUB)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(data)})
 }catch(e){json(res,500,{error:'Server error'})}
}).listen(PORT,()=>console.log(`Arcade Hub running on ${PORT} (${durable?'Supabase durable mode':'local prototype mode'})`));
