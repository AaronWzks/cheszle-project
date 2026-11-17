/**
 * @typedef {import('../mockState.js').Color} Color
 * @typedef {import('../mockState.js').Piece} Piece
 * @typedef {import('../mockState.js').Position} Position
 * @typedef {import('../board.js').Board} Board
 */
import { getPiece, isInside } from '../board.js';

/**
 * Hacia dónde avanza cada color en el eje y. Las blancas empiezan arriba (y = 0)
 * y bajan, como en los niveles (p. ej. 'easy-1': rey blanco en y = 0, meta en y = 7).
 * @param {Color} color
 * @returns {1 | -1}
 */
export function forward(color) {
  return color === 'white' ? 1 : -1;
}

/**
 * Peón: avanza una casilla si está vacía; dos desde su fila inicial (la segunda
 * de su lado) si las dos están vacías; captura una casilla en diagonal hacia delante.
 * No incluye captura al paso; la coronación se resolverá al aplicar la jugada.
 * @param {Board} board
 * @param {Position} from
 * @param {Piece} piece
 * @returns {Position[]}
 */
export function getMoves(board, from, piece) {
  const dy = forward(piece.color);
  const moves = [];

  const one = { x: from.x, y: from.y + dy };
  if (isInside(board, one) && !getPiece(board, one)) {
    moves.push(one);

    const startRow = piece.color === 'white' ? 1 : board.length - 2;
    const two = { x: from.x, y: from.y + 2 * dy };
    if (from.y === startRow && isInside(board, two) && !getPiece(board, two)) {
      moves.push(two);
    }
  }

  for (const dx of [-1, 1]) {
    const diag = { x: from.x + dx, y: from.y + dy };
    const target = getPiece(board, diag);
    if (target && target.color !== piece.color) moves.push(diag);
  }

  return moves;
}
