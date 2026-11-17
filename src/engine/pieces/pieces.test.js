import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { PIECES, getPieceMoves } from './index.js';

const p = (type, color = 'white') => Object.freeze({ id: `${color}-${type}`, type, color });

/** Tablero 8x8 con las piezas indicadas: [[x, y, pieza], ...]. Congelado para detectar mutaciones. */
function boardWith(entries) {
  let board = createBoard(8, 8);
  for (const [x, y, piece] of entries) board = setPiece(board, { x, y }, piece);
  board.forEach((row) => Object.freeze(row));
  return Object.freeze(board);
}

/** Ordena posiciones para comparar listas sin depender del orden. */
const sorted = (moves) => [...moves].sort((a, b) => a.y - b.y || a.x - b.x);
const has = (moves, x, y) => moves.some((m) => m.x === x && m.y === y);

function movesOf(type, x, y, others = [], color = 'white') {
  const piece = p(type, color);
  const board = boardWith([[x, y, piece], ...others]);
  return PIECES[type].getMoves(board, { x, y }, piece);
}

describe('registro PIECES', () => {
  it('tiene las 6 piezas clásicas con getMoves', () => {
    expect(Object.keys(PIECES).sort()).toEqual(
      ['bishop', 'king', 'knight', 'pawn', 'queen', 'rook'].sort(),
    );
    for (const mod of Object.values(PIECES)) expect(typeof mod.getMoves).toBe('function');
  });

  it('getPieceMoves devuelve [] en una casilla vacía', () => {
    expect(getPieceMoves(createBoard(8, 8), { x: 3, y: 3 })).toEqual([]);
  });

  it('getPieceMoves delega en la pieza de la casilla', () => {
    const board = boardWith([[3, 3, p('knight')]]);
    expect(getPieceMoves(board, { x: 3, y: 3 })).toHaveLength(8);
  });
});

describe('en el centro de un tablero vacío', () => {
  it.each([
    ['rook', 14],
    ['bishop', 13],
    ['queen', 27],
    ['king', 8],
    ['knight', 8],
  ])('%s en (3, 3) tiene %i movimientos', (type, count) => {
    const moves = movesOf(type, 3, 3);
    expect(moves).toHaveLength(count);
    expect(new Set(moves.map((m) => `${m.x},${m.y}`)).size).toBe(count); // sin repetidos
  });
});

describe('bordes del tablero', () => {
  it('rey en la esquina tiene 3 movimientos', () => {
    expect(sorted(movesOf('king', 0, 0))).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it('caballo en la esquina tiene 2 movimientos', () => {
    expect(sorted(movesOf('knight', 0, 0))).toEqual([
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ]);
  });

  it('torre en la esquina sigue teniendo 14 movimientos', () => {
    expect(movesOf('rook', 0, 0)).toHaveLength(14);
  });

  it('funciona en tableros no cuadrados', () => {
    const piece = p('rook');
    const board = setPiece(createBoard(3, 5), { x: 1, y: 2 }, piece);
    expect(PIECES.rook.getMoves(board, { x: 1, y: 2 }, piece)).toHaveLength(2 + 4);
  });
});

describe('piezas que se deslizan no atraviesan otras', () => {
  it('la torre para antes de una pieza propia', () => {
    const moves = movesOf('rook', 0, 0, [[0, 3, p('pawn')]]);
    expect(has(moves, 0, 2)).toBe(true);
    expect(has(moves, 0, 3)).toBe(false);
    expect(has(moves, 0, 4)).toBe(false);
  });

  it('la torre captura una enemiga y para', () => {
    const moves = movesOf('rook', 0, 0, [[0, 3, p('pawn', 'black')]]);
    expect(has(moves, 0, 3)).toBe(true);
    expect(has(moves, 0, 4)).toBe(false);
  });

  it('el alfil queda bloqueado por piezas propias en las 4 diagonales', () => {
    const own = [
      [2, 2],
      [4, 2],
      [2, 4],
      [4, 4],
    ].map(([x, y]) => [x, y, p('pawn')]);
    expect(movesOf('bishop', 3, 3, own)).toEqual([]);
  });

  it('la dama captura en diagonal pero no sigue detrás', () => {
    const moves = movesOf('queen', 3, 3, [[5, 5, p('rook', 'black')]]);
    expect(has(moves, 5, 5)).toBe(true);
    expect(has(moves, 6, 6)).toBe(false);
  });
});

describe('piezas de salto', () => {
  it('el caballo salta por encima de piezas', () => {
    const around = [];
    for (let dy = -1; dy <= 1; dy += 1)
      for (let dx = -1; dx <= 1; dx += 1) if (dx || dy) around.push([3 + dx, 3 + dy, p('pawn')]);
    expect(movesOf('knight', 3, 3, around)).toHaveLength(8);
  });

  it('el caballo no cae sobre una pieza propia pero sí captura una enemiga', () => {
    const moves = movesOf('knight', 3, 3, [
      [4, 5, p('pawn')],
      [5, 4, p('pawn', 'black')],
    ]);
    expect(has(moves, 4, 5)).toBe(false);
    expect(has(moves, 5, 4)).toBe(true);
    expect(moves).toHaveLength(7);
  });

  it('el rey no pisa piezas propias y captura enemigas', () => {
    const moves = movesOf('king', 3, 3, [
      [3, 4, p('pawn')],
      [4, 4, p('pawn', 'black')],
    ]);
    expect(has(moves, 3, 4)).toBe(false);
    expect(has(moves, 4, 4)).toBe(true);
    expect(moves).toHaveLength(7);
  });
});

describe('peón', () => {
  it('el blanco avanza hacia y creciente', () => {
    expect(movesOf('pawn', 3, 3)).toEqual([{ x: 3, y: 4 }]);
  });

  it('el negro avanza hacia y decreciente', () => {
    expect(movesOf('pawn', 3, 3, [], 'black')).toEqual([{ x: 3, y: 2 }]);
  });

  it('avanza dos desde su fila inicial (blancas y = 1, negras y = 6)', () => {
    expect(sorted(movesOf('pawn', 3, 1))).toEqual([
      { x: 3, y: 2 },
      { x: 3, y: 3 },
    ]);
    expect(sorted(movesOf('pawn', 3, 6, [], 'black'))).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 5 },
    ]);
  });

  it('no avanza dos si la segunda casilla está ocupada', () => {
    expect(movesOf('pawn', 3, 1, [[3, 3, p('knight', 'black')]])).toEqual([{ x: 3, y: 2 }]);
  });

  it('no avanza (ni salta) si la casilla de delante está ocupada', () => {
    expect(movesOf('pawn', 3, 1, [[3, 2, p('knight', 'black')]])).toEqual([]);
  });

  it('captura en diagonal solo piezas enemigas', () => {
    const moves = movesOf('pawn', 3, 3, [
      [2, 4, p('knight', 'black')],
      [4, 4, p('knight')],
    ]);
    expect(sorted(moves)).toEqual([
      { x: 2, y: 4 },
      { x: 3, y: 4 },
    ]);
  });

  it('no captura hacia atrás ni sale del tablero', () => {
    expect(movesOf('pawn', 0, 7)).toEqual([]);
    expect(movesOf('pawn', 3, 3, [[2, 2, p('knight', 'black')]])).toEqual([{ x: 3, y: 4 }]);
  });
});

describe('inmutabilidad', () => {
  it('ninguna pieza modifica el tablero (está congelado)', () => {
    for (const type of Object.keys(PIECES)) {
      expect(() => movesOf(type, 3, 3, [[4, 4, p('pawn', 'black')]])).not.toThrow();
    }
  });
});
