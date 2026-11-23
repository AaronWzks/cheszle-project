import { useEffect } from 'react';
import Board from '../components/Board';
import { getPiece } from '../engine/board';
import { useGame } from '../state/GameContext';
import HUD from '../components/HUD';
import AIThinking from '../components/AIThinking';
import { getAIMove } from '../engine';

const samePos = (a, b) => a !== null && a.x === b.x && a.y === b.y;

export default function Game() {
  const { state, dispatch } = useGame();

  // 2.C3: dificultad de la IA. Cuando exista la pantalla de selección (2.C4)
  // vendrá en el estado; mientras tanto, fácil.
  // Para probar otra dificultad, cambia 'easy' por 'medium' o 'hard'.
  const difficulty = state.difficulty ?? 'hard';

  // 2.C1 + 2.C2 + 2.C3: cuando la IA tiene que pensar (aiThinking), juega sola.
  // La IA piensa en un Web Worker, así que la pantalla no se congela.
  // El reducer pone aiThinking a true en cuanto el jugador mueve y le toca a
  // las negras, y a false cuando las negras mueven.
  useEffect(() => {
    if (!state.aiThinking) return;

    // AbortController = «botón de cancelar» del navegador. Su signal se pasa a getAIMove,
    // y al llamar a controller.abort() se termina el Worker.
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const move = await getAIMove(state, difficulty, controller.signal);
        if (controller.signal.aborted) return; // nos cancelaron mientras pensaba

        if (move) {
          dispatch({ type: 'MOVE', move }); // MOVE ya pone aiThinking a false
        } else {
          // La IA no tiene jugadas: quitamos el indicador para no bloquear el tablero.
          dispatch({ type: 'SET_AI_THINKING', value: false });
        }
      } catch (err) {
        // El Worker falló: lo mostramos en la consola en vez de romper la app
        // y quitamos el indicador para que la pantalla no se quede bloqueada.
        if (!controller.signal.aborted) {
          console.error('Error en la IA:', err);
          dispatch({ type: 'SET_AI_THINKING', value: false });
        }
      }
    }, 400); // pausa corta para que se vea antes la jugada del jugador

    // Limpieza (cleanup): React la ejecuta si el estado cambia o si el jugador
    // sale de la partida (el componente se desmonta). Cancelamos el temporizador
    // y terminamos el Worker para que no responda a una partida que ya no existe.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [state, difficulty, dispatch]);

  /**
   * (a) casilla resaltada → mueve la pieza seleccionada;
   * (b) pieza del color al que le toca → la selecciona (o la deselecciona si ya lo estaba);
   * (c) cualquier otra casilla → quita la selección.
   * 2.C3: si la IA está pensando, no hace nada.
   * @param {import('../engine/mockState.js').Position} pos
   */
  function handleSquareClick(pos) {
    // 2.C3: mientras la IA piensa no se hace caso a los clics (ni al teclado).
    if (state.aiThinking) return;

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
      {/* 2.C3: indicador visible solo mientras la IA piensa */}
      <AIThinking visible={state.aiThinking} />
      <Board onSquareClick={handleSquareClick} disabled={state.aiThinking} />
    </HUD>
  );
}