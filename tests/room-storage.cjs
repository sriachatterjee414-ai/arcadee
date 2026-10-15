const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../server.js'),'utf8');
const jpeg='data:image/jpeg;base64,/9j/2Q==';
function database(allowedGames=['ttt','rps']){
 const rows=new Map();
 const clone=value=>JSON.parse(JSON.stringify(value));
 async function provider(route,options={}){
  const [table,query='']=route.split('?');assert.equal(table,'arcade_rooms');
  const params=new URLSearchParams(query),input=options.body?JSON.parse(options.body):null;
  if(options.method==='POST'){
   if(!allowedGames.includes(input.game))throw new Error('new row violates check constraint "arcade_rooms_game_check"');
   rows.set(input.room_code,clone(input));return null;
  }
  const found=[...rows.values()].filter(row=>[...params].every(([key,value])=>!value.startsWith('eq.')||String(row[key])===value.slice(3)));
  if(options.method==='PATCH')for(const row of found)Object.assign(row,input);
  return clone(found);
 }
 const context=vm.createContext({crypto,durable:true,sb:provider,getAccount:async uid=>({username:uid}),setInterval:()=>({unref(){}}),console});
 vm.runInContext(source.slice(source.indexOf('const ROOM_ALPHABET='),source.indexOf('async function chatGet()'))+'\nglobalThis.api={createRoom,getRoom,joinRoom,roomMove,roomView,nextRoomRound,roomRole};',context);
 return {api:context.api,rows};
}
test('Photo Booth create, join and concurrent captures work with the original database game constraint',async()=>{
 const {api,rows}=database();
 const created=await api.createRoom('host','booth');
 assert.equal(created.game,'booth');assert.equal(created.status,'waiting');assert.equal(created.counts.host,0);
 assert.equal(rows.get(created.code).game,'rps');assert.equal(rows.get(created.code).state.kind,'booth');
 const joined=await api.joinRoom('guest',created.code);assert.equal(joined.game,'booth');assert.equal(joined.status,'playing');assert.equal(joined.role,'guest');
 await assert.rejects(api.joinRoom('third',created.code),{code:409});
 const initial=await api.getRoom(created.code);
 await Promise.all([api.roomMove('host',initial,{image:jpeg}),api.roomMove('guest',initial,{image:jpeg})]);
 let room=await api.getRoom(created.code);assert.equal(api.roomView(room,'host').counts.host,1);assert.equal(api.roomView(room,'guest').counts.guest,1);
 for(let i=1;i<4;i++)await api.roomMove('host',await api.getRoom(created.code),{image:jpeg});
 await assert.rejects(api.roomMove('host',await api.getRoom(created.code),{image:jpeg}),{code:409});
 await assert.rejects(api.roomMove('guest',await api.getRoom(created.code),{image:'not a photo'}),{code:400});
 await assert.rejects(api.roomMove('third',await api.getRoom(created.code),{image:jpeg}),{code:403});
 await api.roomMove('host',await api.getRoom(created.code),{action:'clear'});
 room=await api.getRoom(created.code);assert.equal(room.state.shots.host.length,0);assert.equal(room.state.shots.guest.length,1);assert.equal(room.state.kind,'booth');
 await assert.rejects(api.nextRoomRound('host',room),{code:409});
});
test('existing native Photo Booth rooms and Jenga remain recognizable',async()=>{
 const {api,rows}=database(['ttt','rps','booth']);
 const created=await api.createRoom('host','booth'),stored=rows.get(created.code);
 stored.game='booth';delete stored.state.kind; // Rooms created by older app versions.
 assert.equal(api.roomView(stored,'host').game,'booth');
 await api.joinRoom('guest',created.code);
 const capture=await api.roomMove('guest',await api.getRoom(created.code),{image:jpeg});assert.equal(capture.game,'booth');assert.equal(capture.counts.guest,1);
 const jenga=await api.createRoom('host','jenga');assert.equal(jenga.game,'jenga');assert.equal(rows.get(jenga.code).game,'rps');assert.equal(jenga.blocks.length,9);
 for(const game of ['ttt','rps'])assert.equal((await api.createRoom('host',game)).game,game);
});
