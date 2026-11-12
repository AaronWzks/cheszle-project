# Lógica del tablero: tarea 1.A1

`src/engine/board.js` contiene las seis funciones auxiliares del tablero. Utiliza
JavaScript puro y la representación acordada en [estado.md](estado.md).

## Representación y alcance

El tablero es una matriz rectangular: `board[y][x]`. `width` indica columnas y
`height`, filas. Los índices empiezan en cero y `y = 0` es la fila de arriba.
Cada casilla contiene `null` o una pieza `{ id, type, color }`.

```js
const board = createBoard(3, 2);
// [
//   [null, null, null], // fila y = 0
//   [null, null, null], // fila y = 1
// ]
// La última casilla es board[1][2].
```

Estas funciones reciben y devuelven tableros, piezas o posiciones. El estado
completo de la partida, los turnos y el historial pertenecen a `engine/index.js`.
Las reglas comprueban después qué movimientos permite el ajedrez. Los obstáculos
continúan en `state.obstacles`, separados de las piezas.

## 1. createBoard(width, height)

Devuelve una matriz nueva con todas sus casillas vacías. Ambas dimensiones deben
ser números enteros mayores que cero; si no lo son, lanza `RangeError`.

```js
return Array.from({ length: height }, () => Array(width).fill(null));
```

`Array.from` construye el array de filas. Su segundo argumento es una función
que se ejecuta una vez por fila. `Array(width).fill(null)` crea una fila de
`width` casillas vacías. La función crea un array nuevo en cada ejecución, de modo
que las filas son independientes.

La función flecha `() => expresión` devuelve el resultado de esa expresión.
No hay que confundirlo con rellenar todas las filas con el mismo array:
`Array(height).fill(Array(width).fill(null))` compartiría una única fila.

`Number.isInteger` rechaza decimales, cadenas, `NaN` e infinitos. `!` niega una
condición y `||` significa «o». El error evita crear tableros con tamaños
distintos de los solicitados por conversiones implícitas de JavaScript.

## 2. isInside(board, { x, y })

Devuelve `true` únicamente para coordenadas enteras dentro de los límites.
Extraer `{ x, y }` del parámetro se llama desestructuración: recibimos un objeto
de posición y usamos sus dos propiedades directamente.

```js
isInside(board, { x: 2, y: 1 }); // true en un tablero 3 × 2
isInside(board, { x: 3, y: 1 }); // false: las columnas van de 0 a 2
isInside(board, { x: 1.5, y: 0 }); // false: no existe media casilla
```

`&&` significa «y». JavaScript evalúa de izquierda a derecha y deja de evaluar
en cuanto encuentra una condición falsa. En un tablero `[]`, ningún `y` válido
supera la comprobación `y < board.length`; por eso no se accede a `board[0]`.
La función presupone una matriz rectangular válida, como la de `createBoard`.

## 3. getPiece(board, pos)

Consulta una casilla. Devuelve su pieza o `null` si está vacía o fuera del tablero.

```js
if (isInside(board, pos)) {
  return board[pos.y][pos.x];
} else {
  return null;
}
```

El `if` comprueba que la posición esté dentro del tablero. Si lo está, devuelve
el contenido de la casilla. El `else` devuelve `null` cuando la posición está
fuera, evitando acceder a una casilla inexistente.

Devolver `null` para una consulta fuera del tablero facilita recorrer direcciones
en las reglas. Si hace falta distinguir «vacía» de «fuera», se usa `isInside`.

## 4. setPiece(board, pos, piece)

Coloca una pieza, sustituye la anterior o vacía la casilla con `piece = null`.
Devuelve un tablero nuevo y conserva el recibido. Una posición inválida lanza
`RangeError`: escribir fuera del tablero suele indicar un error del programa.

```js
const copy = board.map((fila) => [...fila]);
copy[pos.y][pos.x] = piece;
return copy;
```

`map` recorre las filas y construye un array nuevo con los resultados.
`fila` es el nombre del parámetro que recibe cada fila del tablero.
`[...fila]` crea un array nuevo con sus elementos. Así se copian tanto el array
exterior como cada fila. Solo copiar el exterior con `[...board]` mantendría
compartidas las filas y modificaría el tablero original al escribir.

`const` impide reasignar la variable; permite cambiar el contenido del array.
Escribir en esta copia recién creada respeta la inmutabilidad del tablero de entrada.

## 5. movePiece(board, from, to)

Valida las dos posiciones, comprueba que haya una pieza en el origen y hace una
sola copia del tablero. Una posición inválida lanza `RangeError`; un origen vacío,
`Error`. Los errores se detectan antes de efectuar el traslado.

```js
const copy = board.map((row) => [...row]);
copy[from.y][from.x] = null;
copy[to.y][to.x] = piece;
return copy;
```

La pieza se guarda en una variable antes de vaciar el origen. Después se escribe
en el destino, sustituyendo la pieza que pudiera haber allí. Ese es el mecanismo
que permite una captura; comprobar si esa captura es legal corresponde a las reglas.

El orden importa: vaciar primero y colocar después conserva la pieza cuando
origen y destino coinciden. En ese caso también se devuelve un tablero nuevo.
Aceptar ese caso en la utilidad no implica que sea una jugada legal.

Copiar directamente una vez evita las dos copias de la composición
`setPiece(setPiece(board, from, null), to, piece)` y deja visibles los dos pasos.

## 6. findPiece(board, predicate)

Busca la primera pieza que cumpla una condición. Recorre las filas de arriba
abajo y cada fila de izquierda a derecha. Devuelve `{ x, y, piece }` o `null`.
Las casillas vacías se omiten.

```js
const king = findPiece(board, (piece) => piece.type === 'king' && piece.color === 'white');
```

`predicate` es una función recibida como argumento. En este ejemplo devuelve
`true` para el rey blanco. Al invocar `predicate(piece)` la búsqueda ejecuta
esa comprobación sobre cada pieza.

`{ x, y, piece }` abrevia `{ x: x, y: y, piece: piece }`. El formato permite usar
`king.x` y `king.y`, como prevé el ejemplo de objetivos de `plan.md`.

## Inmutabilidad y objetos pieza

Se copian los arrays, pero las piezas siguen siendo los mismos objetos. Las
funciones nunca cambian sus propiedades. Quien utilice el módulo debe tratarlas
también como inmutables; `getPiece` y `findPiece` devuelven referencias a las piezas.
Si en el futuro una pieza necesita cambiar, se creará otro objeto para sustituirla.

```js
const empty = createBoard(3, 2);
const king = { id: 'w-king', type: 'king', color: 'white' };
const placed = setPiece(empty, { x: 1, y: 0 }, king);
const moved = movePiece(placed, { x: 1, y: 0 }, { x: 1, y: 1 });

getPiece(empty, { x: 1, y: 0 }); // null: empty sigue vacío
getPiece(placed, { x: 1, y: 0 }); // king: placed conserva su pieza
getPiece(moved, { x: 1, y: 0 }); // null: se vació el origen en moved
getPiece(moved, { x: 1, y: 1 }); // king: nuevo destino en moved
```

## Pruebas

Los tests están en `src/engine/board.test.js`. Comprueban las seis funciones,
los límites y errores, las capturas, las búsquedas y que colocar o mover conserva
el tablero original. Se utiliza un tablero rectangular para detectar confusiones
entre filas y columnas.

Desde la raíz del proyecto:

```bash
npm test -- --run src/engine/board.test.js
npm test -- --run
npm run lint
```

`--run` ejecuta los tests una vez y termina. Sin esa opción, `npm test` utiliza
el modo de vigilancia de Vitest.

El módulo proporciona las utilidades de la tarea 1.A1. Su integración con las
funciones provisionales de `engine/index.js` se hará cuando corresponda; añadir
estas utilidades todavía no cambia lo que aparece en la pantalla del juego.