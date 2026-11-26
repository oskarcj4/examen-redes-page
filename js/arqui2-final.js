/* ===== Guía de Arquitectura II · Examen final (window.ARQF) =====
   Material: Interfaz de E/S, Acceso directo a memoria (DMA), Video en el computador, Uso del mouse (INT 33h)
   y los Retos 1 y 2 del laboratorio. Esta primera parte es lógica pura (sirve en Node para las pruebas):
   programas del profe con su explicación, decisiones de los retos, conversión de coordenadas del mouse,
   cálculos de video y DMA, cuestionario y preguntas abiertas. La interfaz (laboratorio del mouse, ciclo de DMA,
   registro de modo, calculadoras) va al final y solo corre en el navegador. */
(function (root) {
  'use strict';

  /* ---------- Programas (una sola fuente: el código sale de las partes) ---------- */
  const PROGRAMAS = {
    usomouse: {
      nombre: 'usomouse.asm · programa de práctica', modo: 'texto',
      resumen: 'Muestra un mensaje, activa el mouse y sondea hasta que se presiona el botón izquierdo.',
      partes: [
        ['.model small\n.stack 100h\n.data\n    msg_inicio db "Mueve el mouse. Haz CLIC IZQUIERDO para salir...", 0dh, 0ah, "$"\n.code\nmain proc',
          'Plantilla de programa <b>.EXE</b> (modelo small): pila de 100h bytes, un segmento de datos con el mensaje (<code>0dh,0ah</code> = salto de línea; termina en <code>$</code>) y el código dentro del procedimiento <code>main</code>.'],
        ['    mov ax, @data\n    mov ds, ax',
          'Inicializa DS con el segmento de datos. En un .EXE <b>hay que hacerlo a mano</b>; sin esto <code>INT 21h/09h</code> no encuentra el mensaje.'],
        ['    mov dx, offset msg_inicio\n    mov ah, 09h\n    int 21h',
          'Imprime el mensaje: DX = desplazamiento de la cadena, AH = 09h (imprime hasta el <code>$</code>).'],
        ['    mov ax, 0000h\n    int 33h\n    cmp ax, 0000h\n    je salir',
          '<b>Paso 1 · inicializar el mouse</b>. <code>AX=0000h</code> pregunta si hay mouse y driver. Si AX vuelve en <b>0</b> no hay hardware y se salta a <code>salir</code>. (Con mouse AX vuelve en FFFFh <span class="badge ded">deducido</span>: el material solo dice que 0 significa “no hay”.)'],
        ['    mov ax, 0001h\n    int 33h',
          '<b>Paso 2 · mostrar el puntero</b>. Sin esta llamada el mouse funciona pero no se ve el cursor.'],
        ['bucle_lectura:\n    mov ax, 0003h\n    int 33h',
          '<b>Paso 3 · leer el estado</b> (sondeo). Devuelve <b>BX</b> = botones, <b>CX</b> = X, <b>DX</b> = Y. Hay que repetirla en ciclo: es una foto del instante, no un evento.'],
        ['    test bx, 1\n    jnz ocultar_y_salir',
          '<code>TEST BX,1</code> hace AND sin guardar y mira solo el <b>bit 0</b> (botón izquierdo). Si no es cero (<code>JNZ</code>) hubo clic izquierdo: sale. Como solo mira el bit 0, sale aunque el derecho también esté presionado.'],
        ['    mov cx, 00h\n    mov dx, 0F000h\n    mov ah, 86h\n    int 15h\n\n    jmp bucle_lectura',
          'Pausa para no saturar la CPU del emulador: <code>INT 15h / AH=86h</code> espera <b>CX:DX microsegundos</b> (0:F000h = 61 440 µs ≈ 0,06 s) <span class="badge ded">deducido</span>. Pisa CX y DX, pero no importa: el ciclo vuelve a leer el mouse. Luego <code>JMP</code> repite.'],
        ['ocultar_y_salir:\n    mov ax, 0002h\n    int 33h',
          '<b>Paso 4 · ocultar el puntero</b> antes de terminar (buena práctica: deja la pantalla limpia).'],
        ['salir:\n    mov ah, 4ch\n    int 21h\nmain endp\nend main',
          'Termina y devuelve el control al DOS. <code>end main</code> indica dónde empieza el programa.']
      ]
    },
    reto1: {
      nombre: 'Reto 1 · identificación de botones', modo: 'texto',
      resumen: 'Clic izquierdo imprime I, clic derecho imprime D; termina solo cuando se presionan ambos botones a la vez.',
      partes: [
        ['org 100h', 'Programa <b>.COM</b> (EMU8086): el código arranca en la dirección 0100h y no hace falta inicializar DS.'],
        ['.DATA\n    MensajeTitulo  DB 13,10," Reto 1: Identificacion de Botones ",13,10\n                DB " Clic izquierdo = I   |   Clic derecho = D",13,10\n                DB "Presione AMBOS botones a la vez para salir.",13,10,13,10,"$"\n    MensajeSinRaton DB 13,10, "ERROR: no se detecto el raton.",13,10,"$"\n    MensajeFin     DB 13,10,13,10,"Ambos botones detectados. Programa finalizado." ,13,10,"$"',
          'Tres mensajes, todos terminados en <code>$</code>. <code>13,10</code> = CR + LF (salto de línea). El título ocupa varias líneas <code>DB</code> seguidas: forman una sola cadena.'],
        ['.CODE\n    lea dx, MensajeTitulo\n    mov ah, 09h\n    int 21h',
          'Imprime el título (<code>INT 21h/09h</code>, dirección en DX).'],
        ['    mov ax, 0000h\n    int 33h\n    cmp ax, 0\n    je  SinRaton',
          'Inicializa el mouse. Si AX = 0 no hay driver: salta a <code>SinRaton</code> (imprime el error y termina).'],
        ['    mov ax, 0001h\n    int 33h', 'Muestra el puntero.'],
        ['Sondeo:\n    mov ax, 0003h\n    int 33h\n\n    cmp bx, 3\n    je  Salir\n    cmp bx, 1\n    je  ClicIzquierdo\n    cmp bx, 2\n    je  ClicDerecho\n    jmp Sondeo',
          '<b>Ciclo de sondeo</b>. Lee el estado y compara <b>BX completo</b> (no un bit): <code>3</code> (=11b) ambos botones → salir; <code>1</code> (=01b) solo izquierdo; <code>2</code> (=10b) solo derecho; <code>0</code> nada → vuelve a sondear. El orden importa: se pregunta primero por 3.'],
        ['ClicIzquierdo:\n    mov BL, \'I\'\n    jmp Imprimir\n\nClicDerecho:\n    mov BL, \'D\'',
          'Guarda la letra en <b>BL</b> (se pisa BX, pero ya no hace falta el estado). El derecho no necesita <code>JMP</code> porque <code>Imprimir</code> viene justo debajo.'],
        ['Imprimir:\n    mov ax, 0002h\n    int 33h\n\n    mov dl, bl\n    mov ah, 02h\n    int 21h\n\n    mov AX, 0001h\n    int 33h',
          'Oculta el puntero, imprime la letra (<code>INT 21h/02h</code>: carácter en DL) y vuelve a mostrar el puntero. Se oculta para que el cursor del mouse no se dibuje sobre lo que se escribe.'],
        ['EsperaSoltar:\n    mov ax, 0003h\n    int 33h\n    cmp BX, 3\n    je  SALIR\n    cmp BX, 0\n    jne EsperaSoltar\n    jmp Sondeo',
          '<b>Anti-rebote</b>: sin esto un solo clic (que dura miles de lecturas) imprimiría cientos de letras. Espera hasta que BX = 0 (soltó todo). Mientras espera sigue vigilando <code>BX=3</code>: si presionas el otro botón sin soltar el primero, también sale.'],
        ['SinRaton:\n    lea dx, MensajeSinRaton\n    mov ah, 09h\n    int 21h\n    jmp Terminar\n\nSalir:\n    mov ax, 0002h\n    int 33h\n\n    lea dx, MensajeFin\n    mov ah, 09h\n    int 21h\n\nTerminar:\n    mov ah, 4Ch\n    int 21h\n\nret',
          'Salidas. <code>SinRaton</code> imprime el error y termina. <code>Salir</code> oculta el puntero, imprime el mensaje final y cae en <code>Terminar</code> (<code>INT 21h/4Ch</code>). El <code>ret</code> final nunca se ejecuta.']
      ]
    },
    reto2: {
      nombre: 'Reto 2 · botón de cierre por coordenadas', modo: 'texto',
      resumen: 'Imprime I / D según el botón; solo cierra con clic izquierdo dentro de la zona caliente (CX ≤ 40 y DX ≤ 10).',
      partes: [
        ['org 100h', 'Programa .COM.'],
        ['.DATA\n    MensajeTitulo  DB 13,10,\'Reto 2 = Boton Cierre Por Coordenadas\',13,10\n                DB \'Clic izquierdo = I   |   Clic derecho = D\',13,10\n                DB \'Para SALIR: clic izquierdo en la [X] de la esquina.\',13,10,\'$\'\n    MensajeSinRaton DB 13,10,\'ERROR: no se detecto el raton.\',13,10,\'$\'\n    MensajeZona    DB \'[X]$\'\n    MensajeFin     DB 13,10,13,10,\'Clic en la zona caliente. Programa cerrado.\',13,10,\'$\'',
          'Mensajes. <code>MensajeZona</code> (<code>[X]</code>) es solo un dibujo para que el usuario sepa dónde hacer clic. (En el archivo original algunas cadenas están partidas en dos líneas por la conversión; aquí van completas.)'],
        ['.CODE\n    mov ax, 0003h\n    int 10h',
          '<code>INT 10h / AH=00h</code> con <b>AL=03h</b> fija el modo de texto 80x25 <b>y limpia la pantalla</b>.'],
        ['    mov ah, 02h\n    mov bh, 0\n    mov dh, 0\n    mov dl, 0\n    int 10h\n\n    lea dx, MensajeZona\n    mov ah, 09h\n    int 21h',
          'Pone el cursor de texto en fila 0, columna 0 (<code>INT 10h/02h</code>: DH = fila, DL = columna, BH = página) e imprime <code>[X]</code>: la “zona caliente” queda dibujada en la esquina.'],
        ['    mov ah, 02h\n    mov bh, 0\n    mov dh, 2\n    mov dl, 0\n    int 10h\n\n    lea DX, MensajeTitulo\n    mov AH, 09h\n    int 21h',
          'Baja el cursor a la fila 2 e imprime el título/instrucciones. A partir de aquí las letras I/D se escribirán <b>en la posición del cursor de texto</b>, no donde se hizo clic.'],
        ['    mov ax, 0000h\n    int 33h\n    cmp ax, 0\n    je  SinRaton\n\n    mov ax, 0001h\n    int 33h',
          'Inicializa el mouse (AX = 0 → sin mouse) y muestra el puntero.'],
        ['Sondeo:\n    mov ax, 0003h\n    int 33h\n\n    cmp bx, 1\n    je  ClicIzquierdo\n    cmp bx, 2\n    je  ClicDerecho\n    jmp Sondeo',
          'Sondeo: solo reacciona a <code>BX=1</code> (solo izquierdo) o <code>BX=2</code> (solo derecho). Con <b>ambos botones (BX=3) no hace nada</b>: aquí ya no se sale con los dos botones.'],
        ['ClicIzquierdo:\n    cmp cx, 40\n    ja  FueraDeZona\n    cmp dx, 10\n    ja  FueraDeZona\n    jmp Salir',
          '<b>El núcleo del reto.</b> <code>CMP CX,40 / JA</code>: si X &gt; 40 → fuera. <code>CMP DX,10 / JA</code>: si Y &gt; 10 → fuera. Si pasa las dos pruebas (<b>CX ≤ 40 y DX ≤ 10</b>, extremos incluidos) → <code>Salir</code>. <code>JA</code> es salto <b>sin signo</b>, correcto porque las coordenadas no son negativas.'],
        ['FueraDeZona:\n    mov bl, \'I\'\n    jmp Imprimir\n\nClicDerecho:\n    mov bl, \'D\'',
          'Clic izquierdo fuera de la zona se comporta como en el Reto 1: imprime I. El derecho imprime D (en cualquier lugar: la zona solo cuenta para el izquierdo).'],
        ['Imprimir:\n    mov ax, 0002h\n    int 33h\n\n    mov dl, bl\n    mov ah, 02h\n    int 21h\n\n    mov ax, 0001h\n    int 33h\n\nEsperaSoltar:\n    mov ax, 0003h\n    int 33h\n    cmp bx, 0\n    jne EsperaSoltar\n    jmp Sondeo',
          'Oculta el puntero, imprime la letra, lo vuelve a mostrar y espera a que se suelten los botones (anti-rebote). Esta espera <b>ya no vigila una condición de salida</b>: solo termina cuando BX = 0.'],
        ['SinRaton:\n    lea dx, MensajeSinRaton\n    mov ah, 09h\n    int 21h\n    jmp Terminar\n\nSalir:\n    mov ax, 0002h\n    int 33h\n\n    lea dx, MensajeFin\n    mov ah, 09h\n    int 21h\n\nTerminar:\n    mov ah, 4Ch\n    int 21h\n\nret',
          'Mismas salidas que el Reto 1 (mensaje de error, o ocultar puntero + mensaje final) y <code>INT 21h/4Ch</code>.']
      ]
    },
    modografico: {
      nombre: 'modografico.asm · dibujar píxeles en modo 13h', modo: 'grafico',
      resumen: 'Cambia a modo gráfico 13h, dibuja un píxel con el clic izquierdo y termina con el clic derecho.',
      partes: [
        ['.model small\n.stack 100h\n.data\n.code\nmain proc', 'Plantilla .EXE sin datos: no hace falta inicializar DS porque no se usa ninguna variable.'],
        ['    mov ax, 0013h\n    int 10h',
          '<b>Entra al modo gráfico 13h</b>: 320x200 píxeles, 256 colores (<code>INT 10h/AH=00h</code>, AL = modo).'],
        ['    mov ax, 0000h\n    int 33h\n    cmp ax, 0000h\n    je restaurar_texto\n\n    mov ax, 0001h\n    int 33h',
          'Inicializa y muestra el mouse. Sin mouse salta a <code>restaurar_texto</code> (hay que volver al modo texto antes de salir).'],
        ['bucle_dibujo:\n    mov ax, 0003h\n    int 33h',
          'Lee el estado. El comentario del archivo dice <b>CX = X (0-639), DX = Y (0-199)</b>: el driver usa coordenadas virtuales de 640x200 aunque la pantalla sea de 320x200.'],
        ['    test bx, 2\n    jnz terminar_grafico\n\n    test bx, 1\n    jz bucle_dibujo',
          '<code>TEST BX,2</code> mira el bit 1 (botón <b>derecho</b>): si está presionado → termina. <code>TEST BX,1</code> mira el bit 0 (izquierdo): si <b>no</b> está presionado (<code>JZ</code>) vuelve a leer sin dibujar.'],
        ['    shr cx, 1',
          '<b>Ajuste de escala</b>: CX va de 0 a 639 y la pantalla tiene 320 columnas, así que se divide entre 2 (<code>SHR CX,1</code> = CX/2). DX no se toca porque la altura virtual (200) ya coincide con la real.'],
        ['    mov ax, 0002h\n    int 33h\n\n    mov ah, 0Ch\n    mov al, 0Bh\n    mov bh, 0\n    int 10h\n\n    mov ax, 0001h\n    int 33h\n\n    jmp bucle_dibujo',
          'Oculta el puntero (taparía el píxel), dibuja con <code>INT 10h / AH=0Ch</code> (<b>AL</b> = color, <b>BH</b> = página, <b>CX</b> = columna, <b>DX</b> = fila; aquí 0Bh = cian claro), muestra el puntero y repite.'],
        ['terminar_grafico:\n    mov ax, 0002h\n    int 33h',
          'Oculta el mouse <b>antes</b> de cambiar el modo de video.'],
        ['restaurar_texto:\n    mov ax, 0003h\n    int 10h\n\n    mov ah, 4Ch\n    int 21h\nmain endp\nend main',
          'Restaura el modo de texto estándar 03h (si no, la consola queda en gráfico) y termina.']
      ]
    }
  };
  Object.keys(PROGRAMAS).forEach(k => { PROGRAMAS[k].id = k; PROGRAMAS[k].src = PROGRAMAS[k].partes.map(p => p[0]).join('\n') + '\n'; });

  /* ---------- Mouse: botones y coordenadas ---------- */
  const botones = (izq, der, cen) => (izq ? 1 : 0) | (der ? 2 : 0) | (cen ? 4 : 0);
  function describirBX(bx) {
    bx &= 7;
    if (!bx) return 'ningún botón';
    const n = []; if (bx & 1) n.push('izquierdo'); if (bx & 2) n.push('derecho'); if (bx & 4) n.push('central');
    return n.length === 1 ? 'solo el ' + n[0] : 'botones ' + n.join(' + ');
  }
  /* Coordenadas que devuelve INT 33h/0003h.
     texto 80x25: el driver trabaja en píxeles virtuales 640x200 y (deducido) los entrega en múltiplos de 8
     (una celda = 8x8). 13h: CX de 0 a 639 (pares, deducido), DX de 0 a 199. */
  function coordsMouse(px, py, o = {}) {
    px = Math.max(0, Math.min(639, Math.floor(px))); py = Math.max(0, Math.min(199, Math.floor(py)));
    if (o.modo === 'grafico') return { cx: (px >> 1) << 1, dx: py };
    return o.cuantizar === false ? { cx: px, dx: py } : { cx: (px >> 3) << 3, dx: (py >> 3) << 3 };
  }
  const celda = (cx, dx) => ({ col: Math.floor(cx / 8), fila: Math.floor(dx / 8) });
  const pixel13 = (cx, dx) => ({ x: cx >> 1, y: dx });
  const enZonaCaliente = (cx, dx) => cx <= 40 && dx <= 10;     // CMP CX,40 / JA  y  CMP DX,10 / JA
  /* Celdas de 8x8 que tocan la zona (X 0..40, Y 0..10): columnas 0-5, filas 0-1 */
  const celdasZona = () => ({ col0: 0, col1: Math.floor(40 / 8), fila0: 0, fila1: Math.floor(10 / 8) });

  /* Lo que decide cada programa con una lectura (bx, cx, dx). */
  function decidir(prog, bx, cx, dx) {
    bx &= 7;
    if (prog === 'usomouse') return bx & 1 ? { accion: 'salir', texto: 'TEST BX,1 ≠ 0 → ocultar el puntero y salir' } : { accion: null, texto: 'bit 0 = 0 → pausa y sigue sondeando' };
    if (prog === 'reto1') {
      if (bx === 3) return { accion: 'salir', texto: 'BX = 3 (ambos) → Salir' };
      if (bx === 1) return { accion: 'I', texto: 'BX = 1 → ClicIzquierdo → imprime I' };
      if (bx === 2) return { accion: 'D', texto: 'BX = 2 → ClicDerecho → imprime D' };
      return { accion: null, texto: bx === 0 ? 'BX = 0 → nada, sigue sondeando' : 'BX = ' + bx + ' (incluye el central) → ninguna comparación coincide, sigue sondeando' };
    }
    if (prog === 'reto2') {
      if (bx === 1) return enZonaCaliente(cx, dx)
        ? { accion: 'salir', texto: `BX = 1 y CX=${cx} ≤ 40, DX=${dx} ≤ 10 → zona caliente → Salir` }
        : { accion: 'I', texto: `BX = 1 pero ${cx > 40 ? `CX=${cx} > 40` : `DX=${dx} > 10`} → FueraDeZona → imprime I` };
      if (bx === 2) return { accion: 'D', texto: 'BX = 2 → ClicDerecho → imprime D (en cualquier lugar)' };
      return { accion: null, texto: bx === 0 ? 'BX = 0 → nada, sigue sondeando' : 'BX = ' + bx + ' → el Reto 2 ignora esta combinación' };
    }
    if (prog === 'modografico') {
      if (bx & 2) return { accion: 'salir', texto: 'bit 1 = 1 (derecho) → termina (restaura modo texto)' };
      if (bx & 1) return { accion: 'pixel', texto: `bit 0 = 1 → dibuja el píxel (${cx >> 1}, ${dx}) en cian claro (CX/2 = ${cx >> 1})` };
      return { accion: null, texto: 'ningún botón → vuelve a leer' };
    }
    return { accion: null, texto: '' };
  }

  /* ---------- Video ---------- */
  const bytesVideo = (ancho, alto, bitsPorPixel) => Math.ceil(ancho * alto * bitsPorPixel / 8);
  const FORMATOS = [
    ['VGA', 640, 480], ['SVGA', 800, 600], ['XGA', 1024, 768], ['SXGA', 1280, 1024], ['UXGA', 1600, 1200],
    ['HD 720p', 1280, 720], ['Full HD 1080p', 1920, 1080], ['WUXGA', 1920, 1200], ['QXGA', 2048, 1536],
    ['2K', 2048, 1080], ['4K', 3840, 2160], ['8K', 7680, 4320]
  ];
  const mpx = (a, h) => a * h / 1e6;

  /* ---------- DMA (8237) ---------- */
  const cwcrDe = n => (n - 1) & 0xFFFF;                 // para transferir 8 bytes el registro lleva 7
  const bytesDe = reg => (reg & 0xFFFF) + 1;
  /* Registro de modo. Bits 0-1 canal · 2-3 operación · 4 autoinicialización · 5 dirección · 6-7 modo.
     Los códigos binarios salen de la figura 5 (imagen); el texto del documento solo dice qué bits son. */
  const OPS = { verificar: 0, escribir: 1, leer: 2 };     // escribir = dispositivo → memoria
  const MODOS = { demanda: 0, sencillo: 1, bloque: 2, cascada: 3 };
  function registroModo(o) {
    return ((o.canal & 3) | ((OPS[o.op] || 0) << 2) | ((o.auto ? 1 : 0) << 4) | ((o.decremento ? 1 : 0) << 5) | ((MODOS[o.modo] || 0) << 6)) & 0xFF;
  }
  const decodificarModo = v => ({
    canal: v & 3, op: Object.keys(OPS).find(k => OPS[k] === ((v >> 2) & 3)) || '(no válido: 11)', auto: !!(v & 16), decremento: !!(v & 32),
    modo: Object.keys(MODOS).find(k => MODOS[k] === ((v >> 6) & 3))
  });
  const PASOS_DMA = [
    { t: 'El dispositivo pide DMA', d: 'El dispositivo de E/S activa su línea <b>DREQ</b> hacia el 8237 (una línea por canal: DREQ0-DREQ3).', act: ['dreq'] },
    { t: 'El 8237 pide los buses', d: 'El 8237 activa <b>HRQ</b>, que va a la terminal <b>HOLD</b> del microprocesador: “quiero los buses”.', act: ['hrq'] },
    { t: 'La CPU cede los buses', d: 'El microprocesador suspende el programa y deja los buses de direcciones, datos y control en <b>alta impedancia</b> (como si lo hubieran retirado). Contesta con <b>HLDA</b>. A diferencia de INTR/NMI, HOLD actúa a media instrucción; solo RESET tiene más prioridad.', act: ['hlda'] },
    { t: 'El 8237 confirma al dispositivo', d: 'El 8237 responde al dispositivo con <b>DACK</b> y con <b>AEN</b> habilita su registro de dirección. Ahora él es el dueño de los buses.', act: ['dack', 'bus'] },
    { t: 'Transferencia directa', d: 'El 8237 pone la dirección (CAR) y genera las señales de control: en una <b>lectura de DMA</b> (memoria → E/S) se activan MEMR e IOW al mismo tiempo; en una <b>escritura de DMA</b> (E/S → memoria), IOR y MEMW. Cada byte descuenta la cuenta (CWCR).', act: ['dato', 'bus'] },
    { t: 'Fin: cuenta terminal', d: 'Cuando la cuenta llega a su fin (bit TC del registro de estado, o la señal <b>EOP</b>) el 8237 baja HRQ, la CPU baja HLDA y <b>recupera los buses</b>. Con autoinicialización, BA y BWC recargan CAR y CWCR.', act: ['eop'] }
  ];

  /* ---------- Cuestionario ---------- */
  const QUIZ_BASE = [
    ['E/S', '¿Con qué instrucciones el microprocesador transfiere datos con un puerto de E/S?', ['MOV y LEA', 'IN (entrada) y OUT (salida)', 'PUSH y POP', 'INT y IRET'], 1, 'Según el material: instrucciones especiales “IN” (entrada) y “OUT” (salida), indicando el puerto y los datos.'],
    ['E/S', '¿Qué identifica a cada puerto de E/S?', ['Su color de cable', 'Una dirección única', 'El nombre del driver', 'Su velocidad de reloj'], 1, 'Cada puerto tiene una dirección única; el micro accede a un puerto escribiendo/leyendo la dirección correspondiente.'],
    ['E/S', 'El handshaking sirve para…', ['Acelerar el reloj de la CPU', 'Asegurar que no haya pérdida, repetición ni corrupción de datos entre las dos partes', 'Convertir datos paralelos en seriales', 'Decodificar direcciones'], 1, 'Es un protocolo de confirmación entre emisor y receptor; fundamental en interfaces síncronas y de baja capa.'],
    ['E/S', '¿Qué hace la IOMMU?', ['Traduce direcciones virtuales de E/S a físicas y aísla a los dispositivos del espacio de direcciones del sistema', 'Guarda instrucciones en caché', 'Procesa gráficos 3D', 'Encapsula paquetes de red'], 0, 'La MMU hace la traducción para memoria; la IOMMU es similar pero para E/S.'],
    ['E/S', '¿Cuál es el procesador dedicado al renderizado y cálculos de gráficos 2D/3D (con caché y memoria propia)?', ['NIC', 'MMU', 'GPU', 'PLD'], 2, 'GPU: unidad de administración de gráficos. La NIC es la tarjeta de red.'],
    ['E/S', 'Un PLD, a diferencia de un PPI, es…', ['Una interfaz de E/S específica (UART, SPI…)', 'Un dispositivo lógico programable genérico que puede implementar funciones arbitrarias, incluida la decodificación de puertos', 'Un puerto paralelo de impresora', 'Un tipo de bus'], 1, 'PLD = genérico y flexible (hay que diseñar la lógica). PPI = interfaz específica con funcionalidad predefinida (solo se programan parámetros).'],
    ['E/S', '¿En qué caso el material recomienda un PLD en lugar de un PPI?', ['Interfaz estándar de alto volumen', 'Interfaz personalizada o no estándar, o que pueda cambiar con el tiempo', 'Cuando se quiere menos desarrollo', 'Cuando hay amplia documentación del fabricante'], 1, 'PLD: interfaces personalizadas, reconfigurables, producciones pequeñas. PPI: estándar, menor complejidad, documentación amplia.'],
    ['E/S', '¿Para qué se usa un PLD como decodificador de puertos?', ['Para mapear rangos de direcciones de E/S a puertos físicos', 'Para generar el reloj', 'Para comprimir video', 'Para sustituir al bus de datos'], 0, 'Contiene una matriz lógica programable que activa la salida del puerto físico cuando detecta una dirección válida; se puede reprogramar sin cambiar el hardware.'],
    ['E/S', '¿Cuál NO es una interfaz periférica programable mencionada en el material?', ['I2C', 'SPI', 'GPIO', 'HOLD'], 3, 'HOLD es una terminal del micro para pedir DMA, no una interfaz periférica. I2C, SPI, GPIO, USB, PS/2, COM y LPT sí lo son.'],
    ['E/S', 'GPIO son puertos digitales…', ['Solo de entrada', 'Configurables como entrada o salida por programación (microcontroladores, sistemas empotrados)', 'De red inalámbrica', 'Exclusivos del 8086'], 1, 'General Purpose Input/Output.'],
    ['DMA', '¿Qué señal solicita una acción de DMA al microprocesador y cuál la reconoce?', ['HLDA solicita y HOLD reconoce', 'HOLD solicita y HLDA reconoce', 'INTR solicita y INTA reconoce', 'DREQ solicita y EOP reconoce'], 1, 'HOLD (en alto) solicita; HLDA reconoce la transferencia.'],
    ['DMA', 'Cuando HOLD está en alto, el microprocesador…', ['Sigue ejecutando normalmente', 'Suspende el programa y deja los buses en alta impedancia', 'Se reinicia', 'Borra la memoria'], 1, 'Parece que lo hubieran retirado del sistema: otros dispositivos pueden usar los buses y acceder directamente a la memoria.'],
    ['DMA', 'A diferencia de INTR o NMI (que actúan al final de una instrucción), HOLD tiene efecto…', ['Al final del programa', 'A media instrucción', 'Solo al inicio del día', 'Nunca interrumpe'], 1, 'Según el documento de la Inga. Vallejo; la única terminal por encima de HOLD en prioridad es RESET.'],
    ['DMA', 'Una escritura de DMA transfiere datos…', ['De memoria a dispositivo de E/S', 'De dispositivo de E/S a memoria', 'De memoria a memoria únicamente', 'De CPU a CPU'], 1, 'Lectura de DMA = memoria → E/S. Escritura de DMA = E/S → memoria.'],
    ['DMA', '¿Cuántos canales tiene el 8237 y qué tamaño de memoria direcciona cada uno?', ['2 canales de 16 KB', '4 canales de 64 KB', '8 canales de 1 MB', '1 canal de 256 KB'], 1, 'Cuatro canales (DREQ0-3) que direccionan secciones de 64 KB con una sola programación; hasta 1.6 Mbps, reloj de hasta 5 MHz.'],
    ['DMA', 'Si se necesita transferir 8 bytes, ¿qué valor se programa en el registro de cuenta (CWCR)?', ['8', '7', '9', '0'], 1, 'El registro lleva “cuenta − 1”: para 8 bytes, 7.'],
    ['DMA', '¿Para qué sirven los registros BA y BWC?', ['Para elegir el canal', 'Para recargar CAR y CWCR en la autoinicialización', 'Para el estado de las solicitudes', 'Para el biestable P/U'], 1, 'Base address y base word count: permiten repetir la misma cuenta y dirección sobre la misma área de memoria.'],
    ['DMA', 'En el registro de modo del 8237, los bits 6 y 7 seleccionan…', ['El canal', 'La operación leer/escribir', 'El modo de operación (demanda, dato sencillo, bloque, cascada)', 'La polaridad de DREQ'], 2, 'Bits 0-1 canal, 2-3 operación, 4 autoinicialización, 5 modo de dirección, 6-7 modo de operación.'],
    ['DMA', '¿Qué modo del 8237 se usa cuando hay más de un 8237 en el sistema?', ['Demanda', 'Dato sencillo', 'Bloque', 'Cascada'], 3, 'Modo en cascada. Demanda: transfiere mientras DREQ siga activa. Dato sencillo: libera HOLD tras un byte. Bloque: transfiere automáticamente el número de bytes del registro de cuenta.'],
    ['DMA', 'El 8237 con prioridad “rotatoria” significa que…', ['El canal 0 siempre es el primero', 'El canal recién atendido pasa a la prioridad más baja', 'Gana el canal 3', 'Se desactivan los canales'], 1, 'Prioridad fija: canal 0 la más alta y el 3 la más baja. Rotatoria: el último atendido pasa al fondo.'],
    ['DMA', '¿Qué hace el biestable primero/último (P/U) del 8237?', ['Cuenta los bytes transferidos', 'Selecciona si se lee/escribe el byte bajo (P/U=0) o el alto (P/U=1) de dirección y cuenta; se invierte con cada acceso', 'Elige el canal activo', 'Termina la transferencia'], 1, 'Por eso el primer paso de la programación es limpiarlo: si no se sabe su estado, cuenta y dirección pueden quedar mal programadas.'],
    ['DMA', 'Orden correcto de los cuatro pasos para programar el 8237:', ['Cuenta, dirección, canal, limpiar P/U', 'Limpiar P/U, deshabilitar canal, programar LSB y MSB de dirección, programar LSB y MSB de cuenta', 'Deshabilitar canal, enviar datos, limpiar P/U, cuenta', 'Programar modo, activar HOLD, limpiar canal, dirección'], 1, 'Después falta elegir el modo de operación antes de activar y arrancar el canal.'],
    ['DMA', '¿Qué es un maestro de bus? ¿Cuál es un ejemplo de maestro de bus remoto?', ['Un cable; el 8237 no', 'Cualquier dispositivo que pueda controlar un bus con memoria y E/S; el controlador DMA 8237', 'Solo el 8086', 'Un tipo de memoria'], 1, 'La diferencia con otro microprocesador: el 8237 solo transfiere datos, mientras que otro micro ejecuta software variable.'],
    ['DMA', 'El árbitro de bus 8289 sirve para…', ['Programar el 8237', 'Decidir la prioridad entre maestros de bus y permitir que solo uno acceda al bus compartido a la vez', 'Generar señales de video', 'Leer el mouse'], 1, 'El 8086/8088 comparten bus con el 8289 (80286: 82289; 80386/486: 82389).'],
    ['Video', 'El color burst sirve para…', ['Sincronizar el inicio de cada trama', 'Sincronizar la fase del color entre emisor y receptor, e indicar que la línea lleva croma', 'Aumentar la resolución', 'Apagar el cañón'], 1, 'Es un pulso estrecho de color de referencia al comienzo de cada línea de la señal compuesta con información de croma.'],
    ['Video', 'El pulso de línea indica…', ['El inicio de cada línea de la imagen', 'El inicio de cada trama o campo', 'La fase del color', 'El fin de la imagen'], 0, 'Pulso de línea: nivel de línea. Pulso de trama: nivel de campo. Color burst: fase y color.'],
    ['Video', 'Un monitor RGB digital de la época CGA reconocía cada color primario como encendido o apagado: ¿cuántos colores daba con una señal de intensidad?', ['8', '16 (8 normales y 8 intensos)', '256', '64 000'], 1, 'Sin intensidad: 8 colores; con la señal de intensidad, 8 normales + 8 intensos. EGA recibía una segunda señal por color y llegaba a 16 con más matices.'],
    ['Video', 'VGA: ¿cuántos colores simultáneos en modo gráfico y de qué paleta?', ['16 de una paleta de 64', '256 de una paleta de 64 000 (según el material)', '2 de 16', '65 536 de 16 millones'], 1, 'El material dice 256 colores simultáneos de una paleta de 64 000 y resoluciones como 640x480, memoria gráfica dedicada y compatibilidad con CGA/EGA.'],
    ['Video', '¿Qué resolución corresponde al formato XGA?', ['640x480', '800x600', '1024x768', '1920x1080'], 2, 'VGA 640x480 · SVGA 800x600 · XGA 1024x768 · SXGA 1280x1024 · UXGA 1600x1200 · WUXGA 1920x1200 · QXGA 2048x1536.'],
    ['Video', '¿Qué diferencia hay entre 1080i y 1080p?', ['1080i es entrelazado y 1080p progresivo (de mejor calidad)', 'Son idénticos', '1080i tiene más píxeles', '1080p es analógico'], 0, 'Ambos son 1920x1080; “i” = entrelazado, “p” = progresivo.'],
    ['Video', '¿Qué resolución tiene 4K en el material?', ['2048x1080', '3840x2160', '7680x4320', '1280x720'], 1, '4K = 3840x2160 (2K = 2048x1080; 8K = 7680x4320). Ojo: el material dice “el doble de píxeles que Full HD”, pero en realidad son cuatro veces (ver nota en la guía).'],
    ['Video', '¿Qué transmite HDMI y qué no hace DVI?', ['HDMI: video y audio digitales; DVI: soporta 1080p pero no audio', 'HDMI: solo video; DVI: video y audio', 'Ambos son analógicos', 'HDMI es el predecesor de VGA'], 0, 'DVI es predecesor digital de VGA. HDMI integra video y audio en un cable e incorpora HDCP.'],
    ['Video', 'Un monitor monocromo CRT mueve el haz con el circuito de…', ['Sincronización', 'Deflexión (desvía el haz para dibujar cada línea)', 'Luminancia', 'Croma'], 1, 'El circuito de sincronización mantiene el haz alineado con la señal; la deflexión lo desvía a lo largo de cada línea.'],
    ['Mouse', '¿Qué interrupción maneja el mouse en el curso?', ['INT 10h', 'INT 21h', 'INT 33h', 'INT 16h'], 2, 'INT 33h. La función va en AX (no solo en AH).'],
    ['Mouse', 'INT 33h con AX = 0000h…', ['Muestra el puntero', 'Inicializa el mouse; AX = 0 si no hay hardware', 'Lee los botones', 'Oculta el puntero'], 1, '0000h inicializa/detecta; 0001h muestra; 0002h oculta; 0003h lee estado.'],
    ['Mouse', 'INT 33h con AX = 0003h devuelve…', ['AX = botones', 'BX = botones, CX = X, DX = Y', 'CX = botones, DX = X', 'DX = botones'], 1, 'BX = estado de botones, CX = coordenada X, DX = coordenada Y.'],
    ['Mouse', '¿Qué bit de BX indica el botón izquierdo y cuál el derecho?', ['Izquierdo bit 1, derecho bit 0', 'Izquierdo bit 0, derecho bit 1', 'Ambos bit 0', 'Izquierdo bit 7, derecho bit 6'], 1, 'Bit 0 = izquierdo (BX=1), bit 1 = derecho (BX=2), ambos = 3.'],
    ['Mouse', '¿Cuál es la diferencia entre CMP BX,1 y TEST BX,1?', ['Ninguna', 'CMP BX,1 exige BX exactamente igual a 1; TEST BX,1 solo mira el bit 0 aunque haya otros bits', 'TEST resta y CMP hace AND', 'CMP solo sirve con CX'], 1, 'Con BX=3 (ambos) CMP BX,1 es falso pero TEST BX,1 es “no cero”. Por eso Reto 1 usa CMP (distingue combinaciones) y usomouse/modografico usan TEST.'],
    ['Mouse', 'En modografico.asm, ¿por qué se hace SHR CX,1?', ['Para convertir CX en DX', 'Porque CX va de 0 a 639 y el modo 13h tiene 320 columnas: se divide entre 2', 'Para invertir el botón', 'Para ocultar el puntero'], 1, 'DX no se divide porque la altura virtual (0-199) ya coincide con las 200 filas.'],
    ['Mouse', '¿Para qué se oculta el mouse (AX=0002h) antes de dibujar un píxel o imprimir una letra?', ['Para ahorrar memoria', 'Porque el cursor del mouse tapa/pisa lo que se escribe en ese lugar', 'Porque INT 10h lo exige siempre', 'Para cambiar de modo'], 1, 'Se oculta, se dibuja o imprime, y se vuelve a mostrar (AX=0001h).'],
    ['Mouse', '¿Qué hace INT 10h con AX = 0013h y con AX = 0003h?', ['0013h: modo texto; 0003h: modo gráfico', '0013h: modo gráfico 320x200 con 256 colores; 0003h: modo texto 80x25', 'Ambos son modo texto', 'Ambos limpian solo la línea'], 1, 'AH = 00h elige el modo de video; AL = 13h (gráfico) o 03h (texto, limpia la pantalla).'],
    ['Mouse', 'INT 10h con AH = 0Ch…', ['Mueve el cursor', 'Escribe un píxel gráfico: AL = color, BH = página, CX = columna, DX = fila', 'Imprime una cadena', 'Lee una tecla'], 1, 'Se usa en modografico.asm con AL = 0Bh (cian claro).'],
    ['Retos', 'Reto 1: ¿cuándo termina el programa?', ['Con cualquier clic izquierdo', 'Solo cuando se presionan ambos botones al mismo tiempo (BX = 3)', 'Con clic derecho', 'Tras 10 clics'], 1, 'cmp bx,3 / je Salir, tanto en el sondeo como en EsperaSoltar.'],
    ['Retos', 'Reto 1: ¿para qué sirve EsperaSoltar?', ['Para salir', 'Anti-rebote: un clic dura muchas lecturas; sin esperar a que se suelte imprimiría cientos de letras', 'Para ocultar el puntero', 'Para leer coordenadas'], 1, 'Espera hasta BX = 0 y mientras tanto sigue vigilando BX = 3.'],
    ['Retos', 'Reto 2: ¿cuál es la zona caliente que programa el profe?', ['CX 0-80 y DX 0-25', 'CX ≤ 40 y DX ≤ 10 (clic izquierdo)', 'CX ≥ 40 y DX ≥ 10', 'Solo el carácter [X]'], 1, 'cmp cx,40 / ja FueraDeZona; cmp dx,10 / ja FueraDeZona. Los extremos 40 y 10 cuentan como dentro.'],
    ['Retos', 'Reto 2: clic derecho dentro de la zona caliente…', ['Cierra el programa', 'Imprime D y no cierra', 'No hace nada', 'Imprime I'], 1, 'La zona solo se evalúa en ClicIzquierdo.'],
    ['Retos', 'Reto 2: ¿qué pasa con ambos botones presionados (BX = 3)?', ['Sale', 'No hace nada: el sondeo solo compara con 1 y 2', 'Imprime I', 'Imprime D'], 1, 'A diferencia del Reto 1, aquí la salida es por coordenadas, no por ambos botones.'],
    ['Retos', '¿Por qué JA (y no JG) en la comparación de coordenadas?', ['Porque JA es más rápido', 'Porque las coordenadas son números sin signo y JA es el salto sin signo', 'Porque JG no existe', 'Da igual'], 1, 'El curso usa JB/JBE/JA/JAE/JE/JNE; los saltos con signo (JG, JL…) no se usan.'],
    ['Retos', 'En el Reto 2, ¿dónde aparecen las letras I y D?', ['Donde se hizo clic', 'En la posición del cursor de texto (después del título), no en la del mouse', 'En la esquina superior', 'No aparecen'], 1, 'INT 21h/02h escribe en la posición del cursor de texto.']
  ];

  /* La respuesta correcta no debe caer casi siempre en la misma posición: se rota cada lista de opciones de forma fija. */
  const QUIZ = QUIZ_BASE.map((q, i) => {
    const destino = (i * 5 + (i >> 2)) % q[2].length, giro = (destino - q[3] + q[2].length) % q[2].length;
    const op = q[2].map((_, j) => q[2][(j - giro + q[2].length) % q[2].length]);
    return [q[0], q[1], op, destino, q[4]];
  });

  /* ---------- Preguntas abiertas ---------- */
  const ABIERTAS = [
    { q: 'Explica cómo funciona una transferencia por DMA con el 8237, desde que el dispositivo la pide hasta que la CPU recupera los buses.',
      a: 'El dispositivo activa <b>DREQ</b>; el 8237 activa <b>HRQ</b>, conectado a la terminal <b>HOLD</b> del microprocesador. La CPU suspende el programa, deja los buses en <b>alta impedancia</b> y responde con <b>HLDA</b>. El 8237 confirma con <b>DACK</b>, habilita su registro de dirección (<b>AEN</b>) y genera las señales de control: lectura de DMA (memoria → E/S) activa MEMR e IOW; escritura de DMA (E/S → memoria) activa IOR y MEMW. Cada byte descuenta la cuenta; al llegar a la cuenta terminal (TC/EOP) baja HRQ, la CPU baja HLDA y recupera los buses.',
      puntos: ['DREQ → HRQ/HOLD → HLDA', 'Alta impedancia de los buses', 'DACK y AEN', 'Lectura vs escritura de DMA', 'Cuenta terminal / EOP y devolución de buses'] },
    { q: 'Describe los cuatro pasos para programar un canal del 8237 y por qué el orden importa.',
      a: '(1) Limpiar el biestable primero/último (P/U) con un comando de software (una simple salida al puerto); (2) deshabilitar (enmascarar) el canal; (3) programar el byte bajo (LSB) y luego el alto (MSB) de la dirección; (4) programar LSB y MSB de la cuenta (n − 1). El P/U se invierte con cada acceso, así que si no se limpia primero, cuenta y dirección pueden quedar mal. Después se programa el modo de operación y se activa el canal.',
      puntos: ['Limpiar P/U primero', 'Deshabilitar el canal', 'Dirección LSB y MSB', 'Cuenta LSB y MSB (n − 1)', 'Luego modo y activar'] },
    { q: 'Compara los modos de operación del 8237 (demanda, dato sencillo, bloque y cascada).',
      a: '<b>Demanda</b>: transfiere mientras DREQ siga activa (o hasta una señal externa). <b>Dato sencillo</b>: libera HOLD después de transferir un byte. <b>Bloque</b>: transfiere automáticamente el número de bytes que indica el registro de cuenta. <b>Cascada</b>: se usa cuando hay más de un 8237 en el sistema. Se eligen con los bits 6 y 7 del registro de modo.',
      puntos: ['Demanda: mientras DREQ activa', 'Dato sencillo: un byte y suelta HOLD', 'Bloque: toda la cuenta', 'Cascada: varios 8237', 'Bits 6-7 del registro de modo'] },
    { q: 'Diferencia entre un PLD y un PPI. ¿Cuándo conviene cada uno?',
      a: 'El <b>PLD</b> es un dispositivo lógico programable genérico: se diseña la lógica (decodificación de puertos, protocolos propios), es muy flexible y reconfigurable; conviene en interfaces personalizadas o cambiantes, producciones pequeñas y sistemas embebidos. El <b>PPI</b> es una interfaz específica ya hecha (UART, SPI, I2C…): solo se programan parámetros, rinde mejor, es más simple y está bien documentado; conviene para interfaces estándar y grandes volúmenes, a costa de funcionalidad fija.',
      puntos: ['PLD genérico y flexible', 'PPI específico y predefinido', 'Diseño vs solo parámetros', 'Cuándo PLD', 'Cuándo PPI'] },
    { q: '¿Cómo funciona la interfaz básica de entrada/salida de un microprocesador?',
      a: 'Cada puerto es un registro con una <b>dirección única</b>. El micro usa <b>IN</b>/<b>OUT</b> indicando el puerto; los datos pasan por un <b>buffer de E/S</b> y circulan por la línea de datos hacia el dispositivo; las <b>líneas de control</b> indican si es entrada o salida; el dispositivo reconoce su dirección (decodificación de puertos) y responde. El handshaking evita pérdida, repetición o corrupción de datos.',
      puntos: ['Puertos con dirección única', 'IN / OUT', 'Buffer de E/S y línea de datos', 'Líneas de control', 'Decodificación y handshaking'] },
    { q: 'Explica la función de cada pulso de la señal de video compuesta (línea, trama y color burst) y qué es un monitor RGB.',
      a: '<b>Pulso de línea</b>: marca el inicio de cada línea y sincroniza emisor y receptor por línea. <b>Pulso de trama</b>: marca el inicio de cada trama o campo. <b>Color burst</b>: pulso de referencia de color al comienzo de las líneas con croma, sincroniza la fase del color e indica que la línea lleva croma. Un monitor <b>RGB</b> recibe por separado rojo, verde y azul (tres cañones, no necesita decodificar croma); con señales encendido/apagado da 8 colores, y con intensidad 16.',
      puntos: ['Pulso de línea', 'Pulso de trama', 'Color burst: fase y croma', 'RGB separado, 3 cañones', '8 colores + intensidad = 16'] },
    { q: 'Explica línea por línea cómo el programa usomouse.asm lee el mouse y por qué termina.',
      a: 'Inicializa DS, imprime el mensaje (INT 21h/09h) e <b>inicializa el mouse</b> con <code>AX=0000h / INT 33h</code>: si AX = 0 no hay mouse y sale. Muestra el puntero con <code>AX=0001h</code> y entra en un ciclo que lee el estado con <code>AX=0003h</code> (BX = botones, CX = X, DX = Y). Con <code>TEST BX,1</code> revisa el bit 0 (botón izquierdo); si está presionado (JNZ) oculta el puntero (<code>AX=0002h</code>) y termina con INT 21h/4Ch. Si no, hace una pausa con INT 15h/86h y repite.',
      puntos: ['AX=0000h detecta el mouse', 'AX=0001h muestra el puntero', 'AX=0003h en ciclo: BX, CX, DX', 'TEST BX,1 / JNZ', 'Ocultar el puntero y terminar'] },
    { q: 'Reto 1: explica cómo distingue el programa un clic izquierdo, uno derecho y ambos, y para qué sirve la rutina EsperaSoltar.',
      a: 'Lee BX con <code>AX=0003h</code> y lo compara completo: 3 (ambos) → Salir; 1 → imprime I; 2 → imprime D; 0 → sigue sondeando. Para imprimir oculta el puntero, usa <code>INT 21h/02h</code> y lo vuelve a mostrar. <b>EsperaSoltar</b> es el anti-rebote: espera a que BX = 0 para que un solo clic no imprima cientos de letras, y mientras espera sigue vigilando BX = 3.',
      puntos: ['CMP BX con 3, 1 y 2', 'Bit 0 izquierdo / bit 1 derecho', 'Ocultar, imprimir, mostrar', 'Anti-rebote hasta BX = 0', 'Salida con ambos botones'] },
    { q: 'Reto 2: explica la condición de la zona caliente y cuántas celdas de texto cubre realmente.',
      a: 'Con clic izquierdo (BX = 1) hace <code>CMP CX,40 / JA FueraDeZona</code> y <code>CMP DX,10 / JA FueraDeZona</code>; si ninguna se cumple (CX ≤ 40 y DX ≤ 10) → Salir. Las coordenadas del mouse son <b>píxeles virtuales 640x200</b> y cada celda de texto mide 8x8, así que la zona cubre aproximadamente las columnas 0-5 y las filas 0-1: más que los tres caracteres de “[X]”. <span class="badge ded">deducido</span>',
      puntos: ['CX ≤ 40 y DX ≤ 10', 'JA sin signo', 'Coordenadas virtuales 640x200', 'Celda = 8x8 → columnas 0-5, filas 0-1', 'Solo el clic izquierdo'] },
    { q: 'Explica modografico.asm: qué hace cada paso y por qué se divide CX entre 2.',
      a: 'Cambia a modo 13h (<code>INT 10h</code>, AX=0013h: 320x200, 256 colores), inicializa y muestra el mouse y sondea. El clic derecho (<code>TEST BX,2</code>) termina; el izquierdo (<code>TEST BX,1</code>) dibuja. CX viene en coordenadas virtuales 0-639 y la pantalla tiene 320 columnas, así que <code>SHR CX,1</code> lo divide entre 2; DX (0-199) ya coincide. Oculta el mouse, escribe el píxel con <code>INT 10h/AH=0Ch</code> (AL = color, BH = página), lo vuelve a mostrar, y al final oculta el mouse y restaura el modo texto 03h.',
      puntos: ['Modo 13h con INT 10h', 'Derecho sale, izquierdo dibuja', 'SHR CX,1 por 640 → 320', 'Ocultar, AH=0Ch, mostrar', 'Restaurar modo 03h'] },
    { q: '¿Por qué influye la RAM en el uso de formatos de video y qué relación hay entre resolución y memoria?',
      a: 'A mayor resolución hay más datos que guardar temporalmente (un video 4K necesita mucha más RAM que uno HD); editar, renderizar o transcodificar exige descomprimir grandes cantidades de información; los formatos muy comprimidos como HEVC requieren más RAM que MPEG-2; y con tarjeta gráfica integrada la GPU comparte la RAM del sistema. Se recomienda 8 GB como mínimo y 16 GB o más para trabajo profesional.',
      puntos: ['Más resolución, más datos', 'Edición/render/transcodificación', 'HEVC vs MPEG-2', 'GPU integrada comparte RAM', '8 GB mínimo, 16 GB o más'] }
  ];

  const API = { PROGRAMAS, botones, describirBX, coordsMouse, celda, pixel13, enZonaCaliente, celdasZona, decidir, bytesVideo, FORMATOS, mpx, cwcrDe, bytesDe, registroModo, decodificarModo, OPS, MODOS, PASOS_DMA, QUIZ, ABIERTAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.ARQF = API;
  if (typeof document === 'undefined') return;

  /* =====================  INTERFAZ (solo navegador)  ===================== */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = (v, n = 4) => v.toString(16).toUpperCase().padStart(n, '0') + 'h';
  const bin = (v, n) => (v >>> 0).toString(2).padStart(n, '0');

  /* Resaltado ASM mínimo (las clases tk-* están en styles.css) */
  const MNEM = new Set('MOV LEA ADD SUB INC DEC CMP TEST JMP JE JNE JZ JNZ JA JB JAE JBE LOOP PUSH POP INT SHR SHL RET HLT CALL AND OR XOR NOT NEG MUL DIV'.split(' '));
  const REGS = new Set('AX BX CX DX SI DI BP SP AL AH BL BH CL CH DL DH CS DS SS ES'.split(' '));
  const DIREC = new Set('DB DW DUP EQU ORG OFFSET .MODEL .STACK .DATA .CODE END SMALL ENDP PROC @DATA'.split(' '));
  function hlAsm(src) {
    return String(src).split('\n').map(line => {
      let q = null, ci = -1;
      for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === q) q = null; } else if (c === "'" || c === '"') q = c; else if (c === ';') { ci = i; break; } }
      const code = ci >= 0 ? line.slice(0, ci) : line, com = ci >= 0 ? line.slice(ci) : '';
      let out = '', last = 0, m; const re = /'[^']*'?|"[^"]*"?|[A-Za-z_@.][\w@.]*|\d\w*/g;
      while ((m = re.exec(code))) {
        out += esc(code.slice(last, m.index)); last = re.lastIndex;
        const t = m[0], U = t.toUpperCase(); let c = '';
        if (t[0] === "'" || t[0] === '"') c = 'tk-str'; else if (/^\d/.test(t)) c = 'tk-num'; else if (MNEM.has(U)) c = 'tk-kw';
        else if (REGS.has(U)) c = 'tk-type'; else if (DIREC.has(U)) c = 'tk-attr'; else if (code[re.lastIndex] === ':') c = 'tk-lbl';
        out += c ? `<span class="${c}">${esc(t)}</span>` : esc(t);
      }
      return out + esc(code.slice(last)) + (com ? `<span class="tk-com">${esc(com)}</span>` : '');
    }).join('\n');
  }

  /* Programas explicados: <div data-prog="reto1"></div> */
  function pintaPrograma(el) {
    const p = PROGRAMAS[el.dataset.prog]; if (!p) return;
    el.innerHTML = `<div class="fin-prog-head"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.resumen)}</span></div>` +
      p.partes.map((x, i) => `<div class="fin-part"><div class="codebox"><pre class="code" data-hl="1">${hlAsm(x[0])}</pre></div><div class="fin-exp"><span class="fin-n">${i + 1}</span><p class="small">${x[1]}</p></div></div>`).join('') +
      `<details class="qa fin-full"><summary><span class="qn">▸</span>Ver el programa completo (${esc(p.id)}.asm)</summary><div class="ans"><div class="codebox"><pre class="code" data-hl="1">${hlAsm(p.src)}</pre></div></div></details>`;
  }

  /* ---------- Laboratorio del mouse ---------- */
  const VGA16 = ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa', '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'];
  const vgaColor = i => i < 16 ? VGA16[i] : (() => { const g = (i * 37) & 255; return `rgb(${g},${(g * 3) & 255},${(g * 7) & 255})`; })();
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';

  class MouseLab {
    constructor(el) {
      this.el = el; this.prog = 'reto1'; this.mouse = { vx: 0, vy: 0, btn: 0, dentro: false }; this.fin = null;
      el.innerHTML = `
      <div class="fin-ctrl">
        <label class="small" for="mlProg"><b>Programa</b></label>
        <select id="mlProg" class="fin-in">${Object.keys(PROGRAMAS).map(k => `<option value="${k}">${esc(PROGRAMAS[k].nombre)}</option>`).join('')}</select>
        <button type="button" class="btn sec" id="mlReset">Reiniciar</button>
      </div>
      <div class="fin-ctrl">
        <span class="small"><b>Botón al tocar</b> (pantalla táctil; con mouse real usa el botón físico):</span>
        <span class="fin-seg" role="radiogroup" aria-label="Botón al tocar">
          <label><input type="radio" name="mlBtn" value="1" checked> Izquierdo</label>
          <label><input type="radio" name="mlBtn" value="2"> Derecho</label>
          <label><input type="radio" name="mlBtn" value="3"> Ambos</label>
        </span>
      </div>
      <div class="fin-ctrl">
        <label class="small"><input type="checkbox" id="mlQ" checked> Coordenadas en múltiplos de 8 en modo texto <span class="badge ded">deducido</span></label>
        <label class="small"><input type="checkbox" id="mlG" checked> Mostrar celdas de 8x8</label>
        <label class="small"><input type="checkbox" id="mlZ" checked> Mostrar zona caliente (CX ≤ 40, DX ≤ 10)</label>
      </div>
      <div class="fin-stage"><canvas id="mlCv" width="1280" height="400" aria-label="Pantalla del programa: pasa el puntero y haz clic"></canvas></div>
      <p class="small muted fin-hint" id="mlHint"></p>
      <div class="grid g2 fin-read">
        <div class="card tile"><span class="tag">LO QUE DEVOLVERÍA INT 33h · AX = 0003h</span>
          <table class="fin-regs"><tbody>
            <tr><th>BX</th><td class="mono" id="mlBX">0000h</td><td class="small" id="mlBXd">ningún botón</td></tr>
            <tr><th>CX</th><td class="mono" id="mlCX">0000h</td><td class="small" id="mlCXd">X = 0</td></tr>
            <tr><th>DX</th><td class="mono" id="mlDX">0000h</td><td class="small" id="mlDXd">Y = 0</td></tr>
          </tbody></table>
          <p class="small" id="mlCell"></p>
        </div>
        <div class="card tile"><span class="tag">QUÉ DECIDE EL PROGRAMA</span>
          <p id="mlDec" class="fin-dec"></p>
          <p class="small muted" id="mlSt"></p>
        </div>
      </div>
      <details class="qa" open><summary><span class="qn">▸</span>Pantalla del programa (texto)</summary><div class="ans"><pre class="fin-scr" id="mlOut" tabindex="0"></pre></div></details>`;
      this.cv = $('#mlCv', el); this.ctx = this.cv.getContext('2d');
      $('#mlProg', el).addEventListener('change', e => { this.prog = e.target.value; this.reiniciar(); });
      $('#mlReset', el).addEventListener('click', () => this.reiniciar());
      ['mlQ', 'mlG', 'mlZ'].forEach(id => $('#' + id, el).addEventListener('change', () => this.pinta()));
      this.cv.addEventListener('contextmenu', e => e.preventDefault());
      const mover = e => { const r = this.cv.getBoundingClientRect(); this.mouse.vx = Math.max(0, Math.min(639, Math.floor((e.clientX - r.left) / r.width * 640))); this.mouse.vy = Math.max(0, Math.min(199, Math.floor((e.clientY - r.top) / r.height * 200))); this.mouse.dentro = true; };
      const botonesDe = e => e.pointerType === 'mouse' ? (e.buttons & 7) : +($('input[name="mlBtn"]:checked', el).value);
      this.cv.addEventListener('pointermove', e => { mover(e); if (e.pointerType === 'mouse') this.mouse.btn = e.buttons & 7; });
      this.cv.addEventListener('pointerdown', e => { e.preventDefault(); mover(e); try { this.cv.setPointerCapture(e.pointerId); } catch (x) { } this.mouse.btn = botonesDe(e) || (e.pointerType === 'mouse' ? 1 : this.mouse.btn); });
      const up = e => { if (e.pointerType === 'mouse' && e.buttons) { this.mouse.btn = e.buttons & 7; return; } this.mouse.btn = 0; };
      this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', () => { this.mouse.btn = 0; });
      this.cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !e.buttons) this.mouse.dentro = false; });
      this.visible = true;
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { this.visible = es.some(x => x.isIntersecting); }).observe(this.cv);
      this.reiniciar();
      const tick = () => { this.paso(); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
    reiniciar() {
      const p = PROGRAMAS[this.prog];
      this.cv.dataset.modo = p.modo;
      try { this.m = new ASM.Machine(ASM.assemble(p.src), {}); this.err = null; }
      catch (e) { this.m = null; this.err = e.message; }
      this.mouse.btn = 0; this.gfxCopia = null;
      $('#mlHint', this.el).textContent = p.modo === 'grafico'
        ? 'Modo 13h (320x200). Clic izquierdo dibuja, clic derecho termina. El driver entrega CX de 0 a 639 y DX de 0 a 199.'
        : 'Modo texto 80x25: el lienzo equivale a 640x200 píxeles virtuales (celdas de 8x8). Pasa el puntero y haz clic (izquierdo, derecho o ambos).';
      this.pinta();
    }
    coords() { return coordsMouse(this.mouse.vx, this.mouse.vy, { modo: PROGRAMAS[this.prog].modo === 'grafico' && this.m && this.m.vmode === 0x13 ? 'grafico' : 'texto', cuantizar: $('#mlQ', this.el).checked }); }
    paso() {
      const m = this.m; if (!m || !this.visible || document.hidden) return;
      const c = this.coords();
      if (m.state === 'run') {
        m.mouse.btn = this.mouse.btn; m.mouse.x = c.cx; m.mouse.y = c.dx;  // coordsMouse devuelve {cx, dx}: dx es la Y (registro DX)
        for (let i = 0; i < 600 && m.state === 'run'; i++) m.step();
        if (m.vmode === 0x13 && m.gfx) this.gfxCopia = m.gfx;
      }
      this.pinta();
    }
    pinta() {
      const el = this.el, m = this.m, ctx = this.ctx, p = PROGRAMAS[this.prog], W = 1280, H = 400;
      const c = this.coords(), bx = this.mouse.btn & 7;
      const grafico = m && m.vmode === 0x13;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = VGA16[0]; ctx.fillRect(0, 0, W, H);
      if (m && grafico && m.gfx) {
        const g = m.gfx;
        // cada píxel de 320x200 ocupa 4x2 px del lienzo de 1280x400
        for (let y = 0; y < 200; y++) for (let x = 0; x < 320; x++) {
          const v = g[y * 320 + x]; if (!v) continue;
          const col = vgaColor(v); ctx.fillStyle = col; ctx.fillRect(x * 4, y * 2, 4, 2);
        }
      } else if (m) {
        ctx.font = 'bold 15px "Cascadia Mono",Consolas,Menlo,monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        for (let r = 0; r < 25; r++) for (let q = 0; q < 80; q++) {
          const ch = m.scr[r * 80 + q]; if (ch === 32 || ch === 0) continue;
          ctx.fillStyle = VGA16[m.att[r * 80 + q] & 15]; ctx.fillText(ASM.CP437[ch], q * 16 + 8, r * 16 + 9);
        }
      }
      const texto = !grafico;
      if ($('#mlG', el).checked && texto) { ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= W; x += 16) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); } for (let y = 0; y <= H; y += 16) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); } ctx.stroke(); }
      if ($('#mlZ', el).checked && texto) {
        const z = celdasZona(), q = $('#mlQ', el).checked; ctx.save(); ctx.fillStyle = tok('--accent'); ctx.globalAlpha = .28;
        if (q) ctx.fillRect(z.col0 * 16, z.fila0 * 16, (z.col1 + 1) * 16, (z.fila1 + 1) * 16); else ctx.fillRect(0, 0, 41 * 2, 11 * 2);
        ctx.globalAlpha = 1; ctx.strokeStyle = tok('--accent'); ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        if (q) ctx.strokeRect(1, 1, (z.col1 + 1) * 16 - 2, (z.fila1 + 1) * 16 - 2); else ctx.strokeRect(1, 1, 41 * 2 - 2, 11 * 2 - 2);
        ctx.restore();
      }
      // puntero del mouse (solo si el programa lo mostró con AX=0001h)
      const vis = m && m.mouse.visible > 0;
      if (vis && this.mouse.dentro) {
        ctx.save();
        if (texto) { const col = Math.floor(c.cx / 8), fila = Math.floor(c.dx / 8); ctx.fillStyle = bx ? tok('--err') : '#aaaaaa'; ctx.globalAlpha = .75; ctx.fillRect(col * 16, fila * 16, 16, 16); }
        else { const x = c.cx * 2, y = c.dx * 2; ctx.strokeStyle = bx ? '#ff5555' : '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); }
        ctx.restore();
      }
      // lectura
      const d = decidir(this.prog, bx, c.cx, c.dx), ce = celda(c.cx, c.dx);
      $('#mlBX', el).textContent = hex(bx) + ' = ' + bin(bx, 3) + 'b'; $('#mlBXd', el).textContent = describirBX(bx);
      $('#mlCX', el).textContent = hex(c.cx); $('#mlCXd', el).textContent = 'X = ' + c.cx;
      $('#mlDX', el).textContent = hex(c.dx); $('#mlDXd', el).textContent = 'Y = ' + c.dx;
      $('#mlCell', el).textContent = grafico ? `Modo 13h: píxel de pantalla (CX/2, DX) = (${c.cx >> 1}, ${c.dx})` : `Celda de texto: columna ${ce.col}, fila ${ce.fila}  (CX/8, DX/8)  ·  ${enZonaCaliente(c.cx, c.dx) ? 'DENTRO' : 'fuera'} de la zona CX ≤ 40, DX ≤ 10`;
      const dec = $('#mlDec', el); dec.textContent = d.texto; dec.dataset.a = d.accion || '';
      let st = '';
      if (this.err) st = 'No se pudo ensamblar: ' + this.err;
      else if (m.state === 'exit' || m.state === 'end') st = 'El programa terminó. Pulsa Reiniciar para ejecutarlo otra vez.';
      else if (m.state === 'error') st = 'Error del simulador: ' + m.error;
      else st = m.mouse.visible > 0 ? 'Ejecutando: el puntero está visible (AX=0001h ya se ejecutó).' : 'Ejecutando: el puntero está oculto (aún no se llamó a AX=0001h o se llamó a AX=0002h).';
      $('#mlSt', el).textContent = st;
      $('#mlOut', el).textContent = m ? (grafico ? `[modo gráfico 13h]  píxeles dibujados: ${m.pixels}` : m.screenText()) : '';
    }
  }

  /* ---------- Ciclo de DMA (paso a paso sobre el diagrama) ---------- */
  function iniciaDma(el) {
    let i = 0;
    const out = $('[data-dma="txt"]', el), cnt = $('[data-dma="n"]', el), prev = $('[data-dma="prev"]', el), next = $('[data-dma="next"]', el);
    const pinta = () => {
      const p = PASOS_DMA[i];
      $$('[data-dsig]', el).forEach(g => g.classList.toggle('on', p.act.includes(g.dataset.dsig)));
      out.innerHTML = `<b>${i + 1}. ${esc(p.t)}</b><br>${p.d}`;
      cnt.textContent = `Paso ${i + 1} de ${PASOS_DMA.length}`; prev.disabled = i === 0; next.disabled = i === PASOS_DMA.length - 1;
    };
    prev.addEventListener('click', () => { if (i > 0) { i--; pinta(); } });
    next.addEventListener('click', () => { if (i < PASOS_DMA.length - 1) { i++; pinta(); } });
    pinta();
  }

  /* ---------- Registro de modo del 8237 ---------- */
  function iniciaModo(el) {
    const g = n => $('[data-m="' + n + '"]', el);
    const calc = () => {
      const o = { canal: +g('canal').value, op: g('op').value, auto: g('auto').checked, decremento: g('dec').checked, modo: g('modo').value };
      const v = registroModo(o), b = bin(v, 8);
      $('[data-m="bits"]', el).innerHTML = `<span class="mono fin-bits">${b.slice(0, 2)}<i>|</i>${b[2]}<i>|</i>${b[3]}<i>|</i>${b.slice(4, 6)}<i>|</i>${b.slice(6)}</span>`;
      $('[data-m="val"]', el).textContent = `${hex(v, 2)}  (${v})`;
    };
    $$('select,input', el).forEach(x => x.addEventListener('change', calc)); calc();
  }

  /* ---------- Calculadoras ---------- */
  function iniciaCoord(el) {
    const cx = $('[data-c="cx"]', el), dx = $('[data-c="dx"]', el), out = $('[data-c="out"]', el);
    const calc = () => {
      const x = Math.max(0, Math.min(639, parseInt(cx.value, 10) || 0)), y = Math.max(0, Math.min(199, parseInt(dx.value, 10) || 0));
      const c = celda(x, y), p = pixel13(x, y), z = enZonaCaliente(x, y);
      out.innerHTML = '';
      [['Modo texto 80x25', `columna = CX/8 = ${c.col} · fila = DX/8 = ${c.fila}`], ['Modo 13h (320x200)', `x = CX/2 = ${p.x} · y = DX = ${p.y}`],
      ['Reto 2 (CX ≤ 40 y DX ≤ 10)', z ? 'DENTRO de la zona caliente: un clic izquierdo cierra' : `FUERA (${x > 40 ? 'CX > 40' : 'DX > 10'}): un clic izquierdo imprime I`]].forEach(r => {
        const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = r[0] + ': '; li.append(b, document.createTextNode(r[1])); out.append(li);
      });
    };
    [cx, dx].forEach(i => i.addEventListener('input', calc)); calc();
  }
  function iniciaVideo(el) {
    const w = $('[data-v="w"]', el), h = $('[data-v="h"]', el), b = $('[data-v="b"]', el), out = $('[data-v="out"]', el);
    const calc = () => {
      const W = Math.max(1, parseInt(w.value, 10) || 1), H = Math.max(1, parseInt(h.value, 10) || 1), B = Math.max(1, parseInt(b.value, 10) || 1), by = bytesVideo(W, H, B);
      out.textContent = `${W} × ${H} = ${(W * H).toLocaleString('es')} píxeles · ${B} bits/píxel → ${by.toLocaleString('es')} bytes (${(by / 1024).toFixed(1)} KB · ${(by / 1048576).toFixed(2)} MB)`;
    };
    $$('[data-vp]', el).forEach(x => x.addEventListener('click', () => { const [a, c, d] = x.dataset.vp.split(',').map(Number); w.value = a; h.value = c; b.value = d; calc(); }));
    [w, h, b].forEach(i => i.addEventListener('input', calc)); calc();
  }
  function iniciaDmaCuenta(el) {
    const n = $('[data-k="n"]', el), out = $('[data-k="out"]', el);
    const calc = () => { const v = Math.max(1, Math.min(65536, parseInt(n.value, 10) || 1)); out.textContent = `Para transferir ${v} byte${v === 1 ? '' : 's'}, CWCR = ${v} − 1 = ${v - 1} = ${hex(cwcrDe(v))}  ·  LSB = ${hex(cwcrDe(v) & 0xFF, 2)}, MSB = ${hex(cwcrDe(v) >> 8, 2)} (se escriben en ese orden)`; };
    n.addEventListener('input', calc); calc();
  }
  function pintaFormatos(el) {
    el.innerHTML = '<table><thead><tr><th>Formato</th><th>Resolución</th><th>Megapíxeles</th></tr></thead><tbody>' +
      FORMATOS.map(f => `<tr><td>${esc(f[0])}</td><td class="mono">${f[1]}x${f[2]}</td><td class="mono">${mpx(f[1], f[2]).toFixed(2)}</td></tr>`).join('') + '</tbody></table>';
  }

  function init() {
    $$('[data-prog]').forEach(pintaPrograma);
    const lab = $('#labMouse'); if (lab && window.ASM) new MouseLab(lab);
    const d = $('#dmaFig'); if (d) iniciaDma(d);
    const m = $('#modoDma'); if (m) iniciaModo(m);
    const c = $('#calcCoord'); if (c) iniciaCoord(c);
    const v = $('#calcVideo'); if (v) iniciaVideo(v);
    const k = $('#calcDma'); if (k) iniciaDmaCuenta(k);
    const f = $('#tblFormatos'); if (f) pintaFormatos(f);
    if (window.Comunes) {
      Comunes.quiz('#quizApp', QUIZ);
      Comunes.abiertas('#abiertasApp', ABIERTAS, 'arqui2-final-abiertas');
    }
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : globalThis);
