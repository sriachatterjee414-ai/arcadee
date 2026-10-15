/* Beat Drop */
function beat(){
  const goal=10+LV*3,beatMs=Math.max(430,760-LV*35),windowMs=beatMs*.72,colors=['#ff5fa7','#8d6dff','#49c6ff','#35bd91'];
  let hits=0,misses=0,streak=0,best=0,lane=-1,judged=true,done=false,serial=0,beatTimer=null,missTimer=null;
  frame('beat','<div class="msg" id="beatHud"></div><p class="game-instruction" id="beatHint">Tap the glowing pad on the beat.</p><div class="beat-pads" id="beatPads"></div>');
  const finish=(won,text)=>{if(done)return;done=true;clearInterval(beatTimer);clearTimeout(missTimer);end('beat',won,text,hits*70+best*12+LV*50)};
  const paint=()=>{
    $('#beatHud').textContent=`Beats ${hits}/${goal} · Streak ${streak} · Misses ${misses}/6`;
    $('#beatHint').textContent=lane<0?'Listen for the next beat.':'Tap the glowing pad!';
    $('#beatPads').innerHTML=colors.map((color,i)=>`<button class="beat-pad ${lane===i?'lit':''}" data-lane="${i}" style="--pad-color:${color}" aria-label="Beat pad ${i+1}" type="button">${['✦','●','◆','✚'][i]}</button>`).join('');
    $('#beatPads').querySelectorAll('[data-lane]').forEach(button=>button.onclick=()=>{
      if(done||judged||lane<0)return;
      judged=true;
      if(+button.dataset.lane===lane){hits++;streak++;best=Math.max(best,streak);snd('ding');$('#beatHint').textContent='On beat! Keep your streak.';if(hits>=goal)return finish(true,'Perfect rhythm! 🎶')}
      else{misses++;streak=0;snd('buzz');$('#beatHint').textContent='Wrong pad. Catch the next beat.';if(misses>=6)return finish(false,'The beat slipped away.')}
      lane=-1;paint();
    });
  };
  const cue=()=>{
    if(done)return;
    if(!document.body.contains($('#beatPads'))){done=true;clearInterval(beatTimer);clearTimeout(missTimer);return}
    clearTimeout(missTimer);lane=Math.floor(Math.random()*4);judged=false;const id=++serial;paint();snd(`t${lane}`);
    missTimer=setTimeout(()=>{if(done||id!==serial||judged)return;if(!document.body.contains($('#beatPads'))){done=true;clearInterval(beatTimer);return}judged=true;misses++;streak=0;lane=-1;paint();if(misses>=6)finish(false,'Too many beats missed.')},windowMs);
  };
  paint();cue();beatTimer=setInterval(cue,beatMs);
}
/* Boba Builder */
function boba(){
  const need=3+Math.floor(LV*.5),names=['Maya','Theo','Ari','Nina','Kai','Remy'];
  const menu={tea:['Black tea','Green tea','Taro'],flavour:['Strawberry','Mango','Matcha'],ice:['No ice','Less ice','Regular'],topping:['Boba','Jelly','Pudding']};
  const colors={Strawberry:'#f36d9b',Mango:'#f2a644',Matcha:'#67b985',Taro:'#a47ad0'};
  const pick=items=>items[Math.floor(Math.random()*items.length)],makeOrder=()=>({tea:pick(menu.tea),flavour:pick(menu.flavour),ice:pick(menu.ice),topping:pick(menu.topping),name:pick(names)});
  let current=makeOrder(),chosen={},served=0,lives=3,score=0,deadline=0,done=false,timer=null;
  frame('boba','<div class="msg" id="bobaHud"></div><section class="boba-order" id="bobaOrder"></section><section class="boba-work"><div class="boba-cup-wrap"><div class="boba-cup" id="bobaCup"><span class="boba-straw"></span><span class="boba-topping">● ● ●</span></div><b>Your cup</b><small id="bobaSummary">Choose each part of the drink.</small></div><div class="boba-controls" id="bobaControls"></div></section><div class="row"><button class="btn" id="serveBoba" type="button">Serve drink</button></div><p class="msg" id="bobaMessage" aria-live="polite"></p>');
  const seconds=()=>Math.max(12,23-LV*.8);
  const finish=(won,text)=>{if(done)return;done=true;clearInterval(timer);end('boba',won,text,score+served*35+LV*50)};
  const paint=()=>{
    $('#bobaHud').textContent=`Orders ${served}/${need} · Patience ${lives}♥ · ${Math.max(0,Math.ceil((deadline-Date.now())/1000))}s`;
    $('#bobaOrder').innerHTML=`<div class="boba-customer">${custSVG(0,'#5b3a29','#ff8eb9',false)}<b>${current.name}</b></div><div class="boba-thought"><small>ORDER UP</small><b>${current.tea}</b><span>${current.flavour} · ${current.ice}</span><strong>${current.topping}</strong><div class="boba-target-cup" style="--drink:${colors[current.flavour]}">🧋</div></div>`;
    $('#bobaControls').innerHTML=Object.entries(menu).map(([group,options])=>`<section class="boba-group"><b>${group[0].toUpperCase()+group.slice(1)}</b><div>${options.map(value=>`<button class="boba-choice ${chosen[group]===value?'on':''}" data-group="${group}" data-value="${value}" type="button">${value}</button>`).join('')}</div></section>`).join('');
    $('#bobaControls').querySelectorAll('[data-group]').forEach(button=>button.onclick=()=>{chosen[button.dataset.group]=button.dataset.value;paint()});
    const count=Object.keys(chosen).length;$('#bobaSummary').textContent=count?Object.values(chosen).join(' · '):'Choose each part of the drink.';
    $('#bobaCup').style.setProperty('--drink',colors[chosen.flavour||current.flavour]);
  };
  const next=()=>{served++;if(served>=need)return finish(true,'Every drink made just right! 🧋');current=makeOrder();chosen={};deadline=Date.now()+seconds()*1000;$('#bobaMessage').textContent='Next customer, coming up!';paint()};
  $('#serveBoba').onclick=()=>{
    if(done)return;
    const correct=Object.keys(menu).every(group=>chosen[group]===current[group]);
    if(correct){score+=150+Math.ceil(Math.max(0,deadline-Date.now())/1000)*6;snd('ding');next()}
    else{lives--;snd('buzz');chosen={};deadline=Date.now()+seconds()*1000;$('#bobaMessage').textContent='That recipe missed the order. Check the picture and try again.';if(lives<=0)return finish(false,'The customers ran out of patience.');paint()}
  };
  deadline=Date.now()+seconds()*1000;paint();
  timer=setInterval(()=>{if(!document.body.contains($('#bobaHud'))){clearInterval(timer);return}if(Date.now()>=deadline){lives--;if(lives<=0)return finish(false,'The customers ran out of patience.');current=makeOrder();chosen={};deadline=Date.now()+seconds()*1000;$('#bobaMessage').textContent='A customer left. Here comes the next order.';paint()}else $('#bobaHud').textContent=`Orders ${served}/${need} · Patience ${lives}♥ · ${Math.max(0,Math.ceil((deadline-Date.now())/1000))}s`},200);
}
/* Fruit Slice */
function fruit(){
  const W=360,H=500,goal=10+LV,duration=34+LV*1.2,icons=['🍓','🍊','🍉','🍋','🍇'];
  let objects=[],sliced=0,misses=0,lives=3+Math.floor(LV/12),dragging=false,done=false,raf=0,last=0,start=performance.now(),spawnTimer=null,trail=[];
  frame('fruit','<div class="msg" id="fruitHud"></div><canvas id="fruitCanvas" width="360" height="500" aria-label="Swipe to slice fruit and avoid bombs"></canvas><p class="game-instruction">Swipe through fruit. Keep your fingers off the bombs!</p>');
  const cv=$('#fruitCanvas'),ctx=cv.getContext('2d');
  const stop=()=>{done=true;clearInterval(spawnTimer);cancelAnimationFrame(raf)};
  const finish=(won,text)=>{if(done)return;stop();end('fruit',won,text,sliced*70+lives*100+LV*50)};
  const point=e=>{const rect=cv.getBoundingClientRect();return{x:(e.clientX-rect.left)*W/rect.width,y:(e.clientY-rect.top)*H/rect.height}};
  const sliceAt=p=>{
    for(let i=objects.length-1;i>=0;i--){const item=objects[i];if(item.cut||Math.hypot(item.x-p.x,item.y-p.y)>item.r+12)continue;item.cut=true;
      if(item.bomb){lives--;snd('buzz');if(lives<=0)finish(false,'Too many bombs sliced!')}
      else{sliced++;snd('pop');if(sliced>=goal)finish(true,'Fruit master! 🍉')}
      break;
    }
  };
  cv.onpointerdown=e=>{e.preventDefault();dragging=true;cv.setPointerCapture(e.pointerId);const p=point(e);trail=[p];sliceAt(p)};
  cv.onpointermove=e=>{if(!dragging)return;const p=point(e);trail.push(p);if(trail.length>9)trail.shift();sliceAt(p)};
  cv.onpointerup=()=>{dragging=false;trail=[]};cv.onpointercancel=()=>{dragging=false;trail=[]};
  spawnTimer=setInterval(()=>{if(!cv.isConnected){clearInterval(spawnTimer);return}const count=1+(Math.random()<.45?1:0);for(let i=0;i<count;i++){const bomb=Math.random()<Math.min(.18+LV*.006,.36);objects.push({x:40+Math.random()*(W-80),y:H+20,vx:(Math.random()-.5)*3,vy:-9-Math.random()*4,r:25,bomb,icon:bomb?'💣':icons[Math.floor(Math.random()*icons.length)],cut:false})}},Math.max(430,780-LV*28));
  const draw=now=>{
    if(done)return;if(!cv.isConnected){stop();return}
    const dt=Math.min(2.4,(now-last)/16.67||1);last=now;
    const remain=duration-(now-start)/1000;if(remain<=0)return finish(sliced>=goal,sliced>=goal?'Fruit master!':'Time is up!');
    ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#effcff');sky.addColorStop(.78,'#fff5fb');sky.addColorStop(1,'#c9edb4');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    objects.forEach(item=>{item.vy+=.22*dt;item.x+=item.vx*dt;item.y+=item.vy*dt;if(!item.cut){ctx.font='36px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.icon,item.x,item.y)}});
    objects=objects.filter(item=>{if(item.y>H+65&&!item.bomb&&!item.cut)misses++;return item.y<H+80&&!item.cut});
    if(misses>=7)return finish(false,'Too many fruits missed.');
    if(trail.length>1){ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);trail.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.strokeStyle='#ff5fa7';ctx.lineWidth=6;ctx.lineCap='round';ctx.stroke()}
    $('#fruitHud').textContent=`Sliced ${sliced}/${goal} · Bombs ${lives}♥ · ${Math.ceil(remain)}s`;
    raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);
}
/* Mini Golf */
function golf(){
  const W=360,H=500,R=12,maxStrokes=Math.max(8,14-Math.floor(LV/5)),par=Math.min(6,3+Math.floor((LV-1)/8)),hole={x:LV%2?306:54,y:58};
  const shift=LV%2?0:24,blocks=[{x:98,y:122+shift,w:190,h:17},{x:28,y:246,w:188,h:17},{x:148,y:366-shift,w:178,h:17}];
  if(LV>=5)blocks.push({x:268,y:168,w:16,h:112});if(LV>=12)blocks.push({x:76,y:300,w:16,h:100});if(LV>=20)blocks.push({x:214,y:70,w:16,h:94});
  let ball={x:hole.x>180?54:306,y:448,vx:0,vy:0},strokes=0,drag=null,done=false,raf=0,last=0;
  frame('golf','<div class="msg" id="golfHud"></div><canvas id="golfCanvas" width="360" height="500" aria-label="Mini golf course. Drag back from the ball and release to putt"></canvas><p class="game-instruction">Pull back from the ball, then release to putt.</p>');
  const cv=$('#golfCanvas'),ctx=cv.getContext('2d');
  const stop=()=>{done=true;cancelAnimationFrame(raf)};
  const finish=(won,text)=>{if(done)return;stop();end('golf',won,text,won?Math.max(100,1100-strokes*100)+LV*60:Math.max(0,450-strokes*25))};
  const point=e=>{const rect=cv.getBoundingClientRect();return{x:(e.clientX-rect.left)*W/rect.width,y:(e.clientY-rect.top)*H/rect.height}};
  cv.onpointerdown=e=>{if(done||Math.hypot(ball.vx,ball.vy)>.4)return;const p=point(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<40){drag=p;cv.setPointerCapture(e.pointerId)}};
  cv.onpointermove=e=>{if(drag)drag=point(e)};
  cv.onpointerup=e=>{if(!drag)return;const p=point(e),dx=ball.x-p.x,dy=ball.y-p.y,power=Math.hypot(dx,dy);drag=null;if(power<10)return;const speed=Math.min(15,power*.13);ball.vx=dx/power*speed;ball.vy=dy/power*speed;strokes++;snd('swoosh');if(strokes>=maxStrokes)$('#golfHud').textContent=`Stroke ${strokes}/${maxStrokes} · One last putt!`};
  cv.onpointercancel=()=>{drag=null};
  const draw=now=>{
    if(done)return;if(!cv.isConnected){stop();return}
    const dt=Math.min(2,(now-last)/16.67||1);last=now;
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#bde8a8';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#d8f0c9';ctx.fillRect(12,12,W-24,H-24);
    ctx.fillStyle='#edf4d0';blocks.forEach(block=>{ctx.fillRect(block.x,block.y,block.w,block.h);ctx.fillStyle='#bb956e';ctx.fillRect(block.x,block.y+block.h-4,block.w,4);ctx.fillStyle='#edf4d0'});
    ctx.beginPath();ctx.arc(hole.x,hole.y,18,0,Math.PI*2);ctx.fillStyle='#367447';ctx.fill();ctx.beginPath();ctx.arc(hole.x,hole.y,8,0,Math.PI*2);ctx.fillStyle='#172b29';ctx.fill();ctx.fillRect(hole.x+10,hole.y-46,3,46);ctx.beginPath();ctx.moveTo(hole.x+13,hole.y-46);ctx.lineTo(hole.x+42,hole.y-36);ctx.lineTo(hole.x+13,hole.y-26);ctx.fillStyle='#ff5fa7';ctx.fill();
    const speed=Math.hypot(ball.vx,ball.vy);
    if(speed>.08){const oldX=ball.x,oldY=ball.y;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.985,dt);ball.vy*=Math.pow(.985,dt);
      if(ball.x<R||ball.x>W-R){ball.x=Math.max(R,Math.min(W-R,ball.x));ball.vx*=-.72}
      if(ball.y<R||ball.y>H-R){ball.y=Math.max(R,Math.min(H-R,ball.y));ball.vy*=-.72}
      for(const block of blocks)if(ball.x+R>block.x&&ball.x-R<block.x+block.w&&ball.y+R>block.y&&ball.y-R<block.y+block.h){ball.x=oldX;ball.y=oldY;if(oldX+R<=block.x||oldX-R>=block.x+block.w)ball.vx*=-.72;else ball.vy*=-.72;break}
      if(Math.hypot(ball.x-hole.x,ball.y-hole.y)<15&&Math.hypot(ball.vx,ball.vy)<2.4)return finish(true,strokes<=par?'Hole in! Under par! ⛳':'Hole in! Nice putt! ⛳');
      if(Math.hypot(ball.vx,ball.vy)<.08){ball.vx=0;ball.vy=0}
    }
    if(drag){const dx=ball.x-drag.x,dy=ball.y-drag.y,len=Math.hypot(dx,dy)||1;ctx.beginPath();ctx.moveTo(ball.x,ball.y);ctx.lineTo(ball.x+dx/len*Math.min(100,len),ball.y+dy/len*Math.min(100,len));ctx.strokeStyle='#ff5fa7';ctx.lineWidth=4;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}
    ctx.beginPath();ctx.arc(ball.x,ball.y,R,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#8d6dff';ctx.lineWidth=2;ctx.stroke();
    $('#golfHud').textContent=`Strokes ${strokes}/${maxStrokes} · Par ${par}`;
    if(strokes>=maxStrokes&&speed<.08)return finish(false,'That hole was a tough one.');
    raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);
}
/* Paw Catcher */
function cat(){
  const W=360,H=500,goal=12+Math.ceil(LV*1.1),duration=36+Math.floor(LV*.8),good=['🐟','🧶','🐟','🧸'];
  let kittyX=W/2,items=[],caught=0,lives=3+Math.floor(LV/12),done=false,raf=0,last=0,start=performance.now(),spawnTimer=null;
  frame('cat','<div class="msg" id="catHud"></div><canvas id="catCanvas" width="360" height="500" tabindex="0" style="width:min(100%,360px);display:block;margin:0 auto;touch-action:none" aria-label="Move your kitten to catch fish and yarn, and avoid bath bubbles"></canvas><p class="game-instruction">Move your kitten with touch, mouse, or ← →. Catch fish and yarn!</p>');
  const cv=$('#catCanvas'),ctx=cv.getContext('2d');
  const stop=()=>{done=true;clearInterval(spawnTimer);cancelAnimationFrame(raf)};
  const finish=(won,text)=>{if(done)return;stop();end('cat',won,text,caught*60+lives*100+LV*50)};
  const moveTo=e=>{const rect=cv.getBoundingClientRect();kittyX=Math.max(36,Math.min(W-36,(e.clientX-rect.left)*W/rect.width))};
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);moveTo(e);cv.focus({preventScroll:true})};
  cv.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')moveTo(e)};
  cv.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();kittyX=Math.max(36,Math.min(W-36,kittyX+(e.key==='ArrowLeft'?-38:38)))}};
  spawnTimer=setInterval(()=>{
    if(!cv.isConnected){clearInterval(spawnTimer);return}
    const hazard=Math.random()<Math.min(.12+LV*.006,.3);
    items.push({x:30+Math.random()*(W-60),y:-24,vy:2.1+Math.random()*.9+LV*.12,icon:hazard?'🫧':good[Math.floor(Math.random()*good.length)],hazard});
  },Math.max(460,760-LV*10));
  const draw=now=>{
    if(done)return;if(!cv.isConnected){stop();return}
    const dt=Math.min(2.4,(now-last)/16.67||1);last=now;
    const remain=duration-(now-start)/1000;if(remain<=0)return finish(caught>=goal,caught>=goal?'Best kitty helper! 🐈':'The treat timer ran out.');
    ctx.clearRect(0,0,W,H);const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#ffe9f2');bg.addColorStop(.65,'#fff8ed');bg.addColorStop(1,'#d4efc1');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f6d97c';ctx.beginPath();ctx.arc(302,68,31,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#a8d98e';ctx.beginPath();ctx.moveTo(0,320);ctx.quadraticCurveTo(84,278,170,322);ctx.quadraticCurveTo(267,268,360,315);ctx.lineTo(360,H);ctx.lineTo(0,H);ctx.fill();
    items.forEach(item=>{item.y+=item.vy*dt;ctx.font='34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.icon,item.x,item.y);
      if(!item.caught&&item.y>H-105&&item.y<H-54&&Math.abs(item.x-kittyX)<43){item.caught=true;if(item.hazard){lives--;snd('buzz');if(lives<=0)finish(false,'Time for a bubble bath break!')}else{caught++;snd('pop');if(caught>=goal)finish(true,'Best kitty helper! 🐈')}}
    });
    if(done)return;
    items=items.filter(item=>!item.caught&&item.y<H+35);
    ctx.font='65px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🐈',kittyX,H-60);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(kittyX,H-19,38,13,0,0,Math.PI*2);ctx.fill();
    $('#catHud').textContent=`Caught ${caught}/${goal} · Bath bubbles ${lives}♥ · ${Math.ceil(remain)}s`;
    raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);
}
/* Doodle Studio */
function sketch(){
  frame('sketch','<div class="sketch-tools"><div class="sketch-colors" id="sketchColors" aria-label="Drawing colours"></div><label class="brush-control">Brush <input id="brushSize" type="range" min="2" max="36" value="8"><span id="brushValue">8</span></label><button class="btn ghost" id="undoDraw" type="button" title="Undo last stroke">↶ Undo</button><button class="btn ghost" id="clearDraw" type="button">Clear</button><button class="btn" id="saveDraw" type="button">Save PNG</button></div><canvas id="sketchCanvas" width="960" height="640" aria-label="Blank drawing canvas"></canvas>');
  const canvas=$('#sketchCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),colors=['#251d23','#ff4d94','#8d6dff','#3b82f6','#24a875','#ffb703','#f26f4d','#ffffff'];
  let color=colors[1],size=8,drawing=false,history=[];
  const snapshot=()=>{history.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.length>30)history.shift();$('#undoDraw').disabled=false};
  const point=e=>{const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height}};
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  $('#sketchColors').innerHTML=colors.map((value,i)=>`<button class="sketch-swatch ${i===1?'on':''}" data-color="${value}" aria-label="${value==='#ffffff'?'Eraser':'Colour '+(i+1)}" title="${value==='#ffffff'?'Eraser':'Colour '+(i+1)}" style="--swatch:${value}" type="button"></button>`).join('');
  $('#sketchColors').querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{color=button.dataset.color;$('#sketchColors').querySelectorAll('.sketch-swatch').forEach(swatch=>swatch.classList.toggle('on',swatch===button))});
  $('#brushSize').oninput=e=>{size=+e.target.value;$('#brushValue').textContent=size};
  canvas.onpointerdown=e=>{e.preventDefault();snapshot();drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.1,p.y+.1);ctx.strokeStyle=color;ctx.lineWidth=size*2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()};
  canvas.onpointermove=e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke()};
  canvas.onpointerup=()=>{drawing=false};canvas.onpointercancel=()=>{drawing=false};
  $('#undoDraw').onclick=()=>{const previous=history.pop();if(previous)ctx.putImageData(previous,0,0);$('#undoDraw').disabled=!history.length};
  $('#clearDraw').onclick=()=>{snapshot();ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)};
  $('#saveDraw').onclick=()=>canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='arcade-doodle.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png');
  $('#undoDraw').disabled=true;
}
/* Bubble Pop */
function bubble(){
  const R=16,W=320,ROWS=14,K=Math.min(6,3+Math.floor(LV/2)),COL=['#ff4d6d','#ffb703','#3ddc84','#4cc9f0','#b388ff','#ff8fab'];
  const g=Array.from({length:ROWS},(_,r)=>Array(r%2?9:10).fill(-1));
  for(let r=0;r<Math.min(8,3+Math.ceil(LV/2));r++)for(let k=0;k<g[r].length;k++)g[r][k]=Math.floor(Math.random()*K);
  let shots=Math.max(32,42-LV),cur=Math.floor(Math.random()*K),nxt=Math.floor(Math.random()*K),pr=null,sc=0;
  frame('bubble','<div class="msg" id="m"></div><canvas id="cv" width="320" height="420" style="width:100%;max-width:320px;display:block;margin:0 auto;border-radius:14px;touch-action:none;background:var(--bg)"></canvas>');
  const cv=$('#cv'),c=cv.getContext('2d'),xy=(r,k)=>[k*32+16+(r%2?16:0),r*28+16];
  const nb=(r,k)=>(r%2?[[r,k-1],[r,k+1],[r-1,k],[r-1,k+1],[r+1,k],[r+1,k+1]]:[[r,k-1],[r,k+1],[r-1,k-1],[r-1,k],[r+1,k-1],[r+1,k]]).filter(([a,b])=>a>=0&&a<ROWS&&b>=0&&b<g[a].length);
  const flood=(starts,ok)=>{const seen=new Set(starts.map(([a,b])=>a*20+b)),st=[...starts];while(st.length){const[a,b]=st.pop();nb(a,b).forEach(([p,q])=>{if(ok(p,q)&&!seen.has(p*20+q)){seen.add(p*20+q);st.push([p,q])}})}return seen};
  function settle(x,y){
    let best=1e9,bp=null;
    for(let r=0;r<ROWS;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]<0){const[a,b]=xy(r,k),d=(a-x)**2+(b-y)**2;if(d<best){best=d;bp=[r,k]}}
    g[bp[0]][bp[1]]=cur;
    const grp=flood([bp],(p,q)=>g[p][q]===cur);
    if(grp.size>=3){
      snd('pop');grp.forEach(id=>{g[id/20|0][id%20]=-1});sc+=grp.size*10;
      const top=[];g[0].forEach((v,k)=>{if(v>=0)top.push([0,k])});
      const att=flood(top,(p,q)=>g[p][q]>=0);
      g.forEach((row,r)=>row.forEach((v,k)=>{if(v>=0&&!att.has(r*20+k)&&!(r===0)){row[k]=-1;sc+=20}}));
    }
    pr=null;cur=nxt;nxt=Math.floor(Math.random()*K);shots--;
    if(!g.flat().some(v=>v>=0)){clearInterval(t);end('bubble',true,'Board cleared! 🫧🎉',sc+shots*20+LV*50)}
    else if(g.slice(11).flat().some(v=>v>=0)||shots<=0){clearInterval(t);end('bubble',false,shots<=0?'Out of shots.':'The bubbles reached the bottom.',sc)}
  }
  const orb=(x,y,v,r)=>{c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=COL[v];c.fill();c.beginPath();c.arc(x-r*.3,y-r*.3,r*.3,0,7);c.fillStyle='#fff8';c.fill()};
  let aim=null;
  const aimAt=e=>{const b=cv.getBoundingClientRect();let dx=(e.clientX-b.left)/b.width*W-160,dy=(e.clientY-b.top)/b.width*W-390;if(dy>-30)dy=-30;const l=Math.hypot(dx,dy);aim={vx:dx/l*3,vy:dy/l*3}};
  const hitAt=(x,y)=>{if(y<=R)return true;for(let r=0;r<ROWS;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]>=0){const[a,b]=xy(r,k);if((a-x)**2+(b-y)**2<28*28)return true}return false};
  cv.onpointerdown=e=>{if(!pr)aimAt(e)};cv.onpointermove=e=>{if(aim)aimAt(e)};
  cv.onpointerup=()=>{if(aim&&!pr){pr={x:160,y:390,vx:aim.vx,vy:aim.vy};snd('swoosh')}aim=null};
  cv.onpointercancel=()=>{aim=null};
  const t=setInterval(()=>{
    if(!document.body.contains(cv)){clearInterval(t);return}
    if(pr)for(let i=0;i<3&&pr;i++){
      pr.x+=pr.vx;pr.y+=pr.vy;
      if(pr.x<R||pr.x>W-R)pr.vx*=-1;
      let hit=pr.y<=R;
      for(let r=0;r<ROWS&&!hit;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]>=0){const[a,b]=xy(r,k);if((a-pr.x)**2+(b-pr.y)**2<28*28){hit=true;break}}
      if(hit){settle(pr.x,pr.y);if(!document.body.contains(cv))return}
    }
    c.clearRect(0,0,W,420);
    c.fillStyle='#ff4d6d33';c.fillRect(0,11*28,W,2);
    g.forEach((row,r)=>row.forEach((v,k)=>{if(v>=0){const[a,b]=xy(r,k);orb(a,b,v,R-1)}}));
    if(aim&&!pr){let x=160,y=390,vx=aim.vx,vy=aim.vy;c.fillStyle=COL[cur];for(let i=0;i<420;i++){x+=vx;y+=vy;if(x<R||x>W-R)vx*=-1;if(hitAt(x,y))break;if(i%5===0){c.beginPath();c.arc(x,y,2.6,0,7);c.fill()}}}
    orb(160,390,cur,R);orb(40,395,nxt,10);
    if(pr)orb(pr.x,pr.y,cur,R);
    $('#m').textContent=`Shots ${shots} · Score ${sc}`;
  },16);
}
/* Turbo Racer */
function race(){
  const W=300,H=420,TG=3000+LV*1500;let px=150,tx=150,dist=0,cars=[],coins=0,tick=0;const sp=3+LV*.4;
  frame('race','<div class="msg" id="m"></div><canvas id="cv" width="300" height="420" style="width:100%;max-width:300px;display:block;margin:0 auto;border-radius:14px;touch-action:none"></canvas>');
  const cv=$('#cv'),c=cv.getContext('2d');
  const mvx=e=>{const r=cv.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*W};
  cv.onpointerdown=mvx;cv.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')mvx(e)};
  const car=(x,y,col)=>{c.fillStyle=col;c.fillRect(x-18,y-32,36,64);c.fillStyle='#cfefff';c.fillRect(x-12,y-14,24,16);c.fillStyle='#0004';c.fillRect(x-18,y+22,36,8)};
  const t=setInterval(()=>{
    if(!document.body.contains(cv)){clearInterval(t);return}
    tick++;px+=(tx-px)*.18;px=Math.max(30,Math.min(W-30,px));dist+=sp;
    if(tick%Math.max(16,48-LV*3)===0)cars.push({x:40+Math.random()*(W-80),y:-50,coin:Math.random()<.3});
    cars.forEach(o=>o.y+=sp+1);cars=cars.filter(o=>o.y<H+50);
    let hit=false;
    cars.forEach(o=>{if(Math.abs(o.x-px)<32&&Math.abs(o.y-(H-80))<50){if(o.coin){coins++;o.y=999;snd('coin')}else{hit=true;snd('thud')}}});
    c.fillStyle='#3b3b4f';c.fillRect(0,0,W,H);c.fillStyle='#fff';
    for(let y=-80+(dist%80);y<H;y+=80)c.fillRect(W/2-3,y,6,40);
    c.fillStyle='#ff4d94';c.fillRect(0,0,6,H);c.fillRect(W-6,0,6,H);
    cars.forEach(o=>{if(o.coin){c.beginPath();c.arc(o.x,o.y,11,0,7);c.fillStyle='#ffd400';c.fill()}else car(o.x,o.y,'#4cc9f0')});
    car(px,H-80,'#ff4d94');
    $('#m').textContent=`Progress ${Math.min(100,Math.floor(dist/TG*100))}% · 🪙 ${coins}`;
    const pts=Math.floor(dist/10)+coins*20;
    if(hit){clearInterval(t);end('race',false,'Crash! 💥',pts)}
    else if(dist>=TG){clearInterval(t);end('race',true,'Finish line! 🏁',pts+LV*50)}
  },16);
}
