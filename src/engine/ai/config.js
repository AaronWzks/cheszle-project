/**
 * TAREA 2.C3 · Configuración de la IA (dificultades)
 *
 * La dificultad se controla con dos números:
 *
 * DEPTH = cuántas jugadas «mira por delante» la IA en cada dificultad.
 *   Cuanto más profundo, mejor juega… y más tarda en pensar.
 *   - easy (1): solo mira su propia jugada. No ve la respuesta del jugador.
 *   - medium (3): su jugada, la respuesta del jugador y su contrarrespuesta.
 *   - hard (4): una jugada más que medio.
 *
 * RANDOM_MOVE_CHANCE = probabilidad (de 0 a 1) de que la IA ignore minimax y
 *   juegue una jugada legal al azar. En fácil es 0.3 → un 30 % de las veces.
 *   Así la IA fácil «se equivoca» de vez en cuando, como un principiante.
 */
export const DEPTH = { easy: 1, medium: 3, hard: 4 };

export const RANDOM_MOVE_CHANCE = { easy: 0.3, medium: 0, hard: 0 };