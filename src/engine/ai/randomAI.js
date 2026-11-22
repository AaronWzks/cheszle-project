/**
 * TAREA 2.C1 · IA de prueba (mock aleatorio)
 *
 * Elige al azar una jugada legal de las negras. Solo sirve para poder construir
 * la integración de la IA (turnos, Web Worker, indicador...) mientras Adri
 * termina minimax (2.B2). Cuando minimax esté listo, getAIMove deja de usarla.
 */
import { getLegalMoves } from '../rules.js';

/**
 * TEMPORAL — Junta todas las jugadas legales de un color.
 *
 * El plan dice que Adri creará `getAllLegalMoves(state, color)` en rules.js
 * (tarea 2.B2, paso 3). Para no tocar su archivo ni crear conflictos, hasta
 * entonces usamos esta copia privada (no se exporta).
 *
 * Cuando Adri suba la suya:
 *   1. Borra esta función.
 *   2. Cambia el import de arriba por: import { getAllLegalMoves } from '../rules.js';
 *   3. En randomMove, cambia getAllLegalMovesTemporal por getAllLegalMoves.
 *
 * @param {import('../mockState.js').GameState} state
 * @param {'white' | 'black'} color
 * @returns {{ from: {x:number,y:number}, to: {x:number,y:number} }[]}
 */
function getAllLegalMovesTemporal(state, color) {
  const moves = [];
  // Recorremos el tablero fila a fila (y) y columna a columna (x).
  for (let y = 0; y < state.board.length; y += 1) {
    for (let x = 0; x < state.board[y].length; x += 1) {
      const piece = state.board[y][x];
      if (piece?.color !== color) continue; // casilla vacía o pieza del otro color
      // Cada destino legal de esta pieza se convierte en una jugada { from, to }.
      for (const to of getLegalMoves(state, { x, y })) {
        moves.push({ from: { x, y }, to });
      }
    }
  }
  return moves;
}

/**
 * Devuelve una jugada legal de las negras elegida al azar.
 * @param {import('../mockState.js').GameState} state
 * @returns {import('../mockState.js').Move | null} null si las negras no pueden mover.
 */
export function randomMove(state) {
  const moves = getAllLegalMovesTemporal(state, 'black');
  if (moves.length === 0) return null; // sin jugadas: el contrato de getAIMove pide null
  // Math.random() da un número entre 0 y 1 (sin llegar a 1); al multiplicar por
  // la cantidad de jugadas y redondear hacia abajo sale un índice válido.
  return moves[Math.floor(Math.random() * moves.length)];
}