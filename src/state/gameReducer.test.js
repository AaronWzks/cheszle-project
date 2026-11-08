import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState, DEFAULT_LEVEL_ID } from './gameReducer';
import { createMockState } from '../engine/mockState';

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
    expect(state.highlights).toEqual([{ x: 4, y: 1 }]);
  });

  it('SELECT en una casilla vacía no resalta nada', () => {
    const state = gameReducer(createInitialState(), { type: 'SELECT', square: EMPTY });
    expect(state.selected).toEqual(EMPTY);
    expect(state.highlights).toEqual([]);
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
