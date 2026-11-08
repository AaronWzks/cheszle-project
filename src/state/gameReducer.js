import { createGame, applyMove, getLegalMoves } from '../engine';

/** Nivel con el que arranca la app hasta que el jugador elige otro. */
export const DEFAULT_LEVEL_ID = 'easy-1';

/**
 * Crea el estado inicial del Provider. Nunca es null: así cualquier componente
 * puede leer `state.board` o `state.highlights` sin comprobar nada antes.
 * @param {import('../engine/mockState').GameState} [game] Partida ya creada (útil en tests).
 */
export function createInitialState(game = createGame(DEFAULT_LEVEL_ID)) {
  return { selected: null, highlights: [], ...game };
}

/**
 * Única función que puede cambiar el estado de la partida.
 * Acciones: { type: 'START', levelId } | { type: 'SELECT', square } | { type: 'MOVE', move }
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'START':
      return createInitialState(createGame(action.levelId));
    case 'SELECT':
      return {
        ...state,
        selected: action.square,
        highlights: getLegalMoves(state, action.square),
      };
    case 'MOVE':
      return { ...applyMove(state, action.move), selected: null, highlights: [] };
    default:
      return state;
  }
}
