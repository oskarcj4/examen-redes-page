/* ===== Arquitectura II · Final · Reels (window.REELS) =====
   "Videos" verticales 9:16 animados en el navegador (sin MP4, sin librerías, sin red) para repasar el examen
   final en una noche. Las respuestas salen del cuestionario del profe (ARQUI FINAL.pdf); los trucos
   mnemotécnicos NO los dijo el profe: llevan la insignia "deducido".
   Los datos (REELS.datos) se pueden cargar en Node sin DOM; el reproductor solo corre en el navegador.
   Uso: <div id="reelsApp"></div> + <script src="../../js/arqui2-reels.js"></script> (después de comunes.js). */
(function () {
  'use strict';

  /* ================= DATOS ================= */
  const G = (titulo, texto) => ({ t: 'gancho', titulo, texto });
  const C = (titulo, texto, o) => Object.assign({ t: 'concepto', titulo, texto }, o || {});
  const TRUCO = texto => ({ t: 'concepto', titulo: 'Truco', texto, truco: true });
  const L = (titulo, items, o) => Object.assign({ t: 'lista', titulo, items }, o || {});
  const V = (a, b) => ({ t: 'vs', a: { t: a[0], items: a.slice(1) }, b: { t: b[0], items: b.slice(1) } });
  const TB = (titulo, filas) => ({ t: 'tabla', titulo, filas });
  const A = (anim, texto, d) => ({ t: 'anim', anim, texto, d: d || 11 });
  const Q = (p, o, c, e) => ({ t: 'quiz', p, o, c, e, d: 6 });

  const datos = [
    { id: 'r1', icono: '🔌', titulo: '¿Cómo se comunica el micro?', insignia: 'Conversador de puertos', cubre: [1,2,3,6,7,8], escenas: [
      G('Si te preguntan…', '¿Cómo se comunican los microprocesadores?'),
      L('Se comunican con', ['E/S (I/O)', 'Buses del sistema', 'Periféricos', 'Interrupciones', 'Sistemas operativos', 'Programas de aplicación']),
      L('Periféricos conectables', ['Pantallas', 'Teclados', 'Mouse', 'Almacenamiento', 'Impresoras', 'Escáneres']),
      C('Mapeo de puertos', 'Dar a cada puerto de E/S una dirección única para identificarlo, leer o escribir.'),
      C('Interfaz básica E/S', 'Circuito que permite al micro hablar con dispositivos externos por puertos, enviando y recibiendo datos.'),
      L('Cómo funciona', ['IN y OUT a puertos únicos', 'Datos por buffer y línea', 'Control marca entrada o salida']),
      C('Handshaking', 'Proceso CPU-dispositivo que evita pérdida, repetición o corrupción de datos; fundamental en interfaces síncronas.'),
      A('handshake', 'Pregunto, respondo, envío, confirmo.', 9),
      TRUCO('IN entra al micro. OUT sale del micro. Siempre desde el punto de vista del CPU.'),
      Q('¿Qué es el mapeo de puertos?', ['Dibujar los cables en un plano', 'Asignar a cada puerto de E/S una dirección única', 'Copiar la memoria a disco', 'Medir la velocidad del bus'], 1, 'Así el micro identifica el puerto y puede leer o escribir en él.'),
      Q('¿Para qué sirve el handshaking?', ['Para acelerar el reloj', 'Para evitar pérdida, repetición o corrupción de datos', 'Para apagar el dispositivo', 'Para decodificar direcciones'], 1, 'Es el proceso de acuerdo entre CPU y dispositivo durante la transferencia.'),
      Q('En una interfaz básica, ¿qué hacen las líneas de control?', ['Guardan el dato', 'Marcan si es entrada o salida', 'Generan el reloj', 'Traducen direcciones'], 1, 'El CPU usa IN/OUT; las líneas de control indican el sentido y el dispositivo responde a su dirección.')
    ] },

    { id: 'r2', icono: '🎯', titulo: 'Decodificación de puertos y wide port', insignia: 'Francotirador de direcciones', cubre: [9,10,11], escenas: [
      G('Si te preguntan…', '¿Qué es la decodificación de puertos?'),
      C('Decodificador', 'Circuito que recibe la dirección del micro y activa solo el puerto de esa dirección.'),
      A('bus', 'Solo se ilumina el puerto con su dirección.', 9),
      V(['8 bits', '1 byte', 'por operación'], ['16 bits', '1 palabra (2 bytes)', 'por operación']),
      C('Wide port', 'Puerto de 16 bits: una palabra por operación. Son dos puertos de 8 bits contiguos.'),
      TRUCO('Wide significa ancho: dos puertos de 8 pegados forman uno de 16.'),
      Q('¿Qué hace el decodificador de puertos?', ['Activa todos los puertos', 'Activa solo el puerto de la dirección recibida', 'Genera el reloj', 'Almacena datos'], 1, 'Recibe la dirección que pone el micro y habilita únicamente el puerto correspondiente.'),
      Q('Un puerto de 16 bits transfiere por operación…', ['Un byte', 'Una palabra de dos bytes', 'Cuatro bytes', 'Un bit'], 1, 'Una palabra (16 bits, dos bytes).'),
      Q('¿Qué es un wide port?', ['Un puerto de 8 bits con más pines', 'Puerto de 16 bits formado por dos puertos de 8 bits contiguos', 'Un puerto USB', 'Un puerto de memoria'], 1, 'Transfiere una palabra completa en una sola operación.')
    ] },

    { id: 'r3', icono: '🧩', titulo: 'Unidades de E/S, interfaces y APIs', insignia: 'Arquitecto de interfaces', cubre: [4,5,12,13,14,15], escenas: [
      G('Si te preguntan…', '¿Cuáles son las unidades de procesamiento de E/S?'),
      TB('Unidades 1/3', [['MMU', 'Virtual a física'], ['IOMMU', 'E/S virtual a física; aísla'], ['Caché', 'Acelera memoria']]),
      TB('Unidades 2/3', [['GPU', 'Gráficos 2D/3D'], ['NIC', 'Paquetes de red'], ['Disco', 'Comunica con discos']]),
      TB('Unidades 3/3', [['Audio', 'Procesa y reproduce'], ['Video', 'Procesa y reproduce'], ['USB GPIO PCIe', 'Otras interfaces']]),
      L('Ventajas de unidades extra', ['Mejoran el rendimiento', 'Permiten múltiples tareas', 'Optimizan recursos', 'Reducen cuellos de botella']),
      L('Interfaces', ['USB: plug-and-play', 'Serial: bit por bit', 'Paralelo: todos juntos', 'GPIO: pines', 'I2C: bus de sensores']),
      L('Se configuran con', ['Registros de propósito general', 'Mapa de puertos de E/S', 'Llamadas al sistema', 'Drivers e interrupciones']),
      C('API', 'Funciones estandarizadas para que aplicaciones se comuniquen, sin importar lenguaje o plataforma.'),
      L('Claves de las APIs', ['Facilitan integración y reutilización', 'Ocultan detalles internos', 'Funcionan en red']),
      TRUCO('USB, Serial, Paralelo, GPIO, I2C: «Un Señor Pide Gelato Italiano».'),
      Q('¿Qué hace la IOMMU?', ['Guarda instrucciones en la CPU', 'Traduce direcciones de E/S virtuales a físicas y aísla dispositivos', 'Procesa gráficos', 'Procesa paquetes de red'], 1, 'La MMU traduce direcciones virtuales a físicas; la IOMMU lo hace para E/S y aísla.'),
      Q('Interfaz que envía los bits todos a la vez:', ['Serial', 'Paralelo', 'I2C', 'GPIO'], 1, 'Serial va bit por bit; paralelo, todos los bits a la vez.'),
      Q('¿Qué es I2C según el profe?', ['Bus asíncrono de video', 'Bus síncrono simple para sensores', 'Puerto de pines programables', 'Interfaz Plug-and-Play'], 1, 'GPIO son pines programables; USB es Plug-and-Play.')
    ] },

    { id: 'r4', icono: '⚔️', titulo: 'PLD contra PPI', insignia: 'Juez de interfaces', cubre: [16,17,18,19,20,21,22,23], escenas: [
      G('Si te preguntan…', '¿Cuál es la diferencia entre un PPI y un PLD?'),
      V(['PLD', 'Genérico, reprogramable', 'Tú diseñas la lógica', 'Flexible, complejo'], ['PPI', 'Específico, predefinido', 'Simple, estándar', 'Función fija']),
      C('Qué es un PLD', 'Dispositivo lógico programable por el usuario; implementa lógica y E/S; decodifica puertos.'),
      L('Funciones del PLD', ['Decodifica direcciones', 'Activa puertos', 'Multipuertos', 'Reduce cableado', 'Más flexibilidad']),
      C('Qué es un PPI', 'Interfaz de E/S programable específica: implementa en hardware un protocolo de comunicación concreto.'),
      L('Ventajas del PPI', ['Funcionalidad predefinida', 'Rendimiento optimizado', 'Menor complejidad', 'Trae la interfaz hecha']),
      C('PLD gana cuando…', 'Necesitas interfaz personalizada, reconfigurable u optimizada, o producción pequeña con pocos recursos.'),
      L('Protocolos con PPI', ['UART', 'I2C', 'SPI', 'USB', 'Ethernet', 'GPIO']),
      L('Aplicaciones del PLD', ['Control industrial', 'Interfaces personalizadas', 'Decodificar direcciones de E/S', 'Electrónica automotriz', 'Sistemas embebidos']),
      TRUCO('PLD = Programo Lo Deseado. PPI = Protocolo Prefabricado Ya.'),
      Q('¿Cuál dispositivo es genérico y reprogramable?', ['PPI', 'PLD', 'Ambos', 'Ninguno'], 1, 'El PLD es flexible pero complejo; el PPI tiene la interfaz ya hecha y es fijo.'),
      Q('¿Cuál NO es un protocolo típico de un PPI?', ['UART', 'SPI', 'Ethernet', 'Decodificación de direcciones de E/S'], 3, 'Decodificar direcciones de E/S es aplicación del PLD.'),
      Q('Producción pequeña con interfaz personalizada: conviene…', ['PPI', 'PLD', 'API', 'DMA'], 1, 'Cuando se necesita interfaz personalizada o reconfigurable, mejor el PLD.')
    ] },

    { id: 'r5', icono: '📺', titulo: 'Señal de video compuesta y sincronía', insignia: 'Domador del haz', cubre: [24,25,26,27,28,29,30,31], escenas: [
      G('Si te preguntan…', '¿Qué es la señal de video compuesta?'),
      C('Señal de video', 'Señal eléctrica que transporta la imagen y su sincronización para reconstruirla en el monitor.'),
      C('Compuesta', 'Señal analógica que lleva luminancia, crominancia y pulsos de sincronización en un solo cable.'),
      A('scanline', 'Línea, pedestal, color burst e imagen.', 10),
      C('Pulso de sincronización', 'Sincroniza emisor y receptor para reconstruir la imagen entrelazada.'),
      L('Pulsos que incluye', ['Línea: inicio de cada línea', 'Trama: inicio de cada campo', 'Color burst: fase y color']),
      C('Pedestal', 'Tiempo en blanco entre el pulso horizontal y el primer píxel de la línea.'),
      V(['Pedestal muy corto', 'Distorsiona la imagen'], ['Pedestal muy largo', 'Reduce la resolución horizontal']),
      C('Color burst', 'Pulso estrecho de referencia al inicio de cada línea con croma: sincroniza la fase del color.'),
      TRUCO('Corto = imagen chueca. Largo = imagen angosta, pierde resolución.'),
      Q('¿Qué ocurre con un pedestal demasiado largo?', ['Distorsiona la imagen', 'Reduce la resolución horizontal', 'Pierde el color', 'Nada'], 1, 'Muy corto distorsiona; muy largo reduce la resolución horizontal.'),
      Q('Función principal del color burst:', ['Marcar el inicio de la trama', 'Sincronizar la fase del color y dar referencia para decodificarlo', 'Aumentar el brillo', 'Marcar el fin de línea'], 1, 'Es un pulso de referencia en las líneas con croma.'),
      Q('La señal compuesta lleva en un solo cable…', ['Solo luminancia', 'Luminancia, crominancia y sincronía', 'Solo audio', 'R, G y B por separado'], 1, 'Es analógica y viaja por un único cable.')
    ] },

    { id: 'r6', icono: '🎨', titulo: 'Monocromo, TTL, EGA y RGB', insignia: 'Pintor de píxeles', cubre: [32,33,34,35,36,37,38,39,40,41], escenas: [
      G('Si te preguntan…', '¿Cuál es la diferencia entre video monocromo y cromático?'),
      V(['Monocromo', 'Solo luminancia', 'Escala de grises'], ['Cromático', 'Luminancia más croma', 'Imagen a color']),
      L('Monocromo: piezas', ['CRT dispara electrones', 'Fósforo emite luz', 'Deflexión dibuja líneas', 'Sincronía alinea el haz', 'Señal regula intensidad']),
      C('TTL', 'Lógica transistor-transistor. El monitor TTL RGB trabajaba con tarjetas CGA y EGA.'),
      C('Monitor TTL RGB', 'Rojo, verde y azul en digital, encendidos o apagados: 8 colores, 16 con intensidad.'),
      C('Tonos y EGA', 'El cañón da tonos variando su intensidad. EGA: segunda señal por color primario, 16 colores.'),
      C('Televisor análogo', 'Recibe señales analógicas de rojo, verde y azul por separado, no una señal compuesta.'),
      L('Monitor RGB análogo', ['R, G, B por separado', 'No compuestas', 'Tres cañones, uno por color', 'No necesita decodificación']),
      V(['RGB', 'Colores en señales separadas', 'Mejor calidad'], ['RCA', 'Video compuesto en una señal', 'Audio en cables aparte']),
      TRUCO('TTL es todo o nada: 3 colores primarios, 2 al cubo igual 8; con intensidad, 16.'),
      Q('¿Qué significa TTL?', ['Tubo de Tres Líneas', 'Lógica transistor transistor', 'Tarjeta de Terminal Lineal', 'Televisión de Tubo Lento'], 1, 'Lógica transistor transistor.'),
      Q('¿Cuántos colores muestra un monitor TTL RGB?', ['2 o 4', '8, o 16 con intensidad', '256', 'Millones'], 1, 'Cada color solo encendido o apagado.'),
      Q('Diferencia entre RGB y RCA:', ['Ninguna', 'RGB envía colores en señales separadas y da mejor calidad; RCA envía video compuesto', 'RCA es digital', 'RGB lleva el audio'], 1, 'RCA envía el video compuesto en una sola señal, con el audio en cables aparte.')
    ] },

    { id: 'r7', icono: '🖥️', titulo: 'VGA, HDMI, DisplayPort y formatos', insignia: 'Maestro de resoluciones', cubre: [42,43,44,45,46,47,48,49,50,51], escenas: [
      G('Si te preguntan…', '¿Qué es VGA, HDMI y DisplayPort?'),
      L('VGA', ['256 colores simultáneos', '640x480', 'Analógico, mejor que EGA', 'Memoria de video dedicada', 'Compatible con CGA y EGA']),
      L('HDMI', ['Cable digital: video, audio y datos', 'Resoluciones altas', 'Audio multicanal', 'Protección HDCP', 'Control de dispositivos']),
      C('DisplayPort', 'Interfaz para pantallas digitales, compatible con 4K y futuros 8K.'),
      TB('Formatos 1/2', [['VGA', '640x480'], ['SVGA', '800x600'], ['XGA', '1024x768'], ['SXGA', '1280x1024']]),
      TB('Formatos 2/2', [['UXGA', '1600x1200'], ['WUXGA', '1920x1200'], ['QXGA', '2048x1536'], ['HD', '1280x720 1366x768 1920x1080']]),
      A('resoluciones', 'Rectángulos a escala: de VGA hasta 4K.', 9),
      L('Formatos más comunes', ['HD 720p y 1080p', 'Full HD 1080p', 'WQHD 1440p', '4K 2160p']),
      TB('Formatos generales', [['NTSC', '480i, Norteamérica y Japón'], ['PAL/SECAM', '576i, Europa'], ['2K 4K 8K', '2048x1080 3840x2160 7680x4320']]),
      C('RAM en video', 'Más resolución, videos, edición y compresión: más datos en RAM. La GPU integrada la comparte.'),
      L('Convertir señales', ['Adaptador pasivo: baja calidad, solo video', 'Convertidor activo: mejor, con audio', 'Tarjeta externa: más versátil']),
      TRUCO('Escalera: V-S-X-S-U-W-Q: VGA, SVGA, XGA, SXGA, UXGA, WUXGA, QXGA.'),
      Q('Resolución y colores del VGA según el profe:', ['320x200, 16 colores', '640x480, 256 colores simultáneos', '1024x768, 65 mil colores', '800x600, 2 colores'], 1, 'También es analógico y compatible con CGA y EGA.'),
      Q('¿Qué resolución es QXGA?', ['1600x1200', '2048x1536', '1920x1200', '1280x1024'], 1, 'UXGA 1600x1200, WUXGA 1920x1200, QXGA 2048x1536.'),
      Q('¿Cuál es el 4K estándar en la lista del profe?', ['1920x1080', '2560x1440', '3840x2160', '7680x4320'], 2, '8K es 7680x4320; 2K es 2048x1080.')
    ] },

    { id: 'r8', icono: '⏱️', titulo: 'Diagramas de tiempo T1 a T4', insignia: 'Relojero de buses', cubre: [52,53,54,55,56,57,58,59,60,61], escenas: [
      G('Si te preguntan…', '¿Qué ocurre en cada estado, de T1 a T4?'),
      L('Anatomía de la señal'
, ['Línea baja: 0', 'Línea alta: 1', 'Hexágono: varios bits cambian', 'Raya media: alta impedancia']),
      L('Símbolos clave', ['Flancos: subida o bajada', 'Flechas: un evento causa otro', 'Acotación: tiempo entre eventos']),
      A('timing', 'Ciclo de escritura: WR baja en T2 y T3.', 9),
      C('Ciclo de escritura', 'El procesador escribe un dato en memoria en cuatro estados de reloj, T1 a T4.'),
      TB('Estados', [['T1', 'Pone la dirección'], ['T2 y T3', 'WR activa y dato en bus'], ['T4', 'Termina; bus libre']]),
      C('Señales', 'CLK reloj, ADDRESS dirección válida, ADDRESS/DATA bus compartido, WR escritura activa en 0.'),
      C('Lectura y espera', 'Lectura: dirección, RD en 0, llega el dato. Espera: estados extra si READY es 0.'),
      L('Siglas de control 1/2', ['ALE: habilita el latch de dirección', 'IO/M: distingue E/S de memoria', 'S: selección']),
      L('Siglas de control 2/2', ['G (Gate): habilitación', 'CS: selecciona el chip', 'OE: habilita la salida']),
      TB('Ciclos de máquina', [['Opcode fetch', '0,1,1'], ['Memory read', '0,1,0'], ['Memory write', '0,0,1']]),
      TRUCO('Fetch 011 = 3, Read 010 = 2, Write 001 = 1: F, R, W.'),
      Q('¿Qué ocurre en T1 de un ciclo de escritura?', ['El dato se escribe', 'El procesador coloca la dirección en el bus', 'Se desactiva WR', 'Se insertan esperas'], 1, 'T2 y T3: escritura activa y dato en el bus; T4 termina y libera el bus.'),
      Q('Los ciclos de espera se insertan cuando…', ['READY está en 0', 'WR está en 1', 'ALE está en 1', 'IO/M está en 0'], 0, 'Sirven para adaptarse a memorias o dispositivos lentos.'),
      Q('Código de Memory write (S1,S0 según el profe):', ['0,1,1', '0,1,0', '0,0,1', '1,1,1'], 2, 'Opcode fetch 0,1,1; memory read 0,1,0; memory write 0,0,1.')
    ] },

    { id: 'r9', icono: '🚚', titulo: 'DMA: HOLD y HLDA', insignia: 'Piloto de DMA', cubre: [62,63,64,65], escenas: [
      G('Si te preguntan…', '¿Cómo es la operación básica del DMA?'),
      L('Operación básica', ['HOLD solicita el DMA', 'HLDA lo reconoce', 'Buses en alta impedancia', 'Datos directos memoria-E/S']),
      A('dma', 'La CPU suelta los buses; los datos van directo.', 15),
      V(['Lectura: memoria a E/S', 'MRDC + IOWC'], ['Escritura: E/S a memoria', 'MWTC + IORC']),
      C('Lectura de memoria a E/S', 'MRDC: la memoria entrega el dato al bus. IOWC: la E/S lo recibe.'),
      C('Escritura de E/S a memoria', 'MWTC: la memoria recibe el dato. IORC: la E/S lo entrega al bus.'),
      C('Prioridad', 'HOLD actúa a media instrucción. Solo RESET tiene más prioridad.'),
      C('Velocidad', 'Depende de la memoria o del controlador DMA, que suele reducir la velocidad del sistema.'),
      TRUCO('Los dos comandos son verbos opuestos: uno lee de un lado, el otro escribe.'),
      Q('¿Qué terminales activan la lectura de memoria a E/S?', ['MWTC + IORC', 'MRDC + IOWC', 'HOLD + HLDA', 'ALE + CS'], 1, 'La memoria entrega el dato (MRDC) y la E/S lo recibe (IOWC).'),
      Q('¿Qué señal tiene más prioridad que HOLD?', ['HLDA', 'Ninguna', 'RESET', 'READY'], 2, 'HOLD actúa a media instrucción y solo RESET tiene más prioridad.'),
      Q('Tras HOLD y HLDA, los buses del CPU quedan…', ['En 0 lógico', 'En alta impedancia', 'En 1 lógico', 'Apagados'], 1, 'Luego los datos pasan directo entre memoria y E/S.')
    ] },

    { id: 'r10', icono: '🧠', titulo: 'Controlador DMA 8237', insignia: 'Programador del 8237', cubre: [66,67,68,69,70,71,72], escenas: [
      G('Si te preguntan…', '¿Qué es el controlador DMA 8237?'),
      C('8237', 'Microprocesador específico compatible con el 8086/8088: genera señales de control y direccionamiento entre E/S y memoria.'),
      L('8237 en cifras', ['1.6 Mbps (como el profe)', 'Cuatro canales', '64 KB por canal', 'Compatible 8086/8088']),
      TB('Registros', [['CAR', 'Dirección actual'], ['CWCR', 'Cuenta actual'], ['CR', 'Comandos'], ['Modo', 'Modo de cada canal'], ['SR', 'Estado']]),
      C('Comandos de software', 'Órdenes activadas con una simple salida al puerto de E/S correcto, sin patrón de bits.'),
      C('Programar dirección y cuenta', 'Cargar en el 8237 la dirección de memoria y el número de bytes.'),
      L('Los tres comandos', ['Limpiar biestable P/U: byte bajo o alto', 'Limpieza maestra: como RESET', 'Limpiar máscara: 4 canales']),
      L('Pasos para programar', ['Limpiar flip-flop P/U', 'Deshabilitar el canal', 'Dirección: LSB, MSB', 'Cuenta: LSB, MSB'], { ord: true }),
      TRUCO('Limpia, Deshabilita, Dirección, Cuenta: «LDDC». Siempre LSB primero.'),
      Q('¿Cuántos canales y de qué tamaño tiene el 8237?', ['2 canales de 32 KB', '4 canales de 64 KB', '8 canales de 16 KB', '1 canal de 1 MB'], 1, 'Cuatro canales que direccionan secciones de 64 KB.'),
      Q('¿Qué guarda el registro CWCR?', ['La dirección actual', 'Cuántos bytes se transfieren (cuenta actual)', 'El estado de cada canal', 'Los comandos'], 1, 'CAR guarda la dirección; CR programa la operación; SR muestra el estado.'),
      Q('Primer paso para programar el 8237:', ['Cargar la cuenta', 'Limpiar el flip-flop P/U', 'Cargar el MSB', 'Habilitar el canal'], 1, 'Luego: deshabilitar el canal, cargar dirección (LSB y MSB) y cuenta (LSB y MSB).')
    ] },

    { id: 'r11', icono: '🚌', titulo: 'Buses y el árbitro 8289', insignia: 'Árbitro de buses', cubre: [73,74,75,76,77,78,79], escenas: [
      G('Si te preguntan…', '¿Qué diferencia hay entre bus local y bus compartido?'),
      V(['Local', 'Residente del micro', 'E/S locales', 'Sin protocolos'], ['Compartido', 'Todos los micros', 'Intercambian datos', 'E/S comunes']),
      C('Maestro de bus', 'Cualquier dispositivo que controla un bus con memoria y E/S. El 8237 es un ejemplo.'),
      V(['Micro maestro', 'Ejecuta software variable'], ['Controlador DMA', 'Solo transfiere datos']),
      C('Acceso al bus compartido', 'Pin HOLD y un árbitro que da prioridad: solo un maestro a la vez.'),
      L('Modos del 8289', ['Bus periférico E/S', 'Residente: memoria y E/S, local o compartido', 'Único: solo al bus compartido']),
      C('Operación con 8289', 'El maestro del bus compartido controla; los demás ejecutan tareas y las reportan.'),
      TRUCO('Local = lo mío. Compartido = de todos. Árbitro = quien da el turno.'),
      Q('¿Qué es un maestro de bus?', ['Un cable especial', 'Cualquier dispositivo que puede controlar un bus con memoria y E/S', 'Un tipo de memoria', 'Una interrupción'], 1, 'El 8237 es un ejemplo.'),
      Q('Diferencia entre micro maestro y controlador DMA:', ['Ninguna', 'El micro ejecuta software variable; el DMA solo transfiere datos', 'El DMA ejecuta programas', 'El micro no usa buses'], 1, 'El DMA es específico para transferir.'),
      Q('¿Cómo se accede al bus compartido?', ['Sin control', 'Con HOLD y un árbitro de bus que da prioridad', 'Con IN y OUT', 'Con un reloj extra'], 1, 'Solo un maestro a la vez.')
    ] },

    { id: 'r12', icono: '🖱️', titulo: 'Mouse INT 33h y Retos 1 y 2', insignia: 'Cazador de clics', cubre: [], escenas: [
      G('Si te piden leer el mouse…', 'Usa INT 33h con AX = 0000h a 0003h.'),
      TB('INT 33h', [['0000h', 'Inicializa; AX=0 sin mouse'], ['0001h', 'Muestra puntero'], ['0002h', 'Oculta puntero'], ['0003h', 'Lee el estado']]),
      C('AX=0003h devuelve', 'BX: botones (bit 0 izquierdo, bit 1 derecho). CX: X. DX: Y.'),
      A('mouse', 'Modo texto: columna = CX ÷ 8, fila = DX ÷ 8.', 10),
      C('Modo texto 80x25', 'Coordenadas virtuales 640x200: dividir entre 8 da columna y fila.', { ded: true }),
      L('Reto 1', ['BX=3 (ambos): sale', 'BX=1: imprime I', 'BX=2: imprime D', 'EsperaSoltar: anti-rebote']),
      L('Reto 2', ['BX=1 o BX=2', 'Izquierdo con CX ≤ 40, DX ≤ 10: sale', 'Fuera: I', 'Derecho: D']),
      C('Zona caliente', 'CMP CX,40 y CMP DX,10 con JA (sin signo). Cubre columnas 0-5 y filas 0-1.', { ded: true }),
      TRUCO('CMP exige igualdad exacta; TEST mira un bit. Con BX=3, CMP BX,1 falla.'),
      Q('Reto 1: ¿cuándo termina el programa?', ['Con cualquier clic izquierdo', 'Solo cuando se presionan ambos botones (BX = 3)', 'Con clic derecho', 'Tras 10 clics'], 1, 'cmp bx,3 / je Salir, en el sondeo y en EsperaSoltar.'),
      Q('Reto 2: ¿cuál es la zona caliente?', ['CX 0-80 y DX 0-25', 'CX ≤ 40 y DX ≤ 10 (clic izquierdo)', 'CX ≥ 40 y DX ≥ 10', 'Solo el carácter [X]'], 1, 'Los extremos 40 y 10 cuentan como dentro.'),
      Q('Reto 2: clic derecho dentro de la zona…', ['Cierra el programa', 'Imprime D y no cierra', 'No hace nada', 'Imprime I'], 1, 'La zona solo se evalúa en ClicIzquierdo.')
    ] }
  ];

  /* ---------- utilidades de datos (también sirven en Node) ---------- */
  const palabrasTxt = s => String(s == null ? '' : s).trim().split(/\s+/).filter(Boolean).length;
  /* Palabras visibles en una escena de texto (el quiz no cuenta: es interactivo). */
  function palabras(e) {
    if (e.t === 'quiz') return 0;
    let n = palabrasTxt(e.titulo) + palabrasTxt(e.texto);
    (e.items || []).forEach(i => n += palabrasTxt(i));
    ['a', 'b'].forEach(k => { if (e[k]) { n += palabrasTxt(e[k].t); e[k].items.forEach(i => n += palabrasTxt(i)); } });
    (e.filas || []).forEach(f => f.forEach(c => n += palabrasTxt(c)));
    return n;
  }
  /* Duración (s) de una escena: explícita, o según las palabras. */
  const dur = e => e.d || Math.max(3, Math.min(6, 2 + palabras(e) * 0.2));
  const durReel = r => r.escenas.reduce((s, e) => s + dur(e), 0);
  /* Texto plano de una escena (guion, narración, aria-live). */
  function textoEscena(e) {
    if (e.t === 'quiz') return 'Pregunta rápida. ' + e.p;
    const p = [];
    if (e.titulo) p.push(e.titulo + '.');
    if (e.texto) p.push(e.texto);
    (e.items || []).forEach(i => p.push(i + '.'));
    ['a', 'b'].forEach(k => { if (e[k]) p.push(e[k].t + ': ' + e[k].items.join(', ') + '.'); });
    (e.filas || []).forEach(f => p.push(f.join(': ') + '.'));
    return p.join(' ');
  }
  datos.forEach(r => r.escenas.forEach(e => { e.d = dur(e); }));

  /* ================= REPRODUCTOR (solo navegador) ================= */
  const API = { datos, palabras, dur, durReel, textoEscena, montar: function () { } };
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const CL = window.Comunes || {};
    const store = CL.store || { get() { return null; }, set() { } };
    const CLAVE = 'arq2f-reels';
    const NS = 'http://www.w3.org/2000/svg';
    let uid = 0;

    const h = (tag, cls, txt, attrs) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (txt != null) e.textContent = txt;
      if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
      return e;
    };
    const sv = (tag, attrs, parent, txt) => {
      const e = document.createElementNS(NS, tag);
      Object.keys(attrs || {}).forEach(k => e.setAttribute(k, attrs[k]));
      if (txt != null) e.textContent = txt;
      if (parent) parent.appendChild(e);
      return e;
    };
    const lerp = (a, b, f) => a + (b - a) * f;
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const fmt = s => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

    /* ---------- Animaciones SVG: cada una devuelve update(t, d) ---------- */
    function nodo(svg, x, y, w, hh, txt, cls) {
      const g = sv('g', {}, svg);
      const r = sv('rect', { x, y, width: w, height: hh, rx: 8, class: 'rl-nd' + (cls ? ' ' + cls : '') }, g);
      const tx = sv('text', { x: x + w / 2, y: y + hh / 2 + 4, 'text-anchor': 'middle', class: 'rl-tx' }, g, txt);
      return { g, r, tx };
    }
    const linea = (svg, x1, y1, x2, y2, cls) => sv('line', { x1, y1, x2, y2, class: 'rl-ln ' + (cls || '') }, svg);

    const ANIM = {
      bus(svg) {
        const P = ['20h', '60h', '80h', 'F8h'];
        const cpu = nodo(svg, 6, 100, 58, 56, 'CPU');
        const dec = nodo(svg, 118, 92, 66, 72, 'Decod.');
        const puertos = P.map((p, i) => {
          const n = nodo(svg, 226, 14 + i * 62, 68, 44, 'Puerto ' + p);
          const w = linea(svg, 184, 128, 226, 36 + i * 62);
          return { n, w };
        });
        const w1 = linea(svg, 64, 128, 118, 128);
        const lab = sv('text', { x: 91, y: 90, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, '');
        const pkt = sv('circle', { r: 7, class: 'rl-pk', cx: 64, cy: 128 }, svg);
        const cap = sv('text', { x: 150, y: 246, 'text-anchor': 'middle', class: 'rl-mut' }, svg, '');
        return (t) => {
          const per = 5, k = Math.floor(t / per) % 4, f = (t % per) / per;
          lab.textContent = 'Dir ' + P[k];
          puertos.forEach((p, i) => {
            const on = i === k && f > 0.5;
            p.n.r.classList.toggle('on', on); p.w.classList.toggle('on', i === k && f > 0.3);
            p.n.g.style.opacity = (f > 0.3 && i !== k) ? .3 : 1;
          });
          dec.r.classList.toggle('on', f > 0.3 && f < 0.9); w1.classList.toggle('on', f < 0.3);
          let x, y;
          if (f < 0.3) { x = lerp(64, 118, f / 0.3); y = 128; }
          else if (f < 0.55) { x = 151; y = 128; }
          else { const g = clamp((f - 0.55) / 0.3, 0, 1); x = lerp(184, 226, g); y = lerp(128, 36 + k * 62, g); }
          pkt.setAttribute('cx', x); pkt.setAttribute('cy', y);
          pkt.style.opacity = f > 0.9 ? 0 : 1;
          cap.textContent = f < 0.3 ? 'El CPU pone la dirección' : f < 0.55 ? 'El decodificador la compara' : 'Solo ese puerto se activa';
        };
      },
      handshake(svg) {
        nodo(svg, 8, 50, 74, 130, 'CPU'); nodo(svg, 218, 50, 74, 130, 'Dispositivo');
        const l1 = linea(svg, 82, 84, 218, 84), l2 = linea(svg, 218, 124, 82, 124), l3 = linea(svg, 82, 164, 218, 164);
        const t1 = sv('text', { x: 150, y: 76, 'text-anchor': 'middle', class: 'rl-tx' }, svg, '¿Estás listo?');
        const t2 = sv('text', { x: 150, y: 116, 'text-anchor': 'middle', class: 'rl-tx' }, svg, 'Listo (ACK)');
        const t3 = sv('text', { x: 150, y: 156, 'text-anchor': 'middle', class: 'rl-tx' }, svg, 'Dato');
        const pkt = sv('circle', { r: 8, class: 'rl-pk', cx: 82, cy: 164 }, svg);
        const cap = sv('text', { x: 150, y: 222, 'text-anchor': 'middle', class: 'rl-mut' }, svg, '');
        return (t) => {
          const c = t % 8;
          const fase = c < 1.8 ? 0 : c < 3.6 ? 1 : c < 5.6 ? 2 : 3;
          l1.classList.toggle('on', fase === 0); t1.style.opacity = fase === 0 ? 1 : .35;
          l2.classList.toggle('on', fase === 1 || fase === 3); t2.style.opacity = (fase === 1 || fase === 3) ? 1 : .35;
          t2.textContent = fase === 3 ? 'Recibido' : 'Listo (ACK)';
          l3.classList.toggle('on', fase === 2); t3.style.opacity = fase === 2 ? 1 : .35;
          pkt.style.opacity = fase === 2 ? 1 : 0;
          pkt.setAttribute('cx', lerp(82, 218, clamp((c - 3.6) / 2, 0, 1)));
          cap.textContent = ['1. Pregunta', '2. Responde', '3. Envía el dato', '4. Confirma'][fase];
        };
      },
      dma(svg) {
        const cpu = nodo(svg, 8, 10, 84, 46, 'CPU'), dmac = nodo(svg, 208, 10, 84, 46, '8237 DMA');
        const mem = nodo(svg, 8, 196, 84, 40, 'Memoria'), es = nodo(svg, 208, 196, 84, 40, 'E/S');
        const bus = linea(svg, 75, 150, 225, 150, 'bus');
        const sc = linea(svg, 75, 56, 75, 150), sd = linea(svg, 225, 56, 225, 150, 'on'), sm = linea(svg, 75, 150, 75, 196, 'on'), se = linea(svg, 225, 150, 225, 196, 'on');
        const hold = linea(svg, 208, 26, 92, 26), hlda = linea(svg, 92, 44, 208, 44);
        const th = sv('text', { x: 150, y: 20, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, 'HOLD');
        const ta = sv('text', { x: 150, y: 60, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, 'HLDA');
        const z = sv('text', { x: 82, y: 84, class: 'rl-mut' }, svg, '');
        const cm = sv('text', { x: 10, y: 186, class: 'rl-tx b' }, svg, ''), ce = sv('text', { x: 290, y: 186, 'text-anchor': 'end', class: 'rl-tx b' }, svg, '');
        const pkt = sv('circle', { r: 7, class: 'rl-pk', cx: 75, cy: 196 }, svg);
        const cap = sv('text', { x: 150, y: 120, 'text-anchor': 'middle', class: 'rl-mut' }, svg, '');
        const ruta = (f, ida) => { // memoria(75,196) -> (75,150) -> (225,150) -> (225,196)
          if (!ida) f = 1 - f;
          if (f < 1 / 5) return [75, lerp(196, 150, f * 5)];
          if (f < 4 / 5) return [lerp(75, 225, (f - 1 / 5) / (3 / 5)), 150];
          return [225, lerp(150, 196, (f - 4 / 5) * 5)];
        };
        return (t) => {
          const c = t % 15;
          hold.classList.toggle('on', c >= 0 && c < 2.2); th.style.opacity = c < 2.2 ? 1 : .35;
          hlda.classList.toggle('on', c >= 2.2 && c < 4.4); ta.style.opacity = (c >= 2.2 && c < 4.4) ? 1 : .35;
          const libre = c >= 2.2 && c < 14;
          sc.classList.toggle('z', libre); z.textContent = libre ? 'alta impedancia' : '';
          cpu.r.classList.toggle('on', !libre);
          dmac.r.classList.toggle('on', c >= 2.2 && c < 14);
          bus.classList.toggle('on', c >= 4.4 && c < 14);
          let msg = 'DMA pide el bus (HOLD)';
          pkt.style.opacity = 0; cm.textContent = ''; ce.textContent = '';
          if (c >= 2.2) msg = 'La CPU responde (HLDA) y suelta los buses';
          if (c >= 4.4 && c < 9.2) { // memoria -> E/S
            msg = 'Lectura: memoria → E/S'; cm.textContent = 'MRDC'; ce.textContent = 'IOWC';
            const [x, y] = ruta(((c - 4.4) % 2.4) / 2.4, true); pkt.setAttribute('cx', x); pkt.setAttribute('cy', y); pkt.style.opacity = 1;
          } else if (c >= 9.2 && c < 14) {
            msg = 'Escritura: E/S → memoria'; cm.textContent = 'MWTC'; ce.textContent = 'IORC';
            const [x, y] = ruta(((c - 9.2) % 2.4) / 2.4, false); pkt.setAttribute('cx', x); pkt.setAttribute('cy', y); pkt.style.opacity = 1;
          } else if (c >= 14) msg = 'Termina: la CPU recupera los buses';
          cap.textContent = msg;
        };
      },
      timing(svg, d) {
        const id = 'rlclip' + (++uid);
        const defs = sv('defs', {}, svg), cp = sv('clipPath', { id }, defs), cr = sv('rect', { x: 50, y: 0, width: 0, height: 230 }, cp);
        [['CLK', 46], ['AD', 100], ['WR', 160]].forEach(([n, y]) => sv('text', { x: 4, y: y + 4, class: 'rl-mut' }, svg, n));
        [110, 170, 230].forEach(x => sv('line', { x1: x, y1: 20, x2: x, y2: 190, class: 'rl-ln dash' }, svg));
        ['T1', 'T2', 'T3', 'T4'].forEach((n, i) => sv('text', { x: 80 + 60 * i, y: 14, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, n));
        const g = sv('g', { 'clip-path': 'url(#' + id + ')' }, svg);
        let p = 'M50 58';
        for (let i = 0; i < 4; i++) { const x = 50 + 60 * i; p += ' L' + x + ' 34 L' + (x + 30) + ' 34 L' + (x + 30) + ' 58 L' + (x + 60) + ' 58'; }
        sv('path', { d: p, class: 'rl-w' }, g);
        sv('polygon', { points: '50,100 56,88 104,88 110,100 104,112 56,112', class: 'rl-w fillsoft' }, g);
        sv('polygon', { points: '110,100 116,88 224,88 230,100 224,112 116,112', class: 'rl-w fillsoft' }, g);
        sv('line', { x1: 230, y1: 100, x2: 290, y2: 100, class: 'rl-w dash' }, g);
        sv('text', { x: 80, y: 104, 'text-anchor': 'middle', class: 'rl-tx' }, g, 'DIR');
        sv('text', { x: 170, y: 104, 'text-anchor': 'middle', class: 'rl-tx' }, g, 'DATO');
        sv('text', { x: 260, y: 92, 'text-anchor': 'middle', class: 'rl-mut' }, g, 'alta Z');
        sv('path', { d: 'M50 148 L110 148 L110 172 L230 172 L230 148 L290 148', class: 'rl-w acc' }, g);
        const cur = sv('line', { x1: 50, y1: 20, x2: 50, y2: 190, class: 'rl-cur' }, svg);
        const cap = sv('text', { x: 150, y: 218, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, '');
        const msgs = ['T1: el procesador coloca la dirección', 'T2: WR baja, el dato va al bus', 'T3: la escritura sigue activa', 'T4: termina; el bus queda libre'];
        return (t, dd) => {
          const f = clamp(t / ((dd || 12) * 0.8), 0, 1), x = 50 + 240 * f;
          cr.setAttribute('width', 240 * f); cur.setAttribute('x1', x); cur.setAttribute('x2', x);
          cap.textContent = msgs[Math.min(3, Math.floor(f * 4))];
        };
      },
      scanline(svg) {
        sv('rect', { x: 10, y: 8, width: 280, height: 120, rx: 6, class: 'rl-nd' }, svg);
        const N = 9, rows = [];
        for (let i = 0; i < N; i++) rows.push(sv('line', { x1: 14, y1: 16 + i * 13, x2: 14, y2: 16 + i * 13, class: 'rl-w' }, svg));
        const beam = sv('circle', { r: 4, class: 'rl-pk', cx: 14, cy: 16 }, svg);
        const regs = [[10, 40, 'Pulso de línea'], [40, 75, 'Pedestal'], [75, 105, 'Color burst'], [105, 290, 'Imagen (luminancia + croma)']];
        const hl = regs.map(r => sv('rect', { x: r[0], y: 150, width: r[1] - r[0], height: 70, class: 'rl-hl' }, svg));
        let p = 'M10 160 L18 160 L18 212 L40 212 L40 178 L75 178';
        p += ' L75 170';
        for (let i = 0; i < 6; i++) p += ' L' + (79 + i * 4) + ' ' + (i % 2 ? 186 : 170);
        p += ' L105 178 L120 160 L140 190 L160 168 L180 196 L200 172 L220 188 L245 164 L270 192 L290 178';
        sv('path', { d: p, class: 'rl-w' }, svg);
        const cap = sv('text', { x: 150, y: 242, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, '');
        sv('text', { x: 150, y: 142, 'text-anchor': 'middle', class: 'rl-mut' }, svg, 'Una línea de la señal de video');
        return (t) => {
          const u = (t % 5) / 5 * N, row = Math.floor(u), fr = u - row;
          rows.forEach((l, i) => l.setAttribute('x2', i < row ? 286 : i === row ? 14 + 272 * fr : 14));
          beam.setAttribute('cx', 14 + 272 * fr); beam.setAttribute('cy', 16 + row * 13);
          const k = Math.floor(t / 1.6) % 4;
          hl.forEach((r, i) => r.classList.toggle('on', i === k));
          cap.textContent = regs[k][2];
        };
      },
      resoluciones(svg, d) {
        const F = [['VGA', 640, 480], ['SVGA', 800, 600], ['XGA', 1024, 768], ['HD 720p', 1280, 720], ['SXGA', 1280, 1024], ['UXGA', 1600, 1200],
          ['Full HD', 1920, 1080], ['WUXGA', 1920, 1200], ['QXGA', 2048, 1536], ['4K', 3840, 2160]];
        F.sort((a, b) => a[1] * a[2] - b[1] * b[2]);
        const s = 0.075;
        const rs = F.map(f => sv('rect', { x: 6, y: 6, width: f[1] * s, height: f[2] * s, class: 'rl-res' }, svg));
        const cap = sv('text', { x: 150, y: 214, 'text-anchor': 'middle', class: 'rl-tx b' }, svg, '');
        const cap2 = sv('text', { x: 150, y: 232, 'text-anchor': 'middle', class: 'rl-mut' }, svg, '');
        return (t, dd) => {
          const k = Math.min(F.length - 1, Math.floor(t / ((dd || 12) * 0.85) * F.length));
          rs.forEach((r, i) => { r.style.opacity = i > k ? 0 : 1; r.classList.toggle('on', i === k); });
          cap.textContent = F[k][0] + ' · ' + F[k][1] + 'x' + F[k][2];
          cap2.textContent = Math.round(F[k][1] * F[k][2] / 1000) + ' mil píxeles';
        };
      },
      mouse(svg) {
        const x0 = 10, y0 = 8, cs = 3.5;
        sv('rect', { x: x0, y: y0, width: 80 * cs, height: 25 * cs, class: 'rl-nd' }, svg);
        for (let c = 10; c < 80; c += 10) sv('line', { x1: x0 + c * cs, y1: y0, x2: x0 + c * cs, y2: y0 + 25 * cs, class: 'rl-ln dash' }, svg);
        for (let r = 5; r < 25; r += 5) sv('line', { x1: x0, y1: y0 + r * cs, x2: x0 + 80 * cs, y2: y0 + r * cs, class: 'rl-ln dash' }, svg);
        sv('rect', { x: x0, y: y0, width: 6 * cs, height: 2 * cs, class: 'rl-zona' }, svg);
        sv('text', { x: x0 + 3 * cs, y: y0 + 2 * cs + 11, 'text-anchor': 'middle', class: 'rl-mut' }, svg, '[X]');
        sv('text', { x: 150, y: y0 + 25 * cs + 12, 'text-anchor': 'middle', class: 'rl-mut' }, svg, 'pantalla de texto 80x25');
        const cur = sv('rect', { width: 5, height: 5, class: 'rl-cursor' }, svg);
        const l1 = sv('text', { x: 14, y: 140, class: 'rl-tx b' }, svg, ''), l2 = sv('text', { x: 14, y: 160, class: 'rl-tx' }, svg, '');
        const l3 = sv('text', { x: 14, y: 180, class: 'rl-tx' }, svg, ''), l4 = sv('text', { x: 14, y: 204, class: 'rl-tx b' }, svg, '');
        const W = [[0, 400, 150, 0], [2, 200, 88, 0], [3.5, 200, 88, 1], [4.5, 200, 88, 0], [6, 24, 8, 0], [7, 24, 8, 1], [9, 24, 8, 1]];
        return (t) => {
          const c = t % 9;
          let i = 0; while (i < W.length - 2 && c >= W[i + 1][0]) i++;
          const a = W[i], b = W[i + 1], f = clamp((c - a[0]) / (b[0] - a[0]), 0, 1);
          const px = lerp(a[1], b[1], f), py = lerp(a[2], b[2], f), bx = a[3];
          const cx = Math.floor(px / 8) * 8, dx = Math.floor(py / 8) * 8;
          cur.setAttribute('x', x0 + (cx / 8) * cs); cur.setAttribute('y', y0 + (dx / 8) * cs);
          l1.textContent = 'BX = ' + bx + (bx === 1 ? '  (izquierdo)' : '  (ninguno)');
          l2.textContent = 'CX = ' + cx + '    DX = ' + dx;
          l3.textContent = 'columna = ' + cx + ' ÷ 8 = ' + (cx / 8) + '    fila = ' + dx + ' ÷ 8 = ' + (dx / 8);
          const dentro = cx <= 40 && dx <= 10;
          l4.textContent = bx === 1 ? (dentro ? 'Clic en zona caliente: ¡SALE!' : 'Clic fuera de la zona: imprime I') : (dentro ? 'Dentro de la zona (CX ≤ 40, DX ≤ 10)' : 'Fuera de la zona');
        };
      }
    };

    /* ---------- Reproductor ---------- */
    function montar(raiz) {
      raiz = typeof raiz === 'string' ? document.querySelector(raiz) : raiz;
      if (!raiz || raiz.dataset.rlOk) return null;
      raiz.dataset.rlOk = '1';
      const rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
      const hayVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      let prog = store.get(CLAVE) || {};
      prog = { xp: prog.xp | 0, racha: prog.racha | 0, mejor: prog.mejor | 0, vistos: prog.vistos || {}, ok: prog.ok || {} };
      const guardar = () => store.set(CLAVE, prog);

      // estado
      const S = { r: 0, i: 0, t: 0, dur: 1, iniciado: false, pausa: false, mano: false, oculto: false, fuera: false, vel: 1, voz: false,
        espera: false, fin: false, cuenta: null, anulaCuenta: false, ult: 0, raf: 0, upd: null, revel: [], guion: false };
      const timers = [];
      const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
      const limpiaTimers = () => { timers.splice(0).forEach(clearTimeout); };

      // ----- esqueleto (HTML estático, sin datos) -----
      raiz.textContent = '';
      raiz.classList.add('rl-app');
      const top = h('div', 'rl-top');
      const xpEl = h('span', 'rl-xp'), rachaEl = h('span', 'rl-racha'), contEl = h('span', 'rl-cont');
      const reset = h('button', 'rl-btn-txt', 'Reiniciar progreso', { type: 'button', 'aria-label': 'Reiniciar el progreso de los reels' });
      top.append(xpEl, rachaEl, contEl, reset);

      const cuerpo = h('div', 'rl-cols');
      const player = h('div', 'rl-player');
      const stage = h('div', 'rl-stage', null, { tabindex: '0', role: 'region', 'aria-label': 'Reproductor de reels' });
      const bars = h('div', 'rl-bars');
      const bar = h('div', 'rl-bar');
      const tit = h('div', 'rl-tit');
      const btns = h('div', 'rl-btns');
      const mkBtn = (txt, label) => h('button', 'rl-btn', txt, { type: 'button', 'aria-label': label, title: label });
      const bVoz = mkBtn('🔊', 'Activar narración'), bVel = mkBtn('1x', 'Velocidad de reproducción'), bGuion = mkBtn('📜', 'Ver guion'), bFull = mkBtn('⛶', 'Pantalla completa');
      bVoz.setAttribute('aria-pressed', 'false'); bGuion.setAttribute('aria-pressed', 'false');
      if (!hayVoz) bVoz.hidden = true;
      btns.append(bVoz, bVel, bGuion, bFull);
      const head = h('div', 'rl-head'); head.append(tit, btns);
      const body = h('div', 'rl-body');
      const pausaEl = h('div', 'rl-pausa', '⏸'); pausaEl.hidden = true;
      const live = h('div', 'rl-sr', null, { 'aria-live': 'polite', 'aria-atomic': 'true' });
      stage.append(bars, head, body, pausaEl, live);
      player.append(stage);

      const lado = h('div', 'rl-lado');
      const lista = h('ol', 'rl-lista');
      const guionEl = h('div', 'rl-guion'); guionEl.hidden = true;
      lado.append(h('h4', 'rl-h4', 'Reels'), lista, guionEl);
      cuerpo.append(player, lado);

      // guion completo (solo impresión)
      const imp = h('div', 'rl-print');
      imp.append(h('h4', null, 'Guion de los reels (Arquitectura II · Final)'));
      datos.forEach((r, ri) => {
        imp.append(h('h5', null, (ri + 1) + '. ' + r.titulo));
        const ul = h('ul'); r.escenas.forEach(e => {
          if (e.t === 'quiz') { ul.append(h('li', null, 'Pregunta: ' + e.p + ' Respuesta: ' + e.o[e.c] + '. ' + e.e)); return; }
          ul.append(h('li', null, (e.truco ? '[Truco, deducido] ' : e.ded ? '[Deducido] ' : '') + textoEscena(e)));
        });
        imp.append(ul);
      });
      raiz.append(top, cuerpo, imp);

      // ----- lista de reels -----
      const items = datos.map((r, i) => {
        const li = h('li'); const b = h('button', 'rl-item', null, { type: 'button' });
        const ck = h('span', 'rl-ck'); b.append(h('span', 'rl-ic', r.icono), h('span', 'rl-nm', (i + 1) + '. ' + r.titulo), h('span', 'rl-du', fmt(durReel(r))), ck);
        b.addEventListener('click', () => abrir(i, true));
        li.append(b); lista.append(li); return { li, b, ck };
      });
      function pintaStats() {
        const n = datos.filter(r => prog.vistos[r.id]).length;
        xpEl.textContent = '⚡ ' + prog.xp + ' XP · nivel ' + (Math.floor(prog.xp / 50) + 1);
        rachaEl.textContent = '🔥 racha ' + prog.racha + ' (mejor ' + prog.mejor + ')';
        contEl.textContent = '✓ ' + n + '/' + datos.length;
        items.forEach((it, i) => {
          const v = !!prog.vistos[datos[i].id];
          it.ck.textContent = v ? '✓' : ''; it.li.classList.toggle('ok', v);
          it.b.setAttribute('aria-label', 'Reel ' + (i + 1) + ': ' + datos[i].titulo + (v ? ' (visto)' : ''));
          if (i === S.r) it.b.setAttribute('aria-current', 'true'); else it.b.removeAttribute('aria-current');
        });
      }

      // ----- narración -----
      function vozEs() {
        const vs = speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
        return vs.find(v => /^es[-_]/i.test(v.lang)) || null;
      }
      function hablar(txt) {
        if (!hayVoz) return;
        try { speechSynthesis.cancel(); } catch (e) { }
        if (!S.voz || !txt) return;
        try {
          const u = new SpeechSynthesisUtterance(txt); const v = vozEs();
          u.lang = v ? v.lang : 'es-MX'; if (v) u.voice = v; u.rate = Math.min(2, S.vel);
          speechSynthesis.speak(u);
        } catch (e) { }
      }

      // ----- escenas -----
      const reel = () => datos[S.r];
      const esc = () => reel().escenas[S.i];
      const pausado = () => S.pausa || S.mano || S.oculto || S.fuera || !S.iniciado;

      function pintaBarras() {
        bars.textContent = '';
        reel().escenas.forEach(() => { const b = h('div', 'rl-b'); b.append(h('i')); bars.append(b); });
        S.bar = bars.children;
      }
      function pintaBarra() {
        const n = reel().escenas.length;
        for (let k = 0; k < n; k++) {
          const f = S.fin || k < S.i ? 1 : k === S.i ? (S.espera ? 0 : clamp(S.t / S.dur, 0, 1)) : 0;
          S.bar[k].firstChild.style.width = (f * 100) + '%';
        }
      }
      function portada() {
        body.textContent = '';
        const r = reel();
        const w = h('div', 'rl-sc rl-portada rl-in');
        w.append(h('div', 'rl-big', r.icono), h('div', 'rl-etq', 'Reel ' + (S.r + 1) + ' de ' + datos.length), h('h3', 'rl-ptit', r.titulo),
          h('p', 'rl-psub', r.escenas[0].titulo + ' ' + r.escenas[0].texto), h('p', 'rl-pdu', '≈ ' + fmt(durReel(r)) + ' · ' + r.escenas.length + ' escenas · ' + r.escenas.filter(e => e.t === 'quiz').length + ' preguntas'));
        const go = h('button', 'rl-go', '▶ Ver reel', { type: 'button' });
        go.addEventListener('click', () => { S.iniciado = true; S.pausa = false; portadaOff(); pintaEscena(); });
        w.append(go); body.append(w);
        tit.textContent = r.icono + ' ' + r.titulo;
        pintaBarras(); S.t = 0; S.dur = 1; S.fin = false; S.espera = false; S.upd = null; S.revel = []; pintaBarra();
      }
      const portadaOff = () => { body.textContent = ''; };

      function cabecera(e, cls) {
        const w = h('div', 'rl-sc rl-in ' + cls);
        if (e.titulo) w.append(h('div', e.t === 'gancho' ? 'rl-gan' : 'rl-st', e.titulo));
        return w;
      }
      function insignia(w, e) {
        if (e.truco) { const b = h('span', 'badge ded rl-bd', 'truco · deducido'); w.prepend(b); }
        else if (e.ded) { const b = h('span', 'badge ded rl-bd', 'deducido'); w.prepend(b); }
      }

      function pintaEscena() {
        limpiaTimers(); S.fin = false; S.espera = false; S.upd = null; S.revel = [];
        const e = esc(), n = reel().escenas.length;
        S.t = 0; S.dur = e.d; body.textContent = ''; body.scrollTop = 0;
        tit.textContent = reel().icono + ' ' + reel().titulo;
        let w;
        if (e.t === 'gancho') {
          w = cabecera(e, 'rl-gancho'); w.append(h('div', 'rl-tx1', e.texto));
        } else if (e.t === 'concepto') {
          w = cabecera(e, 'rl-concepto'); w.append(h('div', 'rl-tx2', e.texto)); insignia(w, e);
        } else if (e.t === 'lista') {
          w = cabecera(e, 'rl-listaE'); const ul = h('ul', 'rl-ul' + (e.ord ? ' ord' : ''));
          e.items.forEach(it => { const li = h('li', 'rl-rv', it); ul.append(li); S.revel.push(li); }); w.append(ul);
        } else if (e.t === 'vs') {
          w = h('div', 'rl-sc rl-in rl-vs');
          [e.a, e.b].forEach((c, k) => {
            const col = h('div', 'rl-col rl-rv ' + (k ? 'b' : 'a')); col.append(h('div', 'rl-ct', c.t));
            const ul = h('ul'); c.items.forEach(it => ul.append(h('li', null, it))); col.append(ul); w.append(col); S.revel.push(col);
            if (k === 0) w.append(h('div', 'rl-vsm', 'VS'));
          });
        } else if (e.t === 'tabla') {
          w = cabecera(e, 'rl-tablaE'); const tb = h('div', 'rl-tb');
          e.filas.forEach(f => { const row = h('div', 'rl-tr rl-rv'); row.append(h('b', null, f[0]), h('span', null, f[1])); tb.append(row); S.revel.push(row); }); w.append(tb);
        } else if (e.t === 'anim') {
          w = h('div', 'rl-sc rl-in rl-animE');
          const svg = sv('svg', { viewBox: '0 0 300 250', class: 'rl-svg', role: 'img', 'aria-label': e.texto }, null);
          w.append(svg, h('div', 'rl-tx2 rl-cap', e.texto));
          const fn = ANIM[e.anim](svg, e.d); S.upd = fn;
        } else if (e.t === 'quiz') {
          w = h('div', 'rl-sc rl-in rl-quizE'); w.append(h('div', 'rl-gan', 'Pregunta rápida'), h('div', 'rl-tx2', e.p));
          const ops = h('div', 'rl-ops'); const fb = h('div', 'rl-fb'); fb.setAttribute('aria-live', 'polite');
          e.o.forEach((o, k) => {
            const b = h('button', 'rl-op', null, { type: 'button' }); b.append(h('i', null, String.fromCharCode(65 + k)), h('span', null, o));
            b.addEventListener('click', () => responder(k, ops, fb, e));
            ops.append(b);
          });
          w.append(ops, fb); S.espera = true;
        }
        body.append(w);
        S.dur = e.d;
        live.textContent = textoEscena(e);
        hablar(e.t === 'quiz' ? e.p : textoEscena(e));
        if (rm.matches) revelarTodo(); else actualizar();
        pintaBarra();
        pausaEl.hidden = !(S.pausa || S.mano);
      }

      function revelarTodo() {
        S.revel.forEach(x => x.classList.add('on'));
        if (S.upd) S.upd(S.dur * 0.9, S.dur);
      }
      function actualizar() {
        if (rm.matches) return;
        const e = esc(), n = S.revel.length;
        if (n) {
          const base = e.t === 'vs' ? 0.3 : 0.5, paso = Math.max(0.5, (S.dur * 0.55) / n);
          S.revel.forEach((x, k) => x.classList.toggle('on', S.t >= base + k * paso));
        }
        if (S.upd) S.upd(S.t, S.dur);
      }

      function responder(k, ops, fb, e) {
        if (!S.espera) return;
        S.espera = false;
        const bs = ops.children;
        for (let j = 0; j < bs.length; j++) { bs[j].disabled = true; if (j === e.c) bs[j].classList.add('ok'); }
        const clave = reel().id + ':' + S.i;
        let msg;
        if (k === e.c) {
          prog.racha++; prog.mejor = Math.max(prog.mejor, prog.racha);
          let gana = 0; if (!prog.ok[clave]) { prog.ok[clave] = 1; gana = 5; prog.xp += 5; }
          msg = '✔ ¡Correcto!' + (gana ? ' +5 XP' : '') + (prog.racha > 1 ? ' · racha ' + prog.racha : '') + '.';
          fb.className = 'rl-fb ok';
        } else {
          bs[k].classList.add('bad'); prog.racha = 0; msg = '✘ Era la ' + String.fromCharCode(65 + e.c) + '.'; fb.className = 'rl-fb bad';
        }
        fb.textContent = msg + ' ' + e.e;
        guardar(); pintaStats();
        S.t = 0; S.dur = 4.5;   // tiempo para leer la explicación antes de seguir
        hablar(e.e);
      }

      function mostrarFin() {
        limpiaTimers(); S.fin = true; S.espera = false; S.upd = null; S.revel = []; S.t = 0; S.dur = 3; S.anulaCuenta = false;
        const r = reel(); const nuevo = !prog.vistos[r.id];
        if (nuevo) { prog.vistos[r.id] = true; prog.xp += 10; guardar(); }
        const qs = r.escenas.map((e, k) => e.t === 'quiz' ? k : -1).filter(k => k >= 0);
        const aciertos = qs.filter(k => prog.ok[r.id + ':' + k]).length;
        pintaStats(); pintaBarra();
        body.textContent = '';
        const w = h('div', 'rl-sc rl-in rl-fin');
        w.append(h('div', 'rl-big', '🏅'), h('h3', 'rl-ptit', 'Insignia: ' + r.insignia), h('p', 'rl-psub', 'Reel completado' + (nuevo ? ' · +10 XP' : '') + ' · aciertos ' + aciertos + '/' + qs.length));
        const sig = datos[S.r + 1];
        const cuenta = h('p', 'rl-cuenta');
        const acc = h('div', 'rl-acc');
        const bRep = h('button', 'rl-btn-txt', '↺ Repetir', { type: 'button' }); bRep.addEventListener('click', () => abrir(S.r, true));
        acc.append(bRep);
        if (sig) {
          const bCan = h('button', 'rl-btn-txt', 'Cancelar', { type: 'button' });
          const bIr = h('button', 'rl-btn-txt pri', 'Siguiente ▶', { type: 'button' });
          bCan.addEventListener('click', () => { S.anulaCuenta = true; cuenta.textContent = 'Siguiente: ' + sig.titulo; bCan.hidden = true; });
          bIr.addEventListener('click', () => abrir(S.r + 1, true));
          acc.append(bCan, bIr); S.cuentaEl = cuenta; S.sig = sig;
          cuenta.textContent = 'Siguiente reel en 3…';
        } else { cuenta.textContent = '¡Terminaste todos los reels!'; S.sig = null; }
        w.append(cuenta, acc); body.append(w);
        live.textContent = 'Reel completado. Insignia: ' + r.insignia + '.';
        hablar('Reel completado. ' + r.insignia);
      }

      function ir(i) {                 // i = índice de escena; reel().escenas.length = pantalla final
        const n = reel().escenas.length;
        if (i < 0) i = 0;
        if (i >= n) { S.i = n; mostrarFin(); return; }
        S.i = i; pintaEscena();
      }
      const sig = () => { if (!S.iniciado) return; if (S.fin) { if (S.sig) abrir(S.r + 1, true); return; } ir(S.i + 1); };
      const prev = () => { if (!S.iniciado) return; if (S.fin) { ir(reel().escenas.length - 1); return; } if (S.t > 1.5) ir(S.i); else ir(S.i - 1); };

      function abrir(i, auto) {
        limpiaTimers(); if (hayVoz) try { speechSynthesis.cancel(); } catch (e) { }
        S.r = clamp(i, 0, datos.length - 1); S.i = 0; S.pausa = false; S.mano = false;
        guionEl.textContent = ''; if (S.guion) pintaGuion();
        pintaStats();
        if (auto) { S.iniciado = true; pintaBarras(); pintaEscena(); } else { S.iniciado = false; portada(); }
        pausaEl.hidden = true;
      }

      // ----- bucle -----
      function tick(ts) {
        S.raf = requestAnimationFrame(tick);
        const dt = Math.min(0.1, (ts - S.ult) / 1000); S.ult = ts;
        if (pausado()) return;
        if (S.espera) { actualizar(); return; }                 // el quiz espera la respuesta
        S.t += dt * S.vel;
        if (S.fin) {
          if (S.sig && !S.anulaCuenta) {
            const q = Math.max(0, Math.ceil(S.dur - S.t));
            if (S.cuentaEl) S.cuentaEl.textContent = 'Siguiente reel en ' + q + '…';
            if (S.t >= S.dur) abrir(S.r + 1, true);
          }
          return;
        }
        actualizar(); pintaBarra();
        if (S.t >= S.dur) ir(S.i + 1);
      }

      // ----- interacción -----
      let holdT = 0, held = false;
      stage.addEventListener('pointerdown', ev => {
        if (ev.target.closest('button, a')) return;
        stage.focus({ preventScroll: true }); held = false;
        clearTimeout(holdT);
        holdT = setTimeout(() => { held = true; S.mano = true; pausaEl.hidden = false; if (hayVoz && S.voz) try { speechSynthesis.pause(); } catch (e) { } }, 260);
      });
      const soltar = () => { clearTimeout(holdT); if (held) { S.mano = false; held = false; pausaEl.hidden = !S.pausa; if (hayVoz && S.voz) try { speechSynthesis.resume(); } catch (e) { } return true; } return false; };
      stage.addEventListener('pointerup', ev => {
        if (ev.target.closest('button, a')) { clearTimeout(holdT); return; }
        if (soltar()) return;
        if (!S.iniciado) return;
        const r = stage.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width;
        if (x < 0.35) prev(); else sig();
      });
      stage.addEventListener('pointercancel', soltar);
      stage.addEventListener('pointerleave', () => { if (held) soltar(); else clearTimeout(holdT); });
      stage.addEventListener('contextmenu', ev => { if (held) ev.preventDefault(); });

      let activo = false;
      raiz.addEventListener('pointerenter', () => { activo = true; });
      raiz.addEventListener('pointerleave', () => { activo = false; });
      raiz.addEventListener('focusin', () => { activo = true; });
      document.addEventListener('keydown', ev => {
        const t = ev.target;
        if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
        if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
        /* mismo alcance que el cuestionario: solo con el reproductor visible Y (puntero encima o foco dentro) */
        if (!(raiz.contains(document.activeElement) || (activo && !S.fuera))) return;
        if (ev.key === 'Escape' && player.classList.contains('rl-full')) { player.classList.remove('rl-full'); return; }
        if (!S.iniciado) return;
        if (ev.key === 'ArrowRight') { ev.preventDefault(); sig(); }
        else if (ev.key === 'ArrowLeft') { ev.preventDefault(); prev(); }
        else if (ev.key === ' ' && !(t && t.closest && t.closest('button'))) { ev.preventDefault(); alternaPausa(); }
      });

      function alternaPausa() {
        S.pausa = !S.pausa; pausaEl.hidden = !S.pausa;
        if (hayVoz && S.voz) try { S.pausa ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) { }
      }

      bVel.addEventListener('click', () => {
        S.vel = S.vel === 1 ? 1.5 : S.vel === 1.5 ? 2 : 1; bVel.textContent = S.vel + 'x'; bVel.setAttribute('aria-label', 'Velocidad ' + S.vel + 'x');
      });
      bVoz.addEventListener('click', () => {
        S.voz = !S.voz; bVoz.setAttribute('aria-pressed', String(S.voz)); bVoz.classList.toggle('on', S.voz);
        bVoz.setAttribute('aria-label', S.voz ? 'Desactivar narración' : 'Activar narración');
        if (S.voz && S.iniciado && !S.fin) hablar(esc().t === 'quiz' ? esc().p : textoEscena(esc())); else if (hayVoz) try { speechSynthesis.cancel(); } catch (e) { }
      });
      function pintaGuion() {
        guionEl.textContent = '';
        guionEl.append(h('h5', null, 'Guion: ' + reel().titulo));
        const ol = h('ol'); reel().escenas.forEach(e => {
          if (e.t === 'quiz') ol.append(h('li', null, 'Pregunta: ' + e.p + ' Respuesta: ' + e.o[e.c] + '. ' + e.e));
          else ol.append(h('li', null, (e.truco ? '[Truco, deducido] ' : e.ded ? '[Deducido] ' : '') + textoEscena(e)));
        });
        guionEl.append(ol);
      }
      bGuion.addEventListener('click', () => {
        S.guion = !S.guion; guionEl.hidden = !S.guion; bGuion.setAttribute('aria-pressed', String(S.guion));
        bGuion.setAttribute('aria-label', S.guion ? 'Ocultar guion' : 'Ver guion'); if (S.guion) pintaGuion();
      });
      bFull.addEventListener('click', () => {
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
        if (fsEl || player.classList.contains('rl-full')) {
          if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          player.classList.remove('rl-full'); return;
        }
        const rq = player.requestFullscreen || player.webkitRequestFullscreen;
        if (rq) { try { const p = rq.call(player); if (p && p.catch) p.catch(() => player.classList.add('rl-full')); } catch (e) { player.classList.add('rl-full'); } }
        else player.classList.add('rl-full');
      });
      let confirmaT = 0;
      reset.addEventListener('click', () => {
        if (reset.dataset.seguro) {
          clearTimeout(confirmaT); delete reset.dataset.seguro; reset.textContent = 'Reiniciar progreso';
          prog = { xp: 0, racha: 0, mejor: 0, vistos: {}, ok: {} }; guardar(); pintaStats(); abrir(0, false);
        } else {
          reset.dataset.seguro = '1'; reset.textContent = '¿Seguro? Toca otra vez';
          confirmaT = setTimeout(() => { delete reset.dataset.seguro; reset.textContent = 'Reiniciar progreso'; }, 3000);
        }
      });

      document.addEventListener('visibilitychange', () => {
        S.oculto = document.hidden;
        if (hayVoz && S.voz) try { S.oculto ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) { }
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => { S.fuera = !es[0].isIntersecting; }, { threshold: 0.25 }).observe(stage);
      }
      document.addEventListener('fullscreenchange', () => { bFull.setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa'); });
      addEventListener('pagehide', () => { limpiaTimers(); cancelAnimationFrame(S.raf); if (hayVoz) try { speechSynthesis.cancel(); } catch (e) { } });

      abrir(0, false);
      S.ult = performance.now(); S.raf = requestAnimationFrame(tick);
      return { destruir() { limpiaTimers(); cancelAnimationFrame(S.raf); if (hayVoz) try { speechSynthesis.cancel(); } catch (e) { } }, estado: S };
    }

    API.montar = montar;
    const auto = () => { const el = document.getElementById('reelsApp'); if (el) API.app = montar(el); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
    window.REELS = API;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
