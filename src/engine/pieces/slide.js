/**
 * Auxiliares compartidos por las piezas.
 *
 * @typedef {import('../mockState.js').Piece} Piece
 * @typedef {import('../mockState.js').Position} Position
 * @typedef {import('../board.js').Board} Board
 */
import { getPiece, isInside } from '../board.js';

/**
 * Movimientos de una pieza que se desliza (torre, alfil, dama): avanza en cada
 * dirección hasta salir del tablero, chocar con una pieza propia (para antes) o
 * con una enemiga (la incluye como captura y para).
 * @param {Board} board
 * @param {Position} from
 * @param {Piece} piece
 * @param {[number, number][]} directions Pasos [dx, dy].
 * @returns {Position[]}
 */
export function slide(board, from, piece, directions) {
  const moves = [];
  for (const [dx, dy] of directions) {
    let x = from.x + dx;
    let y = from.y + dy;
    while (isInside(board, { x, y })) {
      const target = getPiece(board, { x, y });
      if (target && target.color === piece.color) break; // pieza propia: para
      moves.push({ x, y });
      if (target) break; // enemiga: captura y para
      x += dx;
      y += dy;
    }
  }
  return moves;
}

/**
 * Movimientos de una pieza de salto (rey, caballo): prueba una lista fija de
 * desplazamientos y se queda con los que caen dentro del tablero y no tienen
 * una pieza propia.
 * @param {Board} board
 * @param {Position} from
 * @param {Piece} piece
 * @param {[number, number][]} offsets Desplazamientos [dx, dy].
 * @returns {Position[]}
 */
export function jump(board, from, piece, offsets) {
  const moves = [];
  for (const [dx, dy] of offsets) {
    const to = { x: from.x + dx, y: from.y + dy };
    if (!isInside(board, to)) continue;
    const target = getPiece(board, to);
    if (target && target.color === piece.color) continue;
    moves.push(to);
  }
  return moves;
}

export const ORTHOGONAL = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const DIAGONAL = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
