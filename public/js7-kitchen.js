/* Burger Chef: many dishes, many kinds of customers */
const SHP={
0:t=>t?'<path d="M6 24q0-22 44-22t44 22z" fill="#e3a14d"/><g fill="#fff7d6"><ellipse cx="34" cy="10" rx="3" ry="1.6"/><ellipse cx="52" cy="7" rx="3" ry="1.6"/><ellipse cx="68" cy="11" rx="3" ry="1.6"/></g>':'<rect x="6" y="6" width="88" height="16" rx="8" fill="#d98f3c"/>',
1:()=>'<rect x="4" y="6" width="92" height="16" rx="8" fill="#7b3f1d"/>',
2:()=>'<path d="M4 8h92l-12 14-10-8-10 8-10-8-10 8-10-8-10 8z" fill="#ffc107"/>',
3:()=>'<path d="M2 14q8-10 16 0t16 0 16 0 16 0 16 0 16 0v10H2z" fill="#4caf50"/>',
4:()=>'<rect x="8" y="8" width="84" height="14" rx="7" fill="#e5484d"/>',
5:()=>'<rect x="4" y="7" width="92" height="14" rx="7" fill="#c0504d"/>',
6:()=>'<path d="M6 14q8-8 16 0t16 0 16 0 16 0 16 0 14 0" stroke="#ffd400" stroke-width="5" fill="none"/>',
7:()=>'<rect x="8" y="8" width="84" height="12" rx="6" fill="#f4eefc"/><path d="M20 8v12M40 8v12M60 8v12M80 8v12" stroke="#cdb4f6" stroke-width="2"/>',
8:()=>'<rect x="2" y="8" width="96" height="14" rx="7" fill="#f0d49a"/>',
9:()=>'<rect x="6" y="10" width="88" height="10" rx="5" fill="#d93a2b"/>',
10:()=>'<g fill="#b3261e"><circle cx="20" cy="15" r="9"/><circle cx="50" cy="15" r="9"/><circle cx="80" cy="15" r="9"/></g>',
11:()=>'<g fill="#2e3b2f"><circle cx="24" cy="15" r="6"/><circle cx="50" cy="15" r="6"/><circle cx="76" cy="15" r="6"/></g>',
12:()=>'<path d="M4 6h92q-6 18-46 18T4 6z" fill="#e8b865"/>',
13:()=>'<rect x="8" y="8" width="84" height="14" rx="7" fill="#8b4a2b"/><g fill="#5c2f18"><circle cx="24" cy="14" r="3"/><circle cx="50" cy="17" r="3"/><circle cx="74" cy="13" r="3"/></g>',
14:()=>'<circle cx="20" cy="15" r="6" fill="#e5484d"/><circle cx="40" cy="14" r="5" fill="#4caf50"/><circle cx="60" cy="16" r="6" fill="#e5484d"/><circle cx="80" cy="14" r="5" fill="#4caf50"/>',
15:()=>'<rect x="6" y="9" width="88" height="10" rx="5" fill="#f2a0a0"/>',
16:t=>t?'<rect x="8" y="4" width="84" height="18" rx="6" fill="#e0b070"/>':'<rect x="8" y="6" width="84" height="16" rx="6" fill="#cfa05c"/>'};
const ING=['Bun','Patty','Cheese','Lettuce','Tomato','Sausage','Mustard','Onion','Dough','Sauce','Pepperoni','Olives','Shell','Meat','Salsa','Ham','Bread'];
const DS=[{n:'Burger',e:'🍔',base:0,top:0,bins:[1,2,3,4],prep:1,station:'Stove'},{n:'Hot dog',e:'🌭',base:0,top:0,bins:[5,6,7],prep:5,station:'Stove'},{n:'Sandwich',e:'🥪',base:16,top:16,bins:[15,2,3,4],prep:15,station:'Microwave'},{n:'Pizza',e:'🍕',base:8,top:-1,bins:[9,2,10,11],prep:8,station:'Microwave'},{n:'Taco',e:'🌮',base:12,top:-1,bins:[13,3,2,14],prep:13,station:'Stove'}];
const SIDES=[{id:'fries',name:'Fries',e:'🍟'},{id:'soda',name:'Soda',e:'🥤'},{id:'juice',name:'Juice',e:'🧃'}];
const CT=[{n:'Calm',p:1.25,e:'😌'},{n:'Regular',p:1,e:'🙂'},{n:'Impatient',p:.6,e:'😤'},{n:'VIP',p:.85,e:'👑',vip:1}];
function bstack(a,w,plate){
  const n=7,H=n*13+22;
  return `<svg viewBox="0 0 100 ${H}" width="${w}" height="${w*H/100}">${plate?`<ellipse cx="50" cy="${H-4}" rx="48" ry="6" fill="#fff" stroke="#d9c7c0" stroke-width="2"/>`:''}${a.map((k,i)=>`<g transform="translate(0 ${H-12-(i+1)*13})">${SHP[k](i>0&&(k===0||k===16))}</g>`).join('')}</svg>`;
}
const custSVG=(m,h,sh,vip)=>`<svg viewBox="0 0 100 104" width="84"><rect x="22" y="78" width="56" height="26" rx="12" fill="${sh}"/><circle cx="50" cy="52" r="28" fill="#ffd9b3"/><path d="M20 50q0-34 30-34t30 34q-14-14-30-14T20 50z" fill="${h}"/>${vip?'<polygon points="30,20 36,6 50,16 64,6 70,20" fill="#ffd400"/>':''}<circle cx="40" cy="54" r="3.5" fill="#222"/><circle cx="60" cy="54" r="3.5" fill="#222"/>${m===2?'<path d="M32 44l16 5M68 44l-16 5" stroke="#222" stroke-width="3"/><path d="M80 30l6-6M84 38l8-2" stroke="#e5484d" stroke-width="3"/>':''}<path d="${['M38 66q12 12 24 0','M40 70h20','M38 74q12-12 24 0'][m]}" stroke="#5b1a3a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
const chefSVG='<svg viewBox="0 0 100 104" width="70"><rect x="30" y="4" width="40" height="22" rx="11" fill="#fff" stroke="#ddd"/><rect x="34" y="20" width="32" height="10" fill="#fff" stroke="#ddd"/><circle cx="50" cy="52" r="24" fill="#ffd9b3"/><circle cx="42" cy="50" r="3" fill="#222"/><circle cx="58" cy="50" r="3" fill="#222"/><path d="M42 62q8 8 16 0" stroke="#5b1a3a" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="28" y="78" width="44" height="24" rx="10" fill="#fff" stroke="#ddd"/></svg>';
function cook(){
  const NEED=3+Math.floor(LV*.55),CAP=Math.min(4,1+Math.floor(LV/2)),HAIR=['#5b3a29','#222','#c9a227','#b5471f','#7d7d7d'],SH=['#ff4d94','#3b82f6','#2fbf71','#f59e0b','#8e2f5f'];
  const AV=[0,...(LV>=2?[1]:[]),...(LV>=3?[2]:[]),...(LV>=5?[3]:[]),...(LV>=7?[4]:[])],CP=LV<3?[0,1]:LV<5?[0,1,2]:[0,1,2,2,3],PEOPLE=['Maya','Theo','Ari','Nina','Kai','Remy','Jo','Sage'];
  const R=a=>a[Math.floor(Math.random()*a.length)];
  let lives=3,served=0,pts=0,queue=[],selected=null,spawned=0,nextId=0,finished=false,timer=null;
  frame('cook',`<div class="kitchen-game"><div class="kitchen-status" id="scoreline"></div><section class="service-scene"><div class="customer-line" id="orders"></div><div class="server-card">${chefSVG}<div><b>Chef & server</b><small>Build it, then bring it to the table.</small></div><span class="counter-lamp">OPEN</span></div></section><div class="kitchen-work"><section class="recipe-ticket" id="orderCard"></section><section class="plate-ticket"><div class="plate-title">Serving tray</div><div id="pl"></div><div class="row kitchen-actions"><button class="btn" id="sv">Serve to customer</button><button class="btn ghost" id="un">Undo</button></div></section></div><section class="ingredient-panel"><div class="ingredient-title">Ingredient containers</div><p class="bin-hint">Pick each item in order. Hot ingredients need cooking first.</p><div id="ig" class="ingredient-grid"></div></section><p class="kitchen-message" id="m" aria-live="polite"></p></div>`);
  const active=()=>queue.find(o=>o.id===selected);
  function addOrder(){
    if(spawned>=NEED)return;
    const dish=DS[R(AV)],cu={...CT[R(CP)],h:R(HAIR),s:R(SH),name:R(PEOPLE)};
    const count=1+Math.min(4,Math.ceil(LV/2)+Math.floor(Math.random()*2)),recipe=[dish.base],extra=Math.random()<.48?R(SIDES):null;
    for(let i=0;i<count;i++)recipe.push(R(dish.bins));if(dish.prep!=null&&!recipe.includes(dish.prep))recipe.push(dish.prep);if(dish.top>=0)recipe.push(dish.top);
    const maxTime=Math.max(13,31-LV*1.1)*cu.p;
    queue.push({id:++nextId,dish,cu,recipe,extra,extraPicked:null,plate:[],cooked:false,cooking:false,maxTime,left:maxTime,mood:0});spawned++;
    if(selected===null)selected=queue[0].id;
  }
  function paintQueue(){
    $('#orders').innerHTML=queue.map(o=>`<button class="order-ticket ${o.id===selected?'selected':''}" data-order="${o.id}"><span class="ticket-face">${custSVG(o.mood,o.cu.h,o.cu.s,o.cu.vip)}</span><span class="order-thought"><small>WANTS</small>${bstack(o.recipe,62,false)}${o.extra?`<b>${o.extra.e} ${o.extra.name}</b>`:''}</span><span class="ticket-info"><b>${o.cu.name}${o.cu.vip?' · VIP':''}</b><small>${o.dish.n} order</small><i class="patience-track"><i class="patience-fill" style="width:${Math.max(0,o.left/o.maxTime*100)}%"></i></i><small class="ticket-time">${Math.ceil(o.left)}s</small></span></button>`).join('');
    $('#orders').querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{selected=+b.dataset.order;paint()});
  }
  function paintOrder(){
    const o=active();
    if(!o){$('#orderCard').innerHTML='<div class="empty-art">Choose a waiting customer to see their order.</div>';$('#ig').innerHTML='';$('#pl').innerHTML='<div class="plate-empty">Your tray is ready</div>';return}
    const appliance=o.dish.prep==null?'':`<div class="appliance-row"><span class="appliance-icon">${o.dish.station==='Microwave'?'▣':'♨'}</span><div><b>${o.dish.station}</b><small>${o.cooked?'Ready to plate':o.cooking?`Cooking ${ING[o.dish.prep]}…`:`Cook ${ING[o.dish.prep]} before adding it`}</small></div><button class="btn sm" id="cookItem" type="button" ${o.cooked||o.cooking?'disabled':''}>${o.cooked?'Ready':o.cooking?'Cooking…':'Cook'}</button></div>`;
    $('#orderCard').innerHTML=`<div class="ticket-heading"><span>${o.dish.e}</span><div><b>${o.cu.name}'s order</b><small>${o.dish.n}${o.extra?` + ${o.extra.name}`:''}</small></div></div><p>Match the customer's picture, layer by layer.</p><div class="recipe-visuals">${o.recipe.map(k=>`<div class="recipe-visual" title="${ING[k]}"><svg viewBox="0 0 100 26" aria-hidden="true">${SHP[k](true)}</svg></div>`).join('')}${o.extra?`<span class="extra-order">${o.extra.e} ${o.extra.name}</span>`:''}</div>${appliance}<small class="recipe-hint">Choose ingredients from the containers, then serve the finished tray.</small>`;
    if(o.dish.prep!=null)$('#cookItem').onclick=()=>{
      const current=active();if(!current||current.cooked||current.cooking)return;
      current.cooking=true;paintOrder();
      setTimeout(()=>{const ready=queue.find(x=>x.id===current.id);if(!ready||!document.body.contains($('#orders')))return;ready.cooking=false;ready.cooked=true;snd('ding');if(ready.id===selected){$('#m').textContent=`${ING[ready.dish.prep]} is ready. Add it to the tray.`;paintOrder()}},1800);
    };
    $('#pl').innerHTML=`<div class="tray-board">${o.plate.length?o.plate.map((k,i)=>`<div class="tray-layer"><span>${i+1}</span><svg viewBox="0 0 100 26" aria-hidden="true">${SHP[k](true)}</svg><b>${ING[k]}</b></div>`).join(''):'<div class="plate-empty">Tap ingredients to build the stack</div>'}${o.extraPicked?`<div class="tray-extra">${o.extraPicked.e} ${o.extraPicked.name}</div>`:''}</div>`;
    const allowed=new Set([o.dish.base,...o.dish.bins,...(o.dish.prep!=null?[o.dish.prep]:[]),...(o.dish.top>=0?[o.dish.top]:[])]);
    const groups=[['Breads & bases',[0,8,12,16]],['Stove & microwave',[1,5,13,15]],['Fresh & toppings',[2,3,4,6,7,9,10,11,14]]];
    $('#ig').innerHTML=groups.map(([name,items])=>{const available=items.filter(k=>allowed.has(k));return available.length?`<section class="ingredient-bin"><b>${name}</b><div>${available.map(k=>`<button class="ingredient" data-k="${k}" type="button"><svg viewBox="0 0 100 26" aria-hidden="true">${SHP[k](true)}</svg><span>${ING[k]}</span></button>`).join('')}</div></section>`:''}).join('')+`<section class="ingredient-bin sides-bin"><b>Sides & drinks</b><div>${SIDES.map(x=>`<button class="ingredient side-item ${o.extraPicked?.id===x.id?'picked':''}" data-side="${x.id}" type="button"><span>${x.e}</span><span>${x.name}</span></button>`).join('')}</div></section>`;
    $('#ig').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const current=active(),k=+b.dataset.k;if(!current)return;if(k===current.dish.prep&&!current.cooked){$('#m').textContent=`Cook the ${ING[k].toLowerCase()} on the ${current.dish.station} first.`;return}if(current.plate.length<9){current.plate.push(k);$('#m').textContent=`Added ${ING[k].toLowerCase()} to the tray.`;paintOrder()}});
    $('#ig').querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{const current=active();if(current){current.extraPicked=SIDES.find(x=>x.id===b.dataset.side);$('#m').textContent=`Added ${current.extraPicked.name.toLowerCase()} to the tray.`;paintOrder()}});
  }
  function paint(){paintQueue();paintOrder();$('#scoreline').innerHTML=`<span>Customers <b>${served}/${NEED}</b></span><span>In line <b>${queue.length}/${CAP}</b></span><span>Mistakes <b>${'♥'.repeat(lives)}${'♡'.repeat(3-lives)}</b></span><span>Score <b>${pts}</b></span>`}
  function finish(won,text){if(finished)return;finished=true;clearInterval(timer);end('cook',won,text,won?pts+LV*50:pts)}
  $('#un').onclick=()=>{const o=active();if(o){if(o.extraPicked)o.extraPicked=null;else o.plate.pop();paintOrder()}};
  $('#sv').onclick=()=>{
    const o=active();if(!o||finished)return;
    if(JSON.stringify(o.plate)===JSON.stringify(o.recipe)&&(o.extra?.id||'')===(o.extraPicked?.id||'')){
      served++;pts+=100*(o.cu.vip?2:1)+Math.round(o.left)*5+(o.extra?25:0);snd('ding');queue=queue.filter(x=>x.id!==o.id);
      if(served>=NEED)return finish(true,'Every customer served! Service with a smile.');
      selected=queue[0]?.id??null;while(queue.length<CAP&&spawned<NEED)addOrder();paint();
    }else{lives--;snd('buzz');o.plate=[];o.extraPicked=null;$('#m').textContent='That tray does not match the customer picture. Try again.';if(lives<=0)return finish(false,'The kitchen is out of chances.');paint()}
  };
  while(queue.length<CAP&&spawned<NEED)addOrder();paint();
  timer=setInterval(()=>{
    if(!document.body.contains($('#orders'))||finished){clearInterval(timer);return}
    queue.forEach(o=>{o.left=Math.max(0,o.left-.1);o.mood=o.left/o.maxTime>.55?0:o.left/o.maxTime>.25?1:2});
    const expired=queue.filter(o=>o.left<=0);
    if(expired.length){queue=queue.filter(o=>o.left>0);lives-=expired.length;snd('buzz');if(lives<=0)return finish(false,'Too many customers left waiting.');if(!queue.some(o=>o.id===selected))selected=queue[0]?.id??null;while(queue.length<CAP&&spawned<NEED)addOrder();paint();return}
    queue.forEach(o=>{const ticket=$(`#orders [data-order="${o.id}"]`);if(ticket){ticket.querySelector('.patience-fill').style.width=Math.max(0,o.left/o.maxTime*100)+'%';ticket.querySelector('.ticket-time').textContent=Math.ceil(o.left)+'s'}});
    $('#scoreline').innerHTML=`<span>Customers <b>${served}/${NEED}</b></span><span>In line <b>${queue.length}/${CAP}</b></span><span>Mistakes <b>${'♥'.repeat(lives)}${'♡'.repeat(3-lives)}</b></span><span>Score <b>${pts}</b></span>`;
  },100);
}
/* Echo Colours */
function simon(){
  const COL=['#ff4d6d','#3ddc84','#4cc9f0','#ffd400'],TG=3+LV*2;let seq=[],pos=0,busy=true,lit=-1;
  frame('simon','<div class="msg" id="m"></div><div id="sm" class="tb" style="grid-template-columns:1fr 1fr;gap:12px;max-width:320px"></div>');
  const paint=()=>{$('#sm').innerHTML=COL.map((c,i)=>`<button data-i="${i}" style="aspect-ratio:1;border:0;border-radius:26px;background:${c};opacity:${lit===i?1:.45};box-shadow:${lit===i?'0 0 24px '+c:'none'};padding:0"></button>`).join('');$('#sm').querySelectorAll('button').forEach(b=>b.onclick=()=>tap(+b.dataset.i))};
  function show(){
    busy=true;pos=0;let i=0;$('#m').textContent=`Watch... ${seq.length}/${TG}`;
    const t=setInterval(()=>{
      if(!document.body.contains($('#sm'))){clearInterval(t);return}
      if(i%2===0){if(i/2>=seq.length){clearInterval(t);lit=-1;paint();busy=false;$('#m').textContent='Your turn!';return}lit=seq[i/2];snd('t'+lit)}else lit=-1;
      paint();i++;
    },Math.max(220,450-LV*25));
  }
  const next=()=>{seq.push(Math.floor(Math.random()*4));setTimeout(show,600)};
  function tap(i){
    if(busy)return;lit=i;snd('t'+i);paint();setTimeout(()=>{lit=-1;if(document.body.contains($('#sm')))paint()},160);
    if(i!==seq[pos])return end('simon',false,`Wrong pad! You reached ${seq.length-1}.`,(seq.length-1)*50);
    pos++;
    if(pos===seq.length){if(seq.length>=TG)return end('simon',true,'Perfect memory! 🎶',seq.length*60+LV*50);busy=true;next()}
  }
  paint();next();
}
/* Whack-a-Mole */
function whack(){
  const TG=8+LV*3,T=30000+LV*2500,maxMisses=5+Math.floor(LV/6),t0=Date.now();let hits=0,miss=0,up=-1;
  frame('whack','<div class="msg" id="m" style="font-size:15px"></div><div class="tb" id="wg" style="grid-template-columns:repeat(3,1fr);gap:10px;max-width:320px"></div>');
  const paint=()=>{
    $('#m').textContent=`Hits ${hits}/${TG} · Misses ${miss}/${maxMisses} · ${Math.max(0,Math.ceil((T-(Date.now()-t0))/1000))}s`;
    $('#wg').innerHTML=Array.from({length:9},(_,i)=>`<button data-i="${i}" style="aspect-ratio:1;border-radius:50%;border:4px solid #6d4c41;background:${i===up?'#c68642':'#5d4037'};font-size:40px;padding:0">${i===up?'🐹':''}</button>`).join('');
    $('#wg').querySelectorAll('button').forEach(b=>b.onpointerdown=e=>{e.preventDefault();hit(+b.dataset.i)});
  };
  function hit(i){
    if(i===up){hits++;up=-1;snd('pop');if(hits>=TG){clearInterval(tm);clearInterval(tm2);return end('whack',true,'Mole master! 🔨',hits*50+(Math.max(0,T-(Date.now()-t0))/100|0)+LV*50)}}
    else{miss++;snd('buzz');if(miss>=maxMisses){clearInterval(tm);clearInterval(tm2);return end('whack',false,'Too many misses.',hits*50)}}
    paint();
  }
  const tm2=setInterval(()=>{up=Math.floor(Math.random()*9);paint()},Math.max(450,900-LV*50));
  const tm=setInterval(()=>{
    if(!document.body.contains($('#wg'))){clearInterval(tm);clearInterval(tm2);return}
    if(Date.now()-t0>=T){clearInterval(tm);clearInterval(tm2);return end('whack',false,"Time's up!",hits*50)}
    paint();
  },250);
  paint();
}
/* Slide Puzzle */
function slide(){
  const N=LV<4?3:LV<9?4:LV<20?5:6;let g=[...Array(N*N).keys()].map(x=>x+1),moves=0,from=-1;g[N*N-1]=0;
  const nb=i=>{const r=i/N|0,c=i%N,o=[];if(r>0)o.push(i-N);if(r<N-1)o.push(i+N);if(c>0)o.push(i-1);if(c<N-1)o.push(i+1);return o};
  for(let k=0;k<250+LV*55;k++){const z=g.indexOf(0),o=nb(z),j=o[Math.floor(Math.random()*o.length)];g[z]=g[j];g[j]=0}
  frame('slide','<div class="msg" id="m" style="font-size:15px"></div><div class="tb" id="sg" style="grid-template-columns:repeat('+N+',1fr);gap:5px;max-width:340px"></div>');
  const paint=()=>{
    $('#m').textContent=`Moves ${moves}. Tap or drag a tile into the gap.`;
    $('#sg').innerHTML=g.map((v,i)=>`<button data-i="${i}" style="aspect-ratio:1;border:0;border-radius:12px;padding:0;font-size:${N>4?20:26}px;font-weight:800;color:#fff;background:${v?`hsl(${330-v*5},75%,${55+(v%3)*4}%)`:'transparent'};box-shadow:${v?'inset 0 -4px #0003':'none'}">${v||''}</button>`).join('');
  };
  function mv(i){
    const z=g.indexOf(0);if(!nb(z).includes(i))return;
    g[z]=g[i];g[i]=0;moves++;snd('move');paint();
    if(g.every((v,k)=>v===(k===N*N-1?0:k+1)))end('slide',true,`Solved in ${moves} moves! 🧩`,Math.max(100,900-moves*6)+LV*50);
  }
  const sg=$('#sg');
  sg.onpointerdown=e=>{const t=e.target.closest('[data-i]');from=t?+t.dataset.i:-1};
  sg.onpointerup=e=>{const t=document.elementFromPoint(e.clientX,e.clientY),x=t&&t.closest('[data-i]');
    if(from>=0&&x&&+x.dataset.i===from)mv(from);else if(from>=0&&x&&g[+x.dataset.i]===0)mv(from);from=-1};
  paint();
}
/* Photo Booth */
function photo(){
  frame('photo','<div class="booth-layout"><section class="booth-capture"><div class="camera booth-viewer" id="boothViewer"><video id="cam" autoplay playsinline></video><img id="photoSource" alt="Selected photo"><canvas id="photoCanvas"></canvas><div id="photoEmpty" class="booth-empty">Your portrait booth</div><div id="liveSticker" class="live-sticker"></div><div id="countdown" class="countdown" aria-live="polite"></div></div><div class="booth-actions"><button class="btn" id="startCam">Enable camera</button><label class="btn ghost upload-btn">Choose image<input id="pickImg" type="file" accept="image/*"></label><button class="btn" id="startStrip" disabled>Take four photos</button></div><p id="boothStatus" class="booth-status">Allow camera access, then start your strip.</p></section><section class="booth-editor"><div class="editor-section"><b>Look filters</b><div class="photo-tools" id="filters"></div></div><div class="editor-section"><b>Face filters & overlays</b><div class="photo-tools" id="stickers"></div></div><div class="editor-section caption-tools"><label for="stripCaption">Strip caption</label><input id="stripCaption" maxlength="48" placeholder="A little moment" value="ARCADE PHOTO CLUB"><label for="captionFont">Font</label><select id="captionFont"><option value="Fredoka">Playful</option><option value="Quicksand">Clean</option><option value="Georgia">Classic</option><option value="cursive">Handwritten</option></select><label for="stripColor">Strip colour</label><input id="stripColor" type="color" value="#efe9da" aria-label="Choose strip colour"></div><div class="strip-heading"><b>Your photo strip</b><span id="shotCount">0 / 4</span></div><div id="strip" class="strip"></div><div class="booth-actions"><button class="btn" id="downloadStrip" disabled>Download strip</button><button class="btn ghost" id="clearStrip" disabled>New strip</button></div></section></div>');
  const v=$('#cam'),source=$('#photoSource'),viewer=$('#boothViewer'),cv=$('#photoCanvas'),ctx=cv.getContext('2d');let stream=null,filter='normal',sticker='bunny',shots=[],busy=false,pos={x:50,y:30};
  const filters={vintage:'Vintage sepia',film:'Film B&W',soft:'Candy glow',warm:'Sunset',mono:'Soft mono',dream:'Dreamy haze',vivid:'Neon pop',fog:'Misty fog',cool:'Blue hour',normal:'Natural'};
  const looks={vintage:'sepia(.9) contrast(1.18) brightness(1.03) saturate(.85)',film:'grayscale(1) contrast(1.3) brightness(1.06) sepia(.12)',soft:'brightness(1.08) contrast(1.06) saturate(1.22)',warm:'sepia(.18) saturate(1.38) hue-rotate(-18deg)',mono:'grayscale(1) contrast(1.1)',dream:'brightness(1.1) saturate(.8) hue-rotate(14deg)',vivid:'saturate(1.45) contrast(1.08) brightness(1.12)',fog:'brightness(1.12) contrast(.9) saturate(.72)',cool:'saturate(.9) hue-rotate(18deg) brightness(1.05)',normal:'none'};
  const stickerSet=[...BOOTH_NEW_STICKERS,
    {id:'bunny',label:'Bunny ears',emoji:'',svg:'<svg viewBox="0 0 120 120"><g stroke="#4a2c6b" stroke-width="3"><ellipse cx="28" cy="37" rx="14" ry="34" fill="white" transform="rotate(-12 28 37)"/><ellipse cx="92" cy="37" rx="14" ry="34" fill="white" transform="rotate(12 92 37)"/></g><ellipse cx="28" cy="37" rx="7" ry="25" fill="#ff9ccb"/><ellipse cx="92" cy="37" rx="7" ry="25" fill="#ff9ccb"/><ellipse cx="20" cy="100" rx="10" ry="5" fill="#ff9ccb"/><ellipse cx="100" cy="100" rx="10" ry="5" fill="#ff9ccb"/></svg>'},
    {id:'cat',label:'Kitty ears',emoji:'',svg:'<svg viewBox="0 0 120 120"><path d="M8 50L12 5l38 34M70 39L108 5l4 45" fill="#fff" stroke="#4a2c6b" stroke-width="3"/><path d="M18 36l1-17 17 17M84 36l17-17 1 17" fill="#ff9ccb"/><path d="M5 85l25 6M3 99l27-2M90 91l25-6M90 97l27 2" stroke="#4a2c6b" stroke-width="3"/></svg>'},
    {id:'dog',label:'Dog',emoji:'🐶',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M31 38Q10 24 14 57q2 16 20 19M89 38q21-14 17 19-2 16-20 19" fill="#b97945" stroke="#80502e" stroke-width="5"/><circle cx="60" cy="61" r="39" fill="#f1c792"/><circle cx="46" cy="55" r="4" fill="#2a1837"/><circle cx="74" cy="55" r="4" fill="#2a1837"/><ellipse cx="60" cy="72" rx="12" ry="9" fill="#47353a"/><path d="M60 81q-8 11-17 2m17-2q8 11 17 2" fill="none" stroke="#47353a" stroke-width="4" stroke-linecap="round"/></svg>'},
    {id:'flower',label:'Bloom',emoji:'🌸',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="#ff5fa7"><circle cx="60" cy="24" r="14"/><circle cx="60" cy="96" r="14"/><circle cx="24" cy="60" r="14"/><circle cx="96" cy="60" r="14"/><circle cx="35" cy="35" r="13"/><circle cx="85" cy="35" r="13"/><circle cx="35" cy="85" r="13"/><circle cx="85" cy="85" r="13"/></g><circle cx="60" cy="60" r="18" fill="#ffd96e"/><path d="M60 22v76M22 60h76" stroke="#96e2ab" stroke-width="4" stroke-linecap="round"/></svg>'},
    {id:'star',label:'Spark',emoji:'✨',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 16l13 28 31 4-22 22 5 32-27-15-27 15 5-32-22-22 31-4 13-28z" fill="#ffd75a" stroke="#fff0ab" stroke-width="4"/><path d="M40 44l20 19 19-19" stroke="#fff8d6" stroke-width="5" stroke-linecap="round" fill="none"/></svg>'},
    {id:'heart',label:'Heart',emoji:'💖',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 97c-2 0-4-1-6-3L28 70c-9-9-9-23 0-32 9-9 23-9 32 0l0 0 0 0c9-9 23-9 32 0 9 9 9 23 0 32l-26 24c-2 2-4 3-6 3z" fill="#ff6aa5"/><path d="M45 42c-9 0-18 5-18 17 0 10 8 17 18 20" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>'},
    {id:'bow',label:'Bow',emoji:'🎀',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M36 60c0-18 14-32 32-32s32 14 32 32-14 32-32 32-32-14-32-32zm17 0c0 12 8 20 15 20 7 0 15-8 15-20 0-12-8-20-15-20-7 0-15 8-15 20zm17-1c-6 0-11 5-11 10 0 5 5 9 11 9s11-4 11-9c0-5-5-10-11-10z" fill="#8d6dff"/><path d="M60 20v34" stroke="#ff9bc4" stroke-width="6" stroke-linecap="round"/><path d="M60 93v15" stroke="#ff9bc4" stroke-width="6" stroke-linecap="round"/></svg>'},
    {id:'writing',label:'Writing',emoji:'✍️',svg:''}
  ];
  const stickerSvg=id=> (stickerSet.find(s=>s.id===id) || stickerSet[0]).svg;
  const css=()=>looks[filter]||'none';
  const paintControls=()=>{
    $('#filters').innerHTML=Object.entries(filters).map(([k,n])=>`<button class="filter-chip ${k===filter?'on':''}" data-filter="${k}">${n}</button>`).join('');
    $('#stickers').innerHTML=`<button class="filter-chip ${!sticker?'on':''}" data-sticker="">None</button>`+stickerSet.map(x=>`<button class="filter-chip sticker-choice ${x.id===sticker?'on':''}" data-sticker="${x.id}" aria-label="${x.label} sticker">${x.emoji} ${x.label}</button>`).join('');
    $('#liveSticker').innerHTML=sticker==='writing'?`<span class="live-writing">${esc($('#stripCaption').value.trim()||'Your caption')}</span>`:sticker?stickerSvg(sticker):'';
    viewer.dataset.filter=filter;
    $('#liveSticker').style.setProperty('--sx',pos.x);$('#liveSticker').style.setProperty('--sy',pos.y);$('#filters').querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;if(filter==='vintage'||filter==='film')$('#stripColor').value='#efe9da';paintControls();viewer.dataset.filter=filter;v.style.filter=css();source.style.filter=css();renderStrip()});
    $('#stickers').querySelectorAll('[data-sticker]').forEach(b=>b.onclick=()=>{sticker=b.dataset.sticker||'';paintControls();renderStrip()});
  };
  function renderStrip(){
    $('#shotCount').textContent=`${shots.length} / 4`;
    const selectedSticker=stickerSet.find(item=>item.id===sticker);
    $('#strip').style.backgroundColor=$('#stripColor').value;
    const overlay=sticker==='writing'?`<span class="strip-sticker"><span class="photo-writing">${esc($('#stripCaption').value.trim()||'Your caption')}</span></span>`:selectedSticker?`<span class="strip-sticker">${selectedSticker.svg}</span><span class="strip-emoji" aria-hidden="true">${selectedSticker.emoji}</span>`:'';
    $('#strip').innerHTML=shots.length?shots.map((shot,i)=>`<div class="strip-photo" data-filter="${filter}" style="--sx:${pos.x};--sy:${pos.y}"><img src="${shot}" alt="Photo ${i+1}" style="filter:${css()}">${overlay}<span class="frame-number">0${i+1}</span></div>`).join(''):'<div class="strip-placeholder">Four portrait frames will appear here.</div>';
    $('#downloadStrip').disabled=shots.length!==4;$('#clearStrip').disabled=!shots.length;
  }
  $('#startCam').onclick=async()=>{
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});v.srcObject=stream;v.style.display='block';source.style.display='none';$('#photoEmpty').style.display='none';v.style.filter=css();viewer.dataset.filter=filter;$('#startStrip').disabled=false;$('#boothStatus').textContent='Camera ready. Your four photos will be spaced three seconds apart.'}
    catch(e){$('#boothStatus').textContent='Camera permission was blocked. Choose an image to use the strip editor.'}
  };
  $('#pickImg').onchange=e=>{
    const file=e.target.files[0];if(!file)return;const url=URL.createObjectURL(file);
    source.onload=()=>{source.style.display='block';source.style.filter=css();v.style.display='none';$('#photoEmpty').style.display='none';$('#startStrip').disabled=false;$('#boothStatus').textContent='Image ready. Start a four-frame strip from this portrait.'};source.src=url;
  };
  $('#stripCaption').oninput=()=>{if(sticker==='writing')paintControls();renderStrip()};$('#stripColor').oninput=renderStrip;
  $('#startStrip').onclick=async()=>{
    if(busy||(!stream&&!source.naturalWidth))return;busy=true;shots=[];renderStrip();$('#startStrip').disabled=true;
    for(let index=0;index<4;index++){
      for(let seconds=3;seconds>0;seconds--){
        if(!document.body.contains(viewer)){stream?.getTracks().forEach(track=>track.stop());return}
        $('#countdown').textContent=seconds;$('#boothStatus').textContent=`Photo ${index+1} of 4 · get ready`;
        await new Promise(resolve=>setTimeout(resolve,1000));
      }
      if(!document.body.contains(viewer))return;
      const image=stream?v:source,w=stream?v.videoWidth:source.naturalWidth,h=stream?v.videoHeight:source.naturalHeight;
      if(!w||!h)continue;
      cv.width=w;cv.height=h;ctx.save();ctx.filter='none';
      if(stream){ctx.translate(w,0);ctx.scale(-1,1)}ctx.drawImage(image,0,0,w,h);ctx.restore();
      shots.push(cv.toDataURL('image/jpeg',.92));renderStrip();$('#countdown').textContent='✦';snd('click');await new Promise(resolve=>setTimeout(resolve,220));$('#countdown').textContent='';
    }
    busy=false;$('#startStrip').disabled=false;$('#boothStatus').textContent=shots.length===4?'Your strip is ready. Change the look or download it.':'Could not capture all four frames. Check the camera and try again.';
  };
  $('#clearStrip').onclick=()=>{if(busy)return;shots=[];renderStrip();$('#boothStatus').textContent='Ready for another four-photo session.'};
  $('#downloadStrip').onclick=async()=>{
    if(shots.length!==4)return;const selectedSticker=stickerSet.find(item=>item.id===sticker),stickerImage=selectedSticker?.svg?new Image():null;if(stickerImage){stickerImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(selectedSticker.svg);try{await stickerImage.decode()}catch(e){}}const paperColor=$('#stripColor').value,rgb=paperColor.slice(1).match(/.{2}/g).map(value=>parseInt(value,16)),textColor=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#263329':'#fff',canvas=document.createElement('canvas'),c=canvas.getContext('2d'),width=640,pad=24,frameH=790,gap=14,header=112,footer=100;
    canvas.width=width;canvas.height=header+pad*2+frameH*4+gap*3+footer;c.fillStyle=paperColor;c.fillRect(0,0,canvas.width,canvas.height);
    c.fillStyle=textColor;c.textAlign='center';c.font=`700 34px "${$('#captionFont').value}",sans-serif`;c.fillText($('#stripCaption').value.trim()||'PHOTO CLUB',width/2,69,600);
    for(let i=0;i<4;i++){
      const y=header+pad+i*(frameH+gap),x=pad,fw=width-pad*2;
      c.fillStyle=paperColor;c.fillRect(x-4,y-4,fw+8,frameH+8);const im=new Image();im.src=shots[i];await im.decode();
      const scale=Math.max(fw/im.width,frameH/im.height),sw=fw/scale,sh=frameH/scale,sx=(im.width-sw)/2,sy=(im.height-sh)/2;
      c.save();c.beginPath();c.rect(x,y,fw,frameH);c.clip();c.filter=css();c.drawImage(im,sx,sy,sw,sh,x,y,fw,frameH);c.filter='none';
      if(filter==='fog'){const haze=c.createRadialGradient(x+fw*.5,y+frameH*.4,frameH*.06,x+fw*.5,y+frameH*.45,frameH*.75);haze.addColorStop(0,'rgba(255,255,255,.34)');haze.addColorStop(1,'rgba(255,255,255,.03)');c.fillStyle=haze;c.fillRect(x,y,fw,frameH)}
      if(filter==='vintage'||filter==='film')boothGrain(c,x,y,fw,frameH,.12);
      if(selectedSticker?.svg&&stickerImage?.complete&&stickerImage.naturalWidth>0){{const sz=fw*.34,ar=(stickerImage.naturalHeight||1)/(stickerImage.naturalWidth||1);c.drawImage(stickerImage,x+fw*pos.x/100-sz/2,y+frameH*pos.y/100-sz*ar/2,sz,sz*ar)}}
      if(sticker==='writing'){c.fillStyle='#fffdf0';c.globalAlpha=.92;c.fillRect(x+fw*.1,y+frameH*.08,fw*.8,56);c.globalAlpha=1;c.fillStyle='#263329';c.textAlign='center';c.font=`700 28px "${$('#captionFont').value}",sans-serif`;c.fillText($('#stripCaption').value.trim()||'Your caption',x+fw/2,y+frameH*.08+38,fw*.74)}
      c.restore();
    }
    c.fillStyle=textColor;c.textAlign='center';c.font='600 16px Quicksand,sans-serif';c.fillText('ARCADE HUB  ·  PHOTO BOOTH',width/2,canvas.height-36);
    const link=document.createElement('a');link.download='arcade-photo-strip.jpg';link.href=canvas.toDataURL('image/jpeg',.94);link.click();
  };
  {const ls=$('#liveSticker');let drag=false;
   const mv=e=>{const r=viewer.getBoundingClientRect();pos.x=Math.max(8,Math.min(92,(e.clientX-r.left)/r.width*100));pos.y=Math.max(8,Math.min(92,(e.clientY-r.top)/r.height*100));ls.style.setProperty('--sx',pos.x);ls.style.setProperty('--sy',pos.y)};
   ls.onpointerdown=e=>{if(!ls.innerHTML)return;drag=true;ls.setPointerCapture(e.pointerId);ls.style.cursor='grabbing';mv(e)};
   ls.onpointermove=e=>{if(drag)mv(e)};
   ls.onpointerup=ls.onpointercancel=()=>{drag=false;ls.style.cursor='grab';renderStrip()}}
  paintControls();renderStrip();
}
