import { jump } from './slide.js';

const OFFSETS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

/** Caballo: salta en «L»; las piezas intermedias no le afectan. */
export const getMoves = (board, from, piece) => jump(board, from, piece, OFFSETS);
