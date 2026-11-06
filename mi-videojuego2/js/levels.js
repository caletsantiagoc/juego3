/**
 * CodeBot: Cyber Quest - Definición de Niveles y Misiones
 * Cada nivel enseña un concepto clave de la informática:
 * - Secuencias y algoritmos
 * - Bucles de repetición
 * - Condicionales (si / sino)
 * - Funciones y modularidad
 * - Depuración de errores (Debugging)
 */

const LEVELS_DATA = [
  // ==========================================
  // MÓDULO 1: SECUENCIAS Y ALGORITMOS
  // ==========================================
  {
    id: 1,
    module: "Fundamentos",
    title: "Primeros Pasos",
    tagline: "Secuencia lineal de instrucciones",
    dialog: "¡Bienvenido a la red central, Operador! Todo programa es una secuencia ordenada de instrucciones. Escribe <code>avanzar()</code> para llegar al portal cuántico.",
    tip: "Un computador ejecuta el código línea por línea, de arriba hacia abajo.",
    gridSize: { cols: 6, rows: 5 },
    startPos: { x: 1, y: 2, dir: 'E' },
    goalPos: { x: 4, y: 2 },
    gems: [
      { x: 3, y: 2 }
    ],
    obstacles: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }
    ],
    allowedChips: ['avanzar', 'recoger'],
    starterCode: "// Instrucciones para ByteBot\navanzar();\n",
    targetLines: 4, // 3 estrellas si usa <= 4 líneas
    targetSteps: 4
  },
  {
    id: 2,
    module: "Fundamentos",
    title: "Giro en la Matriz",
    tagline: "Navegación espacial y giros",
    dialog: "El camino hacia el nodo cuántico tiene una curva. Usa <code>girarDerecha()</code> o <code>girarIzquierda()</code> para reorientar a ByteBot.",
    tip: "Recuerda que girar cambia tu orientación pero no te mueve de casilla. ¡Necesitas avanzar después!",
    gridSize: { cols: 6, rows: 6 },
    startPos: { x: 1, y: 1, dir: 'E' },
    goalPos: { x: 4, y: 4 },
    gems: [
      { x: 3, y: 1 },
      { x: 4, y: 2 }
    ],
    obstacles: [
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
      { x: 2, y: 4 }, { x: 3, y: 4 }
    ],
    allowedChips: ['avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    starterCode: "// Avanza y gira para recolectar los datos\navanzar();\n",
    targetLines: 8,
    targetSteps: 8
  },
  {
    id: 3,
    module: "Fundamentos",
    title: "La Gran Recolección",
    tagline: "Optimización de rutas y precisión",
    dialog: "Se han dispersado 3 cristales de datos esenciales. Traza un algoritmo completo para recogerlos todos antes de entrar al portal.",
    tip: "Piensa en el orden exacto de los pasos antes de presionar EJECUTAR.",
    gridSize: { cols: 7, rows: 6 },
    startPos: { x: 1, y: 4, dir: 'N' },
    goalPos: { x: 5, y: 1 },
    gems: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 3 }
    ],
    obstacles: [
      { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 5 },
      { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 4 }
    ],
    allowedChips: ['avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    starterCode: "// Diseña la ruta completa\n",
    targetLines: 14,
    targetSteps: 14
  },

  // ==========================================
  // MÓDULO 2: BUCLES Y REPETICIÓN
  // ==========================================
  {
    id: 4,
    module: "Bucles",
    title: "El Bucle de Repetición",
    tagline: "Automatizar tareas repetitivas",
    dialog: "Escribir <code>avanzar();</code> 6 veces es aburrido y propenso a errores. ¡Usa un bucle! La sintaxis es: <code>repetir(5) { avanzar(); }</code>.",
    tip: "Los bucles son el superpoder de los programadores: permiten repetir acciones cientos de veces con solo 2 líneas.",
    gridSize: { cols: 8, rows: 5 },
    startPos: { x: 1, y: 2, dir: 'E' },
    goalPos: { x: 6, y: 2 },
    gems: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 }
    ],
    obstacles: [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
    ],
    allowedChips: ['repetir', 'avanzar', 'recoger'],
    starterCode: "// Usa un bucle repetir para recolectar y avanzar\nrepetir(5) {\n  avanzar();\n  recoger();\n}\n",
    targetLines: 5,
    targetSteps: 6
  },
  {
    id: 5,
    module: "Bucles",
    title: "Patrón Cuadrado",
    tagline: "Secuencias cíclicas en bucle",
    dialog: "¡Mira la pista! Es un circuito cerrado en forma de cuadrado. ¿Puedes identificar el patrón repetitivo y meterlo dentro de un <code>repetir(4)</code>?",
    tip: "Identifica qué bloque de 2 o 3 instrucciones se repite idéntico en cada lado del cuadrado.",
    gridSize: { cols: 7, rows: 7 },
    startPos: { x: 2, y: 2, dir: 'E' },
    goalPos: { x: 2, y: 2 },
    gems: [
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 4 }
    ],
    obstacles: [
      { x: 3, y: 3 }, { x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 5 }, { x: 1, y: 5 }
    ],
    allowedChips: ['repetir', 'avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    starterCode: "// Encuentra el patrón que se repite 4 veces\nrepetir(4) {\n  avanzar();\n  avanzar();\n  recoger();\n  girarDerecha();\n}\n",
    targetLines: 6,
    targetSteps: 12
  },
  {
    id: 6,
    module: "Bucles",
    title: "Escalera Cuántica",
    tagline: "Repetición con giros alternos",
    dialog: "Para subir este corredor en zigzag necesitas repetir un patrón: avanzar, girar, avanzar, girar... ¡Ahorra código usando bucles!",
    tip: "Menos código significa programas más limpios, rápidos y con menos errores.",
    gridSize: { cols: 7, rows: 7 },
    startPos: { x: 1, y: 5, dir: 'E' },
    goalPos: { x: 5, y: 1 },
    gems: [
      { x: 2, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 2 },
      { x: 5, y: 1 }
    ],
    obstacles: [
      { x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 1 },
      { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 3 }
    ],
    allowedChips: ['repetir', 'avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    starterCode: "// Automatiza la subida de escalones\nrepetir(4) {\n  avanzar();\n  girarIzquierda();\n  avanzar();\n  recoger();\n  girarDerecha();\n}\n",
    targetLines: 7,
    targetSteps: 16
  },

  // ==========================================
  // MÓDULO 3: CONDICIONALES (SI / SINO)
  // ==========================================
  {
    id: 7,
    module: "Condicionales",
    title: "El Sensor de Datos",
    tagline: "Tomar decisiones con 'si (hayCristal())'",
    dialog: "Algunas casillas tienen cristales y otras no. El sensor <code>hayCristal()</code> te dice si estás sobre un cristal. Úsalo con: <code>si (hayCristal()) { recoger(); }</code>.",
    tip: "Una condición evalúa si algo es VERDADERO o FALSO antes de ejecutar el bloque.",
    gridSize: { cols: 8, rows: 5 },
    startPos: { x: 1, y: 2, dir: 'E' },
    goalPos: { x: 6, y: 2 },
    gems: [
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 }
    ],
    obstacles: [],
    allowedChips: ['repetir', 'avanzar', 'si', 'hayCristal', 'recoger'],
    starterCode: "// Inspecciona cada casilla con una condición\nrepetir(5) {\n  avanzar();\n  si (hayCristal()) {\n    recoger();\n  }\n}\n",
    targetLines: 6,
    targetSteps: 8
  },
  {
    id: 8,
    module: "Condicionales",
    title: "Detector de Obstáculos",
    tagline: "Evasión autónoma con 'si/sino'",
    dialog: "Hay muros bloqueando el paso directo. Si hay un obstáculo al frente <code>si (hayObstaculo())</code>, gira a la izquierda; de lo contrario (<code>sino</code>), ¡avanza!",
    tip: "La estructura 'si / sino' (if/else) permite a los robots tomar caminos alternativos automáticamente.",
    gridSize: { cols: 7, rows: 6 },
    startPos: { x: 1, y: 4, dir: 'N' },
    goalPos: { x: 5, y: 1 },
    gems: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 5, y: 2 }
    ],
    obstacles: [
      { x: 1, y: 1 },
      { x: 3, y: 1 }
    ],
    allowedChips: ['repetir', 'avanzar', 'girarDerecha', 'girarIzquierda', 'si', 'sino', 'hayObstaculo', 'recoger'],
    starterCode: "// Crea una rutina inteligente de evasión\n",
    targetLines: 10,
    targetSteps: 12
  },
  {
    id: 9,
    module: "Condicionales",
    title: "Bucle 'mientras' Inteligente",
    tagline: "Ejecución continua hasta cumplir meta",
    dialog: "¿No sabes cuántos pasos exactos hay hasta el final? Usa <code>mientras (noEnMeta())</code> para que el robot camine hasta llegar a su destino por sí mismo.",
    tip: "Los bucles 'mientras' (while) se ejecutan mientras la condición siga siendo verdadera. ¡Cuidado con no crear bucles infinitos!",
    gridSize: { cols: 8, rows: 5 },
    startPos: { x: 1, y: 2, dir: 'E' },
    goalPos: { x: 7, y: 2 },
    gems: [
      { x: 3, y: 2 },
      { x: 5, y: 2 }
    ],
    obstacles: [],
    allowedChips: ['mientras', 'noEnMeta', 'avanzar', 'si', 'hayCristal', 'recoger'],
    starterCode: "// Avanza hasta llegar a la meta automáticamente\nmientras (noEnMeta()) {\n  avanzar();\n  si (hayCristal()) {\n    recoger();\n  }\n}\n",
    targetLines: 6,
    targetSteps: 7
  },

  // ==========================================
  // MÓDULO 4: FUNCIONES Y DEBUGGING
  // ==========================================
  {
    id: 10,
    module: "Funciones",
    title: "Creación de Subrutinas",
    tagline: "Empaquetar código reutilizable",
    dialog: "Una FUNCIÓN es como enseñarle una nueva palabra a ByteBot. Declara <code>funcion recolectarColumna()</code> para limpiar cada fila sin repetir código.",
    tip: "Las funciones permiten organizar tu programa en bloques lógicos y reutilizarlos con solo llamarlos por su nombre.",
    gridSize: { cols: 7, rows: 6 },
    startPos: { x: 1, y: 4, dir: 'N' },
    goalPos: { x: 5, y: 4 },
    gems: [
      { x: 1, y: 2 }, { x: 1, y: 1 },
      { x: 3, y: 2 }, { x: 3, y: 1 },
      { x: 5, y: 2 }, { x: 5, y: 1 }
    ],
    obstacles: [
      { x: 2, y: 2 }, { x: 4, y: 2 }
    ],
    allowedChips: ['funcion', 'repetir', 'avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    starterCode: "// Define una función personalizada\nfuncion limpiar() {\n  avanzar();\n  recoger();\n  avanzar();\n  recoger();\n}\n\nlimpiar();\n",
    targetLines: 12,
    targetSteps: 18
  },
  {
    id: 11,
    module: "Debugging",
    title: "Cazador de Glitches",
    tagline: "Encuentra y corrige errores en el código",
    dialog: "¡ALERTA DE ERROR! Un programador novato dejó un código lleno de bugs. ByteBot choca contra la pared. Inspecciona la consola, encuentra los errores y arréglalos.",
    tip: "Depurar (debug) es el arte de leer el código paso a paso para descubrir dónde difiere lo que hace de lo que esperabas que hiciera.",
    gridSize: { cols: 6, rows: 6 },
    startPos: { x: 1, y: 1, dir: 'E' },
    goalPos: { x: 4, y: 4 },
    gems: [
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 4, y: 3 }
    ],
    obstacles: [
      { x: 4, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }
    ],
    allowedChips: ['avanzar', 'girarDerecha', 'girarIzquierda', 'recoger'],
    // Buggy code intended for the player to fix!
    starterCode: "// CÓDIGO CON BUGS - Corrige el giro y los pasos:\navanzar();\navanzar();\nrecoger();\ngirarIzquierda(); // BUG 1: ¿Hacia dónde debe girar?\navanzar();\navanzar();\nrecoger();\ngirarIzquierda();\navanzar();\n",
    targetLines: 11,
    targetSteps: 10
  },
  {
    id: 12,
    module: "Maestría",
    title: "El Núcleo Cuántico",
    tagline: "Desafío Final de Programación",
    dialog: "Has llegado al Núcleo Cuántico. Combina bucles, funciones y sensores para restaurar los nodos de datos y estabilizar el sistema. ¡Demuestra que eres un maestro de la programación!",
    tip: "Planifica tu solución dividiendo el problema grande en tareas pequeñas.",
    gridSize: { cols: 8, rows: 7 },
    startPos: { x: 1, y: 5, dir: 'N' },
    goalPos: { x: 6, y: 1 },
    gems: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 2 },
      { x: 6, y: 2 }
    ],
    obstacles: [
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }
    ],
    allowedChips: ['repetir', 'mientras', 'funcion', 'si', 'sino', 'avanzar', 'girarDerecha', 'girarIzquierda', 'recoger', 'hayCristal'],
    starterCode: "// ¡Restaura el Núcleo Cuántico!\n",
    targetLines: 14,
    targetSteps: 22
  }
];

// Articles for the Programmer's Codex / Glossary
const CODEX_ARTICLES = {
  algoritmos: {
    title: "1. ¿Qué es un Algoritmo?",
    content: `
      <p>Un <strong>algoritmo</strong> es un conjunto de pasos lógicos, ordenados y finitos que resuelven un problema o cumplen un objetivo determinado.</p>
      <p>Es similar a una receta de cocina o las instrucciones para armar un mueble: si cambias el orden de los pasos, el resultado final puede fallar estrepitosamente.</p>
      <div class="codex-code-example">
// Algoritmo para lavarse los dientes:<br>
1. Tomar el cepillo.<br>
2. Poner pasta dental.<br>
3. Cepillar durante 2 minutos.<br>
4. Enjuagar con agua.
      </div>
      <p>En <strong>CodeBot</strong>, cada programa que escribes es un algoritmo para guiar al robot hasta el portal.</p>
    `
  },
  secuencias: {
    title: "2. Secuencias e Instrucciones",
    content: `
      <p>En programación, una <strong>secuencia</strong> significa que la computadora ejecuta las órdenes una detrás de otra, estrictamente en el orden en que fueron escritas (de arriba hacia abajo).</p>
      <p>Cada instrucción termina tradicionalmente con un punto y coma <code>;</code> o un salto de línea.</p>
      <div class="codex-code-example">
avanzar();      // Paso 1<br>
girarDerecha(); // Paso 2<br>
avanzar();      // Paso 3<br>
recoger();      // Paso 4
      </div>
      <p>Si intentas recoger antes de llegar a la gema, el robot intentará recoger el suelo vacío y no obtendrá el cristal.</p>
    `
  },
  bucles: {
    title: "3. Bucles (Loops o Repetición)",
    content: `
      <p>Un <strong>bucle</strong> permite ejecutar un bloque de código múltiples veces sin tener que escribirlo una y otra vez. Existen varios tipos:</p>
      <p><strong>Bucle de conteo (repetir / for):</strong> Se usa cuando sabemos exactamente cuántas veces debe repetirse una acción.</p>
      <div class="codex-code-example">
repetir(4) {<br>
&nbsp;&nbsp;avanzar();<br>
&nbsp;&nbsp;girarDerecha();<br>
}
      </div>
      <p><strong>Bucle condicional (mientras / while):</strong> Se repite mientras una condición sea verdadera, y se detiene automáticamente en cuanto deja de serlo.</p>
      <div class="codex-code-example">
mientras (noEnMeta()) {<br>
&nbsp;&nbsp;avanzar();<br>
}
      </div>
      <p><em>¡Cuidado con los bucles infinitos!</em> Si la condición nunca se vuelve falsa, el programa se quedará atrapado para siempre.</p>
    `
  },
  condicionales: {
    title: "4. Condicionales (si / sino / if / else)",
    content: `
      <p>Los <strong>condicionales</strong> permiten que un programa tome decisiones lógicas inteligentes basadas en el estado del entorno.</p>
      <div class="codex-code-example">
si (hayCristal()) {<br>
&nbsp;&nbsp;recoger();<br>
} sino {<br>
&nbsp;&nbsp;avanzar();<br>
}
      </div>
      <p>La computadora evalúa la expresión dentro de los paréntesis <code>( ... )</code>:</p>
      <ul>
        <li>Si es <strong>Verdadera (true)</strong>, ejecuta el primer bloque entre llaves.</li>
        <li>Si es <strong>Falsa (false)</strong> y existe un bloque <code>sino</code>, ejecuta el bloque alternativo.</li>
      </ul>
    `
  },
  funciones: {
    title: "5. Funciones y Modularidad",
    content: `
      <p>Una <strong>función</strong> es un bloque de código con nombre que realiza una tarea específica. Una vez definida, puedes "llamarla" tantas veces como quieras.</p>
      <p>El principio fundamental es <strong>DRY</strong> (<em>Don't Repeat Yourself</em> - No te repitas).</p>
      <div class="codex-code-example">
// Declaración de la función:<br>
funcion saltarObstaculo() {<br>
&nbsp;&nbsp;girarIzquierda();<br>
&nbsp;&nbsp;avanzar();<br>
&nbsp;&nbsp;girarDerecha();<br>
&nbsp;&nbsp;avanzar();<br>
}<br><br>
// Llamada a la función:<br>
saltarObstaculo();<br>
saltarObstaculo();
      </div>
    `
  },
  bugs: {
    title: "6. Depuración y Caza de Bugs",
    content: `
      <p>En 1947, la pionera de la computación <strong>Grace Hopper</strong> encontró una polilla atrapada en un relé de la computadora Mark II que causaba fallas. De ahí nació el término <strong>"Bug"</strong> (bicho) para referirse a un error de software, y <strong>"Debugging"</strong> (depuración) para el proceso de corregirlo.</p>
      <p>Tipos comunes de errores:</p>
      <ul>
        <li><strong>Error de Sintaxis:</strong> Escribiste mal una palabra clave o faltó una llave <code>}</code> o paréntesis <code>)</code>.</li>
        <li><strong>Error Lógico:</strong> El programa funciona sin cerrarse, pero no hace lo que querías (por ejemplo, girar al revés).</li>
        <li><strong>Error de Ejecución:</strong> Chocar contra una pared o quedarse sin combustible en un bucle infinito.</li>
      </ul>
      <p>Usa la herramienta <strong>PASO A PASO</strong> en CodeBot para observar la línea exacta que se está ejecutando en cada instante.</p>
    `
  }
};
