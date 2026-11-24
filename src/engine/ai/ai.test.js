/**
 * Tests de la IA (tarea 2.B3): posiciones con una respuesta clara para
 * comprobar que findBestMove juega con sentido, y un test de rendimiento.
 * Cómo funciona la IA: docs/ia.md.
 */
import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { MOCK_STATE } from '../mockState.js';
import { applyMove } from '../index.js';
import { getAllLegalMoves, isCheckmate, isLegalMove } from '../rules.js';
import { outcome } from './evaluate.js';
import { findBestMove } from './minimax.js';

// Recordatorio de coordenadas: board[y][x]; y = 0 es la fila de arriba.
// Las blancas avanzan hacia y creciente y las negras hacia y decreciente.

let nextId = 0;
const W = (type) => ({ id: `w-${type}-${nextId++}`, type, color: 'white' });
const B = (type) => ({ id: `b-${type}-${nextId++}`, type, color: 'black' });

/** Crea un estado con las piezas indicadas ([[x, y, pieza], ...]) y el turno de la IA. */
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

const at = (x, y) => ({ x, y });

/** Profundidades que se prueban: la de «fácil» (1), la de «medio» (3) y una intermedia. */
const DEPTHS = [1, 2, 3];

describe('IA · captura gratis', () => {
  it.each(DEPTHS)('captura una pieza sin defender (profundidad %i)', (depth) => {
    // Caballo blanco en (0,2), sin defender, en la columna de la torre negra.
    const state = stateWith([
      [7, 0, W('king')],
      [0, 2, W('knight')],
      [0, 5, B('rook')],
      [7, 7, B('king')],
    ]);
    expect(findBestMove(state, depth)).toEqual({ from: at(0, 5), to: at(0, 2) });
  });

  it.each(DEPTHS)('elige la pieza más valiosa (profundidad %i)', (depth) => {
    // La torre negra puede capturar la dama (columna) o el peón (fila).
    const state = stateWith([
      [7, 0, W('king')],
      [0, 1, W('queen')],
      [5, 5, W('pawn')],
      [0, 5, B('rook')],
      [7, 7, B('king')],
    ]);
    expect(findBestMove(state, depth)).toEqual({ from: at(0, 5), to: at(0, 1) });
  });
});

describe('IA · mate en 1', () => {
  // Mate de pasillo: la torre de (6,5) baja a (6,0) y la de (7,1) cierra la fila 1.
  const mateInOne = () =>
    stateWith([
      [0, 0, W('king')],
      [7, 1, B('rook')],
      [6, 5, B('rook')],
      [4, 7, B('king')],
    ]);

  it.each([2, 3])('gana la partida en una jugada (profundidad %i)', (depth) => {
    // También vale ahogar al rey (p. ej. torre a (1,5)): según checkStatus, si el
    // jugador no tiene jugadas en su turno, pierde. Para la IA es igual de bueno.
    const state = mateInOne();
    expect(outcome(applyMove(state, findBestMove(state, depth)))).toBe('lost');
  });

  it('encuentra el mate si es la única forma de ganar en una jugada', () => {
    // Igual que antes, pero un peón blanco en (3,3) evita el ahogado.
    const state = stateWith([
      [0, 0, W('king')],
      [3, 3, W('pawn')],
      [7, 1, B('rook')],
      [6, 5, B('rook')],
      [4, 7, B('king')],
    ]);
    const move = findBestMove(state, 2);
    expect(isCheckmate(applyMove(state, move), 'white')).toBe(true);
  });
});

describe('IA · evitar el mate', () => {
  it.each([2, 3])('no se deja dar mate de pasillo (profundidad %i)', (depth) => {
    // Amenaza: la torre blanca sube a (7,7) y da mate, porque los peones
    // negros de (0,6) y (1,6) tapan la huida del rey.
    const state = stateWith([
      [4, 0, W('king')],
      [7, 0, W('rook')],
      [0, 7, B('king')],
      [0, 6, B('pawn')],
      [1, 6, B('pawn')],
    ]);
    const threat = applyMove({ ...state, turn: 'white' }, { from: at(7, 0), to: at(7, 7) });
    expect(isCheckmate(threat, 'black')).toBe(true); // la amenaza es real

    const afterAI = applyMove(state, findBestMove(state, depth));
    for (const reply of getAllLegalMoves(afterAI, 'white')) {
      expect(isCheckmate(applyMove(afterAI, reply), 'black')).toBe(false);
    }
  });

  // Con profundidad 1 la IA no ve la respuesta del jugador, así que no puede
  // prever que el rey llegue a la meta: es lo esperado en la dificultad «fácil».
  it.each([2, 3])('impide que el rey llegue al objetivo (profundidad %i)', (depth) => {
    // El rey blanco está a una casilla de su meta (4,7).
    const state = stateWith(
      [
        [4, 6, W('king')],
        [0, 0, B('rook')],
        [7, 3, B('king')],
      ],
      { objective: { type: 'reachSquare', target: at(4, 7) } },
    );
    const afterAI = applyMove(state, findBestMove(state, depth));
    const kingFrom = at(4, 6);
    expect(isLegalMove(afterAI, { from: kingFrom, to: at(4, 7) })).toBe(false);
  });
});

describe('IA · siempre juega una jugada legal', () => {
  it.each(DEPTHS)('en el nivel de ejemplo (profundidad %i)', (depth) => {
    const state = { ...MOCK_STATE, turn: 'black' };
    const move = findBestMove(state, depth);
    expect(isLegalMove(state, move)).toBe(true);
  });
});

describe('IA · rendimiento', () => {
  // Límites medidos en local (ver docs/ia.md) con un margen amplio para el CI.
  const LIMIT_MS = 1000;

  /** Mide cuánto tarda findBestMove con profundidad 3. */
  function timeDepth3(state) {
    const start = performance.now();
    findBestMove(state, 3);
    return performance.now() - start;
  }

  it(`el nivel de ejemplo con profundidad 3 tarda menos de ${LIMIT_MS} ms`, () => {
    expect(timeDepth3({ ...MOCK_STATE, turn: 'black' })).toBeLessThan(LIMIT_MS);
  });

  it(`una posición con 12 piezas con profundidad 3 tarda menos de ${LIMIT_MS} ms`, () => {
    const state = stateWith([
      [4, 0, W('king')],
      [3, 0, W('queen')],
      [0, 0, W('rook')],
      [2, 2, W('knight')],
      [5, 1, W('bishop')],
      [4, 2, W('pawn')],
      [4, 7, B('king')],
      [3, 7, B('queen')],
      [7, 7, B('rook')],
      [5, 5, B('knight')],
      [2, 6, B('bishop')],
      [3, 5, B('pawn')],
    ]);
    expect(timeDepth3(state)).toBeLessThan(LIMIT_MS);
  });
});
