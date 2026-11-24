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

//Simula que el rey se ha movido de (4, 0) a (4, 1) y comprueba tres cosas:
//  Las dos casillas tienen la clase de resaltado y una casilla cualquiera, no.
//  La pieza del destino tiene la clase moving.
//  El desplazamiento es dx = 0 y dy = −1: el rey viene de una casilla más arriba.
describe('Board · última jugada', function () {
  it('resalta origen y destino y anima la pieza desde el origen', function () {
    const initialState = {
      ...createMockState(),
      board: createMockState().board.map((fila) => [...fila]),
      lastMove: { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },
    };
    // Colocamos el rey en el destino, como si ya se hubiera movido.
    initialState.board[1][4] = initialState.board[0][4];
    initialState.board[0][4] = null;

    render(
      <GameProvider initial={initialState}>
        <Board onSquareClick={() => {}} />
      </GameProvider>,
    );

    const casillas = screen.getAllByRole('button');
    const origen = casillas[0 * 8 + 4];
    const destino = casillas[1 * 8 + 4];
    expect(origen.className).toMatch(/lastMove/);
    expect(destino.className).toMatch(/lastMove/);
    expect(casillas[0].className).not.toMatch(/lastMove/);

    const img = destino.querySelector('img');
    expect(img.className).toMatch(/moving/);
    expect(img.style.getPropertyValue('--dx')).toBe('0');
    expect(img.style.getPropertyValue('--dy')).toBe('-1');
  });
});
