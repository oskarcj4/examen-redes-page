/* ===== Redes I · Parcial III (clases 18–24) =====
   Núcleo sin DOM (sirve en Node con require) + render de figuras y laboratorio.
   Todo va dentro de una IIFE: main.js ya declara STATES, clean, hd… en el ámbito global. */
(function (global) {
  'use strict';

  /* ---------- utilidades ---------- */
  const soloBits = s => (s || '').replace(/[^01]/g, '');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Clase 18 · codificador del diagrama de estado / árbol ----------
     Tabla del profesor (Codificacion_Diagrama de Arbol.pdf). Estados: a=00, b=10, c=01, d=11.
     Reproduce la tabla: o1 = u⊕s1⊕s2 · o2 = u⊕s2 · siguiente = u s1 (generadores 111 y 101). */
  const NOMBRE = { '00': 'a', '10': 'b', '01': 'c', '11': 'd' };
  function paso(st, u) {
    const s1 = +st[0], s2 = +st[1];
    return { out: '' + (u ^ s1 ^ s2) + (u ^ s2), next: '' + u + s1 };
  }
  function codificar(bits) {
    bits = soloBits(bits);
    let st = '00'; const filas = [];
    for (const b of bits) {
      const u = +b, r = paso(st, u);
      filas.push({ u, st, out: r.out, next: r.next });
      st = r.next;
    }
    return { filas, salida: filas.map(f => f.out).join(' ') };
  }

  /* ---------- Clase 19 · suma de verificación (complemento a 1, acarreo final se suma) ---------- */
  function checksum(palabras) {
    const ws = palabras.map(soloBits).filter(Boolean);
    if (!ws.length) throw new Error('Escribe al menos una palabra binaria.');
    const n = ws[0].length;
    if (ws.some(w => w.length !== n)) throw new Error('Todas las palabras deben tener la misma cantidad de bits (' + n + ').');
    if (n > 32) throw new Error('Usa palabras de 32 bits o menos.');
    const M = 2 ** n - 1; let acc = 0; const pasos = [];
    ws.forEach((w, i) => {
      const v = parseInt(w, 2);
      if (i === 0) { acc = v; pasos.push({ a: null, b: w, bruto: null, acarreo: false, res: w }); return; }
      const a = acc.toString(2).padStart(n, '0');
      let t = acc + v; const bruto = t.toString(2).padStart(n, '0');
      const acarreo = t > M;
      if (acarreo) t = (t - (M + 1)) + 1;
      // un segundo desborde solo ocurre si t = M + 1 tras sumar el acarreo (imposible: t ≤ M)
      acc = t;
      pasos.push({ a, b: w, bruto, acarreo, res: acc.toString(2).padStart(n, '0') });
    });
    const suma = acc.toString(2).padStart(n, '0');
    const ck = suma.split('').map(c => c === '1' ? '0' : '1').join('');
    return { n, palabras: ws, pasos, suma, checksum: ck };
  }
  /* Receptor: suma todas las palabras + checksum; si da todo 1 no hay error detectado */
  function verificarChecksum(palabras, ck) {
    const r = checksum([...palabras, ck]);
    return { ...r, ok: /^1+$/.test(r.suma) };
  }

  /* ---------- Clase 20 · CRC (división módulo 2) ---------- */
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  /* Acepta "10011" o "x^4 + x + 1", "x4+x+1", "x⁴+x+1" */
  function leerGenerador(txt) {
    txt = (txt || '').trim();
    if (/^[01\s]+$/.test(txt)) return soloBits(txt);
    const t = txt.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => SUP[c]).replace(/\s+/g, '').toLowerCase();
    if (!/^[x0-9^+]+$/.test(t)) throw new Error('Escribe el generador en binario (10011) o como polinomio (x^4+x+1).');
    const grados = new Set();
    for (const term of t.split('+').filter(Boolean)) {
      if (term === '1') grados.add(0);
      else if (term === 'x') grados.add(1);
      else { const m = term.match(/^x\^?(\d+)$/); if (!m) throw new Error('Término no válido: ' + term); grados.add(+m[1]); }
    }
    const g = Math.max(...grados);
    if (g > 32) throw new Error('Usa un polinomio de grado 32 o menor.');
    let s = ''; for (let i = g; i >= 0; i--) s += grados.has(i) ? '1' : '0';
    return s;
  }
  function aPolinomio(bits) {
    const n = bits.length - 1; const t = [];
    bits.split('').forEach((b, i) => { if (b === '1') { const e = n - i; t.push(e === 0 ? '1' : e === 1 ? 'x' : 'x<sup>' + e + '</sup>'); } });
    return t.join(' + ') || '0';
  }
  /* División larga. Devuelve las filas para dibujar la tabla igual que en clase */
  function dividir(dividendo, g) {
    const a = dividendo.split('').map(Number), gg = g.split('').map(Number), L = a.length, k = g.length;
    const pos = [];
    for (let i = 0; i <= L - k; i++) if (a[i]) { pos.push(i); for (let j = 0; j < k; j++) a[i + j] ^= gg[j]; }
    // Repetir para guardar el estado del arreglo tras cada XOR
    const b = dividendo.split('').map(Number), filas = [];
    pos.forEach((p, idx) => {
      filas.push({ tipo: 'div', desde: p, bits: g });
      for (let j = 0; j < k; j++) b[p + j] ^= gg[j];
      const hasta = idx + 1 < pos.length ? pos[idx + 1] + k - 1 : L - 1;
      filas.push({ tipo: 'res', desde: p, bits: b.slice(p, hasta + 1).join(''), ultimo: idx + 1 === pos.length });
    });
    return { filas, residuo: a.slice(L - (k - 1)).join(''), L };
  }
  function crc(m, g) {
    m = soloBits(m); g = soloBits(g);
    if (!m) throw new Error('Escribe los datos M en binario.');
    if (g.length < 2) throw new Error('El generador debe tener al menos 2 bits.');
    if (g[0] !== '1' || g[g.length - 1] !== '1') throw new Error('El primer y el último bit del generador deben ser 1 (regla de la clase 20).');
    if (m.length <= g.length - 1) throw new Error('La trama debe ser más larga que el generador.');
    if (m.length + g.length > 64) throw new Error('Usa como máximo 64 bits entre datos y generador.');
    const r = g.length - 1;
    const ext = m + '0'.repeat(r);
    const d = dividir(ext, g);
    return { m, g, r, ext, ...d, T: m + d.residuo };
  }
  function verificarCRC(t, g) {
    t = soloBits(t); g = soloBits(g);
    if (t.length < g.length) throw new Error('La trama recibida es más corta que el generador.');
    const d = dividir(t, g);
    return { t, g, ...d, ok: /^0*$/.test(d.residuo) };
  }

  /* ---------- Clase 24 · etiqueta IEEE 802.1Q ---------- */
  function tag8021q(pcp, dei, vid) {
    pcp = +pcp; dei = +dei; vid = +vid;
    if (!(pcp >= 0 && pcp <= 7 && Number.isInteger(pcp))) throw new Error('PCP va de 0 a 7 (3 bits).');
    if (!(dei === 0 || dei === 1)) throw new Error('DEI es 0 o 1 (1 bit).');
    if (!(vid >= 0 && vid <= 4095 && Number.isInteger(vid))) throw new Error('VID va de 0 a 4095 (12 bits).');
    const tci = (pcp << 13) | (dei << 12) | vid;
    const hex = tci.toString(16).toUpperCase().padStart(4, '0');
    return {
      pcp: pcp.toString(2).padStart(3, '0'), dei: String(dei), vid: vid.toString(2).padStart(12, '0'),
      tci: tci.toString(2).padStart(16, '0'), hex, bytes: ['81', '00', hex.slice(0, 2), hex.slice(2)]
    };
  }
  function leerTag(hex) {
    const h = (hex || '').replace(/[^0-9a-fA-F]/g, '');
    if (h.length !== 4 && h.length !== 8) throw new Error('Escribe el TCI (4 dígitos hex) o la etiqueta completa (8 dígitos, 8100XXXX).');
    if (h.length === 8 && h.slice(0, 4) !== '8100') throw new Error('Una etiqueta 802.1Q empieza con el TPID 0x8100.');
    const tci = parseInt(h.slice(-4), 16);
    return tag8021q(tci >> 13, (tci >> 12) & 1, tci & 0xfff);
  }

  /* ---------- Clases 21–22 · switch con tabla CAM y VLAN ---------- */
  function crearSwitch(hosts) {
    // hosts: [{mac, puerto, vlan}]
    return { cam: {}, hosts };
  }
  function enviarTrama(sw, origen, destino, opts = {}) {
    const h = sw.hosts, src = h.find(x => x.mac === origen);
    if (!src) throw new Error('Origen desconocido.');
    const vlan = src.vlan, ev = [];
    const errorFCS = !!opts.errorFCS, metodo = opts.metodo || 'sf';
    // 1. aprender (el switch usa la MAC de origen para ampliar su tabla)
    const prev = sw.cam[origen];
    sw.cam[origen] = { puerto: src.puerto, vlan };
    ev.push(prev ? `Actualiza la entrada ${origen} → puerto ${src.puerto}.` : `Aprende: ${origen} está en el puerto ${src.puerto} (VLAN ${vlan}).`);
    // 2. método de reenvío
    if (errorFCS && metodo === 'sf') {
      ev.push('Almacenamiento y envío: recibe la trama completa, el FCS no coincide → <b>descarta</b> la trama.');
      return { accion: 'descarta', puertos: [], ev };
    }
    const mismosVlan = h.filter(x => x.vlan === vlan && x.puerto !== src.puerto).map(x => x.puerto);
    let accion, puertos;
    if (destino === 'FF') {
      accion = 'difusion'; puertos = mismosVlan;
      ev.push(`Difusión (FF:FF…): sale por todos los puertos de la VLAN ${vlan} excepto el ${src.puerto} → ${puertos.join(', ') || 'ninguno'}.`);
    } else {
      const dst = h.find(x => x.mac === destino), e = sw.cam[destino];
      if (dst && dst.vlan !== vlan) {
        accion = 'otra-vlan'; puertos = [];
        if (!e) { puertos = mismosVlan; ev.push(`${destino} no está en la tabla CAM → inunda solo la VLAN ${vlan}: ${puertos.join(', ') || 'ninguno'}. ${destino} está en la VLAN ${dst.vlan}: nunca la recibe; hace falta un router.`); }
        else ev.push(`${destino} está en la VLAN ${e.vlan} y el origen en la VLAN ${vlan}: el switch no la reenvía. Entre VLAN se necesita un dispositivo de routing.`);
      } else if (e && e.vlan === vlan) {
        if (e.puerto === src.puerto) { accion = 'filtra'; puertos = []; ev.push(`${destino} está en el mismo puerto de entrada → filtra (no la reenvía).`); }
        else { accion = 'reenvia'; puertos = [e.puerto]; ev.push(`${destino} está en la tabla CAM → reenvía solo por el puerto ${e.puerto}.`); }
      } else {
        accion = 'inunda'; puertos = mismosVlan;
        ev.push(`${destino} no está en la tabla CAM → inunda (satura) todos los puertos de la VLAN ${vlan} excepto el ${src.puerto}: ${puertos.join(', ') || 'ninguno'}.`);
      }
    }
    if (errorFCS && metodo === 'ct') ev.push('Método de corte: reenvió apenas leyó la MAC de destino; la trama dañada <b>sí sale</b> y la NIC de destino la descartará.');
    return { accion, puertos, ev };
  }

  const R3 = { NOMBRE, paso, codificar, checksum, verificarChecksum, leerGenerador, aPolinomio, dividir, crc, verificarCRC, tag8021q, leerTag, crearSwitch, enviarTrama };
  if (typeof module !== 'undefined' && module.exports) module.exports = R3;
  global.R3 = R3;
  if (typeof document === 'undefined') return;

  /* =================== Render (DOM) =================== */
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Árbol: ramas hacia arriba = 0, hacia abajo = 1; sobre cada rama la salida; al final el estado */
  function arbolSVG(bits, niveles) {
    bits = soloBits(bits);
    const D = Math.max(1, niveles || bits.length);
    const full = D <= 5;
    const colW = 92, left = 34, top = 30;
    const path = bits.split('').map(Number);
    let edges = '', labels = '', hi = '', hiLab = '';
    let H, Y;
    if (full) {
      const leafH = D <= 3 ? 34 : 20; H = top + (2 ** D) * leafH + 34;
      Y = (t, i) => top + (i + 0.5) * ((2 ** D) * leafH) / (2 ** t);
    }
    const X = t => left + t * colW;
    const W = left + D * colW + 60;
    if (full) {
      // recorrer todos los nodos
      const walk = (t, i, st, onPath) => {
        if (t === D) return;
        for (const u of [0, 1]) {
          const ci = 2 * i + u, { out, next } = paso(st, u);
          const on = onPath && t < path.length && path[t] === u;
          const x1 = X(t), y1 = Y(t, i), x2 = X(t + 1), y2 = Y(t + 1, ci);
          const seg = `<path d="M${x1} ${y1} V${y2} H${x2}" class="ar-e${u ? ' one' : ''}${on ? ' on' : ''}"/>`;
          const lab = `<text x="${(x1 + x2) / 2 + 4}" y="${y2 - 5}" class="ar-l${on ? ' on' : ''}">${out}</text><text x="${x2 - 6}" y="${y2 - 5}" class="ar-s${on ? ' on' : ''}">${NOMBRE[next]}</text>`;
          if (on) { hi += seg; hiLab += lab; } else { edges += seg; labels += lab; }
          walk(t + 1, ci, next, on);
        }
      };
      walk(0, 0, '00', bits.length > 0);
    } else {
      // árbol podado: solo el camino y la rama alternativa de cada paso
      const dy = 30; let y = 0, st = '00', ys = [0];
      const pts = [];
      for (let t = 0; t < D; t++) {
        const u = path[t];
        for (const v of [0, 1]) {
          const { out, next } = paso(st, v); const yy = y + (v ? dy : -dy);
          pts.push({ t, y0: y, y1: yy, out, next, on: v === u, v });
        }
        y = y + (u ? dy : -dy); ys.push(y); st = paso(st, u).next;
      }
      const minY = Math.min(...pts.map(p => p.y1)) - 10, maxY = Math.max(...pts.map(p => p.y1));
      const off = top - minY + 10; H = maxY + off + 34;
      for (const p of pts) {
        const x1 = X(p.t), x2 = X(p.t + 1), y1 = p.y0 + off, y2 = p.y1 + off;
        const seg = `<path d="M${x1} ${y1} V${y2} H${x2}" class="ar-e${p.v ? ' one' : ''}${p.on ? ' on' : ' alt'}"/>`;
        const lab = `<text x="${(x1 + x2) / 2 + 4}" y="${y2 - 5}" class="ar-l${p.on ? ' on' : ''}">${p.out}</text><text x="${x2 - 6}" y="${y2 - 5}" class="ar-s${p.on ? ' on' : ''}">${NOMBRE[p.next]}</text>`;
        if (p.on) { hi += seg; hiLab += lab; } else { edges += seg; labels += lab; }
      }
      Y = () => off;
    }
    let times = '';
    for (let t = 1; t <= D; t++) times += `<text x="${X(t) - colW / 2}" y="${H - 10}" class="ar-t">t${t}${t <= path.length ? ' · ' + path[t - 1] : ''}</text>`;
    const y0 = full ? Y(0, 0) : Y();
    const raiz = `<circle cx="${X(0)}" cy="${y0}" r="4.5" class="ar-n"/><text x="${X(0) - 8}" y="${y0 + 4}" class="ar-s on" text-anchor="end">a</text>`;
    const guia = `<g class="ar-g"><text x="6" y="16">↑ 0 · ↓ 1</text></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="arbol" role="img" aria-label="Diagrama de árbol${bits ? ' para la entrada ' + bits : ''}">${guia}${edges}${labels}${hi}${hiLab}${raiz}${times}</svg>`;
  }

  function tablaCodificacion(bits) {
    const { filas, salida } = codificar(bits);
    let h = '<div class="tbl-wrap"><table class="bitt"><tr><th>t</th><th>Entrada u</th><th>Estado actual</th><th>Rama</th><th>Salida</th><th>Estado siguiente</th></tr>';
    filas.forEach((f, i) => {
      h += `<tr><td>t${i + 1}</td><td class="hl">${f.u}</td><td>${NOMBRE[f.st]} (${f.st})</td><td>${f.u ? '↓ abajo' : '↑ arriba'}</td><td class="k">${f.out}</td><td>${NOMBRE[f.next]} (${f.next})</td></tr>`;
    });
    h += '</table></div>';
    h += `<div class="key ok"><b>Codeword de salida</b><span class="mono">${salida}</span> <span class="muted small">(${filas.length} bits de entrada → ${filas.length * 2} de salida · camino ${['a', ...filas.map(f => NOMBRE[f.next])].join(' → ')})</span></div>`;
    return h;
  }

  function tablaChecksum(r) {
    const cells = s => s.split('').map(b => `<td>${b}</td>`).join('');
    const n = r.n;
    let h = `<div class="tbl-wrap"><table class="bitt r3-ck"><tr><th>Paso</th>${Array.from({ length: n }, (_, i) => `<th>${n - 1 - i}</th>`).join('')}<th>Nota</th></tr>`;
    r.pasos.forEach((p, i) => {
      if (i === 0) { h += `<tr><td>n1</td>${cells(p.b)}<td class="small">primera palabra</td></tr>`; return; }
      h += `<tr class="add"><td>+ n${i + 1}</td>${cells(p.b)}<td></td></tr>`;
      if (p.acarreo) {
        h += `<tr class="carry"><td>= (con acarreo)</td>${cells(p.bruto.slice(1))}<td class="small">sobra un 1 a la izquierda → se suma al final (+1)</td></tr>`;
      }
      h += `<tr class="res"><td>= suma ${i + 1 === r.pasos.length ? 'final' : 'parcial'}</td>${cells(p.res)}<td></td></tr>`;
    });
    h += `<tr class="ck"><td>Checksum (invertir)</td>${cells(r.checksum)}<td class="small">0 ↔ 1</td></tr></table></div>`;
    return h;
  }

  function tablaDivision(dividendo, g, filas, opts = {}) {
    const L = dividendo.length, r = g.length - 1;
    let h = `<div class="tbl-wrap"><table class="r3-div" aria-label="División módulo 2">`;
    h += '<tr class="dvd">' + dividendo.split('').map((b, i) => `<td class="${opts.relleno && i >= L - r ? 'pad' : ''}">${b}</td>`).join('') + '</tr>';
    for (const f of filas) {
      let row = '';
      for (let i = 0; i < L; i++) {
        const k = i - f.desde;
        if (k >= 0 && k < f.bits.length) {
          const isRem = f.tipo === 'res' && f.ultimo && i >= L - r;
          row += `<td class="${f.tipo === 'div' ? 'dv' : 'rs'}${isRem ? ' rem' : ''}">${f.bits[k]}</td>`;
        } else row += '<td></td>';
      }
      h += `<tr class="${f.tipo}">${row}</tr>`;
    }
    if (!filas.length) h += '<tr>' + dividendo.split('').map((b, i) => `<td class="rs${i >= L - r ? ' rem' : ''}">${b}</td>`).join('') + '</tr>';
    return h + '</table></div>';
  }

  function crcHTML(m, g, rx) {
    const c = crc(m, g);
    let h = `<p>G(x) = ${aPolinomio(c.g)} → divisor <b class="mono">${c.g}</b> · grado r = <b>${c.r}</b> → se anexan <b>${c.r}</b> ceros.</p>`;
    h += `<p>x<sup>${c.r}</sup>M(x) = <span class="mono">${c.m}<span class="r3-pad">${'0'.repeat(c.r)}</span></span></p>`;
    h += tablaDivision(c.ext, c.g, c.filas, { relleno: true });
    h += `<div class="key ok"><b>Resultado</b>Residuo = <span class="mono"><b>${c.residuo}</b></span> → T(x) = M + residuo = <span class="mono"><b>${c.m}<span class="r3-rem">${c.residuo}</span></b></span></div>`;
    const t = soloBits(rx) || c.T;
    const v = verificarCRC(t, c.g);
    h += `<h4>Verificación en el receptor · T(x) ÷ G(x)</h4>` + tablaDivision(v.t, v.g, v.filas);
    h += v.ok
      ? `<div class="verdict ok">Residuo ${v.residuo} → <b>sin error detectado</b>; se aceptan los datos ${v.t.slice(0, v.t.length - c.r)}.</div>`
      : `<div class="verdict bad">Residuo ${v.residuo} ≠ 0 → <b>error de transmisión</b>; la trama se descarta.</div>`;
    return h;
  }

  function checksumHTML(words, rxck) {
    const r = checksum(words);
    let h = tablaChecksum(r);
    h += `<div class="key ok"><b>Se envía</b>Las ${r.palabras.length} palabras + checksum <span class="mono"><b>${r.checksum}</b></span></div>`;
    const ck = soloBits(rxck);
    const v = verificarChecksum(r.palabras, ck || r.checksum);
    if (ck && ck.length !== r.n) return h + `<p class="errmsg">El checksum recibido debe tener ${r.n} bits.</p>`;
    h += `<h4>Receptor · suma de palabras + checksum${ck ? ' recibido' : ''}</h4>`;
    h += `<p><span class="mono">${r.suma}</span> + <span class="mono">${ck || r.checksum}</span> = <b class="mono">${v.suma}</b></p>`;
    h += v.ok ? '<div class="verdict ok">Todo 1 → <b>sin error detectado</b>.</div>' : '<div class="verdict bad">No da todo 1 → <b>error detectado</b>.</div>';
    return h;
  }

  function tagHTML(t) {
    const bit = (s, cls) => s.split('').map(b => `<span class="bit${b === '1' ? ' one' : ''}${cls ? ' ' + cls : ''}">${b}</span>`).join('');
    return `<div class="r3-tag"><div class="r3-tagrow"><span class="lbl">TPID</span><span class="mono"><b>0x8100</b></span><span class="muted small">16 bits · “esta trama lleva etiqueta 802.1Q”</span></div>
      <div class="r3-tagrow"><span class="lbl">TCI</span><div class="bits">${bit(t.pcp, 'p')}${bit(t.dei, 'dei')}${bit(t.vid)}</div></div>
      <div class="chips"><span class="chip">PCP = <b>${t.pcp}</b> (${parseInt(t.pcp, 2)})</span><span class="chip">DEI = <b>${t.dei}</b></span><span class="chip">VID = <b>${t.vid}</b> (${parseInt(t.vid, 2)})</span></div>
      <div class="key ok"><b>Etiqueta (4 bytes, hex)</b><span class="mono">${t.bytes.join(' ')}</span> → TCI = 0x${t.hex}</div></div>`;
  }

  function pintarFiguras() {
    $$('[data-arbol]').forEach(el => { el.innerHTML = arbolSVG(el.dataset.arbol, +el.dataset.niveles || 0); });
    $$('[data-arbtabla]').forEach(el => { el.innerHTML = tablaCodificacion(el.dataset.arbtabla); });
    $$('[data-ck]').forEach(el => { el.innerHTML = tablaChecksum(checksum(el.dataset.ck.split(/\s+/))); });
    $$('[data-crc]').forEach(el => {
      const [m, g, modo] = el.dataset.crc.split('|');
      if (modo === 'verif') { const v = verificarCRC(m, g); el.innerHTML = tablaDivision(v.t, v.g, v.filas); }
      else { const c = crc(m, g); el.innerHTML = tablaDivision(c.ext, c.g, c.filas, { relleno: true }); }
    });
  }

  function run(sel, fn) { const el = $(sel); if (!el) return; try { el.innerHTML = fn(); } catch (e) { el.innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; } }
  const okBits = s => /^[01\s]*$/.test(s);

  function laboratorio() {
    if (!$('#arbGo')) return;
    // Árbol
    const arb = () => {
      const v = $('#arbIn').value;
      if (!okBits(v) || !soloBits(v)) throw new Error('Escribe solo 0 y 1.');
      if (soloBits(v).length > 16) throw new Error('Usa como máximo 16 bits.');
      const b = soloBits(v);
      return tablaCodificacion(b) + `<figure>${arbolSVG(b)}<figcaption>${b.length <= 5 ? 'Árbol completo de ' + b.length + ' niveles' : 'Árbol podado (más de 5 bits): solo el camino y la rama alternativa de cada paso'}. En azul el camino de la entrada ${b}.</figcaption></figure>`;
    };
    // Checksum
    const ck = () => {
      const w = $('#ckIn').value.trim().split(/[\s,;]+/).filter(Boolean);
      if (w.some(x => !/^[01]+$/.test(x))) throw new Error('Las palabras solo pueden tener 0 y 1 (sepáralas con espacios o saltos de línea).');
      if (w.length > 12) throw new Error('Usa como máximo 12 palabras.');
      const rx = $('#ckRx').value;
      if (!okBits(rx)) throw new Error('El checksum recibido solo puede tener 0 y 1.');
      return checksumHTML(w, rx);
    };
    // CRC
    const cr = () => {
      const m = $('#crcM').value, rx = $('#crcRx').value;
      if (!okBits(m) || !okBits(rx)) throw new Error('M y la trama recibida solo pueden tener 0 y 1.');
      const g = leerGenerador($('#crcG').value);
      if (soloBits(rx) && soloBits(rx).length !== soloBits(m).length + g.length - 1) throw new Error(`La trama recibida debe tener ${soloBits(m).length + g.length - 1} bits (m + r).`);
      return crcHTML(m, g, rx);
    };
    // 802.1Q
    const tg = () => {
      const hx = $('#tagHex').value.trim();
      if (hx) return tagHTML(leerTag(hx)) + '<p class="small muted">Decodificado desde el hex escrito.</p>';
      return tagHTML(tag8021q($('#tagPcp').value, $('#tagDei').value, $('#tagVid').value));
    };
    $('#arbGo').addEventListener('click', () => run('#arbOut', arb));
    $('#ckGo').addEventListener('click', () => run('#ckOut', ck));
    $('#crcGo').addEventListener('click', () => run('#crcOut', cr));
    $('#tagGo').addEventListener('click', () => run('#tagOut', tg));
    $('#arbIn').addEventListener('keydown', e => { if (e.key === 'Enter') run('#arbOut', arb); });
    ['#crcM', '#crcG', '#crcRx'].forEach(s => $(s).addEventListener('keydown', e => { if (e.key === 'Enter') run('#crcOut', cr); }));
    ['#tagVid', '#tagHex'].forEach(s => $(s).addEventListener('keydown', e => { if (e.key === 'Enter') run('#tagOut', tg); }));
    run('#arbOut', arb); run('#ckOut', ck); run('#crcOut', cr); run('#tagOut', tg);
    simulador();
  }

  /* Simulador de switch: puertos y MAC de la diapositiva de la clase 21; VLAN de la clase 22 */
  function simulador() {
    const box = $('#swApp'); if (!box) return;
    const HOSTS = [
      { mac: 'EE', puerto: 1, vlan: 10 }, { mac: 'AA', puerto: 2, vlan: 20 }, { mac: 'BA', puerto: 3, vlan: 30 },
      { mac: 'EA', puerto: 4, vlan: 10 }, { mac: 'AC', puerto: 5, vlan: 20 }, { mac: 'AB', puerto: 6, vlan: 30 }
    ];
    const sinVlan = () => $('#swVlan').value === 'no';
    const hosts = () => HOSTS.map(x => ({ ...x, vlan: sinVlan() ? 1 : x.vlan }));
    let sw = crearSwitch(hosts()); let log = []; let ultimo = null;
    const opt = (sel, incl) => { $(sel).innerHTML = HOSTS.map(x => `<option value="${x.mac}">${x.mac} · puerto ${x.puerto}</option>`).join('') + (incl ? '<option value="FF">FF:FF:FF:FF:FF:FF · difusión</option>' : ''); };
    opt('#swSrc'); opt('#swDst', true); $('#swDst').value = 'EA'; $('#swSrc').value = 'AA';
    function pintar() {
      const hs = hosts();
      const puertos = hs.map(x => {
        const cls = ultimo ? (ultimo.src === x.puerto ? ' src' : ultimo.puertos.includes(x.puerto) ? ' out' : '') : '';
        return `<div class="r3-port${cls}" data-vlan="${x.vlan}"><b>${x.puerto}</b><span class="mono">${x.mac}</span><span class="v">VLAN ${x.vlan}</span></div>`;
      }).join('');
      const filas = Object.keys(sw.cam).sort((a, b) => sw.cam[a].puerto - sw.cam[b].puerto).map(k => `<tr><td class="mono">${k}</td><td>${sw.cam[k].puerto}</td><td>${sw.cam[k].vlan}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Vacía: el switch aún no aprende ninguna dirección.</td></tr>';
      $('#swPorts').innerHTML = puertos;
      $('#swCam').innerHTML = `<div class="tbl-wrap"><table><tr><th>MAC</th><th>Puerto</th><th>VLAN</th></tr>${filas}</table></div>`;
      $('#swLog').innerHTML = log.length ? '<ol class="r3-log">' + log.map(l => `<li>${l}</li>`).join('') + '</ol>' : '<p class="muted small">Envía una trama para ver qué decide el switch.</p>';
    }
    $('#swSend').addEventListener('click', () => {
      try {
        const s = $('#swSrc').value, d = $('#swDst').value;
        if (s === d) throw new Error('El origen y el destino deben ser distintos.');
        const r = enviarTrama(sw, s, d, { errorFCS: $('#swErr').checked, metodo: $('#swMet').value });
        ultimo = { src: HOSTS.find(x => x.mac === s).puerto, puertos: r.puertos };
        log.push(`<b>${esc(s)} → ${d === 'FF' ? 'difusión' : esc(d)}</b> · ` + r.ev.join(' '));
      } catch (e) { log.push(`<span class="errmsg">${esc(e.message)}</span>`); }
      pintar();
    });
    const reset = () => { sw = crearSwitch(hosts()); log = []; ultimo = null; pintar(); };
    $('#swReset').addEventListener('click', reset);
    $('#swVlan').addEventListener('change', reset);
    pintar();
  }

  function init() {
    try { pintarFiguras(); } catch (e) { console.error(e); }
    laboratorio();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
