function fit(){
  document.querySelectorAll('#game canvas').forEach(c=>{c.style.height='auto';c.style.maxWidth='100%'});
}
addEventListener('resize',()=>{if(playing)fit()});
function frame(g,inner){
  const G=GAMES.find(x=>x.id===g);
  $('#view').innerHTML=`<section class="card game-panel"><div class="top"><b>${G.n}</b><b style="color:var(--acc2)">${G.tool?'':hasLevels(g)?'Level '+LV:'Best '+(st(g).best||0)}</b></div><div id="game">${inner}</div></section>`;
  document.body.classList.add('pl');setTimeout(fit,0);
  return $('#game');
}
let AC=null,muted=false;try{muted=localStorage.getItem('ah_mute')==='1'}catch(e){}
function snd(t){
  if(muted)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
    const T={click:[[660,.05]],move:[[440,.04],[540,.06]],pop:[[880,.05],[1180,.08]],coin:[[988,.07],[1319,.2]],ding:[[784,.1],[1047,.22]],buzz:[[160,.28,'sawtooth']],thud:[[110,.2,'square']],swoosh:[[900,.05],[600,.06],[350,.12]],pour:[[500,.06],[420,.06],[340,.1]],win:[[523,.12],[659,.12],[784,.12],[1047,.3]],lose:[[330,.18,'sawtooth'],[262,.18,'sawtooth'],[196,.35,'sawtooth']],t0:[[262,.3]],t1:[[330,.3]],t2:[[392,.3]],t3:[[523,.3]]};
    let at=AC.currentTime;
    (T[t]||[]).forEach(([f,d,w])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w||'triangle';o.frequency.value=f;g.gain.setValueAtTime(.12,at);g.gain.exponentialRampToValueAtTime(.001,at+d);o.connect(g);g.connect(AC.destination);o.start(at);o.stop(at+d);at+=d*.9});
  }catch(e){}
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||b.id==='snd')return;snd(b.closest('#bd')?'move':'click')});
function end(g,won,text,score=0,nr){
  snd(won?'win':'lose');
  if(!nr)record(g,won,score);
  const el=$('#game');if(!el)return;
  const nx=hasLevels(g)&&won&&LV<MAX_LEVEL;
  el.innerHTML=`<div class="msg ${won?'win':'lose'}">${text}</div><div class="msg" style="font-size:15px">Score: ${score}${hasLevels(g)?' · Level '+LV:''}</div><p id="roundReward" role="status">Saving rewards…</p><div class="row"><button class="btn" id="again">🔁 Replay</button>${nx?'<button class="btn" id="nxt">Next level ➜</button>':''}<button class="btn ghost" id="ex">Exit</button></div>`;
  if(!nr)saveQueue.then(()=>apiJson('/api/game/reward',{method:'POST',body:JSON.stringify({game:g})})).then(p=>{accountProfile=p;if(document.body.contains(el)&&$('#roundReward'))$('#roundReward').textContent=`+${p.gameReward} coins · Best ${st(g).best||0}`}).catch(e=>{if($('#roundReward'))$('#roundReward').textContent='Reward not saved: '+e.message});
  else if($('#roundReward'))$('#roundReward').remove();
  $('#again').textContent='Play again';
  $('#again').onclick=()=>startGame(g);
  if(nx)$('#nxt').onclick=()=>{LV++;startGame(g)};
  $('#ex').onclick=()=>{playing=null;render()};
}
function startGame(g){({snake,ttt,rps,mem,react,guess,math,bird,g2048,word,m3,tiles,jenga,ludo,chess,bubble,beat,boba,fruit,golf,cat,sketch,race,cook,snl,sudoku,mystery,tetris,water,wordsearch,photo,simon,whack,slide,mines,c4,hangman,hilo,stroop})[g]()}

/* Tic-Tac-Toe */
function ttt(){
  let b=Array(9).fill(''),over=false;
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=p=>L.some(l=>l.every(i=>b[i]===p));
  const el=frame('ttt','<div class="board" id="bd"></div><div class="msg" id="m">Your move (X)</div>');
  const draw=()=>{$('#bd').innerHTML=b.map((v,i)=>`<button class="cell" data-i="${i}" style="color:${v==='X'?'#e5484d':'#2b6cff'};border:3px solid var(--acc);background:var(--card);font-size:56px">${v}</button>`).join('');
    $('#bd').querySelectorAll('.cell').forEach(c=>c.onclick=()=>move(+c.dataset.i))};
  const find=p=>{for(const l of L){const v=l.map(i=>b[i]);if(v.filter(x=>x===p).length===2&&v.includes('')){return l[v.indexOf('')]}}return -1};
  function fin(won,t){over=true;draw();end('ttt',won,t,won?100:/Draw/.test(t)?30:0)}
  function move(i){
    if(over||b[i])return;b[i]='X';
    if(win('X'))return fin(true,'You win! 🎉');
    if(!b.includes(''))return fin(false,'Draw. No win this time.');
    let c=-1;if(Math.random()<Math.min(.78,.3+LV*.016)){c=find('O');if(c<0)c=find('X')}
    if(c<0&&!b[4])c=4;
    if(c<0){const f=b.map((v,k)=>v?-1:k).filter(k=>k>=0);c=f[Math.floor(Math.random()*f.length)]}
    b[c]='O';
    if(win('O'))return fin(false,'CPU wins 🤖');
    if(!b.includes(''))return fin(false,'Draw. No win this time.');
    draw();
  }
  draw();
}
/* Rock Paper Scissors */
function rps(){
  let you=0,cpu=0;const K=1+Math.floor((LV-1)/10);const M=['🪨','📄','✂️'];
  frame('rps','<div class="msg" id="m">Pick one!</div><div class="row" id="ch"></div><div class="msg" id="sc">You 0 - 0 CPU</div>');
  $('#ch').innerHTML=M.map((x,i)=>`<button class="big" data-i="${i}">${x}</button>`).join('');
  $('#ch').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    const a=+b.dataset.i,c=Math.floor(Math.random()*3);
    let t=`${M[a]} vs ${M[c]}: `;
    if(a===c)t+='draw';else if((a-c+3)%3===1){you++;t+='you score'}else{cpu++;t+='CPU scores'}
    if(you===K)return end('rps',true,'You won the match! 🎉',100);
    if(cpu===K)return end('rps',false,'CPU won the match.',you*50);
    $('#m').textContent=t;$('#sc').textContent=`You ${you} - ${cpu} CPU`;
  });
}
/* Memory */
function mem(){
  const E=['🍎','🍌','🍇','🍒','🍉','🍋','🥝','🍑','🍓','🥥','🫐','🍍','🍐','🍊','🍈','🥑','🥕','🍅'],pairCount=Math.min(E.length,8+Math.floor((LV-1)*10/29)),pairs=E.slice(0,pairCount);
  const cards=[...pairs,...pairs].sort(()=>Math.random()-.5);
  let open=[],moves=0,found=0,lock=false;const ML=Math.max(pairCount+1,48-Math.floor(LV*.8));
  frame('mem',`<div class="msg" id="m">Pairs ${pairCount} · Moves: 0 (win at ${ML} or fewer)</div><div class="mem" id="mg" style="grid-template-columns:repeat(${pairCount>10?6:4},1fr)"></div>`);
  const paint=()=>{$('#mg').innerHTML=cards.map((c,i)=>{const s=cards[i].d?'done':open.includes(i)?'up':'';return`<button class="mc ${s}" data-i="${i}">${s?c.e||c:'?'}</button>`}).join('')};
  const C=cards.map(e=>({e,d:false}));cards.length=0;C.forEach(c=>cards.push(c));
  const paint2=()=>{$('#mg').innerHTML=cards.map((c,i)=>{const s=c.d?'done':open.includes(i)?'up':'';return`<button class="mc ${s}" data-i="${i}">${s?c.e:'?'}</button>`}).join('');
    $('#mg').querySelectorAll('.mc').forEach(b=>b.onclick=()=>flip(+b.dataset.i))};
  function flip(i){
    if(lock||cards[i].d||open.includes(i))return;
    open.push(i);paint2();
    if(open.length===2){
      moves++;$('#m').textContent=`Moves: ${moves} (win at ${ML} or fewer)`;
      const[a,b]=open;
      if(cards[a].e===cards[b].e){cards[a].d=cards[b].d=true;open=[];found++;paint2();
        if(found===pairCount)end('mem',moves<=ML,moves<=ML?`Cleared in ${moves} moves! 🎉`:`Cleared in ${moves} moves. Too slow for a win.`,Math.max(0,1000-moves*25))}
      else{lock=true;setTimeout(()=>{open=[];lock=false;paint2()},700)}
    }
  }
  paint2();
}
/* Reaction */
function react(){
  let t0=0,timer=0,state='wait';const TH=Math.max(130,420-LV*9.5);
  frame('react','<button class="zone" id="z"></button>');
  const z=$('#z');
  function arm(){state='wait';z.style.background='#e5484d';z.textContent='Wait for green...';
    timer=setTimeout(()=>{state='go';z.style.background='#1fa971';z.textContent='TAP!';t0=performance.now()},1500+Math.random()*2500)}
  z.onclick=()=>{
    if(state==='wait'){clearTimeout(timer);end('react',false,'Too early! 🙈')}
    else if(state==='go'){const ms=Math.round(performance.now()-t0);state='done';end('react',ms<TH,ms<TH?`${ms} ms. Lightning! ⚡`:`${ms} ms. Need under ${TH}.`,Math.max(0,1000-ms))}
  };
  arm();
}
/* Number guess */
function guess(){
  const R=30+LV*20,n=1+Math.floor(Math.random()*R),maxTries=6+Math.floor((LV-1)/4);let tries=0;
  frame('guess',`<div class="msg" id="m">I picked 1-${R}. You have ${maxTries} tries.</div><div class="row"><input id="in" type="number" inputmode="numeric"><button class="btn" id="go">Guess</button></div>`);
  $('#go').onclick=()=>{
    const v=parseInt($('#in').value,10);if(!v)return;tries++;$('#in').value='';
    if(v===n)return end('guess',true,`Got it in ${tries}! 🎉`,Math.max(0,(maxTries+1-tries)*100));
    if(tries>=maxTries)return end('guess',false,`Out of tries. It was ${n}.`);
    $('#m').textContent=`${v} is too ${v<n?'low':'high'}. ${maxTries-tries} left.`;
  };
}
/* Quick math */
function math(){
  let q=0,ok=0,a,b,op,ans;const questions=5+Math.floor((LV-1)/5),needed=Math.ceil(questions*.8);
  frame('math','<div class="msg" id="q"></div><div class="row"><input id="in" type="number" inputmode="numeric"><button class="btn" id="go">Go</button></div><div class="msg" id="m"></div>');
  function next(){
    op=Math.random()<.5?'+':'×';
    a=2+Math.floor(Math.random()*(op==='+'?20+LV*10:8+LV));b=2+Math.floor(Math.random()*(op==='+'?20+LV*10:8+LV));
    ans=op==='+'?a+b:a*b;$('#q').textContent=`${q+1}/${questions}:  ${a} ${op} ${b} = ?`;
  }
  $('#go').onclick=()=>{
    const v=$('#in').value;if(v==='')return;
    if(+v===ans)ok++;q++;$('#in').value='';
    if(q===questions)return end('math',ok>=needed,`${ok}/${questions} correct${ok>=needed?' 🎉':''}`,ok*100);
    $('#m').textContent=`${ok} correct so far`;next();
  };
  next();
}
/* Chess */
const VAL={p:1,n:3,b:3,r:5,q:9,k:0};
const isW=c=>c===c.toUpperCase();
function cgen(b,w){
  const m=[],own=c=>c&&isW(c)===w,foe=c=>c&&isW(c)!==w;
  for(let i=0;i<64;i++){
    const c=b[i];if(!own(c))continue;
    const t=c.toLowerCase(),r=i>>3,f=i&7;
    const add=(r2,f2)=>{if(r2<0||r2>7||f2<0||f2>7)return 0;const j=r2*8+f2;if(own(b[j]))return 0;m.push([i,j]);return b[j]?0:1};
    if(t==='p'){
      const d=w?-1:1,r2=r+d;
      if(r2>=0&&r2<8){
        if(!b[r2*8+f]){m.push([i,r2*8+f]);if(r===(w?6:1)&&!b[(r+2*d)*8+f])m.push([i,(r+2*d)*8+f])}
        [-1,1].forEach(x=>{const f2=f+x;if(f2>=0&&f2<8&&foe(b[r2*8+f2]))m.push([i,r2*8+f2])});
      }
    }else if(t==='n')[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a,e])=>add(r+a,f+e));
    else if(t==='k'){for(let a=-1;a<2;a++)for(let e=-1;e<2;e++)if(a||e)add(r+a,f+e)}
    else{
      const dirs=[];if(t!=='b')dirs.push([1,0],[-1,0],[0,1],[0,-1]);if(t!=='r')dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
      dirs.forEach(([a,e])=>{for(let k=1;k<8;k++)if(!add(r+a*k,f+e*k))break});
    }
  }
  return m;
}
function cmove(b,i,j){const n=b.slice(),c=n[i];n[j]=(c==='P'&&j<8)?'Q':(c==='p'&&j>55)?'q':c;n[i]='';return n}
function inCheck(b,w){return cgen(b,!w).some(([,t])=>b[t]===(w?'K':'k'))}
function legal(b,w){return cgen(b,w).filter(([i,j])=>!inCheck(cmove(b,i,j),w))}
const mat=b=>b.reduce((a,c)=>a+(c?(isW(c)?-1:1)*VAL[c.toLowerCase()]:0),0);
function cpuPick(b){
  const ms=legal(b,false);if(!ms.length)return null;
  if(Math.random()<Math.max(0,.9-LV*.1))return ms[Math.floor(Math.random()*ms.length)];
  let best=-1e9,pick=ms[0];
  ms.forEach(m=>{
    const nb=cmove(b,m[0],m[1]);let v=mat(nb);
    if(LV>=4){legal(nb,true).forEach(r=>{v=Math.min(v,mat(cmove(nb,r[0],r[1])))})}
    v+=Math.random()*.3;if(v>best){best=v;pick=m}
  });
  return pick;
}
function dice(n,z=52){
  const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]};
  return `<svg width="${z}" height="${z}" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="16" fill="#fff" stroke="#5b1a3a" stroke-width="5"/>${P[n].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${n===1?'#e5484d':'#222'}"/>`).join('')}</svg>`;
}
function ask(g,groups,go){
  const sel={};groups.forEach(x=>sel[x.k]=x.o[0][0]);
  const draw=()=>{
    frame(g,groups.map(x=>`<div class="msg" style="font-size:15px">${x.l}</div><div class="chips" style="justify-content:center">${x.o.map(([v,l])=>`<button class="chip ${sel[x.k]===v?'on':''}" data-k="${x.k}" data-v="${v}">${l}</button>`).join('')}</div>`).join('')+'<div class="row" style="margin-top:12px"><button class="btn" id="st">Start</button></div>');
    $('#game').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{sel[b.dataset.k]=b.dataset.v;draw()});
    $('#st').onclick=()=>go(sel);
  };
  draw();
}
const OPP=[{k:'m',l:'Play against',o:[['bot','🤖 Bot(s)'],['pvp','👥 Friends (pass the phone)']]}];
function chess(){ask('chess',OPP,o=>chess2(o.m==='pvp'))}
function chess2(pvp){
  let b='rnbqkbnrpppppppp'.split('').concat(Array(32).fill(''),'PPPPPPPPRNBQKBNR'.split('')),sel=-1,busy=false,n=0,wt=true;
  const G={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  frame('chess','<div class="msg" id="m"></div><div class="tb" id="bd" style="grid-template-columns:repeat(8,1fr);gap:0;max-width:340px"></div>');
  const paint=()=>{
    const lm=sel>=0?legal(b,wt).filter(m=>m[0]===sel).map(m=>m[1]):[];
    $('#m').textContent=(inCheck(b,wt)?'Check! ':'')+(pvp?(wt?'White':'Black')+' to move':'Your move (white)');
    $('#bd').innerHTML=b.map((c,i)=>{const w=c&&isW(c);return`<button data-i="${i}" style="aspect-ratio:1;border:0;padding:0;font-size:26px;line-height:1;background:${i===sel?'#ffd24d':lm.includes(i)?'#7fe3a0':((i>>3)+(i&7))%2?'#c0507f':'#ffd9e8'};color:${w?'#fff':'#2a0b1c'};text-shadow:${w?'0 0 3px #000,0 0 3px #000':'none'}">${c?G[c.toLowerCase()]:''}</button>`}).join('');
    $('#bd').querySelectorAll('button').forEach(x=>x.onclick=()=>tap(+x.dataset.i));
  };
  function chk(w){
    const ms=legal(b,w);
    if(ms.length&&n<160)return false;
    if(ms.length){end('chess',false,'Draw by move limit.',150,pvp);return true}
    if(!inCheck(b,w)){end('chess',false,'Stalemate. Draw.',150,pvp);return true}
    if(pvp)end('chess',true,(w?'Black':'White')+' wins by checkmate! 🎉',0,true);
    else if(w)end('chess',false,'Checkmate. CPU wins.',0);
    else end('chess',true,'Checkmate! You win 🎉',Math.max(100,1000-n*8)+LV*50);
    return true;
  }
  function tap(i){
    if(busy)return;const c=b[i];
    if(c&&isW(c)===wt){sel=i;return paint()}
    if(sel<0||!legal(b,wt).some(x=>x[0]===sel&&x[1]===i))return;
    b=cmove(b,sel,i);sel=-1;n++;wt=!wt;paint();
    if(chk(wt))return;
    if(!pvp){
      busy=true;
      setTimeout(()=>{
        if(!document.body.contains($('#bd')))return;
        const m=cpuPick(b);b=cmove(b,m[0],m[1]);wt=true;busy=false;paint();chk(true);
      },350);
    }
  }
  const bdc=$('#bd');
  bdc.onpointerdown=e=>{const x=e.target.closest('button');if(!x||busy)return;const i=+x.dataset.i,c=b[i];if(c&&isW(c)===wt){sel=i;paint()}};
  bdc.onpointerup=e=>{const t=document.elementFromPoint(e.clientX,e.clientY),x=t&&t.closest('button[data-i]');if(x&&sel>=0&&+x.dataset.i!==sel)tap(+x.dataset.i)};
  paint();
}

function offerRevive(game,score,resume,finish){
 const panel=$('#game'),nodes=[...panel.childNodes];
 panel.replaceChildren();
 panel.innerHTML=`<div class="msg">One more chance, Mochi?</div><p>Score ${score} · Continue this run for 25 coins, or finish and collect your reward.</p><div class="row"><button class="btn" id="revive">Revive · 🪙 25</button><button class="btn ghost" id="finishRun">Finish run</button></div><p id="reviveStatus" role="status"></p>`;
 $('#finishRun').onclick=finish;
 $('#revive').onclick=async()=>{
  const button=$('#revive');button.disabled=true;$('#finishRun').disabled=true;
  try{accountProfile=await apiJson('/api/game/revive',{method:'POST',body:'{}'});if(!document.body.contains(panel))return;panel.replaceChildren(...nodes);resume()}
  catch(e){if($('#reviveStatus')){$('#reviveStatus').textContent=e.message;button.disabled=false;$('#finishRun').disabled=false}}
 };
}
