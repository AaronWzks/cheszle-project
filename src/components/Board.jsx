import { useGame } from '../state/GameContext';
import Square from './Square';
import styles from './Board.module.css';

/**
 * Dibuja el tablero del estado compartido, con y = 0 arriba.
 * @param {object} props
 * @param {(pos: import('../engine/mockState.js').Position) => void} props.onSquareClick
 */
export default function Board({ onSquareClick }) {
  const { state } = useGame();

  //Saca la ultima jugada del estado
  //?? null significa "si no existe, usa null". 
  // Es una protección por si algún test crea un estado sin ese campo.
  const lastMove = state.lastMove ?? null; 

  return (
    <div
      className={styles.board}
      role="group"
      aria-label="Tablero de ajedrez"
      style={{
        gridTemplateColumns: `repeat(${state.board[0].length}, var(--casilla))`,
      }}
    >
      {state.board.map((fila, y) =>
        fila.map((piece, x) => {
          const isHighlighted = state.highlights.some((pos) => pos.x === x && pos.y === y);

          const isSelected =
            state.selected !== null && state.selected.x === x && state.selected.y === y;

          const isTarget =
            state.objective.type === 'reachSquare' &&
            state.objective.target.x === x &&
            state.objective.target.y === y;

          // ¿esta casilla es el origen de la última jugada?
          //isLastFrom es true solo en la casilla de donde salió la pieza,
          const isLastFrom = lastMove !== null && lastMove.from.x === x && lastMove.from.y === y;

          // ¿esta casilla es el destino de la última jugada?
          //isLastTo solo en la casilla a la que llegó.
          const isLastTo = lastMove !== null && lastMove.to.x === x && lastMove.to.y === y;

          return (
            <Square
              key={`${x}-${y}`}
              x={x}
              y={y}
              piece={piece}
              isHighlighted={isHighlighted}
              isSelected={isSelected}
              isTarget={isTarget}
              isLastMove={isLastFrom || isLastTo}   //es true si la casilla es el origen o (||) el destino. La usaremos para pintarlas de amarillo suave.                
              moveFrom={isLastTo ? lastMove.from : null}  //solo tiene valor en la casilla de destino: le dice de qué casilla viene la pieza. En las demás casillas vale null.      
              onClick={() => onSquareClick({ x, y })}
            />
          );
        }),
      )}
    </div>
  );
}
