# Tablero visual: tarea 1.A2

## Archivos

- `src/components/Square.jsx`: representa una casilla mediante un botón.
- `src/components/Square.module.css`: colores, piezas, selección, resaltado y foco.
- `src/components/Board.jsx`: lee el estado y dibuja todas las casillas.
- `src/components/Board.module.css`: coloca las casillas con CSS Grid.
- `src/pages/Game.jsx`: muestra el tablero y recibe sus clics.

## Datos y dependencias

`GameProvider` ya envuelve la aplicación en `main.jsx`. `Board` lee `state.board`,
`state.selected` y `state.highlights` mediante `useGame()`. El Provider garantiza
un estado inicial con un tablero rectangular y los campos de selección y resaltado.

Cada casilla contiene `null` o una pieza `{ id, type, color }`. La posición se
mantiene como `board[y][x]`, con la fila `y = 0` arriba. `Piece`, ya existente,
muestra los SVG del equipo; las reglas de movimiento no son necesarias para dibujarlos.

## Square y las props

Un componente React es una función que devuelve JSX, una sintaxis que describe
los elementos de la interfaz. React lo utiliza para construir y actualizar la pantalla.

`Square` recibe un objeto de propiedades, llamado props, con `x`, `y`, `piece`,
`isHighlighted`, `isSelected` y `onClick`. La desestructuración permite usar esos
nombres directamente. Los dos indicadores tienen `false` como valor predeterminado.

La casilla es clara cuando `(x + y) % 2 === 0`; las demás son oscuras. Las clases
se guardan en un array y `join(' ')` las convierte en el texto de `className`.

`piece !== null && <Piece ... />` muestra el componente de la pieza cuando la
casilla está ocupada. Si está vacía, React no dibuja ese elemento.

Se usa un botón nativo para permitir clic, Enter y espacio. El texto de coordenadas
se oculta visualmente y sigue disponible para lectores de pantalla, junto con el
texto alternativo de `Piece`. `aria-pressed` comunica si la casilla está seleccionada.

## Board y los clics

Los dos `map` recorren las filas y sus casillas. Sus índices proporcionan `y` y `x`.
En esta ocasión se generan componentes `Square`, sin modificar la matriz del motor.
La propiedad `key` identifica cada casilla por sus coordenadas para React.

`some` devuelve `true` cuando encuentra la posición entre los destinos resaltados.
La selección se comprueba comparando ambas coordenadas con `state.selected`.

El recorrido del clic es:

1. El usuario pulsa el botón de `Square`.
2. React ejecuta su prop `onClick`.
3. La función `() => onSquareClick({ x, y })` entrega las coordenadas a quien usa Board.
4. En esta tarea, `handleSquareClick` de `Game.jsx` las muestra en la consola.

Se entrega la función sin ejecutarla durante el dibujo. Las piezas todavía no se
mueven al pulsar; la selección y aplicación de jugadas pertenecen a la tarea 1.B3.

## Estilos

Los archivos `.module.css` se importan como `styles`. Vite genera nombres de clase
locales para evitar interferencias con otros componentes.

Se utilizan los tokens existentes: `--casilla`, `--casilla-clara`, `--casilla-oscura`,
`--borde-tablero`, `--azul-mov` y los colores de texto y foco del equipo.
`--casilla` ya se adapta a móvil en `estilos.css`. El ejemplo del PDF utiliza
`--square-size`, pero ese nombre no existe en los estilos actuales del proyecto.

CSS Grid obtiene el número de columnas del tablero. Las imágenes se dimensionan
desde el módulo de Square, porque el selector global `.casilla .pieza` utiliza
una clase distinta.

## Comprobación manual

1. Ejecutar `npm run dev` y abrir `/game`.
2. Comprobar las 64 casillas de colores alternos y los SVG del nivel de ejemplo.
3. Abrir la consola del navegador y pulsar distintas casillas.
4. Comprobar que se muestra `{ x, y }`, conservando `y = 0` arriba.
5. Usar Tab y Enter o espacio para comprobar el foco y la activación por teclado.
6. Reducir el ancho de la ventana para comprobar el tamaño de las casillas.

La tarea 1.A3 añadirá `Board.test.jsx` para comprobar el número de casillas y los
clics de forma automatizada con `GameProvider` y un estado conocido.