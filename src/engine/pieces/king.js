import { DIAGONAL, ORTHOGONAL, jump } from './slide.js';

/**
 * Rey: una casilla en cualquier dirección. No hay enroque.
 * Que la casilla esté atacada (jaque) lo filtra rules.js, no esta función.
 */
export const getMoves = (board, from, piece) =>
  jump(board, from, piece, [...ORTHOGONAL, ...DIAGONAL]);
