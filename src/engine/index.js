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
  // TODO (Fase 1, tarea 1.B2): calcular con pieces/ y rules.js.
  const piece = state.board[from.y]?.[from.x];
  if (!piece) return [];
  const to = { x: from.x, y: from.y + 1 };
  return to.y < state.board.length ? [to] : [];
}

/**
 * Aplica una jugada y devuelve un estado NUEVO (no modifica el que recibe):
 * mueve la pieza, cambia el turno, suma la jugada y la guarda en el historial.
 * @param {GameState} state
 * @param {Move} move
 * @returns {GameState}
 */
export function applyMove(state, move) {
  // TODO (Fase 1): validar la jugada con rules.js.
  const { from, to } = move;
  const board = state.board.map((row) => [...row]);
  board[to.y][to.x] = board[from.y][from.x];
  board[from.y][from.x] = null;

  return {
    ...state,
    board,
    turn: state.turn === 'white' ? 'black' : 'white',
    moveCount: state.turn === 'white' ? state.moveCount + 1 : state.moveCount,
    history: [...state.history, { from, to }],
  };
}

/**
 * Comprueba cómo va la partida.
 * @param {GameState} state
 * @returns {Status} 'playing' | 'won' | 'lost'
 */
// eslint-disable-next-line no-unused-vars
export function checkStatus(state) {
  // TODO (Fase 2, tarea 2.A1): usar objectives.js y rules.js.
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
}
