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

          return (
            <Square
              key={`${x}-${y}`}
              x={x}
              y={y}
              piece={piece}
              isHighlighted={isHighlighted}
              isSelected={isSelected}
              isTarget={isTarget}
              onClick={() => onSquareClick({ x, y })}
            />
          );
        }),
      )}
    </div>
  );
}
