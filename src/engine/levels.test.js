import { describe, it, expect } from 'vitest';
import levels from './levels.json';
import { MOCK_STATE } from './mockState';

const OBJECTIVE_TYPES = ['reachSquare', 'checkmate'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const PIECE_TYPES = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];

const isInside = (size, { x, y }) => x >= 0 && x < size.width && y >= 0 && y < size.height;

describe('levels.json', () => {
  it('se importa como una lista con al menos un nivel', () => {
    expect(Array.isArray(levels)).toBe(true);
    expect(levels.length).toBeGreaterThan(0);
  });

  it('no repite ids de nivel', () => {
    const ids = levels.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(levels.map((level) => [level.id, level]))('nivel %s', (_id, level) => {
    it('tiene nombre, dificultad, límite de jugadas y número de obstáculos válidos', () => {
      expect(level.name).toEqual(expect.any(String));
      expect(DIFFICULTIES).toContain(level.difficulty);
      expect(Number.isInteger(level.maxMoves) && level.maxMoves > 0).toBe(true);
      expect(Number.isInteger(level.obstacles.count) && level.obstacles.count >= 0).toBe(true);
    });

    it('tiene un objetivo válido', () => {
      expect(OBJECTIVE_TYPES).toContain(level.objective.type);
      if (level.objective.type === 'reachSquare') {
        expect(isInside(level.size, level.objective.target)).toBe(true);
      }
    });

    it('tiene piezas válidas, dentro del tablero y un rey blanco', () => {
      for (const piece of level.pieces) {
        expect(PIECE_TYPES).toContain(piece.type);
        expect(['white', 'black']).toContain(piece.color);
        expect(isInside(level.size, piece)).toBe(true);
      }
      expect(level.pieces.some((p) => p.type === 'king' && p.color === 'white')).toBe(true);
    });

    it('no repite ids de pieza ni casillas', () => {
      const ids = level.pieces.map((p) => p.id);
      const squares = level.pieces.map((p) => `${p.x},${p.y}`);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(squares).size).toBe(squares.length);
    });
  });

  it('easy-1 encaja con el estado acordado en docs/estado.md', () => {
    const level = levels.find(({ id }) => id === MOCK_STATE.levelId);
    const board = Array.from({ length: level.size.height }, () =>
      Array(level.size.width).fill(null),
    );
    for (const { x, y, ...piece } of level.pieces) board[y][x] = piece;

    expect(board).toEqual(MOCK_STATE.board);
    expect(level.objective).toEqual(MOCK_STATE.objective);
    expect(level.maxMoves).toBe(MOCK_STATE.maxMoves);
  });
});
