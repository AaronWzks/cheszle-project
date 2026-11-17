/**
 * Registro de piezas: asocia cada tipo con su función getMoves(board, from, piece),
 * que devuelve las casillas destino SIN comprobar si el rey propio queda en jaque
 * (eso lo hace rules.js). No tiene en cuenta los obstáculos (Fase 3).
 */
import { getPiece } from '../board.js';
import * as bishop from './bishop.js';
import * as king from './king.js';
import * as knight from './knight.js';
import * as pawn from './pawn.js';
import * as queen from './queen.js';
import * as rook from './rook.js';

export const PIECES = Object.freeze({ king, queen, rook, bishop, knight, pawn });

/**
 * Atajo: movimientos de la pieza que haya en `from`, o [] si la casilla está vacía.
 * @param {import('../board.js').Board} board
 * @param {import('../mockState.js').Position} from
 * @returns {import('../mockState.js').Position[]}
 */
export function getPieceMoves(board, from) {
  const piece = getPiece(board, from);
  if (!piece) return [];
  return PIECES[piece.type].getMoves(board, from, piece);
}
