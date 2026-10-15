/* Small, original SVG illustrations shared by the arcade and Mochi's wardrobe. */
(function(){
 const ink='#513769',pink='#ffa9cc',mint='#a7e3ce',blue='#b8dfff',lilac='#ccbbf5',yellow='#ffe598';
 const shape=(d,fill)=>`<path d="${d}" fill="${fill}"/>`;
 const rect=(x,y,w,h,c,r=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
 const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
 const face=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" stroke="none"><g class="cute-eyes">${circle(-7,0,2.2,ink)}${circle(7,0,2.2,ink)}</g><ellipse cx="-12" cy="6" rx="4" ry="2.5" fill="#ffa4c2"/><ellipse cx="12" cy="6" rx="4" ry="2.5" fill="#ffa4c2"/><path d="M-3 6q3 4 6 0" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/></g>`;
 const star=(x,y,s=1,c=yellow)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0-14 4-5 14-4 7 3 9 13 0 8-9 13-7 3-14-4-4-5Z" fill="${c}"/>`;
 const heart=(x,y,s=1,c=pink)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 10C-28-6-14-24 0-13 14-24 28-6 0 10Z" fill="${c}"/>`;
 const hat=id=>({
  none:'',bow:`<path d="M84 38 69 33 71 53 84 46 97 53 99 33Z" fill="${pink}"/>${circle(84,42,5,'#fff1f7')}`,
  party:`<path d="M42 48 60 8 79 48Z" fill="${lilac}"/><path d="M49 33 71 36M54 21 65 24" stroke="#fff"/>${circle(60,8,5,yellow)}${circle(61,42,3,pink)}`,
  crown:`<path d="M35 49 32 29 48 39 60 22 72 39 88 29 85 49Z" fill="${yellow}"/>${circle(60,41,3,pink)}`,
  flower:[35,51,67,83].map((x,i)=>`<g transform="translate(${x} ${43-(i===1||i===2?4:0)})" stroke-width="1.5">${[-5,5].map(y=>circle(0,y,5,'#fff9ea')).join('')}${[-5,5].map(a=>circle(a,0,5,'#fff9ea')).join('')}${circle(0,0,3,yellow)}</g>`).join(''),
  shades:`<path d="M30 68h22l4 9-5 9H34ZM68 68h22l-4 18H73l-5-9" fill="${lilac}"/><path d="M53 72q7-6 15 0M34 72l9 8M74 72l9 8" stroke="#fff"/>`
 })[id]||'';
 function mochi(pet='rabbit',accessory='none',size=100){
  const ears=pet==='cat'?`<path d="M23 65 20 24 49 47M71 47 100 24 97 65" fill="#fff9f1"/><path d="m28 42-2-9 12 11m44 0 12-11-2 9" stroke="${pink}"/>`:pet==='dog'?`<ellipse cx="25" cy="60" rx="14" ry="28" fill="#d7b290"/><ellipse cx="95" cy="60" rx="14" ry="28" fill="#d7b290"/>`:`<ellipse cx="41" cy="32" rx="10" ry="25" fill="#fff" transform="rotate(-10 41 32)"/><ellipse cx="79" cy="32" rx="10" ry="25" fill="#fff" transform="rotate(10 79 32)"/><ellipse cx="41" cy="33" rx="4" ry="17" fill="${pink}" stroke="none"/><ellipse cx="79" cy="33" rx="4" ry="17" fill="${pink}" stroke="none"/>`;
  return `<svg class="cmas mochi-art" role="img" aria-label="Mochi the ${pet}${accessory==='none'?'':' wearing '+accessory}" width="${size}" height="${size}" viewBox="0 0 120 120"><g stroke="${ink}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${ears}<ellipse cx="60" cy="77" rx="42" ry="33" fill="${pet==='dog'?'#ffe8cd':'#fffdf9'}"/>${face(60,76,1.35)}${pet==='cat'?'<path d="m28 82 10 2m-10 5 10-1m44-4 10-2m-10 6 10 1"/>':''}${pet==='dog'?'<ellipse cx="60" cy="82" rx="4" ry="3" fill="#513769"/>':''}${hat(accessory)}</g></svg>`;
 }
 const tile=(x,y,n,c)=>`${rect(x,y,30,30,c,7)}<text x="${x+15}" y="${y+21}" text-anchor="middle" stroke="none" fill="${ink}" font-size="17" font-weight="700">${n}</text>`;
 const candy=(x,y,c)=>`<g transform="translate(${x} ${y})"><path d="m-14 0-12-9v18Zm28 0 12-9v18Z" fill="${c}"/>${rect(-15,-13,30,26,c,11)}${face(0,-1,.6)}</g>`;
 const cup=(boba=false)=>`<path d="M53 35h54l-6 61q-21 12-42 0Z" fill="#fffdf8"/><path d="M58 62h44l-4 31q-18 9-36 0Z" fill="${boba?pink:mint}"/><path d="m85 36 12-22" stroke="${lilac}" stroke-width="7"/>${rect(49,30,62,9,lilac,4)}${face(80,67)}${boba?[68,80,91].map((x,i)=>circle(x,91+i%2*3,3.8,ink)).join(''):''}`;
 function scene(id){
  switch(id){
   case 'snake':return `<path d="M46 87q-8-24 15-24h25q18 0 17-22" fill="none" stroke="${ink}" stroke-width="24" stroke-linecap="round"/><path d="M46 87q-8-24 15-24h25q18 0 17-22" fill="none" stroke="${mint}" stroke-width="20" stroke-linecap="round"/>${circle(102,40,14,mint)}${face(103,39,.7)}${heart(55,32,.65)}`;
   case 'flappy':case 'bird':return `${rect(112,-9,22,40,mint,4)}${rect(108,26,30,10,mint,4)}${rect(112,88,22,42,mint,4)}${rect(108,82,30,10,mint,4)}<g class="cute-float">${circle(65,59,23,pink)}<ellipse cx="51" cy="66" rx="12" ry="8" fill="#ffe3ed"/><path d="m86 58 14 7-14 5" fill="${yellow}"/>${face(68,56,.9)}<path d="m60 35 2-8 7 8" fill="${pink}"/></g>`;
   case 'ttt':return `<path d="M65 24v74m30-74v74M39 48h82M39 75h82" stroke="${lilac}" stroke-width="5"/>${heart(51,37,.6)}${circle(80,62,10,'#fff')}${star(109,87,.7)}${face(80,61,.5)}`;
   case 'm3':return `${candy(49,44,pink)}${candy(106,44,lilac)}${candy(77,86,mint)}`;
   case 'breakout':return `${[36,67,98].map((x,i)=>rect(x,28,27,13,[pink,yellow,mint][i],5)).join('')}${rect(49,46,27,13,blue,5)}${rect(80,46,27,13,lilac,5)}${circle(82,75,8,'#fff')}${rect(50,95,62,11,lilac,7)}${face(81,99,.45)}`;
   case 'rps':return `${circle(48,68,19,blue)}${rect(69,28,32,42,'#fff')}<path d="m109 63 20 28m0-28-20 28" stroke="${pink}" stroke-width="9"/>${face(48,67,.75)}${face(85,46,.65)}`;
   case 'tiles':case 'mem':return `<g transform="rotate(-12 61 61)">${rect(34,28,48,65,lilac)}${heart(58,61,.85)}</g><g transform="rotate(10 99 63)">${rect(75,33,47,64,'#fff')}${star(99,59,1,pink)}${face(99,60,.5)}</g>`;
   case 'g2048':return `${tile(43,25,'2','#fff3d2')}${tile(79,25,'4',yellow)}${tile(43,61,'8',pink)}${tile(79,61,'16',lilac)}`;
   case 'react':return `${shape('M86 17 53 68h24l-6 35 36-55H83Z',yellow)}${face(81,58,.6)}`;
   case 'math':return `${rect(45,18,70,88,lilac,14)}${rect(53,28,54,22,'#fff')}${face(80,37,.6)}${[0,1,2,3,4,5].map(i=>rect(55+i%3*18,59+Math.floor(i/3)*20,13,13,[pink,yellow,mint][i%3],4)).join('')}`;
   case 'guess':return `${circle(80,58,34,'#fff')}<text x="80" y="75" text-anchor="middle" fill="${lilac}" stroke="${ink}" font-size="53" font-weight="700">?</text>${star(119,31,.6)}`;
   case 'word':case 'wordsearch':case 'hangman':return `${tile(28,43,id==='hangman'?'P':'C',pink)}${tile(65,43,id==='wordsearch'?'A':'U',yellow)}${tile(102,43,id==='hangman'?'R':'T',mint)}<path d="M40 88q40 15 80 0" fill="none" stroke="${lilac}" stroke-width="5"/>`;
   case 'sudoku':case 'slide':return `${[0,1,2,3,4,5,6,7].map(i=>`<g transform="translate(${38+i%3*29} ${20+Math.floor(i/3)*29})">${rect(0,0,25,25,[pink,yellow,blue][i%3],5)}<text x="12.5" y="18" text-anchor="middle" stroke="none" fill="${ink}" font-weight="700" font-size="15">${i+1}</text></g>`).join('')}`;
   case 'ludo':case 'snl':return `${rect(34,16,92,92,'#fff',14)}${[0,1,2,3].map(i=>rect(40+i%2*45,22+Math.floor(i/2)*45,33,33,[pink,mint,blue,yellow][i],7)).join('')}${rect(62,43,36,36,'#fff',8)}${circle(72,53,3,ink)}${circle(88,69,3,ink)}${circle(80,61,3,ink)}`;
   case 'chess':return `${circle(80,33,14,lilac)}<path d="M67 48h26l11 40H56Z" fill="${lilac}"/>${rect(48,89,64,13,pink,6)}${face(80,64,.8)}${star(116,27,.55)}`;
   case 'tetris':case 'jenga':return `${[0,1,2,3,4,5].map(i=>rect(40+i%3*27,83-Math.floor(i/3)*27,24,24,[pink,yellow,mint,blue,lilac,pink][i],5)).join('')}${rect(67,29,24,24,mint,5)}${face(79,40,.5)}`;
   case 'bubble':return `${[[55,36,pink],[83,34,blue],[110,45,lilac],[45,66,mint],[77,64,yellow],[102,76,pink]].map(([x,y,c])=>`${circle(x,y,17,c)}${circle(x-5,y-6,4,'#ffffffb0')}`).join('')}${face(77,62,.7)}`;
   case 'water':return `${[0,1,2].map(i=>`<g transform="translate(${41+i*31} 22)"><path d="M0 0v63a11 11 0 0 0 22 0V0" fill="#fff"/>${rect(3,39-i*9,16,32+i*9,[pink,mint,lilac][i],6)}${face(11,54,.4)}</g>`).join('')}`;
   case 'simon':case 'beat':return `${[0,1,2,3].map(i=>rect(40+i%2*43,20+Math.floor(i/2)*43,37,37,[pink,mint,blue,yellow][i],13)).join('')}${face(58,37,.55)}${star(103,81,.65)}`;
   case 'whack':return `<ellipse cx="80" cy="95" rx="42" ry="10" fill="#c6a4d3"/><path d="M53 91V67a27 27 0 0 1 54 0v24Z" fill="#d9b599"/>${circle(59,47,9,'#d9b599')}${circle(101,47,9,'#d9b599')}${face(80,66,1)}${circle(80,77,4,pink)}`;
   case 'cat':return `<g transform="translate(22 0)">${mochi('cat','bow',116).replace(/<svg[^>]*>|<\/svg>/g,'')}</g>`;
   case 'photo':return `${rect(32,36,96,62,pink,15)}${rect(53,25,32,13,lilac,5)}${circle(80,66,23,'#fff')}${circle(80,66,15,blue)}${face(80,64,.7)}${circle(115,48,4,yellow)}`;
   case 'sketch':case 'stroop':return `<path d="M80 23c-40 0-58 43-28 67 12 10 29 9 28-4-1-12 11-18 24-11 26 13 29-16 11-34-10-11-22-18-35-18Z" fill="#fff2da"/>${circle(61,43,8,pink)}${circle(83,38,8,yellow)}${circle(105,50,8,mint)}${circle(52,65,7,lilac)}${face(80,64,.8)}`;
   case 'boba':return cup(true);
   case 'cook':return `<path d="M44 49a36 29 0 0 1 72 0Z" fill="${yellow}"/>${rect(40,52,80,13,mint,5)}${rect(41,65,78,14,'#c89d91',6)}${rect(43,82,74,16,yellow,8)}${face(80,37,.8)}<path d="m61 28 2-3m16-1 2-3m16 7 2-2" stroke="#fff"/>`;
   case 'fruit':return `<path d="M40 42h80a40 40 0 0 1-80 0Z" fill="${mint}"/><path d="M47 44h66a33 33 0 0 1-66 0Z" fill="${pink}"/>${face(80,56,.9)}<path d="m60 49 1 3m39-3-1 3m-29 19 2 2m17-2-2 2"/>`;
   case 'golf':return `<ellipse cx="80" cy="94" rx="50" ry="13" fill="${mint}"/><path d="M85 91V22l35 14-35 15" fill="${pink}"/>${circle(59,82,10,'#fff')}${face(59,81,.4)}`;
   case 'race':return `${rect(45,55,74,36,pink,14)}${shape('M56 55 66 35h27l18 20Z',blue)}${circle(61,92,10,lilac)}${circle(105,92,10,lilac)}${face(81,70,.9)}<path d="M26 50h15m-20 17h17m-10 17h12" stroke="${lilac}"/>`;
   case 'mystery':return `${circle(72,51,28,blue)}${circle(72,51,21,'#fff')}<path d="m92 73 22 22" stroke="${lilac}" stroke-width="12"/>${face(72,50,.9)}`;
   case 'mines':return `${circle(79,66,27,lilac)}<path d="M79 39q-3-19 17-16" fill="none"/>${star(103,21,.65,yellow)}${face(79,63,1.1)}`;
   case 'c4':return `${rect(34,21,92,80,lilac,12)}${[0,1,2,3,4,5,6,7,8].map(i=>circle(51+i%3*29,39+Math.floor(i/3)*24,9,[pink,yellow,'#fff'][i%3])).join('')}${face(80,62,.4)}`;
   case 'hilo':return `<g transform="rotate(-14 62 62)">${rect(36,25,47,69,'#fff')}${heart(59,55,.9)}</g><g transform="rotate(13 98 62)">${rect(76,25,47,69,'#fff')}${star(100,56,.9,lilac)}</g>`;
   case 'pong':return `${rect(47,23,62,10,pink,5)}${rect(47,91,62,10,lilac,5)}${circle(80,62,12,'#fff')}${face(80,61,.5)}<path d="M36 62h18m53 0h18" stroke="${mint}" stroke-dasharray="3 5"/>`;
   case 'lights':return `${star(80,57,2,yellow)}${face(80,57,1)}<path d="M80 12v-6m47 46h7m-101 0h-7" stroke="${lilac}"/>`;
   default:return `${star(80,57,2,lilac)}${face(80,57,1)}`;
  }
 }
 function game(id){
  const backgrounds={snake:'#fff0f5',flappy:'#e4f6f0',bird:'#e4f6f0',m3:'#fff0f7',breakout:'#fff6d9',ttt:'#edf3ff',photo:'#f3eaff',boba:'#fff0f5',cat:'#fff3dd'};
  return `<svg class="cute-game-art" viewBox="0 0 160 120" aria-hidden="true"><rect width="160" height="120" fill="${backgrounds[id]||['#fff0f6','#ebf8f2','#edf3ff','#fff6dc'][id.length%4]}"/><ellipse cx="80" cy="105" rx="46" ry="5" fill="#513769" opacity=".07"/><g fill="none" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><g opacity=".7" stroke="none">${star(23,26,.35,lilac)}${heart(139,89,.25,pink)}${circle(135,30,3,mint)}</g><g class="cute-scene">${scene(id)}</g></g></svg>`;
 }
 function item(item,equipment={}){
  if(item.type==='pet')return mochi(item.id,equipment.hat||'none',64);
  if(item.type==='hat')return mochi(equipment.pet||'rabbit',item.id,64);
  if(item.type==='theme'){const p=palettes[item.id]||palettes.rose;return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="5" width="56" height="54" rx="16" fill="${p[0]}" stroke="${ink}" stroke-width="2.5"/><circle cx="24" cy="26" r="11" fill="${p[3]}"/><circle cx="41" cy="36" r="13" fill="${p[4]}"/><path d="m16 47 6 4 8-6" fill="none" stroke="${ink}" stroke-width="2"/></svg>`}
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round">${rect(11,26,42,29,lilac,7)}${rect(8,19,48,12,pink,5)}<path d="M32 19v36M32 19C7 19 21-1 32 19 43-1 57 19 32 19" fill="none"/>${star(46,45,.55,yellow)}</g></svg>`;
 }
 window.CutieArt={game,mochi,item};
 render();
})();
