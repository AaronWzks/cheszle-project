import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import Game from './Game';
import { GameProvider } from '../state/GameContext';
import { createMockState } from '../engine/mockState';
import { createBoard, setPiece } from '../engine/board';
import { MemoryRouter } from 'react-router-dom';

// Estado de ejemplo (easy-1): rey blanco en (4,0) y torre negra en (0,5).
function renderGame(initial = createMockState()) {
  render(
    <MemoryRouter>
      <GameProvider initial={initial}>
        <Game />
      </GameProvider>
    </MemoryRouter>,
  );
}

function boardSquares() {
  const board = screen.getByRole('group', {
    name: 'Tablero de ajedrez',
  });

  return within(board).getAllByRole('button');
}

function square(x, y) {
  return boardSquares()[y * 8 + x];
}

const click = (x, y) => fireEvent.click(square(x, y));
const isSelected = (x, y) => square(x, y).getAttribute('aria-pressed') === 'true';
const isTarget = (x, y) => /highlighted|capture/.test(square(x, y).className);

function targets() {
  return boardSquares().filter(function (button) {
    return /highlighted|capture/.test(button.className);
  });
}

const pieceIn = (x, y) => within(square(x, y)).queryByRole('img')?.getAttribute('alt') ?? null;

describe('Game: seleccionar y mover', () => {
  it('al pulsar una pieza propia se selecciona y se resaltan sus movimientos legales', () => {
    renderGame();
    click(4, 0);
    expect(isSelected(4, 0)).toBe(true);
    expect(targets()).toHaveLength(5);
    expect(isTarget(4, 1)).toBe(true);
  });

  it('al pulsar un destino resaltado la pieza se mueve y cambia el turno', () => {
    renderGame();
    click(4, 0);
    click(4, 1);
    expect(pieceIn(4, 1)).toBe('Rey blanco');
    expect(pieceIn(4, 0)).toBe(null);
    expect(targets()).toHaveLength(0);
    expect(isSelected(4, 1)).toBe(false);

    // Ahora le toca a las negras: el rey blanco ya no se puede seleccionar.
    click(4, 1);
    expect(isSelected(4, 1)).toBe(false);
  });

  it('no se puede seleccionar una pieza del color al que no le toca', () => {
    renderGame();
    click(0, 5);
    expect(isSelected(0, 5)).toBe(false);
    expect(targets()).toHaveLength(0);
  });

  // 2.C3: antes este test movía también las negras a mano. Ahora las negras
  // solo las mueve la IA, así que se comprueba que el jugador NO puede tocarlas.
  it('mientras la IA piensa no se pueden mover las negras a mano', () => {
    renderGame();
    click(4, 0);
    click(4, 1); // blancas → ahora piensa la IA
    click(0, 5);
    expect(isSelected(0, 5)).toBe(false);
    expect(targets()).toHaveLength(0);
  });

  it('pulsar la pieza seleccionada o una casilla no resaltada quita la selección', () => {
    renderGame();
    click(4, 0);
    click(4, 0);
    expect(isSelected(4, 0)).toBe(false);

    click(4, 0);
    click(7, 7);
    expect(isSelected(4, 0)).toBe(false);
    expect(targets()).toHaveLength(0);
    expect(pieceIn(4, 0)).toBe('Rey blanco'); // no se ha movido
  });

  it('una casilla con pieza enemiga se marca como captura', () => {
    let board = createBoard(8, 8);
    board = setPiece(board, { x: 0, y: 0 }, { id: 'w-rook', type: 'rook', color: 'white' });
    board = setPiece(board, { x: 0, y: 3 }, { id: 'b-pawn', type: 'pawn', color: 'black' });
    renderGame({ ...createMockState(), board });

    click(0, 0);
    expect(square(0, 3).className).toMatch(/capture/);
    expect(square(0, 2).className).toMatch(/highlighted/);
    click(0, 3);
    expect(pieceIn(0, 3)).toMatch(/^Torre blanc/);
  });
});

describe('Game: IA de prueba (2.C1)', () => {
  it('las negras mueven solas después de la jugada del jugador', async () => {
    renderGame();
    click(4, 0);
    click(4, 1); // jugada de las blancas
    // La torre negra empieza en (0,5); cuando la IA juega, deja esa casilla.
    await waitFor(() => expect(pieceIn(0, 5)).toBeNull());
    click(4, 1);
    expect(isSelected(4, 1)).toBe(true); // vuelve a tocar a las blancas
  });
});

describe('Game: indicador «IA pensando...» (2.C3)', () => {
  const indicator = () => screen.getByRole('status');

  it('al empezar no se ve el indicador', () => {
    renderGame();
    expect(indicator().textContent).toBe('');
  });

  it('aparece tras la jugada del jugador y desaparece cuando la IA mueve', async () => {
    renderGame();
    click(4, 0);
    click(4, 1); // jugada de las blancas
    expect(indicator().textContent).toBe('La IA está pensando...');

    await waitFor(() => expect(pieceIn(0, 5)).toBeNull()); // la IA ya movió
    expect(indicator().textContent).toBe('');
  });

  it('mientras la IA piensa el tablero está bloqueado', async () => {
    renderGame();
    click(4, 0);
    click(4, 1);
    const board = screen.getByRole('group', { name: 'Tablero de ajedrez' });
    expect(board.getAttribute('aria-busy')).toBe('true');

    click(4, 1); // intento de seleccionar el rey mientras piensa
    expect(isSelected(4, 1)).toBe(false);

    await waitFor(() => expect(board.getAttribute('aria-busy')).toBe('false'));
  });
});