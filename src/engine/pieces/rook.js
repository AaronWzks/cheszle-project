import { ORTHOGONAL, slide } from './slide.js';

/** Torre: se desliza en horizontal y vertical. */
export const getMoves = (board, from, piece) => slide(board, from, piece, ORTHOGONAL);
