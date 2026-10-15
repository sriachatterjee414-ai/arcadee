/* Small, original SVG props shared by the game interiors. */
function scenePet(kind='rabbit',color='#fff4e9',hat=false){
  return `<svg viewBox="0 0 120 128" role="img" aria-label="${kind} customer"><g stroke="#69496d" stroke-width="3" stroke-linejoin="round">${kind==='rabbit'?'<ellipse cx="40" cy="30" rx="12" ry="27" fill="'+color+'"/><ellipse cx="80" cy="30" rx="12" ry="27" fill="'+color+'"/><path d="M40 15v28M80 15v28" stroke="#f7a8be" stroke-width="7"/>':kind==='cat'?'<path d="M22 62L16 17l34 28M70 45l34-28-6 45" fill="'+color+'"/>':'<ellipse cx="23" cy="58" rx="16" ry="29" fill="#c69a82"/><ellipse cx="97" cy="58" rx="16" ry="29" fill="#c69a82"/>'}<path d="M26 127v-20q34-28 68 0v20" fill="#b7daca"/><ellipse cx="60" cy="73" rx="43" ry="36" fill="${color}"/><g class="scene-eyes" fill="#69496d"><circle cx="44" cy="70" r="4"/><circle cx="76" cy="70" r="4"/></g><path d="M53 83q7 9 14 0" fill="none" stroke-linecap="round"/><path d="M31 82h8M81 82h8" stroke="#f5a1b8" stroke-width="7" stroke-linecap="round"/>${hat?'<path d="M30 45h60V32H30z" fill="#fff"/><path d="M33 32a14 14 0 010-24 17 17 0 0130-3 14 14 0 0124 19v8z" fill="#fff"/>':''}</g></svg>`;
}
function drinkArt(recipe={},label='Your drink'){
  const colors={Strawberry:'#f7a5bd',Mango:'#ffd182',Matcha:'#afd5a0'},tea={Taro:'#b6a0d7','Black tea':'#ac7866','Green tea':'#a3c5a0'};
  const filled=!!recipe.flavour,ice=recipe.ice==='No ice'?0:recipe.ice==='Less ice'?2:recipe.ice?4:0;
  return `<svg viewBox="0 0 140 180" role="img" aria-label="${esc(label)}"><ellipse cx="70" cy="170" rx="48" ry="6" fill="#69496d18"/><path d="M89 7L72 95" stroke="#a98cce" stroke-width="10"/><path d="M26 42h88l-10 108q-34 22-68 0z" fill="#fffdf7" stroke="#69496d" stroke-width="3"/><path d="M30 75h80l-7 72q-33 19-66 0z" fill="${filled?colors[recipe.flavour]:'#f6f1e9'}"/><path d="M37 124h66l-2 22q-31 18-62 0z" fill="${tea[recipe.tea]||'#ede5df'}" opacity=".65"/>${Array.from({length:ice},(_,i)=>`<rect x="${40+i%2*31}" y="${82+Math.floor(i/2)*23}" width="18" height="16" rx="4" fill="#fff" opacity=".65" transform="rotate(${i%2?12:-12} ${49+i%2*31} ${90+Math.floor(i/2)*23})"/>`).join('')}${recipe.topping?Array.from({length:9},(_,i)=>recipe.topping==='Boba'?`<circle cx="${45+i%4*15}" cy="${139+Math.floor(i/4)*8}" r="5" fill="#715364"/>`:`<rect x="${42+i%4*15}" y="${134+Math.floor(i/4)*8}" width="10" height="7" rx="${recipe.topping==='Jelly'?2:4}" fill="${recipe.topping==='Jelly'?'#d588b5':'#ffe39a'}"/>`).join(''):''}<path d="M26 42h88" stroke="#69496d" stroke-width="7" stroke-linecap="round"/><path d="M36 56l7 58" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round"/><circle cx="56" cy="112" r="3" fill="#69496d"/><circle cx="84" cy="112" r="3" fill="#69496d"/><path d="M65 121q5 6 10 0" fill="none" stroke="#69496d" stroke-width="2"/><path d="M46 121h5M89 121h5" stroke="#e983a5" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function towerArt(layers,enabled=true,fallen=false){
  return `<div class="tower-room ${fallen?'tower-fallen':''}"><span class="scene-window" aria-hidden="true"></span><span class="scene-plant" aria-hidden="true">✿</span><div class="tower-stack">${layers.map((row,i)=>`<div class="tower-layer" style="--shift:${i%2?5:-5}px">${row.map((present,k)=>`<button class="tower-block ${present?'':'missing'}" data-block-row="${i}" data-block-col="${k}" ${enabled&&present&&i>0&&i<layers.length-1?'':'disabled'} aria-label="Pull block ${i+1}-${k+1}"><svg viewBox="0 0 84 35" aria-hidden="true"><path d="M2 9L13 2h68v24l-11 7H2z" fill="${['#efb4bd','#c2b4e4','#b6d8ca'][k]}" stroke="#795b73" stroke-width="2"/><path d="M2 9h68l11-7M70 9v24" fill="none" stroke="#795b73" stroke-width="2"/><path d="M10 17h19M39 25h21" stroke="#fff" opacity=".45" stroke-width="2"/><circle cx="32" cy="18" r="2" fill="#795b73"/><circle cx="43" cy="18" r="2" fill="#795b73"/><path d="M35 23q3 3 6 0" fill="none" stroke="#795b73" stroke-width="1.5"/></svg></button>`).join('')}</div>`).join('')}</div><div class="tower-table"></div></div>`;
}

/* The same toy-box drawing language inside every game, without changing rules. */
function cozyCaption(id){
 const groups={
  'The little board-game club':['ttt','c4','chess','ludo','snl','rps','hilo'],
  'A pocket full of puzzles':['sudoku','wordsearch','word','math','guess','mystery','mines','hangman','slide','water','g2048','lights'],
  'Sweet treats & tiny victories':['m3','tiles','mem','tetris','jellystack','boba','cook','cafe'],
  'A little daydream adventure':['snake','bird','flappy','cloudhop','cat','golf','race','fruit','bubble','breakout','pong'],
  'Make a little magic':['sketch','photo','garden','startrail','beat','simon','react','whack','stroop','jenga']
 };
 return Object.keys(groups).find(label=>groups[label].includes(id))||'Welcome to the cozy arcade';
}
function toyMark(kind){
 const shape=kind==='X'?'<path d="M24 39C4 23 16 8 24 20c8-12 20 3 0 19" fill="#d783a7"/>':kind==='O'?'<circle cx="24" cy="25" r="16" fill="#b5d9dd"/>':kind==='star'?'<path d="m24 6 6 12 14 2-10 10 2 14-12-7-12 7 2-14L4 20l14-2z" fill="#f1d287"/>':'<path d="M10 30q-8-13 6-15 2-12 14-6 12-2 11 12 11 16-7 18H16z" fill="#c8b6e0"/>';
 return `<svg class="toy-mark" viewBox="0 0 48 48" aria-hidden="true">${shape}<g fill="#69496d"><circle cx="19" cy="25" r="1.8"/><circle cx="29" cy="25" r="1.8"/></g><path d="M22 30q2 3 4 0" fill="none" stroke="#69496d" stroke-width="1.5"/><path d="M13 30h3m16 0h3" stroke="#f2a1b9" stroke-width="3" stroke-linecap="round"/></svg>`;
}
function toyChoice(i){
 return `<svg viewBox="0 0 70 70" aria-hidden="true"><g stroke="#69496d" stroke-width="2.5" stroke-linejoin="round">${['<path d="M12 48 10 30 25 16l24 5 12 22-15 13H26z" fill="#b5d9dd"/><path d="m14 31 18 5 18-12M33 36l-7 19" opacity=".35"/>','<path d="M18 10h25l12 12v38H18z" fill="#fff9eb"/><path d="M43 10v14h12M24 48h24" fill="none"/>','<path d="m23 45 27-32M45 45 20 12" stroke="#baabd7" stroke-width="9"/><circle cx="22" cy="49" r="10" fill="#eeb7cc"/><circle cx="47" cy="49" r="10" fill="#eeb7cc"/>'][i]}</g><circle cx="29" cy="32" r="2" fill="#69496d"/><circle cx="40" cy="32" r="2" fill="#69496d"/><path d="M32 38q3 3 6 0" fill="none" stroke="#69496d" stroke-width="2"/></svg>`;
}
function sweetCandy(i){
 return `<svg viewBox="0 0 50 50" aria-hidden="true"><path d="m13 25-10-8v16zm24 0 10-8v16z" fill="#fff" opacity=".7"/><rect x="11" y="10" width="28" height="30" rx="${[12,6,14,9,5][i]}" fill="#fff" opacity=".55"/><path d="m17 17 5-2" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="25" r="2" fill="#69496d"/><circle cx="30" cy="25" r="2" fill="#69496d"/><path d="M22 31q3 3 6 0" stroke="#69496d" fill="none" stroke-width="1.5"/><text x="25" y="46" font-size="9" text-anchor="middle" fill="#69496d">${['♥','✦','♣','●','◆'][i]}</text></svg>`;
}
function chessToy(piece,symbol){
 return `<svg class="chess-toy" viewBox="0 0 40 42" aria-hidden="true"><text x="20" y="32" text-anchor="middle" font-size="36" fill="${piece===piece.toUpperCase()?'#fffbef':'#6c547d'}" stroke="#6c547d" stroke-width=".7">${symbol}</text><circle cx="17" cy="23" r="1" fill="${piece===piece.toUpperCase()?'#6c547d':'#fff5eb'}"/><circle cx="23" cy="23" r="1" fill="${piece===piece.toUpperCase()?'#6c547d':'#fff5eb'}"/></svg>`;
}
function balloonBunny(left){
 return `<rect width="120" height="140" rx="22" fill="#eef4e6"/><path d="M0 119q30-17 60 0t60 0v21H0" fill="#caddba"/>${Array.from({length:left},(_,i)=>{const x=12+i*15,y=22+(i%2)*10;return `<path d="M${x} ${y+12}Q${x+8} 75 60 100" fill="none" stroke="#ad9dbb" stroke-width=".8"/><ellipse cx="${x}" cy="${y}" rx="10" ry="13" fill="${['#edb4cb','#b9c9e6','#f2d58e'][i%3]}" stroke="#947c9c"/><path d="M${x-4} ${y-6}v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`}).join('')}<g transform="translate(34 77) scale(.43)">${scenePet('rabbit').replace(/<\/?svg[^>]*>/g,'')}</g>`;
}
function sweetFace(c,x,y,r){
 c.save();c.fillStyle='#69496d';[x-r*.34,x+r*.34].forEach(a=>{c.beginPath();c.arc(a,y-r*.1,Math.max(1,r*.13),0,7);c.fill()});c.strokeStyle='#69496d';c.lineWidth=Math.max(1,r*.1);c.beginPath();c.arc(x,y+r*.18,r*.2,0,Math.PI);c.stroke();c.fillStyle='#eb9db9';[x-r*.64,x+r*.64].forEach(a=>{c.beginPath();c.ellipse(a,y+r*.3,r*.22,r*.12,0,0,7);c.fill()});c.restore();
}
function sweetApple(c,x,y,r){
 c.save();c.fillStyle='#e996b2';c.beginPath();c.arc(x-r*.3,y,r*.7,0,7);c.arc(x+r*.3,y,r*.7,0,7);c.fill();c.strokeStyle='#82a883';c.lineWidth=2;c.beginPath();c.moveTo(x,y-r*.6);c.quadraticCurveTo(x,y-r*1.4,x+r*.6,y-r);c.stroke();sweetFace(c,x,y,r*.7);c.restore();
}
function cozyCanvas(c,w,h,kind='sky'){
 c.save();const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,kind==='garden'?'#edf4e3':kind==='road'?'#d5c6df':'#e1f1f4');bg.addColorStop(1,kind==='road'?'#c0b2d0':'#fff2e6');c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(kind==='garden'){
  c.strokeStyle='#d8e6d0';c.lineWidth=.7;for(let x=0;x<w;x+=20){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=20){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
 }else if(kind==='sky'){
  c.fillStyle='#f5d78f';c.beginPath();c.arc(w*.83,h*.15,Math.min(22,w*.06),0,7);c.fill();sweetFace(c,w*.83,h*.15,12);
  c.fillStyle='#ffffffb0';[[w*.15,h*.15],[w*.58,h*.29]].forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,25,11,0,0,7);c.ellipse(x+14,y-5,18,12,0,0,7);c.fill()});
 }else{
  c.fillStyle='#b4cba8';c.fillRect(0,0,23,h);c.fillRect(w-23,0,23,h);c.fillStyle='#f6dcac';for(let y=20;y<h;y+=65){[11,w-11].forEach(x=>{c.beginPath();c.arc(x,y,5,0,7);c.fill()})}
 }
 c.restore();
}
function toyCar(c,x,y,color){
 c.save();c.translate(x,y);c.fillStyle='#745d7c';[[-20,-22],[14,-22],[-20,14],[14,14]].forEach(([a,b])=>{c.beginPath();c.roundRect(a,b,7,15,3);c.fill()});c.fillStyle=color;c.strokeStyle='#745d7c';c.lineWidth=2;c.beginPath();c.roundRect(-18,-32,36,64,12);c.fill();c.stroke();c.fillStyle='#f0f6ef';c.beginPath();c.roundRect(-12,-16,24,20,7);c.fill();sweetFace(c,0,-6,12);c.fillStyle='#fff2bf';c.fillRect(-12,-27,6,4);c.fillRect(6,-27,6,4);c.restore();
}
