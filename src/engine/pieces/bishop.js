import { DIAGONAL, slide } from './slide.js';

/** Alfil: se desliza en diagonal. */
export const getMoves = (board, from, piece) => slide(board, from, piece, DIAGONAL);
