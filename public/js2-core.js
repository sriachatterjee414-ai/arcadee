let me={stats:{},following:[]},myId='local',myName='',db=null,user=null,players={},names={},saveQueue=Promise.resolve(),accountProfile={coins:0,loginStreak:0,ownedItems:[],badges:[],daily:{challenges:[],claimed:[]}};
let tab='play',lbMode='all',lbGame='ttt',lbType='Strategy',playing=null,sel=null,LV=1,loaded=false,gameQuery='',gameFilter='All',activeRoomCode='',roomPoll=null;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function apiJson(path,options={}){
  const headers={...(options.headers||{})},token=localStorage.getItem('ah_token')||'';
  if(token)headers.Authorization='Bearer '+token;
  if(options.body&&!headers['Content-Type'])headers['Content-Type']='application/json';
  const response=await fetch((window.ARCADE_API||'')+path,{cache:'no-store',...options,headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status}).`);
  return data;
}
async function loadAccountProfile(){try{accountProfile=await apiJson('/api/profile/me');return accountProfile}catch(e){return null}}
function refreshAccountScreen(){if(tab==='daily')renderDaily();else if(tab==='shop')renderShop();else if(tab==='profile')renderProfile()}
const st=g=>me.stats[g]||{p:0,w:0};
function totals(stats){let p=0,w=0,pts=0;for(const k in stats){p+=stats[k].p||0;w+=stats[k].w||0;pts+=stats[k].pts||0}return{p,w,pts}}
function allPlayers(){const a=Object.assign({},players);a[myId]=Object.assign({},a[myId]||{}, {stats:me.stats,following:me.following,name:myName});return a}
function nm(id){return id===myId?(myName||'You'):((players[id]&&players[id].name)||names[id]||'Player '+id.slice(0,4))}
function followers(id){let c=0,a=allPlayers();for(const k in a){if(k!==id&&(a[k].following||[]).includes(id))c++}return c}
function mergeStats(current,incoming){const merged={...(current||{})};for(const [key,value] of Object.entries(incoming||{})){const old=merged[key]||{},next=value||{};merged[key]={p:Math.max(old.p||0,next.p||0),w:Math.max(old.w||0,next.w||0),pts:Math.max(old.pts||0,next.pts||0),best:Math.max(old.best||0,next.best||0),lv:Math.max(old.lv||1,next.lv||1)}}return merged}
function restoreLocalStats(){try{if(localStorage.getItem('ah_id')!==myId)return;const cached=JSON.parse(localStorage.getItem(`ah_stats_${myId}`)||'{}');me.stats=mergeStats(me.stats,cached)}catch(e){}}
function save(){
  if(myId!=='local')try{localStorage.setItem(`ah_stats_${myId}`,JSON.stringify(me.stats))}catch(e){}
  if(db&&myId!=='local'){
    const payload={stats:JSON.parse(JSON.stringify(me.stats)),following:[...me.following],name:myName,upd:Date.now()},write=()=>db.doc('players/'+myId).set(payload);
    saveQueue=saveQueue.then(write,write).catch(error=>{console.error('Could not save player scores:',error);return null});return saveQueue;
  }
  return Promise.resolve();
}
function record(g,won,score){
  const s=me.stats[g]||(me.stats[g]={p:0,w:0});
  s.p++;if(won)s.w++;s.pts=(s.pts||0)+score;if(won&&LV>=(s.lv||1)&&LV<MAX_LEVEL)s.lv=LV+1;s.best=Math.max(s.best||0,score);save();renderStats();
  if(myId!=='local')apiJson('/api/daily/activity',{method:'POST',body:JSON.stringify({game:g,won:!!won})}).then(p=>{accountProfile=p;refreshAccountScreen()}).catch(e=>console.warn('Could not update daily challenge progress:',e.message));
}
function toggleFollow(id){
  const i=me.following.indexOf(id);
  if(i>=0)me.following.splice(i,1);else me.following.push(id);
  save();render();
}
function renderStats(){
  const t=totals(me.stats);
  $('#stats').innerHTML=`<div class="stat"><b>${t.p}</b><span>played</span></div><div class="stat"><b>${t.w}</b><span>won</span></div><div class="stat"><b>${t.pts}</b><span>points</span></div>`;
}
function renderSide(){
  const S=[['play','Home'],['online','Multiplayer'],['daily','Daily'],['shop','Shop'],['lb','Rankings'],['fol','People'],['chat','Chat'],['profile','Profile'],['settings','Settings']];
  $('#side').innerHTML=`<div class="av">${esc((myName||'P')[0].toUpperCase())}</div><div class="nm">${esc(myName||'Player')}</div>`+S.map(([k,l])=>`<button class="sb ${tab===k?'on':''}" data-t="${k}">${l}</button>`).join('');
  $('#side').querySelectorAll('.sb').forEach(b=>b.onclick=()=>{tab=b.dataset.t;playing=null;sel=null;render()});
}
function render(){
  if(tab!=='online'){stopBooth();if(roomPoll){clearInterval(roomPoll);roomPoll=null}}
  document.body.classList.toggle('pl',!!playing);
  renderStats();renderSide();
  $('#bk').style.visibility=(tab==='play'&&!playing&&!sel)?'hidden':'visible';
  if(tab==='play')playing?startGame(playing):sel?renderDetail():renderMenu();
  else if(tab==='online')renderOnline();else if(tab==='daily')renderDaily();else if(tab==='shop')renderShop();else if(tab==='lb')renderLB();else if(tab==='fol')renderFollow();else if(tab==='chat')renderChat();else if(tab==='profile')renderProfile();else renderSettings();
  $('#note').textContent=db?'Live scores, shared with everyone who opens this page.':'Offline mode: only your own scores are shown.';
}
function renderMenu(){
  const categories=['All',...new Set(GAMES.map(g=>g.t))];
  $('#view').innerHTML=`<div class="menu-intro"><h2>Pick a game</h2><p class="sub">Quick rounds, puzzles, and creative breaks.</p></div><div class="menu-tools"><input class="game-search" id="gameSearch" type="search" placeholder="Search games" aria-label="Search games" value="${esc(gameQuery)}"><p class="game-count" id="gameCount"></p></div><div class="category-row">${categories.map(c=>`<button class="chip ${gameFilter===c?'on':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="grid" id="gameGrid"></div>`;
  const card=g=>`<button class="gc" data-g="${g.id}"><div class="art">${pic(g.id)}</div><b>${g.e} ${g.n}</b><small>Best ${st(g.id).best||0} · Level ${st(g.id).lv||1}</small></button>`;
  const updateGrid=()=>{const games=GAMES.filter(g=>(gameFilter==='All'||g.t===gameFilter)&&`${g.n} ${g.d} ${g.t}`.toLowerCase().includes(gameQuery));$('#gameGrid').innerHTML=games.length?games.map(card).join(''):'<div class="empty-games">No games match that search. Try another name or category.</div>';$('#gameCount').textContent=`${games.length} ${games.length===1?'game':'games'}`;$('#gameGrid').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{sel=b.dataset.g;LV=Math.min(MAX_LEVEL,st(sel).lv||1);render()})};
  $('#gameSearch').oninput=e=>{gameQuery=e.target.value.trim().toLowerCase();updateGrid()};
  $('#view').querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{gameFilter=b.dataset.category;renderMenu()});
  updateGrid();
}
function renderProfile(){
  const total=totals(me.stats),played=GAMES.filter(g=>!g.tool&&st(g.id).p).sort((a,b)=>(st(b.id).pts||0)-(st(a.id).pts||0));
  const badges=accountProfile.badges||[];
  $('#view').innerHTML=`<div class="profile-head card"><div class="profile-row"><span class="avatar" style="width:64px;height:64px;font-size:24px">${esc((myName||'P')[0].toUpperCase())}</span><div><h2>${esc(myName||'Player')}</h2><span style="color:var(--mute)">Arcade player</span></div></div></div><section class="wallet-card card"><div><b>Coin wallet</b><br><small>Play, check in, and finish challenges to earn coins.</small></div><strong>🪙 ${accountProfile.coins||0}</strong><span>🔥 ${accountProfile.loginStreak||0}-day streak</span></section><div class="stats"><div class="stat"><b>${total.p}</b><span>games played</span></div><div class="stat"><b>${total.w}</b><span>wins</span></div><div class="stat"><b>${total.pts}</b><span>points earned</span></div></div><section class="card"><div class="top"><b>Badges</b><span>${badges.length} earned</span></div>${badges.length?`<div class="badge-grid">${badges.map(b=>`<div class="badge-card"><span class="badge-icon">${esc(b.icon)}</span><div><b>${esc(b.name)}</b><div style="color:var(--mute);font-size:13px">${esc(b.description)}</div></div></div>`).join('')}</div>`:'<div class="empty-art">Your first badge is waiting—play a game or check in for a few days.</div>'}</section><section class="card"><div class="top"><b>Recently played</b><span>${played.length} games</span></div>${played.length?`<div class="profile-games">${played.slice(0,8).map(g=>`<div class="profile-game"><span>${g.e} ${g.n}</span><span>${st(g.id).w||0} wins · best ${st(g.id).best||0}</span></div>`).join('')}</div>`:'<div class="empty-art">Your game results will show up here.</div>'}</section><button class="btn ghost" id="logout">Log out</button>`;
  $('#logout').onclick=()=>{localStorage.removeItem('ah_token');localStorage.removeItem('ah_id');localStorage.removeItem('ah_name');location.reload()};
}
function renderDaily(){
  const d=accountProfile.daily||{},challenges=d.challenges||[],checked=!!accountProfile.checkedInToday;
  $('#view').innerHTML=`<h2>Daily rewards</h2><p class="sub">Check in once a day, build your streak, and claim coins for playing.</p><section class="wallet-card card"><div><b>Today's check-in</b><br><small>${checked?'Come back tomorrow to keep your streak going.':'Your streak reward grows up to 45 coins.'}</small></div><strong>🪙 ${accountProfile.coins||0}</strong><button class="btn" id="checkin" ${checked?'disabled':''}>${checked?'Checked in today':'Claim daily check-in'}</button></section><p class="sub">🔥 Current streak: <b>${accountProfile.loginStreak||0} days</b></p><div class="challenge-grid">${challenges.map(c=>`<section class="challenge-card"><b>${esc(c.name)}</b><p>${esc(c.description)}</p><progress value="${c.progress}" max="${c.goal}"></progress><div class="top"><small>${c.progress}/${c.goal} · 🪙 ${c.reward}</small><button class="btn sm ${c.claimed?'ghost':''}" data-claim="${esc(c.id)}" ${c.claimed||c.progress<c.goal?'disabled':''}>${c.claimed?'Claimed':c.progress>=c.goal?'Claim coins':'In progress'}</button></div></section>`).join('')}</div><div id="dailyStatus" class="online-status" aria-live="polite"></div>`;
  $('#checkin').onclick=async()=>{const b=$('#checkin');b.disabled=true;try{accountProfile=await apiJson('/api/daily/check-in',{method:'POST'});renderDaily();$('#dailyStatus').textContent=accountProfile.checkInReward?`Checked in! +${accountProfile.checkInReward} coins.`:'You already checked in today.'}catch(e){$('#dailyStatus').textContent=e.message;b.disabled=false}};
  $('#view').querySelectorAll('[data-claim]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{accountProfile=await apiJson('/api/daily/claim',{method:'POST',body:JSON.stringify({challengeId:b.dataset.claim})});renderDaily()}catch(e){$('#dailyStatus').textContent=e.message;b.disabled=false}});
}
async function renderShop(){
  $('#view').innerHTML='<h2>Coin shop</h2><p class="sub">Use earned coins for new arcade color themes.</p><div class="online-status">Loading the shop…</div>';
  try{
    const data=await apiJson('/api/shop');if(tab!=='shop')return;accountProfile=data.profile;
    $('#view').innerHTML=`<section class="wallet-card card"><div><b>Your balance</b><br><small>Earn more from daily check-ins and challenges.</small></div><strong>🪙 ${accountProfile.coins||0}</strong></section><div class="shop-grid">${data.items.map(item=>{const owned=(accountProfile.ownedItems||[]).includes(item.id);return`<section class="shop-card"><div class="top"><b>${esc(item.name)}</b><strong>🪙 ${item.price}</strong></div><p>${esc(item.description)}</p><button class="btn ${owned?'ghost':''}" data-buy="${esc(item.id)}" ${!owned&&(accountProfile.coins||0)<item.price?'disabled':''}>${owned?'Use theme':'Buy theme'}</button></section>`}).join('')}</div><div id="shopStatus" class="online-status" aria-live="polite"></div>`;
    $('#view').querySelectorAll('[data-buy]').forEach(b=>b.onclick=async()=>{const item=data.items.find(x=>x.id===b.dataset.buy);if((accountProfile.ownedItems||[]).includes(b.dataset.buy)){pk=b.dataset.buy;applyPalette(pk);$('#shopStatus').textContent=`${item.name} is now active.`;return}b.disabled=true;try{accountProfile=await apiJson('/api/shop/purchase',{method:'POST',body:JSON.stringify({itemId:b.dataset.buy})});renderShop()}catch(e){$('#shopStatus').textContent=e.message;b.disabled=false}});
  }catch(e){if(tab==='shop')$('#view').innerHTML=`<section class="card"><b>Shop unavailable</b><p>${esc(e.message)}</p></section>`}
}
function renderSettings(){
  $('#view').innerHTML=`<h2>Settings</h2><p class="sub">Make the arcade feel like yours.</p><section class="card"><div class="top"><b>Color themes</b><span>${esc(pk)}</span></div><div class="palette-grid">${Object.entries(palettes).filter(([k])=>!['neon','ocean','sunset'].includes(k)||(accountProfile.ownedItems||[]).includes(k)).map(([k,v])=>`<button class="palette-dot ${pk===k?'sel':''}" data-palette="${k}" title="${k}" aria-label="${k} theme" style="background:linear-gradient(135deg,${v[3]},${v[4]})"></button>`).join('')}</div><small style="color:var(--mute)">Unlock extra themes in the coin shop.</small></section><section class="card"><div class="top"><div><b>Game sounds</b><div class="sub" style="margin:3px 0 0">Button and game effects</div></div><button class="btn ${muted?'ghost':''}" id="soundSetting">${muted?'Muted':'On'}</button></div></section><section class="card"><div class="top"><div><b>Account</b><div class="sub" style="margin:3px 0 0">Signed in as ${esc(myName||'Player')}</div></div><button class="btn ghost" id="settingsLogout">Log out</button></div></section>`;
  $('#view').querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>{pk=b.dataset.palette;applyPalette(pk);renderSettings()});
  $('#soundSetting').onclick=()=>{$('#snd').click();renderSettings()};$('#settingsLogout').onclick=()=>{localStorage.removeItem('ah_token');localStorage.removeItem('ah_id');localStorage.removeItem('ah_name');location.reload()};
}
function renderDetail(){
  const G=GAMES.find(g=>g.id===sel),u=st(sel).lv||1;
  $('#view').innerHTML=`<div class="hero"><div class="pic">${pic(sel)}</div><h2>${G.n}</h2><p>${G.d}. ${G.h}</p><button class="btn big2" id="play">▶ Play level ${LV}</button>${['ttt','rps'].includes(sel)?'<p><button class="btn ghost" id="onlinePlay">👥 Play online with a friend</button></p>':''}</div><div class="card"><b>Levels</b><div class="lvs">${Array.from({length:MAX_LEVEL},(_,i)=>{const n=i+1;return`<button class="lv ${n===LV?'on':''} ${n>u?'lock':''}" data-n="${n}">${n>u?'🔒':n<u?'⭐':n}</button>`}).join('')}</div></div><div class="card"><b>🏆 Top scores</b>${gameLB(sel,10)}</div>`;
  $('#play').onclick=()=>{playing=sel;startGame(sel)};
  if($('#onlinePlay'))$('#onlinePlay').onclick=()=>{const game=sel;tab='online';openOnlineRoom(game)};
  if(G.tool){$('#view').querySelectorAll('.card').forEach(x=>x.remove());$('#play').textContent='▶ Open'}
  $('#view').querySelectorAll('.lv').forEach(b=>b.onclick=()=>{if(+b.dataset.n<=u){LV=+b.dataset.n;renderDetail()}});
}
function rankCell(i){return i===0?'<span class="medal" style="color:var(--gold)">1</span>':i===1?'<span class="medal" style="color:var(--silver)">2</span>':i===2?'<span class="medal" style="color:var(--bronze)">3</span>':(i+1)}
function gameLB(g,n){
  const a=allPlayers();
  const rows=Object.keys(a).map(id=>{const x=(a[id].stats||{})[g]||{};return{id,p:x.p||0,w:x.w||0,best:x.best||0,pts:x.pts||0}}).sort((x,y)=>y.best-x.best||y.w-x.w||y.pts-x.pts||String(nm(x.id)).localeCompare(String(nm(y.id)))).slice(0,n);
  return rows.length?'<table class="lb">'+rows.map((r,i)=>`<tr class="${r.id===myId?'me':''}"><td class="rank">${rankCell(i)}</td><td><div class="profile-row"><span class="avatar">${esc((nm(r.id)[0]||'P').toUpperCase())}</span><span>${esc(nm(r.id))}</span></div></td><td class="r">${r.p} plays</td><td class="r"><b style="color:var(--ink)">${r.best}</b> best</td></tr>`).join('')+'</table>':'<div class="msg" style="font-size:14px">No players yet.</div>';
}
function renderLB(){
  const a=allPlayers();
  const chips=(items,cur,key)=>`<div class="chips">${items.map(([v,l])=>`<button class="chip ${cur===v?'on':''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  let html=chips([['all','Overall'],['game','Per game'],['type','By type']],lbMode,'mode');
  if(lbMode==='game')html+=chips(GAMES.filter(g=>!g.tool).map(g=>[g.id,g.n]),lbGame,'game');
  if(lbMode==='type')html+=chips(TYPES.map(t=>[t,t]),lbType,'type');
  if(lbMode==='game'){const G=GAMES.find(g=>g.id===lbGame);html+=`<div class="card feature-card"><div class="top"><b>${G.n}</b><span>Best scores</span></div>${gameLB(lbGame,25)}</div>`}
  else{
    const gs=lbMode==='type'?GAMES.filter(g=>g.t===lbType):GAMES;
    const rows=Object.keys(a).map(id=>{let p=0,w=0,pts=0;gs.forEach(g=>{const x=(a[id].stats||{})[g.id]||{};p+=x.p||0;w+=x.w||0;pts+=x.pts||0});return{id,p,w,pts}}).sort((x,y)=>y.pts-x.pts||y.w-x.w||y.p-x.p||String(nm(x.id)).localeCompare(String(nm(y.id))));
    html+=`<div class="card feature-card"><div class="top"><b>${lbMode==='type'?lbType:'All games'}</b><span>${rows.length} players</span></div><table class="lb">${rows.slice(0,50).map((r,i)=>`<tr class="${r.id===myId?'me':''}"><td class="rank">${rankCell(i)}</td><td><div class="profile-row"><span class="avatar">${esc((nm(r.id)[0]||'P').toUpperCase())}</span><span>${esc(nm(r.id))}</span></div></td><td class="r">${r.p} played · ${r.w} won</td><td class="r"><b style="color:var(--ink)">${r.pts}</b> pts</td></tr>`).join('')}</table></div>`;
  }
  $('#view').innerHTML=html;
  $('#view').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const k=c.dataset.k,v=c.dataset.v;if(k==='mode')lbMode=v;if(k==='game')lbGame=v;if(k==='type')lbType=v;renderLB()});
}
function renderFollow(){
  const a=allPlayers();
  const rows=Object.keys(a).map(id=>({id,f:followers(id),w:totals(a[id].stats||{}).w})).sort((x,y)=>y.f-x.f||y.w-x.w||String(nm(x.id)).localeCompare(String(nm(y.id))));
  $('#view').innerHTML=`<div class="social-grid"><div class="card feature-card"><div class="top"><b>People</b><span>${Object.keys(a).length} accounts</span></div>${rows.slice(0,50).map((r,i)=>`<div class="profile-row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="avatar">${esc((nm(r.id)[0]||'P').toUpperCase())}</span><div style="flex:1"><b>${esc(nm(r.id))}</b><div style="font-size:12px;color:var(--mute)">${r.f} followers · ${r.w} wins</div></div>${r.id===myId?'You':`<button class="btn sm ${me.following.includes(r.id)?'ghost':''}" data-f="${r.id}">${me.following.includes(r.id)?'Following':'Follow'}</button>`}</div>`).join('')}</div><div class="card feature-card"><b>Your following</b><p style="color:var(--mute)">${me.following.length} people</p><div class="empty-art">Follow players from the list to build your arcade circle.</div></div></div>`;
  $('#view').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>toggleFollow(b.dataset.f));
}
