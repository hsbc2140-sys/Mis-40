// Utilidades compartidas: selector, pausas y sonido sintetizado.
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- sonido ---------- */
let soundOn = true, ac = null;
function actx(){
  if(!soundOn) return null;
  try{ if(!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==='suspended') ac.resume(); }catch(e){ return null; }
  return ac;
}
function tone(freq, dur, type='sine', vol=.07, when=0){
  const a = actx(); if(!a) return;
  try{
    const o=a.createOscillator(), g=a.createGain(), t=a.currentTime+when;
    o.type=type; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+.05);
  }catch(e){}
}
function noiseBurst(dur=.25, vol=.05){
  const a=actx(); if(!a) return;
  try{
    const b=a.createBuffer(1, a.sampleRate*dur, a.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s=a.createBufferSource(), g=a.createGain(); g.gain.value=vol;
    s.buffer=b; s.connect(g); g.connect(a.destination); s.start();
  }catch(e){}
}
// Tono monofónico de celular viejo en formato RTTTL ("nombre:d=4,o=5,b=120:notas"), con onda cuadrada como los Nokia.
// Devuelve cuántos segundos dura.
function rtttl(txt, vol=.05){
  const [, defs, notas]=txt.split(':');
  const d={d:4,o:5,b:63};
  defs.split(',').forEach(p=>{ const [k,v]=p.trim().split('='); d[k]=+v; });
  const semis={c:-9,'c#':-8,d:-7,'d#':-6,e:-5,f:-4,'f#':-3,g:-2,'g#':-1,a:0,'a#':1,b:2};
  let t=0;
  notas.split(',').forEach(n=>{
    const m=n.trim().toLowerCase().match(/^(\d+)?([a-gp]#?)(\.?)(\d)?(\.?)$/); if(!m) return;
    let dur=(60/d.b)*4/(+(m[1]||d.d)); if(m[3]||m[5]) dur*=1.5;
    if(m[2]!=='p') tone(440*Math.pow(2,(semis[m[2]]+(+(m[4]||d.o)-4)*12)/12), dur*.9, 'square', vol, t);
    t+=dur;
  });
  return t;
}
$('#soundBtn').addEventListener('click', e=>{
  soundOn=!soundOn; e.target.textContent='Sonido: '+(soundOn?'sí':'no'); e.target.setAttribute('aria-pressed', soundOn);
});
