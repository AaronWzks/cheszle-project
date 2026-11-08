# Piezas (iconos SVG)

Cada pieza del tablero se dibuja con un icono SVG propio, en lugar de letras o emojis. Así se ven igual en cualquier navegador y encajan con el sistema de diseño.

- Componente: [`src/components/Piece.jsx`](../src/components/Piece.jsx)
- Iconos: [`src/assets/pieces/`](../src/assets/pieces/)
- Test: [`src/components/Piece.test.jsx`](../src/components/Piece.test.jsx)
- Diseño: archivo de Figma del proyecto, página «Guía de estilo», hoja «Piezas (SVG)».

## Cómo se llaman los archivos

Los archivos se llaman **`color-tipo.svg`**, en inglés y en minúsculas, igual que los valores `color` y `type` del estado de la partida (ver [`estado.md`](./estado.md)). Así el componente encuentra el icono sin tablas de traducción.

| `type` | `white` | `black` |
|---|---|---|
| `king` (rey) | `white-king.svg` | `black-king.svg` |
| `queen` (dama) | `white-queen.svg` | `black-queen.svg` |
| `rook` (torre) | `white-rook.svg` | `black-rook.svg` |
| `bishop` (alfil) | `white-bishop.svg` | `black-bishop.svg` |
| `knight` (caballo) | `white-knight.svg` | `black-knight.svg` |
| `pawn` (peón) | `white-pawn.svg` | `black-pawn.svg` |

Reglas para los nombres: todo en minúsculas, sin tildes ni espacios y siempre primero el color y después la pieza. Linux (el CI de GitHub y Vercel) distingue mayúsculas de minúsculas, y un nombre mal puesto funciona en Windows pero falla al publicar.

## Cómo se usa

```jsx
import Piece from '../components/Piece';

{piece && <Piece type={piece.type} color={piece.color} />}
```

`Piece` recibe los mismos `type` y `color` que tiene cada pieza en `board` (por ejemplo `{ id: 'w-king', type: 'king', color: 'white' }`) y devuelve una imagen con la clase `pieza`.

- Si falta el icono, no pinta nada y la aplicación no se rompe.
- El texto alternativo (`alt`) está en castellano («Rey blanco»), para lectores de pantalla.
- Se usa dentro de `Square`, una vez por casilla con pieza.

## Estilo de los iconos

Todos los iconos comparten el mismo diseño para que se vean como una familia:

| | |
|---|---|
| Tamaño del lienzo | 64 × 64 px (`viewBox="0 0 64 64"`) |
| Base | Todas llevan la misma peana (rectángulo redondeado abajo) |
| Pieza blanca | Relleno `#FFFFFF` y contorno `#123A57` |
| Pieza negra | Relleno `#141414`, contorno exterior `#0B2A40` y línea clara fina `#E9EEF2` |
| Línea | Trazo de 2,5 px con esquinas redondeadas |

El contorno es necesario: una pieza blanca sin contorno sobre una casilla clara tiene un contraste de solo 1,37:1 y casi desaparece. Con contorno se ve bien tanto en casilla clara (`#F0D9B5`) como en oscura (`#B58863`).

## Tamaño en pantalla

El tamaño lo marca el CSS (`src/styles/estilos.css`), no el SVG:

```css
.casilla .pieza { width: 100%; height: 100%; pointer-events: none; }
```

- El margen de aire alrededor de la pieza ya está dibujado dentro del SVG, por eso la imagen ocupa el 100 % de la casilla.
- `pointer-events: none` hace que el clic llegue a la casilla y no a la imagen.
- La casilla mide `--casilla`: 52 px en ordenador y `calc((100vw - 48px) / 8)` en móvil (unos 39 px a 360 px de ancho).

## Cómo añadir una pieza nueva

1. Diséñala en Figma, en un marco de 64 × 64 px, con el mismo estilo y la misma peana. Si es una pieza nueva (no clásica), debe distinguirse de un vistazo de las clásicas con una forma distinta y, además, un detalle de color; no vale solo el color, por el daltonismo.
2. Convierte los trazos en formas (*Outline stroke*) y exporta el SVG en los dos colores, con el nombre `color-tipo.svg`.
3. Guarda los archivos en `src/assets/pieces/`.
4. Añade el nombre en español en `NOMBRE_VISIBLE` de `Piece.jsx` (se usa en el `alt`).
5. Añade el tipo a `PieceType` en `src/engine/mockState.js` y a la lista de `src/engine/levels.test.js`.
6. En `Piece.test.jsx`, añade el tipo a `TIPOS` y sube el número esperado de iconos distintos (ahora 12).
7. Ejecuta `npx vitest run` y `npm run lint`.

## Detalles técnicos

- Los iconos se cargan todos de una vez con `import.meta.glob` de Vite, así que no hay que importarlos uno a uno.
- Vite convierte los SVG pequeños en datos incrustados (`data:image/svg+xml`) en lugar de enlazar el archivo. Por eso el test no comprueba el nombre del archivo en `src`, sino que cada pieza tenga imagen y que no haya dos iguales.
