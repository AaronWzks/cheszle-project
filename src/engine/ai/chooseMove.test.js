/**
 * Tests de la tarea 2.C3: dificultades de la IA.
 */
import { describe, it, expect } from 'vitest';
import { createBoard, setPiece } from '../board.js';
import { getAllLegalMoves } from '../rules.js';
import { chooseMove } from './chooseMove.js';
import { findBestMove } from './minimax.js';
import { DEPTH, RANDOM_MOVE_CHANCE } from './config.js';

// Posición sencilla: la torre negra puede capturar un caballo blanco sin defender.
function stateWithFreeCapture() {
  let board = createBoard(8, 8);
  board = setPiece(board, { x: 7, y: 0 }, { id: 'w-king', type: 'king', color: 'white' });
  board = setPiece(board, { x: 0, y: 2 }, { id: 'w-knight', type: 'knight', color: 'white' });
  board = setPiece(board, { x: 0, y: 5 }, { id: 'b-rook', type: 'rook', color: 'black' });
  board = setPiece(board, { x: 7, y: 7 }, { id: 'b-king', type: 'king', color: 'black' });
  return {
    levelId: 'test',
    board,
    obstacles: [],
    turn: 'black',
    objective: { type: 'checkmate' },
    moveCount: 0,
    maxMoves: 20,
    history: [],
    status: 'playing',
  };
}

describe('config de la IA (2.C3)', () => {
  it('cada dificultad tiene su profundidad', () => {
    expect(DEPTH).toEqual({ easy: 1, medium: 3, hard: 4 });
  });

  it('solo en fácil juega al azar, un 30 % de las veces', () => {
    expect(RANDOM_MOVE_CHANCE).toEqual({ easy: 0.3, medium: 0, hard: 0 });
  });
});

describe('chooseMove (2.C3)', () => {
  it('si el número aleatorio es menor que la probabilidad, juega al azar (jugada legal)', () => {
    const state = stateWithFreeCapture();
    // random() devuelve siempre 0.1 → 0.1 < 0.3 → jugada al azar
    const move = chooseMove(state, 1, 0.3, () => 0.1);
    const legal = getAllLegalMoves(state, 'black');
    expect(legal).toContainEqual(move);
  });

  it('si el número aleatorio es mayor o igual, usa minimax', () => {
    const state = stateWithFreeCapture();
    // random() devuelve siempre 0.9 → 0.9 >= 0.3 → minimax
    expect(chooseMove(state, 1, 0.3, () => 0.9)).toEqual(findBestMove(state, 1));
  });

  it('con probabilidad 0 (medio y difícil) siempre usa minimax', () => {
    const state = stateWithFreeCapture();
    expect(chooseMove(state, 3, 0, () => 0)).toEqual(findBestMove(state, 3));
  });
});