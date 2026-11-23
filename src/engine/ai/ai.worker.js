/**
 * TAREA 2.C2 · Web Worker de la IA
 *
 * Este archivo NO se ejecuta en el hilo de la pantalla, sino en un segundo
 * hilo (el Worker). Así, aunque minimax tarde en pensar, la interfaz sigue
 * respondiendo: animaciones, clics, etc.
 *
 * El Worker y la pantalla no comparten variables: solo se hablan con mensajes.
 *   pantalla ──postMessage({ state, depth })──▶ worker
 *   pantalla ◀──postMessage(jugada)─────────── worker
 */
import { findBestMove } from './minimax.js';

// `self` es el propio Worker (aquí no existe `window`).
// onmessage se ejecuta cada vez que la pantalla nos envía algo.
self.onmessage = (e) => {
  const { state, depth } = e.data; // lo que envió getAIMove
  const move = findBestMove(state, depth); // aquí está el cálculo pesado
  self.postMessage(move); // devolvemos la jugada (o null si no hay)
};