import { createContext, useContext, useReducer } from 'react';
import { gameReducer, createInitialState } from './gameReducer';

const GameContext = createContext(null);

/**
 * Pone el estado de la partida a disposición de toda la app.
 * @param {{ children: import('react').ReactNode, initial?: object }} props
 * `initial` permite arrancar con una partida concreta (por ejemplo, en tests).
 */
export function GameProvider({ children, initial }) {
  const [state, dispatch] = useReducer(gameReducer, initial, createInitialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

/** @returns {{ state: object, dispatch: function }} */
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return context;
}
