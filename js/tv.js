// El televisor: primera página después del aviso. Videos y control remoto (OFF-ON, LO, HI).
// LO y HI cambian de canal; OFF-ON apaga el TV y eso lleva al casete (js/cinta.js, portal). Al TV no se vuelve.
// OFF-ON solo funciona después de pasar por todos los canales; antes sale un aviso en la pantalla.
// Los canales se editan en js/contenido.js (CANALES)
/* ---------- TELEVISOR ---------- */
let ch=0, tvOn=true, onTV=false, zapId=0, snowing=false, osdT, nudgeT, nextT;
const vid=$('#tvVid'), crt=$('#crt'), cv=$('#snow'), cx=cv.getContext('2d'), hint=$('#tvHint'), remote=$('#remote');
const TIP_CANAL=hint.innerHTML, TIP_APAGAR='¡Viste todos los canales! Ahora apaga el TV con <b>OFF-ON</b>.';

/* ---------- canales vistos ---------- */
// La guía de arriba muestra los números de canal; se encienden a medida que se ven.
const vistos=new Set([0]);
const faltan=()=>CANALES.length-vistos.size;
function guia(){
  $('#tvGuia').innerHTML=CANALES.map((c,i)=>`<i class="${vistos.has(i)?'visto':''}${i===ch?' ahora':''}">${String(c.n).padStart(2,'0')}</i>`).join('');
}
// Aviso grande en la pantalla del TV (tipo boletín). cls: 'alto' (rojo) o 'listo' (verde).
// ms = cuánto dura; sin ms se queda puesto.
function aviso(html, cls, ms){
  const a=$('#tvAviso'); a.innerHTML=html; a.className='tv-aviso show '+cls;
  clearTimeout(aviso.t); if(ms) aviso.t=setTimeout(()=>{ a.className='tv-aviso'; },ms);
}
// Empujón: si se queda 7 s en un canal sin haber visto todos, sale "A continuación" con el próximo canal sin ver
// y el botón HI dice "¡Oprime!".
function empujar(){
  clearTimeout(nudgeT);
  if(!faltan()) return;
  nudgeT=setTimeout(()=>{
    if(!tvOn || !onTV || !faltan()) return;
    let d=1; while(vistos.has((ch+d)%CANALES.length)) d++;
    const c=CANALES[(ch+d)%CANALES.length], n=$('#nextUp');
    n.innerHTML=`A CONTINUACIÓN ▸ Canal ${String(c.n).padStart(2,'0')}: ${c.nombre} <b>· oprime HI</b>`; n.classList.add('show');
    clearTimeout(nextT); nextT=setTimeout(()=>n.classList.remove('show'),4500);
    remote.classList.add('nudge'); tone(990,.08,'sine',.04); tone(1320,.1,'sine',.04,.1);
    empujar();
  },7000);
}
function completar(){
  clearTimeout(nudgeT); $('#nextUp').classList.remove('show');
  remote.className='remote teach-pwr'; hint.innerHTML=TIP_APAGAR;
  $('#dkMsg').innerHTML='¡Listo! <b>Apaga el TV</b> con el botón OFF-ON y que empiece la fiesta ▸';
  // Franja abajo de la pantalla (no tapa el video) que se queda hasta apagar.
  aviso('¡VISTE TODOS LOS CANALES!<small>Ya puedes apagar el TV</small>','listo');
  [523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.05,i*.12));
}
function snowLoop(){
  if(!snowing) return;
  const img=cx.createImageData(cv.width,cv.height), d=img.data;
  for(let i=0;i<d.length;i+=4){ const v=Math.random()*255|0; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; }
  cx.putImageData(img,0,0); requestAnimationFrame(snowLoop);
}
function snow(on){ const was=snowing; snowing=on; cv.style.display=on?'block':'none'; if(on&&!was) snowLoop(); }
function osd(){
  const c=CANALES[ch], o=$('#osd');
  o.innerHTML=`CANAL ${String(c.n).padStart(2,'0')}<small>${c.nombre}</small>`; o.classList.add('show');
  clearTimeout(osdT); osdT=setTimeout(()=>o.classList.remove('show'),2600);
}
function tune(){
  const c=CANALES[ch];
  vid.src='videos/'+encodeURIComponent(c.archivo);
  vid.style.objectFit=c.ajuste||'cover';
}
// Si el navegador no deja sonar el video (nadie ha tocado la pantalla), arranca en silencio
// y la pantalla del TV dice "Toca aquí para oír". El primer toque en cualquier parte le pone sonido.
function muted(on){ vid.muted=on; crt.classList.toggle('muted', on); }
function playTV(){
  if(!tvOn || !onTV) return;
  muted(!soundOn);
  const pr=vid.play();
  if(pr) pr.catch(()=>{ muted(true); vid.play().catch(()=>{}); });
}
document.addEventListener('click', ()=>{
  if(onTV && tvOn && vid.muted && soundOn){ muted(false); if(vid.paused) vid.play().catch(()=>{}); }
  if(onTV) bloquearHorizontal();
}, true);
function apagar(){
  if(!tvOn) return;
  const f=faltan();
  if(f){
    aviso(`¡ESPERA!<br>Te ${f===1?'falta 1 canal espectacular':`faltan ${f} canales espectaculares`}.<small>Oprime HI y no te ${f===1?'lo':'los'} pierdas</small>`,'alto',3500);
    tone(300,.12,'square',.06); tone(300,.12,'square',.06,.18);
    remote.classList.add('nudge');
    return;
  }
  tvOn=false; zapId++; clearTimeout(nudgeT);
  $('#tvAviso').className='tv-aviso'; $('#nextUp').classList.remove('show');
  crt.classList.remove('boot'); crt.classList.add('off'); snow(false); remote.className='remote';
  tone(80,.15,'sine',.08); hint.textContent='¡Ahora sí, que empiece la fiesta!';
  setTimeout(()=>{ vid.pause(); const c=centroEn(crt, $('#p-tv')); portal('p-portada', c.x, c.y); },750);
}
async function zap(d){
  if(!tvOn) return;
  tone(120,.05,'square',.08);
  ch=(ch+d+CANALES.length)%CANALES.length; const me=++zapId;
  vid.pause(); snow(true); noiseBurst(.4,.04); tune(); osd();
  $('#nextUp').classList.remove('show'); remote.classList.remove('nudge');
  const nuevo=!vistos.has(ch); vistos.add(ch); guia();
  if(nuevo && !faltan()) completar(); else { empujar(); if(faltan()) hint.innerHTML=TIP_CANAL; }
  await sleep(450); if(me!==zapId || !tvOn) return;
  snow(false); playTV();
}
// Alto del TV (--h) según el espacio libre: TV y control lado a lado (o uno encima del otro si la app está en vertical).
// Máximo 560 px: los videos son de 640x360 y en una pantalla de computador más grande se verían borrosos.
const stage=$('.tv-stage');
function fitTV(){
  const w=stage.clientWidth, h=stage.clientHeight;
  const tvH = Math.min(560, html.classList.contains('port') ? Math.min((h-16)/1.75, w/1.4667) : Math.min(h, (w-16)/2.002));
  stage.style.setProperty('--h', Math.max(60,Math.floor(tvH))+'px');
}
if(window.ResizeObserver) new ResizeObserver(fitTV).observe(stage);
addEventListener('acomodo', fitTV);
fitTV();
function press(b){ b.classList.remove('press'); void b.offsetWidth; b.classList.add('press'); }
$('#rPwr').addEventListener('click', e=>{ press(e.currentTarget); apagar(); });
$('#rLo').addEventListener('click', e=>{ press(e.currentTarget); zap(-1); });
$('#rHi').addEventListener('click', e=>{ press(e.currentTarget); zap(1); });
vid.addEventListener('error', ()=>{ if(tvOn && vid.getAttribute('src')){ snow(true); hint.textContent='Este canal no tiene señal. Prueba con LO o HI.'; } });
// Al TV no se vuelve: al salir se suelta el video para que no siga descargando datos.
onPage('p-tv', {
  enter(){ onTV=true; tune(); crt.classList.add('boot'); tone(15000,.3,'sine',.02); playTV(); osd(); empujar(); },
  leave(){ onTV=false; clearTimeout(nudgeT); vid.pause(); vid.removeAttribute('src'); vid.load(); }
});
tune(); guia();
