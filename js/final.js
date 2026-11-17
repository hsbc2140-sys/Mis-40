// Pista oculta: pastel, invitación (datos en FIESTA de js/contenido.js), ruleta de regalo y confeti.
/* ---------- INVITACIÓN ---------- */
[['Cuándo',FIESTA.fecha],['Hora',FIESTA.hora],['Dónde',FIESTA.lugar],['Ojo',FIESTA.nota]].forEach(([k,v])=>{
  if(!v) return;
  const dt=document.createElement('dt'), dd=document.createElement('dd');
  dt.textContent=k; dd.textContent=v; $('#inv').append(dt,dd);
});
$('#invConf').textContent=FIESTA.confirmar||'';
if(FIESTA.whatsapp){ const a=$('#rsvp'); a.href=FIESTA.whatsapp; a.hidden=false; }

/* ---------- PISTA OCULTA ---------- */
// La primera vez que se llega: confeti y una melodía de celebración; luego la ruleta gira sola.
let festejado=false;
onPage('p-final', { enter(){
  if(festejado) return; festejado=true;
  setTimeout(()=>{ party(); [523,523,587,523,698,659].forEach((f,i)=>tone(f,.3,'triangle',.06,i*.32)); },500);
  setTimeout(girar,1800);
} });

/* ---------- RULETA DEL REGALO ---------- */
// 8 casillas con "?". Cada giro da 6 vueltas y queda centrada en una casilla. Al parar sale "¡Lluvia de sobres!" con confeti.
const disco=$('#ruletaDisco'), premio=$('#premio'), DURA_GIRO=5.5;
let giroTotal=0, girando=false;
function girar(){
  if(girando) return; girando=true;
  clearTimeout(hwEspera); premio.classList.remove('show'); premio.textContent='';
  const pasos=6*8+Math.floor(Math.random()*8);       // casillas que pasan por la flecha
  giroTotal+=pasos*45; disco.style.transform=`rotate(${giroTotal}deg)`;
  // Un clic por cada casilla que pasa, cada vez más espaciados (sigue la curva del frenado).
  for(let k=1;k<=pasos;k++) tone(1400,.03,'square',.03,DURA_GIRO*(1-Math.cbrt(1-k/pasos)));
}
disco.addEventListener('transitionend', ()=>{
  if(!girando) return; girando=false;
  premio.innerHTML='¡Lluvia de sobres! 💌<img class="hw-sticker" src="images/hw-logo.png" alt="y un carro Hot Wheels">';
  premio.classList.add('show');
  [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.06,i*.13));
  const c=centroEn(premio, $('#p-final')); explosion(c.x, c.y);
  if(hwCard.hidden) hwEspera=setTimeout(mostrarHW,4000);   // 4 s después llega el segundo regalo: el Hot Wheels
});
$('#ruletaBtn').addEventListener('click', girar);
disco.addEventListener('click', girar);

/* ---------- REGALO HOT WHEELS ---------- */
// Tarjeta debajo de la ruleta: cada invitado trae un carrito para el museo de los recuerdos. Sale una vez y se queda.
const hwCard=$('#hwCard'), finPage=$('#p-final');
let hwEspera=0;
function mostrarHW(){
  if(!hwCard.hidden) return;
  hwCard.hidden=false; hwCard.parentElement.classList.add('con-hw');   // la ruleta se achica para hacerle campo
  if(pages[at].id!=='p-final') return;                                // si ya se fue de la página, sale sin sonido
  [98,131,175,233,311].forEach((f,i)=>tone(f,.16,'sawtooth',.035,i*.09));   // ¡brrrum!
  // En pantallas bajitas no cabe todo: la página baja sola hasta que se vea la tarjeta completa.
  setTimeout(()=>{
    let y=0; for(let e=hwCard; e && e!==finPage; e=e.offsetParent) y+=e.offsetTop;
    const falta=y+hwCard.offsetHeight+12-finPage.clientHeight;
    if(falta>finPage.scrollTop) finPage.scrollTo({top:falta, behavior:'smooth'});
  },650);
  setTimeout(()=>{ const c=centroEn($('.hw-logo'), finPage); explosion(c.x, c.y); },1200);
}
// "¡Cuenta conmigo!": la tarjeta se queda, el botón confirma con fiesta.
// "¡Cuenta conmigo y mi carrito!": abre el mismo WhatsApp de confirmar (FIESTA.whatsapp) y suelta confeti.
const hwOk=$('#hwOk');
if(FIESTA.whatsapp) hwOk.href=FIESTA.whatsapp;
hwOk.addEventListener('click', ()=>{
  tone(784,.12,'triangle',.05); tone(1047,.18,'triangle',.05,.1);
  const c=centroEn(hwOk, finPage); explosion(c.x, c.y);
});

/* ---------- CONFETI ---------- */
// Un solo lienzo y un solo ciclo para todo el confeti: la lluvia de bienvenida y las explosiones de la ruleta.
const COLORES=['#e8742a','#f4c900','#003a8c','#ce1126','#a6f0b0','#f2e4c0','#7fc8f8','#39ff14','#ff4fd8'];
const papelitos=[];
let confetiCorre=false;
function soltar(lista){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=$('#confetti');
  if(!confetiCorre){ c.width=c.clientWidth; c.height=c.clientHeight; }
  papelitos.push(...lista);
  if(confetiCorre) return; confetiCorre=true;
  const x=c.getContext('2d');
  (function f(){
    x.clearRect(0,0,c.width,c.height);
    for(let i=papelitos.length-1;i>=0;i--){
      const p=papelitos[i]; p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.r+=p.vr;
      if(p.y>c.height+30){ papelitos.splice(i,1); continue; }
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); x.restore();
    }
    if(papelitos.length) requestAnimationFrame(f); else { confetiCorre=false; x.clearRect(0,0,c.width,c.height); }
  })();
}
const papel=o=>({r:Math.random()*6.28,vr:(Math.random()-.5)*.3,s:5+Math.random()*6,c:COLORES[Math.random()*COLORES.length|0],...o});
// Lluvia desde arriba (bienvenida)
function party(){
  const c=$('#confetti'), w=c.clientWidth, h=c.clientHeight;
  soltar(Array.from({length:180},()=>papel({x:Math.random()*w,y:-20-Math.random()*h*.5,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,g:0})));
}
// Explosión desde un punto (el premio de la ruleta)
function explosion(x0,y0){
  soltar(Array.from({length:140},()=>{ const a=Math.random()*Math.PI*2, v=4+Math.random()*7;
    return papel({x:x0,y:y0,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,g:.18}); }));
}
