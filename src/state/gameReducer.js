import { createGame, applyMove, getLegalMoves, checkStatus } from '../engine';

/** Nivel con el que arranca la app hasta que el jugador elige otro. */
export const DEFAULT_LEVEL_ID = 'easy-1';

/**
 * Crea el estado inicial del Provider. Nunca es null: así cualquier componente
 * puede leer `state.board` o `state.highlights` sin comprobar nada antes.
 * @param {import('../engine/mockState').GameState} [game] Partida ya creada (útil en tests).
 */
export function createInitialState(game = createGame(DEFAULT_LEVEL_ID)) {
  const state = { selected: null, highlights: [], lastMove: null, ...game }; //lastMove es la ultima jugada. Al empezar partida, se inicializa
  // 2.C3: si la partida empieza con turno de las negras, la IA ya está pensando.
  return { ...state, aiThinking: isAITurn(state) };
}

/**
 * 2.C3 · ¿Le toca pensar a la IA? Solo si es turno de las negras y la partida sigue.
 * @param {{ turn: string, status: string }} state
 * @returns {boolean}
 */
function isAITurn(state) {
  return state.turn === 'black' && state.status === 'playing';
}

/**
 * Única función que puede cambiar el estado de la partida.
 * Acciones: { type: 'START', levelId } | { type: 'SELECT', square } | { type: 'DESELECT' }
 *   | { type: 'MOVE', move } | { type: 'SET_AI_THINKING', value }
 *
 * 2.C3 · aiThinking (true mientras se espera la respuesta de la IA):
 *   - MOVE lo pone a true si después de la jugada le toca a la IA, y a false
 *     cuando la jugada la hace la IA (entonces vuelve a tocar a las blancas).
 *   - SET_AI_THINKING lo cambia a mano. Se usa si la IA falla o no tiene jugada,
 *     para que el indicador desaparezca y el tablero no se quede bloqueado.
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
    case 'DESELECT':
      return { ...state, selected: null, highlights: [] };

    case 'MOVE': {
      const nextState = applyMove(state, action.move);
      const status = checkStatus(nextState);

      return {
        ...nextState, //copia todo lo que hay en nextState
        status,
        aiThinking: isAITurn({ turn: nextState.turn, status }), // 2.C3
        selected: null,
        highlights: [],
        lastMove: action.move, //para animar la pieza y resaltar origen y destino - action.move es la jugada que se acaba de hacer
      };
    }
    case 'SET_AI_THINKING':
      return { ...state, aiThinking: action.value };
    default:
      return state;
  }
}