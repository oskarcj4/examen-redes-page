/* ===== Arquitectura II · Examen final: laboratorios extra (window.ARQL) =====
   Retos propuestos sobre los programas del profe (se corrigen solos con un mouse guionizado).
   La primera parte es lógica pura y sirve en Node: require('./js/arqui2-labs.js') junto con asm8086.js
   y arqui2-final.js. La interfaz va al final y solo corre en el navegador.
   Todo lo de este archivo es material de práctica propuesto por la guía, no del profesor. */
(function (root) {
  'use strict';
  const ASM = root.ASM || (typeof require !== 'undefined' ? require('./asm8086.js') : null);
  const ARQF = root.ARQF || (typeof require !== 'undefined' ? require('./arqui2-final.js') : null);
  const P = ARQF.PROGRAMAS;

  /* ---------- Mouse guionizado ----------
     INT 33h / AX=0003h consume un evento por lectura; el último se repite para siempre. */
  const clic = (b, x, y, n = 3) => [...Array(n).fill({ b, x, y }), ...Array(n).fill({ b: 0, x, y })];
  const guion = (...partes) => [{ b: 0, x: 0, y: 0 }].concat(...partes);

  /* Ejecuta un programa con un guion de mouse. Guarda la última pantalla gráfica aunque el programa
     vuelva al modo texto al salir (restaurar_texto borra m.gfx). */
  function ejecutar(src, script, limite = 300000) {
    let m;
    try { m = new ASM.Machine(ASM.assemble(src), { mouseScript: script }); }
    catch (e) { return { ok: false, error: 'No ensambla: ' + e.message, out: '', state: 'asm' }; }
    let gfx = null;
    while (m.state === 'run' && m.steps < limite) { m.step(); if (m.gfx) gfx = m.gfx; }
    const ok = m.state === 'exit' || m.state === 'end';
    const error = m.state === 'error' ? 'Error en ejecución: ' + m.error
      : m.state === 'run' ? 'El programa no terminó (¿se quedó sondeando para siempre?)' : null;
    return { ok, error, out: m.out, state: m.state, gfx, m };
  }
  const px = (r, x, y) => r.gfx ? r.gfx[y * 320 + x] : -1;

  /* ---------- Retos propuestos ---------- */
  const cambia = (src, pares) => pares.reduce((s, [a, b]) => { if (!s.includes(a)) throw new Error('Plantilla sin: ' + a); return s.replace(a, b); }, src);
  const FIN1 = '\n\nAmbos botones detectados';

  const RETOS = [
    {
      id: 'central', base: 'reto1', modo: 'texto', titulo: 'Reto A · botón central',
      enunciado: 'Parte del <b>Reto 1</b>. Agrega el <b>botón central</b>: si solo se presiona el central (BX = 4 = 100b) imprime <code>C</code>. Lo demás sigue igual (I, D y ambos para salir).',
      pistas: ['El estado del central es el bit 2 de BX: solo central → BX = 4.', 'Agrega cmp bx, 4 / je ClicCentral en el ciclo de sondeo, antes del jmp Sondeo.', 'ClicCentral: pone mov BL, \'C\' y salta a Imprimir; el anti-rebote ya sirve.'],
      modelo: s => cambia(s, [
        ['    jmp Sondeo\nClicIzquierdo:', '    cmp bx, 4                   ; 4 = 100b -> solo el central\n    je  ClicCentral\n    jmp Sondeo\nClicIzquierdo:'],
        ['ClicDerecho:\n    mov BL, \'D\'', 'ClicCentral:\n    mov BL, \'C\'\n    jmp Imprimir\n\nClicDerecho:\n    mov BL, \'D\'']]),
      pruebas: [
        { d: 'izquierdo, derecho, central y ambos → imprime IDC y termina', g: guion(clic(1, 80, 40), clic(2, 80, 40), clic(4, 80, 40), [{ b: 3, x: 80, y: 40 }]),
          ok: r => r.ok && r.out.includes('IDC' + FIN1) },
        { d: 'central dos veces → CC (el anti-rebote no repite letras)', g: guion(clic(4, 0, 0), clic(4, 0, 0), [{ b: 3, x: 0, y: 0 }]),
          ok: r => r.ok && r.out.includes('CC' + FIN1) },
        { d: 'sigue saliendo con ambos sin imprimir nada', g: guion([{ b: 3, x: 0, y: 0 }]), ok: r => r.ok && r.out.includes('salir.\n\n' + FIN1) }
      ]
    },
    {
      id: 'esquina', base: 'reto2', modo: 'texto', titulo: 'Reto B · zona caliente en la esquina superior derecha',
      enunciado: 'Parte del <b>Reto 2</b>. Mueve la zona de cierre a la <b>esquina superior derecha</b>: cierra con clic izquierdo si <b>CX ≥ 600</b> y <b>DX ≤ 10</b>. Fuera de esa zona imprime I. (Opcional: dibuja el <code>[X]</code> en la columna 77.)',
      pistas: ['Solo cambia la comparación de CX; la de DX se queda.', 'CX ≥ 600 es lo mismo que “si CX < 600 → fuera”. ¿Qué salto sin signo significa “menor”?', 'cmp cx, 600 / jb FueraDeZona. Para el dibujo: mov dl, 77 en el primer INT 10h / AH=02h.'],
      modelo: s => cambia(s, [
        ['    cmp cx, 40\n    ja  FueraDeZona','    cmp cx, 600\n    jb  FueraDeZona           ; X < 600 -> fuera (JB = sin signo)'],
        ['    mov dh, 0\n    mov dl, 0\n    int 10h', '    mov dh, 0\n    mov dl, 77\n    int 10h']]),
      pruebas: [
        { d: 'clic izquierdo en (0, 0) ya no cierra: imprime I; luego (616, 8) cierra', g: guion(clic(1, 0, 0), [{ b: 1, x: 616, y: 8 }]),
          ok: r => r.ok && r.out.includes('I\n\nClic en la zona') },
        { d: 'CX = 599 está fuera → I; CX = 600, DX = 10 cierra', g: guion(clic(1, 599, 0), [{ b: 1, x: 600, y: 10 }]),
          ok: r => r.ok && r.out.includes('I\n\nClic en la zona') },
        { d: 'DX = 11 está fuera aunque CX = 639 → I', g: guion(clic(1, 639, 11), [{ b: 1, x: 639, y: 0 }]),
          ok: r => r.ok && r.out.includes('I\n\nClic en la zona') },
        { d: 'clic derecho en la zona no cierra: imprime D', g: guion(clic(2, 620, 0), [{ b: 1, x: 620, y: 0 }]),
          ok: r => r.ok && r.out.includes('D\n\nClic en la zona') }
      ]
    },
    {
      id: 'contador', base: 'reto1', modo: 'texto', titulo: 'Reto C · contar clics izquierdos',
      enunciado: 'Parte del <b>Reto 1</b>. Cuenta los clics <b>izquierdos</b> y, al salir con ambos botones, imprime la cuenta (un dígito, 0 a 9) <b>justo antes</b> del mensaje final.',
      pistas: ['Declara una variable en .DATA: Cuenta DB 0.', 'En ClicIzquierdo haz inc Cuenta antes de guardar la letra.', 'En Salir, antes de lea dx, MensajeFin: mov dl, Cuenta / add dl, \'0\' / mov ah, 02h / int 21h.'],
      modelo: s => cambia(s, [
        ['    MensajeFin     DB', '    Cuenta         DB 0\n    MensajeFin     DB'],
        ['ClicIzquierdo:\n    mov BL, \'I\'', 'ClicIzquierdo:\n    inc Cuenta\n    mov BL, \'I\''],
        ['    int 33h\n\n    lea dx, MensajeFin', '    int 33h\n\n    mov dl, Cuenta\n    add dl, \'0\'\n    mov ah, 02h\n    int 21h\n\n    lea dx, MensajeFin']]),
      pruebas: [
        { d: '3 izquierdos y 1 derecho → IIID3', g: guion(clic(1, 8, 8), clic(1, 8, 8), clic(1, 8, 8), clic(2, 8, 8), [{ b: 3, x: 8, y: 8 }]),
          ok: r => r.ok && r.out.includes('IIID3' + FIN1) },
        { d: 'sin clics izquierdos → 0', g: guion(clic(2, 8, 8), [{ b: 3, x: 8, y: 8 }]), ok: r => r.ok && r.out.includes('D0' + FIN1) },
        { d: 'los derechos no cuentan: D D I → 1', g: guion(clic(2, 0, 0), clic(2, 0, 0), clic(1, 0, 0), [{ b: 3, x: 0, y: 0 }]),
          ok: r => r.ok && r.out.includes('DDI1' + FIN1) }
      ]
    },
    {
      id: 'colores', base: 'modografico', modo: 'grafico', titulo: 'Reto D · dos colores en modo 13h',
      enunciado: 'Parte de <b>modografico.asm</b>. Clic izquierdo dibuja en <b>cian claro (0Bh)</b>, clic derecho dibuja en <b>rojo claro (0Ch)</b> y se sale con <b>ambos botones</b> (BX = 3).',
      pistas: ['Ya no sirve test bx, 2 / jnz terminar_grafico: con el derecho ahora se dibuja. Compara BX completo: cmp bx, 3 / je terminar_grafico.', 'AL se pisa con mov ax, 0002h, así que guarda el color en una variable (color DB 0Bh en .data, e inicializa DS con @data).', 'Elige el color con cmp bx, 1 / je pintar y si no, mov color, 0Ch; en el dibujo usa mov al, color.'],
      modelo: s => cambia(s, [
        ['.data\n', '.data\n    color db 0Bh\n'],
        ['main proc\n', 'main proc\n    mov ax, @data\n    mov ds, ax\n'],
        ['    test bx, 2\n    jnz terminar_grafico\n\n    test bx, 1\n    jz bucle_dibujo\n    shr cx, 1',
          '    cmp bx, 3\n    je terminar_grafico\n    cmp bx, 0\n    je bucle_dibujo\n\n    mov color, 0Bh\n    cmp bx, 1\n    je pintar\n    mov color, 0Ch\npintar:\n    shr cx, 1'],
        ['    mov al, 0Bh', '    mov al, color']]),
      pruebas: [
        { d: 'izquierdo en (200, 50) → píxel (100, 50) cian 0Bh', g: guion(clic(1, 200, 50), [{ b: 3, x: 0, y: 0 }]),
          ok: r => r.ok && px(r, 100, 50) === 0x0B },
        { d: 'derecho en (300, 120) → píxel (150, 120) rojo 0Ch y no termina', g: guion(clic(2, 300, 120), clic(1, 10, 10), [{ b: 3, x: 0, y: 0 }]),
          ok: r => r.ok && px(r, 150, 120) === 0x0C && px(r, 5, 10) === 0x0B },
        { d: 'ambos botones termina sin dibujar', g: guion([{ b: 3, x: 400, y: 100 }]), ok: r => r.ok && r.m.pixels === 0 }
      ]
    }
  ];
  RETOS.forEach(r => { r.plantilla = P[r.base].src; r.solucion = r.modelo(r.plantilla); });

  /* Corre todas las pruebas de un reto. Devuelve [{d, ok, error}] */
  function corregir(reto, src) {
    return reto.pruebas.map(t => {
      const r = ejecutar(src, t.g);
      let ok = false; try { ok = !!t.ok(r); } catch (e) { ok = false; }
      return { d: t.d, ok, error: ok ? null : r.error };
    });
  }

  const API = { clic, guion, ejecutar, RETOS, corregir };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.ARQL = API;
  if (typeof document === 'undefined') return;

  /* =====================  INTERFAZ (solo navegador)  ===================== */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = id => 'arqui2-final-reto-' + id;
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } };

  function pintaReto(cont, reto) {
    const card = document.createElement('div'); card.className = 'lab lab-reto';
    card.innerHTML = `<h3></h3><p class="small" data-r="enun"></p>
      <label class="small" for="ed-${reto.id}"><b>Tu programa</b> (parte de la plantilla del profe; se guarda en este navegador)</label>
      <textarea class="fin-ed" id="ed-${reto.id}" spellcheck="false" autocomplete="off" rows="16"></textarea>
      <div class="fin-ctrl">
        <button type="button" class="btn" data-r="probar">Probar</button>
        <button type="button" class="btn sec" data-r="lab">Abrir en el laboratorio del mouse</button>
        <button type="button" class="btn sec" data-r="reset">Restaurar plantilla</button>
      </div>
      <ul class="lab-res" data-r="res" aria-live="polite"></ul>
      <div data-r="pistas"></div>
      <details class="qa"><summary><span class="qn">▸</span>Ver una solución</summary><div class="ans"><div class="codebox"><pre class="code" data-r="sol"></pre></div></div></details>`;
    $('h3', card).textContent = reto.titulo;
    $('[data-r="enun"]', card).innerHTML = reto.enunciado;   // texto propio de la guía (no viene del usuario)
    $('[data-r="sol"]', card).textContent = reto.solucion;
    const ed = $('textarea', card);
    ed.value = leer(KEY(reto.id)) || reto.plantilla;
    ed.addEventListener('input', () => guardar(KEY(reto.id), ed.value));
    ed.addEventListener('keydown', e => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ed.setRangeText('    ', ed.selectionStart, ed.selectionEnd, 'end'); guardar(KEY(reto.id), ed.value); } });
    const res = $('[data-r="res"]', card);
    $('[data-r="probar"]', card).addEventListener('click', () => {
      res.textContent = '';
      const rs = corregir(reto, ed.value), bien = rs.filter(r => r.ok).length;
      rs.forEach(r => {
        const li = document.createElement('li'); li.className = r.ok ? 'ok' : 'bad';
        li.textContent = (r.ok ? '✓ ' : '✗ ') + r.d + (r.error ? ' · ' + r.error : '');
        res.append(li);
      });
      const tot = document.createElement('li'); tot.className = 'tot ' + (bien === rs.length ? 'ok' : 'bad');
      tot.textContent = bien === rs.length ? `Correcto: ${bien}/${rs.length} pruebas.` : `${bien}/${rs.length} pruebas. Revisa las marcadas con ✗.`;
      res.append(tot);
    });
    $('[data-r="lab"]', card).addEventListener('click', () => {
      const lab = window.ARQF && window.ARQF.lab; if (!lab) return;
      lab.cargar(ed.value, reto.modo);
      const sec = document.getElementById('laboratorio'); if (sec) sec.scrollIntoView({ block: 'start' });
    });
    $('[data-r="reset"]', card).addEventListener('click', () => { ed.value = reto.plantilla; guardar(KEY(reto.id), null); res.textContent = ''; });
    if (window.Comunes && Comunes.pistas) Comunes.pistas($('[data-r="pistas"]', card), reto.pistas);
    cont.append(card);
  }

  function init() {
    const c = $('#retosApp'); if (c) RETOS.forEach(r => pintaReto(c, r));
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : globalThis);
