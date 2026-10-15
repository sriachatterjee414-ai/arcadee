/* Ludo: classic cross board, 2-4 players */
function ludo(){ask('ludo',[...OPP,{k:'n',l:'Players',o:[['2','2'],['3','3'],['4','4']]}],o=>ludo2(o.m==='pvp',+o.n))}
function ludo2(pvp,NP){
  const COL=['#e5484d','#2fbf71','#f2c200','#3b82f6'],LT=['#ffc9c9','#c3f2d2','#fff3a8','#c4dcff'],NM=['Red','Green','Yellow','Blue'];
  const P=NP===2?[0,2]:NP===3?[0,1,2]:[0,1,2,3],S=[0,13,26,39],SAFE=[0,13,26,39,8,21,34,47];
  const TR=[],add=(r,c)=>TR.push([r,c]);
  for(let c=1;c<=5;c++)add(6,c);for(let r=5;r>=0;r--)add(r,6);add(0,7);add(0,8);for(let r=1;r<=5;r++)add(r,8);
  for(let c=9;c<=14;c++)add(6,c);add(7,14);add(8,14);for(let c=13;c>=9;c--)add(8,c);for(let r=9;r<=14;r++)add(r,8);
  add(14,7);add(14,6);for(let r=13;r>=9;r--)add(r,6);for(let c=5;c>=0;c--)add(8,c);add(7,0);add(6,0);
  const HC=(pl,i)=>[[7,1+i],[1+i,7],[7,13-i],[13-i,7]][pl],BO=[[2,2],[2,11],[11,11],[11,2]];
  const bg=Array(225).fill('');
  [[0,0],[0,9],[9,9],[9,0]].forEach(([r0,c0],pl)=>{for(let r=0;r<6;r++)for(let c=0;c<6;c++)bg[(r0+r)*15+c0+c]=LT[pl]});
  TR.forEach(([r,c])=>bg[r*15+c]='#fff');
  for(let pl=0;pl<4;pl++){bg[TR[S[pl]][0]*15+TR[S[pl]][1]]=COL[pl];for(let i=0;i<5;i++){const[r,c]=HC(pl,i);bg[r*15+c]=COL[pl]}}
  bg[7*15+7]='#8e2f5f';
  const T=P.map(()=>[-1,-1,-1,-1]);
  let cur=0,roll=0,pend=null,msg='';
  frame('ludo','<div class="tb" id="bd" style="grid-template-columns:repeat(15,1fr);gap:1px;max-width:360px;touch-action:auto"></div><div id="ct" class="row" style="margin-top:10px;align-items:center"></div>');
  const alive=()=>document.body.contains($('#bd')),human=i=>pvp||i===0;
  const where=(i,k)=>{const pl=P[i],p=T[i][k];return p<0?[BO[pl][0]+(k>>1),BO[pl][1]+(k&1)]:p<=50?TR[(S[pl]+p)%52]:p<56?HC(pl,p-51):[7,7]};
  const opts=(i,r)=>[0,1,2,3].filter(k=>{const p=T[i][k];return p<0?r===6:p<56&&p+r<=56});
  function paint(){
    const tk=Array.from({length:225},()=>[]);
    T.forEach((a,i)=>a.forEach((p,k)=>{if(p<56){const[r,c]=where(i,k);tk[r*15+c].push([P[i],pend&&i===cur&&pend.includes(k)])}}));
    const stars=SAFE.map(a=>TR[a][0]*15+TR[a][1]);
    $('#bd').innerHTML=bg.map((c,i)=>c?`<button data-i="${i}" style="aspect-ratio:1;padding:0;border:0;border-radius:3px;background:${c};display:flex;flex-wrap:wrap;align-items:center;justify-content:center;font-size:9px;color:#8e2f5f">${tk[i].map(([pl,h])=>`<span style="width:70%;height:70%;max-width:17px;max-height:17px;border-radius:50%;background:${COL[pl]};border:2px solid ${h?'#000':'#fff'};box-shadow:${h?'0 0 7px #000':'0 1px 2px #0005'}"></span>`).join('')||(stars.includes(i)?'★':'')}</button>`:'<div></div>').join('');
    $('#ct').innerHTML=`<b style="color:${COL[P[cur]]}">${NM[P[cur]]}</b>${dice(roll||1)}<button class="btn" id="rl" ${human(cur)&&!roll&&!pend?'':'disabled'}>Roll</button><span style="font-size:13px;flex-basis:100%;text-align:center">${msg}</span>`;
    $('#rl').onclick=doRoll;
    $('#bd').querySelectorAll('button').forEach(x=>x.onclick=()=>{if(!pend)return;const i=+x.dataset.i,k=pend.find(k=>{const[r,c]=where(cur,k);return r*15+c===i});if(k!==undefined)play(k)});
  }
  function score(k){const p=T[cur][k],np=p<0?0:p+roll,a=(S[P[cur]]+np)%52;let v=np;
    if(np<=50&&!SAFE.includes(a)&&T.some((arr,j)=>j!==cur&&arr.some(q=>q>=0&&q<=50&&(S[P[j]]+q)%52===a)))v+=100;
    if(np===56)v+=80;if(p<0)v+=50;if(np<=50&&SAFE.includes(a))v+=20;return v}
  function doRoll(){
    roll=1+Math.floor(Math.random()*6);const o=opts(cur,roll);
    if(!o.length){msg=`${NM[P[cur]]} rolled ${roll}: no move.`;paint();return void gameTimeout(()=>nextTurn(false),900)}
    if(human(cur)&&o.length>1){pend=o;msg='Tap a glowing token.';return paint()}
    let k=o[0];
    if(!human(cur)){k=Math.random()<Math.max(0,.7-LV*.07)?o[Math.floor(Math.random()*o.length)]:o.sort((x,y)=>score(y)-score(x))[0]}
    play(k);
  }
  function play(k){
    const pl=P[cur],p=T[cur][k],np=p<0?0:p+roll;T[cur][k]=np;
    if(np<=50){const a=(S[pl]+np)%52;if(!SAFE.includes(a))T.forEach((arr,j)=>{if(j!==cur)arr.forEach((q,m)=>{if(q>=0&&q<=50&&(S[P[j]]+q)%52===a)arr[m]=-1})})}
    pend=null;msg=`${NM[pl]} moved.`;paint();
    if(T[cur].every(q=>q===56)){
      const w=cur;
      if(pvp)return end('ludo',true,NM[pl]+' wins! 🎉',0,true);
      return end('ludo',w===0,w===0?'You win! 🎉':NM[pl]+' bot wins.',w===0?500+LV*50+(NP-2)*50:T[0].filter(q=>q===56).length*40);
    }
    const six=roll===6;gameTimeout(()=>nextTurn(six),600);
  }
  function nextTurn(extra){
    if(!alive())return;
    if(!extra)cur=(cur+1)%NP;
    roll=0;pend=null;msg='';paint();
    if(!human(cur))gameTimeout(()=>{if(alive())doRoll()},700);
  }
  paint();
}
/* Snakes & Ladders */
function snl(){ask('snl',[...OPP,{k:'n',l:'Players',o:[['2','2'],['3','3'],['4','4']]}],o=>snl2(o.m==='pvp',+o.n))}
function snl2(pvp,NP){
  const L0=[[1,38],[4,14],[9,31],[21,42],[28,84],[36,44],[51,67],[71,91],[80,100]],S0=[[16,6],[47,26],[49,11],[56,53],[62,19],[64,60],[87,24],[93,73],[95,75],[98,78]];
  const lad=Object.fromEntries(L0.slice(0,Math.max(4,9-Math.floor(LV/2)))),snk=Object.fromEntries(S0.slice(0,Math.min(10,3+LV)));
  const C=n=>{const r=(n-1)/10|0;let c=(n-1)%10;if(r%2)c=9-c;return[c*10+5,(9-r)*10+5]};
  const COL=['#e5484d','#2fbf71','#f2c200','#3b82f6'],pos=Array(NP).fill(0);
  let cur=0,roll=0,msg='',turns=0,busy=false;
  frame('snl','<div id="bd"></div><div class="row" id="ct" style="margin-top:8px;align-items:center"></div>');
  const human=i=>pvp||i===0,alive=()=>document.body.contains($('#bd'));
  function paint(){
    let v='<svg viewBox="0 0 100 108" style="width:100%;max-width:360px;display:block;margin:0 auto;border-radius:10px">';
    for(let n=1;n<=100;n++){const[x,y]=C(n);v+=`<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="${(n+((n-1)/10|0))%2?'#ffe3ef':'#ffc2da'}"/><text x="${x-4.5}" y="${y-2.5}" font-size="2.8" fill="#8e2f5f">${n}</text>`}
    Object.entries(lad).forEach(([a,b])=>{const[x1,y1]=C(+a),[x2,y2]=C(+b);
      v+=`<g stroke="#a1662f" stroke-width=".9"><line x1="${x1-1.3}" y1="${y1}" x2="${x2-1.3}" y2="${y2}"/><line x1="${x1+1.3}" y1="${y1}" x2="${x2+1.3}" y2="${y2}"/></g>`;
      for(let t=.08;t<1;t+=.1){const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;v+=`<line x1="${x-1.3}" y1="${y}" x2="${x+1.3}" y2="${y}" stroke="#a1662f" stroke-width=".7"/>`}});
    Object.entries(snk).forEach(([a,b])=>{const[x1,y1]=C(+a),[x2,y2]=C(+b);
      v+=`<path d="M${x1} ${y1}Q${(x1+x2)/2+(a%2?9:-9)} ${(y1+y2)/2} ${x2} ${y2}" stroke="#2fbf71" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="${x1}" cy="${y1}" r="2.2" fill="#1d7a46"/>`});
    pos.forEach((p,i)=>{const[x,y]=p?C(p):[8+i*7,104];v+=`<circle cx="${x+(p?i*1.8-2.5:0)}" cy="${y+(p?3:0)}" r="2.6" fill="${COL[i]}" stroke="#fff" stroke-width=".8"/>`});
    $('#bd').innerHTML=v+'</svg>';
    $('#ct').innerHTML=`<b style="color:${COL[cur]}">Player ${cur+1}${!human(cur)?' 🤖':''}</b>${dice(roll||1)}<button class="btn" id="rl" ${human(cur)&&!busy?'':'disabled'}>Roll</button><span style="font-size:13px;flex-basis:100%;text-align:center">${msg}</span>`;
    $('#rl').onclick=go;
  }
  function go(){
    if(busy)return;busy=true;roll=1+Math.floor(Math.random()*6);turns++;
    const np=pos[cur]+roll;if(np<=100)pos[cur]=np;msg=`Player ${cur+1} rolled ${roll}.`;paint();
    gameTimeout(()=>{
      if(!alive())return;
      const q=pos[cur];
      if(lad[q]){pos[cur]=lad[q];msg='🪜 Ladder! Up to '+lad[q]}
      else if(snk[q]){pos[cur]=snk[q];msg='🐍 Snake! Down to '+snk[q]}
      paint();
      if(pos[cur]===100){
        if(pvp)return end('snl',true,`Player ${cur+1} wins! 🎉`,0,true);
        return end('snl',cur===0,cur===0?'You reached 100! 🎉':`Bot ${cur+1} won.`,cur===0?Math.max(100,600-turns*8)+LV*50:0);
      }
      gameTimeout(()=>{if(!alive())return;if(roll!==6)cur=(cur+1)%NP;busy=false;roll=0;paint();if(!human(cur)){busy=true;gameTimeout(()=>{if(alive()){busy=false;go()}},600)}},700);
    },500);
  }
  paint();
}
/* Sudoku */
function sudoku(){
  const sh=a=>a.sort(()=>Math.random()-.5),rs=[],cs=[];
  sh([0,1,2]).forEach(b=>sh([0,1,2]).forEach(x=>rs.push(b*3+x)));sh([0,1,2]).forEach(b=>sh([0,1,2]).forEach(x=>cs.push(b*3+x)));
  const dg=sh([1,2,3,4,5,6,7,8,9]),sol=rs.map(r=>cs.map(c=>dg[(3*(r%3)+((r/3)|0)+c)%9])).flat();
  const g=sol.slice(),fixed=Array(81).fill(true);
  sh([...Array(81).keys()]).slice(0,Math.min(54,34+Math.floor(LV*.8))).forEach(i=>{g[i]=0;fixed[i]=false});
  let sel=-1,bad=0,hints=3;
  frame('sudoku','<div class="msg" id="m" style="font-size:15px"></div><div class="tb" id="bd" style="grid-template-columns:repeat(9,1fr);gap:0;max-width:340px;border:3px solid var(--acc)"></div><div class="row" id="pd" data-fz="330" style="margin-top:10px"></div>');
  const paint=()=>{
    $('#m').textContent=`Mistakes ${bad}/3 · Hints ${hints}`;
    $('#bd').innerHTML=g.map((v,i)=>{const r=i/9|0,c=i%9;return`<button data-i="${i}" style="aspect-ratio:1;padding:0;font-size:17px;font-weight:${fixed[i]?800:500};color:${fixed[i]?'var(--ink)':'var(--acc2)'};background:${i===sel?'#ffd24d55':sel>=0&&g[sel]&&g[sel]===v?'#ff4d9433':'var(--card)'};border:1px solid var(--line);border-right:${c%3===2&&c<8?'3px solid var(--acc)':'1px solid var(--line)'};border-bottom:${r%3===2&&r<8?'3px solid var(--acc)':'1px solid var(--line)'}">${v||''}</button>`}).join('');
    $('#bd').querySelectorAll('button').forEach(b=>b.onclick=()=>{sel=+b.dataset.i;paint()});
  };
  const fill=(i,v)=>{snd('ding');g[i]=v;fixed[i]=false;if(g.every((x,k)=>x===sol[k]))return end('sudoku',true,'Solved! 🧩',Math.max(100,1000-bad*100-(3-hints)*80)+LV*50);paint()};
  $('#pd').innerHTML=[1,2,3,4,5,6,7,8,9].map(n=>`<button class="big" style="font-size:20px;padding:6px 11px" data-n="${n}">${n}</button>`).join('')+'<button class="big" style="font-size:16px;padding:8px" id="hn">💡</button><button class="big" style="font-size:16px;padding:8px" id="er">⌫</button>';
  $('#pd').querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{
    if(sel<0||fixed[sel]||g[sel]===sol[sel])return;const n=+b.dataset.n;
    if(n===sol[sel])fill(sel,n);else{bad++;snd('buzz');if(bad>=3)return end('sudoku',false,'Three mistakes. Game over.',0);paint()}
  });
  $('#hn').onclick=()=>{if(sel<0||hints<=0||g[sel]===sol[sel])return;hints--;fill(sel,sol[sel])};
  $('#er').onclick=()=>{if(sel>=0&&!fixed[sel]){g[sel]=0;paint()}};
  paint();
}
/* Whodunit */
function mystery(){
  const R=a=>a[Math.floor(Math.random()*a.length)],NS=Math.min(8,4+Math.ceil(LV/2));
  const RM=['Library','Kitchen','Garden','Attic','Cellar'],IT=['hat','scarf','glasses','gloves','watch'],CL=['red','blue','green','black','white'];
  const sus=['Ava','Ben','Cleo','Dan','Eve','Finn','Gus','Hana'].sort(()=>Math.random()-.5).slice(0,NS).map(n=>({n,room:R(RM),item:R(IT),col:R(CL)}));
  const kil=R(sus),T={room:v=>`The killer was in the ${v}.`,item:v=>`The killer had a ${v}.`,col:v=>`The killer wore ${v}.`};
  let cand=sus.slice();const clues=[];
  for(let i=0;i<40&&cand.length>1;i++){const k=R(['room','item','col']),nc=cand.filter(x=>x[k]===kil[k]);if(nc.length<cand.length){cand=nc;clues.push(T[k](kil[k]))}}
  cand.filter(x=>x!==kil).forEach(x=>clues.push(`${x.n} was at the police station all night.`));
  let shown=1,wrong=0;
  frame('mystery','<div class="msg" id="m" style="font-size:15px"></div><table class="lb" id="tb"></table><div id="cl" style="margin:10px 0;font-size:14px"></div><div class="row"><button class="btn ghost sm" id="nx">🔎 Next clue</button></div><div class="msg" style="font-size:14px;margin-top:8px">Who did it?</div><div class="row" id="ac"></div>');
  $('#tb').innerHTML='<tr><td><b>Suspect</b></td><td class="r">Room</td><td class="r">Item</td><td class="r">Colour</td></tr>'+sus.map(x=>`<tr><td>${x.n}</td><td class="r">${x.room}</td><td class="r">${x.item}</td><td class="r">${x.col}</td></tr>`).join('');
  $('#ac').innerHTML=sus.map(x=>`<button class="chip" data-n="${x.n}">${x.n}</button>`).join('');
  const paint=()=>{$('#m').textContent=`Clues ${shown}/${clues.length} · Wrong accusations ${wrong}/2`;$('#cl').innerHTML=clues.slice(0,shown).map((c,i)=>`<div>🕵️ ${i+1}. ${c}</div>`).join('');$('#nx').disabled=shown>=clues.length};
  $('#nx').onclick=()=>{if(shown<clues.length){shown++;paint()}};
  $('#ac').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
    if(b.dataset.n===kil.n)return end('mystery',true,`It was ${kil.n}! Case closed 🕵️`,Math.max(100,800-(shown-1)*80-wrong*150)+LV*50);
    wrong++;snd('buzz');b.disabled=true;if(wrong>=2)return end('mystery',false,`Wrong again. It was ${kil.n}.`,0);paint();
  });
  paint();
}
/* Block Drop */
function tetris(){
  const W=10,H=16,SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]],CL=['#4cc9f0','#ffd400','#b388ff','#3b82f6','#ff9f1c','#3ddc84','#ff4d6d'];
  const TG=Math.round(4+LV*1.45),fallMs=Math.max(230,650-LV*14);let bd=Array.from({length:H},()=>Array(W).fill(0)),pc,lines=0,sc=0,done=false;
  frame('tetris','<div class="msg" id="m" style="font-size:15px"></div><div id="tbd" class="tb" style="grid-template-columns:repeat(10,1fr);gap:1px;max-width:300px;background:#0002;padding:2px;border-radius:10px"></div><div class="row" style="margin-top:8px"><button class="btn sm" id="l">◀</button><button class="btn sm" id="ro">⟳</button><button class="btn sm" id="r">▶</button><button class="btn sm" id="d">⬇</button></div>');
  const hit=(s,x,y)=>s.some((row,r)=>row.some((v,c)=>v&&(x+c<0||x+c>=W||y+r>=H||bd[y+r]&&bd[y+r][x+c])));
  const spawn=()=>{const k=Math.floor(Math.random()*7);pc={s:SH[k].map(r=>r.slice()),k:k+1,x:3,y:0};if(hit(pc.s,pc.x,pc.y)){done=true;clearInterval(tm);end('tetris',false,'Stack overflow!',sc)}};
  const paint=()=>{
    const v=bd.map(r=>r.slice());
    if(pc&&!done)pc.s.forEach((row,r)=>row.forEach((x,c)=>{if(x&&v[pc.y+r])v[pc.y+r][pc.x+c]=pc.k}));
    $('#m').textContent=`Lines ${lines}/${TG} · Score ${sc}`;
    $('#tbd').innerHTML=v.flat().map(x=>`<div style="aspect-ratio:1;border-radius:3px;background:${x?CL[x-1]:'var(--card)'}"></div>`).join('');
  };
  function lock(){
    pc.s.forEach((row,r)=>row.forEach((x,c)=>{if(x)bd[pc.y+r][pc.x+c]=pc.k}));
    let n=0;bd=bd.filter(r=>{if(r.every(x=>x)){n++;return false}return true});
    while(bd.length<H)bd.unshift(Array(W).fill(0));
    if(n){lines+=n;sc+=[0,100,300,500,800][n];snd('pop')}
    if(lines>=TG){done=true;clearInterval(tm);paint();return end('tetris',true,'Lines cleared! 🧱🎉',sc+LV*50)}
    spawn();
  }
  const move=d=>{if(!done&&!hit(pc.s,pc.x+d,pc.y)){pc.x+=d;paint()}};
  const rot=()=>{if(done)return;const s=pc.s[0].map((_,i)=>pc.s.map(r=>r[i]).reverse());if(!hit(s,pc.x,pc.y)){pc.s=s;paint()}};
  const down=()=>{if(done)return;if(!hit(pc.s,pc.x,pc.y+1))pc.y++;else lock();paint()};
  const drop=()=>{if(done)return;while(!hit(pc.s,pc.x,pc.y+1))pc.y++;lock();if(!done)paint()};
  $('#l').onclick=()=>move(-1);$('#r').onclick=()=>move(1);$('#ro').onclick=rot;$('#d').onclick=drop;
  const e0=$('#tbd');let sx=0,sy=0,mx=0,moved=0;e0.style.touchAction='none';
  e0.onpointerdown=e=>{sx=mx=e.clientX;sy=e.clientY;moved=0};
  e0.onpointermove=e=>{if(e.pointerType==='mouse'&&!e.buttons)return;const cw=e0.getBoundingClientRect().width/W;while(e.clientX-mx>=cw){move(1);mx+=cw;moved=1}while(mx-e.clientX>=cw){move(-1);mx-=cw;moved=1}};
  e0.onpointerup=e=>{const dy=e.clientY-sy;if(!moved&&Math.abs(dy)<8)rot();else if(!moved&&dy>60)drop()};
  const tm=gameInterval(()=>{if(!document.body.contains(e0)){clearInterval(tm);return}down()},fallMs);
  spawn();paint();
}
/* Colour Pour */
function water(){
  const NC=Math.min(8,3+Math.ceil(LV/2)),COL=['#ff4d6d','#ffb703','#3ddc84','#4cc9f0','#b388ff','#ff8fab','#8d6e63','#f4f4f4'];
  const pool=[];for(let c=0;c<NC;c++)for(let i=0;i<4;i++)pool.push(c);pool.sort(()=>Math.random()-.5);
  const tubes=[];for(let t=0;t<NC;t++)tubes.push(pool.slice(t*4,t*4+4));tubes.push([],[]);
  let sel=-1,moves=0,from=-1;
  frame('water','<div class="msg" id="m" style="font-size:15px"></div><div class="row" id="tu" style="gap:10px"></div>');
  const paint=()=>{
    $('#m').textContent=`Moves ${moves}. Drag a tube onto another, or tap both.`;
    $('#tu').innerHTML=tubes.map((t,i)=>`<div data-t="${i}" style="width:46px;height:154px;border:3px solid var(--acc);border-radius:0 0 23px 23px;display:flex;flex-direction:column-reverse;padding:2px;gap:2px;background:#fff6;touch-action:none;${i===sel?'transform:translateY(-10px);box-shadow:0 0 10px var(--acc2)':''}">${t.map(c=>`<div style="height:34px;border-radius:6px;background:${COL[c]}"></div>`).join('')}</div>`).join('');
  };
  function pour(a,b){
    const A=tubes[a],B=tubes[b];if(a===b||!A.length||B.length>=4)return;
    const c=A[A.length-1];if(B.length&&B[B.length-1]!==c)return;
    while(A.length&&A[A.length-1]===c&&B.length<4)B.push(A.pop());
    moves++;snd('pour');paint();
    if(tubes.every(t=>!t.length||(t.length===4&&t.every(x=>x===t[0]))))end('water',true,`Sorted in ${moves} moves! 🧪`,Math.max(100,900-moves*10)+LV*50);
  }
  const tu=$('#tu');
  tu.onpointerdown=e=>{
    const t=e.target.closest('[data-t]');if(!t)return;const i=+t.dataset.t;
    if(sel>=0&&sel!==i){pour(sel,i);sel=-1;from=-1;paint();return}
    sel=i;from=i;paint();
  };
  tu.onpointerup=e=>{
    const t=document.elementFromPoint(e.clientX,e.clientY),to=t&&t.closest('[data-t]');
    if(from>=0&&to&&+to.dataset.t!==from){pour(from,+to.dataset.t);sel=-1;paint()}
    from=-1;
  };
  paint();
}
/* Word Finder */
function wordsearch(){
  const N=8+Math.min(3,Math.floor(LV/3)),nw=Math.min(8,3+Math.ceil(LV/2));
  const words='CAT DOG FISH BIRD LION BEAR WOLF DUCK FROG HORSE TIGER ZEBRA SNAKE MOUSE SHEEP'.split(' ').sort(()=>Math.random()-.5).slice(0,nw);
  const g=Array(N*N).fill(''),D=LV<4?[[0,1],[1,0]]:LV<7?[[0,1],[1,0],[1,1]]:[[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1]];
  words.forEach(w=>{for(let t=0;t<200;t++){
    const[dr,dc]=D[Math.floor(Math.random()*D.length)],r=Math.floor(Math.random()*N),c=Math.floor(Math.random()*N),er=r+dr*(w.length-1),ec=c+dc*(w.length-1);
    if(er<0||er>=N||ec<0||ec>=N)continue;
    let ok=true;for(let i=0;i<w.length;i++){const v=g[(r+dr*i)*N+c+dc*i];if(v&&v!==w[i])ok=false}
    if(ok){for(let i=0;i<w.length;i++)g[(r+dr*i)*N+c+dc*i]=w[i];break}}});
  for(let i=0;i<g.length;i++)if(!g[i])g[i]=String.fromCharCode(65+Math.floor(Math.random()*26));
  const found=new Set(),got=new Set();let a=-1,cells=[];
  frame('wordsearch','<div class="msg" id="m" style="font-size:15px"></div><div class="tb" id="bd2" style="grid-template-columns:repeat('+N+',1fr);gap:2px;max-width:340px"></div><div class="row" id="wl" style="margin-top:10px;gap:6px"></div>');
  const paint=()=>{
    $('#m').textContent=`Found ${got.size}/${words.length}`;
    $('#bd2').innerHTML=g.map((l,i)=>`<div data-i="${i}" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;border-radius:8px;background:${found.has(i)?'#8fe3a0':cells.includes(i)?'#ffd24d':'var(--card)'};color:var(--ink)">${l}</div>`).join('');
    $('#wl').innerHTML=words.map(w=>`<span class="chip ${got.has(w)?'on':''}" style="${got.has(w)?'text-decoration:line-through':''}">${w}</span>`).join('');
  };
  const line=(s,e)=>{const dr=(e/N|0)-(s/N|0),dc=e%N-s%N;if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return[s];const n=Math.max(Math.abs(dr),Math.abs(dc)),o=[];for(let i=0;i<=n;i++)o.push(s+(n?Math.sign(dr)*i*N+Math.sign(dc)*i:0));return o};
  const b2=$('#bd2');b2.style.touchAction='none';
  b2.onpointerdown=e=>{const t=e.target.closest('[data-i]');if(t){a=+t.dataset.i;cells=[a];paint()}};
  b2.onpointermove=e=>{if(a<0)return;const t=document.elementFromPoint(e.clientX,e.clientY),c=t&&t.closest('[data-i]');if(c){cells=line(a,+c.dataset.i);paint()}};
  b2.onpointerup=()=>{
    if(a<0)return;const w=cells.map(i=>g[i]).join(''),r=[...w].reverse().join(''),hitw=words.find(x=>!got.has(x)&&(x===w||x===r));
    if(hitw){got.add(hitw);cells.forEach(i=>found.add(i));snd('ding')}
    a=-1;cells=[];paint();
    if(got.size===words.length)end('wordsearch',true,'All words found! 🔎🎉',got.size*100+LV*50);
  };
  paint();
}
