import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HUD from './HUD';
import { GameProvider } from '../state/GameContext';
import { createMockState } from '../engine/mockState';

function renderHUD(objective) {
  const state = createMockState();
  state.objective = objective;

  render(
    <MemoryRouter>
      <GameProvider initial={state}>
        <HUD />
      </GameProvider>
    </MemoryRouter>,
  );
}

describe('HUD: texto del objetivo', function () {
  it('explica el objetivo de llegar a la casilla marcada', function () {
    renderHUD({ type: 'reachSquare', target: { x: 4, y: 7 } });

    expect(screen.getByText('Lleva al rey a la casilla marcada')).toBeTruthy();
  });

  it('explica el objetivo de dar jaque mate a las negras', function () {
    renderHUD({ type: 'checkmate' });

    expect(screen.getByText('Da jaque mate a las negras.')).toBeTruthy();
  });
});
