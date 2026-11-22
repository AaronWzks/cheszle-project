import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { MOCK_STATE } from '../mockState.js';
import { evaluate, VALUES, WIN_SCORE, DISTANCE_WEIGHT } from './evaluate.js';

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
    turn: 'white',
    objective: { type: 'checkmate' },
    moveCount: 0,
    maxMoves: 20,
    history: [],
    status: 'playing',
    ...overrides,
  };
}

const KINGS = [
  [4, 0, W('king')],
  [4, 7, B('king')],
];

describe('evaluate · material', () => {
  it('vale 0 con material igualado', () => {
    expect(evaluate(stateWith(KINGS))).toBe(0);
  });

  it('es positiva con más material negro', () => {
    const state = stateWith([...KINGS, [0, 5, B('rook')]]);
    expect(evaluate(state)).toBe(VALUES.rook);
  });

  it('es negativa con más material blanco', () => {
    const state = stateWith([...KINGS, [3, 3, W('queen')]]);
    expect(evaluate(state)).toBe(-VALUES.queen);
  });

  it('suma y resta todas las piezas', () => {
    const state = stateWith([
      ...KINGS,
      [0, 6, B('knight')],
      [1, 6, B('pawn')],
      [0, 1, W('bishop')],
    ]);
    expect(evaluate(state)).toBe(VALUES.knight + VALUES.pawn - VALUES.bishop);
  });
});

describe('evaluate · objetivo reachSquare', () => {
  const objective = { type: 'reachSquare', target: { x: 4, y: 7 } };
  const withWhiteKingAt = (x, y) =>
    stateWith(
      [
        [x, y, W('king')],
        [0, 7, B('king')],
      ],
      { objective },
    );

  it('baja cuando el rey blanco se acerca al objetivo', () => {
    const far = evaluate(withWhiteKingAt(4, 0)); // a 7 casillas
    const near = evaluate(withWhiteKingAt(4, 5)); // a 2 casillas
    expect(near).toBeLessThan(far);
    expect(far - near).toBe(5 * DISTANCE_WEIGHT);
  });

  it('no penaliza cuando el rey está a la distancia máxima', () => {
    expect(evaluate(withWhiteKingAt(4, 0))).toBe(0);
  });

  it('usa la distancia del rey (las diagonales cuentan como una jugada)', () => {
    expect(evaluate(withWhiteKingAt(1, 4))).toBe(evaluate(withWhiteKingAt(4, 4)));
  });

  it('devuelve -WIN_SCORE si el rey blanco ya está en el objetivo', () => {
    expect(evaluate(withWhiteKingAt(4, 7))).toBe(-WIN_SCORE);
  });

  it('no afecta a los niveles de jaque mate', () => {
    expect(
      evaluate(
        stateWith([
          [4, 5, W('king')],
          [0, 7, B('king')],
        ]),
      ),
    ).toBe(0);
  });
});

describe('evaluate · fin de partida', () => {
  it('devuelve +WIN_SCORE si las blancas están en jaque mate', () => {
    // Mate de pasillo: torre en la fila 0 da jaque, la otra cubre la fila 1.
    const state = stateWith([
      [0, 0, W('king')],
      [7, 0, B('rook')],
      [7, 1, B('rook')],
      [4, 7, B('king')],
    ]);
    expect(evaluate(state)).toBe(WIN_SCORE);
  });

  it('devuelve +WIN_SCORE si las blancas no tienen jugadas (ahogado)', () => {
    const state = stateWith([
      [0, 0, W('king')],
      [1, 2, B('queen')],
      [7, 7, B('king')],
    ]);
    expect(evaluate(state)).toBe(WIN_SCORE);
  });

  it('devuelve -WIN_SCORE si las negras están en jaque mate', () => {
    const state = stateWith([
      [0, 7, B('king')],
      [7, 7, W('rook')],
      [7, 6, W('rook')],
      [4, 0, W('king')],
    ]);
    expect(evaluate(state)).toBe(-WIN_SCORE);
  });

  it('devuelve +WIN_SCORE si el jugador supera el límite de jugadas', () => {
    const state = stateWith(KINGS, { moveCount: 21, maxMoves: 20 });
    expect(evaluate(state)).toBe(WIN_SCORE);
  });
});

describe('evaluate · estado real', () => {
  it('puntúa el nivel de ejemplo sin modificarlo', () => {
    // easy-1: rey blanco a 7 casillas del objetivo y una torre negra.
    expect(evaluate(MOCK_STATE)).toBe(VALUES.rook);
  });
});
