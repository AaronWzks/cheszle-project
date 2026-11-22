/**
 * Función de evaluación de la IA. Puntúa un estado desde el punto de vista de
 * las negras (la IA): un número alto es bueno para la IA y uno bajo, para el
 * jugador.
 *
 * @typedef {import('../mockState.js').GameState} GameState
 */
import { findPiece } from '../board.js';
import { hasAnyLegalMove } from '../rules.js';
import { isObjectiveMet } from '../objectives.js';

/** Valor de cada pieza. El rey vale 0 porque nunca se captura. */
export const VALUES = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0 };

/** Puntuación de una partida terminada. */
export const WIN_SCORE = 100000;

/** Puntos que se restan por cada casilla que el rey blanco se acerca al objetivo. */
export const DISTANCE_WEIGHT = 20;

/**
 * Suma de las piezas negras menos la suma de las piezas blancas.
 * @param {GameState['board']} board
 * @returns {number}
 */
function material(board) {
  let score = 0;
  for (const row of board) {
    for (const piece of row) {
      if (piece) score += (piece.color === 'black' ? 1 : -1) * VALUES[piece.type];
    }
  }
  return score;
}

/**
 * Penalización por lo cerca que está el rey blanco de la casilla objetivo.
 * La distancia es la del rey (máximo entre |dx| y |dy|): las jugadas que le faltan.
 * @param {GameState} state
 * @returns {number} 0 si el rey está lo más lejos posible; más alto cuanto más cerca.
 */
function objectivePenalty(state) {
  if (state.objective.type !== 'reachSquare') return 0;

  const king = findPiece(state.board, (p) => p.type === 'king' && p.color === 'white');
  if (king === null) return 0;

  const { target } = state.objective;
  const distance = Math.max(Math.abs(king.x - target.x), Math.abs(king.y - target.y));
  const maxDistance = Math.max(state.board.length, state.board[0].length) - 1;
  return (maxDistance - distance) * DISTANCE_WEIGHT;
}

/**
 * Comprueba si la partida ha terminado, con los mismos criterios que
 * checkStatus (engine/index.js). No se importa de allí para evitar una
 * dependencia circular cuando index.js use la IA.
 * @param {GameState} state
 * @returns {'won' | 'lost' | 'playing'} Resultado para el jugador (blancas).
 */
export function outcome(state) {
  if (isObjectiveMet(state)) return 'won';
  if (state.turn === 'white' && !hasAnyLegalMove(state, 'white')) return 'lost';
  if (state.moveCount > state.maxMoves) return 'lost';
  return 'playing';
}

/**
 * Puntúa un estado para la IA (negras).
 * @param {GameState} state
 * @returns {number} +WIN_SCORE si gana la IA, -WIN_SCORE si gana el jugador;
 *   si no, material negro − material blanco − cercanía del rey blanco al objetivo.
 */
export function evaluate(state) {
  const result = outcome(state);
  if (result === 'won') return -WIN_SCORE;
  if (result === 'lost') return WIN_SCORE;

  return material(state.board) - objectivePenalty(state);
}
