/**
 * TAREA 2.C3 · Elegir la jugada de la IA según la dificultad
 *
 * Junta en un solo sitio las dos formas de jugar de la IA:
 *   - al azar (randomMove, de la 2.C1), con la probabilidad randomChance;
 *   - pensando con minimax (findBestMove) el resto de las veces.
 *
 * La usan tanto el Web Worker (navegador) como getAIMove cuando no hay
 * Worker (tests), así la regla del 30 % no se escribe dos veces.
 */
import { findBestMove } from './minimax.js';
import { randomMove } from './randomAI.js';

/**
 * @param {import('../mockState.js').GameState} state
 * @param {number} depth Profundidad de minimax (ver DEPTH en config.js).
 * @param {number} [randomChance=0] Probabilidad de 0 a 1 de jugar al azar.
 * @param {() => number} [random=Math.random] Generador de números aleatorios.
 *   Solo se cambia en los tests, para que el resultado no dependa de la suerte.
 * @returns {import('../mockState.js').Move | null} null si no hay jugadas.
 */
export function chooseMove(state, depth, randomChance = 0, random = Math.random) {
  // random() da un número entre 0 y 1. Si sale menor que 0.3, eso pasa
  // aproximadamente 3 de cada 10 veces → jugada al azar.
  if (random() < randomChance) {
    return randomMove(state);
  }
  return findBestMove(state, depth);
}