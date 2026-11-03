/**
 * Estado de partida de ejemplo (mock) con la forma acordada en docs/estado.md.
 * Lo usan el contrato del motor (engine/index.js) y los tests/UI mientras el
 * motor real no esté terminado. Corresponde al nivel 'easy-1'.
 */

/**
 * @typedef {'white' | 'black'} Color
 * @typedef {'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'} PieceType
 * @typedef {{ id: string, type: PieceType, color: Color }} Piece
 * @typedef {{ x: number, y: number }} Position
 * @typedef {{ from: Position, to: Position }} Move
 * @typedef {{ type: 'reachSquare', target: Position } | { type: 'checkmate' }} Objective
 * @typedef {'playing' | 'won' | 'lost'} Status
 *
 * @typedef {Object} GameState
 * @property {string} levelId        Id del nivel en levels.json.
 * @property {(Piece|null)[][]} board Matriz [y][x]; cada casilla es null o una pieza.
 * @property {Position[]} obstacles  Casillas bloqueadas.
 * @property {Color} turn            A quién le toca: 'white' (jugador) o 'black' (IA).
 * @property {Objective} objective   Objetivo del nivel.
 * @property {number} moveCount      Jugadas hechas por el jugador.
 * @property {number} maxMoves       Límite de jugadas del nivel.
 * @property {Move[]} history        Jugadas hechas, en orden.
 * @property {Status} status         Estado de la partida.
 */

const WIDTH = 8;
const HEIGHT = 8;

function emptyBoard() {
  return Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
}

function buildBoard() {
  const board = emptyBoard();
  board[0][4] = { id: 'w-king', type: 'king', color: 'white' };
  board[5][0] = { id: 'b-rook-1', type: 'rook', color: 'black' };
  return board;
}

/** @type {GameState} */
export const MOCK_STATE = Object.freeze({
  levelId: 'easy-1',
  board: buildBoard(),
  obstacles: [{ x: 3, y: 4 }],
  turn: 'white',
  objective: { type: 'reachSquare', target: { x: 4, y: 7 } },
  moveCount: 0,
  maxMoves: 20,
  history: [],
  status: 'playing',
});

/**
 * Devuelve una copia independiente del estado mock, para que nadie modifique
 * el original sin querer (ni en tests ni en la UI).
 * @returns {GameState}
 */
export function createMockState() {
  return structuredClone(MOCK_STATE);
}
