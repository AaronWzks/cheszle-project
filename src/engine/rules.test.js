import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from './board.js';
import {
  isAttacked,
  isInCheck,
  getLegalMoves,
  isLegalMove,
  hasAnyLegalMove,
  isCheckmate,
  isStalemate,
} from './rules.js';
import { applyMove } from './index.js';

// Recordatorio de coordenadas: board[y][x]; las blancas avanzan hacia y creciente.
// En los comentarios, «fila 7» es y = 7.

let nextId = 0;
const W = (type) => ({ id: `w-${type}-${nextId++}`, type, color: 'white' });
const B = (type) => ({ id: `b-${type}-${nextId++}`, type, color: 'black' });

/** Crea un estado mínimo con las piezas indicadas: [[x, y, pieza], ...]. */
function stateWith(entries, turn = 'white') {
  let board = createBoard(8, 8);
  for (const [x, y, piece] of entries) board = setPiece(board, { x, y }, piece);
  board.forEach((row) => Object.freeze(row));
  return {
    levelId: 'test',
    board: Object.freeze(board),
    obstacles: [],
    turn,
    objective: { type: 'checkmate' },
    moveCount: 0,
    maxMoves: 20,
    history: [],
    status: 'playing',
  };
}

const sorted = (moves) => [...moves].sort((a, b) => a.y - b.y || a.x - b.x);

describe('isAttacked', () => {
  it('detecta una casilla atacada por una torre y una que no', () => {
    const { board } = stateWith([[0, 3, B('rook')]]);
    expect(isAttacked(board, { x: 5, y: 3 }, 'black')).toBe(true);
    expect(isAttacked(board, { x: 5, y: 4 }, 'black')).toBe(false);
  });

  it('el peón ataca en diagonal, no hacia delante', () => {
    const { board } = stateWith([
      [3, 3, W('pawn')],
      [3, 4, B('king')],
    ]);
    expect(isAttacked(board, { x: 3, y: 4 }, 'white')).toBe(false);
    const diag = stateWith([
      [3, 3, W('pawn')],
      [4, 4, B('king')],
    ]).board;
    expect(isAttacked(diag, { x: 4, y: 4 }, 'white')).toBe(true);
  });
});

describe('jaque', () => {
  it('torre en la misma columna que el rey', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 7, B('rook')],
    ]);
    expect(isInCheck(s.board, 'white')).toBe(true);
    expect(isCheckmate(s, 'white')).toBe(false); // puede apartarse
  });

  it('caballo que da jaque', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [5, 2, B('knight')],
    ]);
    expect(isInCheck(s.board, 'white')).toBe(true);
  });

  it('una pieza en medio tapa el jaque', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 3, W('pawn')],
      [4, 7, B('rook')],
    ]);
    expect(isInCheck(s.board, 'white')).toBe(false);
  });

  it('un color sin rey nunca está en jaque', () => {
    const s = stateWith([
      [4, 7, B('rook')],
      [4, 0, W('rook')],
    ]);
    expect(isInCheck(s.board, 'white')).toBe(false);
    expect(isCheckmate(s, 'white')).toBe(false);
  });
});

describe('getLegalMoves', () => {
  it('devuelve [] en una casilla vacía o fuera del tablero', () => {
    const s = stateWith([[4, 0, W('king')]]);
    expect(getLegalMoves(s, { x: 0, y: 0 })).toEqual([]);
    expect(getLegalMoves(s, { x: 9, y: 9 })).toEqual([]);
  });

  it('una pieza clavada que no puede seguir la línea no tiene movimientos', () => {
    // Alfil blanco entre su rey y una torre negra en la misma columna.
    const s = stateWith([
      [4, 0, W('king')],
      [4, 1, W('bishop')],
      [4, 7, B('rook')],
    ]);
    expect(getLegalMoves(s, { x: 4, y: 1 })).toEqual([]);
  });

  it('una torre clavada solo se mueve por la línea del clavado (y puede capturar)', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 1, W('rook')],
      [4, 7, B('rook')],
    ]);
    expect(sorted(getLegalMoves(s, { x: 4, y: 1 }))).toEqual(
      [2, 3, 4, 5, 6, 7].map((y) => ({ x: 4, y })),
    );
  });

  it('el rey no puede ponerse en jaque solo', () => {
    // Torre negra controla la fila 1.
    const s = stateWith([
      [4, 0, W('king')],
      [0, 1, B('rook')],
    ]);
    expect(sorted(getLegalMoves(s, { x: 4, y: 0 }))).toEqual([
      { x: 3, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('el rey no puede capturar una pieza defendida', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 1, B('pawn')],
      [4, 2, B('rook')],
    ]);
    expect(isLegalMove(s, { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } })).toBe(false);
  });

  it('el rey no puede huir en la misma línea del ataque', () => {
    // Torre en (4,7) da jaque: (4,1) sigue en la columna atacada, así que no vale.
    const s = stateWith([
      [4, 0, W('king')],
      [4, 7, B('rook')],
    ]);
    const moves = getLegalMoves(s, { x: 4, y: 0 });
    expect(moves).not.toContainEqual({ x: 4, y: 1 });
    expect(sorted(moves)).toEqual([
      { x: 3, y: 0 },
      { x: 5, y: 0 },
      { x: 3, y: 1 },
      { x: 5, y: 1 },
    ]);
  });

  it('en jaque solo valen las jugadas que lo resuelven (tapar)', () => {
    const s = stateWith([
      [0, 0, W('king')],
      [0, 7, B('rook')],
      [3, 3, W('rook')],
    ]);
    expect(getLegalMoves(s, { x: 3, y: 3 })).toEqual([{ x: 0, y: 3 }]);
  });

  it('sin rey propio, los movimientos legales son todos los de la pieza', () => {
    const s = stateWith([
      [3, 3, W('rook')],
      [0, 0, B('king')],
    ]);
    expect(getLegalMoves(s, { x: 3, y: 3 })).toHaveLength(14);
  });

  it('no modifica el tablero (está congelado)', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 1, W('rook')],
      [4, 7, B('rook')],
    ]);
    expect(() => getLegalMoves(s, { x: 4, y: 1 })).not.toThrow();
  });
});

describe('jaque mate', () => {
  it('mate del pasillo', () => {
    // Rey negro en (6,7) encerrado por sus peones; torre blanca en la fila 7.
    const s = stateWith([
      [0, 0, W('king')],
      [0, 7, W('rook')],
      [6, 7, B('king')],
      [5, 6, B('pawn')],
      [6, 6, B('pawn')],
      [7, 6, B('pawn')],
    ]);
    expect(isInCheck(s.board, 'black')).toBe(true);
    expect(hasAnyLegalMove(s, 'black')).toBe(false);
    expect(isCheckmate(s, 'black')).toBe(true);
    expect(isStalemate(s, 'black')).toBe(false);
  });

  it('mate de dama apoyada por el rey', () => {
    const s = stateWith([
      [0, 7, B('king')],
      [1, 6, W('queen')],
      [2, 5, W('king')],
    ]);
    expect(isCheckmate(s, 'black')).toBe(true);
  });

  it('no es mate si se puede capturar la pieza que da jaque', () => {
    // Igual que el anterior, pero la dama no está defendida.
    const s = stateWith([
      [0, 7, B('king')],
      [1, 6, W('queen')],
      [7, 0, W('king')],
    ]);
    expect(isInCheck(s.board, 'black')).toBe(true);
    expect(isCheckmate(s, 'black')).toBe(false);
  });

  it('no es mate si otra pieza puede tapar', () => {
    const s = stateWith([
      [0, 0, W('king')],
      [0, 7, W('rook')],
      [6, 7, B('king')],
      [5, 6, B('pawn')],
      [6, 6, B('pawn')],
      [7, 6, B('pawn')],
      [3, 5, B('knight')], // puede ir a (2,7) o (4,7) y tapar
    ]);
    expect(isCheckmate(s, 'black')).toBe(false);
  });
});

describe('ahogado', () => {
  it('rey en la esquina sin casillas y sin jaque', () => {
    const s = stateWith([
      [0, 7, B('king')],
      [2, 6, W('queen')],
      [7, 0, W('king')],
    ]);
    expect(isInCheck(s.board, 'black')).toBe(false);
    expect(isStalemate(s, 'black')).toBe(true);
    expect(isCheckmate(s, 'black')).toBe(false);
  });

  it('rey ahogado por rey y dama', () => {
    const s = stateWith([
      [7, 7, B('king')],
      [5, 6, W('king')],
      [6, 5, W('queen')],
    ]);
    expect(isStalemate(s, 'black')).toBe(true);
  });

  it('no es ahogado si otra pieza del mismo color puede moverse', () => {
    const s = stateWith([
      [0, 7, B('king')],
      [2, 6, W('queen')],
      [7, 0, W('king')],
      [7, 4, B('rook')],
    ]);
    expect(isStalemate(s, 'black')).toBe(false);
  });
});

describe('applyMove con reglas', () => {
  it('aplica una jugada legal', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [0, 7, B('king')],
    ]);
    const next = applyMove(s, { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } });
    expect(next.board[1][4]?.type).toBe('king');
    expect(next.turn).toBe('black');
  });

  it('ignora una jugada ilegal (devuelve el mismo estado)', () => {
    const s = stateWith([
      [4, 0, W('king')],
      [4, 1, W('bishop')],
      [4, 7, B('rook')],
    ]);
    expect(applyMove(s, { from: { x: 4, y: 1 }, to: { x: 5, y: 2 } })).toBe(s);
    expect(applyMove(s, { from: { x: 4, y: 0 }, to: { x: 4, y: 3 } })).toBe(s);
  });

  it('ignora jugadas de una casilla vacía o del color al que no le toca', () => {
    const s = stateWith(
      [
        [4, 0, W('king')],
        [0, 7, B('king')],
      ],
      'white',
    );
    expect(applyMove(s, { from: { x: 2, y: 2 }, to: { x: 2, y: 3 } })).toBe(s);
    expect(applyMove(s, { from: { x: 0, y: 7 }, to: { x: 0, y: 6 } })).toBe(s);
  });

  it('el peón blanco corona en dama al llegar a la última fila, conservando su id', () => {
    const pawn = W('pawn');
    const s = stateWith([[3, 6, pawn]]);
    const next = applyMove(s, { from: { x: 3, y: 6 }, to: { x: 3, y: 7 } });
    expect(next.board[7][3]).toEqual({ ...pawn, type: 'queen' });
  });

  it('el peón negro corona en la fila 0', () => {
    const s = stateWith([[3, 1, B('pawn')]], 'black');
    const next = applyMove(s, { from: { x: 3, y: 1 }, to: { x: 3, y: 0 } });
    expect(next.board[0][3].type).toBe('queen');
  });
});
