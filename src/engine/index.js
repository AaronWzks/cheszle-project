/**
 * CONTRATO DEL MOTOR
 *
 * Estas son las únicas funciones que la interfaz (state/, components/, pages/)
 * puede pedirle al motor. De momento devuelven datos falsos (mocks) pero con la
 * forma definitiva, así la UI se puede programar en paralelo. Cuando el motor
 * real esté listo solo cambia lo de dentro de cada función, no cómo se llama.
 *
 * Regla de oro: este archivo (y toda la carpeta engine/) NO importa nada de React.
 * Todas las funciones son puras: nunca modifican el estado que reciben.
 *
 * Tipos (GameState, Position, Move...): ver ./mockState.js y docs/estado.md.
 */
import { createMockState } from './mockState';
import { getPiece, movePiece, setPiece } from './board';
import {
  getLegalMoves as rulesGetLegalMoves,
  isLegalMove,
  isCheckmate,
  hasAnyLegalMove,
} from './rules';
import { isObjectiveMet } from './objectives';

import { chooseMove } from './ai/chooseMove';
import { DEPTH, RANDOM_MOVE_CHANCE } from './ai/config';

export { isInCheck, isCheckmate, hasAnyLegalMove } from './rules';

/** @typedef {import('./mockState').GameState} GameState */
/** @typedef {import('./mockState').Position} Position */
/** @typedef {import('./mockState').Move} Move */
/** @typedef {import('./mockState').Status} Status */
/** @typedef {'easy' | 'medium' | 'hard'} Difficulty */

/**
 * Crea una partida nueva a partir de un nivel.
 * @param {string} levelId Ej.: 'easy-1'
 * @returns {GameState} Estado inicial de la partida.
 */
export function createGame(levelId) {
  // TODO (Fase 1): cargar el nivel desde levels.json y colocar sus piezas.
  return { ...createMockState(), levelId };
}

/**
 * Casillas a las que puede moverse legalmente la pieza que está en `from`.
 * @param {GameState} state
 * @param {Position} from
 * @returns {Position[]} Lista vacía si no hay pieza o no tiene movimientos.
 */
export function getLegalMoves(state, from) {
  return rulesGetLegalMoves(state, from);
}

/**
 * Aplica una jugada y devuelve un estado NUEVO (no modifica el que recibe):
 * mueve la pieza, cambia el turno, suma la jugada y la guarda en el historial.
 * Si un peón llega a la última fila corona en dama (conserva su id).
 *
 * Si la jugada no es válida (no hay pieza, no es su turno o no es legal)
 * devuelve el MISMO estado sin cambios, para que la UI no se rompa.
 * @param {GameState} state
 * @param {Move} move
 * @returns {GameState}
 */
export function applyMove(state, move) {
  const { from, to } = move;
  const piece = getPiece(state.board, from);
  if (!piece || piece.color !== state.turn || !isLegalMove(state, move)) return state;

  let board = movePiece(state.board, from, to);
  const lastRow = piece.color === 'white' ? board.length - 1 : 0;
  if (piece.type === 'pawn' && to.y === lastRow) {
    board = setPiece(board, to, { ...piece, type: 'queen' });
  }

  return {
    ...state,
    board,
    turn: state.turn === 'white' ? 'black' : 'white',
    moveCount: state.turn === 'white' ? state.moveCount + 1 : state.moveCount,
    history: [...state.history, { from, to }],
  };
}

/**
 * Comprueba cómo va la partida. Cumplir el objetivo tiene prioridad.
 * El mate y la falta de jugadas del jugador se comprueban en su turno.
 * El límite solo se supera cuando moveCount es mayor que maxMoves.
 * @param {GameState} state
 * @returns {Status} 'playing' | 'won' | 'lost'
 */
export function checkStatus(state) {
  if (isObjectiveMet(state)) {
    return 'won';
  }

  if (state.turn === 'white') {
    if (isCheckmate(state, 'white')) {
      return 'lost';
    }

    if (!hasAnyLegalMove(state, 'white')) {
      return 'lost';
    }
  }

  if (state.moveCount > state.maxMoves) {
    return 'lost';
  }
  return 'playing';
}

/**
 * Pide a la IA (negras) su jugada. La IA piensa en un Web Worker (otro hilo)
 * para que la pantalla no se congele mientras calcula.
 *
 * @param {GameState} state Estado actual (solo datos simples: se copia al Worker).
 * @param {Difficulty} difficulty 'easy' | 'medium' | 'hard' → profundidad de DEPTH
 *   y probabilidad de jugar al azar de RANDOM_MOVE_CHANCE (ver ai/config.js).
 * @param {AbortSignal} [signal] Opcional. Si se cancela (p. ej. el jugador sale
 *   de la partida), se termina el Worker y la Promise devuelve null.
 * @returns {Promise<Move | null>} null si la IA no tiene jugada o se canceló.
 */
export function getAIMove(state, difficulty, signal) {
  const depth = DEPTH[difficulty] ?? DEPTH.easy; // dificultad desconocida → fácil
  // 2.C3: probabilidad de jugar al azar (0.3 en fácil, 0 en el resto).
  const randomChance = RANDOM_MOVE_CHANCE[difficulty] ?? RANDOM_MOVE_CHANCE.easy;

  // En los tests (jsdom) no existe Worker: calculamos aquí mismo.
  if (typeof Worker === 'undefined') {
    return Promise.resolve(chooseMove(state, depth, randomChance));
  }
  // Si ya nos cancelaron antes de empezar, ni siquiera creamos el Worker.
  if (signal?.aborted) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    // new URL(..., import.meta.url) es la forma que entiende Vite para
    // empaquetar el worker. type: 'module' permite usar import dentro de él.
    const worker = new Worker(new URL('./ai/ai.worker.js', import.meta.url), {
      type: 'module',
    });

    // Cancelación: matamos el hilo al momento, aunque esté a mitad de cálculo.
    const onAbort = () => {
      worker.terminate();
      resolve(null);
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    // Respuesta del Worker: la devolvemos y cerramos el hilo (ya no sirve).
    worker.onmessage = (e) => {
      signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      resolve(e.data);
    };

    // Si el Worker falla (error de código, import roto...), no dejamos la
    // Promise colgada para siempre: la rechazamos para que la UI lo sepa.
    worker.onerror = (err) => {
      signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      reject(err);
    };

    worker.postMessage({ state, depth, randomChance }); // ¡a pensar!
  });
}