import { describe, it, expect } from 'vitest';
import { createBoard } from './board';
import { createMockState } from './mockState';
import { isObjectiveMet } from './objectives';

function createEmptyState(objective) {
  const state = createMockState();
  state.board = createBoard(8, 8);
  state.obstacles = [];
  state.objective = objective;
  return state;
}

describe('objetivo reachSquare', function () {
  it('se cumple cuando el rey blanco está en la casilla objetivo', function () {
    const state = createMockState();
    state.objective.target = { x: 4, y: 0 };
    const snapshot = structuredClone(state);

    expect(isObjectiveMet(state)).toBe(true);
    expect(state).toEqual(snapshot);
  });

  it('no se cumple cuando el rey blanco todavía no ha llegado', function () {
    expect(isObjectiveMet(createMockState())).toBe(false);
  });

  it('no se cumple si quien llega es el rey negro', function () {
    const state = createMockState();
    state.board[7][4] = { id: 'b-king', type: 'king', color: 'black' };

    expect(isObjectiveMet(state)).toBe(false);
  });

  it('no se cumple si otra pieza blanca ocupa el objetivo', function () {
    const state = createMockState();
    state.board[7][4] = { id: 'w-queen', type: 'queen', color: 'white' };

    expect(isObjectiveMet(state)).toBe(false);
  });

  it('devuelve false si no existe un rey blanco', function () {
    const state = createMockState();
    state.board[0][4] = null;

    expect(isObjectiveMet(state)).toBe(false);
  });
});

describe('objetivo checkmate', function () {
  it('se cumple cuando el rey negro está en jaque mate', function () {
    const state = createEmptyState({ type: 'checkmate' });
    state.board[7][0] = { id: 'b-king', type: 'king', color: 'black' };
    state.board[6][1] = { id: 'w-queen', type: 'queen', color: 'white' };
    state.board[5][2] = { id: 'w-king', type: 'king', color: 'white' };

    expect(isObjectiveMet(state)).toBe(true);
  });

  it('no confunde un jaque con un jaque mate', function () {
    // El rey negro puede capturar la dama porque no está defendida.
    const state = createEmptyState({ type: 'checkmate' });
    state.board[7][0] = { id: 'b-king', type: 'king', color: 'black' };
    state.board[6][1] = { id: 'w-queen', type: 'queen', color: 'white' };
    state.board[0][7] = { id: 'w-king', type: 'king', color: 'white' };

    expect(isObjectiveMet(state)).toBe(false);
  });

  it('no confunde un rey negro ahogado con un jaque mate', function () {
    // El rey no está en jaque, pero todas sus casillas de salida están atacadas.
    const state = createEmptyState({ type: 'checkmate' });
    state.board[7][0] = { id: 'b-king', type: 'king', color: 'black' };
    state.board[6][2] = { id: 'w-queen', type: 'queen', color: 'white' };
    state.board[0][7] = { id: 'w-king', type: 'king', color: 'white' };

    expect(isObjectiveMet(state)).toBe(false);
  });

  it('no declara mate si el nivel no contiene rey negro', function () {
    const state = createEmptyState({ type: 'checkmate' });
    state.board[0][4] = { id: 'w-king', type: 'king', color: 'white' };

    expect(isObjectiveMet(state)).toBe(false);
  });
});

describe('tipo de objetivo', function () {
  it('rechaza un objetivo desconocido con un error claro', function () {
    const state = createEmptyState({ type: 'unknown' });

    expect(function () {
      isObjectiveMet(state);
    }).toThrow(RangeError);
  });
});
