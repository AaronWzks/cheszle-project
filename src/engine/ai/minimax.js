/**
 * Minimax con poda alfa-beta: así «piensa» la IA.
 *
 * Prueba sus jugadas, las respuestas del jugador, sus respuestas… hasta una
 * profundidad, y puntúa las posiciones finales con evaluate(). Las negras (IA)
 * buscan la puntuación más alta y las blancas (jugador), la más baja.
 *
 * @typedef {import('../mockState.js').GameState} GameState
 * @typedef {import('../mockState.js').Move} Move
 */
import { applyMove } from '../index.js';
import { getAllLegalMoves } from '../rules.js';
import { evaluate, outcome, WIN_SCORE } from './evaluate.js';

/**
 * evaluate() con un ajuste para las partidas terminadas: cuanta más
 * profundidad quede (es decir, cuanto antes se llegue), más extrema es la
 * puntuación. Así la IA prefiere el mate más rápido y retrasa el suyo.
 * @param {GameState} state
 * @param {number} depth Profundidad que quedaba por explorar.
 * @returns {number}
 */
function score(state, depth) {
  const value = evaluate(state);
  if (value === WIN_SCORE) return value + depth;
  if (value === -WIN_SCORE) return value - depth;
  return value;
}

/**
 * Puntuación de `state` mirando `depth` jugadas por delante.
 * Mueve quien tenga el turno: si son las negras maximiza y si son las blancas
 * minimiza.
 * @param {GameState} state
 * @param {number} depth Jugadas (de cualquier bando) que quedan por explorar.
 * @param {number} [alpha] Lo mínimo que las negras ya tienen asegurado.
 * @param {number} [beta] Lo máximo que las blancas ya tienen asegurado.
 * @returns {number}
 */
export function minimax(state, depth, alpha = -Infinity, beta = Infinity) {
  if (depth <= 0 || outcome(state) !== 'playing') return score(state, depth);

  const moves = getAllLegalMoves(state, state.turn);
  // Sin jugadas pero sin terminar (p. ej. negras ahogadas): se puntúa tal cual.
  if (moves.length === 0) return score(state, depth);

  if (state.turn === 'black') {
    let best = -Infinity;
    for (const move of moves) {
      best = Math.max(best, minimax(applyMove(state, move), depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break; // poda: las blancas nunca dejarían llegar aquí
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    best = Math.min(best, minimax(applyMove(state, move), depth - 1, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break; // poda: las negras nunca dejarían llegar aquí
  }
  return best;
}

/**
 * Mejor jugada para el bando que tiene el turno (normalmente las negras).
 * Si varias empatan, se queda con la primera que encuentra.
 * @param {GameState} state
 * @param {number} depth Profundidad de búsqueda (mínimo 1).
 * @returns {Move | null} null si no tiene ninguna jugada legal.
 */
export function findBestMove(state, depth) {
  const maximizing = state.turn === 'black';
  let alpha = -Infinity;
  let beta = Infinity;
  let bestMove = null;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const move of getAllLegalMoves(state, state.turn)) {
    const value = minimax(applyMove(state, move), Math.max(depth, 1) - 1, alpha, beta);
    if (maximizing ? value > bestScore : value < bestScore) {
      bestScore = value;
      bestMove = move;
    }
    if (maximizing) alpha = Math.max(alpha, bestScore);
    else beta = Math.min(beta, bestScore);
  }
  return bestMove;
}
