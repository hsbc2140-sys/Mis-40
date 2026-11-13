// CONTENIDO EDITABLE
// Aquí están los datos de la fiesta, los videos del TV, los audios, los juegos y las respuestas del chat.
// Cambia los textos sin tocar la estructura.
// Nombres de archivo: en minúsculas, sin espacios, tildes ni símbolos (el servidor distingue mayúsculas), y que no empiecen por "_".

/* Datos de la fiesta (pista oculta). Lo que quede vacío ('') no se muestra.
   whatsapp = enlace completo de WhatsApp para confirmar (wa.me con el mensaje ya escrito). Si está vacío no sale el botón. */
const FIESTA = {
  fecha: '12 de diciembre de 2026',
  hora: '3:00 p.m. A esta hora empezamos y no quiero que te pierdas nada...',
  lugar: 'Torre Imperio Business Center. Cajicá, Cundinamarca.',
  nota: 'Llega a la hora indicada, por fa...',
  confirmar: 'Confirma tu asistencia antes del 1 de diciembre.',
  whatsapp: 'https://wa.me/573118308963?text=Hola%20Harry%2C%20confirmo%20asistencia%20a%20Tu%20Cumple%2040'
};

/* Canales del televisor (intro). El primero de la lista es el que se ve al prender.
   n = número que sale en pantalla, nombre = programa, archivo = nombre exacto del video en la carpeta videos/,
   ajuste (opcional, si no se pone queda 'cover') = 'cover' (llena la pantalla y recorta los bordes)
   o 'contain' (se ve completo, con franjas negras). Ej.: {n:4, nombre:'...', archivo:'...', ajuste:'contain'}. */
const CANALES = [
  {n:2,  nombre:'Rugrats',                    archivo:'rugrats.mp4'},
  {n:4,  nombre:'Oki Doki',                   archivo:'oki-doki.mp4'},
  {n:5,  nombre:'Supercampeones',             archivo:'supercampeones.mp4'},
  {n:7,  nombre:'El Chavo del 8',             archivo:'chavo.mp4'},
  {n:9,  nombre:'Los Caballeros del Zodiaco', archivo:'caballeros.mp4'},
  {n:11, nombre:'Dragon Ball Z',              archivo:'dragon-ball-z.mp4'}
];

/* Pista 1, grabar de la radio. jingle y cancion = nombre exacto del archivo en la carpeta sounds/.
   ventana = segundos de la canción en los que REC sale bien. emisora = lo que dice la pantalla al sintonizar. */
const RADIO = {
  jingle: 'jingle-la-mega.mp3',
  cancion: 'mis-ojos.mp3',
  ventana: [5, 8],
  emisora: '90.9 FM'
};

/* Pista 3, los juegos: nombre (sale grande encima de la foto) e imagen en la carpeta images/. Salen en este orden. */
const JUEGOS = [
  {nombre:'Canicas',      img:'canicas.png'},
  {nombre:'Coca',         img:'coca.png'},
  {nombre:'Rejo quemado', img:'rejo-quemado.png'},
  {nombre:'Trompo',       img:'trompo.png'},
  {nombre:'Yermis',       img:'yermis.png'}
];

/* Pista 5, el celular: tono que suena al llegar, antes de prender la pantalla de mensaje.
   mp3 = archivo en la carpeta sounds/ (si se pone, suena ese). rtttl = tono monofónico en formato RTTTL, el de los Nokia
   ("nombre:d=duración,o=octava,b=velocidad:notas"); solo se usa si mp3 está vacío. maximo = segundos como mucho. */
const TONO_CEL = {
  mp3: 'ringtone.mp3',
  rtttl: 'Relleno:d=8,o=6,b=150:e,g,a,4p,a,c7,a,g,e,4p,e,g,a,g,e,d,4e,4p,e,g,a,4c7,b,a,4g',
  maximo: 10
};

/* Pista 4, el chat: sonido del módem al conectarse (carpeta sounds/). */
const MODEM = 'modem.mp3';

/* Respuestas del amigo en el chat (salen en orden) */
const replies=['jajaja sii','parce, ¿y si mejor vamos al ciber mañana?','ya cambie mi foto de hi5, comentela','brb mi mamá necesita el telefono','dale, confirmado'];
