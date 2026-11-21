/**
 * Objetivos del nivel. Cada comprobación devuelve un booleano y conserva el estado.
 *
 * @typedef {import('./mockState.js').GameState} GameState
 */
import { findPiece } from './board.js';
import { isCheckmate } from './rules.js';

/**
 * Comprueba si el rey blanco está en la casilla objetivo.
 * @param {GameState} state
 * @returns {boolean}
 */
function reachSquare(state) {
  const king = findPiece(state.board, function (piece) {
    return piece.type === 'king' && piece.color === 'white';
  });

  if (king === null) {
    return false;
  }

  const target = state.objective.target;
  return king.x === target.x && king.y === target.y;
}

/**
 * Comprueba si las negras están en jaque mate.
 * @param {GameState} state
 * @returns {boolean}
 */
function checkmate(state) {
  return isCheckmate(state, 'black');
}

const OBJECTIVES = {
  reachSquare: reachSquare,
  checkmate: checkmate,
};

/**
 * Elige la comprobación correspondiente al objetivo del nivel.
 * @param {GameState} state
 * @returns {boolean}
 * @throws {RangeError} Si el tipo de objetivo no está definido.
 */
export function isObjectiveMet(state) {
  const type = state.objective.type;

  if (!Object.hasOwn(OBJECTIVES, type)) {
    throw new RangeError(`Tipo de objetivo desconocido: ${type}.`);
  }

  const checkObjective = OBJECTIVES[type];
  return checkObjective(state);
}
