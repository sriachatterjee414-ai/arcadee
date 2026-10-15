async function gate(){
  const G=$('#gate'),API=window.ARCADE_API||'';
  try{
    const t=localStorage.getItem('ah_token')||'';
    if(t){const r=await fetch(API+'/api/session',{headers:{Authorization:'Bearer '+t}});if(r.ok){const v=await r.json();myId=v.id;myName=v.name||'';G.remove();return true}}
  }catch(e){}
  let mode='login';
  const draw=()=>{
    G.innerHTML=`<div class="auth-art"><div class="auth-orb"></div><div class="auth-star s1">✦</div><div class="auth-star s2">✦</div></div><p>${mode==='login'?'Welcome back, player!':'Make your player account'}</p><input id="nmi" maxlength="16" placeholder="Username" autocomplete="username"><input id="pin" maxlength="8" inputmode="numeric" placeholder="4–8 digit PIN" autocomplete="${mode==='login'?'current-password':'new-password'}"><button class="btn" id="authBtn">${mode==='login'?'Log in':'Create account'}</button><button class="btn ghost" id="switchBtn">${mode==='login'?'New player? Create an account':'Already have an account? Log in'}</button><div id="authErr" class="auth-error"></div>`;
    $('#switchBtn').onclick=()=>{mode=mode==='login'?'register':'login';draw()};
    $('#authBtn').onclick=async()=>{const name=$('#nmi').value.trim(),pin=$('#pin').value.trim(),err=$('#authErr');if(!name||!pin){err.textContent='Enter a username and PIN.';return}err.textContent='Connecting…';try{const r=await fetch(API+(mode==='login'?'/api/login':'/api/register'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,pin})});const v=await r.json().catch(()=>({}));if(!r.ok){err.textContent=v.error||'Something went wrong.';return}localStorage.setItem('ah_token',v.token);localStorage.setItem('ah_id',v.id);localStorage.setItem('ah_name',v.name);myId=v.id;myName=v.name;G.remove();render();location.reload()}catch(e){err.textContent='Could not connect to Arcade Hub.'}};
  };draw();return false;
}
async function standaloneDb(){
  const API=window.ARCADE_API||'';const token=localStorage.getItem('ah_token')||'';if(!token)return null;
  try{const r=await fetch(API+'/api/session',{headers:{Authorization:'Bearer '+token}});if(!r.ok)return null;const v=await r.json();myId=v.id;myName=v.name||localStorage.getItem('ah_name')||'';const auth=()=>({Authorization:'Bearer '+token,'Content-Type':'application/json'});return{doc:path=>({set:async d=>{const response=await fetch(API+'/api/'+path,{method:'PUT',headers:auth(),body:JSON.stringify(d)});if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||`Save failed (${response.status}).`)}return response}}),collection:()=>({onSnapshot:cb=>{const pull=()=>fetch(API+'/api/players').then(r=>r.json()).then(rows=>cb({docs:rows.map(x=>({id:x.id,data:()=>x.data}))})).catch(()=>{});pull();setInterval(pull,5000)}})}}catch(e){return null}
}
/* Init */
$('#bk').onclick=()=>{if(playing)playing=null;else if(sel)sel=null;else tab='play';render()};
const palettes={
  rose:['#fff5fb','#fffefc','#2b143d','#ff5fa7','#8d6dff','#f7d7ef'],
  lavender:['#f6f0ff','#fffdfd','#2c1a4d','#8a6cf5','#52b6ff','#e3d7ff'],
  sky:['#edfaff','#fffdfd','#243547','#49c6ff','#7b70ff','#cfefff'],
  neon:['#171325','#221c38','#f9ecff','#e555f2','#62d8ff','#3e3357'],
  mint:['#eefef9','#fffdfd','#173d43','#2ed3b1','#5fa7ff','#d6fce9'],
  peach:['#fff4ee','#fffdfd','#412938','#ff8daf','#ffb15e','#ffd9d0'],
  lemon:['#fff9dc','#fffdfd','#382d1e','#ffca5d','#ff7bbd','#f2e3a8'],
  grape:['#f5ebff','#fffdfd','#2a173f','#b56dfd','#5bc0ff','#e7d6ff'],
  night:['#1c102c','#261836','#f4ebff','#ff76b8','#6a7bff','#3a2447'],
  ocean:['#eaf9ff','#fffdfd','#1d3240','#49c6ff','#6f8dff','#d5f1fd'],
  forest:['#ecfff5','#fffdfd','#1f332e','#3fcf97','#52b7ff','#d4f5df'],
  coral:['#fff2ef','#fffdfd','#3d2534','#ff6f7d','#ff8dc6','#fddcd6'],
  citrus:['#fff8db','#fffdfd','#352f1d','#ffb048','#ff5fa7','#f9e7b4'],
  ink:['#eef2ff','#fffdfd','#2a2d43','#7d7ef0','#4dd4ff','#dfe4ff'],
  midnight:['#171929','#1f2436','#f5f8ff','#ff6bb0','#5ac7ff','#2d3552'],
  sunset:['#fff1e6','#fffaf5','#472c3e','#ff704c','#f4ae42','#ffd9c6']
};
const pop=document.createElement('div');pop.className='palette-pop';pop.innerHTML='<div class="palette-title">Choose your arcade colors</div><div class="palette-grid">'+Object.keys(palettes).map(k=>`<button class="palette-dot" data-pal="${k}" title="${k}" aria-label="${k}"></button>`).join('')+'</div><div class="soft-toggle"><button data-soft="1">Soft</button><button data-soft="0">Bright</button></div>';document.body.appendChild(pop);
function applyPalette(k,save=true){const v=palettes[k]||palettes.rose,r=document.documentElement;r.style.setProperty('--bg',v[0]);r.style.setProperty('--card',v[1]);r.style.setProperty('--ink',v[2]);r.style.setProperty('--acc',v[3]);r.style.setProperty('--acc2',v[4]);r.style.setProperty('--line',v[5]);r.style.setProperty('--accent-soft',v[5]);r.style.setProperty('--accent-soft2',v[4]);if(k==='night')r.dataset.theme='dark';else r.dataset.theme='light';pop.querySelectorAll('.palette-dot').forEach(x=>{const q=palettes[x.dataset.pal];x.style.background=`linear-gradient(145deg,${q[3]},${q[4]})`;x.classList.toggle('sel',x.dataset.pal===k)});if(save)try{localStorage.setItem('ah_palette',k)}catch(e){}}
let pk='rose';try{pk=localStorage.getItem('ah_palette')||'rose'}catch(e){}applyPalette(pk,false);
$('#thm').onclick=()=>pop.classList.toggle('open');pop.addEventListener('click',e=>{const b=e.target.closest('[data-pal]');if(b){applyPalette(b.dataset.pal);pop.classList.remove('open')}});document.addEventListener('click',e=>{if(pop.classList.contains('open')&&!pop.contains(e.target)&&e.target!==$('#thm'))pop.classList.remove('open')});
const sb=$('#snd');sb.textContent=muted?'🔇':'🔊';
sb.onclick=()=>{muted=!muted;try{localStorage.setItem('ah_mute',muted?'1':'0')}catch(e){}sb.textContent=muted?'🔇':'🔊';snd('click')};
render();gate();
(async()=>{
  try{
    if(window.claude&&claude.use){user=await claude.use('user');db=await claude.use('db')}
    else db=await standaloneDb();
    if(user){try{myId=await user.id()}catch(e){}try{const v=await user.me();if(!myName)myName=(v&&v.name)||''}catch(e){}}
    restoreLocalStats();
    if(myId!=='local')await loadAccountProfile();
    if(!db||myId==='local'){db=null;render();return}
    db.collection('players').onSnapshot(s=>{
      players={};s.docs.forEach(d=>{players[d.id]=d.data()});
      const m=players[myId];if(m){const remote=m.stats||{},merged=mergeStats(remote,me.stats),needsSync=JSON.stringify(merged)!==JSON.stringify(remote);me.stats=merged;if(!loaded)me.following=m.following||[];if(needsSync)save()}loaded=true;
      delete players[myId];
      if(user&&user.profiles){user.profiles(Object.keys(players)).then(ps=>{for(const k in ps){names[k]=ps[k]&&ps[k].name||''}if(!playing&&tab!=='chat')render()}).catch(()=>{})}
      if(!playing&&tab!=='chat')render();
    },()=>{});
    render();
  }catch(e){db=null}
})();
