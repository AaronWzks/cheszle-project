import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { MOCK_STATE } from '../mockState.js';
import { applyMove } from '../index.js';
import { getAllLegalMoves, getLegalMoves, isLegalMove } from '../rules.js';
import { evaluate, outcome, WIN_SCORE } from './evaluate.js';
import { minimax, findBestMove } from './minimax.js';

// Recordatorio de coordenadas: board[y][x]; las blancas avanzan hacia y creciente.

let nextId = 0;
const W = (type) => ({ id: `w-${type}-${nextId++}`, type, color: 'white' });
const B = (type) => ({ id: `b-${type}-${nextId++}`, type, color: 'black' });

/** Crea un estado mínimo con las piezas indicadas: [[x, y, pieza], ...]. */
function stateWith(entries, overrides = {}) {
  let board = createBoard(8, 8);
  for (const [x, y, piece] of entries) board = setPiece(board, { x, y }, piece);
  return {
    levelId: 'test',
    board,
    obstacles: [],
    turn: 'black',
    objective: { type: 'checkmate' },
    moveCount: 0,
    maxMoves: 20,
    history: [],
    status: 'playing',
    ...overrides,
  };
}

/** El nivel de ejemplo (easy-1) con el turno de la IA. */
const EXAMPLE = { ...MOCK_STATE, turn: 'black' };

/** Minimax sin poda, para comprobar que la poda no cambia el resultado. */
function plainMinimax(state, depth) {
  if (depth <= 0 || outcome(state) !== 'playing') {
    const value = evaluate(state);
    if (value === WIN_SCORE) return value + depth;
    if (value === -WIN_SCORE) return value - depth;
    return value;
  }
  const moves = getAllLegalMoves(state, state.turn);
  if (moves.length === 0) return evaluate(state);
  const values = moves.map((move) => plainMinimax(applyMove(state, move), depth - 1));
  return state.turn === 'black' ? Math.max(...values) : Math.min(...values);
}

describe('getAllLegalMoves', () => {
  it('junta los movimientos legales de todas las piezas del color', () => {
    const moves = getAllLegalMoves(EXAMPLE, 'black');
    const rook = { x: 0, y: 5 };
    expect(moves).toHaveLength(getLegalMoves(EXAMPLE, rook).length);
    expect(moves.every((m) => m.from.x === rook.x && m.from.y === rook.y)).toBe(true);
  });

  it('devuelve [] si el color no tiene piezas', () => {
    const state = stateWith([[4, 0, W('king')]]);
    expect(getAllLegalMoves(state, 'black')).toEqual([]);
  });
});

describe('findBestMove', () => {
  it.each([1, 2, 3])('devuelve una jugada legal con profundidad %i', (depth) => {
    const move = findBestMove(EXAMPLE, depth);
    expect(move).not.toBeNull();
    expect(EXAMPLE.board[move.from.y][move.from.x].color).toBe('black');
    expect(isLegalMove(EXAMPLE, move)).toBe(true);
  });

  it('devuelve null si no hay jugadas', () => {
    const state = stateWith([[4, 0, W('king')]]);
    expect(findBestMove(state, 2)).toBeNull();
  });

  it('no modifica el estado que recibe', () => {
    const before = JSON.stringify(EXAMPLE);
    findBestMove(EXAMPLE, 3);
    expect(JSON.stringify(EXAMPLE)).toBe(before);
  });

  it('tarda menos de 2 segundos con profundidad 3 en el nivel de ejemplo', () => {
    const start = performance.now();
    findBestMove(EXAMPLE, 3);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe('minimax', () => {
  // Las negras dan mate de pasillo con Tg0: la torre de la fila 1 corta la huida.
  const mateInOne = stateWith([
    [0, 0, W('king')],
    [7, 1, B('rook')],
    [6, 5, B('rook')],
    [4, 7, B('king')],
  ]);

  it('da la puntuación de victoria (más la profundidad sobrante) si hay mate en 1', () => {
    // Mate en la 1.ª jugada con profundidad 3: sobran 2.
    expect(minimax(mateInOne, 3)).toBe(WIN_SCORE + 2);
  });

  it('puntúa directamente las partidas terminadas', () => {
    const won = stateWith(
      [
        [4, 7, W('king')],
        [0, 0, B('king')],
      ],
      { objective: { type: 'reachSquare', target: { x: 4, y: 7 } } },
    );
    expect(minimax(won, 3)).toBe(-WIN_SCORE - 3);
  });

  it.each([
    ['el nivel de ejemplo', EXAMPLE],
    ['el mate en 1', mateInOne],
    [
      'una posición con capturas',
      stateWith([
        [4, 0, W('king')],
        [3, 3, W('knight')],
        [5, 4, W('pawn')],
        [4, 7, B('king')],
        [3, 6, B('bishop')],
        [6, 5, B('pawn')],
      ]),
    ],
  ])('la poda alfa-beta da el mismo resultado que minimax sin poda en %s', (_, state) => {
    expect(minimax(state, 3)).toBe(plainMinimax(state, 3));
  });
});
