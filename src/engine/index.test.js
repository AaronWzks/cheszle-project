import { describe, it, expect } from 'vitest';
import { createGame, getLegalMoves, applyMove, checkStatus, getAIMove } from './index';
import { MOCK_STATE, createMockState } from './mockState';
import { createBoard } from './board';
import { hasAnyLegalMove } from './rules';

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

describe('checkStatus con objetivos y reglas reales', function () {
  it('continúa jugando antes del límite de jugadas', function () {
    const state = createMockState();
    state.moveCount = state.maxMoves - 1;

    expect(checkStatus(state)).toBe('playing');
  });

  it('permite alcanzar exactamente maxMoves', function () {
    const state = createMockState();
    state.moveCount = state.maxMoves;

    expect(checkStatus(state)).toBe('playing');
  });

  it('pierde al superar maxMoves, independientemente del turno', function () {
    const state = createMockState();
    state.moveCount = state.maxMoves + 1;

    expect(checkStatus(state)).toBe('lost');
    state.turn = 'black';
    expect(checkStatus(state)).toBe('lost');
  });

  it('da prioridad a ganar si el objetivo está cumplido aunque se supere el límite', function () {
    const state = createMockState();
    state.objective.target = { x: 4, y: 0 };
    state.moveCount = state.maxMoves + 1;
    state.turn = 'black';

    expect(checkStatus(state)).toBe('won');
  });

  it('gana al cumplir el objetivo de jaque mate a las negras', function () {
    const state = createMockState();
    state.board = createBoard(8, 8);
    state.obstacles = [];
    state.objective = { type: 'checkmate' };
    state.turn = 'black';
    state.board[7][0] = { id: 'b-king', type: 'king', color: 'black' };
    state.board[6][1] = { id: 'w-queen', type: 'queen', color: 'white' };
    state.board[5][2] = { id: 'w-king', type: 'king', color: 'white' };

    expect(checkStatus(state)).toBe('won');
  });

  it('pierde cuando el rey blanco está en mate al comenzar su turno', function () {
    const state = createMockState();
    state.board = createBoard(8, 8);
    state.obstacles = [];
    state.board[0][0] = { id: 'w-king', type: 'king', color: 'white' };
    state.board[1][1] = { id: 'b-queen', type: 'queen', color: 'black' };
    state.board[2][2] = { id: 'b-king', type: 'king', color: 'black' };

    expect(checkStatus(state)).toBe('lost');
  });

  it('pierde cuando las blancas están ahogadas al comenzar su turno', function () {
    const state = createMockState();
    state.board = createBoard(8, 8);
    state.obstacles = [];
    state.board[0][0] = { id: 'w-king', type: 'king', color: 'white' };
    state.board[1][2] = { id: 'b-queen', type: 'queen', color: 'black' };
    state.board[7][7] = { id: 'b-king', type: 'king', color: 'black' };

    expect(checkStatus(state)).toBe('lost');
  });

  it('no declara derrota blanca porque las negras no tengan movimientos', function () {
    const state = createMockState();
    state.board = createBoard(8, 8);
    state.obstacles = [];
    state.objective = { type: 'checkmate' };
    state.board[7][0] = { id: 'b-king', type: 'king', color: 'black' };
    state.board[6][2] = { id: 'w-queen', type: 'queen', color: 'white' };
    state.board[0][7] = { id: 'w-king', type: 'king', color: 'white' };

    expect(hasAnyLegalMove(state, 'black')).toBe(false);
    expect(checkStatus(state)).toBe('playing');
  });

  it('espera a las negras antes de evaluar la falta de movimientos de las blancas', function () {
    const state = createMockState();
    state.board = createBoard(8, 8);
    state.obstacles = [];
    state.board[6][0] = { id: 'w-king', type: 'king', color: 'white' };
    state.board[6][2] = { id: 'b-queen', type: 'queen', color: 'black' };
    state.board[0][7] = { id: 'b-king', type: 'king', color: 'black' };

    const afterWhite = applyMove(state, {
      from: { x: 0, y: 6 },
      to: { x: 0, y: 7 },
    });

    expect(afterWhite.turn).toBe('black');
    expect(hasAnyLegalMove(afterWhite, 'white')).toBe(false);
    expect(checkStatus(afterWhite)).toBe('playing');

    const afterBlack = applyMove(afterWhite, {
      from: { x: 2, y: 6 },
      to: { x: 3, y: 6 },
    });

    expect(afterBlack.turn).toBe('white');
    expect(hasAnyLegalMove(afterBlack, 'white')).toBe(true);
    expect(checkStatus(afterBlack)).toBe('playing');
  });

  it('comprueba el estado sin modificar sus datos', function () {
    const state = createMockState();
    const snapshot = structuredClone(state);

    checkStatus(state);

    expect(state).toEqual(snapshot);
  });
});
