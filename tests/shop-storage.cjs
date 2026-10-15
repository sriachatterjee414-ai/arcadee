const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../server.js'),'utf8');

// Provider contract fixture: reject any query or write that assumes new columns.
function database(schema){
 const hasNewColumns=schema==='modern';
 const columns=new Set(['id','username','username_normalized','pin_salt','pin_hash','stats','following','created_at','updated_at']);
 if(schema!=='core')for(const key of ['coins','login_streak','last_login_date','daily','owned_items'])columns.add(key);
 if(hasNewColumns)for(const key of ['diamonds','equipment','reward_state'])columns.add(key);
 const rows=new Map();let conflict=false;
 const clone=value=>JSON.parse(JSON.stringify(value));
 async function rest(route,options={}){
  const [table,query='']=route.split('?');assert.equal(table,'arcade_users');
  const params=new URLSearchParams(query),select=params.get('select')||'*';
  if(select!=='*')for(const key of select.split(','))assert.ok(columns.has(key),'column '+key+' does not exist');
  const input=options.body?JSON.parse(options.body):null;
  if(input)for(const key of Object.keys(input))assert.ok(columns.has(key),'column '+key+' does not exist');
  if(options.method==='POST'){
   const row={stats:{},following:[],updated_at:new Date().toISOString(),...input};
   if(schema!=='core')Object.assign(row,{coins:0,login_streak:0,last_login_date:null,daily:{},owned_items:[]});
   if(hasNewColumns)Object.assign(row,{diamonds:120,equipment:{pet:'rabbit',hat:'none',theme:'rose'},reward_state:{_version:1}});
   rows.set(row.id,row);return null;
  }
  const found=[...rows.values()].filter(row=>[...params].every(([key,value])=>!value.startsWith('eq.')||String(row[key])===value.slice(3)));
  if(options.method==='PATCH'){
   if(conflict){conflict=false;const row=found[0];if(row){row.stats._arcade.coins+=1;row.updated_at=new Date(Date.parse(row.updated_at)+1).toISOString()}return []}
   for(const row of found)Object.assign(row,input);return clone(found);
  }
  return clone(found.map(row=>select==='*'?row:Object.fromEntries(select.split(',').map(key=>[key,row[key]]))));
 }
 const context=vm.createContext({console,Buffer,URL,URLSearchParams,__dirname:path.join(__dirname,'..'),process:{env:{SUPABASE_URL:'https://provider.invalid',SUPABASE_SECRET_KEY:'synthetic',SESSION_SECRET:'synthetic'}},setInterval:()=>({unref(){}}),require:name=>name==='http'?{createServer:()=>({listen(){}})}:require(name),provider:rest});
 vm.runInContext(source+'\nsb=provider;globalThis.shop={register,getAccount,checkIn,addDailyActivity,claimChallenge,purchaseItem,equipItem,rewardGame,savePlayer,getPlayers,profileView};',context);
 return {api:context.shop,rows,conflict:()=>{conflict=true}};
}
for(const schema of ['core','wallet','modern'])test('shop persists on '+schema+' database through daily resets and conflicts',async()=>{
 const db=database(schema),api=db.api;
 const {id}=await api.register('TestMochi','123456'),raw=db.rows.get(id);raw.stats._arcade.coins=500;
 if(schema!=='modern')raw.stats._arcade.diamonds=120;
 let current=await api.getAccount(id);assert.equal(current.diamonds,120);
 await api.checkIn(id);await api.addDailyActivity(id,'ttt',true);await api.claimChallenge(id,'win-one');
 current=await api.getAccount(id);assert.equal(current.diamonds,125);
 current=await api.purchaseItem(id,'cat');assert.equal(current.diamonds,45);assert.equal(current.equipment.pet,'cat');
 current=await api.purchaseItem(id,'party');assert.equal(current.equipment.hat,'party');assert.equal(current.equipment.pet,'cat');
 current=await api.purchaseItem(id,'mint');assert.equal(current.equipment.theme,'mint');
 const balance=current.coins;
 raw.stats._arcade.daily.date='2000-01-01';raw.stats._arcade.last_login_date='2000-01-01';
 await api.addDailyActivity(id,'snake',false);await api.checkIn(id);
 current=await api.getAccount(id);assert.equal(current.diamonds,48);assert.equal(current.equipment.pet,'cat');assert.equal(current.equipment.hat,'party');assert.equal(current.equipment.theme,'mint');assert.equal(current.coins,balance+10);
 db.conflict();current=await api.equipItem(id,'lavender');assert.equal(current.coins,balance+11);assert.equal(current.equipment.theme,'lavender');assert.equal(current.diamonds,48);
 assert.ok(raw.stats._arcade.owned_items.includes('cat'));assert.ok(raw.stats._arcade.owned_items.includes('party'));assert.ok(raw.stats._arcade.owned_items.includes('mint'));assert.equal(raw.stats._arcade.equipment.theme,'lavender');
 if(schema!=='modern')assert.equal(Object.hasOwn(raw,'diamonds'),false);
 // Reconnect through a fresh account read; native values must not replace newer JSON data.
 current=await api.getAccount(id);assert.equal(current.diamonds,48);assert.equal(current.equipment.pet,'cat');
});
test('legacy historical scores are baselined before rewards',async()=>{
 const db=database('core'),api=db.api;
 const {id}=await api.register('OldMochi','123456'),raw=db.rows.get(id);
 raw.stats={snake:{p:10,w:0,pts:1000,best:100,lv:1}};
 assert.equal((await api.rewardGame(id,'snake')).gameReward,0);
 await api.savePlayer(id,{stats:{snake:{p:11,w:0,pts:1100,best:100,lv:1}},following:[]});
 assert.equal((await api.rewardGame(id,'snake')).gameReward,7);
 assert.equal((await api.rewardGame(id,'snake')).gameReward,0);
});

test('earlier daily cosmetics migrate without exposing wallet metadata in scores',async()=>{
 const db=database('wallet'),api=db.api;
 const {id}=await api.register('DailyMochi','123456'),raw=db.rows.get(id);
 raw.stats={snake:{p:1,w:1,pts:100,best:100,lv:1}};
 raw.daily={_arcade:{diamonds:90,equipment:{pet:'cat',hat:'party',theme:'mint'},reward_state:{_version:1}}};
 let current=await api.getAccount(id);assert.equal(current.diamonds,90);assert.equal(current.equipment.pet,'cat');
 await api.equipItem(id,'rose');
 current=await api.getAccount(id);assert.equal(current.diamonds,90);assert.equal(current.equipment.hat,'party');assert.equal(current.equipment.theme,'rose');
 // A client must not be able to inject diamonds or equipment through score saves.
 await api.savePlayer(id,{stats:{_arcade:{diamonds:9999},snake:{p:2,w:1,pts:150,best:100,lv:1}},following:[]});
 current=await api.getAccount(id);assert.equal(current.diamonds,90);
 const players=await api.getPlayers();assert.equal(Object.hasOwn(players[0].data.stats,'_arcade'),false);assert.equal(players[0].data.stats.snake.p,2);
 const profile=api.profileView(current);assert.equal(Object.hasOwn(profile,'_arcadeState'),false);
});
