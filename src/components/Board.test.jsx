import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from './Board';
import { GameProvider } from '../state/GameContext';
import { createMockState } from '../engine/mockState';

// Cada prueba utiliza una copia nueva del estado de ejemplo.
function renderBoard(onSquareClick) {
  const initialState = createMockState();

  render(
    <GameProvider initial={initialState}>
      <Board onSquareClick={onSquareClick} />
    </GameProvider>,
  );
}

describe('Board', function () {
  it('pinta 64 casillas sin ejecutar el callback durante el dibujo', function () {
    const onSquareClick = vi.fn();

    renderBoard(onSquareClick);

    expect(screen.getAllByRole('button')).toHaveLength(64);
    expect(onSquareClick).not.toHaveBeenCalled();
  });

  it.each([
    [0, 0],
    [7, 0],
    [0, 7],
    [7, 7],
    [4, 0],
    [0, 5],
  ])('comunica las coordenadas al pulsar la casilla (%s, %s)', function (x, y) {
    const onSquareClick = vi.fn();

    renderBoard(onSquareClick);

    const casillas = screen.getAllByRole('button');
    const indice = y * 8 + x;

    fireEvent.click(casillas[indice]);

    expect(onSquareClick).toHaveBeenCalledTimes(1);
    expect(onSquareClick).toHaveBeenCalledWith({ x, y });
  });
});