/* ---- Photo Booth shared helpers + Live Multiplayer Photo Booth ---- */
const BOOTH_NEW_STICKERS=[
 {id:'lollipop',label:'Lollipop',emoji:'🍭',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 62L38 114" stroke="#f3e9d8" stroke-width="8" stroke-linecap="round"/><circle cx="62" cy="44" r="34" fill="#ff5f9e"/><path d="M62 44a4 4 0 1 1 4 4a10 10 0 1 1-10-10a16 16 0 1 1 16 16a22 22 0 1 1-22-22a28 28 0 1 1 28 28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>'},
 {id:'cherry',label:'Cherry',emoji:'🍒',svg:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M42 82Q50 30 82 14M82 86Q84 44 82 14" stroke="#3d8b4d" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="40" cy="88" r="22" fill="#d6194b"/><circle cx="82" cy="90" r="22" fill="#e8264f"/><circle cx="33" cy="80" r="6" fill="#ff8aa6" opacity=".8"/><circle cx="75" cy="82" r="6" fill="#ff8aa6" opacity=".8"/></svg>'},
 {id:'shades',label:'Shades',emoji:'🕶️',svg:'<svg viewBox="0 0 140 70" aria-hidden="true"><rect x="6" y="12" width="56" height="40" rx="15" fill="#1b1220"/><rect x="78" y="12" width="56" height="40" rx="15" fill="#1b1220"/><path d="M62 26h16" stroke="#1b1220" stroke-width="7"/><path d="M16 22l16-3" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/><path d="M88 22l16-3" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/></svg>'},
 {id:'stache',label:'Mustache',emoji:'🥸',svg:'<svg viewBox="0 0 140 70" aria-hidden="true"><path d="M70 26c-10-14-36-16-58-2 8 26 36 30 58 8 22 22 50 18 58-8-22-14-48-12-58 2z" fill="#3a2418"/></svg>'},
 {id:'crown',label:'Crown',emoji:'👑',svg:'<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M10 78L18 20l28 28 14-34 14 34 28-28 8 58z" fill="#ffd24d" stroke="#d9a21b" stroke-width="4" stroke-linejoin="round"/><circle cx="18" cy="18" r="6" fill="#ff5fa7"/><circle cx="60" cy="12" r="6" fill="#8d6dff"/><circle cx="102" cy="18" r="6" fill="#ff5fa7"/></svg>'}
];
/* Gentle film grain + soft vignette (amount is 0..1, keep it small) */
function boothGrain(ctx,x,y,w,h,amount){
  const gw=Math.ceil(w),gh=Math.ceil(h),g=document.createElement('canvas');g.width=gw;g.height=gh;
  const gc=g.getContext('2d'),id=gc.createImageData(gw,gh);
  for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=Math.round(amount*255)}
  gc.putImageData(id,0,0);
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const vg=ctx.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*.35,x+w/2,y+h/2,Math.max(w,h)*.75);
  vg.addColorStop(0,'rgba(40,25,10,0)');vg.addColorStop(1,'rgba(40,25,10,.28)');ctx.fillStyle=vg;ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='overlay';ctx.drawImage(g,x,y,w,h);
  ctx.restore();
}
const booth={stream:null,pc:null,dc:null,sigTimer:null,polling:false,code:'',localReady:false,remoteReady:false,pending:null,iceQ:[],remoteLook:null,key:'',shots:{host:[],guest:[]},room:null,filter:'vintage',sticker:'lollipop',pos:{x:50,y:72},busy:false,loading:false,lastLook:0};
const BOOTH_FILTERS={vintage:'sepia(.9) contrast(1.18) brightness(1.03) saturate(.85)',film:'grayscale(1) contrast(1.3) brightness(1.06) sepia(.12)',none:'none',warm:'sepia(.35) saturate(1.3) brightness(1.05)',soft:'brightness(1.1) contrast(.92) saturate(1.1)'};
const boothVintage=()=>booth.filter==='vintage'||booth.filter==='film';
const boothOpp=()=>{const r=booth.room;return r?((r.role==='host'?r.guestName:r.hostName)||'Your friend'):'Your friend'};
const boothDCOpen=()=>!!(booth.dc&&booth.dc.readyState==='open');
let boothRtcCfg=null;
const boothConn=t=>{const e=$('#bmConn');if(e)e.textContent=t};
const boothSend=data=>apiJson(`/api/rooms/${encodeURIComponent(booth.code)}/signal`,{method:'POST',body:JSON.stringify({data})}).catch(()=>{});
async function boothIce(){if(boothRtcCfg)return boothRtcCfg;try{const d=await apiJson('/api/rtc-config');boothRtcCfg=d.iceServers}catch(e){boothRtcCfg=[{urls:'stun:stun.l.google.com:19302'}]}return boothRtcCfg}
function boothClosePeer(){
  try{booth.dc&&booth.dc.close()}catch(e){}try{booth.pc&&booth.pc.close()}catch(e){}
  booth.pc=null;booth.dc=null;booth.iceQ=[];
  const rv=$('#bmRVideo');if(rv){rv.srcObject=null;rv.style.display='none'}const re=$('#bmREmpty');if(re)re.style.display='grid';
}
function stopBooth(){
  clearInterval(booth.sigTimer);booth.sigTimer=null;boothClosePeer();
  if(booth.stream){booth.stream.getTracks().forEach(t=>t.stop());booth.stream=null}
  booth.localReady=false;booth.remoteReady=false;booth.pending=null;booth.remoteLook=null;booth.busy=false;booth.polling=false;
}
async function boothPeer(){
  boothClosePeer();
  const pc=new RTCPeerConnection({iceServers:await boothIce()});booth.pc=pc;
  booth.stream.getTracks().forEach(t=>pc.addTrack(t,booth.stream));
  pc.onicecandidate=e=>{if(e.candidate)boothSend({type:'ice',c:e.candidate.toJSON()})};
  pc.ontrack=e=>{const rv=$('#bmRVideo');if(!rv)return;rv.srcObject=e.streams[0];rv.style.display='block';$('#bmREmpty').style.display='none';rv.play&&rv.play().catch(()=>{})};
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;if(s==='connected')boothConn('🎥 Live with '+boothOpp()+'! Tap “Snap together”.');else if(s==='connecting')boothConn('Connecting video…');else if(s==='failed')boothConn('Video could not connect on this network. You can still take photos and they will sync.');boothUpdate()};
  pc.ondatachannel=e=>boothDC(e.channel);
  return pc;
}
function boothDC(dc){
  booth.dc=dc;
  dc.onopen=()=>{boothSendLook();boothUpdate()};dc.onclose=()=>boothUpdate();
  dc.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}if(m.t==='snap')boothRun();if(m.t==='look'){booth.remoteLook=m;boothRemoteLook()}};
}
function boothSendLook(){if(boothDCOpen())booth.dc.send(JSON.stringify({t:'look',filter:booth.filter,sticker:booth.sticker,pos:booth.pos}))}
function boothStickerSvg(el,id){const s=BOOTH_NEW_STICKERS.find(x=>x.id===id);el.innerHTML=s?s.svg:'';const svg=el.querySelector('svg');if(svg){svg.style.width='100%';svg.style.height='auto';svg.style.display='block';svg.style.filter='drop-shadow(0 2px 5px rgba(0,0,0,.4))'}}
function boothRemoteLook(){
  const l=booth.remoteLook,rv=$('#bmRVideo'),rf=$('#bmRFrame'),rl=$('#bmRLive');if(!l||!rv||!rf||!rl)return;
  rv.style.filter=BOOTH_FILTERS[l.filter]||'none';rf.dataset.filter=l.filter;boothStickerSvg(rl,l.sticker);rl.style.left=l.pos.x+'%';rl.style.top=l.pos.y+'%';
}
async function boothFlush(){const q=booth.iceQ;booth.iceQ=[];for(const c of q)try{await booth.pc.addIceCandidate(c)}catch(e){}}
async function boothOffer(){
  if(!booth.stream||!booth.remoteReady||!booth.room||booth.room.role!=='host')return;
  const pc=await boothPeer();boothDC(pc.createDataChannel('booth'));
  const o=await pc.createOffer();await pc.setLocalDescription(o);
  boothConn('Connecting video…');boothSend({type:'offer',sdp:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});
}
async function boothAnswer(d){
  const pc=await boothPeer();await pc.setRemoteDescription(d.sdp);await boothFlush();
  const a=await pc.createAnswer();await pc.setLocalDescription(a);
  boothSend({type:'answer',sdp:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});
}
async function boothSignal(m){
  const d=m.data||{};
  if(d.type==='ready'){booth.remoteReady=true;if(!booth.stream)boothConn(boothOpp()+' is ready — start your camera.');await boothOffer();return}
  if(d.type==='offer'){if(!booth.stream){booth.pending=d;boothConn(boothOpp()+' is ready — start your camera to join the video.');return}await boothAnswer(d);return}
  if(d.type==='answer'&&booth.pc){try{await booth.pc.setRemoteDescription(d.sdp)}catch(e){}await boothFlush();return}
  if(d.type==='ice'){if(booth.pc&&booth.pc.remoteDescription){try{await booth.pc.addIceCandidate(d.c)}catch(e){}}else booth.iceQ.push(d.c)}
}
async function boothPoll(){
  if(booth.polling||!booth.code)return;booth.polling=true;
  try{const d=await apiJson(`/api/rooms/${encodeURIComponent(booth.code)}/signal`);for(const m of d.messages||[])await boothSignal(m)}catch(e){}
  booth.polling=false;
}
function boothCount(n){for(const id of ['#bmCount','#bmRCount']){const e=$(id);if(!e)continue;e.style.display=n?'grid':'none';e.textContent=n||''}}
function boothPaint(room,content,code){
  booth.room=room;booth.code=code;
  if(!content.querySelector('#bmRoot')){
    stopBooth();booth.code=code;booth.key='';booth.shots={host:[],guest:[]};
    const tile=(p,label)=>`<div style="flex:1;min-width:0;max-width:250px"><div id="bm${p}Frame" class="grainy" data-filter="${booth.filter}" style="position:relative;width:100%;aspect-ratio:3/4;border-radius:6px;overflow:hidden;background:#241437"><video id="bm${p}Video" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;${p===''?'transform:scaleX(-1);':''}display:none"></video><div id="bm${p}Empty" style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;text-align:center;padding:10px;font-size:13px">${p===''?'📸 Tap “Start camera”':'Waiting for your friend…'}</div><div id="bm${p}Live" style="position:absolute;left:50%;top:72%;transform:translate(-50%,-50%);width:34%;z-index:3;${p===''?'touch-action:none;cursor:grab':'pointer-events:none'}"></div><div id="bm${p}Count" style="position:absolute;inset:0;display:none;place-items:center;color:#fff;font-size:72px;font-weight:900;text-shadow:0 4px 18px rgba(0,0,0,.5);z-index:4;pointer-events:none"></div></div><small id="bm${p}Name" style="display:block;text-align:center;margin-top:4px;font-weight:700">${label}</small></div>`;
    content.innerHTML=`<div id="bmRoot" style="display:grid;gap:12px;justify-items:center">
      <p class="online-status" id="bmConn" style="margin:6px 0;text-align:center">Start your camera to join the video booth.</p>
      <div style="display:flex;gap:10px;width:100%;max-width:520px;justify-content:center">${tile('','You')}${tile('R',esc(boothOpp()))}</div>
      <small style="color:var(--mute)">Drag your sticker where you want it.</small>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="btn ghost" id="bmCam">Start camera</button>
        <select id="bmFilter" aria-label="Filter"><option value="vintage">Vintage sepia</option><option value="film">Film B&amp;W</option><option value="none">Normal</option><option value="warm">Warm</option><option value="soft">Soft</option></select>
        <select id="bmSticker" aria-label="Sticker"><option value="">No sticker</option>${BOOTH_NEW_STICKERS.map(s=>`<option value="${s.id}">${s.emoji} ${s.label}</option>`).join('')}</select>
      </div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="btn" id="bmSnap" disabled>Snap!</button>
        <button class="btn ghost sm" id="bmReconnect">Reconnect video</button>
        <button class="btn ghost sm" id="bmClear">Retake mine</button>
        <button class="btn sm" id="bmSave" disabled>Save our photo strip</button>
      </div>
      <p class="online-status" id="bmStatus" style="margin:0"></p>
      <div id="bmStrips" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:420px"></div>
    </div>`;
    const v=$('#bmVideo'),live=$('#bmLive'),frame=$('#bmFrame');
    const place=()=>{live.style.left=booth.pos.x+'%';live.style.top=booth.pos.y+'%'};
    $('#bmFilter').value=booth.filter;$('#bmSticker').value=booth.sticker;boothStickerSvg(live,booth.sticker);place();
    $('#bmFilter').onchange=e=>{booth.filter=e.target.value;v.style.filter=BOOTH_FILTERS[booth.filter];frame.dataset.filter=booth.filter;boothSendLook()};
    $('#bmSticker').onchange=e=>{booth.sticker=e.target.value;boothStickerSvg(live,booth.sticker);boothSendLook()};
    let drag=false;const mv=e=>{const r=frame.getBoundingClientRect();booth.pos.x=Math.max(8,Math.min(92,(e.clientX-r.left)/r.width*100));booth.pos.y=Math.max(8,Math.min(92,(e.clientY-r.top)/r.height*100));place();const n=Date.now();if(n-booth.lastLook>80){booth.lastLook=n;boothSendLook()}};
    live.onpointerdown=e=>{if(!live.innerHTML)return;drag=true;live.setPointerCapture(e.pointerId);live.style.cursor='grabbing';mv(e)};
    live.onpointermove=e=>{if(drag)mv(e)};live.onpointerup=live.onpointercancel=()=>{drag=false;live.style.cursor='grab';boothSendLook()};
    $('#bmCam').onclick=async()=>{
      try{
        if(booth.stream)booth.stream.getTracks().forEach(t=>t.stop());
        booth.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:960}},audio:false});
        v.srcObject=booth.stream;v.style.display='block';v.style.filter=BOOTH_FILTERS[booth.filter];$('#bmEmpty').style.display='none';$('#bmCam').textContent='Camera on';
        booth.localReady=true;boothConn('Camera on. Waiting for '+boothOpp()+' to start theirs…');boothUpdate();
        await boothSend({type:'ready'});
        if(booth.pending){const p=booth.pending;booth.pending=null;await boothAnswer(p)}else await boothOffer();
      }catch(e){boothConn('Could not open the camera. Allow camera access in your browser settings and try again.')}
    };
    $('#bmReconnect').onclick=async()=>{boothClosePeer();if(booth.stream){boothConn('Reconnecting…');await boothSend({type:'ready'});await boothOffer()}else boothConn('Start your camera first.')};
    $('#bmSnap').onclick=()=>{if(booth.busy)return;if(boothDCOpen())booth.dc.send(JSON.stringify({t:'snap'}));boothRun()};
    $('#bmClear').onclick=async()=>{try{await apiJson(`/api/rooms/${encodeURIComponent(code)}/move`,{method:'POST',body:JSON.stringify({action:'clear'})});booth.shots[booth.room.role]=[];booth.room.counts[booth.room.role]=0;booth.key='';drawBoothStrips()}catch(e){$('#bmStatus').textContent=e.message}};
    $('#bmSave').onclick=boothSave;
    booth.sigTimer=setInterval(boothPoll,700);boothPoll();
  }
  const nameEl=$('#bmRName');if(nameEl)nameEl.textContent=boothOpp();
  boothUpdate();
  const key=room.counts.host+'-'+room.counts.guest;
  if(key!==booth.key&&!booth.loading){
    booth.loading=true;
    apiJson(`/api/rooms/${encodeURIComponent(code)}/shots`).then(d=>{booth.shots=d.shots;booth.key=key;drawBoothStrips()}).catch(()=>{}).finally(()=>{booth.loading=false});
  }
}
function boothUpdate(){
  const room=booth.room;if(!room||!$('#bmStatus'))return;
  const me=room.counts[room.role],other=room.counts[room.role==='host'?'guest':'host'];
  if(!booth.busy)$('#bmStatus').textContent=me>=4&&other>=4?'Strip complete! 🎉 Save it below.':`You ${me}/4 · ${boothOpp()} ${other}/4`;
  $('#bmSnap').disabled=!booth.stream||me>=4||booth.busy;
  $('#bmSnap').textContent=boothDCOpen()?'📸 Snap together':'Snap!';
  $('#bmSave').disabled=me+other===0;
}
function drawBoothStrips(){
  const el=$('#bmStrips'),room=booth.room;if(!el||!room)return;
  const col=(role,label)=>`<div><b style="font-size:13px">${esc(label)}</b><div style="display:grid;gap:6px;margin-top:6px;background:#efe9da;padding:6px;border-radius:4px">${[0,1,2,3].map(i=>{const src=(booth.shots[role]||[])[i];return src?`<img src="${src}" alt="Photo ${i+1}" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block">`:`<div style="aspect-ratio:3/4;border:2px dashed #cfc6b3;display:grid;place-items:center;color:#a39b88">${i+1}</div>`}).join('')}</div></div>`;
  el.innerHTML=col('host',room.hostName||'Host')+col('guest',room.guestName||'Guest');
  boothUpdate();
}
async function boothRun(){
  const v=$('#bmVideo'),room=booth.room;if(!booth.stream||booth.busy||!room)return;
  if(room.counts[room.role]>=4){$('#bmStatus').textContent='You already have four photos. Tap Retake to start over.';return}
  booth.busy=true;$('#bmSnap').disabled=true;
  for(const n of [3,2,1]){boothCount(n);await new Promise(r=>setTimeout(r,800))}
  boothCount(0);
  const W=270,H=360,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const vw=v.videoWidth||W,vh=v.videoHeight||H,scale=Math.max(W/vw,H/vh),sw=W/scale,sh=H/scale,sx=(vw-sw)/2,sy=(vh-sh)/2;
  x.save();x.translate(W,0);x.scale(-1,1);try{x.filter=BOOTH_FILTERS[booth.filter]}catch(e){}x.drawImage(v,sx,sy,sw,sh,0,0,W,H);x.restore();
  if(boothVintage())boothGrain(x,0,0,W,H,.1);
  const st=BOOTH_NEW_STICKERS.find(s=>s.id===booth.sticker);
  if(st){try{const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(st.svg);await im.decode();const sz=W*.34,ar=(im.naturalHeight||1)/(im.naturalWidth||1);x.drawImage(im,W*booth.pos.x/100-sz/2,H*booth.pos.y/100-sz*ar/2,sz,sz*ar)}catch(e){}}
  const image=c.toDataURL('image/jpeg',.6);
  try{
    await apiJson(`/api/rooms/${encodeURIComponent(booth.code)}/move`,{method:'POST',body:JSON.stringify({image})});
    (booth.shots[room.role]=booth.shots[room.role]||[]).push(image);room.counts[room.role]++;drawBoothStrips();
  }catch(e){$('#bmStatus').textContent=e.message}
  booth.busy=false;boothUpdate();
}
async function boothSave(){
  const room=booth.room;if(!room)return;
  const load=src=>new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});
  const cw=270,ch=360,pad=22,gap=14,top=70,bottom=70,W=pad*3+cw*2,H=top+bottom+ch*4+gap*3;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const vint=boothVintage();
  if(vint){x.fillStyle='#efe9da';x.fillRect(0,0,W,H)}else{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff8cc6');g.addColorStop(1,'#8d6dff');x.fillStyle=g;x.fillRect(0,0,W,H)}
  const ink=vint?'#3a2f22':'#fff';
  x.fillStyle=ink;x.textAlign='center';x.font='900 28px Georgia,serif';x.fillText('ARCADE PHOTO BOOTH',W/2,46);
  for(const [ci,role] of ['host','guest'].entries()){
    const px=pad+ci*(cw+pad);
    for(let i=0;i<4;i++){
      const py=top+i*(ch+gap),src=(booth.shots[role]||[])[i],img=src?await load(src):null;
      if(img)x.drawImage(img,px,py,cw,ch);else{x.fillStyle=vint?'rgba(0,0,0,.08)':'rgba(255,255,255,.25)';x.fillRect(px,py,cw,ch)}
    }
    x.fillStyle=ink;x.font='700 22px Georgia,serif';x.fillText((role==='host'?room.hostName:room.guestName)||'Player',px+cw/2,H-26);
  }
  c.toBlob(b=>{const a=document.createElement('a');a.download='arcade-photo-booth-duo.jpg';a.href=URL.createObjectURL(b);a.click()},'image/jpeg',.92);
}
function renderOnline(){
  if(roomPoll){clearInterval(roomPoll);roomPoll=null}
  if(activeRoomCode){renderOnlineRoom();return}
  $('#view').innerHTML=`<h2>Play with a friend</h2><p class="sub">Start a private room, send the six-letter code, and play from different devices.</p><section class="card"><b>Create an invite room</b><p class="sub">Online mode is ready for Tic-Tac-Toe, Rock-Paper-Scissors and a two-player Photo Booth.</p><div class="online-form"><select id="roomGame" aria-label="Choose an online game"><option value="ttt">Tic-Tac-Toe</option><option value="rps">Rock-Paper-Scissors</option><option value="booth">Photo Booth (2 players)</option></select><button class="btn" id="createRoom">Create room</button></div></section><section class="card"><b>Join a friend's room</b><p class="sub">Ask your friend for their six-character room code.</p><div class="online-form"><input id="joinCode" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC234" aria-label="Room code"><button class="btn" id="joinRoom">Join room</button></div><div id="onlineStatus" class="online-status" aria-live="polite"></div></section><section class="card"><b>How it works</b><p>Both players need an Arcade account and must open the same hosted Arcade site. Rooms sync through the server, so you can play from different places.</p></section>`;
  $('#joinCode').oninput=e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,'')};
  $('#createRoom').onclick=()=>openOnlineRoom($('#roomGame').value);
  $('#joinRoom').onclick=()=>joinOnlineRoom($('#joinCode').value);
}
async function openOnlineRoom(game){
  const status=$('#onlineStatus');if(status)status.textContent='Creating your invite room…';
  try{const room=await apiJson('/api/rooms',{method:'POST',body:JSON.stringify({game})});activeRoomCode=room.code;render()}
  catch(e){if(status)status.textContent=e.message;else{tab='online';activeRoomCode='';render();$('#onlineStatus').textContent=e.message}}
}
async function joinOnlineRoom(code){
  const status=$('#onlineStatus');if(!code||code.length!==6){status.textContent='Enter the six-character room code.';return}
  status.textContent='Joining room…';
  try{const room=await apiJson(`/api/rooms/${encodeURIComponent(code)}/join`,{method:'POST',body:'{}'});activeRoomCode=room.code;render()}
  catch(e){status.textContent=e.message}
}
function renderOnlineRoom(){
  const code=activeRoomCode;
  $('#view').innerHTML=`<section class="card"><div class="top"><div><b>Invite room</b><div class="room-code">${esc(code)}</div></div><button class="btn ghost" id="leaveRoom">Leave room</button></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="copyRoom">Copy code</button><span id="roomStatus" class="online-status" style="flex:1;text-align:left">Connecting to the room…</span></div><div id="roomContent"></div></section>`;
  const content=$('#roomContent');
  const paint=room=>{
    if(tab!=='online'||activeRoomCode!==code||!document.body.contains(content))return;
    const opponent=room.role==='host'?room.guestName:room.hostName;
    if(room.game==='booth'&&room.status!=='waiting'){boothPaint(room,content,code);$('#roomStatus').textContent='Connected with '+(opponent||'your friend')+'.';return}
    let html='';
    if(room.status==='waiting')html=`<div class="empty-art">Waiting for a friend to join. Share code <b>${esc(room.code)}</b>.</div>`;
    else if(room.game==='ttt'){
      const mark=room.role==='host'?'X':'O',canMove=room.status==='playing'&&room.turn===room.role;
      const message=room.status==='complete'?(room.draw?'Draw game.':room.winner===room.role?'You won! 🎉':'Your friend won this round.'):`${esc(opponent||'Your friend')} joined · ${canMove?'Your turn':'Waiting for your friend'}`;
      html=`<p class="online-status">${message}</p><div class="online-board">${room.board.map((v,i)=>`<button data-room-cell="${i}" aria-label="Square ${i+1}" ${!canMove||v?'disabled':''}>${esc(v||'')}</button>`).join('')}</div><p class="online-status">You are ${mark}. ${room.status==='complete'?'':`Room ${esc(room.code)} stays open while you play.`}</p>`;
    }else{
      const hands={rock:'🪨 Rock',paper:'📄 Paper',scissors:'✂️ Scissors'},result=room.lastResult;
      const score=`${room.scores?.[room.role]||0} – ${room.scores?.[room.role==='host'?'guest':'host']||0}`;
      let message=room.status==='complete'?(room.winner===room.role?'You won the match! 🎉':'Your friend won the match.'):`Round ${room.round} · You ${score} · first to 3`;
      if(result)message+=` · ${hands[result.host]} vs ${hands[result.guest]}${result.winner==='draw'?' — draw':result.winner===room.role?' — you score!':' — friend scores'}`;
      else if(room.myPick)message+=room.opponentReady?' · Revealing picks…':' · Pick locked in; waiting for your friend';
      html=`<p class="online-status">${message}</p>${room.status==='playing'&&!result&&!room.myPick?`<div class="row">${Object.entries(hands).map(([choice,label])=>`<button class="btn" data-room-choice="${choice}">${label}</button>`).join('')}</div>`:''}${result&&room.status==='playing'?'<div class="row"><button class="btn" id="nextRoomRound">Next round</button></div>':''}`;
    }
    content.innerHTML=html;
    if(room.game==='ttt')content.querySelectorAll('[data-room-cell]').forEach(b=>b.onclick=()=>sendRoomMove(code,{index:+b.dataset.roomCell}));
    content.querySelectorAll('[data-room-choice]').forEach(b=>b.onclick=()=>sendRoomMove(code,{choice:b.dataset.roomChoice}));
    const next=$('#nextRoomRound');if(next)next.onclick=()=>sendRoomMove(code,{action:'next'});
    $('#roomStatus').textContent=room.status==='waiting'?'Waiting for your friend…':room.status==='complete'?'Match finished.':'Connected with '+(opponent||'your friend')+'.';
  };
  const load=async()=>{try{const room=await apiJson(`/api/rooms/${encodeURIComponent(code)}`);paint(room)}catch(e){if(tab==='online'&&activeRoomCode===code&&$('#roomStatus'))$('#roomStatus').textContent=e.message}};
  const copy=$('#copyRoom');copy.onclick=async()=>{try{await navigator.clipboard.writeText(code);$('#roomStatus').textContent='Room code copied.'}catch(e){$('#roomStatus').textContent='Share this room code: '+code}};
  $('#leaveRoom').onclick=()=>{stopBooth();activeRoomCode='';if(roomPoll){clearInterval(roomPoll);roomPoll=null}render()};
  load();roomPoll=setInterval(load,1800);
}
async function sendRoomMove(code,move){
  try{await apiJson(`/api/rooms/${encodeURIComponent(code)}/move`,{method:'POST',body:JSON.stringify(move)});const room=await apiJson(`/api/rooms/${encodeURIComponent(code)}`);if(activeRoomCode===code){const status=$('#roomStatus');if(status)status.textContent=room.status==='complete'?'Match finished.':'Move sent.';renderOnlineRoomContentRefresh(room)}}
  catch(e){const status=$('#roomStatus');if(status)status.textContent=e.message}
}
function renderOnlineRoomContentRefresh(room){
  // Repaint the current game state without resetting the invite controls or polling timer.
  const code=activeRoomCode,content=$('#roomContent');if(!content||!room)return;
  const opponent=room.role==='host'?room.guestName:room.hostName;
  if(room.status==='waiting'){content.innerHTML=`<div class="empty-art">Waiting for a friend to join. Share code <b>${esc(room.code)}</b>.</div>`;return}
  if(room.game==='ttt'){
    const mark=room.role==='host'?'X':'O',canMove=room.status==='playing'&&room.turn===room.role;
    const message=room.status==='complete'?(room.draw?'Draw game.':room.winner===room.role?'You won! 🎉':'Your friend won this round.'):`${esc(opponent||'Your friend')} joined · ${canMove?'Your turn':'Waiting for your friend'}`;
    content.innerHTML=`<p class="online-status">${message}</p><div class="online-board">${room.board.map((v,i)=>`<button data-room-cell="${i}" aria-label="Square ${i+1}" ${!canMove||v?'disabled':''}>${esc(v||'')}</button>`).join('')}</div><p class="online-status">You are ${mark}. ${room.status==='complete'?'':`Room ${esc(code)} stays open while you play.`}</p>`;
    content.querySelectorAll('[data-room-cell]').forEach(b=>b.onclick=()=>sendRoomMove(code,{index:+b.dataset.roomCell}));return;
  }
  const hands={rock:'🪨 Rock',paper:'📄 Paper',scissors:'✂️ Scissors'},result=room.lastResult,score=`${room.scores?.[room.role]||0} – ${room.scores?.[room.role==='host'?'guest':'host']||0}`;
  let message=room.status==='complete'?(room.winner===room.role?'You won the match! 🎉':'Your friend won the match.'):`Round ${room.round} · You ${score} · first to 3`;
  if(result)message+=` · ${hands[result.host]} vs ${hands[result.guest]}${result.winner==='draw'?' — draw':result.winner===room.role?' — you score!':' — friend scores'}`;
  else if(room.myPick)message+=room.opponentReady?' · Revealing picks…':' · Pick locked in; waiting for your friend';
  content.innerHTML=`<p class="online-status">${message}</p>${room.status==='playing'&&!result&&!room.myPick?`<div class="row">${Object.entries(hands).map(([choice,label])=>`<button class="btn" data-room-choice="${choice}">${label}</button>`).join('')}</div>`:''}${result&&room.status==='playing'?'<div class="row"><button class="btn" id="nextRoomRound">Next round</button></div>':''}`;
  content.querySelectorAll('[data-room-choice]').forEach(b=>b.onclick=()=>sendRoomMove(code,{choice:b.dataset.roomChoice}));
  const next=$('#nextRoomRound');if(next)next.onclick=()=>sendRoomMove(code,{action:'next'});
}
async function renderChat(){
  const API=window.ARCADE_API||'';
  let mode='global',peer='',people=[],request=0;
  const token=()=>localStorage.getItem('ah_token')||'';
  const draftKey=()=>`ah_chat_draft_${myId}_${mode}_${peer}`;
  const saveDraft=()=>{try{sessionStorage.setItem(draftKey(),$('#chatInput').value)}catch(e){}};
  $('#view').innerHTML=`<div class="card feature-card chatbox"><div class="top"><b>Arcade Chat</b><span style="color:var(--mute)">Global and personal messages</span></div><div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn" id="globalMode" type="button">Global</button><button class="btn ghost" id="personalMode" type="button">Personal</button></div><label id="peerRow" style="display:none;margin:0 0 9px">Chat with <select id="chatPeer" style="margin-left:6px;max-width:70%;text-align:left"></select></label><div class="chatlog" id="chatlog" aria-live="polite"><div class="empty-art">Loading messages…</div></div><div class="composer"><input id="chatInput" maxlength="300" autocomplete="off" placeholder="Write a message"><button class="btn ghost" id="micChat" type="button">Mic</button><button class="btn" id="sendChat" type="button">Send</button></div><small id="chatStatus" style="color:var(--mute);min-height:18px"></small></div>`;
  const paintMode=()=>{
    $('#globalMode').classList.toggle('ghost',mode!=='global');$('#personalMode').classList.toggle('ghost',mode!=='personal');
    $('#peerRow').style.display=mode==='personal'?'block':'none';
    const input=$('#chatInput');try{input.value=sessionStorage.getItem(draftKey())||''}catch(e){input.value=''}
    load();
  };
  async function load(){
    const seq=++request,view=$('#view'),log=$('#chatlog');if(!log)return;
    const path=mode==='global'?'/api/chat':peer?`/api/direct/${encodeURIComponent(peer)}`:'';
    if(!path){log.innerHTML='<div class="empty-art">Choose a player to start a personal chat.</div>';return}
    try{
      const response=await fetch(API+path,{cache:'no-store',headers:mode==='global'?{}:{Authorization:'Bearer '+token()}});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not load messages.');
      if(seq!==request||!view.contains(log))return;
      const nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<48;
      const messages=data.messages||[];log.innerHTML=messages.length?messages.map(m=>`<div class="bubble ${m.senderId===myId||m.id===myId?'me':''}"><b>${esc(m.name)}</b><div>${esc(m.text)}</div></div>`).join(''):'<div class="empty-art">'+(mode==='global'?'No messages yet. Start the conversation.':'No messages yet. Say hello!')+'</div>';
      if(nearBottom)log.scrollTop=log.scrollHeight;$('#chatStatus').textContent='';
    }catch(e){if(seq===request&&view.contains(log))$('#chatStatus').textContent=e.message||'Chat is temporarily unavailable.'}
  }
  $('#chatInput').oninput=saveDraft;
  $('#chatInput').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sendChat').click()}};
  $('#sendChat').onclick=async()=>{
    const input=$('#chatInput'),text=input.value.trim();if(!text)return;
    const direct=mode==='personal';if(direct&&!peer){$('#chatStatus').textContent='Choose a player first.';return}
    $('#sendChat').disabled=true;$('#chatStatus').textContent='Sending…';
    try{
      const response=await fetch(API+(direct?`/api/direct/${encodeURIComponent(peer)}`:'/api/chat'),{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token()},body:JSON.stringify({text})});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Message could not be sent.');
      input.value='';saveDraft();$('#chatStatus').textContent='';await load();input.focus({preventScroll:true});
    }catch(e){$('#chatStatus').textContent=e.message||'Message could not be sent.'}
    finally{$('#sendChat').disabled=false}
  };
  $('#globalMode').onclick=()=>{saveDraft();mode='global';paintMode()};
  $('#personalMode').onclick=()=>{saveDraft();mode='personal';paintMode()};
  $('#micChat').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$('#chatInput').placeholder='Voice input is not supported here';return}const recognition=new SR();recognition.lang='en-IN';recognition.interimResults=false;recognition.onresult=e=>{$('#chatInput').value=($('#chatInput').value+' '+e.results[0][0].transcript).trim();saveDraft()};recognition.start()};
  $('#chatPeer').onchange=e=>{saveDraft();peer=e.target.value;paintMode()};
  load();
  try{
    const response=await fetch(API+'/api/players'),rows=await response.json();
    people=rows.filter(p=>p.id!==myId).map(p=>({id:p.id,name:p.data?.name||p.data?.username||'Player'}));
    $('#chatPeer').innerHTML='<option value="">Choose a player</option>'+people.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  }catch(e){$('#chatStatus').textContent='Could not load players.'}
  const poll=setInterval(()=>{if(!$('#chatlog'))clearInterval(poll);else load()},2200);
}

