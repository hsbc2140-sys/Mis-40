// Pistas 1 a 3 (90s): radio, los teléfonos naranjas, los juegos.
// La portada está en js/cinta.js
/* ---------- RADIO ---------- */
// Prender el radio → estática → jingle → canción. Durante la canción, la pantalla cuenta 5..1 y hay que oprimir REC
// entre los segundos RADIO.ventana (5 a 8). Si sale bien aparece "Siguiente pista"; si no, "Reiniciar".
// La pista queda cerrada (⏩ y deslizar no avanzan) hasta grabar bien. Los audios se editan en js/contenido.js (RADIO).
// Estados: off → tuning → dj (jingle) → song (cuenta) → window (¡ya!) → late (se pasó) · done (ya oprimió REC)
let rState='off', rTimer, rLoop, rOk=false, rShown=0;
const lcd=$('#radioLcd'), rsay=$('#radioSay'), rcount=$('#radioCount'), radio=$('#radio');
const jingle=new Audio('sounds/'+encodeURIComponent(RADIO.jingle)), cancion=new Audio('sounds/'+encodeURIComponent(RADIO.cancion));
jingle.preload=cancion.preload='none';
function sonar(a){ a.muted=!soundOn; a.currentTime=0; const pr=a.play(); if(pr) pr.catch(()=>{}); }
function rStop(){
  clearTimeout(rTimer); cancelAnimationFrame(rLoop);
  [jingle,cancion].forEach(a=>a.pause());
  radio.classList.remove('live','demo','now'); rcount.textContent=''; rcount.classList.remove('ya');
}
function rAcciones(on, restart, next){ $('#radioOn').hidden=!on; $('#radioRestart').hidden=!restart; $('#radioNext').hidden=!next; }
function rArrancar(){
  rStop(); rState='tuning'; rShown=0; rsay.textContent=''; rAcciones(false,false,rOk);
  lcd.textContent=`Sintonizando... ${RADIO.emisora}`; noiseBurst(.8,.03);
  rTimer=setTimeout(()=>{
    rState='dj'; radio.classList.add('live','demo');
    lcd.textContent='LOCUTOR: ¡Buenas tardes, Bogotá! Ya viene lo más pedido de la semana...';
    rsay.textContent='Prepárate: cuando la cuenta llegue a cero, oprime ● REC.';
    sonar(jingle);
  },800);
}
jingle.addEventListener('ended', ()=>{
  if(rState!=='dj') return;
  rState='song'; radio.classList.remove('demo');
  lcd.textContent='♪ ¡ARRANCÓ LA CANCIÓN! ♫'; sonar(cancion); vigilar();
});
// Mira el segundo de la canción: cuenta 5..1, abre la ventana para grabar y la cierra.
function vigilar(){
  const t=cancion.currentTime, [a,b]=RADIO.ventana;
  if(rState==='song'){
    if(t>=a){ rState='window'; radio.classList.add('now'); lcd.textContent='● ¡GRABA AHORA!'; rcount.textContent='¡YA!'; rcount.classList.add('ya'); tone(880,.15,'square',.05); }
    else { const n=Math.ceil(a-t); if(n!==rShown){ rShown=n; rcount.textContent=n; tone(660,.06,'square',.04); } }
  }
  if(rState==='window' && t>=b){
    rState='late'; radio.classList.remove('now'); rcount.textContent=''; rcount.classList.remove('ya');
    lcd.textContent='♪ La canción sigue sonando...'; rsay.textContent='Se te pasó el comienzo. Dale a Reiniciar y vuelve a intentarlo.';
    rAcciones(false,true,rOk);
  }
  if(rState==='song' || rState==='window') rLoop=requestAnimationFrame(vigilar);
}
// Al pasar por encima de REC (o al oprimirlo) se resaltan REC y PLAY, como cuando se graba en una grabadora de verdad.
function rArmar(){ radio.classList.remove('armed'); void radio.offsetWidth; radio.classList.add('armed'); clearTimeout(rArmar.t); rArmar.t=setTimeout(()=>radio.classList.remove('armed'),700); }
$('#radioRec').addEventListener('pointerdown', rArmar);
$('#radioRec').addEventListener('click', ()=>{
  rArmar(); tone(200,.06,'square',.06);
  if(rState==='off'){ rsay.textContent='Primero prende el radio.'; return; }
  if(rState==='done'){ if(!rOk) rsay.textContent='Dale a Reiniciar para intentarlo otra vez.'; return; }
  const st=rState; rState='done'; cancelAnimationFrame(rLoop); clearTimeout(rTimer);
  radio.classList.remove('demo','now'); rcount.textContent=''; rcount.classList.remove('ya');
  if(st==='window'){
    rOk=true; abrir('p-radio');
    lcd.textContent='Grabado: canción completa, sin locutor.'; rsay.textContent='¡Perfecto! La tengo para oírla cuando quiera...';
    [523,659,784].forEach((f,i)=>tone(f,.15,'triangle',.05,i*.15));
    rAcciones(false,false,true); return;
  }
  if(st==='late'){ lcd.textContent='Grabado: canción sin el comienzo.'; rsay.textContent='Le cortaste el inicio. Toca esperar a que la vuelvan a poner.'; }
  else { lcd.textContent='Grabado: 40% locutor, 60% canción.'; rsay.textContent='Te adelantaste: quedó la voz del locutor encima.'; jingle.pause(); radio.classList.remove('live'); }
  rAcciones(false,true,rOk);
});
// Prender: el toque desbloquea los dos audios (iPhone lo exige) y arranca.
// La canción suena al doble de volumen: pasa por una ganancia x2 y un limitador para que no se distorsione.
// Solo en la página publicada (http/https): abierta con doble clic (file://) el navegador la dejaría muda, así que ahí suena normal.
let cancionGain=null;
function amplificarCancion(){
  if(cancionGain || !/^https?:$/.test(location.protocol)) return;
  const ctx=actx(); if(!ctx) return;
  try{
    const lim=ctx.createDynamicsCompressor();
    lim.threshold.value=-3; lim.knee.value=0; lim.ratio.value=20; lim.attack.value=.003; lim.release.value=.1;
    cancionGain=ctx.createGain(); cancionGain.gain.value=2;
    ctx.createMediaElementSource(cancion).connect(cancionGain).connect(lim).connect(ctx.destination);
  }catch(e){ cancionGain=null; }
}
$('#radioOn').addEventListener('click', ()=>{
  [jingle,cancion].forEach(a=>{ a.preload='auto'; const pr=a.play(); a.pause(); if(pr) pr.catch(()=>{}); });
  amplificarCancion(); rArrancar();
});
// Botón invisible en la cuenta: tocar el "¡YA!" hace exactamente lo mismo que la tecla roja REC.
$('#radioCount').addEventListener('click', ()=>$('#radioRec').click());
$('#radioRestart').addEventListener('click', rArrancar);
$('#radioNext').addEventListener('click', ()=>step(1));
$('#soundBtn').addEventListener('click', ()=>{ jingle.muted=cancion.muted=!soundOn; if(cancionGain) cancionGain.gain.value=soundOn?2:0; });
cerrar('p-radio');
onPage('p-radio', {
  enter(){ if(cancion.preload==='none'){ cancion.preload='auto'; cancion.load(); } },
  leave(){ rStop(); rState='off'; lcd.textContent='Casete virgen de 90 minutos listo.'; rsay.textContent=''; rAcciones(true,false,rOk); }
});

/* ---------- LOS TELÉFONOS NARANJAS ---------- */
// Echar la ficha: la moneda vuela hasta la ranura del teléfono de la foto, suena el tono y sale la pregunta.
// A los 3 s aparece "Siguiente pista" (la pista está cerrada hasta entonces).
let calling=false;
$('#fichaBtn').addEventListener('click', async ()=>{
  if(calling) return; calling=true;
  const foto=$('#telFoto'), s=$('#callSay'), b=$('#fichaBtn');
  b.disabled=true; s.textContent='';
  foto.classList.remove('cae','llamando','preguntando'); void foto.offsetWidth; foto.classList.add('cae');
  tone(1200,.05,'square',.03);
  await sleep(950); tone(1400,.08,'square',.05); tone(1900,.06,'square',.04,.08);
  b.hidden=true; foto.classList.add('llamando');
  for(let i=0;i<2;i++){ tone(425,.9,'sine',.1); s.textContent='Tuuu... '+'tuuu... '.repeat(i); await sleep(1300); }
  s.textContent=''; foto.classList.add('preguntando'); tone(660,.12,'triangle',.05); tone(880,.2,'triangle',.05,.12);
  await sleep(3000);
  abrir('p-tel'); $('#telNext').hidden=false; calling=false;
});
$('#telNext').addEventListener('click', ()=>step(1));
cerrar('p-tel');

/* ---------- LOS JUEGOS ---------- */
// Carrusel con JUEGOS (js/contenido.js). Pasa solo cada 3,5 s; también con las flechas o deslizando.
// Al pasar por todos sale la pregunta final y "Siguiente pista" (la pista está cerrada hasta entonces).
let jAt=0, jT;
const jVistos=new Set([0]), slides=$('#slides'), carDots=$('#carDots');
slides.innerHTML=JUEGOS.map((j,i)=>`<figure class="slide"><img src="images/${encodeURIComponent(j.img)}" alt="${j.nombre}" draggable="false"><figcaption>${j.nombre}</figcaption></figure>`).join('');
carDots.innerHTML=JUEGOS.map(()=>'<i></i>').join('');
function jMostrar(){
  slides.style.transform=`translateX(${-jAt*100}%)`;
  [...slides.children].forEach((s,i)=>s.classList.toggle('on', i===jAt));
  [...carDots.children].forEach((d,i)=>{ d.classList.toggle('on', i===jAt); d.classList.toggle('visto', jVistos.has(i)); });
  $('#carPrev').disabled = jAt===0;
  $('#carNext').disabled = jAt===JUEGOS.length-1;
}
function jAuto(){ clearTimeout(jT); if(jAt<JUEGOS.length-1) jT=setTimeout(()=>jIr(1),3500); }
function jFin(){
  if(!$('#juegosPregunta').hidden) return;
  $('#juegosAviso').hidden=true; $('#carrusel').classList.remove('guiar');
  $('#juegosPregunta').hidden=false; $('#juegosNext').hidden=false; abrir('p-juegos');
  [523,659,784].forEach((f,i)=>tone(f,.15,'triangle',.05,i*.13));
}
function jIr(d){
  const k=jAt+d; if(k<0 || k>=JUEGOS.length) return;
  jAt=k; jVistos.add(k); tone(d>0?880:660,.06,'square',.03); jMostrar();
  if(jVistos.size===JUEGOS.length) jFin();
  jAuto();
}
$('#carPrev').addEventListener('click', ()=>jIr(-1));
$('#carNext').addEventListener('click', ()=>jIr(1));
deslizar($('#carrusel'), jIr);
$('#juegosNext').addEventListener('click', ()=>step(1));
cerrar('p-juegos');
onPage('p-juegos', { enter(){ jAuto(); }, leave(){ clearTimeout(jT); } });
jMostrar();