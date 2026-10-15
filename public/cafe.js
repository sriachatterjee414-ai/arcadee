/* Mochi Café: a complete shift, from the recipe card to the serving tray. */
GAMES.push({id:'cafe',n:'Mochi Café',e:'☕',t:'Cooking',d:'Brew little drinks and serve pastries to animal friends',h:'Read the order, add the listed ingredients in any order, then brew. Choose the matching pastry and serve. Clear the shift before closing time. Wrong orders cost a heart; reset the cup to fix a recipe before serving.'});
const CAFE_RECIPES=[
 {name:'Cloud latte',ingredients:['espresso','milk'],pastry:'croissant',color:'#d8b39c'},
 {name:'Rose cocoa',ingredients:['cocoa','milk'],pastry:'cake',color:'#d3a4b7'},
 {name:'Honey tea',ingredients:['tea','water','honey'],pastry:'croissant',color:'#e1bd7d'},
 {name:'Moon mocha',ingredients:['espresso','cocoa','milk'],pastry:'cake',color:'#bba0c1'}
];
const CAFE_LABELS={espresso:'Espresso',milk:'Milk',cocoa:'Cocoa',tea:'Tea',water:'Water',honey:'Honey',croissant:'Croissant',cake:'Berry cake'};
function createCafeShift(level=1,random=Math.random){
 const target=Math.min(8,3+Math.floor((level-1)/3)),recipes=CAFE_RECIPES.slice(0,Math.min(4,2+Math.floor(level/3)));
 const state={target,served:0,hearts:3,seconds:90+target*8,score:0,ingredients:[],pastry:null,phase:'empty',done:false,won:false,order:null};
 const next=()=>{state.order=recipes[Math.floor(random()*recipes.length)];state.ingredients=[];state.pastry=null;state.phase='empty'};
 const active=()=>!state.done;
 next();
 return {state,
  add(id){if(!active()||!Object.hasOwn(CAFE_LABELS,id)||['cake','croissant'].includes(id)||!['empty','mixing'].includes(state.phase)||state.ingredients.length>=4)return false;state.ingredients.push(id);state.phase='mixing';return true},
  reset(){if(!active()||state.phase==='brewing')return false;state.ingredients=[];state.phase='empty';return true},
  brew(){if(!active()||state.phase!=='mixing')return false;state.phase='brewing';return true},
  finishBrew(){if(!active()||state.phase!=='brewing')return false;state.phase='ready';return true},
  choosePastry(id){if(!active()||!['cake','croissant'].includes(id))return false;state.pastry=id;return true},
  serve(){
   if(!active()||state.phase!=='ready'||!state.pastry)return null;
   const match=state.ingredients.slice().sort().join(',')===state.order.ingredients.slice().sort().join(',')&&state.pastry===state.order.pastry;
   if(match){state.served++;state.score+=120+state.hearts*10;if(state.served>=state.target){state.done=true;state.won=true;state.score+=state.seconds*3}else next()}
   else{state.hearts--;if(!state.hearts)state.done=true;else{state.ingredients=[];state.phase='empty';state.pastry=null}}
   return match;
  },
  tick(){if(!active())return;state.seconds=Math.max(0,state.seconds-1);if(state.seconds===0)state.done=true}
 };
}
function cafeFood(id){
 return `<svg viewBox="0 0 100 75" aria-hidden="true"><ellipse cx="50" cy="64" rx="43" ry="7" fill="#fff9ed" stroke="#c6acba" stroke-width="2"/>${id==='cake'?'<path d="M22 32 69 19l14 21-58 19z" fill="#f3b6c9" stroke="#916b86" stroke-width="2"/><path d="m25 43 53-15M25 53l56-15" stroke="#fff5df" stroke-width="6"/><path d="M22 32 69 19l14 11-58 16z" fill="#fff5e8"/><path d="M49 25q-4-14 7-14 12 1 4 14z" fill="#dd869e"/><path d="m50 13 6-6 6 7" stroke="#8ab494" stroke-width="3" fill="none"/>':'<path d="M15 43q-4-26 23-20 13-12 27 0 28-5 21 23L69 57l-9-6-20 1-8 6z" fill="#ebc18a" stroke="#a27b82" stroke-width="2"/><path d="m37 24 6 27m19-28-5 28M21 30l9 23m49-22-8 21" stroke="#d49f6d" stroke-width="3"/>'}<circle cx="44" cy="42" r="2" fill="#69496d"/><circle cx="57" cy="39" r="2" fill="#69496d"/><path d="M49 47q4 4 7-2" fill="none" stroke="#69496d" stroke-width="2"/></svg>`;
}
function cafeCup(state){
 const color=state.ingredients.includes('cocoa')?'#be99ae':state.ingredients.includes('milk')?'#e7c4b4':state.ingredients.includes('tea')?'#d5bd84':'#b99685',filled=state.ingredients.length>0;
 return `<svg viewBox="0 0 180 185" role="img" aria-label="${filled?state.ingredients.map(id=>CAFE_LABELS[id]).join(', '):'Empty cup'}"><ellipse cx="86" cy="163" rx="72" ry="10" fill="#fdf4e5" stroke="#c4a3b8" stroke-width="2"/><path d="M131 78q49-6 31 38-11 18-29 10" fill="#fff5ee" stroke="#96758f" stroke-width="4"/><path d="M27 69h109l-7 68q-44 34-94 0z" fill="#ffecf0" stroke="#96758f" stroke-width="3"/><ellipse cx="82" cy="70" rx="54" ry="13" fill="${filled?color:'#fff9ee'}" stroke="#96758f" stroke-width="3"/>${state.ingredients.includes('milk')?'<path d="M61 70c-14-11-19 4 21 10 42-11 25-21 1-8 0-16-27-12-22-2" fill="#fff3e3"/>':''}<g fill="#69496d"><circle cx="65" cy="111" r="3"/><circle cx="98" cy="111" r="3"/></g><path d="M77 123q6 7 12 0" fill="none" stroke="#69496d" stroke-width="2"/><path d="M49 121h7m51 0h7" stroke="#eaa1ba" stroke-width="6" stroke-linecap="round"/>${state.phase==='ready'||state.phase==='brewing'?'<g class="cafe-steam" fill="none" stroke="#c8afc9" stroke-width="3" stroke-linecap="round"><path d="M62 49q-12-12 0-23t0-20M85 49q-12-12 0-23t0-20M108 49q-12-12 0-23t0-20"/></g>':''}</svg>`;
}
function cafe(){
 const shift=createCafeShift(LV),s=shift.state;
 frame('cafe',`<div class="scene-title"><small>FRESHLY BREWED HAPPINESS</small><h2>Mochi’s corner café</h2><p>A warm cup. A sweet treat. A happy little friend.</p></div><div class="scene-hud" id="cafeHud" aria-live="polite"></div><div class="cafe-room"><div class="cafe-awning" aria-hidden="true">MOCHI CAFÉ · OPEN</div><div class="cafe-service"><div class="cafe-guest" id="cafeGuest"></div><div class="cafe-ticket" id="cafeOrder"></div></div><div class="cafe-counter"><div class="cafe-machine"><span>MOCHI BREW</span><div class="cafe-machine-lights" aria-hidden="true">● ● ●</div><div id="cafeCup"></div><button class="btn" id="cafeBrew">Brew drink</button></div><div class="cafe-tray"><small>YOUR SERVING TRAY</small><div id="cafePastry"></div><b id="cafePhase"></b><div id="cafeContents"></div></div></div></div><div class="cafe-work"><section><h3>1. Mix the drink</h3><div class="cafe-ingredients" id="cafeIngredients">${['espresso','milk','cocoa','tea','water','honey'].map((id,i)=>`<button data-cafe-ingredient="${id}" style="--jar:${['#c5a191','#f4e3d0','#ba9daf','#b4c59c','#b0d5e2','#eed294'][i]}"><span class="cafe-jar" aria-hidden="true"><i>✿</i></span>${CAFE_LABELS[id]}</button>`).join('')}</div><button class="btn ghost sm" id="cafeReset">Empty cup</button></section><section><h3>2. Pick a pastry</h3><div class="cafe-pastries">${['croissant','cake'].map(id=>`<button data-cafe-pastry="${id}" aria-pressed="false">${cafeFood(id)}<span>${CAFE_LABELS[id]}</span></button>`).join('')}</div><h3>3. Make someone smile</h3><button class="btn" id="cafeServe">Serve order</button></section></div><p id="cafeMessage" class="cafe-message" role="status">Read your friend’s recipe card to get started.</p><p class="scene-tip">Add ingredients in any order · brew takes a moment · wrong orders cost a heart</p>`);
 let lastOrder=null,finished=false;
 function finish(){if(!s.done||finished)return;finished=true;end('cafe',s.won,s.won?'Every friend left with a warm cup and a smile!':s.hearts?'Closing time! Come back for another cozy shift.':'A few mixed-up orders. A fresh shift is waiting!',s.score)}
 function paint(){
  $('#cafeHud').innerHTML=`<span>Friends <b>${s.served}/${s.target}</b></span><span>Closing in <b>${s.seconds}s</b></span><span aria-label="${s.hearts} hearts">${'♥'.repeat(s.hearts)}${'♡'.repeat(3-s.hearts)}</span><span>Tips <b>${s.score}</b></span>`;
  if(lastOrder!==s.order||$('#cafeGuest').dataset.customer!==String(s.served)){
   lastOrder=s.order;$('#cafeGuest').dataset.customer=s.served;$('#cafeGuest').innerHTML=scenePet(['rabbit','cat','dog'][s.served%3])+`<b>${['Mochi','Miso','Biscuit'][s.served%3]}</b><small>Friend ${s.served+1}</small>`;
   $('#cafeOrder').innerHTML=`<small>ONE LITTLE ORDER, PLEASE</small><h3>${s.order.name}</h3><ol>${s.order.ingredients.map(id=>`<li>${CAFE_LABELS[id]}</li>`).join('')}</ol><div class="cafe-pair">${cafeFood(s.order.pastry)}<b>+ ${CAFE_LABELS[s.order.pastry]}</b></div>`;
  }
  $('#cafeCup').innerHTML=cafeCup(s);$('#cafePastry').innerHTML=s.pastry?cafeFood(s.pastry):'<span class="cafe-empty-plate">A sweet treat goes here</span>';
  $('#cafePhase').textContent={empty:'Your cup is ready to fill',mixing:'Mixing a little happiness',brewing:'Brewing… almost ready!',ready:'Warm & ready to serve'}[s.phase];
  $('#cafeContents').textContent=s.ingredients.map(id=>CAFE_LABELS[id]).join(' + ')||'No ingredients yet';
  $('#cafeBrew').disabled=s.phase!=='mixing';$('#cafeReset').disabled=s.phase==='brewing'||!s.ingredients.length;$('#cafeServe').disabled=s.phase!=='ready'||!s.pastry;
  document.querySelectorAll('[data-cafe-ingredient]').forEach(b=>b.disabled=!['empty','mixing'].includes(s.phase)||s.ingredients.length>=4);
  document.querySelectorAll('[data-cafe-pastry]').forEach(b=>b.setAttribute('aria-pressed',String(s.pastry===b.dataset.cafePastry)));
 }
 $('#cafeIngredients').onclick=e=>{const b=e.target.closest('[data-cafe-ingredient]');if(b&&shift.add(b.dataset.cafeIngredient)){snd('pour');paint()}};
 document.querySelectorAll('[data-cafe-pastry]').forEach(b=>b.onclick=()=>{shift.choosePastry(b.dataset.cafePastry);snd('pop');paint()});
 $('#cafeReset').onclick=()=>{shift.reset();paint();$('#cafeMessage').textContent='A fresh cup, ready for your recipe.'};
 $('#cafeBrew').onclick=()=>{if(!shift.brew())return;snd('pour');paint();gameTimeout(()=>{if(shift.finishBrew()){snd('ding');paint();$('#cafeMessage').textContent='Your drink is ready! Add a pastry, then serve.'}},1500)};
 $('#cafeServe').onclick=()=>{const result=shift.serve();if(result===null)return;snd(result?'ding':'buzz');if(s.done)return finish();paint();$('#cafeMessage').textContent=result?'Lovely! Your next friend is here.':'Oops! Check both the drink recipe and pastry. Try a fresh cup.'};
 gameInterval(()=>{shift.tick();if(s.done)return finish();$('#cafeHud').children[1].innerHTML=`Closing in <b>${s.seconds}s</b>`},1000);paint();
}
const beforeCafeStart=startGame;
startGame=function(id){if(id==='cafe'){beginGame();return cafe()}return beforeCafeStart(id)};
