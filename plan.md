# Plan de desarrollo — Versión Web

Proyecto CHESS · Grupo 6 (DAM) · React + JavaScript · Guía detallada por tareas

## Cómo usar este documento

Este plan reparte el proyecto en **5 fases** (sprints de 1 semana). En cada fase, los tres miembros programan, diseñan, prueban y documentan. Cada persona se encarga de una **funcionalidad completa**: su lógica en JavaScript, su interfaz en React, sus tests y su documentación.

Cada tarea está explicada con el mismo formato:

- **¿Para qué sirve?** Qué problema resuelve y por qué hace falta.
- **Pasos:** qué hacer, en orden, con comandos y código de ejemplo cuando ayuda.
- **Está terminada cuando…:** lista de comprobación. Si no se cumple todo, la tarea no está terminada.

> **Importante:** el código de ejemplo es una **guía para empezar**, no la solución final. Léelo, entiéndelo y adáptalo. Si algo no se entiende, pregunta en el daily: atascarse en silencio es lo que más retrasa un proyecto.

### Normas del equipo

- **Scrum Master rotatorio:** cada sprint lo lleva una persona distinta. Organiza la planning (lunes), el daily (15 min diarios), la review y la retro (viernes), y mantiene el tablero al día.
- **Code review cruzada:** ninguna Pull Request se fusiona sin la aprobación de otra persona. Aarón revisa a Adri, Adri revisa a MªJosé y MªJosé revisa a Aarón.
- **Cada uno prueba lo suyo:** todo código nuevo lleva sus tests.
- **Cada uno documenta lo suyo:** cada funcionalidad se explica en la carpeta `docs/`.
- **Nunca se trabaja en main ni en develop directamente.** Siempre en una rama `feature/...`.

### Definition of Done (aplica a TODAS las tareas)

Además de su lista propia, toda tarea debe cumplir esto antes de darse por terminada:

- [ ] El código está en una rama `feature/...` y se ha abierto una Pull Request hacia develop.
- [ ] `npm run lint` no da errores y `npm test` pasa en verde.
- [ ] Hay tests para la lógica nueva.
- [ ] Otra persona ha revisado y aprobado la PR.
- [ ] La issue del tablero está en la columna *Done*.
- [ ] Si cambia algo del diseño o la arquitectura, la documentación está actualizada.

## Stack y arquitectura

| Herramienta | Para qué la usamos |
|---|---|
| **Vite** | Crea y arranca el proyecto React. Es el «motor» que compila y sirve la app en local. |
| **React 18 + JavaScript** | Librería para construir la interfaz con componentes. Sin TypeScript para no añadir complejidad. |
| **CSS Modules** | Estilos por componente (archivo `Board.module.css`). Así los estilos de un componente no rompen los de otro. |
| **useReducer + Context** | Guardar el estado de la partida en un solo sitio y que cualquier componente pueda leerlo. |
| **localStorage + JSON** | Guardar el progreso del jugador en el navegador. Sustituye a PlayerPrefs de Unity. |
| **Web Worker** | Ejecutar la IA en segundo plano para que la pantalla no se congele mientras piensa. |
| **Vitest + Testing Library** | Escribir y ejecutar tests automáticos de la lógica y de los componentes. |
| **GitHub + GitHub Actions** | Control de versiones, Pull Requests y ejecución automática de los tests (CI). |
| **Vercel** | Publicar la web en Internet gratis. Se actualiza solo cada vez que se fusiona en main. |

### Estructura de carpetas

Seguimos el MVC del Entregable 3. La regla de oro: **la carpeta engine/ no importa nada de React**. Es JavaScript puro, así se puede probar fácilmente y la IA puede usarla dentro del Worker.

```
src/
├── engine/            # MODELO — lógica del juego, JS puro, sin React
│   ├── index.js       # el «contrato»: las funciones que usa la UI
│   ├── board.js       # el tablero
│   ├── pieces/        # una pieza por archivo
│   ├── rules.js       # movimientos legales, jaque, jaque mate
│   ├── objectives.js  # objetivos de cada nivel
│   ├── obstacles.js   # obstáculos aleatorios
│   ├── levels.json    # definición de los niveles
│   └── ai/            # minimax.js, evaluate.js, ai.worker.js
├── state/             # CONTROLADOR — GameContext + reducer (sustituye a GameManager)
├── components/        # VISTA — piezas reutilizables: Board, Square, HUD, Modal...
├── pages/             # VISTA — pantallas completas: Menu, LevelSelect, Game, Settings
├── services/          # storage.js (guardar/cargar progreso)
└── styles/            # variables.css (colores, tipografía, tamaños)
docs/                  # documentación de cada funcionalidad
```

## Rutina diaria con Git (para todos)

Sigue estos pasos **cada vez** que empieces una tarea nueva. Sustituye `nombre-tarea` por algo corto y descriptivo, por ejemplo `feature/board-component`.

```bash
# 1. Ponerte al día con lo último de develop
git checkout develop
git pull

# 2. Crear tu rama para la tarea
git checkout -b feature/nombre-tarea

# 3. Trabajar... y guardar cambios a menudo (commits pequeños)
git add .
git commit -m "feat(board): añade función getPiece"

# 4. Subir tu rama a GitHub
git push -u origin feature/nombre-tarea

# 5. En GitHub: botón "Compare & pull request" → base: develop
#    Pon un título claro, describe qué has hecho y asigna a tu revisor.
```

### Formato de los mensajes de commit

- `feat(zona): ...` → funcionalidad nueva. Ej.: `feat(ia): añade poda alfa-beta`
- `fix(zona): ...` → corrección de un bug. Ej.: `fix(rules): el rey no podía enrocar`
- `test(zona): ...` → solo tests. `docs: ...` → solo documentación. `style: ...` → solo CSS/formato.

### Cómo revisar la PR de un compañero

1. Abre la PR en GitHub y lee la descripción: ¿qué se supone que hace?
2. Comprueba que el check de la CI está en verde.
3. Descarga la rama y pruébala: `git fetch` → `git checkout feature/su-rama` → `npm run dev`.
4. En la pestaña *Files changed*, deja comentarios en las líneas que no entiendas o que creas mejorables. Sé amable y concreto.
5. Si todo está bien: *Review changes → Approve*. Si hay que cambiar algo: *Request changes*.

### Si hay un conflicto al fusionar

Pasa cuando dos personas tocan las mismas líneas. No es grave:

```bash
git checkout develop && git pull
git checkout feature/tu-rama
git merge develop          # Git marcará los archivos con conflicto
# Abre esos archivos en VS Code: verás <<<<<<< ======= >>>>>>>
# Elige qué código se queda ("Accept Current / Incoming / Both"), guarda y:
git add . && git commit -m "merge: resuelve conflicto con develop"
git push
```

> Si no estás seguro de cómo resolverlo, pide ayuda a la persona que escribió el otro código.

## Cómo se escribe un test (ejemplo)

Un test es una función que comprueba automáticamente que tu código hace lo que debe. Los archivos de test se llaman igual que el archivo que prueban, terminados en `.test.js` y se guardan al lado. Se ejecutan con `npm test`.

```js
// src/engine/board.test.js
import { describe, it, expect } from 'vitest';
import { createBoard, setPiece, getPiece } from './board';

describe('board', () => {
  it('crea un tablero vacío de 8x8', () => {
    const board = createBoard(8, 8);
    expect(getPiece(board, { x: 0, y: 0 })).toBe(null);
  });

  it('setPiece NO modifica el tablero original', () => {
    const board = createBoard(8, 8);
    const rey = { type: 'king', color: 'white' };
    const nuevo = setPiece(board, { x: 4, y: 0 }, rey);
    expect(getPiece(nuevo, { x: 4, y: 0 })).toEqual(rey);
    expect(getPiece(board, { x: 4, y: 0 })).toBe(null); // el original sigue vacío
  });
});
```

La estructura siempre es la misma: **preparar** los datos, **ejecutar** la función y **comprobar** el resultado con `expect`. Piensa también en los casos raros: casillas fuera del tablero, tablero vacío, sin movimientos posibles…

## Resumen del reparto

| Fase | Scrum Master | Aarón | Adri | MªJosé |
|---|---|---|---|---|
| 0 · Setup (sem. 1) | Aarón | Infraestructura | Contrato y estado | Diseño y navegación |
| 1 · Núcleo (sem. 2–3) | Adri | Tablero | Reglas clásicas | Piezas nuevas |
| 2 · IA (sem. 4–5) | MªJosé | Objetivos y fin de partida | Algoritmo de IA | Integración de la IA |
| 3 · Niveles (sem. 6–7) | Aarón | Persistencia y ajustes | Obstáculos | Niveles y menú |
| 4 · Entrega (sem. 8) | Adri | Rendimiento y bugs | UX y accesibilidad | QA y despliegue |

| Área | Aarón | Adri | MªJosé |
|---|---|---|---|
| **Motor / lógica de juego** | ✔ | ✔ | ✔ |
| **Inteligencia artificial** | Optimiza (F4) | Algoritmo (F2) | Worker y dificultad (F2) |
| **Componentes React / UI** | ✔ | ✔ | ✔ |
| **Diseño UX/UI** | HUD, modales, ajustes | Resaltado, accesibilidad | Sistema de diseño, menú |
| **Tests** | ✔ | ✔ | ✔ |
| **Documentación** | ✔ | ✔ | ✔ |
| **Code review de…** | Adri | MªJosé | Aarón |

---

# Fase 0 — Setup y migración (semana 1)

**Scrum Master:** Aarón. **Objetivo:** dejar el proyecto preparado para que los tres puedan programar en paralelo desde el lunes de la semana 2.

## Aarón — Infraestructura

### Tarea 0.A1 · Crear el repositorio y las ramas

**¿Para qué sirve?**
El repositorio es el sitio donde vive todo el código del equipo. Las ramas permiten que cada uno trabaje sin pisar el trabajo de los demás. Protegemos main y develop para que nadie pueda subir código sin revisión.

**Pasos**

1. En GitHub: *New repository* → nombre `chess-web`, marca *Add README* y elige el *.gitignore* de **Node**.
2. Clona el repo en tu ordenador: `git clone https://github.com/USUARIO/chess-web.git`.
3. Crea la rama develop y súbela: `git checkout -b develop` → `git push -u origin develop`.
4. En GitHub: *Settings → Branches → Add rule* para **main** y otra para **develop**. Marca *Require a pull request before merging* con 1 aprobación y *Require status checks to pass*.
5. En *Settings → Collaborators*, invita a Adri y a MªJosé.
6. En *Settings → General*, pon develop como rama por defecto.

**Está terminada cuando…**

- [ ] Adri y MªJosé pueden clonar el repo.
- [ ] Hacer `git push` directo a main o develop da error.
- [ ] develop es la rama por defecto.

### Tarea 0.A2 · Crear el proyecto con Vite y las herramientas

**¿Para qué sirve?**
Vite genera la estructura base de una app React. Además añadimos Vitest (tests) y Prettier (formatea el código igual para todos, para que no haya cambios de espacios o comillas en las PRs).

**Pasos**

1. Dentro de la carpeta del repo, en la rama `feature/setup`: `npm create vite@latest . -- --template react`.
2. Instala dependencias y comprueba que arranca: `npm install` → `npm run dev` → abre http://localhost:5173.
3. Instala las herramientas de test: `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom`.
4. Instala Prettier: `npm i -D prettier` y crea el archivo `.prettierrc` (abajo).
5. Edita `vite.config.js` y `package.json` como en el ejemplo.
6. Crea las carpetas vacías de la arquitectura (engine, state, components, pages, services, styles, docs) con un archivo `.gitkeep` dentro de cada una.
7. Escribe un test tonto (`expect(1 + 1).toBe(2)`) para comprobar que `npm test` funciona.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
});

// package.json  →  dentro de "scripts" añade:
"test": "vitest",
"format": "prettier --write src"

// .prettierrc
{ "singleQuote": true, "semi": true, "printWidth": 100 }
```

> **Consejo:** Haz commit justo después de que `npm run dev` funcione por primera vez. Si luego rompes algo, podrás volver atrás.

**Está terminada cuando…**

- [ ] `npm run dev` abre la app.
- [ ] `npm test` ejecuta el test de ejemplo en verde.
- [ ] Las carpetas de la arquitectura existen en el repo.

### Tarea 0.A3 · Configurar la integración continua (CI)

**¿Para qué sirve?**
La CI es un robot de GitHub que, cada vez que alguien abre una PR, instala el proyecto, ejecuta los tests y el linter. Si algo falla, la PR se marca en rojo y no se puede fusionar. Así nadie rompe develop sin darse cuenta.

**Pasos**

1. Crea el archivo `.github/workflows/ci.yml` con el contenido de abajo.
2. Súbelo en una PR y comprueba en la pestaña *Actions* de GitHub que se ejecuta.
3. Vuelve a *Settings → Branches* y en las reglas de main y develop selecciona el check **test** como obligatorio.

```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npx vitest run
```

**Está terminada cuando…**

- [ ] Al abrir una PR aparece el check de la CI.
- [ ] Si un test falla a propósito, la PR queda en rojo y no deja fusionar.

### Tarea 0.A4 · Montar el tablero Scrum

**¿Para qué sirve?**
El tablero es donde se ve qué está haciendo cada uno y qué falta. Cada tarea de este documento será una *issue* (tarjeta).

**Pasos**

1. En el repo: pestaña *Projects → New project → Board*.
2. Crea las columnas: **Backlog**, **To do** (sprint actual), **In progress**, **In review**, **Done**.
3. Crea las etiquetas: `motor`, `ui`, `ia`, `test`, `docs`, `bug`.
4. Crea una issue por cada tarea de este documento (por ejemplo «0.A4 Montar el tablero Scrum»), con su etiqueta, su responsable y la lista «Está terminada cuando…» copiada en la descripción.
5. Mueve las tareas de la Fase 0 a **To do** y el resto a **Backlog**.

> **Consejo:** Escribe en la PR `Closes #12` (el número de la issue) y GitHub cerrará la issue automáticamente al fusionar.

**Está terminada cuando…**

- [ ] Todas las tareas del plan existen como issues con responsable.
- [ ] Los tres miembros pueden ver y mover tarjetas.

### Tarea 0.A5 · Documentación: despliegue y cambio a web

**¿Para qué sirve?**
El tutor necesita saber por qué cambiamos de Unity a web y cómo se despliega ahora la aplicación.

**Pasos**

1. Crea `docs/despliegue.md`.
2. Haz un diagrama de despliegue en draw.io (app.diagrams.net) con: navegador del usuario → Vercel (hosting) ← GitHub (código) y el localStorage dentro del navegador. Expórtalo a PNG y guárdalo en `docs/img/`.
3. Escribe la justificación del cambio (media página): accesible desde cualquier dispositivo sin instalar nada, el equipo domina más React/JS, despliegue gratis y automático, más fácil de probar.
4. Actualiza la tabla de herramientas del Entregable 3 (Unity → Vite/React, C# → JavaScript, PlayerPrefs → localStorage).

**Está terminada cuando…**

- [ ] El diagrama está en el repo y se entiende sin explicaciones.
- [ ] La justificación está escrita y revisada por otro miembro.

## Adri — Contrato y estado

### Tarea 0.B1 · Escribir el contrato del motor (engine/index.js)

**¿Para qué sirve?**
El «contrato» es la lista de funciones que la interfaz puede pedirle al motor. Si lo acordamos al principio, MªJosé y Aarón pueden programar la UI usando funciones de mentira (*mocks*) mientras el motor de verdad se termina. Cuando esté listo, solo cambia lo de dentro, no cómo se llama.

**Pasos**

1. Reúnete 30 minutos con Aarón y MªJosé para repasar las funciones y lo que devuelven.
2. Crea `src/engine/index.js` con las 5 funciones del ejemplo. De momento devuelven datos falsos pero con la forma correcta.
3. Encima de cada función, escribe un comentario JSDoc explicando qué recibe y qué devuelve.
4. Escribe un test que llame a cada función y compruebe que no da error.

```js
/**
 * Crea una partida nueva a partir de un nivel.
 * @param {string} levelId  Ej.: 'easy-1'
 * @returns {GameState}      Ver docs/estado.md
 */
export function createGame(levelId) {
  return MOCK_STATE; // TODO: implementar en Fase 1
}

/** @returns {{x:number, y:number}[]} casillas a las que puede ir la pieza */
export function getLegalMoves(state, from) { return [{ x: from.x, y: from.y + 1 }]; }

/** Devuelve un estado NUEVO (no modifica el que recibe). */
export function applyMove(state, move) { return { ...state, turn: 'black' }; }

/** @returns {'playing'|'won'|'lost'} */
export function checkStatus(state) { return 'playing'; }

/** @returns {Promise<{from, to}>} jugada de la IA */
export async function getAIMove(state, difficulty) { /* mock */ }
```

**Está terminada cuando…**

- [ ] Las 5 funciones existen, están comentadas y devuelven datos con la forma acordada.
- [ ] Los tres miembros están de acuerdo con el contrato.

### Tarea 0.B2 · Definir la forma del estado de la partida

**¿Para qué sirve?**
El «estado» es un objeto que contiene TODO lo que hace falta para saber cómo va la partida en un momento dado. Si todos sabemos qué forma tiene, nadie se inventa nombres distintos para lo mismo.

**Pasos**

1. Escribe en `docs/estado.md` el objeto de ejemplo de abajo, explicando cada campo con una frase.
2. Crea `src/engine/mockState.js` con ese objeto para que los demás lo usen en sus pruebas.
3. Comparte el documento en el grupo y ajusta lo que propongan.

```js
const GameState = {
  levelId: 'easy-1',
  board: [[null, ...], ...],            // matriz [y][x]; cada casilla: null o pieza
  // pieza: { id: 'w-king', type: 'king', color: 'white' }
  obstacles: [{ x: 3, y: 4 }],          // casillas bloqueadas
  turn: 'white',                        // a quién le toca: 'white' (jugador) o 'black' (IA)
  objective: { type: 'reachSquare', target: { x: 4, y: 7 } },
  moveCount: 0,
  history: [],                          // jugadas hechas: [{ from, to }]
  status: 'playing',                    // 'playing' | 'won' | 'lost'
};
```

**Está terminada cuando…**

- [ ] docs/estado.md explica cada campo.
- [ ] mockState.js existe y se usa en el contrato.

### Tarea 0.B3 · Crear GameContext y el reducer

**¿Para qué sirve?**
En React, cada componente tiene su propio estado. Pero el estado de la partida lo necesitan muchos (tablero, HUD, modales…). Un **Context** lo pone a disposición de todos, y un **reducer** es la única función que puede cambiarlo, a partir de «acciones» (por ejemplo `{ type: 'MOVE', move }`). Esto sustituye al GameManager de Unity.

**Pasos**

1. Crea `src/state/gameReducer.js` con el reducer del ejemplo. Por ahora solo con las acciones START, SELECT y MOVE.
2. Crea `src/state/GameContext.jsx` con el Provider y el hook `useGame()`.
3. En `main.jsx`, envuelve la app con `<GameProvider>`.
4. Haz un componente de prueba que muestre `state.turn` y un botón que despache una acción, para comprobar que funciona.
5. Escribe tests del reducer: dado un estado y una acción, comprueba el estado resultante.

```js
// src/state/gameReducer.js
import { createGame, applyMove, getLegalMoves } from '../engine';

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START':  return { ...createGame(action.levelId), selected: null, highlights: [] };
    case 'SELECT': return { ...state, selected: action.square,
                            highlights: getLegalMoves(state, action.square) };
    case 'MOVE':   return { ...applyMove(state, action.move), selected: null, highlights: [] };
    default:       return state;
  }
}

// src/state/GameContext.jsx
import { createContext, useContext, useReducer } from 'react';
import { gameReducer } from './gameReducer';
const GameContext = createContext(null);
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}
export const useGame = () => useContext(GameContext);
```

> **Consejo:** Regla del reducer: **nunca** modifiques `state` directamente (`state.turn = 'black'` está prohibido). Devuelve siempre un objeto nuevo con `{ ...state, campo: valor }`.

**Está terminada cuando…**

- [ ] Cualquier componente puede leer el estado con `const { state, dispatch } = useGame()`.
- [ ] Los tests del reducer pasan.

### Tarea 0.B4 · Adaptar el JSON de niveles

**¿Para qué sirve?**
En el Entregable 3 definimos una estructura JSON para los niveles. La reutilizamos en `levels.json` para que el juego cargue los niveles desde datos, sin tocar código.

**Pasos**

1. Copia la estructura del Entregable 3 en `src/engine/levels.json`.
2. Adáptala para que encaje con el estado definido en 0.B2 (mismos nombres de campos).
3. Crea 1 nivel de ejemplo completo (el resto lo hará MªJosé en la Fase 3).
4. Documenta cada campo en `docs/niveles.md`.

```json
[
  {
    "id": "easy-1",
    "name": "Primer paso",
    "difficulty": "easy",
    "size": { "width": 8, "height": 8 },
    "objective": { "type": "reachSquare", "target": { "x": 4, "y": 7 } },
    "pieces": [
      { "type": "king",  "color": "white", "x": 4, "y": 0 },
      { "type": "rook",  "color": "black", "x": 0, "y": 5 }
    ],
    "obstacles": { "count": 3 },
    "maxMoves": 20
  }
]
```

**Está terminada cuando…**

- [ ] levels.json tiene 1 nivel válido y se puede importar en JS.
- [ ] La estructura está documentada.

### Tarea 0.B5 · Documentación: diagrama de componentes

**¿Para qué sirve?**
El diagrama de componentes del Entregable 3 era de Unity. Hay que rehacerlo para la versión web.

**Pasos**

1. En draw.io, dibuja 3 bloques grandes: **Vista** (pages + components), **Controlador** (GameContext + reducer) y **Modelo** (engine).
2. Dentro de cada bloque, pon los archivos principales.
3. Dibuja flechas: Vista → dispatch → Controlador → llama a → Modelo. Y un bloque aparte para el Web Worker de la IA y otro para storage.
4. Guárdalo en `docs/img/componentes.png` y explícalo en `docs/arquitectura.md`.

**Está terminada cuando…**

- [ ] El diagrama refleja la estructura de carpetas real.

## MªJosé — Diseño y navegación

### Tarea 0.C1 · Adaptar los mockups a web

**¿Para qué sirve?**
Los mockups del Entregable 4 eran para móvil Android. Ahora la app se usará en ordenador y en móvil, así que cada pantalla necesita las dos versiones.

**Pasos**

1. En Figma, duplica los mockups existentes.
2. Crea dos marcos por pantalla: **Desktop** (1440 × 900) y **Móvil** (390 × 844).
3. Pantallas: Menú principal, Selección de nivel, Partida, Modal de victoria/derrota, Ajustes.
4. En desktop aprovecha el espacio: tablero a la izquierda y HUD a la derecha. En móvil: HUD arriba, tablero debajo.
5. Comparte el enlace de Figma con el equipo y pide comentarios antes del miércoles.

**Está terminada cuando…**

- [ ] Las 5 pantallas existen en desktop y móvil.
- [ ] El equipo ha dado el visto bueno.

### Tarea 0.C2 · Crear el sistema de diseño

**¿Para qué sirve?**
Un sistema de diseño son las «reglas visuales» del proyecto: colores, tipografías, tamaños y espaciados. Si están en variables CSS, todos usan los mismos valores y cambiar un color es cambiar una sola línea.

**Pasos**

1. Saca de los mockups la paleta de colores (fondo, texto, primario, casilla clara, casilla oscura, resaltado, peligro).
2. Elige 1–2 tipografías de Google Fonts.
3. Crea `src/styles/variables.css` como en el ejemplo e impórtalo en `main.jsx`.
4. Documenta la paleta con capturas en `docs/diseno.md`.
5. Comprueba el contraste del texto con el fondo en webaim.org/resources/contrastchecker (debe ser al menos 4.5:1).

```css
/* src/styles/variables.css */
:root {
  --color-bg: #1e1f26;
  --color-text: #f1f1f1;
  --color-primary: #4f7cff;
  --square-light: #eeeed2;
  --square-dark: #769656;
  --square-highlight: rgba(255, 215, 0, 0.55);
  --color-danger: #e5484d;

  --font-main: 'Inter', sans-serif;
  --radius: 8px;
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;  --space-4: 24px;
  --square-size: min(10vw, 10vh, 72px);
}
/* Uso en cualquier CSS:  background: var(--square-dark); */
```

**Está terminada cuando…**

- [ ] variables.css existe y se usa en lugar de colores escritos a mano.
- [ ] Todos los textos cumplen el contraste mínimo.

### Tarea 0.C3 · Configurar la navegación (React Router)

**¿Para qué sirve?**
En una web, cada pantalla tiene una dirección (URL). React Router se encarga de mostrar la página correcta según la URL, sin recargar la web.

**Pasos**

1. Instala la librería: `npm i react-router-dom`.
2. Crea en `src/pages/` un archivo por pantalla: `Menu.jsx`, `LevelSelect.jsx`, `Game.jsx`, `Settings.jsx`. De momento solo con un título.
3. Configura las rutas en `App.jsx` como en el ejemplo.
4. En Menu, añade enlaces con `<Link to="/levels">` para comprobar que se navega bien.

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/Menu';
import LevelSelect from './pages/LevelSelect';
import Game from './pages/Game';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/play/:levelId" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Está terminada cuando…**

- [ ] Se puede navegar entre todas las pantallas sin que la página se recargue.
- [ ] Una URL desconocida redirige al menú.

### Tarea 0.C4 · Documentación: diagrama de navegación

**¿Para qué sirve?**
Muestra cómo se pasa de una pantalla a otra. Lo pide la asignatura y ayuda a no olvidar ningún botón de «volver».

**Pasos**

1. En draw.io, dibuja un cuadro por pantalla y una flecha por cada botón que lleva a otra pantalla, con el texto del botón en la flecha.
2. Incluye los modales (victoria/derrota) y a dónde llevan sus botones.
3. Guárdalo en `docs/img/navegacion.png`.

**Está terminada cuando…**

- [ ] Todas las pantallas y botones aparecen en el diagrama.
- [ ] Coincide con las rutas de App.jsx.

> **Hito de la Fase 0:** el proyecto arranca, la CI funciona, existe el contrato del motor, el estado global y la navegación entre pantallas vacías.

---

# Fase 1 — Núcleo jugable (semanas 2–3)

**Scrum Master:** Adri. **Objetivo:** poder mover piezas en el tablero respetando las reglas (aún sin IA: se mueven las piezas de los dos colores a mano).

> **Orden importante:** Aarón debe tener un Board mínimo (aunque sea feo) el **martes de la semana 2**, porque Adri y MªJosé lo necesitan para ver sus piezas.

## Aarón — Tablero

### Tarea 1.A1 · Lógica del tablero (board.js)

**¿Para qué sirve?**
El tablero es la base de todo: las reglas, la IA y la interfaz lo usan. Hay que poder crear un tablero, consultar qué hay en una casilla y poner o quitar piezas.

**Pasos**

1. Crea `src/engine/board.js`.
2. Representa el tablero como una matriz: `board[y][x]`. Cada casilla es `null` (vacía) o un objeto pieza.
3. Implementa: `createBoard(w, h)`, `getPiece(board, pos)`, `setPiece(board, pos, piece)`, `movePiece(board, from, to)`, `isInside(board, pos)`, `findPiece(board, predicado)`.
4. **Muy importante:** las funciones que cambian el tablero devuelven un tablero **nuevo** y no tocan el original (inmutabilidad). La IA prueba miles de jugadas y si el tablero se modificara, se rompería todo.
5. Escribe un test para cada función (ver el ejemplo de la página de tests).

```js
export function createBoard(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(null));
}
export function isInside(board, { x, y }) {
  return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
}
export function getPiece(board, pos) {
  return isInside(board, pos) ? board[pos.y][pos.x] : null;
}
export function setPiece(board, { x, y }, piece) {
  const copy = board.map(row => [...row]);   // copia de cada fila
  copy[y][x] = piece;
  return copy;
}
export function movePiece(board, from, to) {
  const piece = getPiece(board, from);
  return setPiece(setPiece(board, from, null), to, piece);
}
```

**Está terminada cuando…**

- [ ] Todas las funciones tienen test y pasan.
- [ ] Hay un test que demuestra que setPiece y movePiece no modifican el tablero original.

### Tarea 1.A2 · Componentes Board y Square

**¿Para qué sirve?**
Son la parte visual del tablero. **Square** pinta una casilla; **Board** pinta todas las casillas leyendo el estado.

**Pasos**

1. Crea `src/components/Square.jsx` y `Square.module.css`. Recibe por props: `x, y, piece, isHighlighted, isSelected, onClick`.
2. El color de la casilla: clara si `(x + y) % 2 === 0`, oscura si no. Usa las variables CSS de MªJosé.
3. Crea `src/components/Board.jsx`: lee `state.board` con `useGame()` y recorre filas y columnas para pintar un Square por casilla.
4. Usa CSS Grid para colocar las casillas (ejemplo abajo).
5. Para mostrar la pieza, de momento basta con una letra o emoji (♔ ♕ ♖…). MªJosé hará los gráficos.
6. Pon el tablero en la página `Game.jsx`.
7. Sube un Board mínimo el martes y avisa al equipo.

```jsx
// Board.jsx
export default function Board({ onSquareClick }) {
  const { state } = useGame();
  return (
    <div className={styles.board}
         style={{ gridTemplateColumns: `repeat(${state.board[0].length}, var(--square-size))` }}>
      {state.board.map((row, y) =>
        row.map((piece, x) => (
          <Square key={`${x}-${y}`} x={x} y={y} piece={piece}
                  isHighlighted={state.highlights.some(h => h.x === x && h.y === y)}
                  onClick={() => onSquareClick({ x, y })} />
        ))
      )}
    </div>
  );
}
```

```css
/* Board.module.css */
.board { display: grid; border: 4px solid #333; width: fit-content; }
```

> **Consejo:** Recuerda que `y = 0` es la primera fila del array, que se pinta arriba. Si quieres que las blancas estén abajo, recorre las filas al revés con `[...state.board].reverse()` (y ajusta la y).

**Está terminada cuando…**

- [ ] Se ve un tablero 8×8 con colores alternos y las piezas del nivel de ejemplo.
- [ ] Al hacer clic en una casilla se llama a onClick con sus coordenadas (compruébalo con console.log).

### Tarea 1.A3 · Tests del componente Board

**¿Para qué sirve?**
Comprueban que el tablero se pinta bien y reacciona a los clics, sin tener que abrirlo en el navegador cada vez.

**Pasos**

1. Crea `Board.test.jsx`.
2. Renderiza el Board dentro de un GameProvider con el estado mock.
3. Comprueba que hay 64 casillas.
4. Simula un clic con `fireEvent.click` y comprueba que se llama a `onSquareClick` con las coordenadas correctas.

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
it('pinta 64 casillas', () => {
  render(<GameProvider initial={mockState}><Board onSquareClick={() => {}} /></GameProvider>);
  expect(screen.getAllByRole('button')).toHaveLength(64); // Square debe ser un <button>
});
```

**Está terminada cuando…**

- [ ] Los tests pasan en local y en la CI.

## Adri — Reglas clásicas

### Tarea 1.B1 · Movimientos de las piezas clásicas

**¿Para qué sirve?**
Cada pieza sabe a qué casillas puede moverse. Lo separamos en un archivo por pieza para que sea fácil de leer, probar y añadir piezas nuevas.

**Pasos**

1. Crea `src/engine/pieces/` con un archivo por pieza: `king.js`, `queen.js`, `rook.js`, `bishop.js`, `knight.js`, `pawn.js`.
2. Todos exportan la misma función: `getMoves(board, from, piece)` que devuelve una lista de casillas destino.
3. Piezas que se deslizan (torre, alfil, dama): avanzan en una dirección hasta salir del tablero, chocar con una pieza propia (para antes) o con una enemiga (la incluye, es una captura, y para). Usa la función auxiliar del ejemplo.
4. Piezas de salto (rey, caballo): prueban una lista fija de desplazamientos.
5. Crea `pieces/index.js` con un «registro» que asocia cada tipo a su función.
6. Test por pieza: colócala en el centro de un tablero vacío y comprueba el número exacto de movimientos (torre: 14, caballo: 8…).

```js
// pieces/slide.js — auxiliar para torre, alfil y dama
export function slide(board, from, piece, directions) {
  const moves = [];
  for (const [dx, dy] of directions) {
    let x = from.x + dx, y = from.y + dy;
    while (isInside(board, { x, y })) {
      const target = getPiece(board, { x, y });
      if (target && target.color === piece.color) break;  // pieza propia: para
      moves.push({ x, y });
      if (target) break;                                   // enemiga: captura y para
      x += dx; y += dy;
    }
  }
  return moves;
}

// rook.js
export const getMoves = (b, from, p) => slide(b, from, p, [[1,0],[-1,0],[0,1],[0,-1]]);

// pieces/index.js
export const PIECES = { king, queen, rook, bishop, knight, pawn };
```

**Está terminada cuando…**

- [ ] Las 6 piezas tienen getMoves y tests.
- [ ] Las piezas no atraviesan otras piezas ni salen del tablero.

### Tarea 1.B2 · Reglas: movimientos legales, jaque y jaque mate (rules.js)

**¿Para qué sirve?**
Que una pieza pueda moverse a una casilla no significa que sea legal: está prohibido dejar a tu propio rey en jaque. rules.js filtra los movimientos y detecta jaque y jaque mate.

**Pasos**

1. Crea `src/engine/rules.js`.
2. `isInCheck(board, color)`: busca el rey de ese color y mira si alguna pieza enemiga puede moverse a su casilla.
3. `getLegalMoves(state, from)`: coge los movimientos de la pieza, y para cada uno simula la jugada con movePiece. Si después de la jugada tu rey está en jaque, descarta ese movimiento.
4. `hasAnyLegalMove(state, color)`: ¿tiene ese color al menos un movimiento legal con alguna pieza?
5. `isCheckmate` = está en jaque Y no tiene ningún movimiento legal. (Si no está en jaque y no tiene movimientos, es *ahogado*.)
6. Conecta getLegalMoves y applyMove en `engine/index.js` (sustituye los mocks).
7. Tests con posiciones conocidas: un mate del pasillo, una pieza clavada que no puede moverse, un rey que no puede ponerse en jaque solo.

```js
export function getLegalMoves(state, from) {
  const piece = getPiece(state.board, from);
  if (!piece) return [];
  const candidates = PIECES[piece.type].getMoves(state.board, from, piece);
  return candidates.filter(to => {
    const after = movePiece(state.board, from, to);   // simulamos la jugada
    return !isInCheck(after, piece.color);            // ¿mi rey queda en jaque?
  });
}
```

> **Consejo:** Antes de programar, dibuja en papel las posiciones de los tests. Usa lichess.org/editor para montar posiciones y ver si un mate es real.

**Está terminada cuando…**

- [ ] Una pieza clavada (que protege al rey) no tiene movimientos legales.
- [ ] Se detecta correctamente jaque, jaque mate y ahogado en al menos 2 posiciones de test cada uno.

### Tarea 1.B3 · Interfaz: seleccionar y resaltar movimientos

**¿Para qué sirve?**
El jugador tiene que ver qué pieza ha seleccionado y a qué casillas puede moverla. Es lo que hace el juego usable.

**Pasos**

1. En `Game.jsx`, escribe la función `handleSquareClick(pos)` que se pasa al Board.
2. Lógica del clic: (a) si la casilla está resaltada → `dispatch({ type: 'MOVE', move: { from: selected, to: pos } })`; (b) si hay una pieza propia → `dispatch({ type: 'SELECT', square: pos })`; (c) si no → quita la selección.
3. En `Square.module.css` añade estilos para `.selected` (borde) y `.highlight` (un círculo en el centro si la casilla está vacía, un anillo si hay pieza enemiga).
4. Prueba en el navegador mover piezas de ambos colores.

```js
function handleSquareClick(pos) {
  const isTarget = state.highlights.some(h => h.x === pos.x && h.y === pos.y);
  const piece = getPiece(state.board, pos);
  if (isTarget)                                    dispatch({ type: 'MOVE', move: { from: state.selected, to: pos } });
  else if (piece && piece.color === state.turn)    dispatch({ type: 'SELECT', square: pos });
  else                                             dispatch({ type: 'DESELECT' });
}
```

**Está terminada cuando…**

- [ ] Al hacer clic en una pieza se ven sus movimientos legales.
- [ ] Al hacer clic en un movimiento resaltado, la pieza se mueve y cambia el turno.
- [ ] No se puede mover una pieza del color al que no le toca.

### Tarea 1.B4 · Documentación: reglas del juego

**¿Para qué sirve?**
Cualquiera del equipo (y el tutor) debe poder entender cómo funciona el motor sin leer el código.

**Pasos**

1. Crea `docs/reglas.md`.
2. Explica con tus palabras cómo se calculan los movimientos legales, el jaque y el mate (puedes usar el pseudocódigo de esta guía).
3. Añade un diagrama de actividad simple: clic → ¿es destino? → mover / ¿es pieza propia? → seleccionar.

**Está terminada cuando…**

- [ ] El documento está revisado por Aarón.

## MªJosé — Piezas nuevas

### Tarea 1.C1 · Lógica de las piezas con mecánicas nuevas

**¿Para qué sirve?**
Las piezas nuevas son lo que hace especial a nuestro juego. Se programan igual que las clásicas, así el resto del motor (reglas, IA) las entiende sin cambios.

**Pasos**

1. Revisa en el Entregable 1 cómo se mueve cada pieza nueva. Dibuja sus movimientos en una cuadrícula de papel.
2. Crea un archivo por pieza en `src/engine/pieces/` con la misma función `getMoves(board, from, piece)`.
3. Reutiliza las funciones auxiliares de Adri (`slide`, saltos) siempre que puedas.
4. Regístralas en `pieces/index.js`.
5. Añade una pieza nueva al nivel de ejemplo y pruébala en el navegador.
6. Explica cada pieza en `docs/piezas.md` con un dibujo de sus movimientos.

> **Consejo:** Si una pieza nueva tiene una mecánica muy distinta (por ejemplo, empujar otras piezas), habla antes con Adri: puede que applyMove necesite un caso especial.

**Está terminada cuando…**

- [ ] Cada pieza nueva tiene getMoves, test y documentación.
- [ ] Funcionan con getLegalMoves sin cambiar rules.js.

### Tarea 1.C2 · Diseño visual de las piezas

**¿Para qué sirve?**
Las letras o emojis sirven para probar, pero el juego final necesita piezas propias, claras y coherentes con el sistema de diseño.

**Pasos**

1. Diseña en Figma un icono por pieza (clásicas y nuevas) en blanco y negro, con el mismo estilo de línea.
2. Las piezas nuevas deben distinguirse de un vistazo de las clásicas (forma o detalle de color).
3. Exporta cada icono como SVG a `src/assets/pieces/` (nombre: `white-king.svg`…).
4. Crea el componente `Piece.jsx` que muestra el SVG según `type` y `color`, y pásale a Aarón el cambio para usarlo dentro de Square.

**Está terminada cuando…**

- [ ] Todas las piezas tienen icono SVG en los dos colores.
- [ ] Se ven bien sobre casilla clara y oscura.

### Tarea 1.C3 · Animación del movimiento

**¿Para qué sirve?**
Una pieza que «teletransporta» es confusa: el jugador no ve qué ha pasado, sobre todo cuando mueve la IA. Una animación corta lo hace evidente.

**Pasos**

1. La forma más sencilla: cuando una pieza aparece en una casilla nueva, aplícale una animación CSS de entrada (escala + opacidad).
2. Versión mejorada: guarda en el estado la última jugada (`lastMove`) y anima la pieza desde la casilla de origen con `transform: translate`.
3. Resalta también las casillas de origen y destino de la última jugada con un color suave.
4. Respeta a quien prefiere menos movimiento: desactiva la animación con `@media (prefers-reduced-motion: reduce)`.

```css
/* Piece.module.css */
.piece { animation: appear 200ms ease-out; }
@keyframes appear {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .piece { animation: none; } }
```

**Está terminada cuando…**

- [ ] Se ve claramente qué pieza se ha movido y desde dónde.
- [ ] La animación dura menos de 250 ms.

### Tarea 1.C4 · Tests de las piezas nuevas

**¿Para qué sirve?**
Las piezas nuevas son las más propensas a errores porque no hay referencia externa. Los tests aseguran que se mueven exactamente como dice el diseño.

**Pasos**

1. Para cada pieza: un test en tablero vacío (número exacto de movimientos) y otro con piezas alrededor (no atraviesa, captura bien).
2. Un test en el borde y la esquina del tablero (no sale fuera).
3. Un test con getLegalMoves para comprobar que respeta el jaque.

**Está terminada cuando…**

- [ ] Al menos 4 tests por pieza nueva, en verde.

> **Hito de la Fase 1:** se pueden mover piezas (clásicas y nuevas) por el tablero respetando las reglas, con selección, resaltado y animación.

---

# Fase 2 — IA y objetivos (semanas 4–5)

**Scrum Master:** MªJosé. **Objetivo:** partida completa contra la máquina, con objetivo de nivel y pantalla final de victoria o derrota.

## Aarón — Objetivos y fin de partida

### Tarea 2.A1 · Lógica de objetivos (objectives.js)

**¿Para qué sirve?**
Cada nivel tiene un objetivo distinto (llevar el rey a una casilla, dar mate…). Necesitamos saber en cada jugada si el jugador ha ganado, ha perdido o sigue jugando.

**Pasos**

1. Crea `src/engine/objectives.js`.
2. Haz una función por tipo de objetivo que reciba el estado y devuelva true/false: `reachSquare` (¿el rey blanco está en la casilla objetivo?) y `checkmate` (¿el negro está en mate?). Usa las funciones de rules.js.
3. Crea `isObjectiveMet(state)` que elige la función según `state.objective.type`.
4. Implementa `checkStatus(state)` en engine/index.js: **won** si se cumple el objetivo; **lost** si el jugador está en mate, no tiene movimientos o supera `maxMoves`; si no, **playing**.
5. Llama a checkStatus en el reducer después de cada MOVE y guarda el resultado en `state.status`.

```js
const OBJECTIVES = {
  reachSquare: (state) => {
    const king = findPiece(state.board, p => p.type === 'king' && p.color === 'white');
    const { target } = state.objective;
    return king && king.x === target.x && king.y === target.y;
  },
  checkmate: (state) => isCheckmate(state, 'black'),
};
export const isObjectiveMet = (state) => OBJECTIVES[state.objective.type](state);
```

> **Consejo:** Diseña objectives.js para que añadir un objetivo nuevo sea solo añadir una entrada al objeto OBJECTIVES. Así no hay que tocar nada más.

**Está terminada cuando…**

- [ ] Cada tipo de objetivo tiene al menos 2 tests (cumplido y no cumplido).
- [ ] checkStatus devuelve won/lost/playing correctamente en tests.

### Tarea 2.A2 · HUD (información de la partida)

**¿Para qué sirve?**
El HUD es la información que rodea al tablero: el jugador debe saber en todo momento qué tiene que conseguir, de quién es el turno y cuántos movimientos le quedan.

**Pasos**

1. Diseña en Figma el HUD siguiendo el sistema de diseño (o usa los mockups de MªJosé).
2. Crea `src/components/HUD.jsx` que lea del estado: nombre del nivel, texto del objetivo, turno y movimientos (`moveCount / maxMoves`).
3. Convierte el objetivo en texto legible con una función: `{ type: 'reachSquare', target: {x:4,y:7} }` → «Lleva al rey a la casilla e8».
4. Añade un botón «Reiniciar» (despacha START con el mismo nivel) y «Salir» (vuelve a /levels).
5. Muestra un aviso visible cuando el jugador está en jaque.

**Está terminada cuando…**

- [ ] El HUD se actualiza en cada jugada.
- [ ] El texto del objetivo se entiende sin explicaciones.

### Tarea 2.A3 · Modales de victoria y derrota

**¿Para qué sirve?**
Cuando la partida termina hay que decirlo claramente y ofrecer qué hacer después.

**Pasos**

1. Crea un componente genérico `Modal.jsx`: fondo oscuro semitransparente, caja centrada, título, texto y botones. Se cierra con la tecla Escape.
2. En Game.jsx, si `state.status === 'won'` muestra «¡Nivel superado!» con botones *Siguiente nivel* y *Menú*.
3. Si `'lost'`, muestra «Has perdido» con el motivo (mate, sin movimientos, límite de jugadas) y botones *Reintentar* y *Menú*.
4. Mientras el modal está abierto, el tablero no responde a clics.

**Está terminada cuando…**

- [ ] Los dos modales aparecen en el momento correcto y todos sus botones funcionan.
- [ ] Test: con un estado won/lost se muestra el modal correspondiente.

### Tarea 2.A4 · Tests y documentación de objetivos

**¿Para qué sirve?**
Los objetivos deciden si el jugador gana: un error aquí arruina el juego.

**Pasos**

1. Tests de objectives.js con posiciones preparadas a mano.
2. Test del HUD: muestra el texto correcto para cada tipo de objetivo.
3. Documenta en `docs/objetivos.md` los tipos de objetivo, cómo se comprueban y cómo añadir uno nuevo.

**Está terminada cuando…**

- [ ] Tests en verde y documento revisado.

## Adri — Algoritmo de IA

### Tarea 2.B1 · Función de evaluación (evaluate.js)

**¿Para qué sirve?**
La IA necesita una forma de puntuar un tablero: «¿cómo de buena es esta posición para mí?». Un número alto es bueno para la IA (negras) y uno bajo, bueno para el jugador.

**Pasos**

1. Crea `src/engine/ai/evaluate.js`.
2. Asigna un valor a cada pieza (tabla de abajo). Para las piezas nuevas, decide un valor con MªJosé según lo potentes que sean.
3. Puntuación base = suma de las piezas negras − suma de las piezas blancas.
4. Añade el objetivo: si el nivel es reachSquare, resta puntos cuanto más cerca esté el rey blanco del objetivo (la IA quiere impedirlo).
5. Si el estado es mate, devuelve un valor enorme (+/-100000).
6. Tests: con más material negro, la puntuación es positiva; con el rey blanco cerca del objetivo, baja.

```js
const VALUES = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0 };
// + valores de las piezas nuevas

export function evaluate(state) {
  let score = 0;
  for (const row of state.board)
    for (const p of row)
      if (p) score += (p.color === 'black' ? 1 : -1) * VALUES[p.type];
  // + bonus/penalización por el objetivo del nivel
  return score;
}
```

**Está terminada cuando…**

- [ ] evaluate devuelve números coherentes en al menos 4 posiciones de test.

### Tarea 2.B2 · Algoritmo Minimax con poda alfa-beta (minimax.js)

**¿Para qué sirve?**
Minimax es la forma en que la IA «piensa»: prueba todas sus jugadas, luego todas las respuestas del jugador, luego sus respuestas… hasta una profundidad. Supone que el jugador siempre hará su mejor jugada y elige el camino que le da la mejor puntuación en el peor caso. La **poda alfa-beta** evita explorar ramas que seguro no se van a elegir, y lo hace muchísimo más rápido.

**Pasos**

1. Antes de programar, mira un vídeo corto sobre minimax (busca «minimax alpha beta pruning explained») y haz a mano un árbol pequeño en papel.
2. Crea `src/engine/ai/minimax.js` con la función del ejemplo.
3. Necesitarás `getAllLegalMoves(state, color)` en rules.js: recorre todas las piezas de ese color y junta sus movimientos.
4. Crea `findBestMove(state, depth)`: prueba cada jugada de las negras, llama a minimax para cada una y se queda con la de mayor puntuación.
5. Prueba con profundidad 1, 2 y 3 y mide cuánto tarda (`console.time`).

```js
// maximizing = true cuando le toca a la IA (negras)
export function minimax(state, depth, alpha, beta, maximizing) {
  const status = checkStatus(state);
  if (depth === 0 || status !== 'playing') return evaluate(state);

  const color = maximizing ? 'black' : 'white';
  const moves = getAllLegalMoves(state, color);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      best = Math.max(best, minimax(applyMove(state, move), depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;      // poda: el jugador nunca dejaría llegar aquí
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      best = Math.min(best, minimax(applyMove(state, move), depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}
```

> **Consejo:** Si la IA hace jugadas absurdas, el problema casi siempre está en evaluate (signos cambiados) o en que applyMove no cambia el turno.

**Está terminada cuando…**

- [ ] La IA devuelve siempre una jugada legal.
- [ ] Con profundidad 3, tarda menos de 2 segundos en el nivel de ejemplo.

### Tarea 2.B3 · Tests de la IA

**¿Para qué sirve?**
Comprobar una IA es difícil, pero hay casos con respuesta única que sirven de prueba.

**Pasos**

1. Test «captura gratis»: una pieza blanca sin defender delante de una negra → la IA la captura.
2. Test «mate en 1»: posición donde las negras dan mate en una jugada → con profundidad 2 la IA la encuentra.
3. Test «evitar mate»: posición donde las negras deben defenderse → la IA no se deja dar mate.
4. Test de rendimiento: profundidad 3 en menos de X ms (decididlo según lo medido).
5. Documenta en `docs/ia.md` cómo funciona minimax, la poda y la evaluación (con un dibujo del árbol).

**Está terminada cuando…**

- [ ] Los 4 tests pasan.
- [ ] docs/ia.md se entiende sin saber nada de IA.

## MªJosé — Integración de la IA

### Tarea 2.C1 · IA de prueba (mock aleatorio)

**¿Para qué sirve?**
Mientras Adri termina minimax, necesitas algo que mueva las negras para poder construir la integración. Una IA que elige una jugada legal al azar es perfecta para eso.

**Pasos**

1. Crea `src/engine/ai/randomAI.js`: obtiene todas las jugadas legales de las negras y devuelve una al azar.
2. Úsala en getAIMove mientras minimax no esté listo.
3. Cuando Adri termine, solo cambias una línea para usar findBestMove.

```js
export function randomMove(state) {
  const moves = getAllLegalMoves(state, 'black');
  return moves[Math.floor(Math.random() * moves.length)];
}
```

**Está terminada cuando…**

- [ ] Las negras mueven solas después de cada jugada del jugador.

### Tarea 2.C2 · Web Worker para la IA

**¿Para qué sirve?**
JavaScript en el navegador hace todo en un único hilo. Si la IA tarda 2 segundos pensando, la pantalla se congela 2 segundos (ni animaciones ni clics). Un **Web Worker** es un segundo hilo: la IA piensa allí y la pantalla sigue funcionando.

**Pasos**

1. Crea `src/engine/ai/ai.worker.js`: escucha mensajes, calcula la jugada y la devuelve (ejemplo abajo).
2. En engine/index.js, implementa getAIMove para que cree el worker, le envíe el estado y devuelva una Promise con la respuesta.
3. En Game.jsx, usa un useEffect: cuando `state.turn === 'black'` y la partida sigue, llama a getAIMove y despacha MOVE con el resultado.
4. Comprueba que, mientras la IA piensa, la animación del indicador sigue moviéndose.

```js
// ai.worker.js
import { findBestMove } from './minimax';
self.onmessage = (e) => {
  const { state, depth } = e.data;
  self.postMessage(findBestMove(state, depth));
};

// engine/index.js
export function getAIMove(state, difficulty) {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./ai/ai.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => { resolve(e.data); worker.terminate(); };
    worker.postMessage({ state, depth: DEPTH[difficulty] });
  });
}
```

> **Consejo:** Al worker solo se le pueden enviar datos simples (objetos, arrays, números). Por eso es importante que el estado no contenga funciones ni clases.

**Está terminada cuando…**

- [ ] La IA mueve sola y la interfaz nunca se congela.
- [ ] Si sales de la partida mientras la IA piensa, no da error (termina el worker en el cleanup del useEffect).

### Tarea 2.C3 · Dificultades e indicador «IA pensando…»

**¿Para qué sirve?**
La dificultad se controla con la profundidad de búsqueda: cuantas más jugadas ve por delante, mejor juega. El indicador evita que el jugador piense que el juego se ha colgado.

**Pasos**

1. Define en `engine/ai/config.js`: `DEPTH = { easy: 1, medium: 3, hard: 4 }`. En fácil, además, que la IA elija una jugada aleatoria un 30 % de las veces.
2. Añade al estado un campo `aiThinking` (true mientras se espera la Promise).
3. Crea un componente con un pequeño spinner animado y el texto «La IA está pensando…», visible cuando aiThinking es true.
4. Durante ese tiempo, desactiva los clics en el tablero.

**Está terminada cuando…**

- [ ] Se nota la diferencia entre fácil y difícil jugando.
- [ ] El indicador aparece y desaparece en el momento correcto.

### Tarea 2.C4 · Pantalla de selección de nivel y dificultad

**¿Para qué sirve?**
Es la puerta de entrada a las partidas: el jugador elige qué nivel quiere jugar.

**Pasos**

1. En `LevelSelect.jsx`, importa levels.json y agrupa los niveles por dificultad (tres secciones: Fácil, Medio, Difícil).
2. Muestra cada nivel como una tarjeta con su nombre y su objetivo.
3. Al hacer clic, navega a `/play/ID` con `useNavigate()`.
4. En Game.jsx, lee el id con `useParams()` y despacha START al cargar.
5. Deja preparado un hueco visual para el candado de los niveles bloqueados (lo programa Aarón en la Fase 3).

**Está terminada cuando…**

- [ ] Se puede elegir cualquier nivel y empezar a jugarlo.
- [ ] Se ve bien en móvil y escritorio.

### Tarea 2.C5 · Medir el rendimiento de la IA

**¿Para qué sirve?**
Hay que comprobar que la IA no tarda demasiado en ningún nivel ni dificultad, y dejarlo documentado.

**Pasos**

1. Con `performance.now()` antes y después de findBestMove, mide 10 jugadas por dificultad en 2 niveles distintos.
2. Haz una tabla en `docs/rendimiento-ia.md`: dificultad, nivel, tiempo medio, tiempo máximo.
3. Si alguna supera los 3 segundos, avisa a Adri (y en la Fase 4 lo optimiza Aarón).

**Está terminada cuando…**

- [ ] La tabla de tiempos está documentada.

> **Hito de la Fase 2:** partida completa contra la máquina en tres dificultades, con objetivo, HUD y pantalla de victoria/derrota.

---

# Fase 3 — Niveles, obstáculos y persistencia (semanas 6–7)

**Scrum Master:** Aarón. **Objetivo:** juego completo con todos los niveles, obstáculos y progreso guardado.

## Aarón — Persistencia y ajustes

### Tarea 3.A1 · Servicio de guardado (storage.js)

**¿Para qué sirve?**
Si el jugador cierra la pestaña, debe conservar los niveles superados y sus ajustes. localStorage guarda texto en el navegador de forma permanente; nosotros guardamos un JSON.

**Pasos**

1. Crea `src/services/storage.js` con `loadProgress()`, `saveProgress(progress)` y `resetProgress()`.
2. Usa una clave con versión (`'chess-progress-v1'`): si en el futuro cambia el formato, se puede migrar.
3. Envuelve todo en `try/catch`: en modo incógnito o con el almacenamiento lleno, localStorage puede fallar y el juego no debe romperse.
4. Si no hay nada guardado, devuelve un progreso por defecto (primer nivel desbloqueado).

```js
const KEY = 'chess-progress-v1';
const DEFAULT = { unlocked: ['easy-1'], completed: [], settings: { sound: true, hints: true } };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}
export function saveProgress(progress) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* ignorar */ }
}
```

**Está terminada cuando…**

- [ ] Al recargar la página, el progreso se mantiene.
- [ ] Si localStorage falla, el juego sigue funcionando (con el progreso por defecto).

### Tarea 3.A2 · Desbloqueo de niveles

**¿Para qué sirve?**
Superar un nivel debe desbloquear el siguiente. Así el jugador avanza y el juego tiene progresión.

**Pasos**

1. Cuando `state.status` pasa a `'won'`, añade el nivel a `completed` y el siguiente de levels.json a `unlocked`, y guarda.
2. En LevelSelect (hecho por MªJosé), muestra un candado en los niveles no desbloqueados y desactiva su clic. Muestra un ✔ en los completados.
3. Si alguien entra por URL a un nivel bloqueado, redirígelo a /levels.

**Está terminada cuando…**

- [ ] Al ganar un nivel se desbloquea el siguiente y se mantiene tras recargar.
- [ ] No se puede jugar un nivel bloqueado ni escribiendo su URL.

### Tarea 3.A3 · Pantalla de ajustes

**¿Para qué sirve?**
Permite al jugador personalizar la experiencia y empezar de cero si quiere.

**Pasos**

1. En `Settings.jsx`, añade interruptores (checkbox con estilo) para: sonido, mostrar movimientos posibles y animaciones.
2. Guarda los cambios con saveProgress al momento.
3. Haz que los ajustes tengan efecto: si «mostrar movimientos» está apagado, no se resaltan las casillas.
4. Añade «Borrar progreso» que abre el Modal (de la Fase 2) pidiendo confirmación antes de llamar a resetProgress.

**Está terminada cuando…**

- [ ] Los ajustes se guardan y se aplican.
- [ ] Borrar progreso pide confirmación y funciona.

### Tarea 3.A4 · Tests del guardado

**¿Para qué sirve?**
Si el guardado falla, el jugador pierde su progreso: hay que probarlo bien.

**Pasos**

1. En los tests, jsdom ya incluye localStorage. Límpialo antes de cada test con `beforeEach(() => localStorage.clear())`.
2. Test: guardar y cargar devuelve lo mismo.
3. Test: sin datos devuelve DEFAULT.
4. Test: si hay un JSON corrupto (`localStorage.setItem(KEY, '{roto')`) devuelve DEFAULT sin romper.
5. Documenta en `docs/persistencia.md` el formato guardado.

**Está terminada cuando…**

- [ ] Los tests pasan y el formato está documentado.

## Adri — Obstáculos

### Tarea 3.B1 · Generación aleatoria de obstáculos (obstacles.js)

**¿Para qué sirve?**
Los obstáculos son casillas bloqueadas por las que no se puede pasar. Se colocan al azar en cada partida para que el juego sea distinto cada vez.

**Pasos**

1. Crea `src/engine/obstacles.js` con `generateObstacles(board, count, forbidden)`.
2. Elige casillas al azar que estén vacías y que no estén en la lista `forbidden` (casilla objetivo y casillas pegadas al rey del jugador).
3. Llama a la función dentro de createGame usando `level.obstacles.count`.
4. Modifica las piezas para que traten un obstáculo como un muro: `slide` para antes de él y los saltos no pueden aterrizar en él. Lo más fácil: una función `isBlocked(state, pos)` en board.js.

**Está terminada cuando…**

- [ ] Los obstáculos aparecen en sitios distintos en cada partida.
- [ ] Ninguna pieza puede pararse en un obstáculo ni atravesarlo (salvo el caballo, que salta).

### Tarea 3.B2 · Garantizar que el nivel sea resoluble

**¿Para qué sirve?**
Si el azar coloca obstáculos rodeando la casilla objetivo, el nivel es imposible y el jugador se frustra. Hay que comprobarlo y, si pasa, volver a generar.

**Pasos**

1. Implementa `isReachable(state, from, to)` con una búsqueda en anchura (BFS): desde la casilla del rey, explora casillas vecinas no bloqueadas hasta llegar al objetivo o quedarte sin casillas.
2. En createGame: genera obstáculos, comprueba con isReachable, y si no se puede llegar, repite (máximo 50 intentos; si no, sin obstáculos).
3. Para objetivos de tipo mate, al menos comprueba que el rey negro no quede totalmente encerrado por obstáculos.

```js
// BFS: ¿se puede ir de 'from' a 'to' sin pisar obstáculos?
export function isReachable(state, from, to) {
  const visited = new Set([`${from.x},${from.y}`]);
  const queue = [from];
  while (queue.length) {
    const { x, y } = queue.shift();
    if (x === to.x && y === to.y) return true;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const next = { x: x + dx, y: y + dy };
      const key = `${next.x},${next.y}`;
      if (isInside(state.board, next) && !isBlocked(state, next) && !visited.has(key)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  return false;
}
```

**Está terminada cuando…**

- [ ] Test: generar 200 niveles seguidos y que todos sean alcanzables.

### Tarea 3.B3 · Visual de los obstáculos

**¿Para qué sirve?**
El jugador tiene que ver de un vistazo qué casillas están bloqueadas.

**Pasos**

1. Diseña un icono o textura para el obstáculo (roca, muro…) coherente con el estilo de las piezas de MªJosé.
2. En Square, si la casilla es un obstáculo, píntala con ese estilo y desactiva su clic.
3. Comprueba que se distingue en casillas claras y oscuras.

**Está terminada cuando…**

- [ ] Los obstáculos se ven claramente y no se confunden con piezas.

### Tarea 3.B4 · Tests y documentación de obstáculos

**¿Para qué sirve?**
Los obstáculos tocan las reglas de movimiento, así que hay riesgo de romper cosas que ya funcionaban.

**Pasos**

1. Test: una torre se para justo antes de un obstáculo.
2. Test: el caballo puede saltar por encima pero no aterrizar en él.
3. Test: los obstáculos nunca caen sobre piezas ni sobre la casilla objetivo.
4. Ejecuta todos los tests de la Fase 1 y comprueba que siguen en verde.
5. Documenta en `docs/obstaculos.md` cómo se generan y cómo se garantiza que el nivel se pueda resolver.

**Está terminada cuando…**

- [ ] Todos los tests (nuevos y antiguos) pasan.

## MªJosé — Niveles y menú

### Tarea 3.C1 · Diseñar todos los niveles (levels.json)

**¿Para qué sirve?**
Los niveles son el contenido del juego. Deben tener una dificultad progresiva y enseñar poco a poco las piezas nuevas.

**Pasos**

1. Planifica en una tabla (antes de escribir JSON) unos 9 niveles: 3 fáciles, 3 medios y 3 difíciles. Columnas: nombre, objetivo, piezas, obstáculos, maxMoves, qué enseña.
2. Introduce las piezas nuevas de una en una: un nivel fácil para presentar cada una.
3. Escribe los niveles en `levels.json` siguiendo la estructura de la Fase 0.
4. Juega cada nivel al menos 3 veces. Si es demasiado fácil o imposible, ajústalo.
5. Guarda la tabla de diseño en `docs/niveles.md`.

**Está terminada cuando…**

- [ ] Hay al menos 9 niveles jugables con dificultad progresiva.
- [ ] Cada nivel se ha probado jugando.

### Tarea 3.C2 · Menú principal

**¿Para qué sirve?**
Es la primera pantalla que ve el jugador: debe ser atractiva y llevar a todo lo importante.

**Pasos**

1. En `Menu.jsx`: título del juego, botón grande «Jugar» (→ /levels), «Ajustes» (→ /settings) y «Cómo jugar».
2. «Cómo jugar» abre un Modal que explica el objetivo, las piezas nuevas (con sus iconos) y los obstáculos.
3. Añade un fondo o ilustración sencilla acorde al sistema de diseño.
4. Si el jugador ya tiene progreso, el botón puede decir «Continuar» y llevar al último nivel desbloqueado.

**Está terminada cuando…**

- [ ] El menú sigue el mockup y todos los botones funcionan.

### Tarea 3.C3 · Diseño responsive final

**¿Para qué sirve?**
La app debe funcionar bien desde un móvil pequeño hasta una pantalla grande.

**Pasos**

1. Haz que el tamaño de casilla dependa de la pantalla: `--square-size: min(11vw, 9vh, 72px)`.
2. Con `@media (max-width: 768px)`, coloca el HUD encima del tablero en lugar de al lado.
3. Los botones deben medir al menos 44 × 44 px para tocarlos con el dedo.
4. En el navegador: F12 → icono de móvil (*Toggle device toolbar*) y prueba iPhone SE, iPhone 14, iPad y un portátil.
5. Prueba también en un móvil real.

**Está terminada cuando…**

- [ ] Ninguna pantalla tiene scroll horizontal ni elementos cortados en esos tamaños.

### Tarea 3.C4 · Tests de los niveles

**¿Para qué sirve?**
Si un nivel tiene un error en el JSON (pieza inexistente, casilla fuera del tablero), el juego se rompe al cargarlo.

**Pasos**

1. Escribe un test que recorra **todos** los niveles de levels.json y para cada uno compruebe que: createGame no lanza error, hay un rey blanco, el objetivo está dentro del tablero y las blancas tienen al menos un movimiento legal.
2. Test: los ids de los niveles no se repiten.

```js
import levels from './levels.json';
describe.each(levels)('nivel $id', (level) => {
  it('se puede cargar y jugar', () => {
    const state = createGame(level.id);
    expect(findPiece(state.board, p => p.type === 'king' && p.color === 'white')).toBeTruthy();
    expect(getAllLegalMoves(state, 'white').length).toBeGreaterThan(0);
  });
});
```

**Está terminada cuando…**

- [ ] El test pasa para todos los niveles. Si alguien añade un nivel roto, la CI lo detecta.

> **Hito de la Fase 3:** juego completo con todos los niveles, obstáculos aleatorios, progreso guardado y ajustes.

---

# Fase 4 — Pulido, testing y entrega (semana 8)

**Scrum Master:** Adri. **Objetivo:** versión final desplegada, sin bugs conocidos importantes, documentada y presentada. **Esta semana no se añaden funcionalidades nuevas**: solo se mejora y se arregla lo que hay.

## Aarón — Rendimiento y bugs del motor

### Tarea 4.A1 · Optimizar la IA (ordenación de movimientos)

**¿Para qué sirve?**
La poda alfa-beta funciona mucho mejor si se prueban primero las mejores jugadas (normalmente las capturas). Con eso la IA difícil puede ir el doble de rápido sin cambiar cómo juega.

**Pasos**

1. Mide primero el tiempo actual en el nivel más difícil (usa la tabla de MªJosé de la Fase 2).
2. En minimax, antes del bucle, ordena los movimientos: capturas primero, y entre las capturas, las que capturan la pieza más valiosa con la menos valiosa.
3. Vuelve a medir y apunta la mejora.
4. Comprueba que los tests de la IA siguen pasando (debe jugar igual, solo más rápido).

```js
function orderMoves(state, moves) {
  return moves.sort((a, b) => captureValue(state, b) - captureValue(state, a));
}
function captureValue(state, move) {
  const target = getPiece(state.board, move.to);
  return target ? VALUES[target.type] : 0;
}
```

**Está terminada cuando…**

- [ ] La IA difícil es más rápida que antes y los tests de IA siguen en verde.
- [ ] La mejora está documentada en docs/rendimiento-ia.md.

### Tarea 4.A2 · Corregir bugs del motor

**¿Para qué sirve?**
Al final aparecen bugs que nadie había visto. Hay que arreglarlos de forma ordenada para no romper otras cosas.

**Pasos**

1. En el tablero, filtra las issues con la etiqueta bug y zona motor/reglas/IA.
2. Ordénalas por gravedad: primero las que rompen la partida, luego las molestas.
3. Para cada bug: (1) reprodúcelo; (2) escribe un test que falle por culpa del bug; (3) arréglalo; (4) comprueba que el test ya pasa.
4. Así el bug nunca vuelve sin que la CI lo detecte.

**Está terminada cuando…**

- [ ] No queda ningún bug grave del motor abierto.
- [ ] Cada bug arreglado tiene su test.

### Tarea 4.A3 · Memoria: parte técnica del motor y la IA

**¿Para qué sirve?**
La memoria final debe explicar cómo está construido el juego por dentro.

**Pasos**

1. Reúne lo escrito en docs/ (reglas, objetivos, ia, obstáculos, persistencia).
2. Redacta la sección técnica de la memoria: arquitectura, motor, IA, decisiones tomadas y problemas encontrados.
3. Incluye los diagramas actualizados (componentes, clases si aplica, despliegue).

**Está terminada cuando…**

- [ ] La sección está escrita y revisada por otro miembro.

## Adri — UX y accesibilidad

### Tarea 4.B1 · Pulir la experiencia de usuario

**¿Para qué sirve?**
Los pequeños detalles hacen que el juego se sienta terminado y profesional.

**Pasos**

1. Juega 3 partidas completas apuntando todo lo que resulte confuso o feo.
2. Añade efecto hover en las casillas y botones.
3. Comprueba que la última jugada queda resaltada y que el jaque se ve claramente (casilla del rey en rojo).
4. Añade transiciones suaves al abrir modales y cambiar de pantalla.
5. Opcional: sonidos cortos al mover, capturar y ganar (respetando el ajuste de sonido).

**Está terminada cuando…**

- [ ] Lista de mejoras aplicada y revisada por MªJosé.

### Tarea 4.B2 · Accesibilidad

**¿Para qué sirve?**
La web debe poder usarla cualquiera, también personas que no usan ratón o que usan lector de pantalla. Además, es algo que se valora en la evaluación.

**Pasos**

1. Cada casilla debe ser un `<button>` con `aria-label`, por ejemplo «e4, caballo blanco» o «d5, vacía».
2. Navegación con teclado: Tab llega al tablero, las flechas mueven el foco entre casillas, Enter selecciona o mueve.
3. El foco debe verse siempre (`:focus-visible` con un borde claro).
4. Revisa los contrastes de todos los textos y estados con WebAIM.
5. Pasa Lighthouse (F12 → pestaña Lighthouse → Accessibility) y corrige lo que marque.

**Está terminada cuando…**

- [ ] Se puede jugar una partida entera solo con teclado.
- [ ] Lighthouse Accessibility ≥ 90.

### Tarea 4.B3 · Análisis heurístico de Nielsen (versión web)

**¿Para qué sirve?**
En el Entregable 4 se hizo el análisis sobre los mockups. Ahora hay que repetirlo sobre la app real para ver si los problemas se resolvieron.

**Pasos**

1. Recupera el análisis del Entregable 4.
2. Para cada una de las 10 heurísticas, revisa la app real y apunta: problema encontrado, pantalla, gravedad (0–4) y solución.
3. Compara con el análisis anterior: qué se ha arreglado y qué es nuevo.
4. Arregla los problemas de gravedad 3–4 antes de la entrega.
5. Guárdalo en `docs/nielsen-web.md`.

**Está terminada cuando…**

- [ ] Tabla de las 10 heurísticas completa, con comparación respecto al análisis anterior.

## MªJosé — QA final y despliegue

### Tarea 4.C1 · Pruebas manuales en navegadores y dispositivos

**¿Para qué sirve?**
Los tests automáticos no lo detectan todo: hay que jugar de verdad en distintos sitios.

**Pasos**

1. Prepara una checklist: abrir la web, completar un nivel en cada dificultad, perder una partida, recargar y comprobar el progreso, cambiar ajustes, borrar progreso, probar en horizontal en móvil.
2. Pásala en Chrome, Firefox, Edge (o Safari) y en al menos un móvil Android y uno iPhone si es posible.
3. Cada fallo encontrado → issue con etiqueta bug, pasos para reproducirlo, captura y navegador.

**Está terminada cuando…**

- [ ] La checklist se ha pasado completa en todos los navegadores.

### Tarea 4.C2 · Informe de pruebas

**¿Para qué sirve?**
Documento que demuestra que el juego se ha probado de forma organizada. Lo pide la asignatura.

**Pasos**

1. Crea `docs/informe-pruebas.md`.
2. Resumen de tests automáticos: número de tests y cobertura (`npx vitest run --coverage`).
3. Tabla de pruebas manuales: ID, caso, pasos, resultado esperado, resultado obtenido, estado (OK/Fallo), navegador.
4. Lista de bugs encontrados y si se han corregido.

**Está terminada cuando…**

- [ ] El informe está completo y revisado por Aarón.

### Tarea 4.C3 · Despliegue en Vercel

**¿Para qué sirve?**
Publicar el juego en Internet para que el tutor y cualquiera puedan jugarlo con un enlace.

**Pasos**

1. Fusiona develop en main mediante una PR (con todo probado).
2. Entra en vercel.com con la cuenta de GitHub → *Add New → Project* → importa el repo.
3. Vercel detecta Vite solo. Comprueba: Build command `npm run build`, Output directory `dist`. Pulsa Deploy.
4. Como usamos React Router, crea `vercel.json` (abajo) para que recargar en /levels no dé error 404.
5. Abre la URL publicada y repite la checklist rápida.

```json
// vercel.json (en la raíz del proyecto)
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Está terminada cuando…**

- [ ] El juego funciona en la URL pública, incluso recargando en cualquier pantalla.
- [ ] Cada fusión en main despliega automáticamente.

### Tarea 4.C4 · README del proyecto

**¿Para qué sirve?**
El README es la portada del repositorio: lo primero que ve el tutor o un futuro empleador.

**Pasos**

1. Incluye: nombre y descripción del juego, captura de pantalla, enlace a la web publicada.
2. Instrucciones: requisitos (Node 20), `npm install`, `npm run dev`, `npm test`.
3. Estructura de carpetas resumida y enlace a la carpeta docs/.
4. Equipo y qué hizo cada uno.

**Está terminada cuando…**

- [ ] Alguien que no conoce el proyecto puede ejecutarlo siguiendo solo el README.

## Todos — Memoria final y presentación

### Tarea 4.D1 · Memoria y presentación

**¿Para qué sirve?**
Es la entrega final: hay que contar el proyecto de forma clara y defenderlo.

**Pasos**

1. Cada uno redacta en la memoria las secciones de sus funcionalidades (ya están en docs/: es reunirlo y darle formato).
2. La presentación sigue la historia del proyecto: problema → idea → cambio a web → arquitectura → demo → resultados → aprendizajes.
3. Cada miembro presenta una parte técnica y una parte de diseño o pruebas.
4. Ensayad la demo en directo al menos dos veces. Tened un vídeo grabado por si falla Internet.

**Está terminada cuando…**

- [ ] Memoria entregada y presentación ensayada.

> **Hito de la Fase 4:** versión desplegada, documentada, probada y presentada.

---

# Dependencias críticas

Qué tareas dependen de otras. Si vas a retrasarte en una tarea de la que depende otra persona, **avisa en el daily cuanto antes**.

| Tarea | Depende de | Qué hacer mientras tanto |
|---|---|---|
| **Todo lo de la Fase 1** | Contrato del motor (0.B1) | Cerrar el contrato el martes de la semana 1. |
| **Resaltado (1.B3) y piezas nuevas (1.C\*)** | Board mínimo (1.A2) | Aarón entrega un Board básico el martes de la semana 2. |
| **Integración IA (2.C2)** | Minimax (2.B2) | Usar la IA aleatoria (2.C1). |
| **Desbloqueo de niveles (3.A2)** | Pantalla de niveles (2.C4) | Programar storage.js primero. |
| **Obstáculos (3.B\*)** | rules.js y objectives.js estables | Diseñar el visual del obstáculo. |
| **Test de niveles (3.C4)** | Obstáculos (3.B1) | Escribir el test sin obstáculos y ampliarlo después. |
| **Despliegue (4.C3)** | Bugs graves resueltos (4.A2) | Hacer un despliegue de prueba antes. |

# Glosario

| Término | Qué significa |
|---|---|
| **Componente** | Una pieza de la interfaz en React (un botón, el tablero, el HUD). Es una función que devuelve lo que se ve en pantalla. |
| **Props** | Datos que un componente padre le pasa a un hijo, como los parámetros de una función. |
| **Estado (state)** | Datos que pueden cambiar mientras se usa la app (el tablero, el turno…). Cuando cambian, React vuelve a pintar la pantalla. |
| **Reducer** | Función que recibe el estado actual y una acción, y devuelve el estado nuevo. Es el único sitio donde se cambia el estado. |
| **Acción / dispatch** | Una acción es un objeto que describe qué ha pasado (`{ type: 'MOVE' }`). dispatch la envía al reducer. |
| **Context** | Mecanismo de React para compartir datos con muchos componentes sin pasarlos por props uno a uno. |
| **Hook** | Funciones de React que empiezan por use (useState, useEffect, useReducer...). Dan capacidades extra a los componentes. |
| **useEffect** | Ejecuta código cuando algo cambia (por ejemplo, pedir la jugada a la IA cuando le toca a las negras). |
| **Inmutable** | Que no se modifica. En lugar de cambiar un objeto, se crea una copia con el cambio. |
| **Mock** | Una versión falsa de algo, usada para trabajar o probar mientras la versión real no está lista. |
| **Web Worker** | Un hilo extra del navegador para hacer cálculos pesados sin congelar la pantalla. |
| **Minimax** | Algoritmo que explora las jugadas futuras suponiendo que cada jugador hará su mejor jugada. |
| **Poda alfa-beta** | Mejora de minimax que deja de explorar ramas que seguro no se elegirán. Mismo resultado, mucho más rápido. |
| **BFS** | Búsqueda en anchura: explora un mapa casilla a casilla en «ondas» desde un punto. Sirve para saber si se puede llegar a otro. |
| **Pull Request (PR)** | Petición para fusionar tu rama en develop. Es donde otra persona revisa tu código. |
| **CI** | Integración continua: GitHub ejecuta los tests automáticamente en cada PR. |
| **localStorage** | Almacenamiento del navegador que guarda texto de forma permanente para esa web. |
| **Responsive** | Que la web se adapta y se ve bien en cualquier tamaño de pantalla. |
