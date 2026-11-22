import { useEffect } from 'react';
import Board from '../components/Board';
import { getPiece } from '../engine/board';
import { useGame } from '../state/GameContext';
import HUD from '../components/HUD';
import { getAIMove } from '../engine';

const samePos = (a, b) => a !== null && a.x === b.x && a.y === b.y;

export default function Game() {
  const { state, dispatch } = useGame();
  
   // 2.C1: cuando le toca a las negras y la partida sigue, la IA juega sola.
  useEffect(() => {
    if (state.turn !== 'black' || state.status !== 'playing') return; //React ejecuta este codigo cada vez que cambia el estado de la partida

    let cancelled = false; // se pone a true si el componente cambia o se desmonta
    const timer = setTimeout(async () => {
      const move = await getAIMove(state, 'easy'); // esperamos la Promise. Dificultad Easy
      if (!cancelled && move) dispatch({ type: 'MOVE', move }); // si hay jugada, la enviamos al reducer. El reducer ya cambia el turno y comprueba el estado con checkStatus
    }, 400); // pausa corta para que se vea antes la jugada del jugador

    // Limpieza: si el estado cambia antes de que la IA responda, se cancela.
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state, dispatch]);


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
    <HUD>
      <Board onSquareClick={handleSquareClick} />
    </HUD>
  );
}
