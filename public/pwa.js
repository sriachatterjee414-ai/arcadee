/* Installation and connection UI; changing screens never interrupts a game. */
(function(){
 const standalone=matchMedia('(display-mode: standalone)');
 let installPrompt=null,installed=standalone.matches||navigator.standalone===true,registration=null,reloading=false;
 const notice=document.createElement('aside');notice.id='appNotice';notice.className='app-notice';notice.hidden=true;notice.setAttribute('role','status');
 const message=document.createElement('span'),action=document.createElement('button'),dismiss=document.createElement('button');action.className='btn sm';dismiss.className='btn sm ghost';dismiss.textContent='Dismiss';notice.append(message,action,dismiss);document.body.append(notice);
 const dialog=document.createElement('dialog');dialog.className='app-install-dialog';dialog.setAttribute('aria-labelledby','appInstallTitle');
 dialog.innerHTML='<button class="app-dialog-close" aria-label="Close install guide">×</button><img src="/icons/mochi-192.png" alt="Mochi the rabbit"><h2 id="appInstallTitle">A little arcade on your phone</h2><div id="appInstallSteps"></div><p>Your account, coins and friends stay the same. Sign in with your existing username and PIN if asked. An internet connection is needed to play.</p><button class="btn" id="appInstallConfirm">Got it</button>';
 document.body.append(dialog);dialog.querySelector('.app-dialog-close').onclick=()=>dialog.close();dialog.querySelector('#appInstallConfirm').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 function refresh(){
  document.querySelectorAll('[data-app-install]').forEach(button=>{button.textContent=installed?'App installed':installPrompt?'Install app':'Install on your phone';button.disabled=installed});
  document.querySelectorAll('[data-app-install-status]').forEach(el=>el.textContent=installed?'Your home-screen arcade is ready.':'Keep Mochi one tap away. No app store needed.');
 }
 function showHelp(){
  const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  dialog.querySelector('#appInstallSteps').innerHTML=ios?'<ol><li>Open this website in <b>Safari</b>.</li><li>Tap <b>Share</b> (the square with an arrow).</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>. If offered, keep Open as Web App on.</li></ol>':'<ol><li>Open this website in <b>Chrome</b> on Android, or another browser that supports installing apps.</li><li>Open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Confirm, then open Mochi Arcade from its new icon.</li></ol>';
  if(!window.isSecureContext){const p=document.createElement('p');p.textContent='For installation, open the live website using its secure HTTPS address.';dialog.querySelector('#appInstallSteps').append(p)}
  if(!dialog.open)dialog.showModal();
 }
 async function install(){
  if(installed)return;
  if(!installPrompt){showHelp();return}
  const prompt=installPrompt;installPrompt=null;refresh();
  try{await prompt.prompt();await prompt.userChoice}catch(e){showHelp()}
 }
 document.addEventListener('click',event=>{if(event.target.closest('[data-app-install]'))install()});
 function hideNotice(){notice.hidden=true;document.body.classList.remove('has-app-notice')}
 function connection(){
  if(!navigator.onLine){message.textContent='Connection lost. Online features will reconnect when you’re back.';action.hidden=true}
  else if(registration?.waiting){message.textContent='A fresh version of Mochi is ready. Update when you’ve finished playing.';action.hidden=false;action.textContent='Update & reload';action.onclick=()=>{if(!registration.waiting)return;reloading=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'})}}
  else{hideNotice();return}
  notice.hidden=false;document.body.classList.add('has-app-notice');
 }
 dismiss.onclick=hideNotice;
 addEventListener('offline',connection);addEventListener('online',connection);
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;refresh()});
 addEventListener('appinstalled',()=>{installed=true;installPrompt=null;refresh();if(dialog.open)dialog.close()});
 standalone.addEventListener?.('change',event=>{installed=event.matches||navigator.standalone===true;refresh()});
 window.MochiApp={card:()=>'<section class="card app-install-card"><img src="/icons/mochi-192.png" alt=""><div><h3>Mochi on your phone</h3><p data-app-install-status>Keep Mochi one tap away. No app store needed.</p><button class="btn sm" data-app-install>Install on your phone</button></div></section>',refresh};
 if('serviceWorker' in navigator&&window.isSecureContext){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)location.reload()});
  const register=async()=>{try{
   registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});connection();
   registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)connection()})});
  }catch(e){/* The website and manual installation guide remain usable. */}};
  if(document.readyState==='complete')register();else addEventListener('load',register,{once:true});
 }
 refresh();connection();
})();
