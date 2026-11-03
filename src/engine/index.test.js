import { describe, it, expect } from 'vitest';
import { createGame, getLegalMoves, applyMove, checkStatus, getAIMove } from './index';
import { MOCK_STATE, createMockState } from './mockState';

describe('contrato del motor', () => {
  it('createGame devuelve un estado con la forma acordada', () => {
    const state = createGame('easy-1');
    expect(state).toMatchObject({
      levelId: 'easy-1',
      turn: 'white',
      moveCount: 0,
      history: [],
      status: 'playing',
    });
    expect(state.board).toHaveLength(8);
    state.board.forEach((row) => expect(row).toHaveLength(8));
    expect(Array.isArray(state.obstacles)).toBe(true);
    expect(state.objective.type).toBe('reachSquare');
  });

  it('createGame usa el levelId recibido', () => {
    expect(createGame('medium-2').levelId).toBe('medium-2');
  });

  it('createGame devuelve copias independientes', () => {
    const a = createGame('easy-1');
    const b = createGame('easy-1');
    a.board[0][0] = { id: 'x', type: 'pawn', color: 'white' };
    expect(b.board[0][0]).toBe(null);
    expect(MOCK_STATE.board[0][0]).toBe(null);
  });

  it('getLegalMoves devuelve una lista de posiciones', () => {
    const state = createGame('easy-1');
    const moves = getLegalMoves(state, { x: 4, y: 0 });
    expect(Array.isArray(moves)).toBe(true);
    moves.forEach((m) => {
      expect(typeof m.x).toBe('number');
      expect(typeof m.y).toBe('number');
    });
  });

  it('getLegalMoves devuelve [] en una casilla vacía', () => {
    expect(getLegalMoves(createGame('easy-1'), { x: 0, y: 0 })).toEqual([]);
  });

  it('applyMove devuelve un estado nuevo sin modificar el original', () => {
    const state = createMockState();
    const move = { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } };
    const next = applyMove(state, move);

    expect(next).not.toBe(state);
    expect(next.turn).toBe('black');
    expect(next.moveCount).toBe(1);
    expect(next.history).toEqual([move]);
    expect(next.board[1][4]).toEqual(state.board[0][4]);
    expect(next.board[0][4]).toBe(null);

    // el original sigue igual
    expect(state.turn).toBe('white');
    expect(state.moveCount).toBe(0);
    expect(state.history).toEqual([]);
    expect(state.board[0][4]).not.toBe(null);
  });

  it('checkStatus devuelve un estado válido', () => {
    expect(['playing', 'won', 'lost']).toContain(checkStatus(createGame('easy-1')));
  });

  it('getAIMove devuelve una Promise con una jugada { from, to }', async () => {
    const result = getAIMove(createGame('easy-1'), 'easy');
    expect(result).toBeInstanceOf(Promise);
    const move = await result;
    expect(move).toMatchObject({
      from: { x: expect.any(Number), y: expect.any(Number) },
      to: { x: expect.any(Number), y: expect.any(Number) },
    });
  });
});
