/* Four pocket worlds. Endless runs use scores; puzzle gardens unlock levels. */
GAMES.push(
 {id:'cloudhop',n:'Cloud Hop',e:'☁️',t:'Skill',d:'Hop over sleepy clouds on a pastel sky trail',h:'Tap Jump or press Space to hop. Avoid the clouds. Your distance earns points; finish whenever you like.'},
 {id:'jellystack',n:'Jelly Stack',e:'🍮',t:'Skill',d:'Build a wobbly tower of smiling jelly',h:'Tap Drop when the moving jelly lines up with the stack. Only the overlapping part stays. Keep going for a higher score.'},
 {id:'startrail',n:'Star Trail',e:'🌟',t:'Puzzle',d:'Join twinkling stars to draw a constellation',h:'Tap the numbered stars in order before the moon sets. Wrong stars cost 3 seconds. Later levels have more stars.'},
 {id:'garden',n:'Mochi’s Garden',e:'🌷',t:'Fun',d:'Water tiny sprouts and collect happy blooms',h:'Tap an empty pot to plant, a sprout to water, and a flower to harvest. Water before the pot dries out. Harvest the target before time runs out.'}
);
SCORE_GAMES.add('cloudhop');SCORE_GAMES.add('jellystack');
function pocketHud(score,extra){return `<span>Score <b>${score}</b></span><span>${extra}</span>`}
function cloudhop(){
 frame('cloudhop','<div class="scene-title"><small>THE DAYDREAM EXPRESS</small><h2>A hop above the clouds</h2></div><div class="scene-hud" id="hopHud"></div><div class="hop-world"><svg viewBox="0 0 360 330" id="hopScene" aria-label="Cloud running track"><rect width="360" height="330" fill="#daf0f4"/><circle cx="296" cy="53" r="25" fill="#ffdf93"/><path d="M0 231Q100 172 195 228T380 212V330H0" fill="#c1d4ed"/><path d="M0 272Q110 220 230 273T400 256V330H0" fill="#ddcee9"/><path d="M0 282h360" stroke="#fff" stroke-width="5"/><g id="hopObstacles"></g><g id="hopBunny"><path d="M61 240q-14-49-5-49 11-1 14 36 4-45 15-39 8 4-4 50" fill="#fff" stroke="#69496d" stroke-width="2.5"/><ellipse cx="73" cy="255" rx="22" ry="24" fill="#fff" stroke="#69496d" stroke-width="2.5"/><circle cx="80" cy="249" r="3" fill="#69496d"/><ellipse cx="84" cy="259" rx="4" ry="2.5" fill="#f7a5bd"/><circle cx="50" cy="261" r="7" fill="#fff"/></g></svg><div class="hop-idle" id="hopIdle">Your sky adventure is ready</div></div><div class="row"><button class="btn" id="jumpHop">Start & jump</button><button class="btn ghost" id="finishHop">Finish run</button></div><p class="scene-tip">Tap to hop · Space also works · distance = points</p>');
 let distance=0,y=0,vy=0,elapsed=0,until=1.8,last=0,started=false,done=false,obstacles=[];
 const finish=()=>{if(done)return;done=true;end('cloudhop',distance>=150,'A lovely little sky trip!',Math.floor(distance))};
 const jump=()=>{if(done)return;started=true;$('#hopIdle').hidden=true;$('#jumpHop').textContent='Jump!';if(y===0){vy=390;snd('pop')}};
 $('#jumpHop').onclick=jump;$('#hopScene').onpointerdown=e=>{e.preventDefault();jump()};$('#finishHop').onclick=finish;
 gameListen(window,'keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();jump()}});
 function tick(now){
  const dt=document.hidden?0:Math.min(.035,(now-(last||now))/1000);last=now;
  if(started){elapsed+=dt;distance+=dt*12;y=Math.max(0,y+vy*dt);vy-=920*dt;if(y===0)vy=0;
   until-=dt;if(until<=0){obstacles.push({x:390,w:30+Math.random()*14,h:25+Math.random()*15});until=1.3+Math.random()*.8}
   const speed=120+Math.min(95,elapsed*1.2);obstacles.forEach(o=>o.x-=speed*dt);obstacles=obstacles.filter(o=>o.x>-55);
   if(obstacles.some(o=>o.x<90&&o.x+o.w>55&&y<o.h-5))return finish();
  }
  $('#hopHud').innerHTML=pocketHud(Math.floor(distance),`Distance <b>${Math.floor(distance/2)} m</b>`);
  $('#hopBunny').setAttribute('transform',`translate(0 ${-y})`);
  $('#hopObstacles').innerHTML=obstacles.map(o=>`<g transform="translate(${o.x} ${282-o.h})"><path d="M0 ${o.h}v-${o.h/2}q0-${o.h/2} ${o.w/2}-${o.h/2}t${o.w/2} ${o.h/2}V${o.h}z" fill="#a5b8da" stroke="#69496d" stroke-width="2"/><path d="M7 16l5 2 5-2" fill="none" stroke="#69496d" stroke-width="2"/></g>`).join('');
  gameAnimation(tick);
 }
 gameAnimation(tick);
}
function jellystack(){
 frame('jellystack','<div class="scene-title"><small>THE WOBBLY PUDDING CLUB</small><h2>One jelly at a time</h2></div><div class="scene-hud" id="jellyHud"></div><svg class="jelly-world" viewBox="0 0 360 370" aria-label="Jelly stacking stage"><rect width="360" height="370" fill="#f8e7ef"/><circle cx="47" cy="58" r="30" fill="#fff3d4"/><path d="M0 337h360v33H0" fill="#d2b9df"/><ellipse cx="180" cy="337" rx="115" ry="12" fill="#fff"/><g id="jellyBlocks"></g></svg><div class="row"><button class="btn" id="dropJelly">Drop jelly</button><button class="btn ghost" id="finishJelly">Finish run</button></div><p class="scene-tip">Line up the edges. A perfect drop earns extra points.</p>');
 let blocks=[{x:110,w:140,color:'#b1d8c6'}],x=0,direction=1,width=140,score=0,last=0,done=false;
 const colors=['#edb3c6','#bdb1e4','#f4d48d','#a9cfe3'];
 function block(b,y){return `<g><rect x="${b.x}" y="${y}" width="${b.w}" height="26" rx="9" fill="${b.color}" stroke="#69496d" stroke-width="2.5"/><path d="M${b.x+8} ${y+6}h${Math.max(0,b.w-16)}" stroke="#fff" opacity=".6" stroke-width="3" stroke-linecap="round"/>${b.w>30?`<circle cx="${b.x+b.w/2-6}" cy="${y+14}" r="2" fill="#69496d"/><circle cx="${b.x+b.w/2+6}" cy="${y+14}" r="2" fill="#69496d"/><path d="M${b.x+b.w/2-3} ${y+20}q3 3 6 0" stroke="#69496d" fill="none"/>`:''}</g>`}
 const paint=()=>{const visible=blocks.slice(-10);$('#jellyBlocks').innerHTML=visible.map((b,i)=>block(b,308-i*27)).join('')+block({x,w:width,color:colors[blocks.length%4]},308-visible.length*27);$('#jellyHud').innerHTML=pocketHud(score,`Height <b>${blocks.length-1}</b>`)};
 const finish=()=>{if(done)return;done=true;end('jellystack',blocks.length>=6,'What a sweet little skyline!',score)};
 const drop=()=>{if(done)return;const top=blocks.at(-1),left=Math.max(x,top.x),right=Math.min(x+width,top.x+top.w),overlap=right-left;
  if(overlap<6)return finish();const perfect=Math.abs(x-top.x)<7;score+=perfect?50:25;width=perfect?top.w:overlap;
  blocks.push({x:perfect?top.x:left,w:width,color:colors[blocks.length%4]});x=0;snd(perfect?'ding':'pop');paint();
 };
 $('#dropJelly').onclick=drop;$('.jelly-world').onpointerdown=e=>{e.preventDefault();drop()};$('#finishJelly').onclick=finish;
 gameListen(window,'keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();drop()}});
 function tick(now){const dt=document.hidden?0:Math.min(.035,(now-(last||now))/1000);last=now;x+=direction*dt*(90+Math.min(110,blocks.length*7));if(x+width>=355){x=355-width;direction=-1}if(x<=5){x=5;direction=1}paint();gameAnimation(tick)}
 paint();gameAnimation(tick);
}
function startrail(){
 const count=Math.min(16,5+Math.floor(LV/2)),positions=Array.from({length:20},(_,i)=>({x:38+i%4*92,y:48+Math.floor(i/4)*65})).sort(()=>Math.random()-.5).slice(0,count);
 let next=0,seconds=Math.max(20,40-Math.floor(LV/3)),done=false;
 frame('startrail','<div class="scene-title"><small>POSTCARDS FROM THE MOON</small><h2>Stitch a little starlight</h2></div><div class="scene-hud" id="starHud"></div><div class="star-world"><svg viewBox="0 0 360 360" aria-hidden="true"><circle cx="293" cy="38" r="23" fill="#ffe9b1"/><path d="M300 17a23 23 0 00-4 42 24 24 0 01-4-43" fill="#8475b4"/><g id="starLines"></g></svg><div id="starButtons"></div></div><p class="scene-tip">Connect 1 → 2 → 3… · a wrong star costs 3 seconds</p>');
 function paint(){
  $('#starHud').innerHTML=`<span>Stars <b>${next}/${count}</b></span><span>Moonset <b>${seconds}s</b></span>`;
  $('#starLines').innerHTML=positions.slice(1,next).map((p,i)=>`<path d="M${positions[i].x} ${positions[i].y}L${p.x} ${p.y}" stroke="#fbe3ad" stroke-width="3"/>`).join('');
  $('#starButtons').innerHTML=positions.map((p,i)=>`<button class="trail-star ${i<next?'joined':''}" style="left:${p.x/3.6}%;top:${p.y/3.6}%" data-star="${i}" aria-label="Star ${i+1}" ${i<next?'disabled':''}>${i+1}</button>`).join('');
  $('#starButtons').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;if(+b.dataset.star===next){next++;snd('ding')}else{seconds=Math.max(0,seconds-3);snd('buzz')}paint();check()});
 }
 function check(){if(done)return;if(next===count){done=true;end('startrail',true,'Your constellation is shining!',count*50+seconds*8)}else if(seconds<=0){done=true;end('startrail',false,'The moon is sleepy. Try a fresh sky!',next*30)}}
 gameInterval(()=>{seconds--;paint();check()},1000);paint();
}
function garden(){
 const target=3+Math.min(9,Math.floor(LV/2));let harvested=0,seconds=55,done=false;
 const pots=Array.from({length:6},()=>({stage:0,water:10,readyAt:0}));
 frame('garden','<div class="scene-title"><small>A SUNNY LITTLE SIDE QUEST</small><h2>Mochi’s windowsill garden</h2></div><div class="scene-hud" id="gardenHud"></div><div class="garden-world"><div class="garden-sky" aria-hidden="true">☀</div><div id="gardenPots"></div></div><p class="scene-tip">Empty pot: plant · Sprout: water · Bloom: harvest<br>Water before the blue bar runs out.</p><p id="gardenMessage" role="status">Let’s grow something lovely.</p>');
 function paint(){
  $('#gardenHud').innerHTML=`<span>Blooms <b>${harvested}/${target}</b></span><span>Sunshine <b>${seconds}s</b></span>`;
  $('#gardenPots').innerHTML=pots.map((p,i)=>`<button class="garden-pot" data-pot="${i}" aria-label="${p.stage===0?'Plant seed':p.stage===3?'Harvest flower':'Water sprout'} in pot ${i+1}"><svg viewBox="0 0 100 120" aria-hidden="true">${p.stage?`<path d="M50 83V${p.stage===3?33:62-p.stage*10}" stroke="#6b9e7c" stroke-width="5"/><path d="M49 66q-29-23-26-2 7 12 26 2M52 55q27-21 24-1-5 12-24 1" fill="#a4d4a3" stroke="#6b9e7c" stroke-width="2"/>`:''}${p.stage===3?`<g fill="${['#f5b1c4','#bcb2e4','#ffdc8c'][i%3]}" stroke="#987b9c" stroke-width="1.5"><circle cx="50" cy="23" r="12"/><circle cx="37" cy="35" r="12"/><circle cx="63" cy="35" r="12"/><circle cx="43" cy="48" r="12"/><circle cx="57" cy="48" r="12"/></g><circle cx="50" cy="36" r="10" fill="#ffe29c"/><path d="M46 36h1M54 36h1M48 40q3 3 5 0" stroke="#69496d" fill="none"/>`:''}<path d="M22 80h56l-7 34H29z" fill="#e8ad9c" stroke="#986f79" stroke-width="2.5"/><rect x="18" y="77" width="64" height="12" rx="5" fill="#f2c4b6" stroke="#986f79" stroke-width="2.5"/>${!p.stage?'<path d="M44 57h12M50 51v12" stroke="#986f79" stroke-width="3"/>':''}</svg><span>${p.stage===0?'Plant':p.stage===3?'Harvest':'Water'}</span><progress max="10" value="${p.stage?p.water:10}"></progress></button>`).join('');
  $('#gardenPots').querySelectorAll('button').forEach(b=>b.onclick=()=>{
   if(done)return;const p=pots[+b.dataset.pot];
   if(p.stage===3){harvested++;p.stage=0;snd('coin');$('#gardenMessage').textContent='A new bloom for your bouquet!'}
   else{if(Date.now()<p.readyAt){$('#gardenMessage').textContent='This sprout needs a moment of sunshine. Try another pot!';return}p.stage++;p.water=10;p.readyAt=Date.now()+2200;snd('pour')}
   paint();if(harvested>=target)finish(true);
  });
 }
 function finish(won){if(done)return;done=true;end('garden',won,won?'Your windowsill is full of happiness!':'The sun has set. Your sprouts will miss you.',harvested*120+(won?seconds*5:0))}
 gameInterval(()=>{seconds--;pots.forEach(p=>{if(p.stage&&--p.water<=0){p.stage=0;$('#gardenMessage').textContent='A pot dried out. Plant a fresh seed.'}});paint();if(seconds<=0)finish(false)},1000);paint();
}
const pocketGames={cloudhop,jellystack,startrail,garden},previousStartGame=startGame;
startGame=function(id){if(pocketGames[id]){beginGame();return pocketGames[id]()}return previousStartGame(id)};
