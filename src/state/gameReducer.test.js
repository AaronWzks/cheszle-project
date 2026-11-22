import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState, DEFAULT_LEVEL_ID } from './gameReducer';
import { createMockState } from '../engine/mockState';
import { createBoard } from '../engine/board';

const KING = { x: 4, y: 0 };
const EMPTY = { x: 0, y: 0 };

describe('createInitialState', () => {
  it('sin partida crea el nivel por defecto', () => {
    const state = createInitialState();
    expect(state.levelId).toBe(DEFAULT_LEVEL_ID);
    expect(state.selected).toBe(null);
    expect(state.highlights).toEqual([]);
  });

  it('completa con los campos de la interfaz una partida recibida', () => {
    const state = createInitialState(createMockState());
    expect(state.selected).toBe(null);
    expect(state.highlights).toEqual([]);
    expect(state.turn).toBe('white');
  });

  it('respeta los campos de la interfaz que ya traiga la partida', () => {
    const highlights = [{ x: 1, y: 1 }];
    expect(createInitialState({ ...createMockState(), highlights }).highlights).toEqual(highlights);
  });
});

describe('gameReducer', () => {
  it('START crea una partida del nivel pedido, sin selección', () => {
    const previous = { ...createInitialState(), selected: KING, highlights: [EMPTY] };
    const state = gameReducer(previous, { type: 'START', levelId: 'medium-2' });
    expect(state.levelId).toBe('medium-2');
    expect(state.selected).toBe(null);
    expect(state.highlights).toEqual([]);
  });

  it('SELECT guarda la casilla y sus movimientos legales', () => {
    const state = gameReducer(createInitialState(), { type: 'SELECT', square: KING });
    expect(state.selected).toEqual(KING);
    // Rey blanco en (4,0) con el tablero de easy-1: las 5 casillas de alrededor.
    expect(state.highlights).toHaveLength(5);
    expect(state.highlights).toContainEqual({ x: 4, y: 1 });
  });

  it('SELECT en una casilla vacía no resalta nada', () => {
    const state = gameReducer(createInitialState(), { type: 'SELECT', square: EMPTY });
    expect(state.selected).toEqual(EMPTY);
    expect(state.highlights).toEqual([]);
  });

  it('DESELECT quita la selección y los resaltados', () => {
    const selected = gameReducer(createInitialState(), { type: 'SELECT', square: KING });
    const state = gameReducer(selected, { type: 'DESELECT' });
    expect(state.selected).toBe(null);
    expect(state.highlights).toEqual([]);
    expect(state.board).toBe(selected.board);
  });

  it('MOVE aplica la jugada, cambia el turno y limpia la selección', () => {
    const selected = gameReducer(createInitialState(), { type: 'SELECT', square: KING });
    const to = { x: 4, y: 1 };
    const state = gameReducer(selected, { type: 'MOVE', move: { from: KING, to } });

    expect(state.board[to.y][to.x]).toMatchObject({ id: 'w-king' });
    expect(state.board[KING.y][KING.x]).toBe(null);
    expect(state.turn).toBe('black');
    expect(state.history).toEqual([{ from: KING, to }]);
    expect(state.selected).toBe(null);
    expect(state.highlights).toEqual([]);
  });

  //Comprueba dos cosas: que después de mover, lastMove es la jugada hecha,
  // y que al empezar una partida nueva vuelve a null.
  it('MOVE guarda la última jugada y START la borra', () => {
    const move = { from: KING, to: { x: 4, y: 1 } };
    const moved = gameReducer(createInitialState(), { type: 'MOVE', move });
    expect(moved.lastMove).toEqual(move);
    expect(gameReducer(moved, { type: 'START', levelId: DEFAULT_LEVEL_ID }).lastMove).toBe(null);
  });


  it('no modifica el estado que recibe', () => {
    const previous = createInitialState();
    const snapshot = structuredClone(previous);
    gameReducer(previous, { type: 'SELECT', square: KING });
    gameReducer(previous, { type: 'MOVE', move: { from: KING, to: { x: 4, y: 1 } } });
    gameReducer(previous, { type: 'START', levelId: 'medium-2' });
    expect(previous).toEqual(snapshot);
  });

  it('con una acción desconocida devuelve el mismo estado', () => {
    const previous = createInitialState();
    expect(gameReducer(previous, { type: 'NO_EXISTE' })).toBe(previous);
  });
});

describe('MOVE actualiza el resultado de la partida', function () {
  it('gana al mover el rey a la casilla objetivo y conserva el estado anterior', function () {
    const previous = createInitialState(createMockState());
    previous.objective.target = { x: 4, y: 1 };
    previous.selected = { x: 4, y: 0 };
    previous.highlights = [{ x: 4, y: 1 }];
    const snapshot = structuredClone(previous);

    const next = gameReducer(previous, {
      type: 'MOVE',
      move: { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },
    });

    expect(next.board[1][4]).toMatchObject({ id: 'w-king' });
    expect(next.status).toBe('won');
    expect(next.selected).toBe(null);
    expect(next.highlights).toEqual([]);
    expect(previous).toEqual(snapshot);
  });

  it('mantiene playing tras una jugada que no termina la partida', function () {
    const previous = createInitialState(createMockState());

    const next = gameReducer(previous, {
      type: 'MOVE',
      move: { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },
    });

    expect(next.turn).toBe('black');
    expect(next.status).toBe('playing');
  });

  it('detecta el mate blanco causado por una jugada legal negra', function () {
    const game = createMockState();
    game.board = createBoard(8, 8);
    game.obstacles = [];
    game.turn = 'black';
    game.board[0][0] = { id: 'w-king', type: 'king', color: 'white' };
    game.board[2][1] = { id: 'b-queen', type: 'queen', color: 'black' };
    game.board[2][2] = { id: 'b-king', type: 'king', color: 'black' };
    const previous = createInitialState(game);

    const next = gameReducer(previous, {
      type: 'MOVE',
      move: { from: { x: 1, y: 2 }, to: { x: 1, y: 1 } },
    });

    expect(next.board[1][1]).toMatchObject({ id: 'b-queen' });
    expect(next.turn).toBe('white');
    expect(next.status).toBe('lost');
  });

  it('detecta el ahogado blanco causado por una jugada legal negra', function () {
    const game = createMockState();
    game.board = createBoard(8, 8);
    game.obstacles = [];
    game.turn = 'black';
    game.board[0][0] = { id: 'w-king', type: 'king', color: 'white' };
    game.board[1][3] = { id: 'b-queen', type: 'queen', color: 'black' };
    game.board[7][7] = { id: 'b-king', type: 'king', color: 'black' };
    const previous = createInitialState(game);

    const next = gameReducer(previous, {
      type: 'MOVE',
      move: { from: { x: 3, y: 1 }, to: { x: 2, y: 1 } },
    });

    expect(next.board[1][2]).toMatchObject({ id: 'b-queen' });
    expect(next.turn).toBe('white');
    expect(next.status).toBe('lost');
  });

  it('pierde si la nueva jugada supera maxMoves, aunque ahora toque a las negras', function () {
    const previous = createInitialState(createMockState());
    previous.moveCount = previous.maxMoves;

    const next = gameReducer(previous, {
      type: 'MOVE',
      move: { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },
    });

    expect(next.moveCount).toBe(previous.maxMoves + 1);
    expect(next.turn).toBe('black');
    expect(next.status).toBe('lost');
    expect(previous.moveCount).toBe(previous.maxMoves);
    expect(previous.status).toBe('playing');
  });
});
