import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider, useGame } from './GameContext';
import { createMockState } from '../engine/mockState';

function TurnProbe() {
  const { state, dispatch } = useGame();
  const move = { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } };
  return (
    <>
      <p>turno: {state.turn}</p>
      <p>nivel: {state.levelId}</p>
      <p>resaltadas: {state.highlights.length}</p>
      <button onClick={() => dispatch({ type: 'MOVE', move })}>mover</button>
    </>
  );
}

describe('GameContext', () => {
  it('cualquier componente puede leer el estado sin haber despachado START', () => {
    render(
      <GameProvider>
        <TurnProbe />
      </GameProvider>,
    );
    expect(screen.getByText('turno: white')).toBeTruthy();
    expect(screen.getByText('nivel: easy-1')).toBeTruthy();
  });

  it('una acción despachada actualiza lo que se muestra', () => {
    render(
      <GameProvider>
        <TurnProbe />
      </GameProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'mover' }));
    expect(screen.getByText('turno: black')).toBeTruthy();
  });

  it('acepta una partida inicial y le añade los campos de la interfaz', () => {
    render(
      <GameProvider initial={{ ...createMockState(), levelId: 'hard-3' }}>
        <TurnProbe />
      </GameProvider>,
    );
    expect(screen.getByText('nivel: hard-3')).toBeTruthy();
    expect(screen.getByText('resaltadas: 0')).toBeTruthy();
  });

  it('useGame falla con un mensaje claro fuera del Provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TurnProbe />)).toThrow('useGame debe usarse dentro de <GameProvider>');
    consoleError.mockRestore();
  });
});
