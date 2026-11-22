/**
 * Reglas del ajedrez clásico: movimientos legales, jaque, jaque mate y ahogado.
 *
 * Un movimiento es «legal» si la pieza puede hacerlo (pieces/) y además no deja
 * a su propio rey en jaque. Los niveles pueden no tener rey de algún color: en
 * ese caso ese color nunca está en jaque.
 *
 * Fuera de esta tarea: obstáculos (3.B1), enroque y captura al paso.
 *
 * @typedef {import('./mockState.js').Color} Color
 * @typedef {import('./mockState.js').GameState} GameState
 * @typedef {import('./mockState.js').Position} Position
 * @typedef {import('./board.js').Board} Board
 */
import { findPiece, getPiece, movePiece } from './board.js';
import { PIECES } from './pieces/index.js';

/** @param {Color} color */
export const opponent = (color) => (color === 'white' ? 'black' : 'white');

/**
 * ¿Alguna pieza de `byColor` puede moverse a `target`?
 * Sirve para saber si una casilla está atacada.
 * @param {Board} board
 * @param {Position} target
 * @param {Color} byColor
 * @returns {boolean}
 */
export function isAttacked(board, target, byColor) {
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board[y].length; x += 1) {
      const piece = board[y][x];
      if (!piece || piece.color !== byColor) continue;
      const moves = PIECES[piece.type].getMoves(board, { x, y }, piece);
      if (moves.some((m) => m.x === target.x && m.y === target.y)) return true;
    }
  }
  return false;
}

/**
 * ¿Está en jaque el rey de `color`? false si ese color no tiene rey.
 * @param {Board} board
 * @param {Color} color
 * @returns {boolean}
 */
export function isInCheck(board, color) {
  const king = findPiece(board, (p) => p.type === 'king' && p.color === color);
  if (!king) return false;
  return isAttacked(board, king, opponent(color));
}

/**
 * Casillas a las que la pieza de `from` puede moverse sin dejar a su rey en jaque.
 * No comprueba el turno: también lo usa la IA para calcular jugadas de las negras.
 * @param {GameState} state
 * @param {Position} from
 * @returns {Position[]} [] si la casilla está vacía o fuera del tablero.
 */
export function getLegalMoves(state, from) {
  const piece = getPiece(state.board, from);
  if (!piece) return [];
  const candidates = PIECES[piece.type].getMoves(state.board, from, piece);
  return candidates.filter((to) => {
    const after = movePiece(state.board, from, to); // simulamos la jugada
    return !isInCheck(after, piece.color); // ¿mi rey queda en jaque?
  });
}

/**
 * ¿Es legal la jugada? (la pieza existe y el destino está entre sus movimientos legales)
 * @param {GameState} state
 * @param {{ from: Position, to: Position }} move
 * @returns {boolean}
 */
export function isLegalMove(state, { from, to }) {
  return getLegalMoves(state, from).some((m) => m.x === to.x && m.y === to.y);
}

/**
 * Todas las jugadas legales de `color`, recorriendo sus piezas fila a fila.
 * La usa la IA (minimax) para generar las jugadas de cada nodo.
 * @param {GameState} state
 * @param {Color} color
 * @returns {{ from: Position, to: Position }[]} [] si no tiene ninguna.
 */
export function getAllLegalMoves(state, color) {
  const moves = [];
  for (let y = 0; y < state.board.length; y += 1) {
    for (let x = 0; x < state.board[y].length; x += 1) {
      if (state.board[y][x]?.color !== color) continue;
      const from = { x, y };
      for (const to of getLegalMoves(state, from)) moves.push({ from, to });
    }
  }
  return moves;
}

/**
 * ¿Tiene `color` al menos un movimiento legal con alguna pieza?
 * @param {GameState} state
 * @param {Color} color
 * @returns {boolean}
 */
export function hasAnyLegalMove(state, color) {
  for (let y = 0; y < state.board.length; y += 1) {
    for (let x = 0; x < state.board[y].length; x += 1) {
      const piece = state.board[y][x];
      if (piece?.color === color && getLegalMoves(state, { x, y }).length > 0) return true;
    }
  }
  return false;
}

/**
 * Jaque mate: está en jaque y no tiene ningún movimiento legal.
 * @param {GameState} state
 * @param {Color} color
 * @returns {boolean}
 */
export function isCheckmate(state, color) {
  return isInCheck(state.board, color) && !hasAnyLegalMove(state, color);
}

/**
 * Ahogado: NO está en jaque pero no tiene ningún movimiento legal.
 * @param {GameState} state
 * @param {Color} color
 * @returns {boolean}
 */
export function isStalemate(state, color) {
  return !isInCheck(state.board, color) && !hasAnyLegalMove(state, color);
}
