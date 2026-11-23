import { useEffect } from 'react';
import Board from '../components/Board';
import { getPiece } from '../engine/board';
import { useGame } from '../state/GameContext';
import HUD from '../components/HUD';
import { getAIMove } from '../engine';

const samePos = (a, b) => a !== null && a.x === b.x && a.y === b.y;

export default function Game() {
  const { state, dispatch } = useGame();
  
   // 2.C1 + 2.C2: cuando le toca a las negras y la partida sigue, la IA juega
  // sola. La IA piensa en un Web Worker, así que la pantalla no se congela.
  useEffect(() => {
    if (state.turn !== 'black' || state.status !== 'playing') return;

    // AbortController = «botón de cancelar» del navegador. Su signal se pasa a getAIMove,
    // y al llamar a controller.abort() se termina el Worker.
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const move = await getAIMove(state, 'easy', controller.signal);
        // Si nos cancelaron mientras pensaba, no movemos nada.
        if (!controller.signal.aborted && move) dispatch({ type: 'MOVE', move });
      } catch (err) {
        // El Worker falló: lo mostramos en la consola en vez de romper la app.
        if (!controller.signal.aborted) console.error('Error en la IA:', err);
      }
    }, 400); // pausa corta para que se vea antes la jugada del jugador

    // Limpieza (cleanup): React la ejecuta si el estado cambia o si el jugador
    // sale de la partida (el componente se desmonta). Cancelamos el temporizador
    // y terminamos el Worker para que no responda a una partida que ya no existe.
    return () => {
      clearTimeout(timer);
      controller.abort();
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
