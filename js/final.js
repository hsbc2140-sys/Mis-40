// Pista oculta: pastel, invitación (datos en FIESTA de js/contenido.js) y confeti al llegar.
/* ---------- INVITACIÓN ---------- */
[['Cuándo',FIESTA.fecha],['Hora',FIESTA.hora],['Dónde',FIESTA.lugar],['Ojo',FIESTA.nota]].forEach(([k,v])=>{
  if(!v) return;
  const dt=document.createElement('dt'), dd=document.createElement('dd');
  dt.textContent=k; dd.textContent=v; $('#inv').append(dt,dd);
});
$('#invConf').textContent=FIESTA.confirmar||'';
if(FIESTA.whatsapp){ const a=$('#rsvp'); a.href=FIESTA.whatsapp; a.hidden=false; }

/* ---------- PISTA OCULTA ---------- */
// La primera vez que se llega: confeti y una melodía de celebración.
let festejado=false;
onPage('p-final', { enter(){
  if(festejado) return; festejado=true;
  setTimeout(()=>{ party(); [523,523,587,523,698,659].forEach((f,i)=>tone(f,.3,'triangle',.06,i*.32)); },500);
} });
function party(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=$('#confetti'), x=c.getContext('2d'); c.width=c.clientWidth; c.height=c.clientHeight;
  const cols=['#e8742a','#f4c900','#003a8c','#ce1126','#a6f0b0','#f2e4c0','#7fc8f8'];
  const P=Array.from({length:180},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6.28,s:5+Math.random()*6,c:cols[Math.random()*cols.length|0]}));
  const t0=performance.now();
  (function f(t){ x.clearRect(0,0,c.width,c.height);
    P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.r+=.1; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); x.restore(); });
    if(t-t0<5000) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height); })(t0);
}
