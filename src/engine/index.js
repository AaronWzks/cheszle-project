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
import { randomMove } from './ai/randomAI';

export { isInCheck } from './rules';

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
 * Pide a la IA (negras) su jugada. Es asíncrona porque la IA real se ejecutará
 * en un Web Worker.
 * @param {GameState} state
 * @param {Difficulty} difficulty
 * @returns {Promise<Move | null>} null si la IA no tiene ninguna jugada.
 */
// eslint-disable-next-line no-unused-vars
export async function getAIMove(state, difficulty) {
  // 2.C1: mientras minimax no esté listo, las negras juegan al azar.
  // Cuando Adri termine (2.B2), cambia SOLO esta línea por la de findBestMove.
  return randomMove(state);



  /* antes de añadir RandomIA sin minimax
  // TODO (Fase 2, tareas 2.B2 y 2.C2): minimax dentro de un Web Worker.
  for (let y = 0; y < state.board.length; y++) {
    for (let x = 0; x < state.board[y].length; x++) {
      const piece = state.board[y][x];
      if (piece?.color !== 'black') continue;
      const [to] = getLegalMoves(state, { x, y });
      if (to) return { from: { x, y }, to };      
    }
  }
  return null;
  */
}
