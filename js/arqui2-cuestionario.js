/* ===== Arquitectura II · Examen final · Cuestionario del profe (window.ARQC) =====
   Las 79 preguntas del cuestionario del profesor con su respuesta textual (transcrito del PDF "ARQUI FINAL.pdf").
   Dos modos: tarjetas (repetición tipo Leitner: lo que fallas vuelve antes) y lista completa para repasar o imprimir.
   Sirve en Node (require) para probar los datos; la interfaz solo corre en el navegador.
   Cargar DESPUÉS de comunes.js:  <script src="../../js/arqui2-cuestionario.js"></script> */
(function (root) {
  'use strict';

  /* [número, bloque, pregunta, respuesta del profe] */
  const PREGUNTAS = [
    [1,"E/S e interfaces","¿Cómo se comunican los microprocesadores?","Entradas y salidas (I/O), buses del sistema, dispositivos periféricos, interrupciones, sistemas operativos y programas de aplicación."],
    [2,"E/S e interfaces","¿Qué periféricos pueden conectarse al microprocesador?","Pantallas, teclados, mouse, unidades de almacenamiento, impresoras, escáneres, etc."],
    [3,"E/S e interfaces","¿Qué es el mapeo de puertos?","Asignar a cada puerto de E/S dirección única para que el microprocesador pueda identificarlo y leer o escribir en él."],
    [4,"E/S e interfaces","¿Cuáles son las unidades principales de procesamiento de entrada/salida?","MMU: traduce direcciones virtuales a físicas. IOMMU: traduce direcciones de E/S virtuales a físicas y aísla los dispositivos. Caché: guarda instrucciones y datos en la CPU para acelerar el acceso a memoria. GPU: procesa gráficos 2D/3D. NIC: procesa los paquetes de red. Controlador de discos: gestiona la comunicación con los discos. Controlador de audio: procesa y reproduce audio. Controlador de video: procesa y reproduce video. Controladores USB, GPIO, PCIe: manejan otras interfaces programables."],
    [5,"E/S e interfaces","¿Ventajas de utilizar unidades de proceso adicionales?","Mejoran el rendimiento, permiten múltiples tareas, optimizan recursos y reducen cuellos de botella, etc."],
    [6,"E/S e interfaces","¿Qué es una interfaz básica entrada-salida?","Circuito que permite al microprocesador comunicarse con dispositivos externos mediante puertos, enviando y recibiendo datos."],
    [7,"E/S e interfaces","¿Cómo funciona una interfaz básica?","El CPU usa IN y OUT sobre puertos con dirección única; los datos pasan por el buffer y la línea de datos hasta el dispositivo, las líneas de control marcan si es entrada o salida, y el dispositivo responde a su dirección."],
    [8,"E/S e interfaces","¿Qué es el handshaking?","Proceso entre CPU y dispositivo que evita pérdida, repetición o corrupción de datos en la transferencia; es fundamental en interfaces síncronas y de baja capa."],
    [9,"E/S e interfaces","¿Qué es la decodificación de puertos?","Circuito que recibe la dirección que pone el microprocesador y activa solo el puerto correspondiente a esa dirección."],
    [10,"E/S e interfaces","¿Diferencia de puerto de 8 bits y 16?","8 bits: transfiere 1 byte (8 bits) por operación. 16 bits: transfiere una palabra (16 bits, dos bytes) por operación."],
    [11,"E/S e interfaces","¿Qué es wide port?","Puerto de E/S de 16 bits que transfiere una palabra completa (dos bytes) en una sola operación, formado por dos puertos de 8 bits contiguos."],
    [12,"E/S e interfaces","¿Interfaces periféricas programables más importantes?","USB (Plug-and-Play), serial (bit por bit), paralelo (todos los bits a la vez), GPIO (pines programables) e I2C (bus síncrono simple para sensores)."],
    [13,"E/S e interfaces","¿Cómo se configuran las interfaces periféricas?","Registros de propósito general, mapa de puertos de E/S, llamadas al sistema, drivers, manejo de interrupciones, etc."],
    [14,"E/S e interfaces","¿Qué son las APIs?","Conjuntos de funciones que definen cómo se comunican distintas aplicaciones de forma estandarizada, sin importar su lenguaje o plataforma."],
    [15,"E/S e interfaces","¿Características clave de las APIs?","Facilitan la integración y reutilización, ocultan los detalles internos, funcionan en red."],
    [16,"PLD y PPI","¿Qué es un PLD?","Dispositivo lógico programable por el usuario que implementa funciones lógicas y de E/S, y se usa como decodificador de puertos en sistemas digitales."],
    [17,"PLD y PPI","¿Funciones clave de un PLD en la decodificación de puertos?","Decodificación de direcciones, activación de puertos, multipuertos (\"multipuestos\" en el PDF), reducción de cable y mayor flexibilidad, etc."],
    [18,"PLD y PPI","¿Qué es PPI?","Interfaz de E/S programable específica, que implementa en hardware un protocolo de comunicación concreto."],
    [19,"PLD y PPI","¿Diferencia entre PPI y PLD?","PLD: dispositivo genérico y reprogramable donde el usuario diseña la lógica; muy flexible pero complejo; útil para interfaces personalizadas o pocas unidades. PPI: dispositivo específico con la interfaz ya predefinida, simple, optimizado y estándar para grandes volúmenes, pero de funcionalidad fija."],
    [20,"PLD y PPI","¿Ventajas de los PPI?","Funcionalidad predefinida, rendimiento optimizado, menor complejidad, traen la interfaz ya hecha, etc."],
    [21,"PLD y PPI","¿Casos en que es mejor el PLD y no el PPI?","Cuando se necesita una interfaz personalizada, reconfigurable u optimizada, o en producciones pequeñas con recursos limitados."],
    [22,"PLD y PPI","¿Protocolos que se pueden implementar con PPI?","UART, I2C, SPI, USB, Ethernet, GPIO, etc."],
    [23,"PLD y PPI","¿Aplicaciones que usan PLD?","Sistemas de control industrial, interfaces personalizadas, decodificación de direcciones de I/O, electrónica automotriz y sistemas embebidos."],
    [24,"Señal de video","¿Qué es la señal de video?","Señal eléctrica que transporta la imagen y su sincronización para que el monitor la reconstruya."],
    [25,"Señal de video","¿Qué es la señal de video compuesta?","Señal analógica que transporta en un solo cable la luminancia, la crominancia y los pulsos de sincronización."],
    [26,"Señal de video","¿Para qué sirve el pulso de sincronización en el video compuesto?","Sincroniza al emisor y al receptor para reconstruir la imagen entrelazada (luminancia y croma)."],
    [27,"Señal de video","¿Qué incluyen los pulsos de sincronización?","Pulso de línea: indica el inicio de cada línea y sincroniza a nivel de línea. Pulso de trama: indica el inicio de cada trama o campo y sincroniza a nivel de campo. Color burst: pulso de referencia en el pulso de línea de las líneas de croma que sincroniza la fase y el color."],
    [28,"Señal de video","¿Qué es el pedestal de sincronización?","Tiempo en blanco entre el pulso de sincronización horizontal y el primer píxel de la línea, que permite al monitor completar el retardo horizontal."],
    [29,"Señal de video","¿Pedestal demasiado corto / demasiado largo?","Muy corto distorsiona la imagen; muy largo reduce la resolución horizontal."],
    [30,"Señal de video","¿Qué es el color burst?","Pulso estrecho de color de referencia que se incluye al comienzo de cada línea de señal de video compuesta que transporta información de croma."],
    [31,"Señal de video","¿Función principal del color burst?","Sincroniza la fase del color entre la señal transmitida y la reproducida, y da al receptor una referencia para decodificar correctamente los colores."],
    [32,"Señal de video","¿Diferencia video monocromo y cromático?","Monocromo: solo transmite luminancia (escala de grises). Cromático: transmite luminancia y croma (imágenes a color)."],
    [33,"Señal de video","¿Componentes de la señal/video monocromática?","CRT (dispara electrones), pantalla fosforescente (emite luz), deflexión (dibuja las líneas), sincronización (alinea el haz con la señal) y señal monocroma (solo luminancia, regula la intensidad)."],
    [34,"Monitores y estándares","¿Qué quiere decir TTL?","Lógica transistor-transistor."],
    [35,"Monitores y estándares","¿Con qué podía trabajar el monitor TTL RGB?","Con tarjetas CGA y EGA, ajustando solo la sincronización horizontal a cada resolución."],
    [36,"Monitores y estándares","¿Qué es el monitor TTL RGB?","Monitor que recibe las señales de rojo, verde y azul en forma digital, cada color solo encendido o apagado: 8 colores, o 16 al agregar intensidad."],
    [37,"Monitores y estándares","¿Cómo conseguía tonos distintos el monitor TTL RGB?","El cañón de electrones lanza partículas cargadas contra la pantalla con intensidad variable."],
    [38,"Monitores y estándares","¿Cómo logró EGA 16 colores?","En vez de la señal de intensidad, recibía una segunda señal por cada color primario, logrando más matices y alcanzando 16 colores."],
    [39,"Monitores y estándares","¿Qué es un televisor análogo (RGB analógico)?","Recibe las señales analógicas de rojo, verde y azul por separado, en lugar de una señal compuesta estándar."],
    [40,"Monitores y estándares","¿Características del monitor RGB análogo?","Recibe R, G y B por separado, no compuestas; tiene 3 cañones independientes, uno por color; no necesita decodificación."],
    [41,"Monitores y estándares","¿Diferencia entre RGB y RCA?","RGB envía los colores en señales separadas y da mejor calidad; RCA envía el video compuesto en una sola señal, con el audio en cables aparte."],
    [42,"Monitores y estándares","¿Qué es VGA (Video Graphics Array)?","Estándar de video que muestra 256 colores simultáneos en modo gráfico, con resolución de 640x480."],
    [43,"Monitores y estándares","¿Características del VGA?","256 colores simultáneos, 640x480, video analógico de mejor calidad que EGA, memoria de video dedicada y compatibilidad con CGA y EGA."],
    [44,"Monitores y estándares","¿Qué es HDMI?","Conector y cable que transmite señales digitales de video, audio y otros datos entre dispositivos electrónicos."],
    [45,"Monitores y estándares","¿Características del HDMI?","Resoluciones altas, audio multicanal, protección HDCP, control de dispositivos conectados y un cable para video y audio."],
    [46,"Monitores y estándares","¿Principales formatos de video en computadores?","VGA 640x480, SVGA 800x600, XGA 1024x768, SXGA 1280x1024, UXGA 1600x1200, WUXGA 1920x1200, QXGA 2048x1536, HD 1280x720, 1366x768 y 1920x1080."],
    [47,"Monitores y estándares","¿Formatos más comunes actualmente?","HD (720p, 1080p), Full HD 1080p, WQHD 1440p y 4K 2160p."],
    [48,"Monitores y estándares","¿Principales formatos de video en general?","Analógicos: NTSC (480i, América del Norte y Japón) y PAL/SECAM (576i, Europa). Alta definición: 720p, 1080i/1080p, 2K (2048x1080), 4K (3840x2160) y 8K (7680x4320). Interfaces: HDMI, DisplayPort y DVI."],
    [49,"Monitores y estándares","¿Por qué es importante la RAM en el video?","A mayor resolución, cantidad de videos, edición y compresión, más datos se guardan en RAM, y la GPU integrada la comparte."],
    [50,"Monitores y estándares","¿Cómo se pueden convertir señales de video?","Adaptador HDMI a VGA: pasivo, de baja calidad y solo transmite video; convertidor activo: mejor calidad y con audio; tarjeta de video externa: solución más versátil."],
    [51,"Monitores y estándares","¿Qué es DisplayPort?","Interfaz para pantallas digitales, compatible con 4K y futuros 8K."],
    [52,"Diagramas de tiempo y ciclos de bus","¿Qué es la anatomía de la señal?","Elementos con los que se representa una señal en un diagrama de tiempo."],
    [53,"Diagramas de tiempo y ciclos de bus","¿Elementos de la anatomía de la señal?","Línea baja: nivel lógico 0. Línea alta: nivel lógico 1. Líneas cruzadas (hexágono/bus): varios bits cambian a la vez. Línea media rayada: alta impedancia (tri-state), ni 0 ni 1."],
    [54,"Diagramas de tiempo y ciclos de bus","¿Símbolos clave de un diagrama de tiempo?","Flancos de reloj: cambio de bajo a alto (subida) o de alto a bajo (bajada). Flechas de dependencia: un evento causa o condiciona a otro. Líneas de acotación: intervalo de tiempo entre dos eventos."],
    [55,"Diagramas de tiempo y ciclos de bus","¿Qué es el ciclo de escritura?","Secuencia en la que el procesador escribe un dato en memoria, dividida en cuatro estados de reloj (T1 a T4)."],
    [56,"Diagramas de tiempo y ciclos de bus","¿Qué ocurre en cada estado?","T1: el procesador coloca la dirección en el bus. T2 y T3: la dirección sigue válida, se activa la escritura y el dato se pone en el bus. T4: termina el ciclo, la escritura se desactiva y el bus queda libre."],
    [57,"Diagramas de tiempo y ciclos de bus","¿Qué señales intervienen?","CLK (reloj), ADDRESS (dirección válida), ADDRESS/DATA (bus que lleva primero la dirección y luego el dato) y WR (escritura, activa en 0)."],
    [58,"Diagramas de tiempo y ciclos de bus","¿Qué es el ciclo de lectura?","Ciclo de bus en el que el procesador lee un dato de memoria: coloca la dirección, activa RD (en 0) y el dato llega por ADDRESS/DATA."],
    [59,"Diagramas de tiempo y ciclos de bus","¿Qué son los ciclos de espera?","Estados adicionales que se insertan en el ciclo cuando READY está en 0, para adaptarse a memorias o dispositivos lentos."],
    [60,"Diagramas de tiempo y ciclos de bus","¿Siglas de señales de control?","ALE: habilita el latch de dirección. IO/M: distingue E/S de memoria. S: selección. G (Gate): habilitación. CS (Chip Select): selecciona el chip. OE (Output Enable): habilita la salida."],
    [61,"Diagramas de tiempo y ciclos de bus","¿Los 3 tipos de ciclo de máquina?","Opcode fetch (0,1,1): lee el código de la instrucción. Memory read (0,1,0): lee un dato de memoria. Memory write (0,0,1): escribe un dato en memoria. (bits IO/M, S1, S0)"],
    [62,"DMA","¿Operación básica del DMA?","HOLD solicita el DMA y HLDA lo reconoce, dejando los buses en alta impedancia; luego los datos pasan directos entre memoria y E/S (lectura: memoria a E/S; escritura: E/S a memoria). HOLD actúa a media instrucción y solo RESET tiene más prioridad."],
    [63,"DMA","¿Qué terminales activan la lectura de memoria a E/S?","MRDC (orden de lectura de memoria: la memoria entrega el dato al bus) e IOWC (orden de escritura de E/S: el dispositivo recibe el dato del bus)."],
    [64,"DMA","¿Qué terminales activan la escritura de E/S a memoria?","MWTC (orden de escritura de memoria: la memoria recibe el dato del bus) e IORC (orden de lectura de E/S: el dispositivo entrega el dato al bus)."],
    [65,"DMA","¿De qué depende la velocidad de transferencia?","De la velocidad de la memoria o del controlador DMA, que suele reducir la velocidad del sistema durante la transferencia."],
    [66,"DMA","¿Qué es el controlador DMA 8237?","Microprocesador específico, compatible con el 8086/8088, que genera las señales de control y direccionamiento para transferir datos entre E/S y memoria a hasta 1.6 Mbps (sic; Brey dice 1.6 MB/s), con cuatro canales de 64 KB."],
    [67,"DMA","¿Con qué es compatible el 8237?","Con el 8086/8088."],
    [68,"DMA","¿Registros internos del controlador DMA?","CAR (dirección actual): dirección de memoria de la transferencia. CWCR (cuenta actual): cuántos bytes se transfieren. CR (comandos): programa la operación del controlador. Registro de modo: modo de operación de cada canal. SR (estado): estado de cada canal."],
    [69,"DMA","¿Qué son los comandos de software?","Órdenes del 8237 que se activan con una simple salida al puerto de E/S correcto, sin patrón de bits."],
    [70,"DMA","¿Cuáles son los comandos de software?","Limpiar el biestable P/U (elige byte bajo o alto), limpieza maestra (actúa como RESET y desactiva los canales) y limpiar el registro de máscara (habilita los cuatro canales)."],
    [71,"DMA","¿Qué es la programación de los registros de dirección y cuenta?","Proceso de cargar en el 8237 la dirección de memoria y el número de bytes de la transferencia DMA."],
    [72,"DMA","¿Pasos para programar el 8237?","Limpiar el flip-flop P/U, deshabilitar el canal, cargar la dirección (primero LSB y luego MSB) y cargar la cuenta (LSB y MSB)."],
    [73,"Buses y multiprocesamiento","¿Qué es el bus local?","Bus residente del microprocesador, conectado directamente a su memoria y E/S locales, sin protocolos especiales de acceso."],
    [74,"Buses y multiprocesamiento","¿Qué es un bus compartido?","Bus conectado a todos los microprocesadores del sistema, que sirve para intercambiar datos entre ellos y puede contener memoria y E/S accesibles para todos."],
    [75,"Buses y multiprocesamiento","¿Qué es un maestro de bus?","Cualquier dispositivo que puede controlar un bus con memoria y E/S; el 8237 es un ejemplo."],
    [76,"Buses y multiprocesamiento","¿Diferencia entre micro maestro de bus y controlador DMA?","El microprocesador maestro puede ejecutar software variable; el controlador DMA solo puede transferir datos."],
    [77,"Buses y multiprocesamiento","¿Cómo se accede al bus compartido?","Con el pin HOLD (en el controlador DMA) y un árbitro de bus que decide la prioridad entre los maestros y permite que solo uno acceda a la vez."],
    [78,"Buses y multiprocesamiento","¿Modos de operación del 8289?","Bus periférico E/S; bus residente: permite acceso a memoria y E/S, como bus local o compartido; bus único: conecta un microprocesador al bus compartido, sin memoria ni E/S local."],
    [79,"Buses y multiprocesamiento","¿Cómo opera el sistema con el 8289?","El maestro de bus compartido controla el sistema, y los demás microprocesadores ejecutan tareas independientes y las reportan por el bus compartido."]
  ];

  const BLOQUES = [...new Set(PREGUNTAS.map(p => p[1]))];
  const CLAVE = 'arq2f-cuestionario';
  const CAJA_MAX = 4, DOMINADA = 3;   // acertar sube de caja; desde la caja 3 se cuenta como dominada

  /* ---------- Lógica pura (se prueba en Node) ---------- */
  const estadoVacio = () => ({ tarjetas: {}, tick: 0 });
  const dePregunta = (est, n) => est.tarjetas[n] || { c: 0, u: null, t: 0 };
  const dominada = (est, n) => dePregunta(est, n).c >= DOMINADA;
  /* Acertar sube una caja; fallar la devuelve a la caja 1 (vuelve enseguida). */
  function responder(est, n, supo) {
    const t = dePregunta(est, n);
    est.tick++;
    est.tarjetas[n] = { c: supo ? Math.min(CAJA_MAX, t.c + 1) : 1, u: supo ? 's' : 'n', t: est.tick };
    return est;
  }
  const fallada = (est, n) => dePregunta(est, n).u === 'n';
  const totalDominadas = est => PREGUNTAS.filter(p => dominada(est, p[0])).length;
  /* Cola de estudio: menor caja primero (las nuevas y falladas antes), luego la menos reciente. */
  function cola(est, bloque, soloFalladas) {
    return PREGUNTAS
      .filter(p => (!bloque || p[1] === bloque) && (!soloFalladas || fallada(est, p[0])))
      .sort((a, b) => {
        const ta = dePregunta(est, a[0]), tb = dePregunta(est, b[0]);
        return (ta.c - tb.c) || (ta.t - tb.t) || (a[0] - b[0]);
      });
  }
  /* Reparte tiempos al azar: desempata dentro de cada caja. */
  function barajar(est) {
    PREGUNTAS.forEach(p => { const t = dePregunta(est, p[0]); est.tarjetas[p[0]] = { c: t.c, u: t.u, t: Math.floor(Math.random() * 1000) - 1000 }; });
    return est;
  }
  const API = { PREGUNTAS, BLOQUES, CLAVE, CAJA_MAX, DOMINADA, estadoVacio, dePregunta, dominada, fallada, responder, totalDominadas, cola, barajar };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.ARQC = API;
  if (typeof document === 'undefined') return;

  /* ---------- Interfaz (navegador) ---------- */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const guardado = () => (window.Comunes && Comunes.store.get(CLAVE)) || null;
  const guarda = est => { if (window.Comunes) Comunes.store.set(CLAVE, est); };

  function monta(el) {
    let est = guardado();
    if (!est || typeof est !== 'object' || !est.tarjetas) est = estadoVacio();
    let modo = 'tarjetas', bloque = '', soloFalladas = false, visible = false, actual = null;

    el.innerHTML = `
      <div class="assoc-bar">
        <span class="score" data-c="score" aria-live="polite"></span><span class="spacer"></span>
        <div class="assoc-tabs" role="tablist" aria-label="Modo">
          <button type="button" role="tab" data-modo="tarjetas" aria-selected="true">Tarjetas</button>
          <button type="button" role="tab" data-modo="lista" aria-selected="false">Lista completa</button>
        </div>
      </div>
      <div class="fin-calc">
        <label class="small">Bloque <select class="fin-in" data-c="bloque"><option value="">Todos los bloques</option>${BLOQUES.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('')}</select></label>
        <label class="small"><input type="checkbox" data-c="fall"> Solo las que fallé</label>
        <span class="small"><button type="button" class="btn sec" data-c="baraja">Barajar</button> <button type="button" class="btn sec" data-c="reinicia">Reiniciar</button> <button type="button" class="btn sec" data-c="imprime">Imprimir</button></span>
      </div>
      <div data-c="tarjetas">
        <p class="small muted" data-c="info"></p>
        <div class="key" data-c="card"><b data-c="meta"></b><p data-c="preg"></p>
          <div data-c="respBox" hidden><div class="key ok"><b>Respuesta del profe</b><p data-c="resp"></p></div></div></div>
        <div class="fin-ctrl"><button type="button" class="btn" data-c="ver">Ver respuesta</button>
          <button type="button" class="btn" data-c="si" hidden>La sabía</button>
          <button type="button" class="btn sec" data-c="no" hidden>No la sabía</button></div>
        <p class="small muted">Atajos: Espacio = ver respuesta · 1 = la sabía · 2 = no la sabía. Las que fallas vuelven antes; una pregunta cuenta como dominada al acertarla ${DOMINADA} veces seguidas.</p>
      </div>
      <div data-c="lista" hidden></div>`;
    const q = s => $(`[data-c="${s}"]`, el);

    const filtradas = () => PREGUNTAS.filter(p => (!bloque || p[1] === bloque) && (!soloFalladas || fallada(est, p[0])));
    function pintaPuntaje() {
      q('score').textContent = `dominadas ${totalDominadas(est)}/${PREGUNTAS.length} · falladas ${PREGUNTAS.filter(p => fallada(est, p[0])).length}`;
    }
    function pintaTarjeta() {
      const c = cola(est, bloque, soloFalladas);
      /* No repetir la misma tarjeta dos veces seguidas si hay otra. */
      actual = c.find(p => !actual || p[0] !== actual[0]) || c[0] || null;
      q('respBox').hidden = true; q('ver').hidden = !actual; q('si').hidden = q('no').hidden = true;
      if (!actual) {
        q('meta').textContent = '';
        q('preg').textContent = soloFalladas ? 'No tienes preguntas falladas en este filtro.' : 'No hay preguntas en este filtro.';
        q('info').textContent = ''; return;
      }
      const t = dePregunta(est, actual[0]);
      q('meta').textContent = `Pregunta ${actual[0]} de ${PREGUNTAS.length} · ${actual[1]}`;
      q('preg').textContent = actual[2];
      q('resp').textContent = actual[3];
      q('info').textContent = `En este filtro: ${c.length} pregunta(s) · caja ${t.c}/${CAJA_MAX}${t.u === 'n' ? ' · la fallaste la última vez' : ''}${t.c >= DOMINADA ? ' · dominada' : ''}`;
    }
    function pintaLista() {
      const host = q('lista'); host.textContent = '';
      let ultimo = '';
      filtradas().forEach(p => {
        if (p[1] !== ultimo) { ultimo = p[1]; const h = document.createElement('h3'); h.textContent = ultimo; host.appendChild(h); }
        const d = document.createElement('details'); d.className = 'qa';
        const s = document.createElement('summary'), n = document.createElement('span');
        n.className = 'qn'; n.textContent = 'P' + p[0];
        s.append(n, document.createTextNode(p[2]));
        const a = document.createElement('div'); a.className = 'ans';
        const t = document.createElement('p'); t.textContent = p[3];
        a.appendChild(t); d.append(s, a); host.appendChild(d);
      });
      if (!host.firstChild) { const t = document.createElement('p'); t.className = 'muted'; t.textContent = 'No hay preguntas en este filtro.'; host.appendChild(t); }
    }
    function pinta() {
      pintaPuntaje();
      q('tarjetas').hidden = modo !== 'tarjetas'; q('lista').hidden = modo !== 'lista';
      $$('[data-modo]', el).forEach(b => b.setAttribute('aria-selected', String(b.dataset.modo === modo)));
      if (modo === 'tarjetas') pintaTarjeta(); else pintaLista();
    }
    function ver() { if (!actual || !q('respBox').hidden) return; q('respBox').hidden = false; q('ver').hidden = true; q('si').hidden = q('no').hidden = false; }
    function marca(supo) {
      if (!actual || q('respBox').hidden) return;
      responder(est, actual[0], supo); guarda(est); pintaPuntaje(); pintaTarjeta();
    }

    el.addEventListener('click', e => {
      const m = e.target.closest('[data-modo]'); if (m) { modo = m.dataset.modo; pinta(); return; }
      const b = e.target.closest('button[data-c]'); if (!b) return;
      switch (b.dataset.c) {
        case 'ver': ver(); break;
        case 'si': marca(true); break;
        case 'no': marca(false); break;
        case 'baraja': barajar(est); guarda(est); actual = null; pinta(); break;
        case 'reinicia': if (confirm('¿Borrar todo tu avance del cuestionario?')) { est = estadoVacio(); guarda(est); actual = null; pinta(); } break;
        case 'imprime': modo = 'lista'; bloque = ''; soloFalladas = false; q('bloque').value = ''; q('fall').checked = false; pinta(); window.print(); break;
      }
    });
    el.addEventListener('change', e => {
      if (e.target.matches('[data-c="bloque"]')) { bloque = e.target.value; actual = null; pinta(); }
      if (e.target.matches('[data-c="fall"]')) { soloFalladas = e.target.checked; actual = null; pinta(); }
    });

    /* Atajos de teclado: solo si el cuestionario está a la vista y el foco no está escribiendo. */
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe(el);
    else visible = true;
    document.addEventListener('keydown', e => {
      if (!visible || modo !== 'tarjetas' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); ver(); }
      else if (e.key === '1') marca(true);
      else if (e.key === '2') marca(false);
    });
    pinta();
  }

  function init() { const el = $('#cuestionarioApp'); if (el) monta(el); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : globalThis);
