/**
 * TAREA 2.C1 · IA de prueba (mock aleatorio)
 *
 * Elige al azar una jugada legal de las negras. Solo sirve para poder construir
 * la integración de la IA (turnos, Web Worker, indicador...) mientras Adri
 * termina minimax (2.B2). Cuando minimax esté listo, getAIMove deja de usarla.
 */

import { getAllLegalMoves } from '../rules.js'; 

/**
 * Devuelve una jugada legal de las negras elegida al azar.
 * @param {import('../mockState.js').GameState} state
 * @returns {import('../mockState.js').Move | null} null si las negras no pueden mover.
 */
export function randomMove(state) {
  const moves = getAllLegalMoves(state, 'black');
  if (moves.length === 0) return null; // sin jugadas: el contrato de getAIMove pide null
  // Math.random() da un número entre 0 y 1 (sin llegar a 1); al multiplicar por
  // la cantidad de jugadas y redondear hacia abajo sale un índice válido.
  return moves[Math.floor(Math.random() * moves.length)];
}