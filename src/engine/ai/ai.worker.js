/**
 * TAREA 2.C2 · Web Worker de la IA  (actualizado en la 2.C3)
 *
 * Este archivo NO se ejecuta en el hilo de la pantalla, sino en un segundo
 * hilo (el Worker). Así, aunque minimax tarde en pensar, la interfaz sigue
 * respondiendo: animaciones, clics, etc.
 *
 * El Worker y la pantalla no comparten variables: solo se hablan con mensajes.
 *   pantalla ──postMessage({ state, depth, randomChance })──▶ worker
 *   pantalla ◀──postMessage(jugada)───────────────────────── worker
 *
 * 2.C3: además de la profundidad, recibe randomChance (probabilidad de jugar
 * al azar) y usa chooseMove, que decide entre azar y minimax.
 */
import { chooseMove } from './chooseMove.js';

// `self` es el propio Worker (aquí no existe `window`).
// onmessage se ejecuta cada vez que la pantalla nos envía algo.
self.onmessage = (e) => {
  const { state, depth, randomChance } = e.data; // lo que envió getAIMove
  const move = chooseMove(state, depth, randomChance); // aquí está el cálculo pesado
  self.postMessage(move); // devolvemos la jugada (o null si no hay)
};