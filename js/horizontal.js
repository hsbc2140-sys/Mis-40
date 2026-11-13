// Forzar horizontal, aunque el celular tenga la rotación bloqueada.
// 1) Si la pantalla está en vertical, la invitación entera (.app) se gira 90° con CSS (clases rot, rot-r, rot-l en <html>).
// 2) En Android, al tocar PLAY se pide pantalla completa y se bloquea la pantalla en horizontal de verdad.
// Como la .app puede estar girada, el CSS no usa vw/vh ni @media de orientación: usa --aw/--ah (ancho y alto de la .app)
// y las clases port (app en vertical, solo en computador), short (app bajita) y narrow (app angosta).
const html=document.documentElement;
const tactil=matchMedia('(pointer: coarse)').matches;
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
let giro=90;      // 90 = celular de lado con la parte de arriba hacia la izquierda; -90 = hacia la derecha
let deLado=false; // el sensor dice que el celular está de lado (Android; en iPhone el sensor pide permiso y no se usa)
function acomodar(){
  const W=innerWidth, H=innerHeight, girar=tactil && H>W;
  html.classList.toggle('rot', girar);
  html.classList.toggle('rot-r', girar && giro===90);
  html.classList.toggle('rot-l', girar && giro===-90);
  html.classList.toggle('tilt', girar && deLado);
  const aw=girar?H:W, ah=girar?W:H;
  html.style.setProperty('--aw', aw+'px'); html.style.setProperty('--ah', ah+'px');
  html.classList.toggle('port', aw<ah);
  html.classList.toggle('short', ah<=500);
  html.classList.toggle('narrow', aw<=600);
  dispatchEvent(new Event('acomodo'));
}
addEventListener('resize', acomodar);
addEventListener('orientationchange', ()=>setTimeout(acomodar,300));
acomodar();

/* ---------- sensor: hacia qué lado está el celular ---------- */
// La gravedad marca qué borde quedó arriba. Solo cambia si la posición se sostiene medio segundo.
let candidato=0, desde=0;
addEventListener('devicemotion', e=>{
  const g=e.accelerationIncludingGravity; if(!g || g.x==null) return;
  const x=ios?-g.x:g.x, y=ios?-g.y:g.y, ax=Math.abs(x);
  const lado = deLado ? ax>4 : (ax>6.5 && ax>Math.abs(y)+2);
  const nuevo = lado ? (x>0?90:-90) : 0;
  if(nuevo!==candidato){ candidato=nuevo; desde=performance.now(); return; }
  if(performance.now()-desde<500) return;
  const g2 = nuevo || giro;
  if(lado!==deLado || g2!==giro){ deLado=lado; giro=g2; acomodar(); }
});

/* ---------- bloqueo real en Android ---------- */
function bloquearHorizontal(){
  if(!/Android/i.test(navigator.userAgent) || document.fullscreenElement) return;
  try{
    const p=html.requestFullscreen({navigationUI:'hide'});
    if(p && p.then) p.then(()=>screen.orientation.lock('landscape')).catch(()=>{});
  }catch(e){}
}
