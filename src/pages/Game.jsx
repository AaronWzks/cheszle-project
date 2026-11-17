import Board from '../components/Board';
import { getPiece } from '../engine/board';
import { useGame } from '../state/GameContext';

const samePos = (a, b) => a !== null && a.x === b.x && a.y === b.y;

export default function Game() {
  const { state, dispatch } = useGame();

  /**
   * (a) casilla resaltada → mueve la pieza seleccionada;
   * (b) pieza del color al que le toca → la selecciona (o la deselecciona si ya lo estaba);
   * (c) cualquier otra casilla → quita la selección.
   * @param {import('../engine/mockState.js').Position} pos
   */
  function handleSquareClick(pos) {
    const isTarget = state.highlights.some((h) => samePos(h, pos));
    const piece = getPiece(state.board, pos);

    if (isTarget) {
      dispatch({ type: 'MOVE', move: { from: state.selected, to: pos } });
    } else if (piece && piece.color === state.turn && !samePos(state.selected, pos)) {
      dispatch({ type: 'SELECT', square: pos });
    } else {
      dispatch({ type: 'DESELECT' });
    }
  }

  return (
    <main className="pantalla pantalla--centrada">
      <h1>Juego</h1>

      <Board onSquareClick={handleSquareClick} />
    </main>
  );
}
