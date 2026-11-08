# Estado de la partida (`GameState`)

El **estado** es un objeto que contiene todo lo necesario para saber cómo va una partida en un momento dado. Todos (motor, reducer, componentes, IA) usan esta misma forma y estos mismos nombres.

- Ejemplo en código: [`src/engine/mockState.js`](../src/engine/mockState.js) (`MOCK_STATE` y `createMockState()`).
- Funciones que lo crean y lo transforman: [`src/engine/index.js`](../src/engine/index.js).

## Ejemplo

```js
const GameState = {
  levelId: 'easy-1',
  board: [[null, ...], ...],   // matriz [y][x]
  obstacles: [{ x: 3, y: 4 }],
  turn: 'white',
  objective: { type: 'reachSquare', target: { x: 4, y: 7 } },
  moveCount: 0,
  maxMoves: 20,
  history: [],
  status: 'playing',
};
```

## Campos

| Campo | Tipo | Qué es |
|---|---|---|
| `levelId` | `string` | Id del nivel que se está jugando; coincide con el `id` de `levels.json`. |
| `board` | `(Piece \| null)[][]` | El tablero como matriz `board[y][x]`. `y = 0` es la primera fila. Cada casilla es `null` (vacía) o una pieza. |
| `obstacles` | `{ x, y }[]` | Casillas bloqueadas: ninguna pieza puede pararse en ellas ni atravesarlas (salvo el caballo, que salta). |
| `turn` | `'white' \| 'black'` | A quién le toca mover. `white` es siempre el jugador y `black` la IA. |
| `objective` | `Objective` | Qué tiene que conseguir el jugador para ganar el nivel (ver abajo). |
| `moveCount` | `number` | Jugadas hechas por el jugador (solo cuentan las blancas). |
| `maxMoves` | `number` | Límite de jugadas del nivel; si `moveCount` lo supera, el jugador pierde. |
| `history` | `{ from, to }[]` | Todas las jugadas hechas, en orden. Sirve para resaltar la última jugada y para depurar. |
| `status` | `'playing' \| 'won' \| 'lost'` | Cómo va la partida. Lo calcula `checkStatus(state)` tras cada jugada. |

### Pieza (`Piece`)

```js
{ id: 'w-king', type: 'king', color: 'white' }
```

| Campo | Qué es |
|---|---|
| `id` | Identificador único de la pieza en la partida (útil como `key` de React y para animaciones). |
| `type` | Tipo de pieza: `king`, `queen`, `rook`, `bishop`, `knight`, `pawn`. |
| `color` | `white` o `black`. |

### Objetivo (`Objective`)

| `type` | Campos extra | Se cumple cuando… |
|---|---|---|
| `reachSquare` | `target: { x, y }` | El rey blanco llega a la casilla `target`. |
| `checkmate` | — | Las negras quedan en jaque mate. |

## Campos que añade la interfaz

El reducer (`src/state/gameReducer.js`) guarda además algunos datos que solo importan a la UI. No forman parte del motor:

| Campo | Qué es |
|---|---|
| `selected` | Casilla seleccionada por el jugador, o `null`. |
| `highlights` | Casillas a las que puede moverse la pieza seleccionada. |

## Reglas

- **Nunca se modifica el estado**: cada función devuelve un objeto nuevo (`{ ...state, campo: valor }`).
- **Solo datos simples** (objetos, arrays, strings, números): nada de funciones ni clases, porque el estado se envía al Web Worker de la IA.
