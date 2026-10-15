/* Minesweeper */
function mines(){
  const N=6+Math.min(3,Math.floor(LV/8)),M=Math.min(Math.floor(N*N*.22),4+Math.floor(LV/3)+(N-6)*2);
  const cells=Array.from({length:N*N},()=>({m:0,r:0,f:0,n:0}));let placed=false,flag=false,over=false;const t0=Date.now();
  frame('mines','<div class="msg" id="m" style="font-size:15px"></div><div class="row"><button class="btn" id="fm"></button></div><div id="mg" style="display:grid;gap:4px;width:min(100%,380px);margin:10px auto"></div>');
  const nb=i=>{const x=i%N,y=(i/N)|0,o=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const a=x+dx,b=y+dy;if(a>=0&&b>=0&&a<N&&b<N)o.push(b*N+a)}return o};
  const place=s=>{const bad=new Set([s,...nb(s)]);let k=0;while(k<M){const i=Math.floor(Math.random()*N*N);if(!bad.has(i)&&!cells[i].m){cells[i].m=1;k++}}cells.forEach((c,i)=>c.n=nb(i).filter(j=>cells[j].m).length);placed=true};
  const COL=['','#2979ff','#2e7d32','#d32f2f','#6a1b9a','#e65100','#00838f','#333','#777'];
  const paint=()=>{
    $('#m').textContent=`Mines left: ${M-cells.filter(c=>c.f).length}`;
    $('#fm').textContent=flag?'🚩 Flag mode (tap to switch)':'⛏️ Dig mode (tap to switch)';
    $('#mg').style.gridTemplateColumns=`repeat(${N},1fr)`;
    $('#mg').innerHTML=cells.map((c,i)=>{const show=c.r||(over&&c.m),t=c.f&&!show?'🚩':show?(c.m?'💣':(c.n||'')):'';return `<button data-i="${i}" style="aspect-ratio:1;padding:0;border-radius:6px;border:1px solid var(--line);font-size:clamp(14px,4vw,20px);font-weight:900;color:${COL[c.n]||'#333'};background:${show?(c.m?'#ffb3b3':'#f1ece6'):'#d9c9f0'}">${t}</button>`}).join('');
    $('#mg').querySelectorAll('button').forEach(b=>b.onclick=()=>tap(+b.dataset.i));
  };
  function reveal(i){const st=[i];while(st.length){const j=st.pop(),c=cells[j];if(c.r||c.f)continue;c.r=1;if(!c.n&&!c.m)nb(j).forEach(k=>{if(!cells[k].r)st.push(k)})}}
  function tap(i){
    if(over)return;const c=cells[i];
    if(flag){if(!c.r){c.f=c.f?0:1;snd('click')}paint();return}
    if(c.f||c.r)return;
    if(!placed)place(i);
    if(c.m){over=true;snd('thud');paint();return setTimeout(()=>{if(document.body.contains($('#mg')))end('mines',false,'Boom! 💥',cells.filter(x=>x.r).length*10)},1100)}
    reveal(i);snd('pop');paint();
    if(cells.every(x=>x.m||x.r)){const secs=(Date.now()-t0)/1000;end('mines',true,'Field cleared! 🚩',cells.filter(x=>x.r).length*10+Math.max(0,(300-secs)|0)+LV*50)}
  }
  $('#fm').onclick=()=>{flag=!flag;paint()};
  paint();
}
/* Connect Four */
function c4(){
  const R=6,C=7,B=Array(R*C).fill(0),depth=1+Math.min(4,Math.floor(LV/6)),D=[[0,1],[1,0],[1,1],[1,-1]];let over=false,turn=1;
  frame('c4','<div class="msg" id="m" style="font-size:15px"></div><div id="cb" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:min(100%,380px);margin:10px auto;background:#2a4fd6;padding:8px;border-radius:14px"></div>');
  const drop=(b,c,p)=>{for(let r=R-1;r>=0;r--)if(!b[r*C+c]){b[r*C+c]=p;return r}return -1};
  const wins=(b,p)=>{for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const [dr,dc] of D){let k=0;for(;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=R||cc<0||cc>=C||b[rr*C+cc]!==p)break}if(k===4)return true}return false};
  const valid=b=>[3,2,4,1,5,0,6].filter(c=>!b[c]);
  const heur=b=>{let s=0;for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const [dr,dc] of D){let a=0,h=0,ok=true;for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=R||cc<0||cc>=C){ok=false;break}const v=b[rr*C+cc];if(v===2)a++;else if(v===1)h++}if(!ok||(a&&h))continue;if(a===3)s+=5;else if(a===2)s+=2;if(h===3)s-=6;else if(h===2)s-=2}for(let r=0;r<R;r++)if(b[r*C+3]===2)s+=3;return s};
  const mm=(b,d,al,be,max)=>{if(wins(b,2))return 1000+d;if(wins(b,1))return -1000-d;const v=valid(b);if(!v.length||!d)return heur(b);let best=max?-1e9:1e9;for(const c of v){const n=b.slice();drop(n,c,max?2:1);const sc=mm(n,d-1,al,be,!max);if(max){best=Math.max(best,sc);al=Math.max(al,sc)}else{best=Math.min(best,sc);be=Math.min(be,sc)}if(be<=al)break}return best};
  const cpu=()=>{const v=valid(B);if(LV<4&&Math.random()<.35)return v[Math.floor(Math.random()*v.length)];let pick=v[0],best=-1e9;for(const c of v){const n=B.slice();drop(n,c,2);const sc=mm(n,depth-1,-1e9,1e9,false)+Math.random()*.5;if(sc>best){best=sc;pick=c}}return pick};
  const paint=()=>{
    $('#m').textContent=over?'':(turn===1?'Your move (red) 🔴':'CPU is thinking… 🟡');
    $('#cb').innerHTML=B.map((v,i)=>`<button data-c="${i%C}" style="aspect-ratio:1;border-radius:50%;border:0;padding:0;background:${v===1?'#ff4d6d':v===2?'#ffd400':'#eaf0ff'}"></button>`).join('');
    $('#cb').querySelectorAll('button').forEach(b=>b.onclick=()=>play(+b.dataset.c));
  };
  const empties=()=>B.filter(v=>!v).length;
  function after(p){
    if(wins(B,p)){over=true;paint();return setTimeout(()=>{if(!document.body.contains($('#cb')))return;p===1?end('c4',true,'Four in a row! 🔴',100+LV*20+empties()*5):end('c4',false,'The CPU connected four.',10)},700)}
    if(!valid(B).length){over=true;return end('c4',false,"It's a draw!",30)}
    return false;
  }
  function play(c){
    if(over||turn!==1||B[c])return;drop(B,c,1);snd('pop');
    if(after(1)!==false)return;turn=2;paint();
    setTimeout(()=>{if(over||!document.body.contains($('#cb')))return;drop(B,cpu(),2);snd('click');if(after(2)!==false)return;turn=1;paint()},450);
  }
  paint();
}
/* Hangman */
function hangman(){
  const SHORT=['cake','moon','frog','sand','kite','wave','lamp','nest','rain','star','leaf','bell','duck','ship'],MID=['planet','guitar','rocket','castle','pencil','garden','window','jungle','bridge','candle','pirate','marble','rabbit','pillow'],LONG=['elephant','mountain','telescope','umbrella','butterfly','chocolate','adventure','lighthouse','dinosaur','waterfall','spaceship','treasure'];
  const pool=LV<8?SHORT.concat(MID.slice(0,5)):LV<18?MID:LONG.concat(MID),w=pool[Math.floor(Math.random()*pool.length)],MAX=7,got=new Set();let wrong=0,done=false;
  frame('hangman','<div class="msg" id="m" style="font-size:15px"></div><div style="text-align:center"><svg id="hs" viewBox="0 0 120 140" width="150" height="170" aria-hidden="true"></svg></div><div id="hw" style="text-align:center;font-size:clamp(26px,8vw,40px);font-weight:900;letter-spacing:.2em;margin:8px 0"></div><div id="hk" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:380px;margin:0 auto"></div>');
  const parts=['<circle cx="80" cy="42" r="12"/>','<path d="M80 54v34"/>','<path d="M80 62l-16 16"/>','<path d="M80 62l16 16"/>','<path d="M80 88l-14 24"/>','<path d="M80 88l14 24"/>','<path d="M75 38l4 4m0-4l-4 4m10-4l4 4m0-4l-4 4" stroke-width="2"/>'];
  const paint=()=>{
    $('#m').textContent=`Misses left: ${MAX-wrong}`;
    $('#hs').innerHTML=`<g stroke="#6d4c41" stroke-width="5" fill="none" stroke-linecap="round"><path d="M14 132h60M34 132V12h46v18"/></g><g stroke="#2a1837" stroke-width="4" fill="none" stroke-linecap="round">${parts.slice(0,wrong).join('')}</g>`;
    $('#hw').textContent=[...w].map(l=>got.has(l)||done?l.toUpperCase():'_').join(' ');
    $('#hk').innerHTML='abcdefghijklmnopqrstuvwxyz'.split('').map(l=>`<button data-l="${l}" ${got.has(l)||done?'disabled':''} style="padding:8px 0">${l.toUpperCase()}</button>`).join('');
    $('#hk').querySelectorAll('button').forEach(b=>b.onclick=()=>pick(b.dataset.l));
  };
  function pick(l){
    if(done)return;got.add(l);
    if(w.includes(l))snd('pop');else{wrong++;snd('buzz')}
    paint();
    if([...w].every(x=>got.has(x))){done=true;setTimeout(()=>document.body.contains($('#hk'))&&end('hangman',true,'You saved them! 🔤',100+(MAX-wrong)*25+LV*20),500)}
    else if(wrong>=MAX){done=true;paint();setTimeout(()=>document.body.contains($('#hk'))&&end('hangman',false,`The word was "${w}".`,[...w].filter(x=>got.has(x)).length*10),1200)}
  }
  paint();
}
/* Higher or Lower */
function hilo(){
  const TG=5+Math.floor(LV/2),SU=['♠','♥','♦','♣'],RK=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];let lives=LV<10?3:2,ok=0,deck=[],cur,note='';
  const draw=()=>{if(!deck.length){for(let r=1;r<=13;r++)for(let s=0;s<4;s++)deck.push({r,s});for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}}return deck.pop()};
  cur=draw();
  frame('hilo','<div class="msg" id="m" style="font-size:15px"></div><div id="hc" style="display:flex;justify-content:center;margin:12px 0"></div><div class="row"><button class="btn" id="hu">⬆ Higher</button><button class="btn" id="hd">⬇ Lower</button></div><p id="hn" class="booth-status" style="text-align:center"></p>');
  const card=c=>`<div style="width:110px;height:154px;border-radius:12px;background:#fff;border:2px solid #d9d2e2;display:grid;place-items:center;font-size:44px;font-weight:900;color:${c.s===1||c.s===2?'#d32f2f':'#241437'};box-shadow:0 6px 16px #0002"><div style="text-align:center;line-height:1.1">${RK[c.r-1]}<br>${SU[c.s]}</div></div>`;
  const paint=()=>{$('#m').textContent=`Correct ${ok}/${TG} · Lives ${'❤️'.repeat(lives)||'—'}`;$('#hc').innerHTML=card(cur);$('#hn').textContent=note};
  function guess(up){
    const nx=draw(),same=nx.r===cur.r,good=up?nx.r>cur.r:nx.r<cur.r;
    if(same){note=`Same card (${RK[nx.r-1]}) — free pass!`;snd('click')}
    else if(good){ok++;note='Correct!';snd('ding')}
    else{lives--;note=`Wrong — it was ${RK[nx.r-1]}.`;snd('buzz')}
    cur=nx;paint();
    if(ok>=TG)return end('hilo',true,'Lucky streak! 🃏',ok*40+lives*30+LV*20);
    if(lives<=0)return end('hilo',false,'Out of lives.',ok*40);
  }
  $('#hu').onclick=()=>guess(true);$('#hd').onclick=()=>guess(false);paint();
}
/* Color Clash (Stroop) */
function stroop(){
  const NAMES=[['Red','#e53935'],['Blue','#1e88e5'],['Green','#43a047'],['Yellow','#fdd835'],['Purple','#8e24aa'],['Orange','#fb8c00']],K=LV<5?4:LV<12?5:6,TG=8+LV,LIM=Math.max(1100,3000-LV*70);
  let ok=0,lives=3,q=null,t0=0,timer=null;
  frame('stroop','<div class="msg" id="m" style="font-size:15px"></div><div id="sw" style="text-align:center;font-size:clamp(44px,14vw,76px);font-weight:900;margin:14px auto;padding:14px;background:#2a2438;border-radius:16px;max-width:340px;min-height:70px"></div><div style="height:8px;background:#0001;border-radius:99px;overflow:hidden;max-width:340px;margin:0 auto 14px"><div id="sb" style="height:100%;background:var(--acc);width:100%"></div></div><div id="sp" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:340px;margin:0 auto"></div>');
  const stop=()=>clearInterval(timer);
  const info=()=>{$('#m').textContent=`Tap the INK colour · ${ok}/${TG} · Lives ${'❤️'.repeat(lives)}`};
  function ask(){
    const a=Math.floor(Math.random()*K);let b=Math.floor(Math.random()*K);if(Math.random()<.85)while(b===a)b=Math.floor(Math.random()*K);
    q={ink:b};$('#sw').innerHTML=`<span style="color:${NAMES[b][1]}">${NAMES[a][0].toUpperCase()}</span>`;
    $('#sp').innerHTML=NAMES.slice(0,K).map((n,i)=>`<button data-i="${i}" style="padding:14px 0;font-weight:800">${n[0]}</button>`).join('');
    $('#sp').querySelectorAll('button').forEach(x=>x.onclick=()=>answer(+x.dataset.i));
    info();t0=Date.now();stop();
    timer=setInterval(()=>{
      if(!document.body.contains($('#sb'))){stop();return}
      const f=(Date.now()-t0)/LIM;$('#sb').style.width=Math.max(0,100-f*100)+'%';
      if(f>=1){stop();miss()}
    },50);
  }
  function miss(){lives--;snd('buzz');if(lives<=0){stop();return end('stroop',false,'Out of lives.',ok*30)}ask()}
  function answer(i){
    if(!q)return;stop();
    if(i===q.ink){ok++;snd('pop');if(ok>=TG)return end('stroop',true,'Sharp eyes! 🎨',ok*30+lives*40+LV*20);ask()}
    else miss();
  }
  ask();
}
/* Jenga */
function jenga(){
  const layers=8+Math.floor(LV/2),B=Array.from({length:layers},()=>[1,1,1]),TG=Math.min((layers-1)*2,4+Math.floor(LV*.55));let pulled=0;
  frame('jenga','<div class="msg" id="m"></div><div id="tw" data-fz="260" style="max-width:260px;margin:0 auto"></div>');
  const paint=()=>{
    $('#m').textContent=`Level ${LV} · Pulled ${pulled}/${TG}. Never remove the last block from a layer.`;
    $('#tw').innerHTML=B.map((r,i)=>`<div style="display:flex;gap:4px;margin-bottom:4px">${r.map((v,k)=>`<button data-r="${i}" data-k="${k}" ${v&&i>0&&r.reduce((a,b)=>a+b,0)>1?'':'disabled'} aria-label="Pull block ${i+1}-${k+1}" style="flex:1;height:30px;padding:0;border:0;border-radius:5px;background:${v?(i%2?'#c98b4f':'#b97a3d'):'transparent'};box-shadow:${v?'inset 0 -4px #0003':'none'}"></button>`).join('')}</div>`).join('');
    $('#tw').querySelectorAll('button').forEach(b=>b.onclick=()=>pull(+b.dataset.r,+b.dataset.k));
  };
  function pull(i,k){
    const left=B[i].reduce((a,b)=>a+b,0),risk=Math.min(.22,.012+LV*.0025+(3-left)*.04+(pulled/TG)*.045);
    if(Math.random()<risk)return end('jenga',false,'The tower fell! 💥',pulled*20);
    B[i][k]=0;pulled++;paint();
    if(pulled>=TG)end('jenga',true,'Steady hands! 🧱🎉',pulled*20+LV*50);
  }
  paint();
}
/* Snake */
function snake(){
  const N=15,S=20,SW=30+LV*18;let sn=[[7,7],[6,7],[5,7]],d=[1,0],nd=[1,0],ap=[11,7],sc=0;
  frame('snake','<div class="msg" id="m">Score 0 (win at '+SW+')</div><canvas id="cv" width="300" height="300" style="width:100%;max-width:300px;display:block;margin:0 auto;background:var(--bg);border-radius:12px;touch-action:none"></canvas><div class="row" style="margin-top:8px"><button class="btn sm" data-d="U">↑</button><button class="btn sm" data-d="L">←</button><button class="btn sm" data-d="D">↓</button><button class="btn sm" data-d="R">→</button></div>');
  const cv=$('#cv'),c=cv.getContext('2d'),D={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
  const turn=k=>{const v=D[k];if(v[0]!==-d[0]||v[1]!==-d[1])nd=v};
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>turn(b.dataset.d));
  let sx,sy;
  cv.ontouchstart=e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY};
  cv.ontouchend=e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<15)return;turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'))};
  const place=()=>{do{ap=[Math.floor(Math.random()*N),Math.floor(Math.random()*N)]}while(sn.some(p=>p[0]===ap[0]&&p[1]===ap[1]))};
  const draw=()=>{c.clearRect(0,0,300,300);c.font='18px serif';c.fillText('🍎',ap[0]*S+1,ap[1]*S+17);sn.forEach((p,i)=>{c.fillStyle=i?'#ff4d94':'#8e2f5f';c.fillRect(p[0]*S+1,p[1]*S+1,S-2,S-2)})};
  const t=setInterval(()=>{
    if(!document.body.contains(cv)){clearInterval(t);return}
    d=nd;const h=[sn[0][0]+d[0],sn[0][1]+d[1]];
    if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||sn.some(p=>p[0]===h[0]&&p[1]===h[1])){clearInterval(t);return end('snake',sc>=SW,sc>=SW?'Great run! 🐍🎉':'Game over 🐍',sc)}
    sn.unshift(h);
    if(h[0]===ap[0]&&h[1]===ap[1]){sc+=10;$('#m').textContent=`Score ${sc} (win at ${SW})`;place()}else sn.pop();
    draw();
  },Math.max(85,150-LV*2.2));
  draw();
}
/* Bird Launch: drag back like a slingshot; red, blue, yellow, bomb birds */
function bird(){
  const px=40,py=150,gy=180,WT=180-Math.min(110,40+LV*8);
  const pigs=Array.from({length:Math.min(8,1+Math.floor((LV-1)/4))},(_,i)=>({x:198+(i%4)*28,y:gy-14-Math.floor(i/4)*29-((i+LV)%3)*5,hp:1+Math.floor((LV-1)/20),a:true}));
  const types=['red'];if(LV>=2)types.push('blue');if(LV>=4)types.push('yellow');if(LV>=6)types.push('bomb');
  const NB=Math.min(10,2+Math.floor((LV-1)/3)),Q=Array.from({length:NB},(_,i)=>i===0?'red':types[Math.floor(Math.random()*types.length)]);
  if(LV>=2&&Q[1])Q[1]='blue';if(LV>=4&&Q[2])Q[2]='yellow';if(LV>=8&&Q[3])Q[3]='bomb';
  const COL={red:'#e5484d',blue:'#3b82f6',yellow:'#ffd400',bomb:'#333'};
  const HINT={red:'Red: a strong plain shot.',blue:'Blue: tap in flight to split in 3!',yellow:'Yellow: tap in flight to dash!',bomb:'Black: tap in flight to explode!'};
  let idx=0,busy=false,drag=null,off=null,P=[],boom=null;
  frame('bird','<div class="msg" id="m" style="font-size:14px"></div><canvas id="cv" width="320" height="200" style="width:100%;background:var(--bg);border-radius:12px;touch-action:none"></canvas>');
  const cv=$('#cv'),c=cv.getContext('2d');
  const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*320,(e.clientY-r.top)/r.width*320]};
  const msg=()=>{$('#m').textContent=`Level ${LV} · Bird ${idx+1}/${NB} · ${HINT[Q[idx]]} · Targets ${pigs.filter(p=>p.a).length} · Hits needed ${pigs.reduce((sum,p)=>sum+(p.a?p.hp:0),0)}`};
  const body=(x,y,t,r=11)=>{c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=COL[t];c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+r*.35,y-r*.3,r*.32,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(x+r*.45,y-r*.3,r*.15,0,7);c.fill();c.fillStyle='#ffb300';c.beginPath();c.moveTo(x+r*.8,y);c.lineTo(x+r*1.5,y+r*.3);c.lineTo(x+r*.8,y+r*.5);c.fill()};
  function draw(bx,by,tr){
    c.clearRect(0,0,320,200);c.fillStyle='#7bc47f';c.fillRect(0,gy,320,20);
    c.fillStyle='#a1887f';c.fillRect(150,WT,12,gy-WT);c.fillRect(px-3,py+10,6,gy-py-10);
    c.font='23px serif';pigs.forEach(p=>{if(p.a){c.fillText('🐷',p.x-12,p.y+10);if(p.hp>1){c.font='bold 9px sans-serif';c.fillStyle='#fff';c.fillText(String(p.hp),p.x+10,p.y-7);c.font='23px serif';c.fillStyle='#000'}}});
    if(tr){c.fillStyle='#8e2f5f';tr.forEach(([x,y])=>{c.beginPath();c.arc(x,y,2.4,0,7);c.fill()})}
    Q.slice(idx+1).forEach((t,i)=>body(14+i*22,16,t,8));
    if(boom){c.beginPath();c.arc(boom.x,boom.y,46,0,7);c.fillStyle='#ff9f1c88';c.fill()}
    if(!busy&&idx<NB)body(bx,by,Q[idx]);
    P.forEach(o=>{if(o.on)body(o.x,o.y,o.t,o.k?7:11)});
  }
  const sim=(vx,vy)=>{let x=px,y=py,v=[];for(let i=0;i<160;i++){x+=vx;y+=vy;vy+=.25;if(y>=gy||x>320||(x>=150&&x<=162&&y>=WT)||pigs.some(p=>p.a&&Math.hypot(x-p.x,y-p.y)<20))break;if(i%4===0)v.push([x,y])}return v};
  function ability(){
    P.filter(o=>o.on&&!o.used).forEach(o=>{
      o.used=true;
      if(o.t==='yellow'){o.vx*=1.9;o.vy*=1.2;snd('swoosh')}
      else if(o.t==='blue'){P.push({x:o.x,y:o.y,vx:o.vx,vy:o.vy-2.2,t:'blue',on:true,used:true,k:1},{x:o.x,y:o.y,vx:o.vx,vy:o.vy+2.2,t:'blue',on:true,used:true,k:1});snd('swoosh')}
      else if(o.t==='bomb'){boom={x:o.x,y:o.y};o.on=false;pigs.forEach(p=>{if(p.a&&Math.hypot(p.x-o.x,p.y-o.y)<46){p.hp--;if(p.hp<=0)p.a=false}});snd('thud')}
    });
  }
  cv.onpointerdown=e=>{if(busy){ability();return}const p=pt(e);drag={s:p}};
  cv.onpointermove=e=>{
    if(!drag||busy)return;const[x,y]=pt(e);let dx=x-drag.s[0],dy=y-drag.s[1];const l=Math.hypot(dx,dy);
    if(l>60){dx*=60/l;dy*=60/l}
    off=[dx,dy];draw(px+dx,py+dy,sim(-dx*.14,-dy*.14));
  };
  cv.onpointerup=()=>{
    if(!drag)return;drag=null;if(busy)return;let vx=6.5,vy=-5.5;
    if(off&&Math.hypot(off[0],off[1])>=8){vx=-off[0]*.14;vy=-off[1]*.14}
    off=null;fire(vx,vy);
  };
  function fire(vx,vy){
    busy=true;snd('swoosh');P=[{x:px,y:py,vx,vy,t:Q[idx],on:true,used:false}];
    const t=setInterval(()=>{
      if(!document.body.contains(cv)){clearInterval(t);return}
      P.forEach(o=>{
        if(!o.on)return;
        o.x+=o.vx;o.y+=o.vy;o.vy+=.25;
        for(const p of pigs)if(p.a&&Math.hypot(o.x-p.x,o.y-p.y)<20){p.hp--;if(p.hp<=0)p.a=false;o.on=false;snd('pop');break}
        if(o.y>=gy||o.x>330||o.x<-20||(o.x>=150&&o.x<=162&&o.y>=WT))o.on=false;
      });
      draw(px,py);
      if(!P.some(o=>o.on)){
        clearInterval(t);busy=false;P=[];boom=null;idx++;
        const left=NB-idx;
        if(pigs.every(p=>!p.a))end('bird',true,'All targets cleared!',(left+1)*100+pigs.length*50);
        else if(left<=0)end('bird',false,'Out of birds.',pigs.filter(p=>!p.a).length*50);
        else{msg();draw(px,py)}
      }
    },16);
  }
  msg();draw(px,py);
}
/* 2048 */
function g2048(){
  let g=Array.from({length:4},()=>Array(4).fill(0)),sc=0,over=false,won=false,tgt=2**(7+Math.floor((LV+1)/4));
  const tr=m=>m[0].map((_,j)=>m.map(r=>r[j]));
  const add=()=>{const f=[];g.forEach((r,i)=>r.forEach((v,j)=>{if(!v)f.push([i,j])}));if(f.length){const[i,j]=f[Math.floor(Math.random()*f.length)];g[i][j]=Math.random()<.9?2:4}};
  const row=r=>{const a=r.filter(v=>v),o=[];for(let i=0;i<a.length;i++){if(a[i]===a[i+1]){o.push(a[i]*2);sc+=a[i]*2;i++}else o.push(a[i])}while(o.length<4)o.push(0);return o};
  const left=m=>m.map(row),right=m=>m.map(r=>row([...r].reverse()).reverse());
  const can=()=>g.some((r,i)=>r.some((v,j)=>!v||(j<3&&v===r[j+1])||(i<3&&v===g[i+1][j])));
  frame('g2048','<div class="msg" id="m">Score 0 · swipe or use the arrows</div><div class="tb" id="bd" style="grid-template-columns:repeat(4,1fr);max-width:440px"></div><div class="row"><button class="btn sm" data-d="U">↑</button><button class="btn sm" data-d="L">←</button><button class="btn sm" data-d="D">↓</button><button class="btn sm" data-d="R">→</button></div><button class="btn ghost sm" id="fin">Finish and save score</button>');
  $('#fin').onclick=()=>{if(over)return;over=true;end('g2048',won,won?'Target reached! Keep your run.':'Run saved.',sc)};
  const paint=()=>{$('#bd').innerHTML=g.flat().map(v=>`<div class="t2" style="background:${v?`hsl(${335-Math.log2(v)*12},70%,${58-Math.log2(v)*2}%)`:'var(--bg)'}">${v||''}</div>`).join('');$('#m').textContent=`Score ${sc} · target ${tgt}`};
  function move(d){
    if(over)return;const before=JSON.stringify(g);
    if(d==='L')g=left(g);if(d==='R')g=right(g);if(d==='U')g=tr(left(tr(g)));if(d==='D')g=tr(right(tr(g)));
    if(JSON.stringify(g)===before)return;add();paint();
    if(!won&&g.flat().some(v=>v>=tgt)){won=true;$('#m').textContent=`${tgt} reached · keep going`}
    if(!can()){over=true;end('g2048',won,won?'No moves left. Target cleared!':'No moves left.',sc)}
  }
  document.querySelectorAll('#game [data-d]').forEach(b=>b.onclick=()=>move(b.dataset.d));
  const board=$('#bd');let sx,sy;
  board.onpointerdown=e=>{sx=e.clientX;sy=e.clientY};
  board.onpointerup=e=>{if(sx===undefined)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=sy=undefined;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'))};
  add();add();paint();
}
/* Word Guess */
function word(){
  const W='crane slate about house plant water light brain music sound green table chair smile dream ocean river storm cloud beach candy dance eagle flame grape happy juice knife lemon magic night piano queen robot sugar tiger voice whale youth zebra apple bread climb drive earth fresh giant heart'.split(' ');
  const ans=W[Math.floor(Math.random()*W.length)],rows=[],TR=7-Math.min(3,Math.ceil(LV/2));
  frame('word','<div class="wl" id="wl"></div><div class="row"><input id="in" maxlength="5" autocapitalize="none" style="width:130px;text-transform:uppercase"><button class="btn" id="go">Guess</button></div><div class="msg" id="m"></div>');
  const paint=()=>{let h='';for(let i=0;i<TR;i++){const r=rows[i];for(let j=0;j<5;j++){h+=r?`<div style="background:${r[j].c};color:#fff;border-color:${r[j].c}">${r[j].l}</div>`:'<div></div>'}}$('#wl').innerHTML=h};
  function score(w){
    const res=[...w].map(l=>({l,c:'#787c7e'})),left=[...ans];
    res.forEach((x,i)=>{if(x.l===ans[i]){x.c='#1fa971';left[i]=null}});
    res.forEach(x=>{if(x.c!=='#1fa971'){const k=left.indexOf(x.l);if(k>=0){x.c='#c9a227';left[k]=null}}});
    return res;
  }
  $('#go').onclick=()=>{
    const w=$('#in').value.toLowerCase().trim();
    if(!/^[a-z]{5}$/.test(w)){$('#m').textContent='Enter a 5-letter word';return}
    rows.push(score(w));$('#in').value='';paint();
    if(w===ans)return end('word',true,`Got it in ${rows.length}! 🎉`,(7-rows.length)*100);
    if(rows.length===TR)return end('word',false,`It was "${ans}".`);
    $('#m').textContent='';
  };
  paint();
}
/* Match 3: swipe, goals, ice */
function m3(){
  const N=7,K=LV<3?4:5,COL=['#ff4d6d','#ffb703','#3ddc84','#4cc9f0','#b388ff'],FACE=['🍓','🍋','🍏','🫐','🍇'];
  const gk=LV%K,need=12+LV*2,mvMax=Math.max(15,28-Math.floor(LV/2));
  let g,ice=Array(N*N).fill(0),got=0,mv=mvMax,sc=0,busy=false;
  const rnd=()=>Math.floor(Math.random()*K);
  const find=()=>{const s=new Set();for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=g[r][c];if(c<N-2&&g[r][c+1]===v&&g[r][c+2]===v)[0,1,2].forEach(k=>s.add(r*N+c+k));if(r<N-2&&g[r+1][c]===v&&g[r+2][c]===v)[0,1,2].forEach(k=>s.add((r+k)*N+c))}return s};
  const bst=Array(N*N).fill(0);
  const drop=s=>{for(let c=0;c<N;c++){const col=[];for(let r=N-1;r>=0;r--)if(!s.has(r*N+c))col.push([g[r][c],bst[r*N+c]]);while(col.length<N)col.push([rnd(),0]);for(let r=N-1;r>=0;r--){g[r][c]=col[N-1-r][0];bst[r*N+c]=col[N-1-r][1]}}};
  const grow=m=>{for(let ch=1;ch;){ch=0;[...m].forEach(i=>{const b=bst[i];if(!b)return;bst[i]=0;ch=1;const r=i/N|0,c=i%N;if(b==='r')for(let k=0;k<N;k++)m.add(r*N+k);else for(let a=-1;a<2;a++)for(let d=-1;d<2;d++){const y=r+a,x=c+d;if(y>=0&&y<N&&x>=0&&x<N)m.add(y*N+x)}})}};
  const line=i=>{const v=g[i/N|0][i%N];let h=1,w=1,c=i%N,r=i/N|0;for(let k=c-1;k>=0&&g[r][k]===v;k--)h++;for(let k=c+1;k<N&&g[r][k]===v;k++)h++;for(let k=r-1;k>=0&&g[k][c]===v;k--)w++;for(let k=r+1;k<N&&g[k][c]===v;k++)w++;return Math.max(h,w)};
  g=Array.from({length:N},()=>Array.from({length:N},rnd));
  for(let m;(m=find()).size;)drop(m);
  for(let i=0,n=LV>=3?Math.min(14,LV*2):0;i<n;i++)ice[Math.floor(Math.random()*N*N)]=1;
  frame('m3','<div class="msg" id="m" style="font-size:15px"></div><div class="tb" id="bd" style="grid-template-columns:repeat(7,1fr);gap:3px;max-width:340px"></div><div class="note">Swipe a candy to swap it</div>');
  const iceLeft=()=>ice.reduce((a,b)=>a+b,0);
  const paint=()=>{
    $('#m').innerHTML=`Collect <b>${Math.max(0,need-got)}</b> ${FACE[gk]}${iceLeft()?` · Break <b>${iceLeft()}</b> ❄️`:''} · Moves <b>${mv}</b>`;
    $('#bd').innerHTML=g.flat().map((v,i)=>`<div class="cw ${ice[i]?'ice':''}"><div class="cd" data-i="${i}" style="background:radial-gradient(circle at 35% 28%,#ffffffcc,${COL[v]} 55%)">${bst[i]==='r'?'⚡':bst[i]==='b'?'💣':FACE[v]}</div></div>`).join('');
  };
  const sw=(a,b)=>{const t=g[a/N|0][a%N];g[a/N|0][a%N]=g[b/N|0][b%N];g[b/N|0][b%N]=t};
  function step(m){
    if(!m.size){busy=false;paint();
      if(got>=need&&!iceLeft())end('m3',true,'Level goal reached! 🍬',sc+mv*50);
      else if(mv<=0)end('m3',false,'Out of moves.',sc);
      return}
    grow(m);snd('pop');m.forEach(i=>{if(g[i/N|0][i%N]===gk)got++;ice[i]=0});sc+=m.size*10;
    drop(m);paint();setTimeout(()=>{if(document.body.contains($('#bd')))step(find())},260);
  }
  function swipe(a,dx,dy){
    if(busy)return;
    const h=Math.abs(dx)>Math.abs(dy),c=a%N,r=a/N|0,b=h?(dx>0?a+1:a-1):(dy>0?a+N:a-N);
    if(h&&((dx>0&&c===N-1)||(dx<0&&c===0)))return;
    if(!h&&((dy>0&&r===N-1)||(dy<0&&r===0)))return;
    sw(a,b);const m=find();
    if(!m.size){sw(a,b);return}
    if(LV>=4)[a,b].forEach(i=>{if(m.has(i)){const l=line(i);if(l>=4){bst[i]=l>=5?'b':'r';m.delete(i)}}});
    mv--;busy=true;snd('move');step(m);
  }
  const bd=$('#bd');let si=-1,sx=0,sy=0;
  bd.onpointerdown=e=>{const t=e.target.closest('[data-i]');if(t){si=+t.dataset.i;sx=e.clientX;sy=e.clientY}};
  bd.onpointerup=e=>{if(si<0)return;const dx=e.clientX-sx,dy=e.clientY-sy,a=si;si=-1;if(Math.max(Math.abs(dx),Math.abs(dy))>=14)swipe(a,dx,dy)};
  bd.onpointercancel=()=>{si=-1};
  paint();
}
/* Tile Stack: layered tiles, clear sets of 3 */
function tiles(){
  const E=['🍎','🐸','⭐','🍀','🔔','🐟','🍇','🐙','🌙'],NT=Math.min(9,4+LV),P=[];
  [0,1,2,3].forEach(x=>[0,1,2].forEach(y=>P.push([x,y,0])));
  [.5,1.5,2.5].forEach(x=>[.5,1.5].forEach(y=>P.push([x,y,1])));
  P.push([1,1,2],[1.5,.5,2],[2,1,2]);
  const types=[];for(let i=0;i<7;i++)types.push(E[i%NT],E[i%NT],E[i%NT]);
  types.sort(()=>Math.random()-.5);
  let T=P.map(([x,y,z],i)=>({x,y,z,e:types[i],on:true})),tray=[];
  frame('tiles','<div class="msg" id="m">Tap free tiles. 3 alike clear. Tray holds 7.</div><div class="stage" id="st"></div><div class="tray" id="tr"></div>');
  const cov=t=>T.some(o=>o.on&&o.z>t.z&&Math.abs(o.x-t.x)<1&&Math.abs(o.y-t.y)<1);
  const paint=()=>{
    $('#st').innerHTML=T.filter(t=>t.on).sort((a,b)=>a.z-b.z).map(t=>`<button class="ts ${cov(t)?'cov':''}" style="left:${t.x*62-t.z*2}px;top:${t.y*62-t.z*3}px;z-index:${t.z}" data-i="${T.indexOf(t)}">${t.e}</button>`).join('');
    $('#st').querySelectorAll('.ts').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
    $('#tr').innerHTML=tray.map(e=>`<span>${e}</span>`).join('');
  };
  function pick(i){
    const t=T[i];if(!t.on||cov(t))return;
    t.on=false;tray.push(t.e);tray.sort();
    const n=tray.filter(e=>e===t.e).length;
    if(n>=3){let k=0;tray=tray.filter(e=>!(e===t.e&&k++<3))}
    paint();
    if(!T.some(x=>x.on))end('tiles',true,'All cleared! 🎉',210);
    else if(tray.length>=7)end('tiles',false,'Tray is full.',T.filter(x=>!x.on).length*10);
  }
  paint();
}
/* Leaderboards */
function renderLB(){
  const a=allPlayers();
  const chips=(items,cur,key)=>`<div class="chips">${items.map(([v,l])=>`<button class="chip ${cur===v?'on':''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  let html=chips([['all','Overall'],['game','Per game'],['type','By type']],lbMode,'mode');
  if(lbMode==='game')html+=chips(GAMES.filter(g=>!g.tool).map(g=>[g.id,g.e]),lbGame,'game');
  if(lbMode==='type')html+=chips(TYPES.map(t=>[t,t]),lbType,'type');
  if(lbMode==='game'){const G=GAMES.find(g=>g.id===lbGame);html+=`<div class="card"><b>${G.e} ${G.n}: best scores</b>${gameLB(lbGame,25)}</div>`}
  else{
    const gs=lbMode==='type'?GAMES.filter(g=>g.t===lbType):GAMES;
    const rows=Object.keys(a).map(id=>{let p=0,w=0,best=0;gs.forEach(g=>{const x=(a[id].stats||{})[g.id]||{};p+=x.p||0;w+=x.w||0;best+=x.best||0});return{id,p,w,best}}).sort((x,y)=>y.best-x.best||y.w-x.w||y.p-x.p||nm(x.id).localeCompare(nm(y.id)));
    html+=rows.length?`<div class="card"><div class="top"><b>${lbMode==='type'?lbType:'Overall best scores'}</b><span>${rows.length} players</span></div><table class="lb">${rows.slice(0,25).map((r,i)=>`<tr class="${r.id===myId?'me':''}"><td>${rankCell(i)}</td><td>${esc(nm(r.id))}</td><td class="r">${r.p} plays · ${r.w} wins</td><td class="r"><b style="color:var(--ink)">${r.best}</b> best pts</td></tr>`).join('')}</table></div>`:'<div class="card"><div class="msg">No scores here yet. Go play!</div></div>';
  }
  $('#view').innerHTML=html;
  $('#view').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    const k=c.dataset.k,v=c.dataset.v;
    if(k==='mode')lbMode=v;if(k==='game')lbGame=v;if(k==='type')lbType=v;renderLB();
  });
}
function renderFollow(){
  const a=allPlayers();
  const rows=Object.keys(a).map(id=>({id,f:followers(id),w:totals(a[id].stats).w})).sort((x,y)=>y.f-x.f||y.w-x.w);
  $('#view').innerHTML=`<div class="card"><div class="top"><b>Most followed</b><small style="color:var(--mute)">You follow ${me.following.length}</small></div><table class="lb">`+
    rows.slice(0,25).map((r,i)=>`<tr class="${r.id===myId?'me':''}"><td>${i+1}</td><td>${esc(nm(r.id))}</td><td class="r">${r.f} follower${r.f===1?'':'s'}</td><td class="r">${r.id===myId?'':`<button class="btn sm ${me.following.includes(r.id)?'ghost':''}" data-f="${r.id}">${me.following.includes(r.id)?'Following':'Follow'}</button>`}</td></tr>`).join('')+'</table></div>';
  $('#view').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>toggleFollow(b.dataset.f));
}
