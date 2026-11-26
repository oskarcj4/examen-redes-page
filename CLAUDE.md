# Portal de guías de examen (UMG 2026)

Sitio **100 % estático** (HTML + CSS + JS sin build, sin dependencias, sin backend). Cada examen es una página
`<curso>/<examen>/index.html` con su guía, cuestionarios y laboratorios. El portal (`index.html`) lista los cursos
desde `js/examenes.js`. Todo corre en el navegador; el progreso y los borradores viven en `localStorage`.

- Cada curso tiene 3 exámenes: `parcial-1`, `parcial-2` y `final` (el final es el **tercer examen**). Cada guía cubre **solo el material que entrega el usuario** para ese examen; el final **no** es un repaso de todo el curso.
- Idioma: **español** (código, comentarios, textos de UI y mensajes de error). Responde al usuario en español.
- Antes de cambios estructurales (renombrar carpetas, cambiar el catálogo, tocar `main.js`/`styles.css` globales), **pregunta con una recomendación**.
- Despliegue: push a `main` → GitHub Actions sube todo el repo a S3 + CloudFront (`.github/workflows/deploy.yml`, excluye `.git*`, `.claude/*` y `*.md`).
  **No dejes archivos temporales en el repo** (se publicarían). Nunca hagas push directo a `main`: rama `feat/...` + PR. Commit/push solo si el usuario lo pide.

## Estructura (`tree /f`)

```
C:.
|   index.html                      Portal: lista de cursos y exámenes (lo pinta js/portal.js)
|   CLAUDE.md                       Este archivo
|
+---.github
|   \---workflows
|           deploy.yml              Deploy a S3 + CloudFront en cada push a main
|
+---analisis-2\parcial-2
|           index.html              Análisis de Sistemas II (ERP, MVC, componentes)   · usa js/analisis2.js
+---arquitectura-2\parcial-2
|           index.html              Arquitectura II (ensamblador 8086)                · usa asm8086.js, arqui2-datos.js, arqui2.js
+---arquitectura-2\final
|           index.html              Arquitectura II examen final (E/S, DMA, video, mouse INT 33h, Retos 1 y 2) · usa asm8086.js, arqui2-final.js, arqui2-labs.js, arqui2-cuestionario.js, arqui2-reels.js
+---redes-1\parcial-2
|           index.html              Redes I (TCP/IP, Hamming, Viterbi)                · todo en main.js
+---redes-1inal
|           index.html              Redes I examen final (árbol, checksum, CRC, switching, VLAN, 802.1Q) · usa redes3.js
+---desarrollo-web\parcial-2
|           index.html              Desarrollo Web (fetch, plantillas, caso integral) · usa web2-api.js, web2-datos.js, web2.js
|
+---css
|       styles.css                  ÚNICA hoja de estilos (tokens, componentes, una sección por guía al final)
+---img
|       logo.svg
\---js
        main.js                     Núcleo común: progreso, índice lateral, pizarra, anotaciones (lápiz). Lo cargan TODAS las guías
        portal.js                   Pinta el portal y el avance de cada tarjeta
        examenes.js                 Catálogo window.CURSOS (agregar exámenes aquí)
        comunes.js                  Componentes generales reutilizables (window.Comunes): quiz, abiertas, pistas, resaltado, store
        analisis2.js                Lógica específica de Análisis II
        asm8086.js                  Motor 8086: ensamblador, simulador, comparador de código (window.ASM). Sirve en Node
        arqui2-datos.js             Datos de Arquitectura II: banco de 21 ejercicios, trazas, quiz, abiertas (window.ARQ)
        arqui2.js                   UI de Arquitectura II: simulador paso a paso, trazas, banco, direcciones
        web2-api.js                 Servidor simulado del caso integral (modo original/corregido) + 14 pruebas. Sirve en Node
        web2-datos.js               Desarrollo Web: 8 ejercicios de fetch (con pruebas), diagnóstico, quiz, abiertas. Sirve en Node
        redes3.js                   Redes I · Examen final: árbol, checksum, CRC (división mód. 2), 802.1Q, simulador de switch (window.R3). Sirve en Node
        arqui2-final.js             Arquitectura II · Final: programas del profe explicados, decisiones de los retos, mouse, video, DMA, quiz y laboratorio (window.ARQF). Sirve en Node
        arqui2-labs.js              Arquitectura II · Final: laboratorios extra (retos propuestos con corrector por mouse guionizado) (window.ARQL). Sirve en Node
        arqui2-cuestionario.js      Arquitectura II · Final: las 79 preguntas del profe en tarjetas con repaso tipo Leitner + lista (window.ARQC). Sirve en Node
        arqui2-reels.js             Arquitectura II · Final: 12 reels animados (9:16, narración opcional, XP/racha, quiz por reel) (window.REELS). Sirve en Node
        web2.js                     UI de Desarrollo Web: laboratorio, matriz de pruebas, demo de escape, ejercicios en Worker
```

Regenera el árbol con `cmd /c "tree /f /a"` (Windows) cuando cambie la estructura.

## Convenciones de una guía (copia `arquitectura-2/parcial-2/index.html` como esqueleto)

1. `<body data-exam="<curso>/<examen>" data-store="<clave-única>-done">`: `main.js` guarda el avance en `localStorage[data-store]` y publica `progreso:<data-exam>` para el portal.
2. Cada sección es `<section id="x" class="topic" data-sec="xx">` con `.sec-head` + `<button class="mark-btn" data-mark="xx">`; el índice lateral (`nav.side a[data-sec="xx"]`) marca las repasadas. El contador del header se calcula solo.
3. Orden de scripts (al final del body): librerías propias → `../../js/main.js` → `../../js/comunes.js` → `../../js/<curso>.js`.
4. Mantén el bloque `.fab-dock` + `#board` (pizarra/anotar) copiado de otra guía: `main.js` lo necesita.
5. Registrar el examen en `js/examenes.js` (quita `proximamente`). El id debe ser igual a `data-exam` y a la carpeta.
6. Insignias: `<span class="badge ded">deducido</span>` para lo que se infirió y **no** lo dijo el profesor. Sé honesto con esto.
7. Estilos nuevos de una guía: al final de `css/styles.css` bajo `/* ===== Guía <Curso> ===== */`. Usa los tokens (`--accent`, `--ok`, `--err`, `--surface`, `--text-2`…); nunca colores sueltos: hay modo claro/oscuro y impresión.
8. Móvil: probar a 390 px sin scroll horizontal; tablas dentro de `.tbl-wrap`; barras sticky compactas.
9. Datos externos (API, usuario) **siempre** con `esc()` / `textContent`, nunca `innerHTML` directo.

## Componentes

### HTML + CSS (sin JS)
| Componente | Markup |
|---|---|
| Tarjeta en rejilla | `<div class="grid g2|g3"><div class="card tile"><span class="tag">ETIQUETA</span><h4>…</h4><p class="small">…</p></div></div>` |
| Nota destacada | `<div class="key [warn|ok]"><b>Título</b><p>…</p></div>` |
| Pregunta desplegable | `<details class="qa"><summary><span class="qn">Q1</span>Pregunta</summary><div class="ans">…</div></details>` |
| Tabla | `<div class="tbl-wrap"><table>…</table></div>` |
| Código | `<div class="codebox"><div class="file">archivo.php</div><pre class="code" data-lang="php">…</pre></div>` (lo resalta `comunes.js`; `asm` lo resalta `arqui2.js`) |
| Figura SVG | `<figure><svg class="dg wide" viewBox=…>` con nodos `nd nd-m nd-c nd-v nd-x nd-db`, flechas `ar acc`, texto `c b mono sm xs mut` + `<figcaption>` |
| Fórmula / chips / nivel | `.formula` · `.chips > .chip` · `.lvl.l1…l5` · `.badge` |
| Veredicto / medidores / diff | `.verdict.ok|warn|bad` · `.meters > .meter` · `.diff > .dl.eq|miss|extra` |

### JavaScript (`window.Comunes`, archivo `js/comunes.js`)
- `Comunes.store.get/set(k, v)` · `Comunes.esc(s)` · `Comunes.$`, `$$`.
- `Comunes.quiz('#quizApp', [[categoria, pregunta, [opciones], indiceCorrecto, explicacion], …])`: pestañas por categoría, corrección al clic.
- `Comunes.abiertas('#abiertasApp', [{q, a, puntos:[…]}], 'clave-ls')`: textarea que se guarda + respuesta modelo + checklist.
- `Comunes.pistas(contenedor, ['p1','p2','p3'])`: botón "💡 Pista n/3".
- `Comunes.resaltar(src)` / `resaltarPagina()` / `codeBox(src, titulo)`.
- Abre `<details>` al navegar a un ancla interna (automático).

### Específicos de Arquitectura II (no generalizados aún)
`ASM.assemble/Machine/runProgram/compare` (motor + comparador), `Emu` (simulador paso a paso con `data-emu`), tabla del profe (`[data-profe]`), banco de ejercicios con plantilla por bloques `{{B1}}`.

## Cómo probar sin servidor
- Lógica pura (motor, datos): scripts de Node que hacen `require('./js/xxx.js')` (los módulos exportan con `module.exports` además de `window.X`). Ver el patrón de `test-banco.js` (21 ejercicios × comparador).
- Visual / interacción: Chrome headless por CDP (`--headless=new --remote-debugging-port`), abriendo `file:///…/index.html`; capturar con `Page.captureScreenshot`; comprobar móvil con `Emulation.setDeviceMetricsOverride(390×844, mobile)`; emular `prefers-reduced-motion: reduce` porque la página usa `scroll-behavior: smooth`.
- Los archivos temporales van a `$CLAUDE_JOB_DIR/tmp` o al scratchpad, **nunca** dentro del repo.
- Si el sistema detiene el servidor local por memoria, no lo reinicies solo; usa `file://`.

## Desarrollo Web · Parcial II (implementada)
Fuentes: 12 PPTX del Ing. Leonel Domínguez (convertidos con `markitdown`, **obligatorio** para no gastar tokens) y el repo
`donaldosorio/Examen-Desarrollo-Web` (un laboratorio PHP+MySQL "caso-integral" con 8 pistas y README con entregables).
Foco pedido: **consumir APIs (fetch) y plantillas**; práctico.
- Servidor simulado en el navegador (`js/web2-api.js`, sin red): mismas reglas que el PHP del profe en modo *original* y modo *corregido*; contraseñas de prueba inventadas (el SQL del profe no trae texto plano).
- Laboratorio de peticiones + matriz de 14 pruebas manuales (pista 8), 8 ejercicios de `fetch` corregidos por comportamiento (Worker con timeout), demo de plantilla → HTML con/sin escape, diagnóstico de 14 hallazgos, quiz, abiertas y repaso de las clases 1–8.
- Hechos verificados del repo del profe: `recurso.php` **no lee** `rol`/`acceso` de la URL (el fallo real es que todo cliente ve cualquier recurso publicado y visible); `cambiar_password.php` no exige sesión (con `user_id` ajeno y la contraseña de esa cuenta funciona sin iniciar sesión).

## Arquitectura II · Examen final (implementada)
Fuentes: presentación Interfaz de E/S (cap. 11), documento de DMA de la Inga. Vallejo, presentación Video en el computador (cap. 13), práctica Uso del mouse (usomouse.asm, modografico.asm) y los Retos 1 y 2 (INT 33h). Los .md/.asm vienen en cp1252: leer con `TextDecoder('windows-1252')`.
- `js/asm8086.js` ahora simula **INT 33h** (0000h-0003h, mouse con estado vivo o `mouseScript`), **INT 10h** AX=0013h/AH=0Ch (píxeles en `m.gfx`), INT 15h/86h y `proc` como etiqueta (`end main`). El banco del parcial 2 sigue pasando (21 ejercicios, 56 pruebas).
- El laboratorio ejecuta los programas reales con un mouse simulado. **Deducido** (marcado en la guía): en modo texto las coordenadas son píxeles virtuales 640x200 en múltiplos de 8, así que la zona del Reto 2 (CX <= 40, DX <= 10) cubre columnas 0-5 y filas 0-1; los códigos binarios del registro de modo del 8237 y el orden del ciclo DMA (las figuras del documento son imágenes).
- Errores del material señalados en la guía: 4K "el doble" que Full HD (son cuatro veces) y HDMI "inalámbrico".
