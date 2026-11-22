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

  const onClick = props.onClick;

  let colorClass = styles.dark;

  if ((x + y) % 2 === 0) {
    colorClass = styles.light;
  }

  const classes = [styles.square, colorClass];

  if (isHighlighted) {
    // Casilla vacía: punto en el centro. Con pieza (enemiga): anillo de captura.
    classes.push(piece !== null ? styles.capture : styles.highlighted);
  }

  if (isSelected) {
    classes.push(styles.selected);
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <span className={styles.coordinates}>
        Casilla ({x}, {y})
      </span>

      {piece !== null && (
        <Piece type={piece.type} color={piece.color} />
      )}
    </button>
  );
}