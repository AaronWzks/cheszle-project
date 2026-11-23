/**
 * Configuración de la IA.
 *
 * DEPTH = cuántas jugadas «mira por delante» la IA en cada dificultad.
 * Cuanto más profundo, mejor juega… y más tarda en pensar.
 *
 * (2.C2 solo necesita DEPTH. En la 2.C3 se completa este archivo con
 *  la jugada aleatoria del 30 % en «fácil».)
 */
export const DEPTH = { easy: 1, medium: 3, hard: 4 };