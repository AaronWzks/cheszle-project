import { describe, it, expect } from 'vitest';
import { createBoard, isInside, getPiece, setPiece, movePiece, findPiece } from './board.js';

const KING = Object.freeze({ id: 'w-king', type: 'king', color: 'white' });
const ROOK = Object.freeze({ id: 'b-rook', type: 'rook', color: 'black' });

// Congelar el tablero hace que una modificación accidental del original lance un error.
function freezeBoard(board) {
  board.forEach((row) => Object.freeze(row));
  return Object.freeze(board);
}

describe('createBoard', () => {
  it('crea un tablero rectangular con todas las casillas vacías', () => {
    expect(createBoard(3, 2)).toEqual([
      [null, null, null],
      [null, null, null],
    ]);
  });

  it('crea filas y tableros independientes', () => {
    const board = createBoard(3, 2);
    const other = createBoard(3, 2);

    board[0][0] = KING;

    expect(board[1][0]).toBe(null);
    expect(other[0][0]).toBe(null);
  });

  it.each([
    [0, 8],
    [8, 0],
    [-1, 8],
    [8, -1],
    [2.5, 8],
    [8, 2.5],
    ['8', 8],
    [8, '8'],
    [NaN, 8],
    [8, NaN],
  ])('rechaza dimensiones inválidas: %s × %s', (width, height) => {
    expect(() => createBoard(width, height)).toThrow(RangeError);
  });
});

describe('isInside', () => {
  it('acepta las cuatro esquinas de un tablero rectangular', () => {
    const board = createBoard(3, 2);

    expect(isInside(board, { x: 0, y: 0 })).toBe(true);
    expect(isInside(board, { x: 2, y: 0 })).toBe(true);
    expect(isInside(board, { x: 0, y: 1 })).toBe(true);
    expect(isInside(board, { x: 2, y: 1 })).toBe(true);
  });

  it.each([
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 3, y: 0 },
    { x: 0, y: 2 },
    { x: 1.5, y: 0 },
    { x: 0, y: 0.5 },
    { x: '0', y: 0 },
    { x: 0, y: '0' },
    { x: NaN, y: 0 },
  ])('rechaza una posición inválida: %j', (position) => {
    expect(isInside(createBoard(3, 2), position)).toBe(false);
  });

  it('devuelve false para un tablero vacío', () => {
    expect(isInside([], { x: 0, y: 0 })).toBe(false);
  });
});

describe('getPiece', () => {
  it('consulta una pieza usando primero la fila y después la columna', () => {
    const board = [
      [null, null, null],
      [null, null, KING],
    ];

    expect(getPiece(board, { x: 2, y: 1 })).toEqual(KING);
  });

  it('devuelve null si la casilla está vacía', () => {
    expect(getPiece(createBoard(3, 2), { x: 1, y: 1 })).toBe(null);
  });

  it('devuelve null para posiciones fuera del tablero o no enteras', () => {
    const board = createBoard(3, 2);

    expect(getPiece(board, { x: 3, y: 0 })).toBe(null);
    expect(getPiece(board, { x: 0, y: -1 })).toBe(null);
    expect(getPiece(board, { x: 1.5, y: 0 })).toBe(null);
    expect(getPiece(board, { x: 0, y: 0.5 })).toBe(null);
    expect(getPiece([], { x: 0, y: 0 })).toBe(null);
  });
});

describe('setPiece', () => {
  it('coloca una pieza en un tablero nuevo y conserva el original', () => {
    const board = freezeBoard([
      [ROOK, null, null],
      [null, null, null],
    ]);
    const next = setPiece(board, { x: 2, y: 1 }, KING);

    expect(next).not.toBe(board);
    expect(next).toEqual([
      [ROOK, null, null],
      [null, null, KING],
    ]);
    expect(board[1][2]).toBe(null);

    // También las filas que no cambiaron deben poder editarse sin tocar el original.
    next[0][0] = null;
    expect(board[0][0]).toEqual(ROOK);
  });

  it('vacía una casilla al recibir null', () => {
    const board = freezeBoard([[KING, null]]);
    const next = setPiece(board, { x: 0, y: 0 }, null);

    expect(next).toEqual([[null, null]]);
    expect(board[0][0]).toEqual(KING);
  });

  it('rechaza una casilla inválida sin cambiar el tablero', () => {
    const board = freezeBoard([[KING, null]]);

    expect(() => setPiece(board, { x: 2, y: 0 }, ROOK)).toThrow(RangeError);
    expect(() => setPiece(board, { x: 0.5, y: 0 }, ROOK)).toThrow(RangeError);
    expect(board).toEqual([[KING, null]]);
  });
});

describe('movePiece', () => {
  it('mueve una pieza y conserva el tablero original', () => {
    const board = freezeBoard([
      [KING, null, null],
      [null, null, null],
    ]);
    const next = movePiece(board, { x: 0, y: 0 }, { x: 2, y: 1 });

    expect(next).not.toBe(board);
    expect(next).toEqual([
      [null, null, null],
      [null, null, KING],
    ]);
    expect(board).toEqual([
      [KING, null, null],
      [null, null, null],
    ]);
  });

  it('captura la pieza del destino sin cambiar el tablero anterior', () => {
    const board = freezeBoard([[KING, null, ROOK]]);
    const next = movePiece(board, { x: 0, y: 0 }, { x: 2, y: 0 });

    expect(next).toEqual([[null, null, KING]]);
    expect(board).toEqual([[KING, null, ROOK]]);
  });

  it('conserva la pieza cuando origen y destino coinciden, devolviendo un tablero nuevo', () => {
    const board = freezeBoard([[KING, null]]);
    const next = movePiece(board, { x: 0, y: 0 }, { x: 0, y: 0 });

    expect(next).not.toBe(board);
    expect(next).toEqual([[KING, null]]);
    expect(board).toEqual([[KING, null]]);
  });

  it('rechaza mover desde una casilla vacía sin cambiar el tablero', () => {
    const board = freezeBoard([[null, ROOK]]);

    expect(() => movePiece(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toThrow(Error);
    expect(board).toEqual([[null, ROOK]]);
  });

  it('rechaza un origen o destino inválido sin cambiar el tablero', () => {
    const board = freezeBoard([[KING, ROOK]]);

    expect(() => movePiece(board, { x: -1, y: 0 }, { x: 1, y: 0 })).toThrow(RangeError);
    expect(() => movePiece(board, { x: 0, y: 0 }, { x: 2, y: 0 })).toThrow(RangeError);
    expect(() => movePiece(board, { x: 0, y: 0 }, { x: 0.5, y: 0 })).toThrow(RangeError);
    expect(board).toEqual([[KING, ROOK]]);
  });
});

describe('findPiece', () => {
  it('devuelve la pieza y sus coordenadas cuando cumple la condición', () => {
    const board = freezeBoard([
      [ROOK, null, null],
      [null, null, KING],
    ]);

    expect(findPiece(board, (piece) => piece.type === 'king')).toEqual({
      x: 2,
      y: 1,
      piece: KING,
    });
  });

  it('devuelve la primera coincidencia al recorrer filas de arriba abajo', () => {
    const board = [
      [null, ROOK, KING],
      [KING, null, null],
    ];

    expect(findPiece(board, (piece) => piece.color === 'white')).toEqual({
      x: 2,
      y: 0,
      piece: KING,
    });
  });

  it('devuelve null si ninguna pieza cumple la condición', () => {
    expect(findPiece([[KING, ROOK]], (piece) => piece.type === 'pawn')).toBe(null);
  });

  it('omite las casillas vacías y devuelve null si no hay piezas', () => {
    // Acceder a type fallaría si el predicado recibiera null.
    expect(findPiece(createBoard(3, 2), (piece) => piece.type === 'king')).toBe(null);
    expect(findPiece([], (piece) => piece.type === 'king')).toBe(null);
  });
});