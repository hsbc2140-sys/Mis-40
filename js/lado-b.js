// Pistas 4 a 7 (2000s): chat, celular, ciber, fotos.
/* ---------- CONECTADO EN EL CHAT ---------- */
// Las ventanas (msn.png) están difuminadas hasta conectarse. "Conectar a internet" suena el módem (MODEM en js/contenido.js);
// al terminar, las ventanas se ven normal y el chat funciona encima de la ventana de conversación.
// La pista se abre (y aparece "Siguiente pista") cuando se envía un zumbido.
const log=$('#msnLog'), msnImg=$('#msnImg'), modem=new Audio('sounds/'+encodeURIComponent(MODEM));
modem.preload='none';
let conectando=false, conectado=false;
const PASOS=['Marcando <b class="num">6812337</b>...','Verificando nombre de usuario y contraseña...','Registrando su equipo en la red...'];
$('#dialBtn').addEventListener('click', async ()=>{
  if(conectando || conectado) return; conectando=true;
  $('#dialBtn').disabled=true; msnImg.classList.add('marcando');
  modem.muted=!soundOn; modem.currentTime=0; const pr=modem.play(); if(pr) pr.catch(()=>{});
  // Los mensajes y la barra avanzan con el audio (o con el reloj si el audio no carga).
  const t0=performance.now(), dur=()=>(isFinite(modem.duration) && modem.duration) || 12;
  await new Promise(fin=>{
    (function paso(){
      const t=modem.paused && modem.currentTime===0 ? (performance.now()-t0)/1000 : modem.currentTime;
      $('#dialProg').style.width=Math.min(100, t/dur()*100)+'%';
      const k=Math.min(PASOS.length-1, Math.floor(t/dur()*PASOS.length));
      if(paso.k!==k){ paso.k=k; $('#dialSay').innerHTML=PASOS[k]; }
      if(modem.ended || t>=dur()) fin(); else requestAnimationFrame(paso);
    })();
  });
  $('#dialSay').textContent='Conectado a 56,0 Kbps'; $('#dialProg').style.width='100%';
  await sleep(900);
  conectando=false; conectado=true; msnImg.classList.remove('off','marcando');
  tone(660,.1,'sine',.05); tone(990,.12,'sine',.05,.1);
  $('#chatDesc').innerHTML='¡Ya estás conectado! Escríbele a tu amigo en la ventana de conversación y oprime Send. <b>Para seguir a la siguiente pista, envíale un zumbido.</b>';
  $('#buzzBtn').hidden=false;
});
function line(html, cls=''){ const d=document.createElement('div'); d.className=cls; d.innerHTML=html; log.appendChild(d); log.scrollTop=log.scrollHeight; return d; }
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let ri=0;
$('#msnForm').addEventListener('submit', async e=>{
  e.preventDefault(); if(!conectado) return;
  const v=$('#msnInput').value.trim(); if(!v) return;
  $('#msnInput').value=''; line(`<b>Harrison</b> dice: ${esc(v)}`,'me'); tone(780,.08,'sine',.05);
  await sleep(500); const escribiendo=line('~*El Parcero*~ está escribiendo...','sys'); await sleep(1200);
  escribiendo.remove(); line(`<b>~*El Parcero*~</b> dice: ${replies[ri++%replies.length]}`); tone(660,.1,'sine',.05); tone(990,.12,'sine',.05,.1);
});
// Enter envía (Shift+Enter hace salto de línea), como en el Messenger.
$('#msnInput').addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); $('#msnForm').requestSubmit ? $('#msnForm').requestSubmit() : $('#msnForm').dispatchEvent(new Event('submit',{cancelable:true})); } });
$('#chatNext').addEventListener('click', ()=>step(1));
$('#soundBtn').addEventListener('click', ()=>{ modem.muted=!soundOn; });
cerrar('p-chat');
// Zumbido: vibración más rápida (pulsos de 40 ms) que dura 1,4 s. El primero abre la pista y muestra "Siguiente pista".
$('#buzzBtn').addEventListener('click', async ()=>{
  line('Has enviado un zumbido.','bz');
  document.body.classList.remove('buzzing'); void document.body.offsetWidth; document.body.classList.add('buzzing');
  for(let i=0;i<36;i++) tone(i%2?140:110,.04,'square',.06,i*.04);
  if($('#chatNext').hidden){ $('#buzzBtn').classList.remove('glow'); $('#chatNext').hidden=false; abrir('p-chat'); }
  await sleep(2000); line('<b>~*El Parcero*~</b> dice: ya ya, ¡no me zumbe más!');
});

/* ---------- EL PRIMER CELULAR ---------- */
// Al llegar la primera vez: el Nokia 1100 muestra su pantalla original, vibra y suena el tono (TONO_CEL en js/contenido.js).
// Al terminar se prende la pantalla de mensaje con el saldo y aparece el SMS. "Botar una perdida" abre la pista.
const sms=$('#smsTxt'), cnt=$('#smsCount'), celTxt=$('#celTxt'), n1100=$('#n1100');
let saldo=2000, celListo=false, perdiendo=false;
function upd(){ const n=sms.value.length, left=160-n; cnt.textContent = left>=0 ? `${left} caracteres libres` : `${-left} de más: serían 2 mensajes`; cnt.classList.toggle('over', left<0); }
sms.addEventListener('input', ()=>{ upd(); if(n1100.classList.contains('on')) celTxt.textContent=sms.value.length>48 ? '…'+sms.value.slice(-48) : sms.value; });
upd();
function setSaldo(){ $('#celSaldo').textContent='Saldo $'+saldo.toLocaleString('es-CO'); }
// Suena el tono: el mp3 si hay, si no el RTTTL. Termina cuando acaba el tono (o a los TONO_CEL.maximo segundos).
function sonarTono(){
  return new Promise(fin=>{
    const tope=setTimeout(fin, TONO_CEL.maximo*1000);
    if(TONO_CEL.mp3){
      const a=new Audio('sounds/'+encodeURIComponent(TONO_CEL.mp3)); a.muted=!soundOn;
      a.onended=()=>{ clearTimeout(tope); fin(); };
      setTimeout(()=>a.pause(), TONO_CEL.maximo*1000);
      const pr=a.play(); if(pr) pr.catch(()=>{ clearTimeout(tope); fin(); });
      return;
    }
    const s=rtttl(TONO_CEL.rtttl); clearTimeout(tope);
    setTimeout(fin, Math.min(s, TONO_CEL.maximo)*1000+300);
  });
}
async function celArrancar(){
  celListo=true;
  n1100.classList.add('ring'); $('#celSay').textContent='♪ ¡Está sonando el celular!';
  await sonarTono();
  n1100.classList.remove('ring'); n1100.classList.add('on'); tone(1800,.05,'square',.03);
  $('#celSay').textContent=''; $('#smsBox').hidden=false;
}
$('#smsSend').addEventListener('click', ()=>{
  const n=Math.max(1,Math.ceil(sms.value.length/160));
  if(saldo < n*150){ celTxt.innerHTML='Saldo insuficiente.<br>Haz una recarga.'; return; }
  saldo-=n*150; setSaldo(); tone(1200,.06,'square',.05); tone(1500,.06,'square',.05,.1);
  celTxt.innerHTML=`Mensaje enviado<br>(${n} SMS, $${(n*150).toLocaleString('es-CO')})`;
});
$('#perdidaBtn').addEventListener('click', async ()=>{
  if(perdiendo) return; perdiendo=true;
  celTxt.innerHTML='Llamando...<br>Parcero'; tone(425,.4,'sine',.05); await sleep(900);
  celTxt.innerHTML='Llamada realizada<br>Saldo intacto'; tone(300,.15,'square',.05);
  // La perdida ya cumplió: su botón le da el puesto a "Siguiente pista".
  if($('#celNext').hidden){ $('#perdidaBtn').hidden=true; $('#celNext').hidden=false; abrir('p-cel'); }
  perdiendo=false;
});
$('#celNext').addEventListener('click', ()=>step(1));
cerrar('p-cel');
onPage('p-cel', { enter(){ if(!celListo) celArrancar(); } });

/* ---------- EL INTERNET DE CENTRO SUBA ---------- */
// Tocar «Sin usar» (línea 3 del control) prende el PC: la línea queda igual a las activas, con la hora de inicio y el contador
// corriendo, la pantalla pasa de cyber.png a cyberwin.jpg y se abre la pista.
const ciberCtl=$('#ciberCtl');
let cbStart=0, cbInt;
// El texto de la fila sigue el tamaño de la imagen (--cw = ancho mostrado / 568).
function cbEscala(){ ciberCtl.style.setProperty('--cw', ciberCtl.clientWidth/568); }
if(window.ResizeObserver) new ResizeObserver(cbEscala).observe(ciberCtl);
addEventListener('acomodo', cbEscala); cbEscala();
const dos=n=>String(n).padStart(2,'0');
$('#sinUsar').addEventListener('click', ()=>{
  const d=new Date(), h=d.getHours();
  $('#cbIni').textContent=`${h%12||12}:${dos(d.getMinutes())}:${dos(d.getSeconds())} ${h<12?'am':'pm'}`;
  cbStart=Date.now(); ciberCtl.classList.add('activo'); $('#ciberPc').classList.add('activo');
  [400,800,1200,2100,1800].forEach((f,i)=>tone(f,.18,'square',.025,i*.18));
  cbInt=setInterval(()=>{ const s=Math.floor((Date.now()-cbStart)/1000); $('#cbCont').textContent=`${Math.floor(s/3600)}:${dos(Math.floor(s/60)%60)}:${dos(s%60)}`; },250);
  $('#cbSay').textContent='¡PC 3 asignado! El tiempo ya está corriendo, a $1.500 la hora.';
  $('#ciberNext').hidden=false; abrir('p-ciber');
});
$('#ciberNext').addEventListener('click', ()=>step(1));
cerrar('p-ciber');

/* ---------- FOTOS PARA REVELAR ---------- */
// Cada foto elegida entra, una por una, en el siguiente cuadro del rollo (cinta.png) y se ve como en el negativo.
// Subir fotos es opcional: "Siguiente pista" está siempre. Si se eligen más de 5, vuelven a empezar desde el primer cuadro.
const cuadros=[...document.querySelectorAll('#rollo .cuadro')];
let fotoN=0;
$('#photoIn').addEventListener('change', e=>{
  const files=[...e.target.files]; if(!files.length) return;
  files.slice(0,cuadros.length).forEach((f,i)=>setTimeout(()=>{
    const fr=cuadros[fotoN++%cuadros.length], img=new Image();
    img.alt='Foto revelada '+fotoN; img.src=URL.createObjectURL(f);
    img.onload=()=>{ fr.replaceChildren(img); fr.classList.add('con-foto'); tone(1800,.04,'square',.04); setTimeout(()=>img.classList.add('dev'),60); };
    $('#fotosBtn').classList.remove('glow');
  }, i*700));
  e.target.value='';
});
$('#fotosNext').addEventListener('click', ()=>step(1));
