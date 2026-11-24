import { useEffect, useState } from 'react';
import Board from '../components/Board';
import { getPiece } from '../engine/board';
import { useGame } from '../state/GameContext';
import HUD from '../components/HUD';
import AIThinking from '../components/AIThinking';
import { getAIMove, isCheckmate, hasAnyLegalMove } from '../engine';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import levels from '../engine/levels.json';

const samePos = (a, b) => a !== null && a.x === b.x && a.y === b.y;

/**
 * Devuelve el id del siguiente nivel según el orden del catálogo.
 * @param {string} levelId
 * @returns {string | null} null si no existe un nivel posterior.
 */
function getNextLevelId(levelId) {
  for (let index = 0; index < levels.length - 1; index += 1) {
    if (levels[index].id === levelId) {
      return levels[index + 1].id;
    }
  }

  return null;
}

/**
 * Describe la derrota respetando las comprobaciones de checkStatus.
 * @param {import('../engine/mockState.js').GameState} state
 * @returns {string}
 */
function getDefeatReason(state) {
  if (state.turn === 'white') {
    if (isCheckmate(state, 'white')) {
      return 'Tu rey está en jaque mate.';
    }

    if (!hasAnyLegalMove(state, 'white')) {
      return 'No tienes movimientos legales.';
    }
  }

  if (state.moveCount > state.maxMoves) {
    return 'Has superado el límite de jugadas.';
  }

  return 'La partida ha terminado.';
}

/**
 * Muestra el resultado de una partida terminada.
 * Se desmonta al iniciar otra partida.
 */
function GameResult() {
  const game = useGame();
  const state = game.state;
  const dispatch = game.dispatch;
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  const nextLevelId = getNextLevelId(state.levelId);
  let title;
  let text;

  if (state.status === 'won') {
    title = '¡Nivel superado!';
    text = 'Has cumplido el objetivo del nivel.';
  } else {
    title = 'Has perdido';
    text = getDefeatReason(state);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleNextLevel() {
    if (nextLevelId !== null) {
      dispatch({ type: 'START', levelId: nextLevelId });
    }
  }

  function handleRetry() {
    dispatch({ type: 'START', levelId: state.levelId });
  }

  function handleMenu() {
    navigate('/');
  }

  return (
    <Modal title={title} text={text} onClose={handleClose}>
      <div className="resultado__acciones">
        {state.status === 'won' && (
          <button
            type="button"
            className="btn btn--principal"
            disabled={nextLevelId === null}
            onClick={handleNextLevel}
          >
            Siguiente nivel
          </button>
        )}

        {state.status === 'lost' && (
          <button type="button" className="btn btn--principal" onClick={handleRetry}>
            Reintentar
          </button>
        )}

        <button
          type="button"
          className="btn btn--secundario btn--secundario-claro"
          onClick={handleMenu}
        >
          Menú
        </button>
      </div>
    </Modal>
  );
}

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
    if (state.aiThinking || state.status !== 'playing') {
      return;
    }
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
    <>
      <HUD>
        {/* 2.C3: indicador visible solo mientras la IA piensa */}
        <AIThinking visible={state.aiThinking} />
        <Board onSquareClick={handleSquareClick} disabled={state.aiThinking} />
      </HUD>

      {(state.status === 'won' || state.status === 'lost') && <GameResult />}
    </>
  );
}
