import { DIAGONAL, ORTHOGONAL, slide } from './slide.js';

/** Dama: se desliza como la torre y el alfil juntos. */
export const getMoves = (board, from, piece) =>
  slide(board, from, piece, [...ORTHOGONAL, ...DIAGONAL]);
