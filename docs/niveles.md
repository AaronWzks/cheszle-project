# Niveles (`levels.json`)

Los niveles del juego se definen como datos en [`src/engine/levels.json`](../src/engine/levels.json), así se pueden añadir o cambiar sin tocar código. El archivo es una lista con un objeto por nivel, y en la Fase 1 `createGame(levelId)` convertirá cada uno en un [`GameState`](estado.md).

## Ejemplo

```json
{
  "id": "easy-1",
  "name": "Primer paso",
  "difficulty": "easy",
  "size": { "width": 8, "height": 8 },
  "objective": { "type": "reachSquare", "target": { "x": 4, "y": 7 } },
  "pieces": [
    { "id": "w-king", "type": "king", "color": "white", "x": 4, "y": 0 },
    { "id": "b-rook-1", "type": "rook", "color": "black", "x": 0, "y": 5 }
  ],
  "obstacles": { "count": 3 },
  "maxMoves": 20
}
```

## Campos

| Campo | Tipo | Qué es |
|---|---|---|
| `id` | `string` | Identificador único del nivel, con la forma `dificultad-número`. Pasa a ser `levelId` en el estado y aparece en la URL (`/play/easy-1`). |
| `name` | `string` | Nombre que se muestra al jugador. |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | Sección en la que aparece el nivel en la pantalla de selección. |
| `size` | `{ width, height }` | Tamaño del tablero en casillas. |
| `objective` | `Objective` | Qué tiene que conseguir el jugador. Se copia tal cual al estado (ver [estado.md](estado.md#objetivo-objective)). |
| `pieces` | `LevelPiece[]` | Piezas de la posición inicial (ver abajo). |
| `obstacles` | `{ count }` | Cuántas casillas bloqueadas se generan al azar en cada partida. |
| `maxMoves` | `number` | Límite de jugadas del jugador. Se copia tal cual al estado. |

### Pieza del nivel (`LevelPiece`)

| Campo | Qué es |
|---|---|
| `id` | Identificador único de la pieza dentro del nivel, por ejemplo `w-king` o `b-rook-1`. |
| `type` | Tipo de pieza: `king`, `queen`, `rook`, `bishop`, `knight`, `pawn`. |
| `color` | `white` (jugador) o `black` (IA). |
| `x`, `y` | Casilla inicial. `y = 0` es la primera fila del tablero. |

## Del nivel al estado

| En el nivel | En el `GameState` |
|---|---|
| `id` | `levelId` |
| `size` y `pieces` | `board`: matriz `[y][x]` donde cada pieza guarda `id`, `type` y `color` |
| `objective` | `objective` |
| `obstacles.count` | `obstacles`: lista de casillas `{ x, y }` elegidas al azar |
| `maxMoves` | `maxMoves` |

El resto del estado empieza siempre igual: `turn: 'white'`, `moveCount: 0`, `history: []` y `status: 'playing'`.

## Cómo añadir un nivel

1. Añade un objeto a la lista de `levels.json` con todos los campos anteriores.
2. Ejecuta `npm test`: [`levels.test.js`](../src/engine/levels.test.js) comprueba cada nivel (ids sin repetir, piezas dentro del tablero, rey blanco presente y objetivo válido).
