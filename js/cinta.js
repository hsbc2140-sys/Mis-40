// La cinta: aviso para girar el celular, páginas, reproductor de abajo, paso del TV al casete y portada.
// Cada <section class="page"> es una página. data-side dice dónde va (intro = el TV, 0 = portada, cinta = las pistas)
// y data-label lo que muestra el reproductor. Las pistas van seguidas, de la 1 a la pista oculta.
// Orden: aviso → TV → (apagar el TV) → portada → pistas. Al TV no se vuelve.

/* ---------- AVISO: GIRAR EL CELULAR ---------- */
// "De lado" = la pantalla está en horizontal, o el sensor dice que el celular ya está de lado (ver js/horizontal.js).
const rot=$('#rotate');
let rotLeft=15, rotInt;
function rotCheck(){ rot.classList.toggle('land', !tactil || innerWidth>=innerHeight || html.classList.contains('tilt')); }
addEventListener('acomodo', rotCheck);
rotCheck();
// En computador (sin pantalla táctil) el aviso no pide girar: pide subir el volumen.
if(!tactil){ rot.classList.add('pc'); $('#rotTitle').textContent='Sube el volumen'; }
// Al cerrar el aviso arranca la primera página (el TV).
function rotClose(){
  if(rot.classList.contains('gone')) return;
  clearInterval(rotInt); rot.classList.add('gone'); setTimeout(()=>{ rot.hidden=true; },500);
  const h=hooks[pages[at].id]; if(h && h.enter) h.enter();
}
rotInt=setInterval(()=>{ rotLeft--; $('#rotNum').textContent=rotLeft; if(rotLeft<=0) rotClose(); },1000);
// Tocar "Continuar" es el gesto que deja sonar el video y, en Android, bloquear la pantalla en horizontal.
$('#rotGo').addEventListener('click', ()=>{ bloquearHorizontal(); unlockMedia(); rotClose(); });

/* ---------- PÁGINAS ---------- */
// Otras secciones se enganchan con onPage('id-de-la-page', {enter(){...}, leave(){...}}).
const pages=[...document.querySelectorAll('.page')], hooks={};
let at=0, moving=false;
function onPage(id, h){ hooks[id]=h; }
const sideOf = p => pages.filter(x=>x.dataset.side===p.dataset.side);
function show(i, dir=1){
  if(i===at || i<0 || moving) return;
  moving=true;
  const from=pages[at], to=pages[i];
  if(hooks[from.id] && hooks[from.id].leave) hooks[from.id].leave();
  from.classList.add(dir>0?'out-l':'out-r'); to.classList.add('on', dir>0?'in-r':'in-l'); to.scrollTop=0;
  at=i; deck(dir);
  if(hooks[to.id] && hooks[to.id].enter) hooks[to.id].enter();
  setTimeout(()=>{ from.classList.remove('on','out-l','out-r'); to.classList.remove('in-r','in-l'); moving=false; },450);
}
const goPage = (id, dir) => show(pages.indexOf(document.getElementById(id)), dir);
// Una pista cerrada no deja avanzar (⏩, deslizar, flechas) hasta que se complete: cerrar(id) / abrir(id).
const cerradas=new Set();
function cerrar(id){ cerradas.add(id); if(pages[at].id===id) deck(); }
function abrir(id){ cerradas.delete(id); if(pages[at].id===id) deck(); }
function step(d){
  const p=pages[at], list=sideOf(p), k=list.indexOf(p)+d;
  if(p.dataset.side!=='cinta' || k<0 || k>=list.length || (d>0 && cerradas.has(p.id))) return;
  tone(d>0?900:700,.3,'sawtooth',.02); noiseBurst(.25,.02);
  show(pages.indexOf(list[k]), d);
}

/* ---------- DEL TV AL CASETE ---------- */
// Al apagar el TV queda un punto de luz. La sala se va "hacia adentro" de ese punto
// mientras el punto se abre en un círculo de luz que deja ver el casete.
// (x, y) = centro de la pantalla del TV en coordenadas de la página (sirve igual con la .app girada).
function centroEn(el, page){
  let x=el.offsetWidth/2, y=el.offsetHeight/2;
  for(let n=el; n && n!==page; n=n.offsetParent){ x+=n.offsetLeft; y+=n.offsetTop; }
  return {x, y};
}
function portal(id, x, y){
  if(moving) return;
  const from=pages[at], to=document.getElementById(id);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !to.animate){ show(pages.indexOf(to), 1); return; }
  moving=true;
  if(hooks[from.id] && hooks[from.id].leave) hooks[from.id].leave();
  const W=from.clientWidth, H=from.clientHeight, R=Math.ceil(Math.hypot(Math.max(x,W-x), Math.max(y,H-y)));
  const ease='cubic-bezier(.65,0,.35,1)';
  to.classList.add('on'); to.scrollTop=0; at=pages.indexOf(to); deck(1);
  // La sala se mete en el punto de luz.
  from.style.transformOrigin=`${x}px ${y}px`;
  const zoom=from.animate([{transform:'scale(1)',opacity:1},{transform:'scale(9)',opacity:0}],{duration:1100,easing:'cubic-bezier(.55,0,.75,.4)',fill:'forwards'});
  // El punto se abre como ventana al casete, con un anillo de luz en el borde.
  const clip=to.animate([{clipPath:`circle(0px at ${x}px ${y}px)`},{clipPath:`circle(${R}px at ${x}px ${y}px)`}],{duration:1150,delay:300,easing:ease,fill:'backwards'});
  const ring=document.createElement('div'); ring.className='portal-ring';
  ring.style.cssText=`left:${x}px;top:${y}px;width:${R*2}px;height:${R*2}px`; $('#tape').appendChild(ring);
  ring.animate([{transform:'translate(-50%,-50%) scale(0)',opacity:1},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:1150,delay:300,easing:ease,fill:'both'});
  const cas=to.querySelector('.cover-cas');
  if(cas) cas.animate([{transform:'scale(.35) rotate(-28deg)',opacity:0},{opacity:1,offset:.4},{transform:'none',opacity:1}],{duration:1300,delay:350,easing:'cubic-bezier(.2,1.3,.4,1)',fill:'backwards'});
  [330,440,554,659,880].forEach((f,i)=>tone(f,.35,'triangle',.04,.3+i*.11)); noiseBurst(.6,.02);
  clip.onfinish=()=>{
    from.classList.remove('on'); zoom.cancel(); from.style.transformOrigin=''; ring.remove(); moving=false;
    if(hooks[to.id] && hooks[to.id].enter) hooks[to.id].enter();
  };
}

/* ---------- REPRODUCTOR ---------- */
// En el TV la barra solo muestra el aviso de apagarlo; con el casete aparecen los controles.
const bar=$('#deckbar');
let deckT;
function deck(dir=0){
  const p=pages[at], s=p.dataset.side, cover=s!=='cinta', list=sideOf(p), k=list.indexOf(p);
  const pr = cover ? 0 : k/(list.length-1);
  bar.classList.toggle('intro', s==='intro');
  $('#dkProg').style.width = pr*100+'%';
  bar.style.setProperty('--p', pr);
  $('#prevBtn').disabled = cover || k===0;
  $('#nextBtn').disabled = cover || k===list.length-1 || cerradas.has(p.id);
  if(dir){ bar.classList.remove('ff','rw'); void bar.offsetWidth; bar.classList.add(dir>0?'ff':'rw');
    clearTimeout(deckT); deckT=setTimeout(()=>bar.classList.remove('ff','rw'),700); }
}
$('#prevBtn').addEventListener('click', ()=>step(-1));
$('#nextBtn').addEventListener('click', ()=>step(1));
document.addEventListener('keydown', e=>{
  if(e.target.closest('input,textarea') || !rot.hidden) return;
  if(e.key==='ArrowRight') step(1);
  if(e.key==='ArrowLeft') step(-1);
});
// Deslizar con el dedo sobre un elemento: fn(1) al deslizar hacia la izquierda (siguiente), fn(-1) hacia la derecha.
// ignorar = selector de zonas donde no cuenta (campos de texto, carruseles con su propio deslizar...).
function deslizar(el, fn, ignorar){
  let x0=null, y0=0;
  el.addEventListener('touchstart', e=>{
    if(ignorar && e.target.closest(ignorar)){ x0=null; return; }
    x0=e.touches[0].clientX; y0=e.touches[0].clientY;
  },{passive:true});
  el.addEventListener('touchend', e=>{
    if(x0===null) return;
    let dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null;
    // Si la .app está girada, lo que la persona ve como horizontal es vertical en la pantalla.
    if(html.classList.contains('rot-r')) [dx,dy]=[dy,-dx];
    if(html.classList.contains('rot-l')) [dx,dy]=[-dy,dx];
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) fn(dx<0?1:-1);
  });
}
// Deslizar sobre la página cambia de pista.
deslizar($('#tape'), step, 'input,textarea,.remote,.carrusel');

/* ---------- PORTADA ---------- */
// Un toque del usuario "desbloquea" los videos para que luego puedan sonar (iPhone lo exige).
function unlockMedia(){
  document.querySelectorAll('video').forEach(v=>{ const pr=v.play(); v.pause(); if(pr) pr.catch(()=>{}); });
}
$('#playBtn').addEventListener('click', async ()=>{
  if(moving) return;
  bloquearHorizontal(); tone(180,.08,'square',.06);
  const c=$('#p-portada'); c.classList.add('playing');
  await sleep(1300); goPage('p-radio', 1);
  setTimeout(()=>c.classList.remove('playing'),500);
});

deck();
