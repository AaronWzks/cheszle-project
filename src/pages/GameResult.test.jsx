import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  act,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Game from './Game';
import Menu from './Menu';
import LevelSelect from './LevelSelect';
import { GameProvider } from '../state/GameContext';
import { createMockState } from '../engine/mockState';
import { createBoard } from '../engine/board';
import levels from '../engine/levels.json';
import * as engine from '../engine';

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(function () {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

afterAll(function () {
  if (originalShowModal === undefined) {
    delete HTMLDialogElement.prototype.showModal;
  } else {
    HTMLDialogElement.prototype.showModal = originalShowModal;
  }

  if (originalClose === undefined) {
    delete HTMLDialogElement.prototype.close;
  } else {
    HTMLDialogElement.prototype.close = originalClose;
  }
});

function renderGame(initial = createMockState()) {
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <GameProvider initial={initial}>
        <Routes>
          <Route path="/game" element={<Game />} />
          <Route path="/" element={<Menu />} />
          <Route path="/levels" element={<LevelSelect />} />
        </Routes>
      </GameProvider>
    </MemoryRouter>,
  );
}

function square(x, y) {
  const board = screen.getByRole('group', {
    name: 'Tablero de ajedrez',
  });

  return within(board).getAllByRole('button')[y * 8 + x];
}

function click(x, y) {
  fireEvent.click(square(x, y));
}

function isSelected(x, y) {
  return square(x, y).getAttribute('aria-pressed') === 'true';
}

// La IA espera 400 ms antes de pedir una jugada.
async function waitForAITimer() {
  await act(async function () {
    await new Promise(function (resolve) {
      setTimeout(resolve, 450);
    });
  });
}

describe('Game: resultado de la partida', function () {
  it('muestra la victoria, desactiva Siguiente en el último nivel y conserva el estado', function () {
    const initial = createMockState();
    initial.levelId = levels[levels.length - 1].id;
    initial.objective.target = { x: 4, y: 0 };
    initial.status = 'won';

    const snapshot = structuredClone(initial);

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: '¡Nivel superado!',
    });

    const next = within(dialog).getByRole('button', {
      name: 'Siguiente nivel',
    });

    expect(
      within(dialog).getByText('Has cumplido el objetivo del nivel.'),
    ).toBeTruthy();

    expect(
      within(dialog).getByRole('button', { name: 'Menú' }),
    ).toBeTruthy();

    expect(next.disabled).toBe(true);

    fireEvent.click(next);

    expect(
      screen.getByRole('dialog', { name: '¡Nivel superado!' }),
    ).toBe(dialog);

    click(4, 0);

    expect(isSelected(4, 0)).toBe(false);
    expect(initial).toEqual(snapshot);
  });

  it('abre la victoria tras cumplir el objetivo y no inicia otra jugada de la IA', async function () {
    const getAIMove = vi.spyOn(engine, 'getAIMove');

    try {
      const initial = createMockState();
      initial.objective.target = { x: 4, y: 1 };

      const snapshot = structuredClone(initial);

      renderGame(initial);

      expect(screen.queryByRole('dialog')).toBe(null);

      click(4, 0);
      click(4, 1);

      expect(
        screen.getByRole('dialog', { name: '¡Nivel superado!' }),
      ).toBeTruthy();

      expect(
        within(square(4, 1)).getByRole('img', {
          name: 'Rey blanco',
        }),
      ).toBeTruthy();

      await waitForAITimer();

      expect(getAIMove).not.toHaveBeenCalled();

      expect(
        screen.getByRole('group', {
          name: 'Tablero de ajedrez',
        }).getAttribute('aria-busy'),
      ).toBe('false');

      expect(initial).toEqual(snapshot);
    } finally {
      getAIMove.mockRestore();
    }
  });

  it('explica la derrota por jaque mate al rey blanco', function () {
    const initial = createMockState();

    initial.board = createBoard(8, 8);
    initial.board[0][0] = {
      id: 'w-king',
      type: 'king',
      color: 'white',
    };
    initial.board[1][1] = {
      id: 'b-queen',
      type: 'queen',
      color: 'black',
    };
    initial.board[2][2] = {
      id: 'b-king',
      type: 'king',
      color: 'black',
    };
    initial.status = 'lost';

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: 'Has perdido',
    });

    expect(
      within(dialog).getByText('Tu rey está en jaque mate.'),
    ).toBeTruthy();

    expect(
      within(dialog).getByRole('button', { name: 'Reintentar' }),
    ).toBeTruthy();
  });

  it('explica la derrota cuando las blancas están ahogadas', function () {
    const initial = createMockState();

    initial.board = createBoard(8, 8);
    initial.board[0][0] = {
      id: 'w-king',
      type: 'king',
      color: 'white',
    };
    initial.board[1][2] = {
      id: 'b-queen',
      type: 'queen',
      color: 'black',
    };
    initial.board[7][7] = {
      id: 'b-king',
      type: 'king',
      color: 'black',
    };
    initial.status = 'lost';

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: 'Has perdido',
    });

    expect(
      within(dialog).getByText('No tienes movimientos legales.'),
    ).toBeTruthy();
  });

  it('superar el límite muestra la derrota sin pedir IA y Reintentar reinicia el mismo nivel', async function () {
    const getAIMove = vi.spyOn(engine, 'getAIMove');

    try {
      const initial = createMockState();
      initial.levelId = 'retry-test';
      initial.moveCount = initial.maxMoves;

      const snapshot = structuredClone(initial);

      renderGame(initial);

      click(4, 0);
      click(4, 1);

      const dialog = screen.getByRole('dialog', {
        name: 'Has perdido',
      });

      expect(
        within(dialog).getByText(
          'Has superado el límite de jugadas.',
        ),
      ).toBeTruthy();

      await waitForAITimer();

      expect(getAIMove).not.toHaveBeenCalled();

      fireEvent.click(
        within(dialog).getByRole('button', {
          name: 'Reintentar',
        }),
      );

      expect(screen.queryByRole('dialog')).toBe(null);

      expect(
        screen.getByRole('heading', { name: 'retry-test' }),
      ).toBeTruthy();

      expect(
        screen.getByText('Movimientos restantes: 20'),
      ).toBeTruthy();

      click(4, 0);

      expect(isSelected(4, 0)).toBe(true);
      expect(initial).toEqual(snapshot);
    } finally {
      getAIMove.mockRestore();
    }
  });

  it('Menú lleva a la pantalla principal', function () {
    const initial = createMockState();
    initial.moveCount = initial.maxMoves + 1;
    initial.status = 'lost';

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: 'Has perdido',
    });

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Menú' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Menú Principal' }),
    ).toBeTruthy();

    expect(screen.queryByRole('dialog')).toBe(null);
  });

  it('Siguiente nivel inicia el siguiente id del catálogo', function () {
    const levelCount = levels.length;
    const currentLevel = levels[levelCount - 1];
    const nextLevel = structuredClone(currentLevel);

    nextLevel.id = 'next-test';
    nextLevel.name = 'Siguiente de prueba';

    // Solo existe durante la prueba; no se modifica levels.json.
    levels.push(nextLevel);

    try {
      const initial = createMockState();
      initial.levelId = currentLevel.id;
      initial.objective.target = { x: 4, y: 0 };
      initial.status = 'won';

      renderGame(initial);

      const dialog = screen.getByRole('dialog', {
        name: '¡Nivel superado!',
      });

      const next = within(dialog).getByRole('button', {
        name: 'Siguiente nivel',
      });

      expect(next.disabled).toBe(false);

      fireEvent.click(next);

      expect(screen.queryByRole('dialog')).toBe(null);

      expect(
        screen.getByRole('heading', {
          name: 'Siguiente de prueba',
        }),
      ).toBeTruthy();

      expect(
        screen.getByText('Movimientos restantes: 20'),
      ).toBeTruthy();
    } finally {
      levels.splice(levelCount);
    }
  });

  it('cancel cierra el resultado, mantiene el bloqueo y Reiniciar recupera el tablero', function () {
    const initial = createMockState();
    initial.objective.target = { x: 4, y: 0 };
    initial.status = 'won';

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: '¡Nivel superado!',
    });

    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog')).toBe(null);

    click(4, 0);

    expect(isSelected(4, 0)).toBe(false);

    fireEvent.click(
      screen.getByRole('button', { name: 'Reiniciar' }),
    );

    expect(screen.getByText('Movimientos restantes: 20')).toBeTruthy();

    click(4, 0);

    expect(isSelected(4, 0)).toBe(true);
  });

  it('Salir del HUD sigue disponible después de cerrar el resultado', function () {
    const initial = createMockState();
    initial.objective.target = { x: 4, y: 0 };
    initial.status = 'won';

    renderGame(initial);

    const dialog = screen.getByRole('dialog', {
      name: '¡Nivel superado!',
    });

    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    fireEvent.click(
      screen.getByRole('button', { name: 'Salir' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Selección de Nivel' }),
    ).toBeTruthy();
  });

  it('no pide jugadas a la IA al cargar una partida ya terminada', async function () {
    const getAIMove = vi.spyOn(engine, 'getAIMove');

    try {
      for (const status of ['won', 'lost']) {
        const initial = createMockState();
        initial.status = status;
        initial.turn = 'black';

        if (status === 'won') {
          initial.objective.target = { x: 4, y: 0 };
        } else {
          initial.moveCount = initial.maxMoves + 1;
        }

        const view = renderGame(initial);

        await waitForAITimer();

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(getAIMove).not.toHaveBeenCalled();

        view.unmount();
      }
    } finally {
      getAIMove.mockRestore();
    }
  });

  it('una jugada legal de la IA que da mate abre la derrota', async function () {
    const getAIMove = vi.spyOn(engine, 'getAIMove');

    getAIMove.mockResolvedValue({
      from: { x: 1, y: 2 },
      to: { x: 1, y: 1 },
    });

    try {
      const initial = createMockState();

      initial.board = createBoard(8, 8);
      initial.board[0][0] = {
        id: 'w-king',
        type: 'king',
        color: 'white',
      };
      initial.board[2][1] = {
        id: 'b-queen',
        type: 'queen',
        color: 'black',
      };
      initial.board[2][2] = {
        id: 'b-king',
        type: 'king',
        color: 'black',
      };
      initial.turn = 'black';

      renderGame(initial);

      await waitFor(function () {
        expect(
          screen.getByRole('dialog', { name: 'Has perdido' }),
        ).toBeTruthy();
      });

      expect(
        screen.getByText('Tu rey está en jaque mate.'),
      ).toBeTruthy();

      expect(getAIMove).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status').textContent).toBe('');
    } finally {
      getAIMove.mockRestore();
    }
  });

  it('una jugada legal de la IA que deja sin movimientos abre la derrota', async function () {
    const getAIMove = vi.spyOn(engine, 'getAIMove');

    getAIMove.mockResolvedValue({
      from: { x: 3, y: 1 },
      to: { x: 2, y: 1 },
    });

    try {
      const initial = createMockState();

      initial.board = createBoard(8, 8);
      initial.board[0][0] = {
        id: 'w-king',
        type: 'king',
        color: 'white',
      };
      initial.board[1][3] = {
        id: 'b-queen',
        type: 'queen',
        color: 'black',
      };
      initial.board[7][7] = {
        id: 'b-king',
        type: 'king',
        color: 'black',
      };
      initial.turn = 'black';

      renderGame(initial);

      await waitFor(function () {
        expect(
          screen.getByRole('dialog', { name: 'Has perdido' }),
        ).toBeTruthy();
      });

      expect(
        screen.getByText('No tienes movimientos legales.'),
      ).toBeTruthy();

      expect(getAIMove).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status').textContent).toBe('');
    } finally {
      getAIMove.mockRestore();
    }
  });
});