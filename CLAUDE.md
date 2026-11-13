# Invitación interactiva: Harrison 40 · Grandes éxitos

Invitación web a la fiesta de los 40 años de Harrison (Bogotá, 1986 → 2026). Se comparte por WhatsApp.
El hilo conductor es un casete: cada pista es una página, todas seguidas (sin Lado A / B): primero los 90s, luego los 2000s,
y al final una pista oculta con las velas y los datos de la fiesta.

## Flujo
1. Aviso de 15 s: en celular "Gira tu celular" (en horizontal aparece "Continuar"); en computador "Sube el volumen".
   Tocar "Continuar" desbloquea el sonido; si la cuenta llega a 0 sin toque, el video arranca mudo y el primer toque lo activa.
2. TV (`data-side="intro"`, se ve una sola vez): arranca en el primer canal de `CANALES` (Rugrats); LO/HI cambian de canal.
   Arriba, la invitación a cambiar de canal y la guía de canales vistos; abajo, la barra pide pasar por todos y luego apagar.
   OFF-ON solo funciona tras ver los 6 canales; antes sale en la pantalla "¡ESPERA! Te faltan N canales…".
   Empujón: tras 7 s en un canal sale "A CONTINUACIÓN ▸ Canal…" y HI muestra el globito neón "Oprime para cambiar canal".
   Al completar, una franja verde abajo de la pantalla del TV (no la tapa, se queda hasta apagar) y OFF-ON late con "Apágame para ir a la fiesta".
   OFF-ON apaga el TV y lanza la transición `portal()` (la sala se mete en el punto de luz y un círculo se abre mostrando el casete).
3. Portada: "Grandes 40 éxitos de Harrison!" con el casete abierto y los carretes girando → PLAY. No hay atajo a la invitación.
4. Pistas seguidas (`data-side="cinta"`): 1 radio, 2 teléfonos naranjas, 3 juegos, 4 chat, 5 celular, 6 internet de Centro Suba, 7 fotos, y la pista oculta (pastel + invitación).
   Las pistas 1 a 6 están cerradas (`cerrar(id)`) hasta completarlas; entonces aparece su botón "Siguiente pista" y se habilita ⏩.
   La 7 (fotos) no obliga a nada.
   - 1 radio: Prender → estática → jingle → canción; la pantalla cuenta 5..1 y REC sale bien entre los segundos 5 y 8 (`RADIO.ventana`).
     Bien → "Siguiente pista"; temprano o tarde → "Reiniciar". La cuenta ("¡YA!") es también un botón invisible que hace lo mismo que REC.
     La canción suena al doble de volumen (ganancia x2 + limitador con Web Audio), solo por http/https: con file:// suena normal.
   - 2 teléfonos naranjas: relato a la izquierda, foto `tel.png` a la derecha. "Echar la ficha": la moneda vuela a la ranura, tono,
     sale "¿A quién llamarías hoy desde este teléfono?" y a los 3 s se abre la pista.
   - 3 juegos: carrusel con `JUEGOS` (nombre grande tipo calcomanía), pasa solo cada 3,5 s o con flechas/deslizando.
     Al ver todos sale "¿Cuál faltó en esta lista de juegos legendarios?" y se abre la pista.
   - 4 chat: `msn.png` difuminada con una ventanita "Conexión a Internet". "Conectar a internet" suena el módem (`MODEM`, 12 s);
     al terminar se ve normal y el chat funciona encima de la ventana de conversación (Enter o el botón Send de la imagen).
     "Siguiente pista" aparece solo al enviar un zumbido (el texto de la izquierda lo indica).
   - 5 celular: Nokia `1100.png`. La primera vez que se llega, vibra con su pantalla original y suena `TONO_CEL` (RTTTL monofónico
     con `rtttl()` de utils.js, o un mp3). Luego se prende encima la pantalla de mensaje con el saldo y aparece el SMS.
     "Botar una perdida" abre la pista y su botón se cambia por "Siguiente pista".
   - 6 internet de Centro Suba: a la izquierda la pantalla del PC (`cyber.png`), a la derecha el control del dueño (`cyber-contador.png`).
     Tocar «Sin usar» (línea 3) la vuelve igual a las activas (recorte de la fila 2 encima, con hora de inicio y contador en vivo),
     la pantalla pasa a `cyberwin.jpg` y se abre la pista.
   - 7 fotos: el rollo `cinta.png` a la izquierda con 5 cuadros; cada foto elegida entra en el siguiente cuadro y se ve
     como en el negativo (invertida, casi monocroma y con la máscara naranja de la película), apareciendo desde negro.
     Subir fotos es opcional: "Elegir fotos" y "Siguiente pista" están lado a lado desde el inicio.
   - Pista oculta (3 columnas): `pastel.png` a la izquierda, al centro "Lo conseguiste... ¡Bienvenido a mi fiesta!!!" en un panel
     oscuro translúcido, y a la derecha la ruleta "🎁 Regalo sorpresa" (8 casillas "?"). Fondo `hbd.jpeg` con velo oscuro.
     La ruleta gira sola 1,8 s después de llegar (y otra vez al tocar GIRAR); siempre para centrada en una casilla y debajo sale
     el cuadro "¡Lluvia de sobres! 💌" con una explosión de confeti. El confeti (lluvia y explosiones) usa un solo lienzo: `soltar()` en final.js.
     El panel muestra los datos de `FIESTA` y el botón de WhatsApp (`FIESTA.whatsapp`, enlace completo).
     Al llegar la primera vez cae confeti. Es la última página: no tiene botón de volver a empezar.
La barra de abajo (⏪ ⏩, carretes, línea de avance y sonido; sin texto ni contador) mueve pista por pista, también deslizando o con las flechas,
y no avanza en una pista cerrada.

## Stack
- HTML, CSS y JavaScript puros. Sin frameworks, sin build y sin dependencias npm.
- Los scripts son clásicos (`<script src>`), NO módulos ES, para que la página abra con doble clic (file://).
  Como son clásicos, comparten el ámbito global (no repetir nombres de `let`/`const` entre archivos); el orden de carga importa:
  `utils.js` → `horizontal.js` → `contenido.js` → `cinta.js` → `tv.js` → `lado-a.js` → `lado-b.js` → `final.js`.
- Fuentes de Google Fonts: Permanent Marker (títulos a mano), VT323 (pantallas), Rubik (texto).
- Efectos de sonido sintetizados con Web Audio (`tone()` y `noiseBurst()` en `utils.js`).

## Estructura
- `index.html`: una `<section class="page">` por pista, con `data-side` (intro = TV, 0 = portada, cinta = pistas) y `data-label`.
- `css/styles.css`: estilos. Colores y fuentes como variables en `:root`. Comentarios `/* ---------- SECCIÓN ---------- */` separan cada bloque.
- `js/utils.js`: `$`, `sleep`, sonido y botón de sonido.
- `js/horizontal.js`: fuerza la vista horizontal. En un celular con la pantalla en vertical (aunque tenga la rotación bloqueada) gira toda la `.app` 90° con CSS; el sensor de movimiento (Android) elige hacia qué lado. En Android, PLAY además pide pantalla completa y bloquea la orientación en horizontal.
- `js/contenido.js`: textos editables (`FIESTA`, canales del TV `CANALES` (el primero es el inicial), audios de la radio `RADIO`, juegos `JUEGOS`, sonido del módem `MODEM`, tono del celular `TONO_CEL`, respuestas del chat `replies`).
  `TONO_CEL.mp3` = `ringtone.mp3` (5 s); el `rtttl` solo se usa si el mp3 está vacío.
- `js/cinta.js`: aviso de girar, navegación entre páginas (`goPage(id, dir)`, `onPage(id, {enter, leave})`, `cerrar(id)`/`abrir(id)`), reproductor, transición del TV al casete y portada.
- `js/tv.js`: el TV de la intro. Video detrás de `tv.png` (el hueco de la pantalla es transparente) y control remoto con zonas táctiles encima de `tv-control.png`.
- `js/lado-a.js` (el nombre quedó de cuando había lados): pistas 1 a 3, radio (zonas táctiles REC y PLAY encima de `rec.png`), teléfonos naranjas, juegos.
- `js/lado-b.js`: pistas 4 a 7, chat (sobre `msn.png`), celular (Nokia 1100), internet de Centro Suba, fotos para revelar.
- `deslizar(el, fn, ignorar)` en `cinta.js` maneja el deslizar con el dedo (incluso con la `.app` girada); lo usan la cinta y el carrusel.
- Ojo con los nombres de clase: son globales en el CSS. Un estado como `.pregunta` chocó con otro elemento; usar nombres específicos.
- `js/final.js`: invitación, confeti al llegar, volver a empezar.
- `images/`: `tv.png`, `tv-control.png`, `casete-abierto.png` (portada), grabadora `rec.png`, foto `tel.png`, juegos (`canicas`, `coca`, `rejo-quemado`, `trompo`, `yermis`), `msn.png`, `1100.png`, `cyber.png`, `cyber-contador.png`, `cyberwin.jpg`, `cinta.png`, `pastel.png` y `hbd.jpeg` (fondo de la última pantalla).
  `videos/`: `rugrats`, `oki-doki`, `supercampeones`, `chavo`, `caballeros`, `dragon-ball-z` (.mp4, H.264 + AAC, 640x360).
  `sounds/`: `jingle-la-mega.mp3` y `mis-ojos.mp3` (Pista 1), `modem.mp3` (Pista 4), `ringtone.mp3` (Pista 5).
  Nombres de archivo: minúsculas, sin espacios, tildes ni símbolos, y nunca empezando por `_` (GitHub Pages los ignora).
  En la raíz hay un `.nojekyll` vacío para que GitHub Pages publique los archivos tal cual.
  Las posiciones de la pantalla, botones y carretes están en % en el CSS, medidas sobre el tamaño de cada imagen; si se cambia una imagen hay que volver a medir.

## Convenciones
- Todo el texto visible está en español de Colombia, tono cercano y bogotano.
- Pensado para celular en horizontal (probar a 844x390). En vertical la `.app` se gira, así que también hay que probar 390x844 con pantalla táctil.
- Como la `.app` puede estar girada, dentro de ella NO usar `vw`/`vh`/`dvh` ni `@media` de orientación o tamaño:
  usar `var(--aw)`/`var(--ah)` (ancho y alto de la app) y las clases de `<html>` `.port`, `.short` (alto ≤ 500) y `.narrow` (ancho ≤ 600).
  Los márgenes seguros se usan con `var(--st|--sr|--sb|--sl)`, no con `env()` directo.
- El público va de 10 a 70 años: botones grandes, textos cortos y nada que dependa de saber usar el celular.
- Todo lo que hay que tocar parpadea en **neón verde** (`--neon`, `--neon-glow`, `--neon-suave` en `:root`; animación `glow`).
  Los globitos de ayuda ("Oprime…", "¡Toca aquí!") son verdes con marco neón. Cada pista que pide una acción lleva un
  `<p class="llamado">` (letra de pantalla, marco neón que late) que dice qué tocar para seguir; `.llamado.hecho` lo apaga.
- Para probar el doble volumen de la canción hay que servir la página por http (p. ej. Live Server), no con doble clic.
- Respetar `prefers-reduced-motion` (ya hay una regla global al final del CSS).
- Las imágenes, videos y audios de `images/`, `videos/` y `sounds/` los aportó Harrison. No agregar otros materiales de terceros (logos, clips, letras de canciones) por cuenta propia.
- Cada pista sigue el patrón `<article class="track">` con `<h3><span class="n">Pista N</span> Título</h3>`.

## Cómo probar
Abrir `index.html` en el navegador, o usar la extensión Live Server de VS Code.

## Pendientes
- Revisar las demás pistas en el formato de páginas (ya están el TV y la Pista 1, la radio).
- Fotos reales de Harrison por época y mensajes de amigos y familia.
