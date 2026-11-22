import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { isLegalMove } from '../rules.js';
import { createMockState } from '../mockState.js';
import { randomMove } from './randomAI.js';

describe('randomMove (2.C1 · IA aleatoria)', () => {
  it('devuelve siempre una jugada legal de una pieza negra', () => {
    const state = { ...createMockState(), turn: 'black' };
    // La repetimos varias veces porque el resultado es aleatorio.
    for (let i = 0; i < 20; i += 1) {
      const move = randomMove(state);
      expect(state.board[move.from.y][move.from.x].color).toBe('black');
      expect(isLegalMove(state, move)).toBe(true);
    }
  });

  it('devuelve null si las negras no tienen ninguna pieza', () => {
    const board = setPiece(
      createBoard(8, 8),
      { x: 4, y: 0 },
      { id: 'w-k', type: 'king', color: 'white' },
    );
    expect(randomMove({ ...createMockState(), board, turn: 'black' })).toBeNull();
  });
});