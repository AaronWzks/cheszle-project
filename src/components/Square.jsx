import Piece from './Piece';
import styles from './Square.module.css';

/**
 * Dibuja una casilla y comunica su pulsación mediante onClick.
 * @param {object} props
 * @param {number} props.x Columna, empezando en cero.
 * @param {number} props.y Fila, empezando en cero por arriba.
 * @param {import('../engine/mockState.js').Piece | null} props.piece
 * @param {boolean} [props.isHighlighted=false] Es un destino resaltado.
 * @param {boolean} [props.isSelected=false] Es la casilla seleccionada.
 * @param {boolean} [props.isTarget=false] Es la casilla objetivo del nivel.
 * @param {boolean} [props.isLastMove=false] Es el origen o el destino de la última jugada.
 * @param {import('../engine/mockState.js').Position | null} [props.moveFrom=null]
 *   Si la pieza acaba de llegar aquí, casilla desde la que viene (para animarla).
 * @param {() => void} props.onClick Función que se ejecuta al pulsar.
 */
export default function Square(props) {
  const x = props.x;
  const y = props.y;
  const piece = props.piece;

  let isHighlighted = props.isHighlighted;
  if (isHighlighted === undefined) {
    isHighlighted = false;
  }

  let isSelected = props.isSelected;
  if (isSelected === undefined) {
    isSelected = false;
  }

  // DE AARÓN
  let isTarget = props.isTarget;

  if (isTarget === undefined) {
    isTarget = false;
  }

  //Leemos las dos props nuevas. === true hace que, si no nos la pasan, valga false.
  const isLastMove = props.isLastMove === true;
  const moveFrom = props.moveFrom ?? null;

  const onClick = props.onClick;

  let colorClass = styles.dark;

  if ((x + y) % 2 === 0) {
    colorClass = styles.light;
  }

  const classes = [styles.square, colorClass];
  if (isTarget) {
    classes.push(styles.target);
  }

  if (isHighlighted) {
    // Casilla vacía: punto en el centro. Con pieza (enemiga): anillo de captura.
    classes.push(piece !== null ? styles.capture : styles.highlighted);
  }

  //classes es una lista con las clases CSS de la casilla.
  //Si es origen o destino de la última jugada, le añadimos (push) la clase lastMove
  if (isLastMove) {
    classes.push(styles.lastMove);
  }

  if (isSelected) {
    classes.push(styles.selected);
  }

  return (
    <button type="button" className={classes.join(' ')} aria-pressed={isSelected} onClick={onClick}>
      <span className={styles.coordinates}>
        Casilla ({x}, {y}){isTarget && ' — Casilla objetivo'}
      </span>

      {/* DE AARÓN: estrella en la casilla objetivo */}
      {isTarget && (
        <span className={styles.targetMarker} aria-hidden="true">
          ★
        </span>
      )}

      {piece !== null && (
        <Piece
          // Clave nueva en cada jugada que llega aquí: React vuelve a montar la
          // pieza y la animación se repite (también al capturar).
          key={moveFrom !== null ? `${moveFrom.x}-${moveFrom.y}` : 'quieta'}
          type={piece.type}
          color={piece.color}
          //offset: el cálculo del desplazamiento. Es una resta: la casilla de origen menos la casilla actual.
          //dx = 0 − 0 = 0, sin desplazamiento horizontal.
          //dy = 7 − 3 = 4, cuatro casillas hacia abajo.
          offset={moveFrom !== null ? { dx: moveFrom.x - x, dy: moveFrom.y - y } : null}
        />
      )}
    </button>
  );
}