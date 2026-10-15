/* Cutie Arcade skin for Arcade Hub. Add ONE line before </body> in public/index.html:
   <script src="cute-skin.js"></script>
   Re-skins the UI (bottom tabs, top bar, ribbons, chunky buttons, doodles, sparkles, mascot)
   and adds 4 new games. Does not touch your game code. */
(function(){
if(window.__cuteSkin)return;window.__cuteSkin=1;
try{
const INK='#4a2c6b';
/* ---------- fonts + css ---------- */
const fl=document.createElement('link');fl.rel='stylesheet';fl.href='https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap';document.head.appendChild(fl);
const CSS=`
body{font-family:'Fredoka','Quicksand',ui-rounded,system-ui,sans-serif!important;background:linear-gradient(165deg,color-mix(in srgb,var(--acc) 20%,var(--bg)),color-mix(in srgb,var(--acc2) 24%,var(--bg))) fixed!important;color:var(--ink);overflow-x:hidden}
.app{display:block!important;position:relative;z-index:1;min-height:100dvh}
.side,main>h1,.menu-intro,#thm,#snd{display:none!important}
main{max-width:760px!important;margin:0 auto!important;padding:78px 14px 150px!important;position:relative;z-index:1}
body.pl main{padding-top:14px!important;padding-bottom:90px!important}
body.pl #ctabs,body.pl #ctop{display:none!important}
body:not([data-tab="play"]) #stats,body.pl #stats{display:none}
#cdood,#cspark{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.cdd{position:absolute;opacity:.55;animation:cfl 7s ease-in-out infinite}
@keyframes cfl{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-14px) rotate(calc(var(--r,0deg) + 8deg))}}
.csp,.gc::after{width:14px;height:14px;background:#fff;clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:ctw 2.6s ease-in-out infinite}
.csp{position:absolute;opacity:0}
@keyframes ctw{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(90deg)}}
.rwrap{text-align:center;margin:6px 0 16px;filter:drop-shadow(0 4px 0 ${INK})}
.ribbon{display:inline-block;background:var(--acc);color:#fff;font-weight:700;font-size:22px;padding:8px 40px;text-shadow:0 2px 0 rgba(0,0,0,.2);clip-path:polygon(0 0,100% 0,95% 50%,100% 100%,0 100%,5% 50%)}
#ctop{position:fixed;top:0;left:0;right:0;z-index:55;max-width:760px;margin:0 auto;display:flex;align-items:center;gap:7px;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:linear-gradient(var(--bg),transparent)}
#ctop .me{display:flex;align-items:center;gap:7px;margin-right:auto;min-width:0}
#ctop .me b{display:block;font-size:14px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cxp{width:64px;height:9px;border-radius:9px;background:#fff;border:2px solid var(--ink);overflow:hidden}.cxp i{display:block;height:100%;background:var(--acc)}
.cpill{display:flex;align-items:center;gap:5px;background:#fff;color:#4a2c6b;border:3px solid var(--ink);border-radius:99px;padding:2px 11px 2px 3px;font-weight:700;box-shadow:0 3px 0 var(--ink);font-size:14px}
.cpill i{width:22px;height:22px;border-radius:50%;background:#ffd966;border:2px solid ${INK};display:grid;place-items:center;font-style:normal;font-size:11px}
.cib{width:38px;height:38px;border-radius:50%;border:3px solid var(--ink);background:var(--card);box-shadow:0 3px 0 var(--ink);display:grid;place-items:center;color:var(--ink);padding:0;cursor:pointer}
.cib svg,#ctabs svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round}
.cib.on{background:var(--acc);color:#fff}
#ctabs{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:4px;max-width:560px;margin:0 auto;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));background:#3a2152;border-radius:26px 26px 0 0}
#ctabs button{flex:1;border:0;background:transparent;color:#cbb8ea;display:flex;flex-direction:column;align-items:center;gap:2px;font:600 11px 'Fredoka',sans-serif;padding:6px 0;border-radius:16px;transition:.15s;cursor:pointer}
#ctabs svg{width:25px;height:25px}
#ctabs button.on{background:var(--acc);color:#fff;transform:translateY(-10px);box-shadow:0 4px 0 rgba(0,0,0,.25);border:3px solid #fff}
body .bar{position:fixed;left:0;right:0;bottom:calc(86px + env(safe-area-inset-bottom,0px));background:transparent!important;border:0!important;backdrop-filter:none!important;padding:0 14px;justify-content:flex-start;pointer-events:none;z-index:50}
body .bar>*{pointer-events:auto}body.pl .bar{bottom:calc(14px + env(safe-area-inset-bottom,0px))}
body .card,body .gc,body .stat,body .wallet-card,body .challenge-card,body .shop-card,body .badge-card{background:var(--card);border:3px solid var(--ink);border-radius:22px;box-shadow:0 5px 0 var(--ink);overflow:hidden}
body .gc{position:relative;padding:0;transition:transform .12s,box-shadow .12s}
body .gc:hover{transform:translateY(-3px);box-shadow:0 8px 0 var(--ink)}body .gc:active{transform:translateY(4px);box-shadow:0 1px 0 var(--ink)}
body .gc::after{content:"";position:absolute;right:10px;top:10px;z-index:3}
body .gc:nth-child(3n)::after{animation-delay:-.8s}body .gc:nth-child(3n+1)::after{animation-delay:-1.6s}
body .gc .art{aspect-ratio:1.15;border-radius:0;border-bottom:3px solid var(--ink);margin:0}
body .gc:hover .art svg{transform:scale(1.1) rotate(-2deg)}body .gc .art svg{transition:transform .25s}
body .gc .art{aspect-ratio:1.33}body .gc .art svg{animation:none}body .gc .cute-scene{animation:cute-bob 4s ease-in-out infinite;transform-origin:center}body .cute-eyes{animation:cute-blink 5s infinite;transform-box:fill-box;transform-origin:center}@keyframes cute-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes cute-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}
body .gc b{margin:8px 10px 0;font-size:15px}body .gc small{margin:0 10px 10px;display:block}
body .stat{padding:8px}body .stat b{font-size:20px}
.stats{margin-bottom:14px!important;max-width:none!important}
body .btn{background:var(--acc);color:#fff;border:3px solid var(--ink);border-radius:16px;font-family:inherit;font-weight:700;padding:10px 18px;box-shadow:0 5px 0 color-mix(in srgb,var(--acc) 60%,#000),0 5px 0 3px var(--ink);text-shadow:0 2px 0 rgba(0,0,0,.18);transition:transform .08s,box-shadow .08s;cursor:pointer}
body .btn:active{transform:translateY(4px);box-shadow:0 1px 0 color-mix(in srgb,var(--acc) 60%,#000),0 1px 0 3px var(--ink)}
body .btn.ghost{background:var(--card);color:var(--ink);text-shadow:none;box-shadow:0 5px 0 color-mix(in srgb,var(--card) 65%,var(--ink)),0 5px 0 3px var(--ink)}
body .btn.sm{padding:6px 12px;font-size:13px;border-radius:12px}body .btn:disabled{opacity:.5;filter:grayscale(.4)}
body .big2{font-size:20px;padding:13px 36px;border-radius:22px;box-shadow:0 5px 0 color-mix(in srgb,var(--acc) 60%,#000),0 5px 0 3px var(--ink)}
body .chip,body .filter-chip{border:3px solid var(--ink);background:var(--card);color:var(--ink);border-radius:99px;font-family:inherit;font-weight:600;padding:5px 14px}
body .chip.on,body .filter-chip.on{background:var(--acc);color:#fff;box-shadow:0 3px 0 var(--ink)}
body .category-row .chip{border-radius:99px}
body input:not([type=range]):not([type=color]):not([type=file]):not([type=checkbox]),body select,body .game-search{border:3px solid var(--ink);border-radius:14px;background:var(--card);color:var(--ink);font-family:inherit;font-weight:600}
body .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media(min-width:700px){body .grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
body .hero .pic{border:4px solid var(--ink);border-radius:26px;box-shadow:0 6px 0 var(--ink)}
body .lv{border:3px solid var(--ink);background:var(--card);color:var(--ink);font-family:inherit}body .lv.on{background:var(--acc);color:#fff}
body .lb td{border-bottom:2px dashed color-mix(in srgb,var(--ink) 20%,transparent)}
body .avatar{border:3px solid var(--ink);border-radius:50%;background:var(--acc)}
body .bubble{border:2px solid var(--ink);border-radius:16px}body .chatlog{border:3px solid var(--ink);border-radius:16px}
body .game-panel{border-radius:26px}body #game canvas{border:4px solid var(--ink);border-radius:20px;box-shadow:0 5px 0 var(--ink)}
body .cell,body .mc,body .ttt button{border:3px solid var(--ink)!important;border-radius:16px;box-shadow:0 4px 0 var(--ink)}
body .msg{font-weight:700}
.chero{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,var(--card),color-mix(in srgb,var(--acc) 14%,var(--card)))}
.chero svg{flex:0 0 auto}.chero-r{flex:1;min-width:0}.chero-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.cbub{background:#fff;color:#4a2c6b;border:3px solid var(--ink);border-radius:16px;padding:8px 12px;font-weight:600}
.cmas{animation:cbob 3.2s ease-in-out infinite}.cmas .ey{transform-origin:60px 74px;animation:cbl 4.5s infinite}
@keyframes cbob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
@keyframes cbl{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
.cspb{position:fixed;width:12px;height:12px;pointer-events:none;z-index:200;clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)}
body .shop-list{display:grid;gap:18px}body .shop-row{display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(120deg,#e4d4ff,#b8a2f3);color:#302044}body .shop-row>div{flex:1}body .shop-row p{margin:4px 0;font-size:13px}body .shop-icon{display:grid;place-items:center;min-width:56px;height:64px;border:3px solid #4a2c6b;border-radius:16px;font-size:28px}body .shop-row .btn{flex-shrink:0}body .gc .art svg{animation:none}@media(max-width:480px){#ctop{flex-wrap:wrap}#ctop .me{flex:1}#ctop .cib{width:30px;height:30px}#ctop .cpill{padding-right:6px;font-size:12px}body .shop-row{padding:10px;gap:8px}body .shop-row .btn{padding:5px 8px}}
body .palette-pop{border:3px solid var(--ink);border-radius:20px}
#gate{background:linear-gradient(160deg,color-mix(in srgb,var(--acc) 55%,#fff),color-mix(in srgb,var(--acc2) 45%,#fff))!important;color:var(--ink)!important}
#gate p{font-weight:700;font-size:21px;margin:0}#gate .auth-orb,#gate .auth-star{display:none}#gate .auth-art{width:140px;height:140px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* ---------- mascot, sparkles, background ---------- */
const mascot=(hat=accountProfile.equipment?.hat||'none',size=100)=>{const pet=accountProfile.equipment?.pet||'rabbit';if(window.CutieArt)return window.CutieArt.mochi(pet,hat,size);const H={party:'<path d="M43 47L60 10l18 37z" fill="#9b7bff"/><circle cx="60" cy="10" r="6" fill="#ffd966"/><path d="M51 30l19 7M47 40l19-20" stroke="#fff"/>',flower:'<g fill="#ffd966"><circle cx="45" cy="44" r="8"/><circle cx="60" cy="40" r="8"/><circle cx="75" cy="44" r="8"/></g>',shades:'<path d="M30 67h60l-5 15H68l-8-9-8 9H35z" fill="#9b7bff"/>',none:'',bow:'<path d="M86 38l-14 6 3 12zM86 38l14 8-8 10z" fill="var(--acc)"/><circle cx="86" cy="40" r="4" fill="#fff"/>',crown:'<path d="M46 50L48 34l8 9 4-14 4 14 8-9 2 16z" fill="#ffd966"/>'};
return `<svg class="cmas" width="${size}" height="${size}" viewBox="0 0 120 120"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${pet==='rabbit'?`<ellipse cx="40" cy="32" rx="11" ry="24" fill="#fff" transform="rotate(-10 40 32)"/><ellipse cx="80" cy="32" rx="11" ry="24" fill="#fff" transform="rotate(10 80 32)"/><ellipse cx="40" cy="34" rx="5" ry="15" fill="var(--acc)" stroke="none" transform="rotate(-10 40 34)"/><ellipse cx="80" cy="34" rx="5" ry="15" fill="var(--acc)" stroke="none" transform="rotate(10 80 34)"/>`:pet==='cat'?'<path d="M24 64L20 23l32 25M68 48l32-25-4 41" fill="#fff"/><path d="M28 45l-2-12 14 13M80 46l14-13-2 12" stroke="#ff9ccb"/>':'<ellipse cx="26" cy="58" rx="15" ry="28" fill="#d9ac86"/><ellipse cx="94" cy="58" rx="15" ry="28" fill="#d9ac86"/>'}<ellipse cx="60" cy="76" rx="42" ry="34" fill="#fff"/><g class="ey" stroke="none"><ellipse cx="44" cy="74" rx="5.5" ry="7" fill="${INK}"/><ellipse cx="76" cy="74" rx="5.5" ry="7" fill="${INK}"/><circle cx="46" cy="71" r="2" fill="#fff"/><circle cx="78" cy="71" r="2" fill="#fff"/></g><ellipse cx="33" cy="84" rx="7" ry="4.5" fill="var(--acc)" stroke="none" opacity=".7"/><ellipse cx="87" cy="84" rx="7" ry="4.5" fill="var(--acc)" stroke="none" opacity=".7"/><path d="M54 84q3 4.5 6 0q3 4.5 6 0" fill="none"/>${H[hat]||''}</g></svg>`};
function burst(x,y,n=14){const cols=['#ff7eb6','#ffd966','#7be0c3','#7cc8ff','#c9a8ff'];for(let i=0;i<n;i++){const s=document.createElement('span');s.className='cspb';s.style.left=x+'px';s.style.top=y+'px';s.style.background=cols[i%5];document.body.append(s);const a=Math.random()*6.28,r=40+Math.random()*80;s.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) scale(.2) rotate(240deg)`,opacity:0}],{duration:700+Math.random()*300,easing:'ease-out'}).onfinish=()=>s.remove()}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('.btn,.chip,.gc,#ctabs button,.cib'))burst(e.clientX,e.clientY,6)});
const D=document.createElement('div');D.id='cdood';const S=document.createElement('div');S.id='cspark';document.body.prepend(S);document.body.prepend(D);
const shp=[c=>`<svg width="34" height="34" viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,c=>`<svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,c=>`<svg width="44" height="20" viewBox="0 0 44 20"><path d="M2 10q5-9 10 0t10 0 10 0 10 0" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,c=>`<svg width="48" height="30" viewBox="0 0 48 30"><path d="M10 26a8 8 0 010-16 10 10 0 0119-2 8 8 0 019 8 7 7 0 01-2 10z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,c=>`<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="${c}" stroke-width="2.2"/></svg>`,c=>`<svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`];
const dc=['#fff','#ff9ccb','#9b7bff','#6fd8f5','#ffcf4d'];
for(let i=0;i<26;i++){const d=document.createElement('div');d.className='cdd';d.style.left=Math.random()*96+'%';d.style.top=Math.random()*96+'%';d.style.setProperty('--r',(Math.random()*40-20)+'deg');d.style.animationDelay=-Math.random()*7+'s';d.style.animationDuration=(5+Math.random()*5)+'s';d.innerHTML=shp[i%6](dc[i%5]);D.append(d)}
for(let i=0;i<18;i++){const s=document.createElement('i');s.className='csp';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=-Math.random()*3+'s';s.style.animationDuration=(2+Math.random()*2.5)+'s';const z=8+Math.random()*12;s.style.width=s.style.height=z+'px';S.append(s)}

/* ---------- top bar + bottom tabs ---------- */
const IC={shop:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 016 0"/>',lb:'<path d="M8 4h8v6a4 4 0 01-8 0z"/><path d="M8 6H4v1a3 3 0 003 3M16 6h4v1a3 3 0 01-3 3M12 14v4M8 20h8"/>',play:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',chat:'<path d="M21 12a8 8 0 01-8 8H4l2.3-3A8 8 0 1121 12z"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',daily:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18M12 8c-3-5-7-3-5 0M12 8c3-5 7-3 5 0"/>',online:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18.5 14h.01"/>',fol:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.7c2.7.2 4.8 1.9 5.6 4.8"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'};
const svg=k=>`<svg viewBox="0 0 24 24">${IC[k]}</svg>`;
const top=document.createElement('header');top.id='ctop';
top.innerHTML=`<div class="me"><span id="cav"></span><div><b id="cnm"></b><div class="cxp"><i id="cxp"></i></div></div></div><div class="cpill"><i>★</i><span id="ccoin">0</span></div><div class="cpill" aria-label="Diamonds">💎 <span id="cgem">0</span></div>`+['daily','online','fol','settings'].map(k=>`<button class="cib" data-go="${k}" aria-label="${k}">${svg(k)}</button>`).join('');
const tabs=document.createElement('nav');tabs.id='ctabs';
tabs.innerHTML=[['shop','Shop'],['lb','Ranks'],['play','Play'],['chat','Chat'],['profile','Me']].map(([k,n])=>`<button data-go="${k}">${svg(k)}${n}</button>`).join('');
document.body.append(top,tabs);
[top,tabs].forEach(el=>el.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){tab=b.dataset.go;playing=null;sel=null;render()}}));
document.getElementById('cav').innerHTML=mascot(undefined,38);
let lastLook='';
function topUpdate(){try{const look=JSON.stringify(accountProfile.equipment||{});if(look!==lastLook){lastLook=look;$('#cav').innerHTML=mascot(undefined,38);const hero=$('.chero .cmas');if(hero)hero.outerHTML=mascot(undefined,92);const av=$('#view .profile-head .avatar');if(av)av.innerHTML=mascot(undefined,58)}$('#cgem').textContent=accountProfile.diamonds||0;const t=totals(me.stats),lv=1+Math.floor(t.pts/400);$('#cnm').textContent='Lv '+lv;$('#cnm').title=myName||'Player';$('#cxp').style.width=((t.pts%400)/4)+'%';$('#ccoin').textContent=(accountProfile&&accountProfile.coins)||0}catch(e){}}
window.refreshMochi=topUpdate;
setInterval(topUpdate,1500);
const TITLES={online:'Play Together',daily:'Daily Gifts',shop:'Shop',lb:'Ranks',fol:'Friends',chat:'Chat',profile:'My Profile',settings:'Settings'};
function decorate(){
 document.body.dataset.tab=tab;
 const m=document.querySelector('main');if(!m)return;
 m.querySelectorAll('.rwrap.cr').forEach(x=>x.remove());
 let t=TITLES[tab]||'Games';if(tab==='play'&&(playing||sel)){const G=GAMES.find(g=>g.id===(playing||sel));if(G)t=G.n}
 const r=document.createElement('div');r.className='rwrap cr';r.innerHTML='<span class="ribbon">'+esc(t)+'</span>';m.insertBefore(r,m.firstChild);
 const act=tab;[top,tabs].forEach(el=>el.querySelectorAll('[data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go===act)));
 if(tab==='profile'){const av=$('#view .avatar');if(av)av.innerHTML=mascot(undefined,58)}
 topUpdate();
}
function addHero(){
 const v=$('#view');if(!v||v.querySelector('.chero'))return;
 const hi=["Ready to play?","Let's win some coins!","Pick a game, cutie!","You're on a roll!"],d=document.createElement('div');d.className='card chero';
 d.innerHTML=mascot(undefined,92)+`<div class="chero-r"><div class="cbub">Hi ${esc(myName||'friend')}! ${hi[Math.floor(Math.random()*hi.length)]}</div><div class="chero-b"><button class="btn sm" data-go="daily">Daily gift</button><button class="btn sm ghost" data-go="online">Play with friends</button></div></div>`;
 v.insertBefore(d,v.firstChild);
 d.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{tab=b.dataset.go;playing=null;sel=null;render()});
}
const _render=render;render=function(){_render.apply(this,arguments);try{decorate()}catch(e){}};
const _rm=renderMenu;renderMenu=function(){_rm.apply(this,arguments);try{addHero()}catch(e){}};
const _end=end;end=function(g,won,text,score,nr){_end(g,won,text,score,nr);if(won)setTimeout(()=>burst(innerWidth/2,innerHeight*.4,34),80)};

/* ---------- gate mascot ---------- */
const gate=document.getElementById('gate');
if(gate){const art=gate.querySelector('.auth-art');if(art)art.innerHTML=mascot(undefined,140);const mo=new MutationObserver(()=>{if(!document.body.contains(gate)){mo.disconnect();return}const a=gate.querySelector('.auth-art');if(a&&!a.querySelector('.cmas'))a.innerHTML=mascot(undefined,140)});mo.observe(gate,{childList:true,subtree:true})}

/* ---------- 4 new games ---------- */
GAMES.push(
{id:'flappy',n:'Flappy Birdie',e:'🐤',a:'',t:'Skill',d:'Tap to flap through the pipes',h:'Tap to flap. Pass enough pipes to win. Higher levels have smaller gaps.'},
{id:'breakout',n:'Candy Breaker',e:'🧱',a:'',t:'Skill',d:'Bounce the ball and smash every brick',h:'Drag to move the paddle. Clear all bricks before you lose 3 balls.'},
{id:'pong',n:'Pong Duel',e:'🏓',a:'',t:'Sports',d:'Beat the rival paddle',h:'Drag sideways to move your paddle. First to 5 points wins. Higher levels have a faster ball.'},
{id:'lights',n:'Lights Out',e:'💡',a:'',t:'Puzzle',d:'Switch every light off',h:'Tapping a light flips it and its four neighbours. Turn them all off.'});
Object.assign(BG,{flappy:'#bfe6ff',breakout:'#ffd6e8',pong:'#d6f5e6',lights:'#2a2450'});
Object.assign(PIC,{
flappy:'<rect x="62" y="0" width="22" height="34" rx="4" fill="#5fd3a8" stroke="#2d8a68" stroke-width="3"/><rect x="62" y="66" width="22" height="34" rx="4" fill="#5fd3a8" stroke="#2d8a68" stroke-width="3"/><circle cx="34" cy="50" r="18" fill="#ff7eb6" stroke="#8e2f5f" stroke-width="3"/><circle cx="41" cy="45" r="4" fill="#fff"/><circle cx="42" cy="45" r="2"/><path d="M50 50l12 3-11 5z" fill="#ffd400"/>',
breakout:'<rect x="8" y="12" width="26" height="12" rx="4" fill="#ff7eb6"/><rect x="37" y="12" width="26" height="12" rx="4" fill="#ffd400"/><rect x="66" y="12" width="26" height="12" rx="4" fill="#5fd3a8"/><rect x="8" y="28" width="26" height="12" rx="4" fill="#7cc8ff"/><rect x="37" y="28" width="26" height="12" rx="4" fill="#c9a8ff"/><circle cx="54" cy="62" r="6" fill="#fff" stroke="#8e2f5f" stroke-width="3"/><rect x="28" y="84" width="44" height="9" rx="4" fill="#8d6dff"/>',
pong:'<rect x="30" y="10" width="40" height="8" rx="4" fill="#ff7eb6"/><rect x="30" y="82" width="40" height="8" rx="4" fill="#8d6dff"/><circle cx="56" cy="46" r="7" fill="#fff" stroke="#2d8a68" stroke-width="3"/><path d="M10 50h80" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>',
lights:'<g fill="#ffd400"><circle cx="24" cy="24" r="10"/><circle cx="50" cy="50" r="10"/><circle cx="76" cy="24" r="10"/><circle cx="24" cy="76" r="10"/></g><g fill="#4a3f7a"><circle cx="50" cy="24" r="10"/><circle cx="76" cy="50" r="10"/><circle cx="24" cy="50" r="10"/><circle cx="50" cy="76" r="10"/><circle cx="76" cy="76" r="10"/></g>'});

function flappy(){
 const gap=Math.max(92,146-LV*2),goal=6+LV,spd=2+LV*.05;
 frame('flappy','<div class="msg" id="m"></div><canvas id="fc" width="320" height="440" style="width:100%;max-width:320px;display:block;margin:0 auto;touch-action:none"></canvas><p class="game-instruction">Tap to flap!</p>');
 const cv=$('#fc'),c=cv.getContext('2d');let by=200,vy=0,P=[],sc=0,t=60,go=false,done=false,paused=false,revived=false;
 const flap=()=>{if(done||paused)return;go=true;vy=-6.1;snd('pop')};
 cv.onpointerdown=e=>{e.preventDefault();flap()};
 const key=e=>{if(e.code==='Space'){e.preventDefault();flap()}};addEventListener('keydown',key);
 const fin=(w,txt)=>{if(done||paused)return;if(!w&&!revived){paused=true;offerRevive('flappy',sc*40,()=>{revived=true;paused=false;by=200;vy=0;P=[];t=0;go=false},()=>{paused=false;revived=true;fin(w,txt)});return}done=true;clearInterval(tm);removeEventListener('keydown',key);end('flappy',w,txt,sc*40+(w?LV*50:0))};
 const tm=setInterval(()=>{
  if(paused){if(!$('#revive')){clearInterval(tm);removeEventListener('keydown',key)}return}
  if(!document.body.contains(cv)){clearInterval(tm);removeEventListener('keydown',key);return}
  if(go){vy+=.38;by+=vy;t++;if(t>85){t=0;P.push({x:330,g:gap/2+35+Math.random()*(440-gap-70),s:0})}
   P.forEach(p=>{p.x-=spd;if(!p.s&&p.x+52<68){p.s=1;sc++;snd('ding');if(sc>=goal)fin(true,'Sky master! 🐤')}
    if(p.x<92&&p.x+52>68&&(by-12<p.g-gap/2||by+12>p.g+gap/2)&&!done)fin(false,'Bonk! You passed '+sc+'.')});
   P=P.filter(p=>p.x>-60);if((by>428||by<10)&&!done)fin(false,'Bonk! You passed '+sc+'.')}
  const g=c.createLinearGradient(0,0,0,440);g.addColorStop(0,'#bfe6ff');g.addColorStop(1,'#ffe0f1');c.fillStyle=g;c.fillRect(0,0,320,440);
  c.fillStyle='#fff';[[60,70],[220,110],[150,40]].forEach(([a,b])=>{c.beginPath();c.arc(a,b,16,0,7);c.arc(a+16,b+4,12,0,7);c.arc(a-14,b+4,11,0,7);c.fill()});
  c.strokeStyle='#2d8a68';c.lineWidth=3;P.forEach(p=>{c.fillStyle='#5fd3a8';c.fillRect(p.x,-5,52,p.g-gap/2+5);c.strokeRect(p.x,-5,52,p.g-gap/2+5);c.fillRect(p.x,p.g+gap/2,52,445);c.strokeRect(p.x,p.g+gap/2,52,445)});
  c.save();c.translate(80,by);c.rotate(Math.max(-.5,Math.min(.9,vy*.08)));c.fillStyle='#ff7eb6';c.strokeStyle='#8e2f5f';c.beginPath();c.arc(0,0,13,0,7);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(5,-4,4.5,0,7);c.fill();c.fillStyle='#222';c.beginPath();c.arc(6,-4,2,0,7);c.fill();c.fillStyle='#ffd400';c.beginPath();c.moveTo(11,0);c.lineTo(21,3);c.lineTo(11,7);c.fill();c.restore();
  c.fillStyle='#4a2c6b';c.font='700 22px Fredoka,sans-serif';c.textAlign='center';c.fillText(sc+' / '+goal,160,32);if(!go)c.fillText('Tap to flap!',160,300);
 },16);
}
function breakout(){
 const rows=Math.min(7,3+Math.ceil(LV/4)),PW=Math.max(46,78-LV),sp=3.6+LV*.08,cols=['#ff7eb6','#ffab3d','#ffd966','#7be0c3','#7cc8ff','#c9a8ff','#ff9ccb'];
 frame('breakout','<div class="msg" id="m"></div><canvas id="bc" width="320" height="420" style="width:100%;max-width:320px;display:block;margin:0 auto;touch-action:none"></canvas><p class="game-instruction">Drag to move. Tap to launch.</p>');
 const cv=$('#bc'),c=cv.getContext('2d');let br=[];for(let r=0;r<rows;r++)for(let i=0;i<7;i++)br.push({x:8+i*43,y:40+r*21,c:cols[r]});
 let px=160,bx=160,by=392,vx=0,vy=0,lives=3,sc=0,done=false;
 const pos=e=>{const r=cv.getBoundingClientRect();return(e.clientX-r.left)/r.width*320};
 cv.onpointermove=e=>{px=Math.max(PW/2,Math.min(320-PW/2,pos(e)))};
 cv.onpointerdown=e=>{e.preventDefault();cv.onpointermove(e);if(!vy){vx=(Math.random()*2-1)*2;vy=-sp;snd('click')}};
 const fin=(w,t)=>{if(done)return;done=true;clearInterval(tm);end('breakout',w,t,sc*20+(w?lives*100+LV*50:0))};
 const tm=setInterval(()=>{
  if(!document.body.contains(cv)){clearInterval(tm);return}
  if(!vy){bx=px;by=392}else{bx+=vx;by+=vy;if(bx<7||bx>313){vx*=-1;bx=Math.max(7,Math.min(313,bx))}if(by<7){vy=Math.abs(vy)}
   if(vy>0&&by>392&&by<408&&Math.abs(bx-px)<PW/2+6){vy=-Math.abs(vy)*1.004;vx=(bx-px)/(PW/2)*4.2;snd('pop')}
   for(const b of br){if(bx>b.x-6&&bx<b.x+46&&by>b.y-6&&by<b.y+24){br=br.filter(q=>q!==b);vy*=-1;sc++;snd('ding');break}}
   if(by>430){lives--;vy=0;vx=0;snd('buzz');if(lives<=0)fin(false,'Out of balls!')}
   if(!br.length)fin(true,'Every brick smashed! 🧱')}
  const g=c.createLinearGradient(0,0,0,420);g.addColorStop(0,'#fff0f8');g.addColorStop(1,'#e6dcff');c.fillStyle=g;c.fillRect(0,0,320,420);
  c.strokeStyle='#4a2c6b';c.lineWidth=2.5;br.forEach(b=>{c.fillStyle=b.c;c.beginPath();c.roundRect(b.x,b.y,40,18,6);c.fill();c.stroke()});
  c.fillStyle='#8d6dff';c.beginPath();c.roundRect(px-PW/2,402,PW,12,6);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(bx,by,7,0,7);c.fill();c.stroke();
  c.fillStyle='#4a2c6b';c.font='700 16px Fredoka,sans-serif';c.textAlign='left';c.fillText('Balls '+'♥'.repeat(lives),10,22);c.textAlign='right';c.fillText('Bricks '+br.length,310,22);
 },16);
}
function pong(){
 const W=320,H=420,PW=64,WIN=5,sp=3.2+LV*.1,aiS=1.6+LV*.08;
 frame('pong','<div class="msg" id="m"></div><canvas id="pc" width="320" height="420" style="width:100%;max-width:320px;display:block;margin:0 auto;touch-action:none"></canvas><p class="game-instruction">Drag sideways to move your paddle.</p>');
 const cv=$('#pc'),c=cv.getContext('2d');let px=160,ax=160,bx=160,by=210,vx=sp*.6,vy=sp,ps=0,as=0,done=false;
 cv.onpointermove=e=>{const r=cv.getBoundingClientRect();px=Math.max(PW/2,Math.min(W-PW/2,(e.clientX-r.left)/r.width*W))};cv.onpointerdown=cv.onpointermove;
 const reset=d=>{bx=160;by=210;vx=(Math.random()*2-1)*sp*.6;vy=d*sp};
 const fin=(w,t)=>{if(done)return;done=true;clearInterval(tm);end('pong',w,t,ps*60+(w?LV*50:0))};
 const tm=setInterval(()=>{
  if(!document.body.contains(cv)){clearInterval(tm);return}
  ax+=Math.max(-aiS,Math.min(aiS,bx-ax));ax=Math.max(PW/2,Math.min(W-PW/2,ax));
  bx+=vx;by+=vy;if(bx<8||bx>W-8){vx*=-1;bx=Math.max(8,Math.min(W-8,bx));snd('click')}
  if(vy>0&&by>H-30&&by<H-16&&Math.abs(bx-px)<PW/2+6){vy=-Math.abs(vy)*1.04;vx=(bx-px)/(PW/2)*sp*1.2;snd('pop')}
  if(vy<0&&by<30&&by>16&&Math.abs(bx-ax)<PW/2+6){vy=Math.abs(vy)*1.04;vx=(bx-ax)/(PW/2)*sp*1.2;snd('pop')}
  if(by>H+10){as++;snd('buzz');reset(-1)}if(by<-10){ps++;snd('ding');reset(1)}
  if(ps>=WIN)return fin(true,'You win the duel! 🏓');if(as>=WIN)return fin(false,'The rival wins.');
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e6f9ef');g.addColorStop(1,'#e6e9ff');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='#4a2c6b55';c.setLineDash([8,8]);c.lineWidth=3;c.beginPath();c.moveTo(0,H/2);c.lineTo(W,H/2);c.stroke();c.setLineDash([]);
  c.strokeStyle='#4a2c6b';c.lineWidth=2.5;c.fillStyle='#ff7eb6';c.beginPath();c.roundRect(ax-PW/2,12,PW,10,5);c.fill();c.stroke();c.fillStyle='#8d6dff';c.beginPath();c.roundRect(px-PW/2,H-22,PW,10,5);c.fill();c.stroke();
  c.fillStyle='#fff';c.beginPath();c.arc(bx,by,8,0,7);c.fill();c.stroke();
  c.fillStyle='#4a2c6b';c.font='700 18px Fredoka,sans-serif';c.textAlign='left';c.fillText('Rival '+as,10,H/2-10);c.fillText('You '+ps,10,H/2+24);
 },16);
}
function lights(){
 const N=5;let g=Array(N*N).fill(0),moves=0;
 const flip=i=>{const r=i/N|0,k=i%N;[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const y=r+a,x=k+b;if(y>=0&&y<N&&x>=0&&x<N)g[y*N+x]^=1})};
 for(let n=0;n<4+LV;n++)flip(Math.floor(Math.random()*N*N));if(!g.some(Boolean))flip(12);
 frame('lights','<div class="msg" id="m"></div><div id="lg" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:min(100%,340px);margin:6px auto;padding:10px;background:#2a2450;border:4px solid var(--ink);border-radius:22px"></div>');
 const paint=()=>{$('#m').textContent='Moves '+moves+' · Lights on '+g.filter(Boolean).length;$('#lg').innerHTML=g.map((v,i)=>`<button data-i="${i}" style="aspect-ratio:1;border-radius:50%;border:3px solid ${v?'#fff':'#5a4f95'};background:${v?'radial-gradient(circle at 35% 30%,#fff7b0,#ffd400)':'#3a3270'};box-shadow:${v?'0 0 16px #ffd400':'none'};padding:0;transition:.15s"></button>`).join('');
  $('#lg').querySelectorAll('button').forEach(b=>b.onclick=()=>{flip(+b.dataset.i);moves++;snd('pop');paint();if(!g.some(Boolean))end('lights',true,'All lights off! 💡',Math.max(100,800-moves*15)+LV*40)})};
 paint();
}
const EX={flappy,breakout,pong,lights};
const _sg=startGame;startGame=function(g){return EX[g]?EX[g]():_sg(g)};

render();
}catch(err){console.error('Cutie skin failed to load:',err)}
})();
