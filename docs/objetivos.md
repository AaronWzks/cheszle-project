# Objetivos de los niveles

Cada nivel tiene un objetivo, definido en `state.objective`. El campo `type` indica qué comprobación debe ejecutar el motor. Actualmente existen dos tipos: `reachSquare` y `checkmate`.

El jugador gana al cumplir el objetivo elegido para ese nivel. Tener ambos tipos disponibles en el código no significa que los dos sean formas de victoria en todas las partidas.

## Tipos de objetivo

### reachSquare

El rey blanco debe llegar a la casilla indicada por `target`:

```json
{
  "type": "reachSquare",
  "target": { "x": 4, "y": 7 }
}
```

Las coordenadas utilizan la misma organización que el tablero: `board[y][x]`. `x` es la columna e `y` la fila, ambas empezando en cero; `y = 0` está arriba.

La función `reachSquare` de [objectives.js](../src/engine/objectives.js) utiliza `findPiece` para localizar al rey blanco. Devuelve `true` si sus dos coordenadas coinciden con el destino y `false` en caso contrario. Si no existe rey blanco, también devuelve `false`.

Que llegue el rey negro u otra pieza blanca no cumple este objetivo.

### checkmate

El jugador debe dar jaque mate a las negras:

```json
{
  "type": "checkmate"
}
```

Este objetivo no necesita `target`. La función `checkmate` llama a `isCheckmate(state, 'black')`, de [rules.js](../src/engine/rules.js).

Se cumple cuando el rey negro está en jaque y las negras no tienen ninguna jugada legal para resolverlo. Un jaque con defensa posible o un ahogado no cumplen el objetivo. Si no existe rey negro, la comprobación devuelve `false`.

## Selección de la comprobación

`isObjectiveMet(state)` lee `state.objective.type` y busca su función en el registro `OBJECTIVES`:

```js
const OBJECTIVES = {
  reachSquare: reachSquare,
  checkmate: checkmate,
};
```

El registro guarda las funciones sin ejecutarlas. `isObjectiveMet` selecciona una, le pasa el estado y devuelve su resultado booleano. Estas comprobaciones no modifican el estado recibido.

Si el tipo no está registrado, lanza un `RangeError` para detectar un objetivo desconocido.

## Resultado de la partida

`checkStatus(state)`, en [engine/index.js](../src/engine/index.js), aplica este orden:

1. Devuelve `won` si el objetivo está cumplido.
2. En turno blanco, devuelve `lost` si el jugador está en mate o no tiene ninguna jugada legal.
3. Devuelve `lost` si `moveCount > maxMoves`, independientemente del turno.
4. En los demás casos devuelve `playing`.

El objetivo cumplido tiene prioridad sobre las comprobaciones de derrota. La falta de movimientos de las blancas se evalúa cuando les toca mover.

Solo se cuentan las jugadas del jugador, que utiliza las blancas. Con la regla actual, alcanzar exactamente `maxMoves` no provoca por sí solo una derrota: el contador debe superarlo.

El [reducer](../src/state/gameReducer.js) calcula el resultado después de aplicar cada acción `MOVE` y lo guarda en `state.status`. Los campos del estado se describen en [estado.md](estado.md).

## Presentación en el HUD

El [HUD](../src/components/HUD.jsx) convierte el objetivo en una instrucción mediante `getObjectiveText`:

| Tipo | Texto mostrado |
| --- | --- |
| `reachSquare` | Lleva al rey a la casilla marcada |
| `checkmate` | Da jaque mate a las negras. |

Para `reachSquare`, el tablero identifica la casilla de destino con fondo verde y una estrella centrada. La pieza puede dibujarse encima de la estrella.

El contador muestra `Movimientos restantes`, calculados con `Math.max(0, state.maxMoves - state.moveCount)`. Este cálculo evita números negativos en pantalla; no modifica las condiciones de victoria o derrota.

## Cómo añadir un objetivo nuevo

1. Definir qué debe conseguir el jugador y qué datos necesita el objetivo.
2. Añadir en `objectives.js` una función que reciba el estado, devuelva `true` o `false` y no lo modifique.
3. Registrar el nombre del nuevo tipo y su función en `OBJECTIVES`.
4. Actualizar la definición JSDoc de `Objective` en [mockState.js](../src/engine/mockState.js) para documentar su forma.
5. Ampliar `getObjectiveText` en `HUD.jsx` para mostrar una instrucción propia del nuevo tipo. Actualmente trata `reachSquare` y utiliza el otro caso para `checkmate`.
6. Actualizar `OBJECTIVE_TYPES` y la comprobación de los campos necesarios en [levels.test.js](../src/engine/levels.test.js). Los niveles se definen según [niveles.md](niveles.md).
7. Añadir pruebas de objetivo cumplido y no cumplido, además de la prueba de su texto en el HUD.
8. Actualizar este documento y ejecutar las pruebas del proyecto.

Añadir una entrada al registro conecta la comprobación al motor, pero el tipo, su presentación y sus pruebas también deben contemplar el nuevo objetivo.

## Pruebas

- [objectives.test.js](../src/engine/objectives.test.js): posiciones preparadas a mano para ambos objetivos, ausencia de reyes, casos que no cumplen el objetivo y tipo desconocido.
- [index.test.js](../src/engine/index.test.js): resultados `won`, `lost` y `playing`, límites y prioridad de las comprobaciones.
- [gameReducer.test.js](../src/state/gameReducer.test.js): actualización del resultado después de una jugada.
- [HUD.test.jsx](../src/components/HUD.test.jsx): texto que corresponde a cada uno de los dos tipos de objetivo.

Para ejecutar todas las pruebas y comprobar el código:

```bash
npm test -- --run
npm run lint
```